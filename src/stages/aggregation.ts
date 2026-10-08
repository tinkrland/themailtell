// aggregation: shape findings, state, declared comparison, limitations.
//
// unknown is first-class. "no evidence found" is always a statement about
// the search, never a verification of the number. contradictions are
// reported, never silently resolved: a ported number that the numbering
// plan still maps to its old range is exactly this shape.

import type {
  ClassificationResult,
  ExistenceFinding,
  Finding,
  Limitation,
  Signal,
} from "../schema.js";
import type { CarrierEvidence, ParseEvidence } from "../tables.js";
import { numberingPlanStage } from "./numbering-plan.js";
import { carrierStage } from "./carrier-intelligence.js";
import { providerStage } from "./provider-intelligence.js";
import type { CommunityListRow } from "../tables.js";
import { SCHEMA_VERSION } from "../schema.js";

export interface AggregationOptions {
  /** iso instant used for staleness math; never read from a live clock */
  now: string;
  /** how old a verified row may be before it downgrades to unresolved */
  max_age_days: number;
  /** optional caller-declared voip flag; compared, never trusted */
  declared_voip?: boolean | null;
  community_lists?: CommunityListRow[];
}

export interface Evidence {
  parse: ParseEvidence;
  carriers: CarrierEvidence[];
}

function strongestForType(signals: Signal[], type: string): Signal | null {
  const order: Record<string, number> = { recognized: 2, suggestive: 1, unresolved: 0 };
  let best: Signal | null = null;
  for (const s of signals) {
    if (s.line_type !== type) continue;
    if (!best || order[s.strength] > order[best.strength]) best = s;
  }
  return best;
}

