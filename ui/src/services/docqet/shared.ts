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
/* What a gap, or a rated decision, puts at stake on one capability, and how that's worked out. */
export type RiskOnResource = {
  capability: string;
  impact: number;
  likelihood: number;
  reach: number;
  weight: number;
  claim: boolean;
  claimFactor: number;
  raw: number;
  score: number;
};
export type RiskResource = {
  score: number;
  verdict: string;
  claim: boolean;
  capabilities: number;
  spread: { score: number; capabilities: number }[];
  on: RiskOnResource[];
};
/* An open decision, with its ratings, all null when it isn't rated. */
export type DecisionResource = {
  topic: string | null;
  question: string;
  affects: string[];
  impact?: string | null;
  likelihood?: string | null;
  reach?: string | null;
};
/* An open decision, with the doc it's on and its risk: null when it isn't rated. */
export type HeldDecisionResource = DecisionResource & { on: string; risk: RiskResource | null };
/* Something that would raise a readiness: promoting a capability, or every capability in a feature or a domain, closing a gap, or answering a rated decision. */
export type ImprovementResource = {
  kind: "promote" | "promote-feature" | "promote-domain" | "close" | "answer";
  capability: string | null;
  from: string | null;
  to: string | null;
  feature: string | null;
  domain: string | null;
  gap: string | null;
  decision: HeldDecisionResource | null;
  capabilities: string[];
  readiness: number;
  maturity: number;
  exposure: number;
  gain: number;
  band: string | null;
};
export type ReadinessResource = {
  percent: number | null;
  band: string | null;
  maturity: number | null;
  exposure: ExposureResource;
  levels: string[];
  gaps: RiskSummaryResource;
  started: number;
  notStarted: string[];
  improvements: ImprovementResource[];
  areas: AreaResource[];
};
/* Somewhere a readiness could rise: a domain, feature or capability, or one step, with what readiness would be with all of it settled, and its best next step. */
export type AreaResource = {
  kind: "domain" | "feature" | "capability" | "gap" | "decision" | "promotion";
  domain: string | null;
  feature: string | null;
  capability: string | null;
  capabilities: string[];
  potential: number;
  next: ImprovementResource | null;
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
