import { getAll, productPath, type Showing } from "./client";
import type { DocResource, FiguresResource, MaturityResource } from "./shared";

export type FeatureResource = DocResource &
  FiguresResource & {
    capabilities: string[];
    tradeoffs: string[];
    parts: { domain: string; capabilities: string[]; maturity: MaturityResource }[];
  };

export const listFeatures = (showing: Showing) => getAll<FeatureResource>(productPath(showing, "/features"));
