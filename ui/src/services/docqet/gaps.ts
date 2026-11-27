import { getAll, productPath, type Showing } from "./client";
import type { AffectedResource, HeldDecisionResource, PlaceResource, RiskResource, ScoredGapResource } from "./shared";

export type { RiskOnResource, RiskResource } from "./shared";

export type GapResource = {
  id: string;
  subject: string;
  project: string;
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
export const listGaps = (showing: Showing, options: { for?: string; sort?: "risk" } = {}, signal?: AbortSignal) =>
  getAll<GapResource>(productPath(showing, "/gaps", { for: options.for ?? "", sort: options.sort ?? "" }), signal);
