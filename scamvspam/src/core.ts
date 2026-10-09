// the pure staged core: no io, no guessing, no intent assertions. it
// takes an artifact and its evidence, places it on the two axes, and
// the quadrant follows mechanically. anything unknown on either axis
// refuses to place
import {
  SCHEMA_VERSION,
  type Artifact,
  type IntentPlacement,
  type Limitation,
  type OperationPlacement,
  type Pole,
  type PoleFinding,
  type Quadrant,
  type Signal,
} from "./schema.js";

export interface Options {
  now?: string;
  max_age_days?: number;
}

export interface Result {
  schema_version: string;
  artifact: Artifact;
  spam: PoleFinding;
  scam: PoleFinding;
  automated: PoleFinding;
  human: PoleFinding;
  intent: IntentPlacement;
  operation: OperationPlacement;
  quadrant: Quadrant;
  limitations: Limitation[];
  // the fresh, in-channel signals the result is based on
  signals: Signal[];
}

const DAY_MS = 86_400_000;

function ageDays(observedAt: string, now: string): number {
  const a = Date.parse(observedAt);
  const b = Date.parse(now);
  if (Number.isNaN(a) || Number.isNaN(b)) return Number.POSITIVE_INFINITY;
  return (b - a) / DAY_MS;
}

// a two-pole axis places only when both poles are known
function place(negative: PoleFinding, positive: PoleFinding):
  "a" | "b" | "both" | "neither" | "unknown" {
  if (negative === "unknown" || positive === "unknown") return "unknown";
  const n = negative === "evidence_found";
  const p = positive === "evidence_found";
  if (n && p) return "both";
  if (p) return "b";
  if (n) return "a";
  return "neither";
}

export function analyze(
  artifact: Artifact,
  signals: Signal[],
  options: Options = {},
): Result {
  const now = options.now ?? "2026-10-09T00:00:00.000Z";
  const maxAge = options.max_age_days ?? 90;
  const limitations: Limitation[] = [];

  // channel filter: evidence about other channels is never smuggled in
  let mismatched = 0;
  const inChannel: Signal[] = [];
  for (const s of signals) {
    if (s.channel !== artifact.channel) {
      mismatched++;
      continue;
    }
    inChannel.push(s);
  }
  if (mismatched > 0) {
    limitations.push({
      code: "channel_mismatch",
      text:
        `${mismatched} signal(s) belong to another channel and were ` +
        "ignored; cross-channel conclusions are not drawn",
    });
  }

  // staleness: old evidence decays rather than being trusted
  let stale = 0;
  const fresh: Signal[] = [];
  for (const s of inChannel) {
    if (ageDays(s.observed_at, now) > maxAge) {
      stale++;
      continue;
    }
    fresh.push(s);
  }
  if (stale > 0) {
    limitations.push({
      code: "stale_intelligence",
      text:
        `${stale} signal(s) older than ${maxAge} days were downgraded ` +
        "to silence, not trusted",
    });
  }

  // infrastructure signals are recorded but never move a pole
  if (fresh.some((s) => s.pole === undefined)) {
    limitations.push({
      code: "infrastructure_is_not_intent",
      text:
        "shape/infrastructure signals describe what something IS (a " +
        "relay, a mailbox, a voip range), never what anyone is doing " +
        "with it; they never move the poles",
    });
  }

  const poleFinding = (pole: Pole): PoleFinding => {
    let positive = false;
    let searchedNothing = false;
    for (const s of fresh) {
      if (s.pole !== pole) continue;
      if (s.coverage === "none") continue; // no visibility, no claim
      if (s.nothing_found === true) {
        searchedNothing = true;
        continue;
      }
      positive = true;
    }
    if (positive) return "evidence_found";
    if (searchedNothing) return "no_evidence_found";
    return "unknown";
  };

  if (inChannel.length === 0) {
    limitations.push({
      code: "no_evidence_provided",
      text:
        "no evidence was provided for this artifact, so both axes stay " +
        "unknown: an honest absence, never a clean bill of health",
    });
  }

  const spam = poleFinding("spam");
  const scam = poleFinding("scam");
  const automated = poleFinding("automated");
  const human = poleFinding("human");

  // intent axis: spam is the left pole, scam the right
  const intentMap = place(spam, scam);
  const intent: IntentPlacement =
    intentMap === "a" ? "spam"
    : intentMap === "b" ? "scam"
    : intentMap === "both" ? "spam_and_scam"
    : intentMap === "neither" ? "neither"
    : "unknown";

  // operation axis: automated is the bottom pole, human the top
  const operationMap = place(automated, human);
  const operation: OperationPlacement =
    operationMap === "a" ? "automated"
    : operationMap === "b" ? "human"
    : operationMap === "both" ? "hybrid"
    : operationMap === "neither" ? "neither"
    : "unknown";

  if (intent === "unknown" || operation === "unknown") {
    return {
      schema_version: SCHEMA_VERSION,
      artifact,
      spam, scam, automated, human,
      intent, operation,
      quadrant: "unplaced",
      limitations,
      signals: fresh,
    };
  }

  // centers are honest placements, not hedges
  const intentCenter = intent === "spam_and_scam" || intent === "neither";
  const operationCenter = operation === "hybrid" || operation === "neither";
  if (intentCenter || operationCenter) {
    limitations.push({
      code: "mixed_placement",
      text:
        "the evidence places this artifact between poles, not in a " +
        "corner: mixed is a statement about this evidence, not a hedge",
    });
  }
  if (intentCenter || operationCenter) {
    limitations.push({
      code: "neither_is_about_this_search",
      text:
        "any neither or hybrid placement is a statement about this " +
        "search under this coverage, never a safety guarantee",
    });
  }

  const quadrant: Quadrant =
    intent === "scam" && operation === "human" ? "scam_human"
    : intent === "scam" && operation === "automated" ? "scam_automated"
    : intent === "spam" && operation === "human" ? "spam_human"
    : intent === "spam" && operation === "automated" ? "spam_automated"
    : "mixed";

  return {
    schema_version: SCHEMA_VERSION,
    artifact,
    spam, scam, automated, human,
    intent, operation,
    quadrant,
    limitations,
    signals: fresh,
  };
}
