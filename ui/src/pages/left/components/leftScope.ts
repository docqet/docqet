import { personaNameAndRole } from "../../../components/Personas";
import {
  IMPACTS,
  LIKELIHOODS,
  REACHES,
  VERDICTS,
  capabilitiesById,
  domainCapabilities,
  domainName,
  find,
  type Capability,
  type DecisionHolder,
  type DocqetState,
  type Domain,
  type Gap,
  type Impact,
  type Level,
  type Likelihood,
  type Reach,
  type Risk,
  type RiskAcross,
  type RiskOn,
  type Verdict,
} from "../../../state";
import { gapKind } from "../../../components/left/LeftMark";
import { summed, useGapsFor, type GapWithin, type Read } from "../../../model";
import { STABILITY_LEVEL_IDS } from "../../../components/stability/stability";

/*
 * What's left, for something: what the page is looking at, and each gap as
 * a row with every part of its risk there, so the page can filter, show and
 * order by any of them.
 */

export type ScopeKind = "all" | "project" | "persona" | "initiative" | "domain" | "feature" | "capability";

/*
 * What the page is for: everything showing, or one project, persona,
 * domain, feature or capability, and the capabilities that makes, null for
 * all of them. A project is the gaps and decisions written in it, scored on
 * every capability they show on, since a project such as a UI may build
 * none of its own.
 */
export type Scope = { key: string; kind: ScopeKind; name: string; capabilities: Capability[] | null; project?: string };

const EVERYTHING: Scope = { key: "all", kind: "all", name: "Everything showing", capabilities: null };

/* The scope an address names, as `<kind>:<id>`, or everything when it names none, or one that isn't showing. */
export function scopeOf(state: DocqetState, value: string | null): Scope {
  if (!value) return EVERYTHING;
  const colon = value.indexOf(":");
  const kind = value.slice(0, colon) as ScopeKind;
  const id = value.slice(colon + 1);
  if (kind === "project") {
    const p = state.projects.find((x) => x.id === id);
    return p ? { key: value, kind, name: p.name, capabilities: null, project: id } : EVERYTHING;
  }
  if (kind === "persona") {
    const p = find(state.personas, id);
    return p ? { key: value, kind, name: personaNameAndRole(p).name, capabilities: capabilitiesById(state, p.capabilities) } : EVERYTHING;
  }
  if (kind === "initiative") {
    const i = find(state.initiatives, id);
    return i ? { key: value, kind, name: i.name, capabilities: capabilitiesById(state, i.capabilities) } : EVERYTHING;
  }
  if (kind === "domain") {
    const d = find(state.domains, id);
    return d ? { key: value, kind, name: d.name, capabilities: domainCapabilities(state, d) } : EVERYTHING;
  }
  if (kind === "feature") {
    const f = find(state.features, id);
    return f ? { key: value, kind, name: f.name, capabilities: capabilitiesById(state, f.capabilities) } : EVERYTHING;
  }
  if (kind === "capability") {
    const c = find(state.capabilities, id);
    return c ? { key: value, kind, name: c.name, capabilities: [c] } : EVERYTHING;
  }
  return EVERYTHING;
}

/* A scope to choose: its kind, its key in the address, its name, and a line saying which one it is, such as a persona's role. */
export type ScopeChoice = { kind: ScopeKind; key: string; name: string; note: string | null };

/* Every scope there is to choose, by kind, everything first, each kind by name. */
export function scopeChoices(state: DocqetState): ScopeChoice[] {
  const byName = (xs: ScopeChoice[]) => [...xs].sort((a, b) => a.name.localeCompare(b.name));
  const domains = (ids: string[]) => [...new Set(ids)].map((d) => domainName(state, d)).join(", ") || null;
  return [
    { kind: "all", key: "all", name: EVERYTHING.name, note: plural(state.projects.length, "project") },
    ...state.projects.map((p) => ({ kind: "project" as const, key: `project:${p.id}`, name: p.name, note: null })),
    ...byName(
      state.personas
        .map((p) => ({ kind: "persona" as const, key: `persona:${p.id}`, ...personaNameAndRole(p) }))
        .map(({ role, ...c }) => ({ ...c, note: role })),
    ),
    ...byName(state.initiatives.map((i) => ({ kind: "initiative" as const, key: `initiative:${i.id}`, name: i.name, note: null }))),
    ...byName(state.domains.map((d) => ({ kind: "domain" as const, key: `domain:${d.id}`, name: d.name, note: null }))),
    ...byName(state.features.map((f) => ({ kind: "feature" as const, key: `feature:${f.id}`, name: f.name, note: domains(f.parts.map((p) => p.domain)) }))),
    ...byName(
      state.capabilities.map((c) => ({
        kind: "capability" as const,
        key: `capability:${c.id}`,
        name: c.name,
        note: (c.feature ? find(state.features, c.feature)?.name : null) ?? domains(c.levels.map((l) => l.domain)),
      })),
    ),
  ];
}

