import { getAll, productPath, type Showing } from "./client";
import type { DecisionResource, DocResource, EvidenceResource, ExposureResource, ReadinessResource, RiskSummaryResource } from "./shared";

/* How a capability stands on one expected outcome of its level. */
export type OutcomeStandingResource = {
  outcome: string;
  standing: string;
  gaps: string[];
  tradeoffs: string[];
  decisions: DecisionResource[];
  by: string[];
};
export type CapabilityResource = DocResource & {
  personas: string[];
  initiatives: string[];
  stability: string;
  levels: { project: string; domain: string; level: string }[];
  feature: string | null;
  rules: string[];
  concepts: string[];
  gaps: string[];
  tradeoffs: string[];
  builtBy: string[];
  evidence: EvidenceResource;
  readiness: ReadinessResource;
  exposure: ExposureResource;
  risk: RiskSummaryResource;
  open: { decisions: DecisionResource[]; gaps: string[]; technical: { gap: string; on: string }[] };
  ruleStandings: Record<string, string>;
  outcomes: OutcomeStandingResource[];
};

export const listCapabilities = (showing: Showing, signal?: AbortSignal) => getAll<CapabilityResource>(productPath(showing, "/capabilities"), signal);
