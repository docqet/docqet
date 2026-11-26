import { Fragment, useEffect, useRef, type ReactNode } from "react";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { StabilityRubric } from "./Rubric";
import { ConceptChips, ConceptIcon, related } from "./Concepts";
import { DecisionList, Facets, facets } from "./Fields";
import { Body, Excerpt, MORE_ABOUT } from "./design/markdown/Markdown";
import { MaturityRing } from "./design/maturity/MaturityRing";
import { STABILITY } from "./design/stability/stability";
import { StabilityMark } from "./design/stability/StabilityMark";
import { StabilitySpread } from "./design/stability/StabilitySpread";
import { LeftLabel } from "./design/left/LeftMark";
import { Term } from "./design/term/Term";
import { CapabilityStability } from "./design/catalog/CapabilityLabel";
import { StandingMark } from "./design/standing/StandingMark";
import {
  TECHNICAL_NAMES,
  TechnicalLink,
  TechnicalRows,
  LeftSummary,
  NAMES,
  PersonaRows,
  RULE_STANDING_LABELS,
  Places,
  rubricCounts,
  levelName,
  plural,
  type ExploreKind,
  Maturity,
  leftOf,
} from "./Explore";
import { DomainIcon } from "./FeatureMap";
import { PersonaAvatar, personaNameAndRole } from "./Personas";
import { ReadinessMark, StillNeeds, needsLine } from "./Readiness";
import { ProjectIcon } from "./ProductFilter";
import { InitiativeIcon } from "./ScopeFilter";
import { InitiativeTags, initiativesOf } from "./Initiatives";
import {
  bareId,
  builtOn,
  byFeature,
  expectedOutcome,
  contradictionsOf,
  docDomains,
  domainName,
  gapsById,
  inRiskOrder,
  openDecisions,
  domainCapabilities,
  startedOf,
  type Readiness,
  pageHref,
  featureConcepts,
  find,
  tradeoffsById,
  leftCount,
  nextLevel,
  partOf,
  pickList,
  projectName,
  type Capability,
  type CapabilityLevel,
  type Concept,
  type Contribution,
  type Doc,
  type DocketState,
  type Domain,
  type Gap,
  type RiskAcross,
  type TechnicalDoc,
  type TechnicalKind,
  type Feature,
  type PageAt,
  levelInDomain,
  type Persona,
  type Initiative,
  capabilitiesById,
  type Pick,
  type Rule,
} from "./state";
import { someOf, useStatusFor } from "./model";
import { Tip } from "./design/Tip";
import { GapRows, LeftFigure } from "./GapRows";
import { ExposureStat, MaturityStat } from "./pages/indexParts";
import { TradeoffRows } from "./TradeoffRows";
import { docHref, navigate, sectionHref, withParam, type Route } from "./routes";
import { Empty, PageHeader, Section, Stat, Tabs, View, currentTab, type TabDef } from "./shell/layout";
import "./page.css";

/*
 * Everything about one doc, on a page of its own: a header that says what it
 * is and where it stands, in a sentence and a strip of figures, then tabs,
 * each answering one question about it, such as what's left or how it's
 * built. Summary first: each figure links to the tab that lists what it
 * counts. The tab is in the address, as `&tab=left`, so it can be linked to.
 */
export default function DetailPage({ state, page, route }: { state: DocketState; page: PageAt; route: Route }) {
  const onGo = (pick: PageAt) => navigate(pageHref(pick));
  const doc: Doc | undefined =
    page.kind === "gaps"
      ? undefined
      : page.kind === "mechanism" || page.kind === "component"
        ? find(page.kind === "mechanism" ? state.mechanisms : state.components, page.id)
        : page.kind === "initiative"
          ? find(state.initiatives, page.id)
          : find(pickList(state, page.kind), page.id);

  const links: Go = {
    state,
    onOpen: (kind, id) => {
      if (id) onGo({ kind, id });
    },
    onConcept: (id) => onGo({ kind: "concept", id }),
    onPick: onGo,
  };

  if (!doc)
    return (
      <View title="Not found">
        <PageHeader
          title="Nothing by that name"
          lede={`No ${page.kind} called “${page.id}” is in the projects showing. It may have been renamed, or be in a project that isn't showing.`}
        />
      </View>
    );
  const props = { ...links, route };
  switch (page.kind) {
    case "capability":
      return <CapabilityPage capability={doc as Capability} {...props} />;
    case "feature":
      return <FeaturePage feature={doc as Feature} {...props} />;
    case "domain":
      return <DomainPage domain={doc as Domain} {...props} />;
    case "persona":
      return <PersonaPage persona={doc as Persona} {...props} />;
    case "initiative":
      return <InitiativePage initiative={doc as Initiative} {...props} />;
    case "mechanism":
    case "component":
      return <TechnicalPage doc={doc as TechnicalDoc} {...props} />;
    default:
      return <ConceptPage concept={doc as Concept} {...props} />;
  }
}

type Go = {
  state: DocketState;
  onOpen: (kind: ExploreKind, id: string | null) => void;
  onConcept: (id: string) => void;
  onPick: (pick: Pick) => void;
};

type PageProps = Go & { route: Route };

/* ——— Layout ——— */

const KIND_NAMES: Record<Pick["kind"] | TechnicalKind | "initiative", { one: string; icon: ReactNode }> = {
  ...NAMES,
  concept: { one: "Concept", icon: <ConceptIcon size={18} /> },
  initiative: { one: "Initiative", icon: <InitiativeIcon size={18} /> },
  ...TECHNICAL_NAMES,
};

/* A tab's address on this page. */
const tabHref = (tab: string) => withParam("tab", tab);

/*
 * A doc's page: its view, which lands at its top when it opens and whenever
 * its tab changes, or at the section its address names, such as #rubric.
 */
function DocView({ title, route, children }: { title: string; route: Route; children: ReactNode }) {
  const top = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const section = window.location.hash.slice(1);
    const at = section ? document.getElementById(section) : null;
    if (at) at.scrollIntoView();
    else top.current?.closest(".view")?.scrollTo({ top: 0 });
  }, [route.tab]);
  return (
    <View title={title}>
      <div ref={top}>{children}</div>
    </View>
  );
}

/*
 * The top of a doc's page: where it is, as a trail of links, its kind, name
 * and the mark beside it, what it is in a sentence, its figures, and any
 * contradictions. Where several sources say what it is, each says so on its
 * first tab, so there's no one sentence here.
 */
function DocHeader({
  state,
  kind,
  doc,
  title = doc.name,
  kindNote,
  trail,
  initiatives = [],
  marks,
  stats,
}: {
  state: DocketState;
  kind: Pick["kind"] | TechnicalKind | "initiative";
  doc: Doc;
  title?: ReactNode;
  kindNote?: ReactNode;
  trail?: ReactNode;
  /* The initiatives it's part of, its own or its capabilities', as tags at the end of the trail. */
  initiatives?: string[];
  marks?: ReactNode;
  stats: ReactNode;
}) {
  const problems = contradictionsOf(state, kind, doc.id);
  const single = doc.from.length === 1;
  const project = single && state.projects.length > 1 ? projectName(state, doc.from[0].project) : null;
  return (
    <>
      <PageHeader
        trail={
          trail || project || initiatives.length ? (
            <>
              {trail}
              {trail && project ? <span className="faint">·</span> : null}
              {project ? (
                <span className="page-crumb">
                  <ProjectIcon size={14} />
                  {project}
                </span>
              ) : null}
              <InitiativeTags state={state} ids={initiatives} />
            </>
          ) : undefined
        }
        kind={
          <>
            {KIND_NAMES[kind].icon}
            <Term id={kind}>{KIND_NAMES[kind].one}</Term>
            {kindNote ? <span className="page-kind-note">· {kindNote}</span> : null}
          </>
        }
        title={title}
        marks={marks}
        lede={single && doc.description ? doc.description : undefined}
        stats={stats}
      />
      {problems.map((p) => (
        <p key={p.message} className="explore-problem page-problem">
          <WarningAmberRoundedIcon sx={{ fontSize: 17, flex: "none" }} />
          {p.message}
        </p>
      ))}
    </>
  );
}

/* A domain in a trail, as a link to its page. */
function DomainCrumb({ state, id }: { state: DocketState; id: string }) {
  return (
    <a className="page-crumb" href={docHref("domain", id)}>
      <DomainIcon size={14} />
      {domainName(state, id)}
    </a>
  );
}

