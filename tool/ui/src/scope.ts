import type { StateFile } from "./state";

/*
 * What's showing: everything, or one initiative's capabilities and personas.
 * The address says which, as `?scope=<initiative id>`, with everything when
 * it names none.
 *
 * A scope narrows each project's state before it's put together, so every
 * number on every page, maturity, exposure, readiness and what's left, counts
 * only the capabilities in it, worked out by the same code as ever.
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

const idOf = (ref: string) => ref.slice(ref.indexOf(":") + 1);

/*
 * Each project's state with only what the scope shows. Whether a capability
 * or persona is in an initiative is decided across every project first,
 * since projects contribute to the same one, and a component in one can list
 * another's capabilities: it's in when any contribution says so.
 */
export function scopeFiles(files: StateFile[], scope: Scope): StateFile[] {
  if (scope.kind === "all") return files;
  const ref = `initiative:${scope.id}`;
  const inIt = (docs: { id: string; initiatives?: string[] }[], type: string) =>
    new Set(docs.filter((d) => (d.initiatives ?? []).includes(ref)).map((d) => `${type}:${d.id}`));
  const kept = inIt(files.flatMap((f) => f.capabilities), "capability");
  const personas = inIt(files.flatMap((f) => f.personas ?? []), "persona");
  return files.map((f) => scopeFile(f, kept, personas));
}

/*
 * One project's state with only the capabilities and personas kept, and the
 * product docs those capabilities reach. A feature or domain left with none
 * of them goes, and so do rules and concepts no capability kept links. A
 * persona in the initiative stays even when nothing in it serves them yet.
 * Gaps and tradeoffs on a capability or feature that went go with it.
 * Mechanisms and components stay, relied on by what's left of their
 * capabilities. Initiatives all stay, so each can still be chosen.
 */
function scopeFile(file: StateFile, kept: Set<string>, personas: Set<string>): StateFile {
  const capabilities = file.capabilities.filter((c) => kept.has(`capability:${c.id}`));
  const narrow = <T extends { capabilities: string[] }>(e: T): T => ({ ...e, capabilities: e.capabilities.filter((ref) => kept.has(ref)) });

  const features = file.features.map(narrow).filter((f) => f.capabilities.length);
  const keptFeatures = new Set(features.map((f) => `feature:${f.id}`));
  const domains = new Set([...features.map((f) => f.domain), ...capabilities.map((c) => c.domain)]);

  /* A rule or concept link means the domain it names, else the linking doc's own, keyed as `<id>@<domain>`. */
  const key = (ref: string, domain: string) => (ref.includes("@") ? idOf(ref) : `${idOf(ref)}@${domain}`);
  const rules = new Set(capabilities.flatMap((c) => c.rules.map((r) => key(r, c.domain))));
  const keptRules = file.rules.filter((r) => rules.has(`${r.id}@${r.domain}`));
  const concepts = new Set([
    ...capabilities.flatMap((c) => c.concepts.map((r) => key(r, c.domain))),
    ...keptRules.flatMap((r) => r.concepts.map((ref) => key(ref, r.domain))),
  ]);

  /* A gap or tradeoff ID is `<what it's on>#<key>`. */
  const onKept = (id: string) => {
    const on = id.slice(0, id.indexOf("#"));
    if (on.startsWith("capability:")) return kept.has(on);
    if (on.startsWith("feature:")) return keptFeatures.has(on);
    return true;
  };

  return {
    ...file,
    domains: file.domains.filter((d) => domains.has(d.id)),
    features,
    capabilities,
    rules: keptRules,
    concepts: file.concepts.filter((c) => concepts.has(`${c.id}@${c.domain}`)),
    personas: file.personas?.filter((p) => personas.has(`persona:${p.id}`)),
    mechanisms: file.mechanisms?.map(narrow),
    components: file.components?.map(narrow),
    gaps: file.gaps.filter((g) => onKept(g.id)),
    tradeoffs: file.tradeoffs?.filter((t) => onKept(t.id)),
    problems: file.problems.filter((p) => !p.capabilities.length || p.capabilities.some((ref) => kept.has(ref) || kept.has(`capability:${ref}`))),
  };
}
