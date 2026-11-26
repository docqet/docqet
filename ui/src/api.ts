/*
 * The server's API, which is all the UI reads: the resources under
 * /api/v1/products, each doc put together across a product's projects with
 * the figures the server works out for it, so the UI works nothing out
 * itself. The types are the resources as internal/handlers/http/resources.go
 * defines them.
 */

import type { Rubric } from "./state";

export type MaturityResource = { percent: number; band: string } | null;
export type ExposureResource = { percent: number | null; capabilities: number; band: string | null; unacceptable: boolean };
export type ScoredGapResource = { gap: string; capability: string | null; score: number | null; verdict: string | null };
export type RiskSummaryResource = {
  score: number | null;
  verdict: string | null;
  counts: Record<string, number>;
  unrated: number;
  gaps: ScoredGapResource[];
};
export type DecisionResource = { topic: string | null; question: string; affects: string[] };
export type NeedResource = { capability: string; belowBeta: boolean; gaps: string[]; decisions: DecisionResource[] };
export type ReadinessResource = {
  percent: number | null;
  band: string | null;
  maturity: number | null;
  exposure: ExposureResource;
  levels: string[];
  gaps: RiskSummaryResource;
  ready: string[];
  notReady: NeedResource[];
  notStarted: string[];
};
export type HeldDecisionResource = DecisionResource & { on: string };
export type ContributionResource = {
  project: string;
  domain: string;
  file: string;
  name: string;
  description: string;
  body: string;
  role?: string | null;
  title?: string | null;
  decisions?: DecisionResource[];
  why?: string | null;
  confusedWith?: { concept: string | null; term: string | null; summary: string }[];
};
export type PlaceResource = { project: string; file: string; line: number; text: string };
export type EvidenceResource = { implements: PlaceResource[]; verifies: PlaceResource[] };
export type DocResource = {
  id: string;
  project: string;
  domain: string;
  file: string;
  name: string;
  description: string;
  body: string;
  from: ContributionResource[];
};
export type ProductProjectResource = {
  id: string;
  name: string;
  product: { id: string; name: string };
  commit: string;
  indexedAt: string;
  maturity: MaturityResource;
};
export type ProductResource = { id: string; name: string; projects: ProductProjectResource[]; maturity: MaturityResource };
export type StatusResource = {
  maturity: MaturityResource;
  readiness: ReadinessResource;
  exposure: ExposureResource;
  risk: RiskSummaryResource;
  counts: Record<string, unknown>;
};
type Figures = { maturity: MaturityResource; readiness: ReadinessResource; exposure: ExposureResource };
export type DomainResource = DocResource & Figures & { features: string[]; capabilities: string[] };
export type FeatureResource = DocResource &
  Figures & {
    capabilities: string[];
    tradeoffs: string[];
    parts: { domain: string; capabilities: string[]; maturity: MaturityResource }[];
  };
export type OutcomeStandingResource = {
  outcome: string;
  standing: string;
  gaps: string[];
  tradeoffs: string[];
  decisions: DecisionResource[];
  by: string[];
};
export type CapabilityResource = DocResource & {
  personas: string[];
  initiatives: string[];
  stability: string;
  levels: { project: string; domain: string; level: string }[];
  feature: string | null;
  rules: string[];
  concepts: string[];
  gaps: string[];
  tradeoffs: string[];
  builtBy: string[];
  evidence: EvidenceResource;
  readiness: ReadinessResource;
  exposure: ExposureResource;
  risk: RiskSummaryResource;
  left: { decisions: DecisionResource[]; gaps: string[]; technical: { gap: string; on: string }[] };
  ruleStandings: Record<string, string>;
  outcomes: OutcomeStandingResource[];
};
export type RuleResource = DocResource & {
  capabilities: string[];
  concepts: string[];
  gaps: string[];
  evidence: EvidenceResource;
  standings: Record<string, string>;
};
export type ConceptResource = DocResource & { capabilities: string[]; rules: string[] };
export type PersonaResource = DocResource &
  Figures & {
    role: string | null;
    title: string | null;
    image: string | null;
    capabilities: string[];
    features: string[];
    initiatives: string[];
  };
