// smarty us street address adapter: converts a live lookup into a
// delivery_point_validation signal per docs/detection-contract.md.
// credentials come from the environment (SMARTY_AUTH_ID, SMARTY_AUTH_TOKEN)
// and are never logged, committed, or echoed. each response is recorded to
// data/recorded/ with the lookup inputs so it can become fixture evidence.
//
// mapping, stated honestly:
//   dpv_match_code Y -> existence confirmed_exists
//   dpv_match_code D -> the primary is dpv-confirmed but the given secondary
//     was NOT: the given address exists only if the unit does, so the
//     secondary claim stays unknown, never confirmed, never disconfirmed
//   dpv_match_code N (or no candidates) -> disconfirmed at this source's
//     coverage and date, with the raw dpv footnotes preserved verbatim
//   anything else (errors, partial) -> no signal, an adapter error instead
import { writeFileSync } from "node:fs";

const base = "https://us-street.api.smartystreets.com/street-address";

export function smartyToSignal(res, observedAt) {
  const candidates = Array.isArray(res) ? res : [];
  if (candidates.length === 0) {
    return {
      signal: {
        name: "delivery_point_validation",
        scope: "address",
        source: `smarty us street address api (live lookup ${observedAt})`,
        observed_at: observedAt,
        strength: "recognized",
        coverage: "full",
        existence: "disconfirmed",
        detail: `smarty returned no candidates for the address as given (dpv could not confirm it); raw response: ${JSON.stringify(res)}`,
      },
      adapter_error: null,
    };
  }
  const c = candidates[0];
  const analysis = c.analysis ?? {};
  const match = analysis.dpv_match_code;
  const footnotes = analysis.dpv_footnotes ?? "";
  const raw = `dpv_match_code ${match ?? "?"}${footnotes ? `, dpv footnotes ${footnotes}` : ""}, raw response preserved in data/recorded/`;
  if (match === "Y") {
    return {
      signal: {
        name: "delivery_point_validation",
        scope: "address",
        source: `smarty us street address api (live lookup ${observedAt})`,
        observed_at: observedAt,
        strength: "recognized",
        coverage: "full",
        existence: "confirmed_exists",
        detail: `smarty dpv confirmed the address as given (${raw})`,
      },
      adapter_error: null,
    };
  }
  if (match === "D") {
    return {
      signal: {
        name: "delivery_point_validation",
        scope: "address",
        source: `smarty us street address api (live lookup ${observedAt})`,
        observed_at: observedAt,
        strength: "recognized",
        coverage: "full",
        // existence deliberately absent: the primary was confirmed, the
        // secondary was dropped by dpv, so the given unit's existence is
        // unknown. the core keeps address_existence unknown for it
        detail: `smarty dpv confirmed the primary only; the secondary was missing or not confirmed, so the delivery point for the address as given is unknown, not confirmed and not disconfirmed (${raw})`,
      },
      adapter_error: null,
    };
  }
  if (match === "S") {
    // recorded behavior (data/recorded/, lookup 2026-10-08): an invalid
    // secondary on a dpv-confirmed primary returns match code S with
    // footnote C1, "secondary invalid". that is the apartment-f shape
    return {
      signal: {
        name: "delivery_point_validation",
        scope: "address",
        source: `smarty us street address api (live lookup ${observedAt})`,
        observed_at: observedAt,
        strength: "recognized",
        coverage: "full",
        existence: "disconfirmed",
        detail: `smarty dpv confirmed the primary but reports the given secondary is invalid (footnote C1): the address as given does not exist (${raw})`,
      },
      adapter_error: null,
    };
  }
  if (match === "N") {
    return {
      signal: {
        name: "delivery_point_validation",
        scope: "address",
        source: `smarty us street address api (live lookup ${observedAt})`,
        observed_at: observedAt,
        strength: "recognized",
        coverage: "full",
        existence: "disconfirmed",
        detail: `smarty dpv did not confirm the address as given (${raw})`,
      },
      adapter_error: null,
    };
  }
  return {
    signal: null,
    adapter_error: `smarty returned an unmapped dpv_match_code "${match}" (${raw}); no existence claim is made`,
  };
}

// cli usage: node scripts/smarty-gather.mjs '<street>' '<city>' '<state>' '<zip>'
if (process.argv[1] && process.argv[1].endsWith("smarty-gather.mjs")) {
  const [street, city, state, zip] = process.argv.slice(2);
  if (!street) {
    console.error("usage: node scripts/smarty-gather.mjs '<street>' '<city>' '<state>' '<zip>'");
    process.exit(2);
  }
  const params = new URLSearchParams({
    "auth-id": process.env.SMARTY_AUTH_ID,
    "auth-token": process.env.SMARTY_AUTH_TOKEN,
    street, city: city ?? "", state: state ?? "", zipcode: zip ?? "",
    candidates: "3", max_candidates: "3",
  });
  const res = await fetch(`${base}?${params}`);
  if (!res.ok) {
    console.error(`smarty http ${res.status}: credentials or subscription problem; no lookup performed`);
    process.exit(1);
  }
  const json = await res.json();
  const observedAt = new Date().toISOString();
  const slug = street.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);
  writeFileSync(`data/recorded/smarty-${slug}.json`, JSON.stringify({ input: { street, city, state, zip }, observed_at: observedAt, response: json }, null, 2));
  const { signal, adapter_error } = smartyToSignal(json, observedAt);
  console.log(JSON.stringify({ mapped_signal: signal, adapter_error, candidates: Array.isArray(json) ? json.map((c) => ({ delivery_line_1: c.delivery_line_1, dpv_match_code: c.analysis?.dpv_match_code, dpv_footnotes: c.analysis?.dpv_footnotes, dpv_vacant: c.analysis?.dpv_vacant, rdi: c.analysis?.rdi })) : json }, null, 2));
}
