// public api surface. the core is pure and always takes evidence plus
// options with an explicit now; nothing here reads a live clock.

export {
  SCHEMA_VERSION,
  type Signal,
  type SignalScope,
  type EvidenceStrength,
  type Coverage,
  type LineType,
  type Finding,
  type ShapeFindings,
  type AggregateState,
  type Limitation,
  type DeclaredComparison,
  type ClassificationResult,
} from "./schema.js";
export type {
  NumberingPlanRow,
  ProviderRow,
  CommunityListRow,
  MarketTables,
  ParseEvidence,
  CarrierEvidence,
} from "./tables.js";
export { MARKETS } from "./markets/index.js";
export { PROVIDERS, COMMUNITY_LISTS } from "./providers.js";
export { analyze, type AggregationOptions, type Evidence } from "./stages/aggregation.js";
export { gatherEvidence } from "./evidence.js";
export { parseInput } from "./input/parser.js";
export type { CarrierAdapter } from "./adapters.js";
