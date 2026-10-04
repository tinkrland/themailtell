// doh.ts — mx resolution over dns-over-https.
// useful where udp/53 is unavailable (sandboxes, serverless, browsers).
// returns the same shape as node:dns resolveMx so it can be injected into
// gatherEvidence as the resolver.

import type { MxRecord } from "./stages/routing-intelligence.js";

export interface DohOptions {
  endpoint?: string; // any rfc 8484 json endpoint; cloudflare by default
  fetchImpl?: typeof fetch;
}

export function makeDohResolver(options: DohOptions = {}) {
  const endpoint = options.endpoint ?? "https://cloudflare-dns.com/dns-query";
  const doFetch = options.fetchImpl ?? fetch;

  return async function resolveMxDoh(domain: string): Promise<MxRecord[]> {
    const url = `${endpoint}?name=${encodeURIComponent(domain)}&type=MX`;
    const res = await doFetch(url, {
      headers: { accept: "application/dns-json" },
    });
    if (!res.ok) {
      throw new Error(`doh lookup failed (http ${res.status})`);
    }
    const body = (await res.json()) as {
      Status?: number;
      Answer?: Array<{ name: string; type: number; data: string }>;
    };
    if (typeof body.Status === "number" && body.Status !== 0) {
      throw new Error(`doh lookup failed (status ${body.Status})`);
    }
    const records: MxRecord[] = [];
    for (const a of body.Answer ?? []) {
      // mx rdata looks like "10 fwd1.porkbun.com."
      const m = /^(\d+)\s+(\S+?)\.?$/.exec(a.data);
      if (a.type === 15 && m) {
        records.push({ exchange: m[2], priority: Number(m[1]) });
      }
    }
    // enotfound-equivalent: domain exists in dns but has no mx
    return records;
  };
}
