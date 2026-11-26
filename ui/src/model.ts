/*
 * The product showing, as the pages hold it: the server's resources, turned
 * into the docs and figures the pages read (see state.ts). Links stay IDs,
 * and each figure's capabilities and gaps are found among the docs, so a page
 * can follow them. Nothing here works out a figure: each is the server's.
 */

import { useEffect, useState } from "react";
import { listCapabilities, type OutcomeStandingResource } from "./services/docket/capabilities";
import type { Showing } from "./services/docket/client";
import { listComponents } from "./services/docket/components";
import { listConcepts } from "./services/docket/concepts";
import { listDomains } from "./services/docket/domains";
import { listFeatures } from "./services/docket/features";
import { listGaps, type GapResource, type RiskOnResource } from "./services/docket/gaps";
import { listInitiatives } from "./services/docket/initiatives";
import { listMechanisms } from "./services/docket/mechanisms";
import { listPersonas } from "./services/docket/personas";
import { listProblems } from "./services/docket/problems";
import { listProjects } from "./services/docket/projects";
import { getRubric } from "./services/docket/rubric";
import { listRules } from "./services/docket/rules";
import type {
  AffectedResource,
  ContributionResource,
  DecisionResource,
  DocResource,
  EvidenceResource,
  ExposureResource,
  HeldDecisionResource,
  MaturityResource,
  ReadinessResource,
  RiskSummaryResource,
  TechnicalResource,
} from "./services/docket/shared";
import { getStatus } from "./services/docket/status";
import { listTradeoffs } from "./services/docket/tradeoffs";
import {
  READINESS_BANDS,
  RISK_BANDS,
  expectedOutcome,
  type Affected,
  type Capability,
  type CapabilityLevel,
  type Concept,
  type Contribution,
  type Decision,
  type DecisionHolder,
  type Doc,
  type DocketState,
  type Domain,
  type Evidence,
  type Exposure,
  type Feature,
  type Gap,
  type HeldDecision,
  type Initiative,
  type Level,
  type OutcomeStanding,
  type Persona,
  type Project,
  type Readiness,
  type Risk,
  type RiskAcross,
  type RiskOn,
  type Rubric,
  type Rule,
  type RuleStanding,
  type Status,
  type TechnicalDoc,
  type Tradeoff,
  type Verdict,
} from "./state";

const level = (l: string): CapabilityLevel => (l === "draft" ? null : (l as Level));
const percent = (m: MaturityResource) => m?.percent ?? null;
const band = (m: MaturityResource) => (m ? (m.band as Level) : null);

const decision = (d: DecisionResource): Decision => ({ topic: d.topic, question: d.question, affects: d.affects });

const contribution = (c: ContributionResource): Contribution => ({
  project: c.project,
  domain: c.domain,
  file: c.file,
  name: c.name,
  description: c.description,
  body: c.body,
  ...(c.role !== undefined || c.title !== undefined ? { role: c.role ?? null, title: c.title ?? null } : {}),
  ...(c.decisions ? { decisions: c.decisions.map(decision) } : {}),
  ...(c.why !== undefined ? { why: c.why } : {}),
  ...(c.confusedWith ? { confusedWith: c.confusedWith } : {}),
});

/* What every doc has, with its first contribution's fields on it, as the pages read them. */
function doc(r: DocResource): Doc {
  const from = r.from.map(contribution);
  const first = from[0];
  return {
    id: r.id,
    project: r.project,
    domain: r.domain,
    file: r.file,
    name: r.name,
    description: r.description,
    body: r.body,
    from,
    ...(first?.decisions ? { decisions: first.decisions } : {}),
    ...(first && "why" in first ? { why: first.why } : {}),
    ...(first?.confusedWith ? { confusedWith: first.confusedWith } : {}),
  };
}

const evidence = (e: EvidenceResource): Evidence => ({ implements: e.implements, verifies: e.verifies });

/* Placeholders for the figures, filled in once every doc is there to point at. */
const noExposure: Exposure = { percent: null, capabilities: 0, band: null, unacceptable: false };
const noAcross = (): RiskAcross<Gap> => ({ score: null, verdict: null, items: [], counts: { unacceptable: 0, tolerable: 0, acceptable: 0 } });
const noReadiness = (): Readiness => ({
  percent: null,
  band: null,
  maturity: null,
  exposure: noExposure,
  levels: [],
  gaps: noAcross(),
  ready: [],
  notReady: [],
  notStarted: [],
});
const noRisk = (g: GapResource): Risk => ({
  impact: g.impact as Risk["impact"],
  likelihood: g.likelihood as Risk["likelihood"],
  reach: g.reach as Risk["reach"],
  score: 0,
  verdict: "acceptable",
  claim: false,
  on: [],
  capabilities: 0,
  spread: [],
});

