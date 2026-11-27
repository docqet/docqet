import { getAll, productPath, type Showing } from "./client";
import type { DocResource, FiguresResource } from "./shared";

export type FeatureResource = DocResource &
  FiguresResource & {
    /* The area it names, or null. */
    area: string | null;
    /* The capabilities that name it, by name. */
    capabilities: string[];
    tradeoffs: string[];
  };

export const listFeatures = (showing: Showing, signal?: AbortSignal) => getAll<FeatureResource>(productPath(showing, "/features"), signal);
