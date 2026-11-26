import { getAll } from "./client";
import type { ProductProjectResource } from "./projects";
import type { MaturityResource } from "./shared";

export type ProductResource = { id: string; name: string; projects: ProductProjectResource[]; maturity: MaturityResource };

/* Every product on the server, each with its projects. */
export const listProducts = (signal?: AbortSignal) => getAll<ProductResource>("/products", signal);
