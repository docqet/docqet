import { getAll, productPath, type Showing } from "./client";
import type { AffectedResource, HeldDecisionResource, PlaceResource, ScoredGapResource } from "./shared";

/* What a gap puts at stake on one capability, and how that's worked out. */
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
export type GapResource = {
  id: string;
  subject: string;
  project: string;
  domain: string;
  affects: string[];
  impact: string;
  likelihood: string;
  reach: string;
  name: string;
  description: string;
  places: PlaceResource[];
  risk: RiskResource;
  affected: AffectedResource[];
  decisions: HeldDecisionResource[];
  /* With `for`: its score on the capabilities that names. */
  within: ScoredGapResource | null;
};

/*
 * The gaps showing, or, with `for`, those on the capabilities it names, each
 * scored there. `sort: "risk"` puts the riskiest first.
 */
export const listGaps = (showing: Showing, options: { for?: string; sort?: "risk" } = {}) =>
  getAll<GapResource>(productPath(showing, "/gaps", { for: options.for ?? "", sort: options.sort ?? "" }));
