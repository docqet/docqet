import { getAll, productPath, type Showing } from "./client";
import type { DocResource } from "./shared";

export type ConceptResource = DocResource & { capabilities: string[]; rules: string[] };

export const listConcepts = (showing: Showing, signal?: AbortSignal) => getAll<ConceptResource>(productPath(showing, "/concepts"), signal);