const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? "" : "s"}`;

/* A gap as the page shows it: every part of its risk where it scores highest in the scope. */
export type GapRow = {
  gap: Gap;
  risk: Risk;
  /* Where it scores highest among the scope's capabilities, or null where it's on none with a level. */
  on: RiskOn | null;
  score: number;
  verdict: Verdict;
  kind: "product" | "technical";
  impact: Impact;
  likelihood: Likelihood;
  reach: Reach;
  level: Level | null;
  claim: boolean;
};

type Scored = { gap: Gap; on: RiskOn | null; score: number; verdict: Verdict };

/* Gaps as rows, riskiest first. */
const rowsOf = (scored: Scored[]): GapRow[] =>
  scored
    .map(({ gap, on, score, verdict }) => ({
      gap,
      risk: gap.risk,
      on,
      score,
      verdict,
      kind: gapKind(gap) === "technical-gap" ? ("technical" as const) : ("product" as const),
      impact: gap.impact,
      likelihood: gap.risk.likelihood,
      reach: gap.risk.reach,
      level: on?.capability.stability ?? null,
      claim: on?.claim ?? false,
    }))
    .sort((a, b) => b.score - a.score || (b.on?.weight ?? 0) - (a.on?.weight ?? 0));

/*
 * The gaps that show on the scope's capabilities, each scored there by the
 * server, riskiest first, as a read; for a project, those written in it, and
 * for everything, every gap, each with its whole risk, which are already in.
 */
export function useRowsFor(state: DocqetState, scope: Scope): Read<GapRow[]> {
  const within = useGapsFor(state, scope.capabilities ? scope.key : null);
  if (!scope.capabilities) {
    const rows = rowsOf(
      (scope.project ? state.gaps.filter((g) => g.project === scope.project) : state.gaps).map((gap) => ({
        gap,
        on: gap.risk.on[0] ?? null,
        score: gap.risk.score,
        verdict: gap.risk.verdict,
      })),
    );
    return { data: rows, previous: rows, loading: false, error: false, retry: () => {} };
  }
  const scored = (list: GapWithin[] | null) => list && rowsOf(state.gaps.flatMap((gap) => list.find((w) => w.gap.id === gap.id) ?? []));
  return { ...within, data: scored(within.data), previous: scored(within.previous) };
}

/*
 * What's at stake across some rows, as a group's figure: their scores, as
 * the server gave them, riskiest first, the highest, and how many fall in
 * each verdict. Nothing's worked out but the order and the counts.
 */
export const acrossRows = (rows: GapRow[]): RiskAcross<Gap> =>
  summed([...rows].sort((a, b) => b.score - a.score).map((r) => ({ item: r.gap, risk: r.risk, on: r.on, score: r.score, verdict: r.verdict })));

/* The decisions held on the scope: on its capabilities, the features and domains they're in, and what they're built on. */
export function holdersIn(state: DocqetState, holders: DecisionHolder[], scope: Scope): DecisionHolder[] {
  if (scope.project) return holders.filter((h) => h.doc.from.some((f) => f.project === scope.project));
  if (!scope.capabilities) return holders;
  const ids = new Set(scope.capabilities.map((c) => c.id));
  return holders.filter((h) => {
    if (h.kind === "capability") return ids.has(h.doc.id);
    if (h.kind === "domain") return domainCapabilities(state, h.doc as Domain).some((c) => ids.has(c.id));
    return (h.doc as { capabilities?: string[] }).capabilities?.some((c) => ids.has(c)) ?? false;
  });
}

/* ——— Filters and order ——— */

/* Each part of the risk model a row can be filtered or grouped by, with its values worst first, and the value a row has. */
export const PARTS = {
  verdict: { label: "Risk", values: [...VERDICTS] as string[], of: (r: GapRow) => r.verdict },
  impact: { label: "Impact", values: [...IMPACTS] as string[], of: (r: GapRow) => r.impact },
  likelihood: { label: "Likelihood", values: [...LIKELIHOODS] as string[], of: (r: GapRow) => r.likelihood },
  reach: { label: "Reach", values: [...REACHES] as string[], of: (r: GapRow) => r.reach },
  stability: { label: "Stability", values: [...[...STABILITY_LEVEL_IDS].reverse(), "none"] as string[], of: (r: GapRow) => r.level ?? "none" },
  claim: { label: "Claim", values: ["breaks", "keeps"], of: (r: GapRow) => (r.claim ? "breaks" : "keeps") },
  kind: { label: "Kind", values: ["product", "technical"], of: (r: GapRow) => r.kind },
} as const;

export type PartId = keyof typeof PARTS;
export const PART_IDS = Object.keys(PARTS) as PartId[];

/* The filters an address sets: a value for each part it names. */
export type Filters = Partial<Record<PartId, string>>;

export function filtersFrom(search: URLSearchParams): Filters {
  const filters: Filters = {};
  for (const id of PART_IDS) {
    const v = search.get(id);
    if (v && (PARTS[id].values as readonly string[]).includes(v)) filters[id] = v;
  }
  return filters;
}

/* Whether a row passes every filter, leaving out `except`, so a filter's own counts show what choosing each value would give. */
export const passes = (row: GapRow, filters: Filters, except?: PartId) =>
  PART_IDS.every((id) => id === except || !filters[id] || PARTS[id].of(row) === filters[id]);
