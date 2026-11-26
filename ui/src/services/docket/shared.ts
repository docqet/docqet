/* The shapes several of the API's resources share. */

export type MaturityResource = { percent: number; band: string } | null;
export type ExposureResource = { percent: number | null; capabilities: number; band: string | null; unacceptable: boolean };
export type ScoredGapResource = { gap: string; capability: string | null; score: number; verdict: string };
export type RiskSummaryResource = {
  score: number | null;
  verdict: string | null;
  counts: Record<string, number>;
  gaps: ScoredGapResource[];
};
export type DecisionResource = { topic: string | null; question: string; affects: string[] };
export type HeldDecisionResource = DecisionResource & { on: string };
export type NeedResource = { capability: string; belowBeta: boolean; gaps: string[]; decisions: DecisionResource[] };
export type ReadinessResource = {
  percent: number | null;
  band: string | null;
  maturity: number | null;
  exposure: ExposureResource;
  levels: string[];
  gaps: RiskSummaryResource;
  ready: string[];
  notReady: NeedResource[];
  notStarted: string[];
};
/* The figures a domain, feature, persona or initiative carries. */
export type FiguresResource = { maturity: MaturityResource; readiness: ReadinessResource; exposure: ExposureResource };
export type ContributionResource = {
  project: string;
  domain: string;
  file: string;
  name: string;
  description: string;
  body: string;
  role?: string | null;
  title?: string | null;
  decisions?: DecisionResource[];
  why?: string | null;
  confusedWith?: { concept: string | null; term: string | null; summary: string }[];
};
export type PlaceResource = { project: string; file: string; line: number; text: string };
export type EvidenceResource = { implements: PlaceResource[]; verifies: PlaceResource[] };
/* What every doc has, put together across the projects that define it. */
export type DocResource = {
  id: string;
  project: string;
  domain: string;
  file: string;
  name: string;
  description: string;
  body: string;
  from: ContributionResource[];
};
/* What a gap or tradeoff affects, as the server resolves it. */
export type AffectedResource = { kind: "outcome" | "rule" | "gap" | "tradeoff"; ref: string; quality?: string };
/* A mechanism or a component, which share one shape. */
export type TechnicalResource = DocResource & {
  kind: "mechanism" | "component";
  applies: "project" | "product";
  capabilities: string[];
  meets: string[];
  gaps: string[];
  tradeoffs: string[];
  evidence: EvidenceResource;
  risk: RiskSummaryResource;
};
