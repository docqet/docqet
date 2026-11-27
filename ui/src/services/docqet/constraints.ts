import { getAll, productPath, type Showing } from "./client";
import type { DocResource, FiguresResource } from "./shared";

/* A constraint, with where it comes from, the rules and mechanisms that respect it, the capabilities it bears on, and their figures. */
export type ConstraintResource = DocResource &
  FiguresResource & {
    source: string | null;
    rules: string[];
    mechanisms: string[];
    capabilities: string[];
  };

export const listConstraints = (showing: Showing, signal?: AbortSignal) => getAll<ConstraintResource>(productPath(showing, "/constraints"), signal);
