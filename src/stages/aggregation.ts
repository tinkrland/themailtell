// stage 5: evidence aggregation.
// collects signals, reports contradictions, derives a state. it never makes
// a signup decision and never says reject or accept.

import type { Signal, ResultState } from "../schema.js";

export interface AggregateOutcome {
  state: ResultState;
  // the effective signal list, including any stale downgrades
  signals: Signal[];
  limitations: string[];
}

const MS_PER_DAY = 86_400_000;

export function aggregate(
  signals: Signal[],
  stageLimitations: string[],
  opts: { now?: string; maxAgeDays?: number } = {}
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
  const hasForwarding = recognized.some((s) => s.name === "forwarding_infrastructure");
  const hasMailbox = recognized.some((s) => s.name === "mailbox_capable_infrastructure");
  const hasDomainVerdict = recognized.some(
    (s) => s.name === "disposable_service" || s.name === "masking_relay_service"
  );

  // recognized list evidence contradicting recognized routing evidence
  if (hasDomainVerdict && hasMailbox) {
    limitations.push(
      "contradiction: a domain-level list hit disagrees with recognized " +
        "mailbox-capable routing; both are reported, neither wins"
    );
    return { state: "contradictory", signals: fresh, limitations };
  }
  // recognized forwarding and mailbox infrastructure observed together
  if (hasForwarding && hasMailbox) {
    limitations.push(
      "mixed routing: recognized forwarding and mailbox-capable " +
        "infrastructure both observed; the arrangement of an individual " +
        "address cannot be established from routing alone"
    );
    return { state: "mixed_routing", signals: fresh, limitations };
  }
  // nothing established: either no signals, or every one unresolved
  if (fresh.length === 0 || fresh.every((s) => s.strength === "unresolved")) {
    return { state: "unknown", signals: fresh, limitations };
  }
  return { state: "signals_present", signals: fresh, limitations };
}
