import { getAll, productPath, type Showing } from "./client";
import type { AffectedResource, HeldDecisionResource, PlaceResource } from "./shared";

export type TradeoffResource = {
  id: string;
  subject: string;
  project: string;
  domain: string;
  affects: string[];
  name: string;
  description: string;
  benefit: string | null;
  drawback: string;
  places: PlaceResource[];
  affected: AffectedResource[];
  decisions: HeldDecisionResource[];
};

export const listTradeoffs = (showing: Showing) => getAll<TradeoffResource>(productPath(showing, "/tradeoffs"));
