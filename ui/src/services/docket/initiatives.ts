import { getAll, productPath, type Showing } from "./client";
import type { DocResource, FiguresResource } from "./shared";

export type InitiativeResource = DocResource & FiguresResource & { capabilities: string[]; features: string[]; personas: string[] };

export const listInitiatives = (showing: Showing) => getAll<InitiativeResource>(productPath(showing, "/initiatives"));
