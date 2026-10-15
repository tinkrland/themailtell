// thecomposer: a pure, staged composition engine over the radar
// snapshots. stage 1 normalizes, stage 2 binds evidence, stage 3
// composes the reading. no network, no clock reads beyond the
// caller's observed_at, no verdicts.
import {
  ENGINE_VERSION,
  NON_VERDICT,
  type EvidenceReading,
  type FieldReading,
  type FieldType,
  type AgeReading,
  type OnboardingInput,
  type OnboardingObservation,
  type SurfaceReading,
  type TetherDepth,
} from "./schema.js";
import { SNAPSHOTS, type RadarRow, type RadarSnapshot } from "./snapshots.js";

// ---------- helpers

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function str(row: RadarRow, key: string): string | undefined {
  const v = row[key];
  return typeof v === "string" ? v : undefined;
}

// how many days from a verified_on date to the observation. verified
// dates are date strings; observation is an ISO instant
function daysBetween(verified: string, observedAt: string): number | null {
  const a = Date.parse(verified.length <= 10 ? verified + "T00:00:00Z" : verified);
  const b = Date.parse(observedAt);
  if (!isFinite(a) || !isFinite(b)) return null;
  return Math.round((b - a) / 86_400_000);
}

function evidenceFor(
  row: RadarRow,
  observedAt: string,
  verifiedKey = "verified_on",
): EvidenceReading {
  const cadenceRaw = row.recheck_cadence_days;
  const cadence = typeof cadenceRaw === "number" && cadenceRaw > 0 ? cadenceRaw : 90;
  const verified = str(row, verifiedKey) ?? null;
  if (!verified) {
    return { age_days: null, cadence_days: cadence, verified_on: null, confidence: 0 };
  }
  const age = daysBetween(verified, observedAt);
  if (age === null) {
    return { age_days: null, cadence_days: cadence, verified_on: verified, confidence: 0 };
  }
  const confidence = age <= cadence ? 1 : Math.max(0, 1 - (age - cadence) / cadence);
  return { age_days: age, cadence_days: cadence, verified_on: verified, confidence: Math.round(confidence * 100) / 100 };
}

// unified tether mapping across the radars' posture vocabularies
function tetherFromPosture(posture: string | undefined): TetherDepth {
  switch (posture) {
    case "no_kyc_by_design":
    case "no_kyc_observed":
      return "none";
    case "registration_only":
      return "registration_only";
    case "limited_kyc_ladder":
    case "identity_light":
      return "partial";
    case "full_kyc":
    case "kyc_required":
      return "full_kyc";
    default:
      return "unknown";
  }
}

// a prefix map is not a bin database, and the engine says so
function binToNetwork(digits: string): string {
  if (digits.length < 2) return "unknown";
  const two = digits.slice(0, 2);
  const four = Number(digits.slice(0, 4));
  if (digits[0] === "4") return "visa";
  if (two === "34" || two === "37") return "amex";
  if (["51", "52", "53", "54", "55"].includes(two)) return "mastercard";
  if (four >= 2221 && four <= 2720) return "mastercard";
  if (two === "60" || two === "81" || two === "82" || two === "50") return "rupay";
  if (digits.slice(0, 4) === "6011" || two === "65") return "discover";
  if (digits[0] === "6") return "discover";
  return "unknown";
}

// phone tiers that mint numbers on demand
function rotationFromVoipTier(tier: string | undefined): string {
  switch (tier) {
    case "consumer_app":
    case "retail_front":
    case "public_sms_receiver":
      return "on_demand";
    default:
      return "unknown";
  }
}

// ---------- stage 1: normalize (pure)

interface Normalized {
  domain?: string;
  tld?: string;
  bin?: string;
  card_network?: string;
  digits?: string;
  unknowns: string[];
}

