import { getAll, productPath, type Showing } from "./client";
import type { TechnicalResource } from "./shared";

export const listMechanisms = (showing: Showing) => getAll<TechnicalResource>(productPath(showing, "/mechanisms"));
