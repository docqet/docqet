import { getAll, productPath, type Showing } from "./client";
import type { TechnicalResource } from "./shared";

export const listComponents = (showing: Showing, signal?: AbortSignal) => getAll<TechnicalResource>(productPath(showing, "/components"), signal);