/* The domains something spans, as links. */
function DomainTrail({ state, domains }: { state: DocketState; domains: string[] }) {
  if (!domains.length) return <span>In no domain</span>;
  return (
    <>
      {domains.map((id, i) => (
        <Fragment key={id}>
          {i ? <span className="faint">+</span> : null}
          <DomainCrumb state={state} id={id} />
        </Fragment>
      ))}
    </>
  );
}

/* A capability as a link to its page, with its level. */
function CapabilityLink({ capability, tab }: { capability: Capability; tab?: string }) {
  return (
    <span className="page-crumb">
      <a className="page-crumb" href={docHref("capability", capability.id, tab)}>
        {NAMES.capability.icon}
        {capability.name}
      </a>
      <CapabilityStability level={capability.stability} name={capability.name} focusable={false} />
    </span>
  );
}

/* ——— What it is ——— */

/* Above what a source says, where several define it: the domain, where they differ, and the project it's from. */
function SourceFrom({ state, doc, from }: { state: DocketState; doc: Doc; from: Contribution }) {
  return (
    <div className="page-source-from">
      {doc.from.some((o) => o.domain !== from.domain) ? (
        <span className="explore-crumb">
          <DomainIcon size={14} />
          {domainName(state, from.domain)}
        </span>
      ) : null}
      <span className="explore-crumb">
        <ProjectIcon size={14} />
        {projectName(state, from.project)}
      </span>
    </div>
  );
}

/*
 * What a doc is, beyond its name and description: its fields, by its type, as
 * cards side by side. Where several sources define it, each gets a column,
 * headed by where it's from, with its own description, so they can be
 * compared. Nothing when no source has any.
 */
function Sources({ kind, doc, title, aside, ...go }: Go & { kind: string; doc: Doc; title: ReactNode; aside?: ReactNode }) {
  const { state } = go;
  const several = doc.from.length > 1;
  const fielded = doc.from.filter((f) => facets(kind, f, go).length || (several && f.description));
  if (!fielded.length) return null;
  return (
    <Section title={title} aside={aside}>
      {several ? (
        <div className="page-sources">
          {fielded.map((f, i) => (
            <div key={i} className="page-source">
              <SourceFrom state={state} doc={doc} from={f} />
              {f.description ? <p className="page-source-summary">{f.description}</p> : null}
              <Facets items={facets(kind, f, go)} />
            </div>
          ))}
        </div>
      ) : (
        <Facets items={facets(kind, fielded[0], go)} />
      )}
    </Section>
  );
}

const hasBody = (doc: Doc) => doc.from.some((f) => f.body.trim());

/* On a tab of its own, a body is shown nearly whole: only a very long one is cut short. */
const BODY_LIMIT = 2400;

/* A doc's body, as written, or each source's, side by side, where several wrote one. */
function Bodies({ doc, ...go }: Go & { doc: Doc }) {
  const written = doc.from.filter((f) => f.body.trim());
  if (!written.length) return null;
  if (written.length === 1)
    return (
      <div className="page-about">
        <Body from={written[0]} go={go} limit={BODY_LIMIT} />
      </div>
    );
  return (
    <div className="page-sources">
      {written.map((f, i) => (
        <div key={i} className="page-source">
          <SourceFrom state={go.state} doc={doc} from={f} />
          <Body from={f} go={go} limit={BODY_LIMIT} />
        </div>
      ))}
    </div>
  );
}

/* ——— Status ——— */

/*
 * A capability's level. In a list, just its mark, whose popover says what
 * the level means; with `named`, its name too, inside the mark so hovering
 * either opens it. A draft is the word Draft, which has no mark.
 */
function LevelName({ level, name, named = false }: { level: CapabilityLevel; name: string; named?: boolean }) {
  if (!level || !named) return <CapabilityStability level={level} name={name} />;
  return <StabilityMark level={level} feature={name} size="long" />;
}

/* The levels of a feature's capabilities in one domain, at their levels there. */
const partLevels = (state: DocketState, ids: string[], domain: string) =>
  ids.flatMap((id) => find(state.capabilities, id) ?? []).map((c) => levelInDomain(c, domain));

const MAX_AVATARS = 6;

function Avatars({ personas }: { personas: Persona[] }) {
  const more = personas.length - MAX_AVATARS;
  return (
    <span className="page-avatars">
      {personas.slice(0, MAX_AVATARS).map((p) => (
        <Tip key={p.id} title={personaNameAndRole(p).name}>
          <span>
            <PersonaAvatar persona={p} size={26} />
          </span>
        </Tip>
      ))}
      {more > 0 ? <span className="page-avatars-more">+{more}</span> : null}
    </span>
  );
}

/* ——— Readiness ——— */

/* How ready it is, as a figure in the header, as its pie, linking to what it still needs on its first tab. `of` heads its popover. */
function ReadinessStat({ readiness, tab, of }: { readiness: Readiness; tab: string; of: string }) {
  const note = [
    ...(readiness.notReady.length ? [`${readiness.notReady.length} with something left`] : []),
    ...(readiness.notStarted.length ? [`${readiness.notStarted.length} not started`] : []),
  ].join(" · ");
  return (
    <Stat
      label="Readiness"
      term="readiness"
      value={readiness.percent === null ? "Nothing started" : <ReadinessMark readiness={readiness} of={of} inButton />}
      note={note || (readiness.percent === null ? "Drafts don't count" : "Nothing left on any capability")}
      href={`${tabHref(tab)}#still-needs`}
    />
  );
}

/* What it still needs before people can use it, as a section of its first tab. */
function StillNeedsSection({ readiness, readyText }: { readiness: Readiness; readyText: string }) {
  return (
    <Section id="still-needs" title="What it still needs" term="readiness" note="What would make it more ready: each capability with something left, and what.">
      <StillNeeds readiness={readiness} readyText={readyText} />
    </Section>
  );
}

/*
 * The readiness of the capabilities `forRef` names, as the server works it
 * out, within `initiative` when given: nothing while it's read, and with
 * `started`, nothing unless something in them is started.
 */
function ReadinessFor({
  state,
  forRef,
  initiative,
  of,
  started = false,
}: {
  state: DocketState;
  forRef: string;
  initiative?: string;
  of: string;
  started?: boolean;
}) {
  const status = useStatusFor(state, forRef, initiative);
  if (!status || (started && !startedOf(status.readiness))) return null;
  return <ReadinessMark readiness={status.readiness} of={of} />;
}

/* ——— What's left ——— */

/* Something that holds open decisions, with what it is. */
type Holder = { kind: "domain" | "feature" | "capability" | "mechanism" | "component"; doc: Doc };

/* A gap, and for a technical one under a capability, the mechanism or component it's on. */
type LeftGap = { gap: Gap; on?: TechnicalDoc };

/* What's left about something: what holds open decisions, how many, and its gaps, each once, riskiest first. */
type LeftHere = { holders: Holder[]; decisions: number; gaps: LeftGap[]; risk: RiskAcross<Gap> };

/*
 * What's left across some capabilities, with the open decisions of `own`,
 * the feature or domain they're under, first. A technical gap on what several
 * of them are built on is one gap, so it counts once. With `technical` false,
 * as for a persona, only what someone using the product would notice. Its
 * risk is from `readiness`, theirs, whose gaps are every gap on them, each
 * scored on them.
 */
function leftAcross(capabilities: Capability[], readiness: Readiness, own?: Holder, technical = true): LeftHere {
  const holders = [...(own ? [own] : []), ...capabilities.map((doc): Holder => ({ kind: "capability", doc }))].filter((h) => openDecisions(h.doc).length);
  const gaps = new Map<string, LeftGap>();
  for (const c of capabilities) {
    for (const gap of c.left.gaps) gaps.set(gap.id, { gap });
    if (technical) for (const { gap, on } of c.left.technical) gaps.set(gap.id, { gap, on });
  }
  return {
    holders,
    decisions: holders.reduce((n, h) => n + openDecisions(h.doc).length, 0),
    gaps: inRiskOrder([...gaps.values()], (g) => g.gap),
    risk: someOf(readiness.gaps, (g) => gaps.has(g.id)),
  };
}

/* What's left about a mechanism or component: its own open decisions and technical gaps. */
function leftOnTechnical(state: DocketState, doc: TechnicalDoc): LeftHere {
  const decisions = openDecisions(doc).length;
  return {
    holders: decisions ? [{ kind: doc.kind, doc }] : [],
    decisions,
    gaps: inRiskOrder(gapsById(state, doc.gaps), (g) => g).map((gap) => ({ gap })),
    risk: doc.risk,
  };
}

