// stage 6: evidence aggregation.
// collects signals, downgrades stale intelligence, reports contradictions,
// derives the state and the per-shape findings. it never makes an
// acceptance decision: an address with no box-shaped evidence is reported
// as no such evidence found, never as a verified street address.

import type {
  Signal,
  ResultState,
  ShapeFindings,
  ShapeFinding,
  FormatFinding,
} from "../schema.js";

export interface AggregateOutcome {
  state: ResultState;
  signals: Signal[];
  shape_findings: ShapeFindings;
  limitations: string[];
}

export interface AggregateOptions {
  now?: string;
  maxAgeDays?: number;
  // whether local tables exist for each shape class for this market; an
  // uncovered class can honestly report unknown, never no_evidence_found
  coverage: {
    po_box_covered: boolean;
    carrier_covered: boolean;
    provider_covered: boolean;
    forwarding_covered: boolean;
  };
  formatFinding: FormatFinding;
}

const MS_PER_DAY = 86_400_000;

// a shape class is derivable from a signal name
const SHAPE_OF: Partial<Record<Signal["name"], keyof Omit<ShapeFindings, "format_validity">>> = {
  po_box_equivalent: "po_box_equivalent",
  parcel_locker_or_pickup_point: "parcel_locker_or_pickup_point",
  cmra_or_virtual_mailbox: "cmra_or_virtual_mailbox",
  mail_forwarding_or_reshipping: "mail_forwarding_or_reshipping",
};

export function aggregate(
  signals: Signal[],
  stageLimitations: string[],
  opts: AggregateOptions
): AggregateOutcome {
  const limitations = [...stageLimitations];
  const now = opts.now ? Date.parse(opts.now) : Date.now();
  const maxAgeDays = opts.maxAgeDays ?? 90;

  // stale intelligence is downgraded, not trusted and not dropped silently
  const fresh: Signal[] = [];
  for (const s of signals) {
    const ageDays = (now - Date.parse(s.observed_at)) / MS_PER_DAY;
    if (Number.isFinite(ageDays) && ageDays > maxAgeDays) {
      fresh.push({
        ...s,
        strength: "unresolved",
        detail: `${s.detail} [stale intelligence: observed ${Math.round(ageDays)} days ago]`,
      });
      limitations.push(
        `signal "${s.name}" is stale intelligence: older than ` +
          `${maxAgeDays} days, downgraded to unresolved`
      );
    } else {
      fresh.push(s);
    }
  }

  const recognized = fresh.filter((s) => s.strength === "recognized");

  // contradiction: a matched po box shape (recognized, or a matched but
  // unverified seed row, which is still a matched pattern) and a recognized
  // confirmed street delivery point disagree. both are reported; neither
  // wins. stale (unresolved) patterns no longer count.
  const claimable = fresh.filter(
    (s) => s.strength === "recognized" || s.strength === "suggestive"
  );
  const hasPoBox = claimable.some((s) => s.name === "po_box_equivalent");
  const hasStreetConfirmed = recognized.some(
    (s) => s.name === "street_delivery_point_confirmed"
  );
  if (hasPoBox && hasStreetConfirmed) {
    limitations.push(
      "contradiction: recognized po box evidence and a carrier-confirmed " +
        "street delivery point disagree; both are reported, neither wins"
    );
    return {
      state: "contradictory",
      signals: fresh,
      shape_findings: derive(fresh, opts, limitations),
      limitations,
    };
  }

  // mixed evidence: recognized or suggestive signals from two different
  // shape classes that do not come from one linked table row (a flexdelivery
  // row reports itself under two names with one source; that is one
  // finding, not a mix). stale (unresolved) signals no longer count.
  const shapeSources = new Map<string, Set<string>>();
  for (const s of claimable) {
    const shape = SHAPE_OF[s.name];
    if (!shape) continue;
    if (!shapeSources.has(shape)) shapeSources.set(shape, new Set());
    shapeSources.get(shape)!.add(s.source);
  }
  if (shapeSources.size >= 2) {
    // check whether all shape signals share one single source row
    const allSources = new Set<string>();
    for (const set of shapeSources.values()) for (const src of set) allSources.add(src);
    if (allSources.size > 1) {
      limitations.push(
        "mixed evidence: recognized signals from different shape classes " +
          "with different sources were observed together"
      );
      return {
        state: "mixed_evidence",
        signals: fresh,
        shape_findings: derive(fresh, opts, limitations),
        limitations,
      };
    }
  }

  const shape_findings = derive(fresh, opts, limitations);

  // nothing established: no signals at all, or every one unresolved
  if (fresh.length === 0 || fresh.every((s) => s.strength === "unresolved")) {
    return { state: "unknown", signals: fresh, shape_findings, limitations };
  }
  return { state: "signals_present", signals: fresh, shape_findings, limitations };
}