/* Everything about the product showing, as the server serves it, read at once. */
async function readProduct(showing: Showing) {
  const [status, projects, rubric, domains, features, capabilities, rules, concepts, personas, initiatives, mechanisms, components, gaps, tradeoffs, problems] =
    await Promise.all([
      getStatus(showing),
      listProjects(showing),
      getRubric(showing),
      listDomains(showing),
      listFeatures(showing),
      listCapabilities(showing),
      listRules(showing),
      listConcepts(showing),
      listPersonas(showing),
      listInitiatives(showing),
      listMechanisms(showing),
      listComponents(showing),
      listGaps(showing),
      listTradeoffs(showing),
      listProblems(showing),
    ]);
  return {
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
  };
}

/* The product showing, read from the server and turned into what the pages hold. */
export const loadProduct = async (showing: Showing) => modelOf(await readProduct(showing), showing);

/* The product showing, from its resources. */
function modelOf(r: Awaited<ReturnType<typeof readProduct>>, showing: Showing): DocketState {
  const state: DocketState = {
    showing,
    projects: r.projects.map((p): Project => ({
      id: p.id,
      name: p.name,
      product: p.product,
      commit: p.commit,
      indexedAt: p.indexedAt,
      maturity: percent(p.maturity),
      band: band(p.maturity),
    })),
    domains: r.domains.map((d): Domain => ({
      ...doc(d),
      features: d.features,
      capabilities: d.capabilities,
      maturity: percent(d.maturity),
      band: band(d.maturity),
      readiness: noReadiness(),
      exposure: noExposure,
    })),
    features: r.features.map((f): Feature => ({
      ...doc(f),
      capabilities: f.capabilities,
      tradeoffs: f.tradeoffs,
      parts: f.parts.map((p) => ({ domain: p.domain, capabilities: p.capabilities, maturity: percent(p.maturity), band: band(p.maturity) })),
      maturity: percent(f.maturity),
      band: band(f.maturity),
      readiness: noReadiness(),
      exposure: noExposure,
    })),
    capabilities: r.capabilities.map((c): Capability => ({
      ...doc(c),
      personas: c.personas,
      initiatives: c.initiatives,
      stability: level(c.stability),
      levels: c.levels.map((l) => ({ project: l.project, domain: l.domain, level: level(l.level) })),
      feature: c.feature,
      rules: c.rules,
      concepts: c.concepts,
      gaps: c.gaps,
      tradeoffs: c.tradeoffs,
      builtBy: c.builtBy,
      evidence: evidence(c.evidence),
      readiness: noReadiness(),
      exposure: noExposure,
      risk: noAcross(),
      left: { decisions: [], gaps: [], technical: [] },
      ruleStandings: c.ruleStandings as Record<string, RuleStanding>,
      outcomes: {},
    })),
    rules: r.rules.map((x): Rule => ({
      ...doc(x),
      capabilities: x.capabilities,
      concepts: x.concepts,
      gaps: x.gaps,
      evidence: evidence(x.evidence),
      standings: x.standings as Record<string, RuleStanding>,
    })),
    concepts: r.concepts.map((x): Concept => ({ ...doc(x), capabilities: x.capabilities, rules: x.rules })),
    personas: r.personas.map((p): Persona => ({
      ...doc(p),
      role: p.role,
      title: p.title,
      image: p.image,
      capabilities: p.capabilities,
      features: p.features,
      initiatives: p.initiatives,
      maturity: percent(p.maturity),
      band: band(p.maturity),
      readiness: noReadiness(),
      exposure: noExposure,
    })),
    initiatives: r.initiatives.map((i): Initiative => ({
      ...doc(i),
      capabilities: i.capabilities,
      features: i.features,
      personas: i.personas,
      maturity: percent(i.maturity),
      band: band(i.maturity),
      readiness: noReadiness(),
      exposure: noExposure,
    })),
    mechanisms: r.mechanisms.map(technical),
    components: r.components.map(technical),
    gaps: r.gaps.map((g): Gap => ({
      id: g.id,
      project: g.project,
      ...(g.domain ? { domain: g.domain } : {}),
      affects: g.affects,
      impact: g.impact as Gap["impact"],
      likelihood: g.likelihood as Gap["likelihood"],
      reach: g.reach as Gap["reach"],
      name: g.name,
      description: g.description,
      places: g.places,
      risk: noRisk(g),
      affected: [],
      decisions: [],
    })),
    tradeoffs: r.tradeoffs.map((t): Tradeoff => ({
      id: t.id,
      project: t.project,
      ...(t.domain ? { domain: t.domain } : {}),
      affects: t.affects,
      name: t.name,
      description: t.description,
      benefit: t.benefit,
      drawback: t.drawback,
      places: t.places,
      affected: [],
      decisions: [],
    })),
    problems: r.problems.map((p) => ({
      type: p.type,
      subject: p.subject,
      capabilities: p.capabilities,
      message: p.message,
      ...(p.domain ? { domain: p.domain } : {}),
    })),
    rubric: r.rubric.qualities.length ? (r.rubric as Rubric) : null,
    status: { maturity: percent(r.status.maturity), band: band(r.status.maturity), readiness: noReadiness(), exposure: noExposure, risk: noAcross() },
  };

  /* Now every doc is there, find what each figure points at. Each resource and its doc are in the same order, so they're paired by place: gaps first, since every figure about them carries their risk. */
  const { risk, across, exposure, readiness, held, affected, outcome, gaps, technicals, some } = converters(state);
  r.gaps.forEach((x, i) => (state.gaps[i].risk = risk(x)));
  r.domains.forEach((x, i) => Object.assign(state.domains[i], { readiness: readiness(x.readiness), exposure: exposure(x.exposure) }));
  r.features.forEach((x, i) => Object.assign(state.features[i], { readiness: readiness(x.readiness), exposure: exposure(x.exposure) }));
  r.personas.forEach((x, i) => Object.assign(state.personas[i], { readiness: readiness(x.readiness), exposure: exposure(x.exposure) }));
  r.initiatives.forEach((x, i) => Object.assign(state.initiatives[i], { readiness: readiness(x.readiness), exposure: exposure(x.exposure) }));
  r.mechanisms.forEach((x, i) => (state.mechanisms[i].risk = across(x.risk)));
  r.components.forEach((x, i) => (state.components[i].risk = across(x.risk)));
  r.capabilities.forEach((x, i) =>
    Object.assign(state.capabilities[i], {
      readiness: readiness(x.readiness),
      exposure: exposure(x.exposure),
      risk: across(x.risk),
      left: {
        decisions: x.left.decisions.map(decision),
        gaps: some(gaps, x.left.gaps),
        technical: x.left.technical.flatMap((t) => {
          const gap = gaps.get(t.gap);
          const on = technicals.get(t.on);
          return gap && on ? [{ gap, on }] : [];
        }),
      },
      outcomes: Object.fromEntries(x.outcomes.map((o) => [o.outcome, outcome(o)])),
    }),
  );
  r.gaps.forEach((x, i) => Object.assign(state.gaps[i], { affected: x.affected.flatMap(affected), decisions: x.decisions.flatMap(held) }));
  r.tradeoffs.forEach((x, i) => Object.assign(state.tradeoffs[i], { affected: x.affected.flatMap(affected), decisions: x.decisions.flatMap(held) }));
  state.status = {
    maturity: percent(r.status.maturity),
    band: band(r.status.maturity),
    readiness: readiness(r.status.readiness),
    exposure: exposure(r.status.exposure),
    risk: across(r.status.risk),
  };
  return state;
}

