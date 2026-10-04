// the public surface: a pure core plus an evidence gatherer.

export { analyze } from "./core.js";
export type { Evidence, AnalyzeOptions } from "./core.js";
export { gatherEvidence } from "./evidence.js";
export { makeDohResolver } from "./doh.js";
export { findingToSignal } from "./adapters.js";
export type { IntelligenceAdapter, AdapterFinding } from "./adapters.js";
export { SCHEMA_VERSION } from "./schema.js";
export type {
  DetectionResult,
  Signal,
  SignalName,
  SignalScope,
  EvidenceStrength,
  ResultState,
} from "./schema.js";
