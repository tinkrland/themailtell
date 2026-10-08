// stage 4: provider intelligence for cmra and virtual-mailbox providers.
// matches the cross-market provider table against the normalized address
// lines. providers with empty patterns (street-style suite addresses) are
// reported as a limitation, never as a signal: the table is honest about
// what local detection cannot see.

import { TABLE_VERSION, TABLE_AS_OF } from "../tables.js";
import type { MailboxProviderEntry } from "../tables.js";
import type { Signal } from "../schema.js";
import { matchTexts, type InputHandle } from "./input-handling.js";

export interface ProviderOutcome {
  signals: Signal[];
  limitations: string[];
}

export function providerIntelligence(
  input: InputHandle,
  providers: MailboxProviderEntry[]
): ProviderOutcome {
  const signals: Signal[] = [];
  const limitations: string[] = [];

  const relevant = providers.filter((p) => p.markets.includes(input.market!));

  for (const entry of relevant) {
    if (entry.patterns.length === 0) {
      // documented provider, no local token: a limitation, not a signal
      if (entry.note) {
        limitations.push(`market ${input.market}: ${entry.note} (${entry.provider})`);
      }
      continue;
    }
    const texts = matchTexts(input);
    const matched = entry.patterns.some((p) =>
      texts.some((line) => new RegExp(p).test(line))
    );
    if (!matched) continue;

    const verified = entry.verified_on !== null;
    signals.push({
      // a forwarder row reports its own shape class, never the cmra class
      name: entry.kind === "mail_forwarder" ? "mail_forwarding_or_reshipping" : "cmra_or_virtual_mailbox",
      scope: "address",
      source: `builtin-table/${TABLE_VERSION} row:${entry.provider} (citation: ${entry.citation})`,
      observed_at: entry.verified_on ?? TABLE_AS_OF,
      strength: verified ? "recognized" : "suggestive",
      coverage: "none",
      detail: verified
        ? `address lines match the verified ${entry.provider} ${entry.kind.replace("_", " ")} pattern`
        : `address lines match the ${entry.provider} ${entry.kind.replace("_", " ")} pattern, an unverified seed row`,
    });
    if (!verified) {
      limitations.push(
        `the ${entry.provider} row is an unverified seed; verify it against ` +
          `its citation (${entry.citation})`
      );
    }
  }

  return { signals, limitations };
}