/*
 * How the server's figures become the pages', given every doc showing, so
 * each figure's capabilities and gaps can be found among them.
 */
function converters(state: DocketState) {
  const byId = <T extends { id: string }>(list: T[]) => new Map(list.map((x) => [x.id, x]));
  const capabilities = byId(state.capabilities);
  const gaps = byId(state.gaps);
  const tradeoffs = byId(state.tradeoffs);
  const rules = byId(state.rules);
  const technicals = new Map([...state.mechanisms, ...state.components].map((t) => [`${t.kind}:${t.id}`, t]));
  const holders = new Map<string, DecisionHolder>([
    ...state.domains.map((d) => [`domain:${d.id}`, { kind: "domain", doc: d }] as const),
    ...state.features.map((d) => [`feature:${d.id}`, { kind: "feature", doc: d }] as const),
    ...state.capabilities.map((d) => [`capability:${d.id}`, { kind: "capability", doc: d }] as const),
    ...state.mechanisms.map((d) => [`mechanism:${d.id}`, { kind: "mechanism", doc: d }] as const),
    ...state.components.map((d) => [`component:${d.id}`, { kind: "component", doc: d }] as const),
  ]);
  const some = <T>(map: Map<string, T>, ids: string[]) => ids.flatMap((id) => map.get(id) ?? []);

  const riskOn = (o: RiskOnResource): RiskOn | null => {
    const capability = capabilities.get(o.capability);
    return capability ? { ...o, capability } : null;
  };
  const risk = (g: GapResource): Risk => ({
    impact: g.impact as Risk["impact"],
    likelihood: g.likelihood as Risk["likelihood"],
    reach: g.reach as Risk["reach"],
    score: g.risk.score,
    verdict: g.risk.verdict as Verdict,
    claim: g.risk.claim,
    on: g.risk.on.flatMap((o) => riskOn(o) ?? []),
    capabilities: g.risk.capabilities,
    spread: g.risk.spread,
  });
  const across = (a: RiskSummaryResource): RiskAcross<Gap> => ({
    score: a.score,
    verdict: a.verdict as Verdict | null,
    items: a.gaps.flatMap((s) => {
      const item = gaps.get(s.gap);
      if (!item) return [];
      const whole = item.risk;
      return [{ item, risk: whole, on: whole.on.find((o) => o.capability.id === s.capability) ?? null, score: s.score, verdict: s.verdict as Verdict }];
    }),
    counts: { unacceptable: a.counts.unacceptable ?? 0, tolerable: a.counts.tolerable ?? 0, acceptable: a.counts.acceptable ?? 0 },
  });
  const exposure = (e: ExposureResource): Exposure => ({
    percent: e.percent,
    capabilities: e.capabilities,
    band: RISK_BANDS.find((b) => b.id === e.band) ?? null,
    unacceptable: e.unacceptable,
  });
  const readiness = (x: ReadinessResource): Readiness => ({
    percent: x.percent,
    band: READINESS_BANDS.find((b) => b.name === x.band) ?? null,
    maturity: x.maturity,
    exposure: exposure(x.exposure),
    levels: x.levels.map(level),
    gaps: across(x.gaps),
    ready: some(capabilities, x.ready),
    notReady: x.notReady.flatMap((n) => {
      const capability = capabilities.get(n.capability);
      return capability ? [{ capability, belowBeta: n.belowBeta, gaps: some(gaps, n.gaps), decisions: n.decisions.map(decision) }] : [];
    }),
    notStarted: some(capabilities, x.notStarted),
  });
  const held = (d: HeldDecisionResource): HeldDecision[] => {
    const on = holders.get(d.on);
    return on ? [{ decision: decision(d), on }] : [];
  };
  const affected = (a: AffectedResource): Affected[] => {
    if (a.kind === "outcome") {
      const found = expectedOutcome(state.rubric, a.ref);
      return found ? [{ kind: "outcome", ...found }] : [];
    }
    if (a.kind === "rule") {
      const rule = rules.get(a.ref.slice("rule:".length));
      return rule ? [{ kind: "rule", rule }] : [];
    }
    if (a.kind === "gap") {
      const gap = gaps.get(a.ref);
      return gap ? [{ kind: "gap", gap }] : [];
    }
    const tradeoff = tradeoffs.get(a.ref);
    return tradeoff ? [{ kind: "tradeoff", tradeoff }] : [];
  };
  const outcome = (o: OutcomeStandingResource): OutcomeStanding => ({
    standing: o.standing as OutcomeStanding["standing"],
    gaps: some(gaps, o.gaps),
    tradeoffs: some(tradeoffs, o.tradeoffs),
    decisions: o.decisions.map(decision),
    by: some(technicals, o.by),
  });

  return { risk, across, exposure, readiness, held, affected, outcome, gaps, technicals, some };
}

