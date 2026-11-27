import { getAll, productPath, type Showing } from "./client";
import type { DocResource, FiguresResource } from "./shared";

/* An area, with its features, those that name it, by name, and every capability in them. */
export type AreaResource = DocResource & FiguresResource & { features: string[]; capabilities: string[] };

export const listAreas = (showing: Showing, signal?: AbortSignal) => getAll<AreaResource>(productPath(showing, "/areas"), signal);
