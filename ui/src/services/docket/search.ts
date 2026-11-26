import { getAll, productPath, type Showing } from "./client";

export type SearchResultResource = { kind: string; id: string; name: string; description: string; match: string };

/* The docs showing that match `q`, best first. */
export const searchProduct = (showing: Showing, q: string, signal?: AbortSignal) =>
  getAll<SearchResultResource>(productPath(showing, "/search", { q }), signal);