function technical(t: TechnicalResource): TechnicalDoc {
  return {
    ...doc(t),
    kind: t.kind,
    applies: t.applies,
    capabilities: t.capabilities,
    meets: t.meets,
    gaps: t.gaps,
    tradeoffs: t.tradeoffs,
    evidence: evidence(t.evidence),
    risk: noAcross(),
  };
}

/*
 * The figures of the capabilities a for names, as the server works them out,
 * for a set no doc's own figures cover: those in a feature that serve a
 * persona, as `persona:<id>,feature:<id>`, or in one domain's part of a
 * feature, as `feature:<id>,domain:<id>`. With initiative, within that initiative instead
 * of what's showing. Null until they're read, and with no for.
 */
export function useStatusFor(state: DocketState, forRef: string | null, initiative?: string | null): Status | null {
  /* What was read, and what for, so a read for something else shows as null until its own arrives. */
  const [read, setRead] = useState<{ state: DocketState; forRef: string; initiative?: string | null; status: Status } | null>(null);
  useEffect(() => {
    if (!forRef) return;
    const showing = initiative === undefined ? state.showing : { ...state.showing, initiative };
    let current = true;
    getStatus(showing, forRef).then((r) => {
      if (!current) return;
      const { readiness, exposure, across } = converters(state);
      setRead({
        state,
        forRef,
        initiative,
        status: {
          maturity: r.maturity?.percent ?? null,
          band: (r.maturity?.band ?? null) as Level | null,
          readiness: readiness(r.readiness),
          exposure: exposure(r.exposure),
          risk: across(r.risk),
        },
      });
    });
    return () => {
      current = false;
    };
  }, [state, forRef, initiative]);
  return read && read.state === state && read.forRef === forRef && read.initiative === initiative ? read.status : null;
}

