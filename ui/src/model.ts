/*
 * The product showing, as the pages hold it: the server's resources, turned
 * into the docs and figures the pages read (see state.ts). Links stay IDs,
 * and each figure's capabilities and gaps are found among the docs, so a page
 * can follow them. Nothing here works out a figure: each is the server's.
 */

import { useEffect, useEffectEvent, useState } from "react";
import { listCapabilities, type OutcomeStandingResource } from "./services/docqet/capabilities";
import { isAbort, type Showing } from "./services/docqet/client";
import { listComponents } from "./services/docqet/components";
import { listDecisions } from "./services/docqet/decisions";
import { listConcepts } from "./services/docqet/concepts";
import { listAreas } from "./services/docqet/areas";
import { listFeatures } from "./services/docqet/features";
import { listGaps, type GapResource, type RiskOnResource } from "./services/docqet/gaps";
import { listInitiatives } from "./services/docqet/initiatives";
import { listMechanisms } from "./services/docqet/mechanisms";
import { listPersonas } from "./services/docqet/personas";
import { listProblems } from "./services/docqet/problems";
import { listConstraints } from "./services/docqet/constraints";
import { listFindings } from "./services/docqet/findings";
import { listProjects } from "./services/docqet/projects";
import { getRubric } from "./services/docqet/rubric";
import { listRules } from "./services/docqet/rules";
import type {
  AffectedResource,
  ContributionResource,
  DecisionResource,
  DocResource,
  EvidenceResource,
  ExposureResource,
  HeldDecisionResource,
  PartResource,
  ImprovementResource,
  MaturityResource,
  ReadinessResource,
  RiskSummaryResource,
  TechnicalResource,
} from "./services/docqet/shared";
import { getStatus } from "./services/docqet/status";
import { listTradeoffs } from "./services/docqet/tradeoffs";
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
  type DocqetState,
  type Area,
  type Evidence,
  type Exposure,
  type Feature,
  type Gap,
  type HeldDecision,
  type Impact,
  type Part,
  type Improvement,
  type Initiative,
  type Level,
  type Likelihood,
  type OutcomeStanding,
  type Persona,
  type Problem,
  type Constraint,
  type Project,
  type Reach,
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
  openDecisions,
} from "./state";

const level = (l: string): CapabilityLevel => (l === "draft" ? null : (l as Level));
const percent = (m: MaturityResource) => m?.percent ?? null;
const band = (m: MaturityResource) => (m ? (m.band as Level) : null);

/* An open decision, with its ratings; its risk is found once every capability is there to point at. */
const decision = (d: DecisionResource): Decision => ({
  topic: d.topic,
  question: d.question,
  affects: d.affects,
  impact: (d.impact ?? null) as Impact | null,
  likelihood: (d.likelihood ?? null) as Likelihood | null,
  reach: (d.reach ?? null) as Reach | null,
  risk: null,
});

