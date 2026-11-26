/*
 * What's showing: everything, or one initiative's capabilities and personas.
 * The address says which, as `?scope=<initiative id>`, with everything when
 * it names none.
 *
 * The server narrows what it serves to the scope, as `?initiative=`, so every
 * number on every page, maturity, exposure, readiness and what's left, counts
 * only the capabilities in it.
 */
export type Scope = { kind: "all" } | { kind: "initiative"; id: string };

export const ALL: Scope = { kind: "all" };

export function scopeOf(search: string): Scope {
  const value = new URLSearchParams(search).get("scope");
  if (!value) return ALL;
  return { kind: "initiative", id: value };
}

/* How a scope is written in the address, or null for everything. */
export const scopeParam = (scope: Scope): string | null => (scope.kind === "all" ? null : scope.id);
