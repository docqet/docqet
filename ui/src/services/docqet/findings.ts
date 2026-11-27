import { getAll, productPath, type Showing } from "./client";

/* What the indexer found wrong in the docs. */
export type FindingResource = {
  type: string;
  subject: string;
  capabilities: string[];
  message: string;
  domain?: string;
  file?: string;
  line?: number;
  /* Shown, but never failing a check. */
  advisory: boolean;
};

export const listFindings = (showing: Showing, signal?: AbortSignal) => getAll<FindingResource>(productPath(showing, "/findings"), signal);
