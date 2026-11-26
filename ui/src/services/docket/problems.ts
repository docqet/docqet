import { getAll, productPath, type Showing } from "./client";

/* What the indexer found wrong in the docs. */
export type ProblemResource = {
  type: string;
  subject: string;
  capabilities: string[];
  message: string;
  domain?: string;
  file?: string;
  line?: number;
};

export const listProblems = (showing: Showing) => getAll<ProblemResource>(productPath(showing, "/problems"));
