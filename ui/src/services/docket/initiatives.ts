import { getAll, productPath, type Showing } from "./client";
import type { DocResource, FiguresResource } from "./shared";

export type InitiativeResource = DocResource & FiguresResource & { capabilities: string[]; features: string[]; personas: string[] };

export const listInitiatives = (showing: Showing, signal?: AbortSignal) => getAll<InitiativeResource>(productPath(showing, "/initiatives"), signal);