function derive(
  signals: Signal[],
  opts: AggregateOptions,
  limitations: string[]
): ShapeFindings {
  const findingFor = (
    shape: keyof Omit<ShapeFindings, "format_validity">,
    covered: boolean
  ): ShapeFinding => {
    const own = signals.filter((s) => SHAPE_OF[s.name] === shape);
    if (own.some((s) => s.strength === "recognized" || s.strength === "suggestive")) {
      return "evidence_found";
    }
    if (own.length > 0) {
      // only unresolved (stale) signals: the evidence aged out
      return "unknown";
    }
    if (!covered) {
      return "unknown";
    }
    return "no_evidence_found";
  };

  const shape_findings: ShapeFindings = {
    po_box_equivalent: findingFor("po_box_equivalent", opts.coverage.po_box_covered),
    parcel_locker_or_pickup_point: findingFor(
      "parcel_locker_or_pickup_point",
      opts.coverage.carrier_covered
    ),
    cmra_or_virtual_mailbox: findingFor("cmra_or_virtual_mailbox", opts.coverage.provider_covered),
    mail_forwarding_or_reshipping: findingFor(
      "mail_forwarding_or_reshipping",
      opts.coverage.forwarding_covered
    ),
    format_validity: opts.formatFinding,
    address_existence: "unknown",
  };

  // address existence: strictly adapter territory. a validation service
  // that confirmed or disconfirmed the address (including its secondary
  // unit) sets the finding; the recognized strength carries its own
  // coverage and observed_at, so staleness already downgraded it to
  // unresolved above. suggestive (partial coverage) existence evidence
  // still sets the finding but never silently: the limitation below
  // records the partial coverage. no adapter, or only stale/unresolved
  // adapter signals: unknown, honestly unchecked, never "no such thing"
  // from a component that never looked
  const existenceSignals = signals.filter(
    (s) => s.name === "delivery_point_validation"
  );
  if (existenceSignals.some((s) => s.strength === "recognized" && s.existence === "disconfirmed")) {
    shape_findings.address_existence = "disconfirmed";
  } else if (existenceSignals.some((s) => s.strength === "recognized" && s.existence === "confirmed_exists")) {
    shape_findings.address_existence = "confirmed_exists";
  } else if (existenceSignals.some((s) => s.strength === "suggestive" && s.existence)) {
    shape_findings.address_existence = existenceSignals.find(
      (s) => s.strength === "suggestive" && s.existence
    )!.existence!;
    limitations.push(
      "existence evidence came from a validation source with partial " +
      "coverage; the finding stands but is weaker than a full-coverage check"
    );
  }
  if (existenceSignals.length === 0) {
    limitations.push(
      "no delivery point validation adapter ran, so address existence " +
      "is unknown: the component checked shapes and formats, never " +
      "whether the address exists as a deliverable point"
    );
  }

  // the honesty backbone: a clean-looking result is a statement about the
  // search, never a street-address verdict. local pattern detection cannot
  // catch every box-shaped address (pbsa writes boxes street-style; cmra
  // pmb disclosure is required but compliance varies), and without a
  // carrier validation adapter no external check ran at all.
  // every shape class either searched and found nothing, or was never
  // covered by a seeded table (unknown, honestly uncovered): then the
  // backbone statement about the search, never about the address, fires
  const shapeClasses: Array<[ShapeFinding, boolean]> = [
    [shape_findings.po_box_equivalent, opts.coverage.po_box_covered],
    [shape_findings.parcel_locker_or_pickup_point, opts.coverage.carrier_covered],
    [shape_findings.cmra_or_virtual_mailbox, opts.coverage.provider_covered],
    [shape_findings.mail_forwarding_or_reshipping, opts.coverage.forwarding_covered],
  ];
  const noneFound = shapeClasses.every(
    ([f, covered]) => f === "no_evidence_found" || (f === "unknown" && !covered)
  );
  const externalCheck = signals.some((s) => s.coverage !== "none");
  if (!externalCheck) {
    limitations.push(
      "no carrier validation adapter ran, so every local check has " +
        "coverage none; an evaluated external check would carry full or " +
        "partial coverage on its signals"
    );
  }
  if (noneFound) {
    limitations.push(
      "no box-shaped evidence was found in local analysis; that is a " +
        "statement about the search, not a verification of a street " +
        "address. po box street addressing writes boxes street-style, us " +
        "cmra pmb disclosure is required but compliance varies, and " +
        "forwarders and mailbox providers issue ordinary street addresses, " +
        "so local patterns alone cannot catch every box-shaped address" +
        (externalCheck
          ? "; an external check did run (see signal coverage)"
          : "; see the coverage none note above")
    );
  }

  return shape_findings;
}
