// the pure staged core: no io, no guessing, no intent assertions. it
// takes an artifact and its evidence and says, per axis, what the
// evidence supports; the quadrant follows mechanically and refuses to
// place anything with an unknown on either axis
import {
  SCHEMA_VERSION,
  type Artifact,
  type Axis,
  type AxisFinding,
  type Limitation,
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
  spam: AxisFinding;
  scam: AxisFinding;
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

function quadrantFor(spam: AxisFinding, scam: AxisFinding): Quadrant {
  if (spam === "unknown" || scam === "unknown") return "unplaced";
  const s = spam === "evidence_found";
  const c = scam === "evidence_found";
  if (c && s) return "scam_and_spam";
  if (c) return "scam_not_spam";
  if (s) return "spam_not_scam";
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

  // infrastructure signals are recorded but never move an axis
  const hasInfrastructure = fresh.some((s) => s.axis === undefined);
  if (hasInfrastructure) {
    limitations.push({
      code: "infrastructure_is_not_intent",
      text:
        "shape/infrastructure signals describe what something IS (a " +
        "relay, a mailbox, a voip range), never what anyone is doing " +
        "with it; they never move the axes",
    });
  }

  const axisFinding = (axis: Axis): { finding: AxisFinding } => {
    let positive = false;
    let searchedNothing = false;
    for (const s of fresh) {
      if (s.axis !== axis) continue;
      if (s.coverage === "none") continue; // no visibility, no claim
      if (s.nothing_found === true) {
        searchedNothing = true;
        continue;
      }
      positive = true;
    }
    if (positive) return { finding: "evidence_found" };
    if (searchedNothing) return { finding: "no_evidence_found" };
    return { finding: "unknown" };
  };

  if (inChannel.length === 0) {
    limitations.push({
      code: "no_evidence_provided",
      text:
        "no evidence was provided for this artifact, so both axes stay " +
        "unknown: an honest absence, never a clean bill of health",
    });
  }

  const spam = axisFinding("spam").finding;
  const scam = axisFinding("scam").finding;
  const quadrant = quadrantFor(spam, scam);
  if (quadrant === "neither") {
    limitations.push({
      code: "neither_is_about_this_search",
      text:
        "neither is a statement about this search under this coverage, " +
        "never a safety guarantee about the artifact or its sender",
    });
  }

  return {
    schema_version: SCHEMA_VERSION,
    artifact,
    spam,
    scam,
    quadrant,
    limitations,
    signals: fresh,
  };
}