/* A gap among the capabilities a for names: what it puts at stake there, and where it scores highest. */
export type GapWithin = { gap: Gap; score: number; verdict: Verdict; on: RiskOn | null };

/*
 * The gaps that show on the capabilities a for names, riskiest there first,
 * each scored there, as the server works them out: what's left for a persona,
 * a project or any other doc. Null until they're read, and with no for.
 */
export function useGapsFor(state: DocketState, forRef: string | null): GapWithin[] | null {
  /* What was read, and what for, so a read for something else shows as null until its own arrives. */
  const [read, setRead] = useState<{ state: DocketState; forRef: string; gaps: GapWithin[] } | null>(null);
  useEffect(() => {
    if (!forRef) return;
    let current = true;
    listGaps(state.showing, { for: forRef, sort: "risk" }).then((list) => {
      if (!current) return;
      const byId = new Map(state.gaps.map((g) => [g.id, g]));
      setRead({
        state,
        forRef,
        gaps: list.flatMap((r) => {
          const gap = byId.get(r.id);
          const w = r.within;
          if (!gap || !w) return [];
          return [{ gap, score: w.score, verdict: w.verdict as Verdict, on: gap.risk.on.find((o) => o.capability.id === w.capability) ?? null }];
        }),
      });
    });
    return () => {
      current = false;
    };
  }, [state, forRef]);
  return read && read.state === state && read.forRef === forRef ? read.gaps : null;
}

/*
 * Some of the server's scored gaps, as one: riskiest first, the highest score
 * of them and its verdict, and how many fall in each verdict. It works out no
 * score, only keeps, orders and counts the server's, for a view that shows
 * some of a figure's gaps, such as a persona's own without what their
 * capabilities are built on.
 */
export function summed(items: RiskAcross<Gap>["items"]): RiskAcross<Gap> {
  const top = items[0];
  const counts = { unacceptable: 0, tolerable: 0, acceptable: 0 };
  for (const i of items) counts[i.verdict]++;
  return { score: top?.score ?? null, verdict: top?.verdict ?? null, items, counts };
}

/* The gaps of a figure that keep passes, scored as the figure scored them. */
export const someOf = (across: RiskAcross<Gap>, keep: (gap: Gap) => boolean): RiskAcross<Gap> => summed(across.items.filter((i) => keep(i.item)));

/* Some gaps, each scored anywhere it shows, as the server scored it: those a concept's rules don't hold for yet. */
export const gapsAcross = (gaps: Gap[]): RiskAcross<Gap> =>
  summed(
    gaps.map((g) => ({ item: g, risk: g.risk, on: g.risk.on[0] ?? null, score: g.risk.score, verdict: g.risk.verdict })).sort((a, b) => b.score - a.score),
  );
