// veriphone.io adapter: converts a live lookup into CarrierEvidence per
// docs/detection-contract.md. the api key comes from the environment
// (VERIPHONE_API_KEY) and is never logged, committed, or echoed. raw
// responses are recorded under data/recorded/ with their lookup inputs.
//
// honest mapping, so nothing is overclaimed:
//   status success + phone_valid true ->
//     line_type from veriphone's phone_type (MOBILE, LANDLINE, VOIP map
//     directly; FIXED_LINE_OR_MOBILE is ambiguous -> null; every other
//     type (toll free, premium rate, pager...) -> null, the detail keeps
//     the raw type verbatim), carrier_name, coverage full
//   phone_valid false -> no line type, no carrier: veriphone says the
//     number is not a valid phone number, which is a format-level claim,
//     not an in-service claim, so line_existence is left untouched
//   veriphone does not run an hlr: it never reports whether a line is
//     live, so active stays null and line_existence stays unknown.
//     absence of a report is never confirmation
import { writeFileSync } from "node:fs";

const base = "https://api.veriphone.io/v2/verify";

// veriphone returns lowercase types (recorded live 2026-10-09):
// mobile, fixed_line, voip, toll_free, unknown, ... only the three the
// schema can express are mapped; everything else keeps its raw type in
// the detail and maps to null, never a guess
const TYPE_MAP = {
  mobile: "mobile",
  fixed_line: "landline",
  voip: "non_fixed_voip",
};

export function veriphoneToCarrier(res, observedAt) {
  if (!res || res.status !== "success") {
    return {
      carrier: null,
      adapter_error: `veriphone returned status "${res?.status}" (${res?.message ?? "no message"}); no evidence is fabricated`,
    };
  }
  const valid = res.phone_valid === true;
  const rawType = res.phone_type ?? "UNKNOWN";
  const line_type = valid ? (TYPE_MAP[String(rawType).toLowerCase()] ?? null) : null;
  return {
    carrier: {
      source: `veriphone.io v2 verify (live lookup ${observedAt})`,
      observed_at: observedAt,
      coverage: "full",
      line_type,
      // veriphone uses the literal string "unknown" when it has no
      // carrier name; that is an absence, never a carrier called unknown
      carrier_name: valid
        ? res.carrier && res.carrier.toLowerCase() !== "unknown"
          ? res.carrier
          : null
        : null,
      active: null, // veriphone reports no in-service check
      detail: valid
        ? `veriphone reports phone_type ${rawType}${res.carrier ? `, carrier ${res.carrier}` : ""}, phone_valid true; no in-service (hlr) check was performed, so line existence is untouched`
        : `veriphone reports phone_valid false (phone_type ${rawType}): a format-level claim, never an in-service claim`,
    },
    adapter_error: null,
  };
}

// cli usage: node scripts/veriphone-gather.mjs '+16502530000'
if (process.argv[1] && process.argv[1].endsWith("veriphone-gather.mjs")) {
  const phone = process.argv[2];
  if (!phone) {
    console.error("usage: node scripts/veriphone-gather.mjs '+16502530000'");
    process.exit(2);
  }
  const params = new URLSearchParams({
    phone,
    key: process.env.VERIPHONE_API_KEY,
  });
  const res = await fetch(`${base}?${params}`);
  if (!res.ok) {
    console.error(`veriphone http ${res.status}: credentials or subscription problem; no lookup performed`);
    process.exit(1);
  }
  const json = await res.json();
  const observedAt = new Date().toISOString();
  const slug = phone.replace(/[^0-9]+/g, "").slice(0, 15);
  writeFileSync(`data/recorded/veriphone-${slug}.json`, JSON.stringify({ input: { phone }, observed_at: observedAt, response: json }, null, 2));
  const { carrier, adapter_error } = veriphoneToCarrier(json, observedAt);
  console.log(JSON.stringify({ mapped_carrier: carrier, adapter_error, summary: { phone_valid: json.phone_valid, phone_type: json.phone_type, carrier: json.carrier } }, null, 2));
}