const contribution = (c: ContributionResource): Contribution => ({
  project: c.project,
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
  started: 0,
  notStarted: [],
  improvements: [],
  parts: [],
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
async function readProduct(showing: Showing, signal?: AbortSignal) {
  const [
    status,
    projects,
    rubric,
    areas,
    features,
    capabilities,
    rules,
    concepts,
    personas,
    problems,
    constraints,
    initiatives,
    mechanisms,
    components,
    gaps,
    tradeoffs,
    decisions,
    findings,
  ] = await Promise.all([
    getStatus(showing, undefined, signal),
    listProjects(showing, signal),
    getRubric(showing, signal),
    listAreas(showing, signal),
    listFeatures(showing, signal),
    listCapabilities(showing, signal),
    listRules(showing, signal),
    listConcepts(showing, signal),
    listPersonas(showing, signal),
    listProblems(showing, signal),
    listConstraints(showing, signal),
    listInitiatives(showing, signal),
    listMechanisms(showing, signal),
    listComponents(showing, signal),
    listGaps(showing, {}, signal),
    listTradeoffs(showing, signal),
    listDecisions(showing, signal),
    listFindings(showing, signal),
  ]);
  return {
    status,
    projects,
    rubric,
    areas,
    features,
    capabilities,
    rules,
    concepts,
    personas,
    problems,
    constraints,
    initiatives,
    mechanisms,
    components,
    gaps,
    tradeoffs,
    decisions,
    findings,
  };
}

/* The product showing, read from the server and turned into what the pages hold. */
export const loadProduct = async (showing: Showing, signal?: AbortSignal) => modelOf(await readProduct(showing, signal), showing);

/* The product showing, from its resources. */
function modelOf(r: Awaited<ReturnType<typeof readProduct>>, showing: Showing): DocqetState {
  const state: DocqetState = {
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
    areas: r.areas.map((a): Area => ({
      ...doc(a),
      features: a.features,
      capabilities: a.capabilities,
      maturity: percent(a.maturity),
      band: band(a.maturity),
      readiness: noReadiness(),
      exposure: noExposure,
    })),
    features: r.features.map((f): Feature => ({
      ...doc(f),
      area: f.area,
      capabilities: f.capabilities,
      tradeoffs: f.tradeoffs,
      maturity: percent(f.maturity),
      band: band(f.maturity),
      readiness: noReadiness(),
      exposure: noExposure,
    })),
    capabilities: r.capabilities.map((c): Capability => ({
      ...doc(c),
      solves: c.solves,
      personas: c.personas,
      initiatives: c.initiatives,
      stability: level(c.stability),
      levels: c.levels.map((l) => ({ project: l.project, level: level(l.level) })),
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
      open: { decisions: [], gaps: [], technical: [] },
      ruleStandings: c.ruleStandings as Record<string, RuleStanding>,
      outcomes: {},
    })),
    rules: r.rules.map((x): Rule => ({
      ...doc(x),
      capabilities: x.capabilities,
      concepts: x.concepts,
      respects: x.respects,
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
      problems: p.problems,
      capabilities: p.capabilities,
      features: p.features,
      initiatives: p.initiatives,
      maturity: percent(p.maturity),
      band: band(p.maturity),
      readiness: noReadiness(),
      exposure: noExposure,
    })),
    problems: r.problems.map((p): Problem => ({
      ...doc(p),
      cost: p.cost,
      personas: p.personas,
      capabilities: p.capabilities,
      maturity: percent(p.maturity),
      band: band(p.maturity),
      readiness: noReadiness(),
      exposure: noExposure,
    })),
    constraints: r.constraints.map((c): Constraint => ({
      ...doc(c),
      source: c.source,
      rules: c.rules,
      mechanisms: c.mechanisms,
      capabilities: c.capabilities,
      maturity: percent(c.maturity),
      band: band(c.maturity),
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
      affects: t.affects,
      name: t.name,
      description: t.description,
      benefit: t.benefit,
      drawback: t.drawback,
      places: t.places,
      affected: [],
      decisions: [],
    })),
    findings: r.findings.map((p) => ({
      type: p.type,
      subject: p.subject,
      capabilities: p.capabilities,
      message: p.message,
      advisory: p.advisory,
    })),
    rubric: r.rubric.qualities.length ? (r.rubric as Rubric) : null,
    status: { maturity: percent(r.status.maturity), band: band(r.status.maturity), readiness: noReadiness(), exposure: noExposure, risk: noAcross() },
  };

  /* Now every doc is there, find what each figure points at. Each resource and its doc are in the same order, so they're paired by place: gaps first, since every figure about them carries their risk. */
  const { risk, decisionRisk, across, exposure, readiness, held, affected, outcome, gaps, technicals, some } = converters(state);
  r.gaps.forEach((x, i) => (state.gaps[i].risk = risk(x)));
  /* Each rated decision's risk, on the decision its doc holds, matched by what it asks: decisions have no IDs. */
  for (const d of r.decisions) {
    const found = held(d)[0];
    if (found) found.decision.risk = decisionRisk(d);
  }
  r.areas.forEach((x, i) => Object.assign(state.areas[i], { readiness: readiness(x.readiness), exposure: exposure(x.exposure) }));
  r.features.forEach((x, i) => Object.assign(state.features[i], { readiness: readiness(x.readiness), exposure: exposure(x.exposure) }));
  r.personas.forEach((x, i) => Object.assign(state.personas[i], { readiness: readiness(x.readiness), exposure: exposure(x.exposure) }));
  r.problems.forEach((x, i) => Object.assign(state.problems[i], { readiness: readiness(x.readiness), exposure: exposure(x.exposure) }));
  r.constraints.forEach((x, i) => Object.assign(state.constraints[i], { readiness: readiness(x.readiness), exposure: exposure(x.exposure) }));
  r.initiatives.forEach((x, i) => Object.assign(state.initiatives[i], { readiness: readiness(x.readiness), exposure: exposure(x.exposure) }));
  r.mechanisms.forEach((x, i) => (state.mechanisms[i].risk = across(x.risk)));
  r.components.forEach((x, i) => (state.components[i].risk = across(x.risk)));
  r.capabilities.forEach((x, i) =>
    Object.assign(state.capabilities[i], {
      readiness: readiness(x.readiness),
      exposure: exposure(x.exposure),
      risk: across(x.risk),
      open: {
        decisions: x.open.decisions.map(decision),
        gaps: some(gaps, x.open.gaps),
        technical: x.open.technical.flatMap((t) => {
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
function converters(state: DocqetState) {
  const byId = <T extends { id: string }>(list: T[]) => new Map(list.map((x) => [x.id, x]));
  const capabilities = byId(state.capabilities);
  const gaps = byId(state.gaps);
  const features = byId(state.features);
  const areas = byId(state.areas);
  const tradeoffs = byId(state.tradeoffs);
  const rules = byId(state.rules);
  const technicals = new Map([...state.mechanisms, ...state.components].map((t) => [`${t.kind}:${t.id}`, t]));
  const holders = new Map<string, DecisionHolder>([
    ...state.areas.map((d) => [`area:${d.id}`, { kind: "area", doc: d }] as const),
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
  /* A rated decision's risk, read as a gap's is, about what its answer could change; null when it isn't rated. */
  const decisionRisk = (d: HeldDecisionResource): Risk | null =>
    d.risk && d.impact && d.likelihood && d.reach
      ? {
          impact: d.impact as Impact,
          likelihood: d.likelihood as Likelihood,
          reach: d.reach as Reach,
          score: d.risk.score,
          verdict: d.risk.verdict as Verdict,
          claim: d.risk.claim,
          on: d.risk.on.flatMap((o) => riskOn(o) ?? []),
          capabilities: d.risk.capabilities,
          spread: d.risk.spread,
        }
      : null;
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
    started: x.started,
    notStarted: some(capabilities, x.notStarted),
    improvements: x.improvements.flatMap(improvement),
    parts: x.parts.flatMap(part),
  });
  /* An open decision with the doc it's on: the very decision that doc holds, so its risk, once found, is the same one everywhere. */
  const held = (d: HeldDecisionResource): HeldDecision[] => {
    const on = holders.get(d.on);
    if (!on) return [];
    const same = openDecisions(on.doc).find((x) => x.question === d.question && x.topic === d.topic);
    return [{ decision: same ?? decision(d), on }];
  };
  const improvement = (x: ImprovementResource): Improvement[] => {
    const capability = x.capability ? (capabilities.get(x.capability) ?? null) : null;
    const gap = x.gap ? (gaps.get(x.gap) ?? null) : null;
    const decided = x.decision ? (held(x.decision)[0] ?? null) : null;
    const feature = x.feature ? (features.get(x.feature) ?? null) : null;
    const area = x.area ? (areas.get(x.area) ?? null) : null;
    if (
      (x.kind === "promote" && !capability) ||
      (x.kind === "promote-feature" && !feature) ||
      (x.kind === "promote-area" && !area) ||
      (x.kind === "close" && !gap) ||
      (x.kind === "answer" && !decided)
    )
      return [];
    return [
      {
        kind: x.kind,
        capability,
        from: x.from ? level(x.from) : null,
        to: x.to ? level(x.to) : null,
        feature,
        area,
        gap,
        decision: decided,
        capabilities: some(capabilities, x.capabilities),
        readiness: x.readiness,
        maturity: x.maturity,
        exposure: x.exposure,
        gain: x.gain,
        band: READINESS_BANDS.find((b) => b.name === x.band) ?? null,
      },
    ];
  };
  /* A part, left out when what it is isn't showing. */
  const part = (x: PartResource): Part[] => {
    const area = x.area ? (areas.get(x.area) ?? null) : null;
    const feature = x.feature ? (features.get(x.feature) ?? null) : null;
    const capability = x.capability ? (capabilities.get(x.capability) ?? null) : null;
    const next = x.next ? (improvement(x.next)[0] ?? null) : null;
    if ((x.kind === "area" && !area) || (x.kind === "feature" && !feature) || (x.kind === "capability" && !capability)) return [];
    if ((x.kind === "gap" || x.kind === "decision" || x.kind === "promotion") && !next) return [];
    return [{ kind: x.kind, area, feature, capability, capabilities: some(capabilities, x.capabilities), potential: x.potential, next }];
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

  return { risk, decisionRisk, across, exposure, readiness, held, affected, outcome, gaps, technicals, some };
}

function technical(t: TechnicalResource): TechnicalDoc {
  return {
    ...doc(t),
    kind: t.kind,
    applies: t.applies,
    respects: t.respects,
    capabilities: t.capabilities,
    meets: t.meets,
    gaps: t.gaps,
    tradeoffs: t.tradeoffs,
    evidence: evidence(t.evidence),
    risk: noAcross(),
  };
}

/*
 * A read from the server, as a view shows it: what was read (null until it
 * arrives, and after a failure), whether it's on its way, whether it failed,
 * and a way to try again. `previous` is the last answer for any key, for a
 * view that keeps what's on screen while the next arrives.
 */
export type Read<T> = { data: T | null; previous: T | null; loading: boolean; error: boolean; retry: () => void };

const ids = new WeakMap<object, number>();
let lastId = 0;
/* A number for an object, the same each time, so a read's key can say which product it was for. */
export function idOf(o: object): number {
  if (!ids.has(o)) ids.set(o, ++lastId);
  return ids.get(o)!;
}

/*
 * Read with `read` whenever `key` names something, again whenever the key
 * changes, and again on retry. The read before is cancelled, and only an
 * answer for the current key and attempt shows, so a slow answer for an old
 * key never replaces a newer one. With no key, nothing is read.
 */
export function useRead<T>(key: string | null, read: (signal: AbortSignal) => Promise<T>): Read<T> {
  const [attempt, setAttempt] = useState(0);
  const [got, setGot] = useState<{ key: string; attempt: number; data: T | null } | null>(null);
  const [previous, setPrevious] = useState<T | null>(null);
  const run = useEffectEvent(read);
  useEffect(() => {
    if (key === null) return;
    const controller = new AbortController();
    run(controller.signal).then(
      (data) => {
        setGot({ key, attempt, data });
        setPrevious(data);
      },
      (e: unknown) => {
        if (!isAbort(e)) setGot({ key, attempt, data: null });
      },
    );
    return () => controller.abort();
  }, [key, attempt]);
  const mine = got && got.key === key && got.attempt === attempt ? got : null;
  return {
    data: mine?.data ?? null,
    previous,
    loading: key !== null && !mine,
    error: mine !== null && mine.data === null,
    retry: () => setAttempt((a) => a + 1),
  };
}

/*
 * The figures of the capabilities a for names, as the server works them out,
 * for a set no doc's own figures cover: those in a feature that serve a
 * persona, as `persona:<id>,feature:<id>`. With initiative, within that
 * initiative instead of what's showing. With no for, nothing is read.
 */
export function useStatusFor(state: DocqetState, forRef: string | null, initiative?: string | null): Read<Status> {
  return useRead(forRef ? `${idOf(state)}|${forRef}|${initiative ?? ""}` : null, async (signal) => {
    const showing = initiative === undefined ? state.showing : { ...state.showing, initiative };
    const r = await getStatus(showing, forRef!, signal);
    const { readiness, exposure, across } = converters(state);
    return {
      maturity: r.maturity?.percent ?? null,
      band: (r.maturity?.band ?? null) as Level | null,
      readiness: readiness(r.readiness),
      exposure: exposure(r.exposure),
      risk: across(r.risk),
    };
  });
}

/* A gap among the capabilities a for names: what it puts at stake there, and where it scores highest. */
export type GapWithin = { gap: Gap; score: number; verdict: Verdict; on: RiskOn | null };

/*
 * The gaps that show on the capabilities a for names, riskiest there first,
 * each scored there, as the server works them out: what's open for a persona,
 * a project or any other doc. With no for, nothing is read.
 */
export function useGapsFor(state: DocqetState, forRef: string | null): Read<GapWithin[]> {
  return useRead(forRef ? `${idOf(state)}|${forRef}` : null, async (signal) => {
    const list = await listGaps(state.showing, { for: forRef!, sort: "risk" }, signal);
    const byId = new Map(state.gaps.map((g) => [g.id, g]));
    return list.flatMap((r) => {
      const gap = byId.get(r.id);
      const w = r.within;
      if (!gap || !w) return [];
      return [{ gap, score: w.score, verdict: w.verdict as Verdict, on: gap.risk.on.find((o) => o.capability.id === w.capability) ?? null }];
    });
  });
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
