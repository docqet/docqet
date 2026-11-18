import type { StabilityLevelId } from "./design/stability/stability";

/* The shape of `state.json`, as the spec's "Index output" section describes it. */

export type Level = "Prototype" | "Alpha" | "Beta" | "GA";
export type RuleKind = "core" | "edge-case";
export type RuleStatus = "decided" | "implemented" | "tested" | "passing" | "failing";

export type Doc = {
  id: string;
  file: string;
  name: string;
  summary?: string;
  /* Everything after the title and summary, as Markdown. */
  body: string;
};

export type CodeGlob = { glob: string; files: number };

/* A job the product does, grouping the capabilities that do it. */
export type Feature = Doc & {
  capabilities: string[];
  /* 0 to 100, or null with no capabilities. See maturity below. */
  maturity: number | null;
  band: Level | null;
};

export type Capability = Doc & {
  stability: Level;
  /* The feature it's in, or null. */
  feature: string | null;
  rules: string[];
  concepts: string[];
  code: CodeGlob[];
  flows: string[];
  engineering: string[];
  gaps: string[];
};

export type Location = { file: string; line: number; symbol?: string };

export type Verification = {
  file: string;
  line: number;
  test: string;
  suite: string;
  result: "passed" | "failed" | null;
  cases: { passed: number; failed: number };
};

/*
 * A rule belongs to the domain, not to a capability or feature. Capabilities
 * refer to the rules they follow, so `capabilities` can name several, in
 * different features. A feature's rules are its capabilities' rules.
 */
export type Rule = Doc & {
  kind: RuleKind;
  status: RuleStatus;
  /* Every capability that follows it, worked out from their `rules`. */
  capabilities: string[];
  concepts: string[];
  implementedIn: Location[];
  verifiedBy: Verification[];
};

export type Concept = Doc & { capabilities: string[]; rules: string[] };
export type Flow = Doc & { personas: string[]; capabilities: string[] };
export type Persona = Doc & { flows: string[] };
export type EngineeringDoc = Doc & { capabilities: string[]; code?: CodeGlob[]; systems?: string[] };

export type Until = { capability: string; reaches: Level } | string;

export type Gap = {
  id: string;
  type: "product" | "technical";
  kind?: "to-close-later" | "accepted-tradeoff";
  text: string;
  until?: Until;
  due?: boolean;
};

export type Problem = { type: string; subject: string; capabilities: string[]; message: string };

export type DocketState = {
  docket: string;
  project: { id: string; name: string };
  commit: string;
  indexedAt: string;
  /* null when no test results were indexed. */
  results: { commit: string; suites: { suite: string; path: string; ranAt: string }[] } | null;
  summary: {
    maturity: number | null;
    band: Level | null;
    features: number;
    capabilities: Record<Level, number>;
    rules: Record<RuleStatus, number>;
    gaps: { product: number; technical: number; due: number };
    problems: number;
  };
  features: Feature[];
  capabilities: Capability[];
  rules: Rule[];
  concepts: Concept[];
  flows: Flow[];
  personas: Persona[];
  engineering: EngineeringDoc[];
  gaps: Gap[];
  problems: Problem[];
};

/* A project the UI can show, and where its state.json is, relative to the page. */
export type ProjectEntry = { id: string; name: string; state: string };

const isJson = (response: Response) => response.headers.get("content-type")?.includes("json") ?? false;

/*
 * The projects listed in `projects.json` beside the page. With none listed
 * there, the page shows the one project in `state.json` beside it, so the
 * list is empty.
 */
export async function loadProjects(): Promise<ProjectEntry[]> {
  const response = await fetch("./projects.json", { cache: "no-store" });
  /* Some servers answer a missing file with the page itself. */
  if (response.status === 404 || (response.ok && !isJson(response))) return [];
  if (!response.ok) throw new Error(`projects.json: ${response.status} ${response.statusText}`);
  return ((await response.json()) as { projects: ProjectEntry[] }).projects;
}

export async function loadState(path = "./state.json"): Promise<DocketState> {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error(`${path}: ${response.status} ${response.statusText}`);
  return (await response.json()) as DocketState;
}

export function find<T extends { id: string }>(list: T[], id: string): T | undefined {
  return list.find((item) => item.id === id);
}

/* Where a rule applies: each capability that follows it, with the feature it's in, if any. */
export function ruleAppliesTo(state: DocketState, rule: Rule): { capability: Capability; feature: Feature | null }[] {
  return rule.capabilities.flatMap((id) => {
    const capability = find(state.capabilities, id);
    if (!capability) return [];
    return [{ capability, feature: capability.feature ? (find(state.features, capability.feature) ?? null) : null }];
  });
}

/* state.json's level ("GA") as the design components name it ("ga"). */
export const levelId = (level: Level) => level.toLowerCase() as StabilityLevelId;
