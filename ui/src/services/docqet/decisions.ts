import { getAll, productPath, type Showing } from "./client";
import type { HeldDecisionResource } from "./shared";

/* Every open decision showing, with the doc it's on and its risk, riskiest first: the rated ones by their risk, then the rest. */
export const listDecisions = (showing: Showing, signal?: AbortSignal) => getAll<HeldDecisionResource>(productPath(showing, "/decisions"), signal);
