import { getAll, productPath, type Showing } from "./client";
import type { DocResource, FiguresResource } from "./shared";

export type DomainResource = DocResource & FiguresResource & { features: string[]; capabilities: string[] };

export const listDomains = (showing: Showing, signal?: AbortSignal) => getAll<DomainResource>(productPath(showing, "/domains"), signal);
