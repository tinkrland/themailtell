// the public surface: a pure core plus an evidence gatherer.

export { analyze } from "./core.js";
export type { Evidence, AnalyzeOptions } from "./core.js";
export { gatherEvidence } from "./evidence.js";
export { findingToSignal } from "./adapters.js";
export type { IntelligenceAdapter, AdapterFinding } from "./adapters.js";
export type { PostalAddress } from "./stages/input-handling.js";
export { SCHEMA_VERSION } from "./schema.js";
export type {
  DetectionResult,
  Signal,
  SignalName,
  SignalScope,
  EvidenceStrength,
  Coverage,
  ResultState,
  ShapeFindings,
  ShapeFinding,
  FormatFinding,
} from "./schema.js";
export { TABLE_VERSION, TABLE_AS_OF } from "./tables.js";
