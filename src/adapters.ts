// adapter contract: external intelligence is optional and provider-
// independent. adapters declare their capabilities and their data
// exposure; every finding they produce carries coverage semantics, and
// an unevaluated check is coverage "none", never a clean verdict.
//
// none of these are implemented in this repository. the reference core
// consumes evidence gathered through this contract; wiring a concrete
// provider is the consumer's choice.
//
// candidate adapters:
// - twilio lookup line type intelligence (verified docs, 2026-10-08):
//   returns line types including mobile, landline, fixed voip, non-fixed
//   voip, toll free; its documentation names google voice and enflick
//   (textnow's parent) as examples of non-fixed voip numbers.
//   https://www.twilio.com/docs/lookup/v2-api/line-type-intelligence
// - numverify / numlookup free tiers: research aids, not production
//   adapters; verify their current capabilities before depending on them.
// - offline libphonenumber metadata: already injected as the parser; it
//   is not a carrier adapter and never reports carrier line types.

import type { CarrierEvidence } from "./tables.js";

export interface CarrierAdapter {
  name: string;
  capabilities: {
    line_type: boolean;
    carrier_name: boolean;
    ported: boolean;
  };
  /**
   * data exposure declared honestly. this component needs only the
   * number and its line-type properties; adapters that require a
   * recipient name or usage history should not be wired in.
   */
  data_exposure: "number_only" | "number_plus_context";
  /** e.164 in, carrier evidence out. coverage "none" on failure. */
  lookup(e164: string): Promise<CarrierEvidence>;
}
