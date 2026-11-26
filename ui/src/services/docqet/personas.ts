import { getAll, productPath, type Showing } from "./client";
import type { DocResource, FiguresResource } from "./shared";

export type PersonaResource = DocResource &
  FiguresResource & {
    role: string | null;
    title: string | null;
    image: string | null;
    capabilities: string[];
    features: string[];
    initiatives: string[];
  };

export const listPersonas = (showing: Showing, signal?: AbortSignal) => getAll<PersonaResource>(productPath(showing, "/personas"), signal);