const leftTotal = (left: LeftHere) => left.decisions + left.gaps.length;

/* What's left, as a figure in the header: the gap and decision marks with their counts, and the highest risk. It links to the tab that lists them. */
function LeftStat({ left, of }: { left: LeftHere; of: string }) {
  const n = leftTotal(left);
  return (
    <Stat
      label="What's left"
      term="gap"
      value={<LeftFigure gaps={left.gaps.map((g) => g.gap)} decisions={left.decisions} risk={left.risk} of={of} />}
      tone={n ? undefined : "ok"}
      href={tabHref("left")}
    />
  );
}

/* What a decision is on, as a link to its page. */
function HolderLink({ holder }: { holder: Holder }) {
  const { kind, doc } = holder;
  if (kind === "mechanism" || kind === "component") return <TechnicalLink doc={doc as TechnicalDoc} />;
  if (kind === "capability") return <CapabilityLink capability={doc as Capability} tab="left" />;
  return (
    <a className="page-crumb" href={docHref(kind, doc.id)}>
      {kind === "domain" ? <DomainIcon size={14} /> : NAMES[kind].icon}
      {doc.name}
    </a>
  );
}

/* A doc's open decisions, from each of its sources. */
function OpenDecisions({ doc, ...go }: Go & { doc: Doc }) {
  return (
    <>
      {doc.from.map((f, i) => {
        const open = f.decisions ?? [];
        return open.length ? <DecisionList key={i} from={f} decisions={open} go={go} /> : null;
      })}
    </>
  );
}

/*
 * The What's left tab: open decisions, under what each is on, then gaps,
 * riskiest first. `here` is the page's own doc, which needn't be named. With
 * nothing left, it says so in a line: that's good news.
 */
function LeftTab({ left, here, nothing, ...go }: Go & { left: LeftHere; here?: Doc; nothing?: string }) {
  const { state } = go;
  if (!leftTotal(left)) return <p className="page-nothing-left">{nothing ?? "Nothing left: no open decisions or gaps are written down."}</p>;
  return (
    <>
      {left.decisions ? (
        <Section title={<LeftLabel kind="decision" size={16} />} count={left.decisions} note="Questions not settled yet: each answer changes what's intended.">
          <div className="page-card">
            {left.holders.map((h) => (
              <div key={`${h.kind}:${h.doc.id}`} className="page-subject-group">
                {h.doc !== here ? (
                  <div className="page-subject">
                    <HolderLink holder={h} />
                  </div>
                ) : null}
                <OpenDecisions {...go} doc={h.doc} />
              </div>
            ))}
          </div>
        </Section>
      ) : null}
      {left.gaps.length ? (
        <Section
          title={
            <LeftLabel kind="product-gap" term="gap" size={16}>
              Gaps
            </LeftLabel>
          }
          count={left.gaps.length}
          note="By risk, worst first. The acceptable are folded; open a score to see how it's worked out."
        >
          <GapRows state={state} rows={left.gaps} here={here} />
        </Section>
      ) : null}
    </>
  );
}

/* On a first tab, the few riskiest gaps, with a way to all of them. */
function TopGaps({ state, left, here }: { state: DocketState; left: LeftHere; here?: Doc }) {
  if (!left.gaps.length) return null;
  const shown = left.gaps.slice(0, 3);
  return (
    <Section
      title="Riskiest gaps"
      aside={<a href={tabHref("left")}>{leftTotal(left) > shown.length ? `See all ${leftTotal(left)} open items` : "See what's left"}</a>}
    >
      <GapRows state={state} rows={shown} here={here} grouped={false} />
    </Section>
  );
}

/* ——— Decided ——— */

/* The Decided tab: tradeoffs, chosen on purpose with their benefit and drawback. */
function DecidedTab({
  doc,
  tradeoffs,
  tradeoffTitle,
  tradeoffNote,
  ...go
}: Go & { doc: Doc; tradeoffs: string[]; tradeoffTitle?: string; tradeoffNote: string }) {
  const { state } = go;
  return (
    <Section
      title={
        <LeftLabel kind="tradeoff" size={16}>
          {tradeoffTitle}
        </LeftLabel>
      }
      count={tradeoffs.length}
      note={tradeoffNote}
    >
      <TradeoffRows state={state} tradeoffs={tradeoffsById(state, tradeoffs)} here={doc} />
    </Section>
  );
}

/* ——— Tables ——— */

/*
 * Capabilities as a table: each one's name, opening its page, its level (in
 * `domain`, when given), what's left about it, opening that tab of its page,
 * and who it serves. With `technical` false, as for a persona, what's left is
 * only what someone using the product would notice.
 */
