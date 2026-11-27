import { getAll, productPath, type Showing } from "./client";
import type { DocResource, FiguresResource } from "./shared";

/* A problem, with the personas who have it, the capabilities that solve it, and their figures. */
export type ProblemResource = DocResource &
  FiguresResource & {
    cost: string | null;
    personas: string[];
    capabilities: string[];
    /* The constraints that apply to it, each with what solving it respects it. */
    constraints: { constraint: string; broad: boolean; respectedBy: string[]; unaddressed: boolean }[];
  };

export const listProblems = (showing: Showing, signal?: AbortSignal) => getAll<ProblemResource>(productPath(showing, "/problems"), signal);
