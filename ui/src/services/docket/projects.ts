import { getAll, productPath, type Showing } from "./client";
import type { MaturityResource } from "./shared";

/* A project, as a product lists it: the commit it was last applied at, and its maturity. */
export type ProductProjectResource = {
  id: string;
  name: string;
  product: { id: string; name: string };
  commit: string;
  indexedAt: string;
  maturity: MaturityResource;
};

/* The product's projects showing. */
export const listProjects = (showing: Showing) => getAll<ProductProjectResource>(productPath(showing, "/projects"));
