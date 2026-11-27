import { getAll, productPath, type Showing } from "./client";
import type { DocResource, FiguresResource } from "./shared";

/* A constraint, with where it comes from, what it applies to, everything that respects it, the capabilities it bears on, and their figures. */
export type ConstraintResource = DocResource &
  FiguresResource & {
    source: string | null;
    /* project or product when it applies to every problem there; null when it applies to the problems subject to it. */
    applies: "project" | "product" | null;
    problems: string[];
    /* Everything that respects it, as references; rules and mechanisms are those among it, by ID. */
    respectedBy: string[];
    gaps: string[];
    rules: string[];
    mechanisms: string[];
    capabilities: string[];
  };

export const listConstraints = (showing: Showing, signal?: AbortSignal) => getAll<ConstraintResource>(productPath(showing, "/constraints"), signal);