export type InitiativeResource = DocResource & Figures & { capabilities: string[]; features: string[]; personas: string[] };
export type TechnicalResource = DocResource & {
  kind: "mechanism" | "component";
  applies: "project" | "product";
  capabilities: string[];
  meets: string[];
  gaps: string[];
  tradeoffs: string[];
  evidence: EvidenceResource;
  risk: RiskSummaryResource;
};
export type RiskOnResource = {
  capability: string;
  impact: number;
  likelihood: number;
  reach: number;
  weight: number;
  claim: boolean;
  claimFactor: number;
  raw: number;
  score: number;
};
export type RiskResource = {
  score: number | null;
  verdict: string | null;
  claim: boolean;
  capabilities: number;
  spread: { score: number; capabilities: number }[];
  on: RiskOnResource[];
};
export type AffectedResource = { kind: "outcome" | "rule" | "gap" | "tradeoff"; ref: string; quality?: string };
export type GapResource = {
  id: string;
  subject: string;
  project: string;
  domain: string;
  affects: string[];
  impact: string | null;
  likelihood: string | null;
  reach: string | null;
  name: string;
  description: string;
  places: PlaceResource[];
  risk: RiskResource;
  affected: AffectedResource[];
  decisions: HeldDecisionResource[];
  within: ScoredGapResource | null;
};
export type TradeoffResource = {
  id: string;
  subject: string;
  project: string;
  domain: string;
  affects: string[];
  name: string;
  description: string;
  benefit: string | null;
  drawback: string;
  places: PlaceResource[];
  affected: AffectedResource[];
  decisions: HeldDecisionResource[];
};
export type ProblemResource = {
  type: string;
  subject: string;
  capabilities: string[];
  message: string;
  domain?: string;
  file?: string;
  line?: number;
};
export type SearchResultResource = { kind: string; id: string; name: string; description: string; match: string };

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

async function get(path: string): Promise<Response> {
  const response = await fetch(base + path, { cache: "no-store" });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new ApiError(response.status, `${path}: ${body?.error ?? `${response.status} ${response.statusText}`}`);
  }
  return response;
}

/* One resource. */
export async function getOne<T>(path: string): Promise<T> {
  return (await (await get(path)).json()) as T;
}

/* Every item of a list, paging through it. */
export async function getAll<T>(path: string): Promise<T[]> {
  const items: T[] = [];
  const join = path.includes("?") ? "&" : "?";
  for (let page = 1; ; page++) {
    const response = await get(`${path}${join}size=500&page=${page}`);
    const got = (await response.json()) as T[];
    items.push(...got);
    const total = Number(response.headers.get("X-Total-Count") ?? items.length);
    if (items.length >= total || got.length === 0) return items;
  }
}

/* Every product on the server, each with its projects. */
export const getProducts = () => getAll<ProductResource>("/products");

/* A path under the product showing, with what's showing and any query of its own. */
export const productPath = (showing: Showing, path: string, extra: Record<string, string> = {}) =>
  `/products/${encodeURIComponent(showing.product)}${path}${query(showing, extra)}`;

/* Everything about the product showing, at once: what the UI holds while a product shows. */
export async function getProduct(showing: Showing) {
  const all = <T>(path: string) => getAll<T>(productPath(showing, path));
  const [
    product,
    status,
    projects,
    rubric,
    domains,
    features,
    capabilities,
    rules,
    concepts,
    personas,
    initiatives,
    mechanisms,
    components,
    gaps,
    tradeoffs,
    problems,
  ] = await Promise.all([
    getOne<ProductResource>(productPath(showing, "")),
    getOne<StatusResource>(productPath(showing, "/status")),
    all<ProductProjectResource>("/projects"),
    getOne<Rubric>(productPath(showing, "/rubric")),
    all<DomainResource>("/domains"),
    all<FeatureResource>("/features"),
    all<CapabilityResource>("/capabilities"),
    all<RuleResource>("/rules"),
    all<ConceptResource>("/concepts"),
    all<PersonaResource>("/personas"),
    all<InitiativeResource>("/initiatives"),
    all<TechnicalResource>("/mechanisms"),
    all<TechnicalResource>("/components"),
    all<GapResource>("/gaps"),
    all<TradeoffResource>("/tradeoffs"),
    all<ProblemResource>("/problems"),
  ]);
  return { product, status, projects, rubric, domains, features, capabilities, rules, concepts, personas, initiatives, mechanisms, components, gaps, tradeoffs, problems };
}

export type ProductResources = Awaited<ReturnType<typeof getProduct>>;