function CapabilityTable({
  state,
  capabilities,
  domain,
  technical = true,
  compact = false,
}: {
  state: DocketState;
  capabilities: Capability[];
  domain?: string;
  technical?: boolean;
  /* Just each one's level, name and what's left, for where it stands. */
  compact?: boolean;
}) {
  if (!capabilities.length) return <Empty>None yet.</Empty>;
  return (
    <div className="page-table-scroll">
      <table className="view-table page-cap-table">
        <thead>
          <tr>
            <th>
              <Term id="capability" hoverOnly>
                Capability
              </Term>
            </th>
            <th>Level</th>
            <th>
              <Term id="gap" hoverOnly>
                What's left
              </Term>
            </th>
            {compact ? null : (
              <th>
                <Term id="persona" hoverOnly>
                  Serves
                </Term>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {capabilities.map((c) => {
            const level = (domain && c.levels.find((l) => l.domain === domain)?.level) || c.stability;
            const left = leftOf(c, technical);
            return (
              <tr key={c.id}>
                <td>
                  <a href={docHref("capability", c.id)}>{c.name}</a>
                  <InitiativeTags state={state} ids={c.initiatives} />
                  {compact ? null : <Excerpt text={c.description} lines={1} className="page-cell-sub" />}
                </td>
                <td>
                  <LevelName level={level} name={c.name} />
                </td>
                <td>
                  {leftCount(left) ? (
                    <a className="page-left-cell" href={docHref("capability", c.id, "left")}>
                      <LeftSummary left={left} />
                    </a>
                  ) : (
                    <span className="faint">Nothing open</span>
                  )}
                </td>
                {compact ? null : (
                  <td>
                    <Avatars personas={c.personas.flatMap((id) => find(state.personas, id) ?? [])} />
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* Where something stands: each of its capabilities, with its stability beside what's left on it. Past `limit`, a link to them all. */
function Standing({
  state,
  capabilities,
  domain,
  limit = 8,
  all,
}: {
  state: DocketState;
  capabilities: Capability[];
  domain?: string;
  limit?: number;
  all: string;
}) {
  const shown = capabilities.slice(0, limit);
  return (
    <>
      <CapabilityTable state={state} capabilities={shown} domain={domain} technical={false} compact />
      {capabilities.length > shown.length ? (
        <p className="page-line">
          <a href={all}>See all {capabilities.length} capabilities</a>
        </p>
      ) : null}
    </>
  );
}

/* How a rule stands for a capability, in a few words. */
const STANDING_SHORT = { gap: "Not held yet", evidence: "Held, with evidence", trust: "Held, on trust" } as const;

const placesOf = (r: Rule) => r.evidence.verifies.length + r.evidence.implements.length;

/*
 * Rules as a table: each one's name, opening its page, with why it exists
 * under it. With `capability`, whether that capability holds to it, the ones
 * a gap says it doesn't first; otherwise how many capabilities follow it and
 * how many places are its evidence. Evidence is optional, so none is no
 * warning.
 */
function RuleTable({ rules, capability }: { rules: Rule[]; capability?: Capability }) {
  if (!rules.length) return <Empty>None written down yet.</Empty>;
  const sorted = capability
    ? [...rules].sort((a, b) => Number(capability.ruleStandings[b.id] === "gap") - Number(capability.ruleStandings[a.id] === "gap"))
    : rules;
  return (
    <div className="page-table-scroll">
      <table className="view-table page-rule-table">
        <thead>
          <tr>
            <th>
              <Term id="rule" hoverOnly>
                Rule
              </Term>
            </th>
            {capability ? <th>Standing</th> : <th className="num">Followed by</th>}
            <th className="num">
              <Term id="evidence" hoverOnly>
                Evidence
              </Term>
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => {
            const standing = capability ? capability.ruleStandings[r.id] : null;
            const places = placesOf(r);
            return (
              <tr key={r.id}>
                <td>
                  <span className="page-rule-cell">
                    {standing ? (
                      <StandingMark standing={standing} label={RULE_STANDING_LABELS[standing]} />
                    ) : (
                      <RuleRoundedIcon sx={{ fontSize: 15, color: "text.secondary", flex: "none", mt: "2px" }} />
                    )}
                    <span>
                      <a href={docHref("rule", r.id)}>{r.name}</a>
                      <Excerpt text={r.why} lines={2} className="page-cell-sub" />
                    </span>
                  </span>
                </td>
                {standing ? (
                  <td className="page-standing-cell" data-tone={standing === "gap" ? "warn" : undefined}>
                    {STANDING_SHORT[standing]}
                  </td>
                ) : (
                  <td className="num">{r.capabilities.length || <span className="faint">None</span>}</td>
                )}
                <td className="num">{places ? plural(places, "place", "places") : <span className="faint">None</span>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* Rows that each open a doc's page: its icon, name and description. */
function DocRows({ rows }: { rows: { key: string; href: string; icon: ReactNode; name: string; summary?: string; mark?: ReactNode }[] }) {
  return (
    <ul className="page-rows">
      {rows.map((r) => (
        <li key={r.key}>
          <a className="concept-row" href={r.href}>
            <span className="page-row-icon">{r.icon}</span>
            <span className="concept-row-text">
              <span className="concept-row-name">{r.name}</span>
              {r.summary ? <Excerpt text={r.summary} lines={2} className="concept-row-summary" /> : null}
            </span>
            {r.mark}
          </a>
        </li>
      ))}
    </ul>
  );
}

/* Where the code says it implements or verifies something, from its annotations. */
function EvidencePair({ state, doc }: { state: DocketState; doc: { evidence: Capability["evidence"] } }) {
  return (
    <div className="page-card">
      <div className="page-evidence-pair">
        <div>
          <span className="page-label">Implemented by</span>
          {doc.evidence.implements.length ? <Places state={state} places={doc.evidence.implements} label="" detailed /> : <span className="faint">None</span>}
        </div>
        <div>
          <span className="page-label">Verified by</span>
          {doc.evidence.verifies.length ? <Places state={state} places={doc.evidence.verifies} label="" detailed /> : <span className="faint">None</span>}
        </div>
      </div>
    </div>
  );
}

/* ——— Pages ——— */

/*
 * A capability: what it does and where it stands, then what's left, the
 * rules it follows, what its level expects, how it's built,
 * what's been decided, and its body.
 */
function CapabilityPage({ capability, route, ...go }: PageProps & { capability: Capability }) {
  const { state, onOpen, onConcept } = go;
  const concepts = capability.concepts.flatMap((id) => find(state.concepts, id) ?? []);
  const rules = capability.rules.flatMap((id) => find(state.rules, id) ?? []);
  const personas = capability.personas.flatMap((id) => find(state.personas, id) ?? []);
  const level = capability.stability;
  const next = nextLevel(level);
  const counts = rubricCounts(state, capability);
  const adds = next
    ? (state.rubric?.qualities ?? [])
        .flatMap((q) => q.levels)
        .filter((l) => l.level === next)
        .reduce((n, l) => n + l.outcomes.length, 0)
    : 0;
  const feature = capability.feature ? find(state.features, capability.feature) : undefined;
  const on = builtOn(state, capability);
  const places = capability.evidence.implements.length + capability.evidence.verifies.length;
  const readiness = capability.readiness;
  const left = leftAcross([capability], readiness);
  const decided = capability.tradeoffs.length;
  const ruleCount = (s: "gap" | "evidence" | "trust") => rules.filter((r) => capability.ruleStandings[r.id] === s).length;
  /* What it still needs to be ready: nothing, once it is, and nothing asked of a draft. */
  const needs = level ? (readiness.notReady.find((n) => n.capability.id === capability.id) ?? null) : null;

  const tabs: TabDef[] = [
    { id: "overview", label: "Overview" },
    { id: "left", label: "What's left", term: "gap" as const, count: leftTotal(left) || undefined },
    ...(rules.length ? [{ id: "rules", label: "Rules", term: "rule" as const, count: rules.length }] : []),
    ...(state.rubric ? [{ id: "stability", label: "Stability", term: "rubric" as const }] : []),
    ...(on.length || places ? [{ id: "built", label: "How it's built", count: on.length || undefined }] : []),
    ...(decided ? [{ id: "decided", label: "Decided", count: decided }] : []),
    ...(hasBody(capability) ? [{ id: "about", label: "About" }] : []),
  ];
  /* Links to the rubric can name it as a section, #rubric, or as older ones did, #expectations or #checklist. */
  const tab = currentTab(
    !route.tab && ["#checklist", "#expectations", "#rubric"].includes(window.location.hash) ? { ...route, tab: "stability" } : route,
    tabs,
  );
  const met = counts ? counts.count - counts.notMet - counts.byChoice - counts.open : 0;

  return (
    <DocView title={capability.name} route={route}>
      <DocHeader
        state={state}
        kind="capability"
        doc={capability}
        initiatives={capability.initiatives}
        trail={
          <>
            <DomainTrail state={state} domains={docDomains(capability)} />
            <span className="faint">›</span>
            {feature ? (
              <a className="page-crumb" href={docHref("feature", feature.id)}>
                {NAMES.feature.icon}
                {feature.name}
              </a>
            ) : (
              <span>Not in a feature</span>
            )}
          </>
        }
        marks={level ? <StabilityMark level={level} feature={capability.name} size="extra-long" /> : <span className="page-draft">Draft</span>}
        stats={
          <>
            <Stat
              label="Readiness"
              term="readiness"
              value={readiness.percent === null ? "Not started" : <ReadinessMark readiness={readiness} of={`Readiness of ${capability.name}`} inButton />}
              note={!level ? "A draft doesn't count" : !needs ? "Nothing left: at Beta or above, with no unacceptable gap" : needsLine(needs)}
              href={needs?.gaps.length ? tabHref("left") : undefined}
            />
            <ExposureStat exposure={capability.exposure} risk={capability.risk} of={capability.name} />
            <LeftStat left={left} of={capability.name} />
            <Stat
              label="Rules"
              term="rule"
              value={rules.length || "None"}
              note={
                rules.length
                  ? [
                      ...(ruleCount("gap") ? [`${ruleCount("gap")} not held yet`] : []),
                      ...(ruleCount("evidence") ? [`${ruleCount("evidence")} with evidence`] : []),
                      ...(ruleCount("trust") ? [`${ruleCount("trust")} on trust`] : []),
                    ].join(" · ")
                  : "None written down yet"
              }
              tone={ruleCount("gap") ? "warn" : undefined}
              href={rules.length ? tabHref("rules") : undefined}
            />
            {counts ? (
              <Stat
                label="Rubric"
                term="rubric"
                value={`${met} of ${counts.count}`}
                note={`${levelName(level)} outcomes met${counts.byChoice ? `, ${counts.byChoice} not by choice` : ""}${counts.open ? `, ${counts.open} open` : ""}`}
                tone={counts.notMet ? "warn" : "ok"}
                href={tabHref("stability")}
              />
            ) : (
              <Stat
                label="Rubric"
                term="rubric"
                value="Not started"
                note="A draft claims nothing on it yet"
                href={state.rubric ? tabHref("stability") : undefined}
              />
            )}
            <Stat
              label="Built on"
              term="component"
              value={on.length || "Nothing listed"}
              note={
                places
                  ? `Evidence in ${plural(places, "place", "places")}`
                  : on.length
                    ? plural(on.length, "mechanism or component", "mechanisms and components")
                    : "No mechanism or component lists it"
              }
              href={on.length || places ? tabHref("built") : undefined}
            />
          </>
        }
      />
      <Tabs tabs={tabs} current={tab} />
      {tab === "overview" ? (
        <>
          <Sources {...go} kind="capability" doc={capability} title="What it does" />
          <Section title="Its level">
            {capability.levels.length > 1 ? (
              <ul className="page-levels">
                {capability.levels.map((l) => (
                  <li key={`${l.project}:${l.domain}`}>
                    <DomainCrumb state={state} id={l.domain} />
                    <LevelName level={l.level} name={capability.name} named />
                    {state.projects.length > 1 ? <span className="faint">{projectName(state, l.project)}</span> : null}
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="page-line">
              {level ? `${STABILITY[level].name}: ${STABILITY[level].stability}.` : "A draft: declared, and not started."}{" "}
              {next ? (
                <>
                  Next is {STABILITY[next].name}, which adds {plural(adds, "outcome", "outcomes")} to meet.{" "}
                  {state.rubric ? <a href={tabHref("stability")}>See the rubric</a> : null}
                </>
              ) : (
                "GA is the top level."
              )}
            </p>
          </Section>
          <TopGaps state={state} left={left} here={capability} />
          {!left.gaps.length ? (
            <Section title="What's left" term="gap">
              <p className="page-line">
                {left.decisions ? (
                  <a href={tabHref("left")}>{plural(left.decisions, "open decision", "open decisions")}</a>
                ) : (
                  "Nothing left: no open decisions or gaps are written down."
                )}
              </p>
            </Section>
          ) : null}
          {personas.length ? (
            <Section title="Who it serves" term="persona" count={personas.length}>
              <PersonaRows state={state} personas={personas} onOpen={onOpen} />
            </Section>
          ) : null}
          {concepts.length ? (
            <Section
              title={
                <>
                  <Term id="concept">Concepts</Term> it uses
                </>
              }
              count={concepts.length}
            >
              <ConceptChips concepts={concepts} onOpen={onConcept} scopeOf={(c) => domainName(state, c.domain)} />
            </Section>
          ) : null}
        </>
      ) : tab === "left" ? (
        <LeftTab {...go} left={left} here={capability} />
      ) : tab === "rules" ? (
        <Section
          title={<Term id="rule">Rules</Term>}
          count={rules.length}
          note="Following a rule claims it holds. Evidence is optional: a rule with none holds on trust, unless a gap says it isn't held yet. Each rule's page has its evidence."
        >
          <RuleTable rules={rules} capability={capability} />
        </Section>
      ) : tab === "stability" && state.rubric ? (
        <Section title={<Term id="rubric">Stability rubric</Term>} id="rubric">
          <StabilityRubric key={capability.id} rubric={state.rubric} capability={capability} />
        </Section>
      ) : tab === "built" ? (
        <>
          {on.length ? (
            <Section title="Built on" term="component" count={on.length} note="The mechanisms that apply to it and the components that list it.">
              <div className="page-card">
                <TechnicalRows state={state} docs={on} />
              </div>
            </Section>
          ) : null}
          <Section
            title={<Term id="evidence">Evidence</Term>}
            count={places || undefined}
            note="Places in the code that name the capability itself, not one of its rules."
          >
            <EvidencePair state={state} doc={capability} />
          </Section>
        </>
      ) : tab === "decided" ? (
        <DecidedTab
          {...go}
          doc={capability}
          tradeoffs={capability.tradeoffs}
          tradeoffNote="Limits it has by choice, each with the benefit and drawback that came with it."
        />
      ) : (
        <Section title={MORE_ABOUT}>
          <Bodies {...go} doc={capability} />
        </Section>
      )}
    </DocView>
  );
}

/*
 * A feature: what it is, how mature and how ready, with what it still needs
 * to be ready, then its capabilities, what's left across them, who it
 * serves, what it's decided, and its body.
 */
function FeaturePage({ feature, route, ...go }: PageProps & { feature: Feature }) {
  const { state, onOpen, onConcept } = go;
  const capabilities = feature.capabilities.flatMap((id) => find(state.capabilities, id) ?? []);
  const concepts = featureConcepts(state, feature);
  const personas = state.personas.filter((p) => p.features.includes(feature.id));
  const readiness = feature.readiness;
  const left = leftAcross(capabilities, readiness, { kind: "feature", doc: feature });
  const decided = feature.tradeoffs.length;
  const tabs: TabDef[] = [
    { id: "overview", label: "Overview" },
    { id: "capabilities", label: "Capabilities", term: "capability" as const, count: capabilities.length },
    { id: "left", label: "What's left", term: "gap" as const, count: leftTotal(left) || undefined },
    ...(personas.length ? [{ id: "personas", label: "Personas", term: "persona" as const, count: personas.length }] : []),
    ...(decided ? [{ id: "decided", label: "Decided", count: decided }] : []),
    ...(hasBody(feature) ? [{ id: "about", label: "About" }] : []),
  ];
  const tab = currentTab(route, tabs);
  return (
    <DocView title={feature.name} route={route}>
      <DocHeader
        state={state}
        kind="feature"
        doc={feature}
        initiatives={initiativesOf(state, capabilities)}
        trail={<DomainTrail state={state} domains={feature.parts.map((p) => p.domain)} />}
        stats={
          <>
            <Stat
              label="Capabilities"
              term="capability"
              value={capabilities.length || "None"}
              note={<StabilitySpread levels={capabilities.map((c) => c.stability)} of={feature.name} inButton />}
              href={tabHref("capabilities")}
            />
            <MaturityStat
              maturity={feature.maturity}
              band={feature.band}
              subject="feature"
              count={capabilities.filter((c) => c.stability).length}
              spread={capabilities.map((c) => c.stability)}
              of={feature.name}
            />
            <ExposureStat exposure={feature.exposure} risk={feature.readiness.gaps} of={feature.name} />
            <ReadinessStat readiness={readiness} tab="overview" of={`Readiness of ${feature.name}`} />
            <LeftStat left={left} of={feature.name} />
            <Stat
              label="Serves"
              value={personas.length ? <Avatars personas={personas} /> : "Nobody yet"}
              note={personas.length ? plural(personas.length, "persona", "personas") : "No capability names a persona"}
              href={personas.length ? tabHref("personas") : undefined}
            />
            {feature.tradeoffs.length ? (
              <Stat label="Decided not to build" term="tradeoff" value={feature.tradeoffs.length} note="Left out on purpose" href={tabHref("decided")} />
            ) : null}
          </>
        }
      />
      <Tabs tabs={tabs} current={tab} />
      {tab === "overview" ? (
        <>
          <Sources {...go} kind="feature" doc={feature} title="What it is" />
          <Section title="Where it stands">
            {feature.parts.length > 1 ? (
              <ul className="page-levels">
                {feature.parts.map((p) => (
                  <li key={p.domain}>
                    <DomainCrumb state={state} id={p.domain} />
                    <Maturity
                      value={p.maturity}
                      subject="feature"
                      of="none of its capabilities here has a level yet"
                      spread={partLevels(state, p.capabilities, p.domain)}
                    />
                    <span className="faint">{plural(p.capabilities.length, "capability", "capabilities")}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {capabilities.length ? (
              <Standing state={state} capabilities={capabilities} all={tabHref("capabilities")} />
            ) : (
              <p className="page-line">No capabilities yet.</p>
            )}
          </Section>
          <StillNeedsSection readiness={readiness} readyText="Ready: every started capability is at Beta or above, with no unacceptable gap." />
          <TopGaps state={state} left={left} />
          {concepts.length ? (
            <Section
              title={
                <>
                  <Term id="concept">Concepts</Term> its capabilities use
                </>
              }
              count={concepts.length}
            >
              <ConceptChips concepts={concepts} onOpen={onConcept} scopeOf={(c) => domainName(state, c.domain)} />
            </Section>
          ) : null}
        </>
      ) : tab === "capabilities" ? (
        feature.parts.length ? (
          feature.parts.map((part) => (
            <Section
              key={part.domain}
              title={feature.parts.length > 1 ? `In ${domainName(state, part.domain)}` : <Term id="capability">Capabilities</Term>}
              count={part.capabilities.length}
              aside={
                feature.parts.length > 1 ? (
                  <Maturity
                    value={part.maturity}
                    subject="feature"
                    of="none of its capabilities here has a level yet"
                    spread={partLevels(state, part.capabilities, part.domain)}
                  />
                ) : undefined
              }
            >
              <CapabilityTable state={state} capabilities={part.capabilities.flatMap((id) => find(state.capabilities, id) ?? [])} domain={part.domain} />
            </Section>
          ))
        ) : (
          <Empty>A job the software doesn't do yet.</Empty>
        )
      ) : tab === "left" ? (
        <LeftTab {...go} left={left} here={feature} />
      ) : tab === "personas" ? (
        <Section
          title="Who it serves"
          term="persona"
          count={personas.length}
          note="How ready it is for each, from the levels of its capabilities that serve them."
        >
          <PersonaRows state={state} personas={personas} feature={feature} onOpen={onOpen} />
        </Section>
      ) : tab === "decided" ? (
        <DecidedTab
          {...go}
          doc={feature}
          tradeoffs={feature.tradeoffs}
          tradeoffTitle="Decided not to build"
          tradeoffNote="Left out on purpose, each with the benefit and drawback of leaving it out."
        />
      ) : (
        <Section title={MORE_ABOUT}>
          <Bodies {...go} doc={feature} />
        </Section>
      )}
    </DocView>
  );
}

/*
 * A domain: what it is, how mature and how ready, with what it still needs
 * to be ready, then its features, its language (the concepts and rules it
 * defines), what's left across it, and its body.
 */
function DomainPage({ domain, route, ...go }: PageProps & { domain: Domain }) {
  const { state } = go;
  const features = domain.features.flatMap((id) => find(state.features, id) ?? []);
  const loose = domain.capabilities.flatMap((id) => find(state.capabilities, id) ?? []);
  const capabilities = domainCapabilities(state, domain);
  const concepts = state.concepts.filter((c) => c.domain === domain.id).sort((a, b) => a.name.localeCompare(b.name));
  const rules = state.rules.filter((r) => r.domain === domain.id);
  const readiness = domain.readiness;
  const left = leftAcross(capabilities, readiness, { kind: "domain", doc: domain });
  const tabs: TabDef[] = [
    { id: "overview", label: "Overview" },
    { id: "features", label: "Features", term: "feature" as const, count: features.length },
    ...(concepts.length || rules.length ? [{ id: "language", label: "Language", term: "concept" as const, count: concepts.length + rules.length }] : []),
    { id: "left", label: "What's left", term: "gap" as const, count: leftTotal(left) || undefined },
    ...(hasBody(domain) ? [{ id: "about", label: "About" }] : []),
  ];
  const tab = currentTab(route, tabs);
  return (
    <DocView title={domain.name} route={route}>
      <DocHeader
        state={state}
        kind="domain"
        doc={domain}
        initiatives={initiativesOf(state, capabilities)}
        stats={
          <>
            <Stat
              label="Features"
              term="feature"
              value={features.length || "None"}
              note={loose.length ? `and ${plural(loose.length, "capability", "capabilities")} in none` : "that it has a part in"}
              href={tabHref("features")}
            />
            <Stat
              label="Capabilities"
              term="capability"
              value={capabilities.length || "None"}
              note={<StabilitySpread levels={capabilities.map((c) => levelInDomain(c, domain.id))} of={domain.name} inButton />}
              href={tabHref("features")}
            />
            <MaturityStat
              maturity={domain.maturity}
              band={domain.band}
              subject="domain"
              count={domain.features.filter((id) => partOf(find(state.features, id), domain.id)?.maturity != null).length}
              spread={domain.features.map((id) => partOf(find(state.features, id), domain.id)?.band ?? null)}
              of={domain.name}
            />
            <ExposureStat exposure={domain.exposure} risk={domain.readiness.gaps} of={domain.name} />
            <ReadinessStat readiness={readiness} tab="overview" of={`Readiness of ${domain.name}`} />
            <Stat
              label="Language"
              term="concept"
              value={plural(concepts.length, "concept", "concepts")}
              note={plural(rules.length, "rule", "rules")}
              href={concepts.length || rules.length ? tabHref("language") : undefined}
            />
            <LeftStat left={left} of={domain.name} />
          </>
        }
      />
      <Tabs tabs={tabs} current={tab} />
      {tab === "overview" ? (
        <>
          <Sources {...go} kind="domain" doc={domain} title="What it is" />
          <Section title="Where it stands">
            {capabilities.length ? (
              <Standing state={state} capabilities={capabilities} domain={domain.id} all={tabHref("features")} />
            ) : (
              <p className="page-line">A part of the business the software doesn't serve yet.</p>
            )}
          </Section>
          <StillNeedsSection
            readiness={readiness}
            readyText="Ready: every started capability with a part in it is at Beta or above, with no unacceptable gap."
          />
          <TopGaps state={state} left={left} />
        </>
      ) : tab === "features" ? (
        <>
          <Section title={<Term id="feature">Features</Term>} count={features.length}>
            {features.length ? (
              <div className="page-feature-grid">
                {features.map((f) => {
                  const part = partOf(f, domain.id);
                  const caps = (part?.capabilities ?? []).flatMap((id) => find(state.capabilities, id) ?? []);
                  const elsewhere = f.parts.filter((p) => p.domain !== domain.id).map((p) => domainName(state, p.domain));
                  return (
                    <a key={f.id} className="page-feature" href={docHref("feature", f.id)}>
                      <span className="page-feature-head">
                        {NAMES.feature.icon}
                        <strong>{f.name}</strong>
                        {part?.maturity != null ? (
                          <MaturityRing
                            progress={part.maturity}
                            subject="feature"
                            size={22}
                            focusable={false}
                            spread={caps.map((c) => c.levels.find((l) => l.domain === domain.id)?.level ?? c.stability)}
                          />
                        ) : null}
                      </span>
                      {f.description ? <span className="page-feature-summary">{f.description}</span> : null}
                      <ul>
                        {caps.map((c) => {
                          const level = c.levels.find((l) => l.domain === domain.id)?.level ?? c.stability;
                          return (
                            <li key={c.id}>
                              <CapabilityStability level={level} name={c.name} focusable={false} />
                              {c.name}
                            </li>
                          );
                        })}
                      </ul>
                      {elsewhere.length ? <span className="faint">Also in {elsewhere.join(", ")}</span> : null}
                    </a>
                  );
                })}
              </div>
            ) : (
              <Empty>A part of the business the software doesn't serve yet.</Empty>
            )}
          </Section>
          {loose.length ? (
            <Section
              title={
                <>
                  <Term id="capability">Capabilities</Term> in no <Term id="feature">feature</Term>
                </>
              }
              count={loose.length}
            >
              <CapabilityTable state={state} capabilities={loose} domain={domain.id} />
            </Section>
          ) : null}
        </>
      ) : tab === "language" ? (
        <>
          {concepts.length ? (
            <Section title={<Term id="concept">Concepts</Term>} count={concepts.length} note="What its words mean here.">
              <div className="page-card">
                <DocRows
                  rows={concepts.map((c) => ({
                    key: c.id,
                    href: docHref("concept", c.id),
                    icon: <ConceptIcon size={15} />,
                    name: c.name,
                    summary: c.description,
                  }))}
                />
              </div>
            </Section>
          ) : null}
          {rules.length ? (
            <Section title={<Term id="rule">Rules</Term>} count={rules.length} note="What must always be true, or must never happen, here.">
              <RuleTable rules={rules} />
            </Section>
          ) : null}
        </>
      ) : tab === "left" ? (
        <LeftTab {...go} left={left} here={domain} />
      ) : (
        <Section title={MORE_ABOUT}>
          <Bodies {...go} doc={domain} />
        </Section>
      )}
    </DocView>
  );
}

/*
 * A persona: how ready the software is for them, and what it still needs to
 * be, then what serves them, by feature, what's left for them (only what
 * someone using it would notice), and their body.
 */
function PersonaPage({ persona, route, ...go }: PageProps & { persona: Persona }) {
  const { state } = go;
  const capabilities = persona.capabilities.flatMap((id) => find(state.capabilities, id) ?? []);
  const features = persona.features.flatMap((id) => find(state.features, id) ?? []);
  const loose = capabilities.filter((c) => !c.feature);
  const domains = [...new Set(capabilities.flatMap((c) => docDomains(c)))];
  const readiness = persona.readiness;
  const left = leftAcross(capabilities, readiness, undefined, false);
  const { name, role } = personaNameAndRole(persona);
  const tabs: TabDef[] = [
    { id: "readiness", label: "Readiness", term: "readiness" as const },
    { id: "serves", label: "What serves them", term: "capability" as const, count: capabilities.length },
    { id: "left", label: "What's left for them", term: "gap" as const, count: leftTotal(left) || undefined },
    ...(hasBody(persona) ? [{ id: "about", label: "About" }] : []),
  ];
  const tab = currentTab(route, tabs);
  return (
    <DocView title={name} route={route}>
      <DocHeader
        state={state}
        kind="persona"
        doc={persona}
        initiatives={persona.initiatives}
        kindNote={role}
        title={
          <span className="page-title-picture">
            <PersonaAvatar persona={persona} size={44} />
            {name}
          </span>
        }
        trail={domains.length ? <DomainTrail state={state} domains={domains} /> : undefined}
        stats={
          <>
            <Stat
              label="Capabilities"
              term="capability"
              value={capabilities.length || "None"}
              note={
                capabilities.length ? (
                  <StabilitySpread levels={capabilities.map((c) => c.stability)} of={`what serves ${persona.name}`} inButton />
                ) : (
                  "that serve them"
                )
              }
              href={tabHref("serves")}
            />
            <MaturityStat
              maturity={persona.maturity}
              band={persona.band}
              subject="persona"
              count={capabilities.filter((c) => c.stability).length}
              spread={capabilities.map((c) => c.stability)}
              of={`what serves ${persona.name}`}
            />
            <ExposureStat exposure={persona.exposure} risk={persona.readiness.gaps} of={`what serves ${persona.name}`} />
            <ReadinessStat readiness={readiness} tab="readiness" of={`Readiness for ${name}`} />
            <LeftStat left={left} of={`what serves ${persona.name}`} />
          </>
        }
      />
      <Tabs tabs={tabs} current={tab} />
      {tab === "readiness" ? (
        <>
          <Sources {...go} kind="persona" doc={persona} title="Who they are" />
          <StillNeedsSection
            readiness={readiness}
            readyText={`Ready for ${name}: everything started that serves them is at Beta or above, with no unacceptable gap.`}
          />
          <Section title="By feature" count={features.length} note="How ready each feature is for them, from its capabilities that serve them.">
            {features.length ? (
              <ul className="page-levels">
                {features.map((f) => (
                  <li key={f.id}>
                    <a className="page-crumb" href={docHref("feature", f.id)}>
                      {NAMES.feature.icon}
                      {f.name}
                    </a>
                    <ReadinessFor state={state} forRef={`persona:${persona.id},feature:${f.id}`} of={`${f.name}'s readiness for ${name}`} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="page-line">No feature serves them yet.</p>
            )}
          </Section>
          <TopGaps state={state} left={left} />
        </>
      ) : tab === "serves" ? (
        <>
          {features.map((f) => {
            return (
              <Section
                key={f.id}
                title={
                  <a className="page-crumb page-section-link" href={docHref("feature", f.id)}>
                    {NAMES.feature.icon}
                    {f.name}
                  </a>
                }
                aside={<ReadinessFor state={state} forRef={`persona:${persona.id},feature:${f.id}`} of={`${f.name}'s readiness for ${name}`} started />}
              >
                <CapabilityTable state={state} capabilities={capabilities.filter((c) => c.feature === f.id)} technical={false} />
              </Section>
            );
          })}
          {loose.length ? (
            <Section
              title={
                <>
                  <Term id="capability">Capabilities</Term> in no <Term id="feature">feature</Term>
                </>
              }
              count={loose.length}
            >
              <CapabilityTable state={state} capabilities={loose} technical={false} />
            </Section>
          ) : null}
          {!capabilities.length ? <Empty>Nothing serves them yet.</Empty> : null}
        </>
      ) : tab === "left" ? (
        <LeftTab {...go} left={left} nothing="Nothing left for them: no open decisions or product gaps are written down in what serves them." />
      ) : (
        <Section title={MORE_ABOUT}>
          <Bodies {...go} doc={persona} />
        </Section>
      )}
    </DocView>
  );
}

/*
 * An initiative: how ready its work is, and what it still needs, then its
 * capabilities, by feature, what's left in them, and its body. Like a
 * persona's page, everything on it counts only its capabilities.
 */
function InitiativePage({ initiative, route, ...go }: PageProps & { initiative: Initiative }) {
  const { state } = go;
  const capabilities = capabilitiesById(state, initiative.capabilities);
  const features = initiative.features.flatMap((id) => find(state.features, id) ?? []);
  const loose = capabilities.filter((c) => !c.feature);
  const domains = [...new Set(capabilities.flatMap((c) => docDomains(c)))];
  const readiness = initiative.readiness;
  const left = leftAcross(capabilities, readiness, undefined, false);
  const personas = initiative.personas.flatMap((id) => find(state.personas, id) ?? []);
  const name = initiative.name;
  const tabs: TabDef[] = [
    { id: "readiness", label: "Readiness", term: "readiness" as const },
    { id: "capabilities", label: "Capabilities", term: "capability" as const, count: capabilities.length },
    { id: "left", label: "What's left in it", term: "gap" as const, count: leftTotal(left) || undefined },
    ...(hasBody(initiative) ? [{ id: "about", label: "About" }] : []),
  ];
  const tab = currentTab(route, tabs);
  return (
    <DocView title={name} route={route}>
      <DocHeader
        state={state}
        kind="initiative"
        doc={initiative}
        trail={domains.length ? <DomainTrail state={state} domains={domains} /> : undefined}
        stats={
          <>
            <Stat
              label="Capabilities"
              term="capability"
              value={capabilities.length || "None"}
              note={capabilities.length ? <StabilitySpread levels={capabilities.map((c) => c.stability)} of={name} inButton /> : "in it, in this scope"}
              href={tabHref("capabilities")}
            />
            <MaturityStat
              maturity={initiative.maturity}
              band={initiative.band}
              subject="initiative"
              count={capabilities.filter((c) => c.stability).length}
              spread={capabilities.map((c) => c.stability)}
              of={name}
            />
            <ExposureStat exposure={initiative.exposure} risk={initiative.readiness.gaps} of={name} />
            <ReadinessStat readiness={readiness} tab="readiness" of={`Readiness of ${name}`} />
            <LeftStat left={left} of={name} />
          </>
        }
      />
      <Tabs tabs={tabs} current={tab} />
      {tab === "readiness" ? (
        <>
          <StillNeedsSection readiness={readiness} readyText={`${name} is ready: everything started in it is at Beta or above, with no unacceptable gap.`} />
          <Section title="Who it's for" term="persona" count={personas.length} note="How ready it is for each, from its capabilities that serve them.">
            {personas.length ? (
              <ul className="page-levels">
                {personas.map((p) => (
                  <li key={p.id}>
                    <a className="page-crumb" href={docHref("persona", p.id)}>
                      <PersonaAvatar persona={p} size={22} />
                      {p.name}
                    </a>
                    <ReadinessFor state={state} forRef={`persona:${p.id}`} initiative={initiative.id} of={`${name}'s readiness for ${p.name}`} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="page-line">No persona says it's part of {name}.</p>
            )}
          </Section>
          <Section title="By feature" count={features.length} note="How ready each feature's part of it is, from its capabilities in it.">
            {features.length ? (
              <ul className="page-levels">
                {features.map((f) => (
                  <li key={f.id}>
                    <a className="page-crumb" href={docHref("feature", f.id)}>
                      {NAMES.feature.icon}
                      {f.name}
                    </a>
                    <ReadinessFor state={state} forRef={`feature:${f.id}`} initiative={initiative.id} of={`${f.name}'s readiness in ${name}`} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="page-line">None of its capabilities is in a feature.</p>
            )}
          </Section>
          <TopGaps state={state} left={left} />
        </>
      ) : tab === "capabilities" ? (
        <>
          {features.map((f) => {
            return (
              <Section
                key={f.id}
                title={
                  <a className="page-crumb page-section-link" href={docHref("feature", f.id)}>
                    {NAMES.feature.icon}
                    {f.name}
                  </a>
                }
                aside={<ReadinessFor state={state} forRef={`feature:${f.id}`} initiative={initiative.id} of={`${f.name}'s readiness in ${name}`} started />}
              >
                <CapabilityTable state={state} capabilities={capabilities.filter((c) => c.feature === f.id)} technical={false} />
              </Section>
            );
          })}
          {loose.length ? (
            <Section
              title={
                <>
                  <Term id="capability">Capabilities</Term> in no <Term id="feature">feature</Term>
                </>
              }
              count={loose.length}
            >
              <CapabilityTable state={state} capabilities={loose} technical={false} />
            </Section>
          ) : null}
          {!capabilities.length ? <Empty>None of its capabilities is in the scope showing.</Empty> : null}
        </>
      ) : tab === "left" ? (
        <LeftTab {...go} left={left} nothing="Nothing left in it: no open decisions or product gaps are written down on its capabilities." />
      ) : (
        <Section title={MORE_ABOUT}>
          <Bodies {...go} doc={initiative} />
        </Section>
      )}
    </DocView>
  );
}

/*
 * A concept: what it means, then the capabilities that use it, the rules
 * that refer to it, and the same word in other domains. A concept is small,
 * so a tab with nothing in it is left out.
 */
function ConceptPage({ concept, route, ...go }: PageProps & { concept: Concept }) {
  const { state, onConcept } = go;
  const groups = byFeature(state, concept.capabilities);
  const rules = concept.rules.flatMap((id) => find(state.rules, id) ?? []);
  const others = related(state, concept);
  const elsewhere = state.concepts.filter((c) => c.id !== concept.id && bareId(c.id) === bareId(concept.id));
  const fielded = concept.from.some((f) => facets("concept", f, go).length) || concept.from.length > 1;
  const tabs: TabDef[] = [
    { id: "meaning", label: "Meaning" },
    ...(concept.capabilities.length ? [{ id: "used", label: "Used by", term: "capability" as const, count: concept.capabilities.length }] : []),
    ...(rules.length ? [{ id: "rules", label: "Rules", term: "rule" as const, count: rules.length }] : []),
    ...(elsewhere.length ? [{ id: "elsewhere", label: "The same word elsewhere", count: elsewhere.length }] : []),
  ];
  const tab = currentTab(route, tabs);
  return (
    <DocView title={concept.name} route={route}>
      <DocHeader
        state={state}
        kind="concept"
        doc={concept}
        initiatives={initiativesOf(state, capabilitiesById(state, concept.capabilities))}
        trail={<DomainCrumb state={state} id={concept.domain} />}
        stats={
          <>
            <Stat
              label="Used by"
              term="capability"
              value={plural(concept.capabilities.length, "capability", "capabilities")}
              note={plural(groups.filter((g) => g.feature).length, "feature", "features")}
              href={concept.capabilities.length ? tabHref("used") : undefined}
            />
            <Stat label="Referred to by" term="rule" value={plural(rules.length, "rule", "rules")} href={rules.length ? tabHref("rules") : undefined} />
            {elsewhere.length ? (
              <Stat
                label="Also defined in"
                value={elsewhere.map((c) => domainName(state, c.domain)).join(", ")}
                note="With a meaning of its own there"
                href={tabHref("elsewhere")}
              />
            ) : null}
          </>
        }
      />
      <Tabs tabs={tabs} current={tab} />
      {tab === "meaning" ? (
        <>
          <Sources {...go} kind="concept" doc={concept} title="What it means" aside={<code className="faint">{concept.file}</code>} />
          {hasBody(concept) ? (
            <Section title={MORE_ABOUT} aside={fielded ? undefined : <code className="faint">{concept.file}</code>}>
              <Bodies {...go} doc={concept} />
            </Section>
          ) : null}
          {others.length ? (
            <Section
              title={
                <>
                  Related <Term id="concept">concepts</Term>
                </>
              }
              count={others.length}
            >
              <ConceptChips concepts={others} onOpen={onConcept} />
            </Section>
          ) : null}
          {!fielded && !hasBody(concept) && !others.length ? <Empty>Nothing more is written about it than what's above.</Empty> : null}
        </>
      ) : tab === "used" ? (
        groups.map(({ feature, capabilities }) => (
          <Section
            key={feature?.id ?? ""}
            title={
              feature ? (
                <a className="page-crumb page-section-link" href={docHref("feature", feature.id)}>
                  {NAMES.feature.icon}
                  {feature.name}
                </a>
              ) : (
                "Not in a feature"
              )
            }
            count={capabilities.length}
          >
            <div className="page-card">
              <DocRows
                rows={capabilities.map((c) => ({
                  key: c.id,
                  href: docHref("capability", c.id),
                  icon: NAMES.capability.icon,
                  name: c.name,
                  summary: c.description,
                  mark: <CapabilityStability level={c.stability} name={c.name} focusable={false} />,
                }))}
              />
            </div>
          </Section>
        ))
      ) : tab === "rules" ? (
        <Section
          title={
            <>
              <Term id="rule">Rules</Term> that refer to it
            </>
          }
          count={rules.length}
        >
          <RuleTable rules={rules} />
        </Section>
      ) : (
        <Section title="The same word elsewhere" count={elsewhere.length} note="Each domain's word means what it says there.">
          <div className="page-card">
            <DocRows
              rows={elsewhere.map((c) => ({
                key: c.id,
                href: docHref("concept", c.id),
                icon: <ConceptIcon size={15} />,
                name: `In ${domainName(state, c.domain)}`,
                summary: c.description,
              }))}
            />
          </div>
        </Section>
      )}
    </DocView>
  );
}

/*
 * A mechanism or component: how it's built, in the code's words, then what's
 * left (its open decisions and technical gaps), what's been decided (its
 * tradeoffs), where it is in the code, from the
 * annotations that implement or verify it, and the capabilities that rely on
 * it.
 */
function TechnicalPage({ doc, route, ...go }: PageProps & { doc: TechnicalDoc }) {
  const { state } = go;
  const capabilities = doc.capabilities.flatMap((id) => find(state.capabilities, id) ?? []);
  const outcomes = doc.meets.flatMap((id) => expectedOutcome(state.rubric, id) ?? []);
  const places = doc.evidence.implements.length + doc.evidence.verifies.length;
  const left = leftOnTechnical(state, doc);
  const decided = doc.tradeoffs.length;
  const reliedLabel = doc.kind === "component" ? "Relied on by" : "Applies to";
  const tabs: TabDef[] = [
    { id: "built", label: "How it's built" },
    { id: "left", label: "What's left", term: "gap" as const, count: leftTotal(left) || undefined },
    ...(decided ? [{ id: "decided", label: "Decided", count: decided }] : []),
    ...(places ? [{ id: "code", label: "In the code", term: "evidence" as const, count: places }] : []),
    ...(capabilities.length ? [{ id: "relied", label: reliedLabel, count: capabilities.length }] : []),
  ];
  const tab = currentTab(route, tabs);
  const fielded = doc.from.some((f) => facets(doc.kind, f, go).length) || doc.from.length > 1;
  return (
    <DocView title={doc.name} route={route}>
      <DocHeader
        state={state}
        kind={doc.kind}
        doc={doc}
        initiatives={initiativesOf(state, capabilities)}
        trail={<a href={sectionHref("built")}>How it's built</a>}
        stats={
          <>
            <LeftStat left={left} of={doc.name} />
            <Stat
              label="Tradeoffs"
              term="tradeoff"
              value={doc.tradeoffs.length || "None"}
              note="Chosen on purpose"
              href={decided ? tabHref("decided") : undefined}
            />
            <Stat
              label="In the code"
              term="evidence"
              value={places ? plural(places, "place", "places") : "None"}
              note={places ? "From its annotations" : "Nothing points at it yet"}
              href={places ? tabHref("code") : undefined}
            />
            <Stat
              label={reliedLabel}
              value={plural(capabilities.length, "capability", "capabilities")}
              note={doc.kind === "mechanism" ? (doc.applies === "product" ? "Across its product" : "Across its project") : undefined}
              href={capabilities.length ? tabHref("relied") : undefined}
            />
          </>
        }
      />
      <Tabs tabs={tabs} current={tab} />
      {tab === "built" ? (
        <>
          <Sources {...go} kind={doc.kind} doc={doc} title="What it is" />
          {hasBody(doc) ? (
            <Section title={MORE_ABOUT}>
              <Bodies {...go} doc={doc} />
            </Section>
          ) : null}
          {outcomes.length ? (
            <Section
              title="Outcomes it meets"
              count={outcomes.length}
              note="For each capability it serves, these count as met on its rubric, with the places in the code as evidence, unless a gap names one."
            >
              <div className="page-card">
                <ul className="explore-left-list">
                  {outcomes.map(({ outcome, quality }) => (
                    <li key={outcome.id}>
                      {outcome.text}
                      <span className="explore-left-meta">
                        <span className="explore-tag">
                          {quality.name} · {STABILITY[outcome.level].name}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Section>
          ) : null}
          {!fielded && !hasBody(doc) && !outcomes.length ? <Empty>Nothing more is written about it than what's above.</Empty> : null}
        </>
      ) : tab === "left" ? (
        <LeftTab {...go} left={left} here={doc} nothing="Nothing left: no open decisions or technical gaps are written down." />
      ) : tab === "decided" ? (
        <DecidedTab
          {...go}
          doc={doc}
          tradeoffs={doc.tradeoffs}
          tradeoffNote="Technical choices made on purpose, each with the benefit and drawback that came with it."
        />
      ) : tab === "code" ? (
        <Section title="In the code" term="evidence" count={places} note="Where the code says it implements or verifies it, from its annotations.">
          <EvidencePair state={state} doc={doc} />
        </Section>
      ) : (
        <Section
          title={doc.kind === "component" ? "Capabilities that rely on it" : doc.applies === "product" ? "Applies across the product" : "Applies to"}
          count={capabilities.length}
        >
          <CapabilityTable state={state} capabilities={capabilities} />
        </Section>
      )}
    </DocView>
  );
}