function normalize(obs: OnboardingObservation): Normalized {
  const unknowns: string[] = [];
  switch (obs.field) {
    case "email": {
      const at = obs.value.lastIndexOf("@");
      if (at === -1) return { unknowns: ["email has no @; unparseable as an address"] };
      const domain = obs.value.slice(at + 1).toLowerCase().trim();
      const dot = domain.lastIndexOf(".");
      const tld = dot === -1 ? undefined : "." + domain.slice(dot + 1);
      return { domain, tld, unknowns };
    }
    case "domain": {
      const domain = obs.value.toLowerCase().trim().replace(/^\w+:\/\//, "").replace(/\/.*$/, "");
      const dot = domain.lastIndexOf(".");
      if (dot === -1) return { unknowns: ["value has no tld; unparseable as a domain"] };
      return { domain, tld: "." + domain.slice(dot + 1), unknowns };
    }
    case "payment": {
      const digits = obs.value.replace(/\D/g, "");
      if (digits.length < 6) return { digits, unknowns: ["fewer than 6 digits: no bin to read"] };
      return { bin: digits.slice(0, 6), card_network: binToNetwork(digits), digits, unknowns: ["bin prefix heuristics are not a bin database: the network is a guess until a full bin lookup"] };
    }
    case "phone": {
      const digits = obs.value.replace(/[^\d]/g, "");
      return { digits, unknowns: ["carrier identification needs an adapter with coverage semantics (hlr or veriphone); none is attached, so line type is unknown"] };
    }
  }
}

// ---------- stage 2: bind evidence

function bindEmail(domain: string | undefined, hint: string | undefined): { row: RadarRow | null; unknowns: string[] } {
  const unknowns: string[] = [];
  const table = SNAPSHOTS.theproviderradar.rows;
  const target = domain ? norm(domain) : hint ? norm(hint) : "";
  if (!target) return { row: null, unknowns: ["no domain and no hint: nothing to bind"] };
  const matches = table.filter((r) => {
    const p = str(r, "provider");
    return p && p.length >= 4 && target.includes(norm(p));
  });
  if (matches.length === 0) return { row: null, unknowns: ["no provider row matched: the domain is unknown to the registry, which is not evidence of anything"] };
  if (matches.length > 1) unknowns.push("multiple provider rows matched: " + matches.map((r) => str(r, "provider")).join(", ") + "; first bound, rest recorded");
  return { row: matches[0], unknowns };
}

function bindVoip(hint: string | undefined): { row: RadarRow | null; unknowns: string[] } {
  const unknowns: string[] = [];
  if (!hint) return { row: null, unknowns: ["no instrument hint: carrier-level voip detection needs an adapter, and absence of a hint is not evidence of a landline"] };
  const target = norm(hint);
  const matches = SNAPSHOTS.thevoipradar.rows.filter((r) => {
    const p = str(r, "provider");
    return p && target.includes(norm(p));
  });
  if (matches.length === 0) return { row: null, unknowns: ["hint matched no voip row: unknown to the registry"] };
  if (matches.length > 1) unknowns.push("multiple voip rows matched: " + matches.map((r) => str(r, "provider")).join(", ") + "; first bound");
  return { row: matches[0], unknowns };
}

function bindInstrument(
  network: string | undefined,
  hint: string | undefined,
): { row: RadarRow | null; candidates: string[]; unknowns: string[] } {
  const unknowns: string[] = [];
  const table = SNAPSHOTS.theccradar.rows;
  if (hint) {
    const target = norm(hint);
    const matches = table.filter((r) => {
      const p = norm(str(r, "provider") ?? "") || norm(str(r, "instrument") ?? "");
      return p.length >= 4 && (target.includes(p) || p.includes(target));
    });
    if (matches.length === 1) return { row: matches[0], candidates: [], unknowns };
    if (matches.length > 1) return { row: matches[0], candidates: matches.map((r) => str(r, "provider") ?? ""), unknowns: ["multiple instrument rows matched the hint; first bound, rest recorded"] };
  }
  if (network && network !== "unknown") {
    const candidates = table.filter((r) => str(r, "card_network") === network);
    if (candidates.length === 1) return { row: candidates[0], candidates: [], unknowns };
    if (candidates.length > 1) {
      return { row: null, candidates: candidates.map((r) => str(r, "provider") ?? ""), unknowns: ["bin network maps to " + candidates.length + " instrument rows: ambiguous without a full bin lookup"] };
    }
  }
  return { row: null, candidates: [], unknowns: ["no instrument bound: the payment surface is unknown, which is not evidence of a bank card"] };
}

function bindTld(tld: string | undefined, hint: string | undefined): { row: RadarRow | null; registrar: RadarRow | null; unknowns: string[] } {
  const unknowns: string[] = [];
  const rows = SNAPSHOTS.thetldradar.rows;
  let row: RadarRow | null = null;
  if (tld) {
    const target = tld.startsWith(".") ? tld : "." + tld;
    row = rows.find((r) => (str(r, "tld") ?? "").toLowerCase() === target.toLowerCase()) ?? null;
  }
  let registrar: RadarRow | null = null;
  if (hint) {
    const target = norm(hint);
    const rmatches = (SNAPSHOTS.thetldradar.registrars ?? []).filter((r) => {
      const p = str(r, "registrar");
      return p && target.includes(norm(p));
    });
    if (rmatches.length > 0) registrar = rmatches[0];
    if (rmatches.length > 1) unknowns.push("multiple registrar rows matched; first bound");
  }
  if (!row && !registrar) unknowns.push("no tld or registrar row matched: unknown to the registry, which is not evidence of a reputable tld either");
  return { row, registrar, unknowns };
}

// ---------- counters (documented facts from the radar readmes)

const EMAIL_COUNTERS: Record<string, string> = {
  disposable_provider: "run a disposable-domain blocklist at signup: the disposability is a domain fact, and public inboxes still have lawful readers",
  public_inbox: "run a disposable-domain blocklist at signup: the disposability is a domain fact, and public inboxes still have lawful readers",
};

const PHONE_COUNTERS: Record<string, string> = {
  public_sms_receiver: "shared public numbers are short-lived and visible to everyone: sms capability checks and blocklists of receiver ranges catch them",
  consumer_app: "major platforms reject voip numbers for verification; sms capability checks identify voice-only numbers (the a2p wall is the documented shape)",
  retail_front: "major platforms reject voip numbers for verification; the no-kyc tier is enumerable but each holder may be lawful",
};

const PAYMENT_COUNTERS: Record<string, string> = {
  open_loop_prepaid_card: "prepaid bin ranges are published: merchants block prepaid and virtual-card bins (fraudlabs pro documents how), and issuers like azure reject unsupported bins",
  crypto_funded_prepaid_card: "bin blocking reaches these where they sit on published prepaid ranges; otherwise velocity rules at checkout, honestly the harder class to counter without friction",
  topup_voucher: "vouchers are cash-shaped and the hardest rail to counter without friction: velocity rules at checkout are the honest answer",
  bank_linked_virtual_card: "the tether exists at the issuer, so the levers are velocity and chargeback policy, not instrument blocking",
  prepaid_card_platform: "the tether exists, so the levers are velocity and chargeback policy, not instrument blocking",
  regulated_prepaid_wallet: "the tether is a full identity: issuer cooperation and chargeback policy are the levers",
  web3_direct_payment: "on-chain payment is not a card rail: counter at product policy level, not bin level",
};

const DOMAIN_COUNTER =
  "tld reputation lists are the documented counter (interisle tracks phishing by tld), and registration barriers are the cost of re-minting";

// ---------- stage 3: compose

function readField(obs: OnboardingObservation, observedAt: string): FieldReading {
  const n = normalize(obs);
  const unknowns = [...n.unknowns];
  let row: RadarRow | null = null;
  let kind = "unknown";
  let tether: TetherDepth = "unknown";
  let rotation = "unknown";
  let evidence: EvidenceReading = { age_days: null, cadence_days: 90, verified_on: null, confidence: 0 };
  let candidates: string[] = [];
  let age: AgeReading = { source: null, created_on: null, age_days: null, coverage: "unknown" };
  let issuanceScope: string | undefined = undefined;
  let radar = "";
  let name = "";
  let commit = "";

  switch (obs.field) {
    case "email": {
      const b = bindEmail(n.domain, obs.instrument_hint);
      row = b.row;
      unknowns.push(...b.unknowns);
      if (row) {
        radar = "theproviderradar";
        name = str(row, "provider") ?? "";
        kind = str(row, "kind") ?? "unknown";
        tether = kind === "disposable_provider" || kind === "public_inbox" ? "none" : "registration_only";
        rotation = tether === "none" ? "on_demand" : "unknown";
        evidence = evidenceFor(row, observedAt);
        // era bounds are carried verbatim, never parsed: "cannot
        // predate the 2022 domain launch" is advisory text, not a date
        const sig = str(row, "account_age_signal");
        age = { source: null, created_on: null, age_days: null, coverage: "unknown", age_signal_notes: sig ? [sig] : [] };
        commit = SNAPSHOTS.theproviderradar.commit;
      }
      break;
    }
    case "phone": {
      const b = bindVoip(obs.instrument_hint);
      row = b.row;
      unknowns.push(...b.unknowns);
      if (row) {
        radar = "thevoipradar";
        name = str(row, "provider") ?? "";
        kind = str(row, "tier") ?? "unknown";
        tether = tetherFromPosture(str(row, "kyc_posture"));
        rotation = rotationFromVoipTier(str(row, "tier"));
        const smsCap = str(row, "us_sms_capability");
        if (smsCap === "voice_only" || smsCap === "receive_only") unknowns.push("us_sms_capability is " + smsCap + ": recorded from the radar axis");
        evidence = evidenceFor(row, observedAt);
        commit = SNAPSHOTS.thevoipradar.commit;
      }
      break;
    }
    case "payment": {
      const b = bindInstrument(n.card_network, obs.instrument_hint);
      row = b.row;
      candidates = b.candidates;
      unknowns.push(...b.unknowns);
      if (row) {
        radar = "theccradar";
        name = str(row, "provider") ?? str(row, "instrument") ?? "";
        kind = str(row, "kind") ?? "unknown";
        tether = tetherFromPosture(str(row, "kyc_posture"));
        rotation = str(row, "number_rotation") ?? "unknown";
        issuanceScope = str(row, "issuance_scope");
        evidence = evidenceFor(row, observedAt);
        commit = SNAPSHOTS.theccradar.commit;
      }
      break;
    }
    case "domain": {
      const b = bindTld(n.tld, obs.instrument_hint);
      const tldRow = b.row;
      const regRow = b.registrar;
      unknowns.push(...b.unknowns);
      if (tldRow) {
        row = tldRow;
        radar = "thetldradar";
        name = str(tldRow, "tld") ?? "";
        kind = "barrier: " + (str(tldRow, "registration_barrier") ?? "unknown") + " / abuse_band: " + (str(tldRow, "abuse_band") ?? "unknown");
        tether = "none";
        rotation = str(tldRow, "registration_barrier")?.toLowerCase().includes("premierity") ? "low_cost" : "low_cost";
        evidence = evidenceFor(tldRow, observedAt, "barrier_verified_on");
        commit = SNAPSHOTS.thetldradar.commit;
      } else if (regRow) {
        // registrar-only binding: the tld row is absent but the
        // registrar evidence still binds, and the reading must carry it
        row = regRow;
        radar = "thetldradar";
        name = "registrar: " + (str(regRow, "registrar") ?? "");
        kind = str(regRow, "kind") ?? "unknown";
        tether = "registration_only";
        rotation = "on_demand";
        evidence = evidenceFor(regRow, observedAt);
        commit = SNAPSHOTS.thetldradar.commit;
      }
      break;
    }
  }

  if (obs.age_finding) {
    age = {
      source: obs.age_finding.source,
      created_on: obs.age_finding.created_on,
      age_days: obs.age_finding.created_on
        ? daysBetween(obs.age_finding.created_on, observedAt)
        : null,
      coverage: obs.age_finding.coverage,
      coverage_note: obs.age_finding.coverage_note,
    };
  }
  const instrument = row && radar ? { radar, name, kind, row_snapshot_commit: commit } : null;
  return { field: obs.field, value: obs.value, normalized: n, instrument, tether, rotation, evidence, candidates, age, issuance_scope: issuanceScope, unknowns };
}

export function readOnboarding(input: OnboardingInput): SurfaceReading {
  const fields = input.observations.map((o) => readField(o, input.observed_at));
  const substitutableFields = fields
    .filter((f) => f.instrument && (["none", "registration_only", "partial"].includes(f.tether) || f.rotation === "on_demand"))
    .map((f) => f.field);

  const counters = fields.flatMap((f) => {
    if (!f.instrument) return [];
    let counter: string | null = null;
    if (f.field === "email") counter = EMAIL_COUNTERS[f.instrument.kind] ?? null;
    if (f.field === "phone") counter = PHONE_COUNTERS[f.instrument.kind] ?? null;
    if (f.field === "payment") counter = PAYMENT_COUNTERS[f.instrument.kind] ?? null;
    if (f.field === "domain" && f.instrument.kind.startsWith("barrier:")) counter = DOMAIN_COUNTER;
    return counter ? [{ field: f.field, instrument_kind: f.instrument.kind, counter }] : [];
  });

  const unknowns = fields.flatMap((f) => f.unknowns);
  return {
    engine_version: ENGINE_VERSION,
    observed_at: input.observed_at,
    fields,
    substitutable_fields: substitutableFields,
    counters,
    unknowns,
    non_verdict: NON_VERDICT,
  };
}
