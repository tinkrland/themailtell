// carrier / line-type stage: adapter-driven evidence. the core never
// calls a carrier; it consumes CarrierEvidence gathered outside (see
// evidence.ts and the adapter contract in adapters.ts).
//
// fixed voip and non-fixed voip are distinct signals, never one voip blob:
// fixed voip is a real landline replacement (cable voice, fiber voice),
// while non-fixed voip (google voice, textnow, twilio numbers) is a
// virtual number usable from anywhere. twilio's line type intelligence
// returns exactly these distinctions, and its documentation names google
// voice and enflick as examples of non-fixed voip.
//
// an unevaluated check is coverage "none" and never a clean verdict: an
// unconfigured adapter, a failed lookup or an unsupported market leaves
// the finding unknown, not "no evidence found".

import type { CarrierEvidence, ParseEvidence } from "../tables.js";
import type { Signal } from "../schema.js";

export interface CarrierStageOutput {
  signals: Signal[];
  line_type: CarrierEvidence["line_type"];
  virtual_number: boolean;
  ported: boolean | null;
  limitation: string | null;
}

export function carrierStage(
  parse: ParseEvidence,
  carriers: CarrierEvidence[],
  observed_at: string,
): CarrierStageOutput {
  const signals: Signal[] = [];
  let line_type: CarrierEvidence["line_type"] = null;
  let virtual_number = false;
  let ported: boolean | null = null;
  let limitation: string | null = null;

  const usable = carriers.filter((c) => c.coverage !== "none");
  if (carriers.length > 0 && usable.length === 0) {
    limitation =
      "carrier adapters ran but none could evaluate this number; " +
      "line-type findings stay unknown, which is a statement about the " +
      "search, never a verdict about the number";
  }

  for (const c of usable) {
    const strength =
      c.coverage === "full" ? "recognized" : "suggestive";
    const non_fixed = c.line_type === "non_fixed_voip";
    if (non_fixed) virtual_number = true;
    if (typeof c.ported === "boolean") ported = c.ported;
    if (c.line_type) line_type = c.line_type;
    signals.push({
      name: "carrier_line_type",
      scope: "adapter",
      market: parse.market,
      source: c.source,
      observed_at: c.observed_at ?? observed_at,
      strength,
      coverage: c.coverage,
      line_type: c.line_type ?? undefined,
      detail:
        c.detail ??
        (c.line_type
          ? `adapter reports line type ${c.line_type}`
          : "adapter evaluated the number but reported no line type") +
        (typeof c.ported === "boolean" ? "; ported status reported" : ""),
    });
    if (c.not_in_service) {
      limitation = "an adapter reports this number is not in service";
    }
  }

  return { signals, line_type, virtual_number, ported, limitation };
}
