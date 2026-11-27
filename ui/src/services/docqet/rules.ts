import { getAll, productPath, type Showing } from "./client";
import type { DocResource, EvidenceResource } from "./shared";

export type RuleResource = DocResource & {
  capabilities: string[];
  concepts: string[];
  /* The constraints it respects. */
  respects: string[];
  gaps: string[];
  evidence: EvidenceResource;
  standings: Record<string, string>;
};

export const listRules = (showing: Showing, signal?: AbortSignal) => getAll<RuleResource>(productPath(showing, "/rules"), signal);