export function analyze(evidence: Evidence, options: AggregationOptions): ClassificationResult {
  const { parse, carriers } = evidence;
  const now = options.now;
  const community_lists = options.community_lists ?? [];

  const limitations: Limitation[] = [];
  const pushLimit = (detail: string | null, code: string) => {
    if (detail) limitations.push({ code, detail });
  };

  const np = numberingPlanStage(parse, now, options.max_age_days);
  const ca = carrierStage(parse, carriers, now);

  // line existence: only a positively reporting carrier adapter can say
  // anything, and its evidence ages like everything else. the freshest
  // in-date report wins; a stale existence report is skipped with a
  // limitation rather than silently trusted. absence of a report is
  // never confirmation of anything
  let existenceFinding: ExistenceFinding = "unknown";
  {
    let reported: ExistenceFinding = "unknown";
    const inDate = carriers
      .filter((c) => c.active === true || c.not_in_service === true)
      .sort((a, b) => Date.parse(b.observed_at ?? "") - Date.parse(a.observed_at ?? ""));
    for (const c of inDate) {
      const ageDays =
        (Date.parse(now) - Date.parse(c.observed_at ?? now)) / 86_400_000;
      if (Number.isFinite(ageDays) && ageDays > options.max_age_days) {
        limitations.push({
          code: "existence_evidence_stale",
          detail:
            `an adapter reported on this line's existence ` +
            `${Math.round(ageDays)} days ago, beyond the ` +
            `${options.max_age_days}-day horizon; the stale report is ` +
            "not trusted and line existence stays unknown",
        });
        continue;
      }
      reported = c.not_in_service === true ? "disconfirmed" : "confirmed_active";
      break;
    }
    existenceFinding = reported;
    if (reported === "unknown" && carriers.length > 0 && inDate.length === 0) {
      limitations.push({
        code: "existence_not_checked",
        detail:
          "the adapter evidence reported no in-service check, so line " +
          "existence stays unknown: range classification says what the " +
          "range is for, never whether this number is a live line",
      });
    }
  }
  const pr = providerStage(parse, community_lists, now, options.max_age_days);

  pushLimit(np.limitation, "numbering_plan");
  pushLimit(ca.limitation, "carrier_coverage");
  pushLimit(pr.limitation, "provider_visibility");

  const signals: Signal[] = [...np.signals, ...ca.signals, ...pr.signals];

  // ---- shape findings ----
  const findings = {
    mobile: "unknown" as Finding,
    landline: "unknown" as Finding,
    fixed_voip: "unknown" as Finding,
    non_fixed_voip: "unknown" as Finding,
    virtual_number: "unknown" as Finding,
    format_validity: "unknown" as Finding,
    line_existence: (parse.valid ? existenceFinding : "unknown") as ExistenceFinding,
  };
  if (!parse.valid && existenceFinding !== "unknown") {
    pushLimit(
      "the number itself does not parse as an assigned number for its " +
      "market, so an adapter in-service claim about it contradicts the " +
      "numbering plan; existence is reported as unknown, not asserted",
      "existence_contradicted_by_parse",
    );
  }

  if (!parse.valid) {
    // an unparseable input invalidates format validity; every line-type
    // finding stays unknown rather than being guessed from fragments
    findings.format_validity = "evidence_found"; // format problem found
    return {
      schema_version: SCHEMA_VERSION,
      input: parse.input,
      evaluated_number: null,
      market: null,
      parse: { valid: false, reason: parse.reason },
      signals: [],
      shape_findings: findings,
      state: "unknown",
      declared_comparison: compareDeclared(options.declared_voip, findings.virtual_number, parse.valid),
      limitations,
    };
  }
  findings.format_validity = "no_evidence_found"; // no format problem found
  if (parse.extension) {
    // the parser strips the extension from the e.164 form; the behavior
    // stays, but the exclusion is reported instead of happening silently
    pushLimit(
      `the input carried a phone extension (${parse.extension}); the ` +
      "extension is not part of the number's line type and was excluded " +
      "from evaluation",
      "extension_excluded",
    );
  }

  // numbering-plan findings
  const np_signal = np.signals[0] ?? null;
  const plan_says = np.line_type;
  if (np.withdrawn) {
    pushLimit(
      "the matched numbering-plan range has been withdrawn by its regulator; " +
      "its old designation is reported but not asserted",
      "withdrawn_range",
    );
  }
  if (plan_says === "mobile" && np_signal) {
    findings.mobile = np.withdrawn ? "unknown" : evidenceFor(np_signal.strength);
  } else if (plan_says === "landline" && np_signal) {
    findings.landline = np.withdrawn ? "unknown" : evidenceFor(np_signal.strength);
  } else if (np_signal && np_signal.line_type === undefined && plan_says === null && !np.virtual_range) {
    // ngn / tollfree rows: neither mobile, landline nor voip claims
  }

  // virtual-number findings
  const virtual_evidence: Signal[] = [];
  if (np.virtual_range && np_signal && np_signal.strength !== "unresolved") {
    virtual_evidence.push(np_signal);
    findings.virtual_number = evidenceFor(np_signal.strength);
  }
  if (ca.virtual_number) {
    const s = strongestForType(signals, "non_fixed_voip");
    if (s) virtual_evidence.push(s);
    findings.virtual_number = "evidence_found";
  }
  // unresolved provider evidence (a stale provider row or a stale
  // community-list snapshot) stays visible in signals[] with its stale
  // detail, but never asserts: the finding stays unknown, the same rule
  // the withdrawn-range handling applies. never silently trusted, never
  // silently dropped.
  const provider_virtual = signals.filter(
    (x) => x.name === "known_virtual_provider" || x.name === "community_list",
  );
  if (pr.virtual_number) {
    const asserting = provider_virtual.filter((x) => x.strength !== "unresolved");
    if (asserting.length > 0) {
      virtual_evidence.push(...asserting);
      findings.virtual_number = "evidence_found";
    } else if (provider_virtual.length > 0) {
      pushLimit(
        "stale virtual-number evidence (a community-list snapshot or provider " +
        "row past its verification window) is reported at unresolved strength " +
        "and does not assert; virtual_number stays unknown rather than being " +
        "claimed from stale evidence",
        "stale_virtual_evidence",
      );
    }
  }

  // carrier line-type findings. fixed voip and non-fixed voip are distinct.
  if (ca.line_type === "mobile") findings.mobile = "evidence_found";
  if (ca.line_type === "landline") findings.landline = "evidence_found";
  if (ca.line_type === "fixed_voip") findings.fixed_voip = "evidence_found";
  if (ca.line_type === "non_fixed_voip") findings.non_fixed_voip = "evidence_found";
  if (ca.line_type === "fixed_voip" || ca.line_type === "non_fixed_voip") {
    // a voip line type says nothing about mobile/landline assignment in
    // the national sense; leave those as numbering-plan evidence left them
  }
  if (carriers.length > 0 && carriers.every((c) => c.coverage === "none") && parse.valid) {
    // adapters ran but evaluated nothing: unknown, never no_evidence_found
    findings.mobile = findings.mobile === "unknown" ? "unknown" : findings.mobile;
  }

  // adapter-evaluated clean checks: when an adapter with full coverage
  // evaluated the number and reported a line type, the other types it
  // covers are honestly "no evidence found" (it looked and did not see
  // them), except the types this component treats as separate signals
  // the adapter may not have covered.
  for (const c of carriers) {
    if (c.coverage === "full" && c.line_type) {
      for (const t of ["mobile", "landline", "fixed_voip", "non_fixed_voip"] as const) {
        if (c.line_type !== t && findings[t] === "unknown") findings[t] = "no_evidence_found";
      }
      if (!ca.virtual_number && findings.virtual_number === "unknown") {
        findings.virtual_number = "no_evidence_found";
      }
    }
  }

  // ---- aggregate state ----
  let state: ClassificationResult["state"] = "unknown";
  const strong = signals.filter((s) => s.strength === "recognized");
  const weak = signals.filter((s) => s.strength === "suggestive");
  const stale = signals.filter((s) => s.strength === "unresolved");

  const planLT = np.line_type;
  const carrierLT = ca.line_type;
  const contradiction =
    planLT && carrierLT && planLT !== carrierLT && !(
      (planLT === "landline" && carrierLT === "fixed_voip") ||
      (planLT === "mobile" && carrierLT === "non_fixed_voip") ||
      (planLT === "landline" && carrierLT === "non_fixed_voip") ||
      (planLT === "mobile" && carrierLT === "fixed_voip")
    ) ? true : false;

  if (contradiction) {
    state = "contradictory";
    pushLimit(
      "the numbering plan and a carrier adapter disagree about this " +
      "number's line type; likely a ported number whose range assignment " +
      "still reflects the old carrier. both signals are reported and " +
      "neither wins",
      "contradictory_line_type",
    );
  } else if (strong.length > 0) {
    state = "signals_present";
  } else if (weak.length > 0) {
    state = "mixed_evidence";
  } else if (stale.length > 0) {
    state = "unknown";
  }

  if (state === "unknown" && parse.valid) {
    pushLimit(
      "no line-type or virtual-number evidence was found for this number. " +
      "that is a statement about the available evidence, never a " +
      "verification of the number's line type or its holder",
      "no_evidence_found",
    );
  }

  return {
    schema_version: SCHEMA_VERSION,
    input: parse.input,
    evaluated_number: parse.e164,
    market: parse.market,
    parse: { valid: true },
    signals,
    shape_findings: findings,
    state,
    declared_comparison: compareDeclared(options.declared_voip, findings.virtual_number, parse.valid),
    limitations,
  };
}

function evidenceFor(strength: Signal["strength"]): Finding {
  return strength === "unresolved" ? "unknown" : "evidence_found";
}

function compareDeclared(
  declared: boolean | null | undefined,
  virtual_finding: Finding,
  valid: boolean,
): ClassificationResult["declared_comparison"] {
  if (declared === undefined || declared === null) return null;
  if (!valid || virtual_finding === "unknown") {
    return {
      comparison: "unknown",
      detail:
        "the component cannot compare the declared voip flag against unknown " +
        "evidence; unknown never becomes a silent agreement",
    };
  }
  const looks_virtual = virtual_finding === "evidence_found";
  if (looks_virtual === declared) {
    return {
      comparison: "agree",
      detail:
        "the declared voip flag agrees with the virtual-number evidence. " +
        "this is a comparison of claims, never a verification of the " +
        "declaration or of the holder",
    };
  }
  return {
    comparison: "disagree",
    detail:
      "the declared voip flag disagrees with the virtual-number evidence. " +
      "both the declaration and the evidence can be stale or wrong; the " +
      "consumer decides what a disagreement means, and verification " +
      "(otp, callback) is the consumer's job, not this component's",
  };
}
