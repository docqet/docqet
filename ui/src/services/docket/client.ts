/*
 * The Docket server's API, which is all the UI reads: where it is, how a read
 * of what's showing is asked for, paging through a list, and turning the
 * errors it answers with into thrown errors. Each resource's module builds on
 * this. Every function takes an optional AbortSignal, so a caller can cancel
 * a read it no longer needs. The resources are as
 * internal/handlers/http/resources.go defines them.
 */

/* What a read shows of a product: some of its projects, or all of them, and one initiative, or everything. */
export type Showing = { product: string; projects: string[]; initiative: string | null };

const base = "./api/v1";

/* The query a read of what's showing takes, with any of its own. */
function query(showing: Showing, extra: Record<string, string> = {}): string {
  const params = new URLSearchParams();
  if (showing.projects.length) params.set("project", showing.projects.join(","));
  if (showing.initiative) params.set("initiative", showing.initiative);
  for (const [k, v] of Object.entries(extra)) if (v) params.set(k, v);
  return params.size ? `?${params}` : "";
}

/* An error the API answered with, with the message it gave. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

async function get(path: string, signal?: AbortSignal): Promise<Response> {
  const response = await fetch(base + path, { cache: "no-store", signal });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new ApiError(response.status, `${path}: ${body?.error ?? `${response.status} ${response.statusText}`}`);
  }
  return response;
}

/* One resource. */
export async function getOne<T>(path: string, signal?: AbortSignal): Promise<T> {
  return (await (await get(path, signal)).json()) as T;
}

/* Every item of a list, paging through it. */
export async function getAll<T>(path: string, signal?: AbortSignal): Promise<T[]> {
  const items: T[] = [];
  const join = path.includes("?") ? "&" : "?";
  for (let page = 1; ; page++) {
    const response = await get(`${path}${join}size=500&page=${page}`, signal);
    const got = (await response.json()) as T[];
    items.push(...got);
    const total = Number(response.headers.get("X-Total-Count") ?? items.length);
    if (items.length >= total || got.length === 0) return items;
  }
}

/* Whether an error is a request being cancelled, which callers ignore rather than report. */
export const isAbort = (e: unknown) => e instanceof DOMException && e.name === "AbortError";

/* A path under the product showing, with what's showing and any query of its own. */
export const productPath = (showing: Showing, path: string, extra: Record<string, string> = {}) =>
  `/products/${encodeURIComponent(showing.product)}${path}${query(showing, extra)}`;
