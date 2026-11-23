import { useEffect, useRef, useState, type ReactNode } from "react";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import { StabilityChecklist } from "./Checklist";
import { ConceptChips, ConceptIcon, related } from "./Concepts";
import { CameFrom, DecisionList, Decided, Facets, Text, facets } from "./Fields";
import { Body, MORE_ABOUT, MoreAboutFold } from "./design/markdown/Markdown";
import { RingGlyph } from "./design/maturity/RingGlyph";
import { MATURITY_BANDS, maturityBand } from "./design/maturity/maturity";
import { STABILITY, STABILITY_LEVEL_IDS, levelColor } from "./design/stability/stability";
import { GapIcon, LeftLabel, LeftList } from "./design/left/LeftMark";
import { CapabilityStability } from "./design/catalog/CapabilityLabel";
import { StandingMark } from "./design/standing/StandingMark";
import {
  CapabilityTrail,
  DomainCrumbs,
  TECHNICAL_NAMES,
  TechnicalLink,
  TechnicalRows,
  GapItem,
  LeftRollup,
  NAMES,
  PersonaRows,
  RULE_STANDING_LABELS,
  Places,
  Row,
  Tradeoffs,
  WhatsLeft,
  checklistCounts,
  domainCapabilities,
  leftLine,
  levelName,
  plural,
  readinessBasis,
  type ExploreKind,
} from "./Explore";
import { DomainIcon } from "./FeatureMap";
import Logo from "./Logo";
import { PersonaAvatar, ReadinessMeter, personaNameAndRole } from "./Personas";
import { ProjectIcon } from "./PlatformFilter";
import {
  bareId,
  builtOn,
  byFeature,
  checklistOutcome,
  contradictionsOf,
  docDomains,
  domainName,
  technicalDoc,
  gapsById,
  openDecisions,
  closedDecisions,
  decidedBy,
  type BecameKind,
  pageHref,
  subjectOf,
  featureConcepts,
  find,
  leftCount,
  leftIn,
  mapHref,
  nextLevel,
  partOf,
  personaReadinessIn,
  pickList,
  projectName,
  type Capability,
  type CapabilityLevel,
  type Concept,
  type Contribution,
  type Doc,
  type DocketState,
  type Domain,
  type TechnicalDoc,
  type TechnicalKind,
  type Evidence,
  type Feature,
  type Level,
  type PageAt,
  type Persona,
  type Pick,
  type Rule,
  type RuleStanding,
  hasEvidence,
  ruleStanding,
} from "./state";
import { Tip } from "./design/Tip";

/*
 * Everything about one doc, on a page of its own, laid out to answer at a
 * glance where it stands and what's left: a band across the top with its
 * status in figures, then what it is and the proof behind it, such as each
 * rule's evidence and the stability checklist, beside a column that keeps
 * what's left and what it's connected to in view. The side panel opens it in
 * a new tab, so the map stays as it was in the first. Links here open other
 * pages in this tab.
 */
export default function DetailPage({ state, page, onGo }: { state: DocketState; page: PageAt; onGo: (pick: PageAt) => void }) {
  const doc: Doc | undefined =
    page.kind === "gaps"
      ? undefined
      : page.kind === "mechanism" || page.kind === "component"
        ? find(page.kind === "mechanism" ? state.mechanisms : state.components, page.id)
        : find(pickList(state, page.kind), page.id);
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = page.kind === "gaps" ? "Gaps and tradeoffs · Docket" : doc ? `${doc.name} · Docket` : "Not found · Docket";
  }, [doc, page.kind]);
  /* A new page starts at its top, or at the section its address names, such as #checklist. */
  useEffect(() => {
    const section = window.location.hash.slice(1);
    const at = section ? document.getElementById(section) : null;
    if (at) at.scrollIntoView();
    else scroller.current?.scrollTo({ top: 0 });
  }, [page.kind, page.id]);

  const links: Go = {
    state,
    onOpen: (kind, id) => {
      if (id) onGo({ kind, id });
    },
    onConcept: (id) => onGo({ kind: "concept", id }),
    onPick: onGo,
  };

  /* Back on the map, what this page is about opens in the side panel, in view, when it's on the map at all. */
  const onMap = doc && page.kind !== "gaps" && page.kind !== "mechanism" && page.kind !== "component" ? (page as Pick) : undefined;
  const back = mapHref(onMap);

  return (
    <div className="page" ref={scroller}>
      <header className="page-top">
        <Tip title="The map">
          <a className="page-brand" href={back} aria-label="The map">
            <Logo />
          </a>
        </Tip>
        <Tip title={onMap ? `Back to the map, with ${doc!.name} open` : "Back to the map"}>
          <a className="page-back" href={back}>
            <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
            Map
          </a>
        </Tip>
        <span className="divider" aria-hidden />
        <span className="page-projects">{state.projects.map((p) => p.name).join(", ")}</span>
        <a className="filter-toggle" href={pageHref({ kind: "gaps", id: "" })} aria-current={page.kind === "gaps" ? "page" : undefined}>
          <GapIcon sx={{ fontSize: 14 }} />
          Gaps and tradeoffs
        </a>
      </header>
      {page.kind === "gaps" ? (
        <GapsPage {...links} />
      ) : !doc ? (
        <div className="page-wrap page-missing">
          <h1>Nothing by that name</h1>
          <p>
            No {page.kind} called “{page.id}” is in the projects showing. It may have been renamed, or be in a project that isn't showing.
          </p>
        </div>
      ) : page.kind === "capability" ? (
        <CapabilityPage capability={doc as Capability} {...links} />
      ) : page.kind === "feature" ? (
        <FeaturePage feature={doc as Feature} {...links} />
      ) : page.kind === "domain" ? (
        <DomainPage domain={doc as Domain} {...links} />
      ) : page.kind === "persona" ? (
        <PersonaPage persona={doc as Persona} {...links} />
      ) : page.kind === "mechanism" || page.kind === "component" ? (
        <TechnicalPage doc={doc as TechnicalDoc} {...links} />
      ) : (
        <ConceptPage concept={doc as Concept} {...links} />
      )}
    </div>
  );
}

type Go = {
  state: DocketState;
  onOpen: (kind: ExploreKind, id: string | null) => void;
  onConcept: (id: string) => void;
  onPick: (pick: Pick) => void;
};

const noShow = () => {};

/* ——— Layout ——— */

const KIND_NAMES: Record<Pick["kind"] | TechnicalKind, { one: string; icon: ReactNode }> = {
  ...NAMES,
  concept: { one: "Concept", icon: <ConceptIcon size={18} /> },
  ...TECHNICAL_NAMES,
};

/*
 * The band across the top: its kind, name and where it's from, what it is in
 * a sentence, its status as tiles, and any contradictions. Where several
 * sources say what it is, each says so in its own column below, so there's
 * no one sentence here.
 */
function Hero({
  state,
  kind,
  doc,
  name = doc.name,
  role,
  picture,
  trail,
  tiles,
}: {
  state: DocketState;
  kind: Pick["kind"] | TechnicalKind;
  doc: Doc;
  name?: string;
  role?: string | null;
  picture?: ReactNode;
  trail?: ReactNode;
  tiles: ReactNode;
}) {
  const problems = contradictionsOf(state, kind, doc.id);
  const single = doc.from.length === 1;
  const project = single && state.projects.length > 1 ? projectName(state, doc.from[0].project) : null;
  return (
    <div className="page-hero">
      <div className="page-wrap">
        <div className="page-hero-head">
          {picture}
          <div className="page-hero-text">
            <div className="explore-kind">
              {KIND_NAMES[kind].icon}
              {KIND_NAMES[kind].one}
            </div>
            <h1>{name}</h1>
            {role ? <div className="page-role">{role}</div> : null}
            {trail || project ? (
              <div className="explore-trail">
                {trail}
                {trail && project ? <span className="faint">·</span> : null}
                {project ? (
                  <span className="explore-crumb">
                    <ProjectIcon size={14} />
                    {project}
                  </span>
                ) : null}
              </div>
            ) : null}
            {single && doc.description ? <p className="page-lede">{doc.description}</p> : null}
          </div>
        </div>
        <div className="page-tiles">{tiles}</div>
        {problems.map((p) => (
          <p key={p.message} className="explore-problem">
            <WarningAmberRoundedIcon sx={{ fontSize: 17, flex: "none" }} />
            {p.message}
          </p>
        ))}
      </div>
    </div>
  );
}

/* A figure in the band: what it's about, the figure, and a line saying more. */
function Tile({ label, value, note, tone }: { label: ReactNode; value: ReactNode; note?: ReactNode; tone?: "warn" | "ok" }) {
  return (
    <div className="page-tile" data-tone={tone}>
      <span className="page-tile-label">{label}</span>
      <span className="page-tile-value">{value}</span>
      {note ? <span className="page-tile-note">{note}</span> : null}
    </div>
  );
}

/* The proof in a wide column, beside a narrower one that stays in view: what's left first, then what it's connected to. On a narrow screen, the second comes first. */
function Columns({ main, rail }: { main: ReactNode; rail: ReactNode }) {
  return (
    <div className="page-wrap page-columns">
      <main className="page-main">{main}</main>
      <aside className="page-rail">{rail}</aside>
    </div>
  );
}

function Block({ title, count, id, aside, note, children }: { title: ReactNode; count?: number; id?: string; aside?: ReactNode; note?: ReactNode; children: ReactNode }) {
  return (
    <section className="page-block" id={id}>
      <header className="page-block-head">
        <h2>{title}</h2>
        {count !== undefined ? <span className="explore-count">{count}</span> : null}
        {aside ? <span className="page-block-aside">{aside}</span> : null}
      </header>
      {note ? <p className="page-block-note">{note}</p> : null}
      {children}
    </section>
  );
}

function Card({ title, count, children }: { title?: ReactNode; count?: number; children: ReactNode }) {
  return (
    <section className="page-card">
      {title ? (
        <h3 className="explore-heading">
          {title}
          {count !== undefined ? <span className="explore-count">{count}</span> : null}
        </h3>
      ) : null}
      {children}
    </section>
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
 * What a doc is, beyond its name and description, then more about it, as two
 * sections, the same on every detail page. Under `title`, its fields, by its
 * type, as cards side by side: what it is. Then, under "More about it", its
 * body, as written: anything more its authors wrote, apart from what it is.
 * Where several sources define it, each gets a column in each, headed by
 * where it's from, so they can be compared. Either shows nothing when no
 * source has any.
 */
function About({ kind, doc, title, aside, ...go }: Go & { kind: string; doc: Doc; title: ReactNode; aside?: ReactNode }) {
  const { state } = go;
  const several = doc.from.length > 1;
  const fielded = doc.from.filter((f) => facets(kind, f, go).length || (several && f.description));
  const written = doc.from.filter((f) => f.body.trim());
  return (
    <>
      {fielded.length ? (
        <Block title={title} aside={aside}>
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
        </Block>
      ) : null}
      {written.length ? (
        <Block title={MORE_ABOUT} aside={fielded.length ? undefined : aside}>
          {several ? (
            <div className="page-sources">
              {written.map((f, i) => (
                <div key={i} className="page-source">
                  <SourceFrom state={state} doc={doc} from={f} />
                  <Body from={f} go={go} />
                </div>
              ))}
            </div>
          ) : (
            <div className="page-about">
              <Body from={written[0]} go={go} />
            </div>
          )}
        </Block>
      ) : null}
    </>
  );
}

/* ——— Status ——— */

/* A level's color as `--level`, for marks and bars drawn in it. */
const levelVar = (level: Level) => (theme: Theme) => ({
  "--level": STABILITY[level].colors.light,
  ...theme.applyStyles("dark", { "--level": STABILITY[level].colors.dark }),
});

/* A capability's level: its mark and name in its color, or the word Draft, which has neither. */
function LevelName({ level, name }: { level: CapabilityLevel; name: string }) {
  if (!level) return <CapabilityStability level={null} name={name} focusable={false} />;
  return (
    <Box component="span" className="page-level" sx={levelColor(level)}>
      <CapabilityStability level={level} name={name} focusable={false} />
      {STABILITY[level].name}
    </Box>
  );
}

/* How many capabilities are at each level, as a bar in the levels' colors, with a key. Drafts have no level, so they're in the key alone. */
function LevelBar({ capabilities }: { capabilities: Capability[] }) {
  const counts = STABILITY_LEVEL_IDS.map((level) => ({ level, n: capabilities.filter((c) => c.stability === level).length })).filter((c) => c.n);
  const drafts = capabilities.filter((c) => c.stability === null).length;
  if (!counts.length && !drafts) return null;
  return (
    <span className="level-bar-wrap">
      {counts.length ? (
        <span className="level-bar" aria-hidden>
          {counts.map(({ level, n }) => (
            <Box key={level} component="span" sx={levelVar(level)} style={{ flex: n }} />
          ))}
        </span>
      ) : null}
      <span className="level-bar-key">{[...counts.map(({ level, n }) => `${n} ${STABILITY[level].name}`), ...(drafts ? [plural(drafts, "draft", "drafts")] : [])].join(" · ")}</span>
    </span>
  );
}

function MaturityValue({ value }: { value: number | null }) {
  if (value === null) return <span className="faint">None yet</span>;
  const band = maturityBand(value);
  return (
    <Box component="span" className="page-maturity" sx={levelColor(band)}>
      <RingGlyph progress={value} size={26} />
      {MATURITY_BANDS[band]}
      <span className="page-tile-percent">{value}%</span>
    </Box>
  );
}

/* What's left across capabilities, as a tile. With `technical` false, as for a persona, only what someone using the product would notice. */
function LeftTile({ state, capabilities, technical = true }: { state: DocketState; capabilities: Capability[]; technical?: boolean }) {
  const lefts = capabilities.map((c) => leftIn(state, c, technical));
  const n = lefts.reduce((sum, l) => sum + leftCount(l), 0);
  const open = lefts.filter((l) => leftCount(l)).length;
  return (
    <Tile
      label="What's left"
      value={n ? plural(n, "open item", "open items") : "Nothing open"}
      note={n ? `in ${plural(open, "capability", "capabilities")}` : "No open decisions or gaps"}
      tone={n ? "warn" : "ok"}
    />
  );
}

/*
 * How some rules stand, as a tile: how many hold with evidence, how many on
 * trust, and how many a gap on one of `capabilities` says aren't held yet.
 */
function RulesTile({ rules, capabilities }: { rules: Rule[]; capabilities: Capability[] }) {
  const standing = (r: Rule): RuleStanding => (capabilities.some((c) => ruleStanding(c, r) === "gap") ? "gap" : hasEvidence(r.evidence) ? "evidence" : "trust");
  const count = (s: RuleStanding) => rules.filter((r) => standing(r) === s).length;
  const notHeld = count("gap");
  const note = [
    ...(count("evidence") ? [`${count("evidence")} with evidence`] : []),
    ...(count("trust") ? [`${count("trust")} on trust`] : []),
    ...(notHeld ? [`${notHeld} not held yet`] : []),
  ].join(" · ");
  return <Tile label="Rules" value={rules.length || "No rules"} note={rules.length ? note : "None written down yet"} tone={notHeld ? "warn" : undefined} />;
}

function Avatars({ personas }: { personas: Persona[] }) {
  return (
    <span className="page-avatars">
      {personas.map((p) => (
        <Tip key={p.id} title={personaNameAndRole(p).name}>
          <span>
            <PersonaAvatar persona={p} size={26} />
          </span>
        </Tip>
      ))}
    </span>
  );
}

/* ——— Tables ——— */

/*
 * Capabilities as a table: what each does, its level (in `domain`, when
 * given), how many of its rules have evidence, what's left, and who it
 * serves. Each row opens its page.
 */
function CapabilityTable({ state, capabilities, domain, onOpen }: Go & { capabilities: Capability[]; domain?: string }) {
  if (!capabilities.length) return <p className="concepts-empty">None yet.</p>;
  return (
    <div className="page-table cap-table" role="table">
      <div className="page-table-row page-table-head" role="row">
        <span role="columnheader">Capability</span>
        <span role="columnheader">Level</span>
        <span role="columnheader">Rules with evidence</span>
        <span role="columnheader">What's left</span>
        <span role="columnheader">Serves</span>
      </div>
      {capabilities.map((c) => {
        const level = (domain && c.levels.find((l) => l.domain === domain)?.level) || c.stability;
        const rules = c.rules.flatMap((id) => find(state.rules, id) ?? []);
        const withEvidence = rules.filter((r) => hasEvidence(r.evidence)).length;
        const left = leftIn(state, c);
        const n = leftCount(left);
        return (
          <button key={c.id} type="button" className="page-table-row" role="row" onClick={() => onOpen("capability", c.id)}>
            <span className="page-table-name" role="cell">
              <strong>{c.name}</strong>
              {c.description ? <span>{c.description}</span> : null}
            </span>
            <span role="cell">
              <LevelName level={level} name={c.name} />
            </span>
            <span role="cell">{rules.length ? `${withEvidence} of ${rules.length}` : <span className="faint">No rules</span>}</span>
            <Tip title={n ? leftLine(left) : undefined}>
              <span role="cell" data-tone={n ? "warn" : undefined}>
                {n ? plural(n, "open item", "open items") : <span className="faint">Nothing open</span>}
              </span>
            </Tip>
            <span role="cell">
              <Avatars personas={c.personas.flatMap((id) => find(state.personas, id) ?? [])} />
            </span>
          </button>
        );
      })}
    </div>
  );
}

const VERBS = [
  { verb: "verifies", icon: <FactCheckOutlinedIcon sx={{ fontSize: 14 }} /> },
  { verb: "implements", icon: <CodeRoundedIcon sx={{ fontSize: 14 }} /> },
] as const;

/*
 * Rules as a table: what each says, beside every place that verifies it and
 * every place that implements it. Evidence is optional, so where there's
 * none it says so plainly, with no warning. With `capability`, each rule's
 * mark is whether that capability holds to it. With `followers`, each says
 * which capabilities follow it. `own`, when given, is a first row for a
 * capability's evidence of its own.
 */
function RuleTable({
  state,
  rules,
  own,
  capability,
  followers = false,
  onOpen,
  onConcept,
  onPick,
}: Go & { rules: Rule[]; own?: Evidence; capability?: Capability; followers?: boolean }) {
  const several = state.projects.length > 1;
  const places = (evidence: Evidence, verb: "verifies" | "implements", icon: ReactNode) =>
    evidence[verb].length ? (
      <ul className="page-places">
        {evidence[verb].map((e) => (
          <li key={`${e.project}:${e.file}:${e.line}`}>
            <span className="page-place-icon">{icon}</span>
            <span className="page-place">
              <Tip title={e.text}>
                <code>{e.text}</code>
              </Tip>
              <span className="page-place-where">
                {e.file}:{e.line}
                {several && e.project ? ` · ${projectName(state, e.project)}` : ""}
              </span>
            </span>
          </li>
        ))}
      </ul>
    ) : (
      <span className="faint">None</span>
    );
  const row = (key: string, name: ReactNode, summary: ReactNode, evidence: Evidence) => (
    <div key={key} className="page-table-row" role="row">
      <span className="page-table-name" role="cell">
        {name}
        {summary}
      </span>
      {VERBS.map(({ verb, icon }) => (
        <span key={verb} role="cell" className="page-evidence-cell">
          <span className="page-cell-label">{verb === "verifies" ? "Verified by" : "Implemented by"}</span>
          {places(evidence, verb, icon)}
        </span>
      ))}
    </div>
  );
  if (!rules.length && !own) return <p className="concepts-empty">None written down yet.</p>;
  return (
    <div className="page-table rule-table" role="table">
      <div className="page-table-row page-table-head" role="row">
        <span role="columnheader">Rule</span>
        <span role="columnheader">Verified by</span>
        <span role="columnheader">Implemented by</span>
      </div>
      {own && (own.verifies.length || own.implements.length)
        ? row("own", <strong>The capability as a whole</strong>, <span>Places that name the capability itself, not one of its rules.</span>, own)
        : null}
      {rules.map((r) => {
        const by = followers ? r.capabilities.flatMap((id) => find(state.capabilities, id) ?? []) : [];
        /* The capabilities a gap says don't hold to it yet. */
        const notYet = gapsById(state, r.gaps).flatMap((g) => find(state.capabilities, subjectOf(g).id) ?? []);
        return row(
          r.id,
          <strong className="page-rule-name">
            {capability ? (
              <StandingMark standing={ruleStanding(capability, r)} label={RULE_STANDING_LABELS[ruleStanding(capability, r)]} />
            ) : (
              <RuleRoundedIcon sx={{ fontSize: 15, color: "text.secondary", flex: "none", mt: "2px" }} />
            )}
            {r.name}
          </strong>,
          <>
            {/* What it is, its why, then more about it, folded, as everywhere a doc shows. */}
            {r.from.map((f, i) =>
              f.why?.trim() ? (
                <div key={i} className="page-rule-why">
                  <span className="page-label">Why</span>
                  <Text from={f} text={f.why} go={{ state, onConcept, onPick }} />
                </div>
              ) : null,
            )}
            {r.from.map((f, i) => (
              <MoreAboutFold key={i} from={f} go={{ state, onConcept, onPick }} limit={320} />
            ))}
            <CameFrom kind="rule" id={r.id} go={{ state, onConcept, onPick }} inline />
            {notYet.length ? (
              <span className="explore-evidence-warning">
                <WarningAmberRoundedIcon sx={{ fontSize: 13 }} />
                Not yet held in {notYet.map((c) => c.name).join(", ")}, by a product gap
              </span>
            ) : null}
            {by.length || state.domains.length > 1 ? (
              <span className="page-rule-meta">
                {state.domains.length > 1 ? <span>{domainName(state, r.domain)}</span> : null}
                {by.length ? (
                  <span>
                    Followed by{" "}
                    {by.map((c, i) => (
                      <span key={c.id}>
                        {i ? ", " : ""}
                        <button type="button" className="link" onClick={() => onOpen("capability", c.id)}>
                          {c.name}
                        </button>
                      </span>
                    ))}
                  </span>
                ) : null}
              </span>
            ) : null}
          </>,
          r.evidence,
        );
      })}
    </div>
  );
}

/* ——— Pages ——— */

function CapabilityPage({ capability, ...go }: Go & { capability: Capability }) {
  const { state, onOpen, onConcept, onPick } = go;
  const concepts = capability.concepts.flatMap((id) => find(state.concepts, id) ?? []);
  const rules = capability.rules.flatMap((id) => find(state.rules, id) ?? []);
  const personas = capability.personas.flatMap((id) => find(state.personas, id) ?? []);
  const level = capability.stability;
  const next = nextLevel(level);
  const counts = checklistCounts(state, capability);
  const adds = next ? (state.checklist?.qualities ?? []).flatMap((q) => q.levels).filter((l) => l.level === next).reduce((n, l) => n + l.outcomes.length, 0) : 0;
  const differ = new Set(capability.levels.map((l) => l.level)).size > 1;
  const on = builtOn(state, capability);
  return (
    <>
      <Hero
        state={state}
        kind="capability"
        doc={capability}
        trail={<CapabilityTrail state={state} capability={capability} onOpen={onOpen} />}
        tiles={
          <>
            <Tile
              label="Stability"
              value={<LevelName level={level} name={capability.name} />}
              note={
                differ
                  ? capability.levels.map((l) => `${levelName(l.level)} in ${domainName(state, l.domain)}`).join(" · ")
                  : level
                    ? STABILITY[level].stability
                    : "Declared, not started"
              }
            />
            <LeftTile state={state} capabilities={[capability]} />
            <RulesTile rules={rules} capabilities={[capability]} />
            {counts ? (
              <Tile
                label="Checklist"
                value={`${counts.count - counts.notMet - counts.byChoice} of ${counts.count}`}
                note={`${levelName(level)} outcomes met${counts.evidence ? `, ${counts.evidence} with evidence` : ""}${counts.byChoice ? `, ${counts.byChoice} not met by choice` : ""}`}
                tone={counts.notMet ? "warn" : "ok"}
              />
            ) : null}
            <Tile label="Next level" value={next ? STABILITY[next].name : "None"} note={next ? `Adds ${plural(adds, "outcome", "outcomes")}` : "GA is the top level"} />
          </>
        }
      />
      <Columns
        main={
          <>
            <About {...go} kind="capability" doc={capability} title="What it does" />
            <Block
              title="Rules and evidence"
              count={rules.length}
              note="Following a rule claims it holds. Evidence is optional: a rule with none holds on trust, unless a gap says it isn't held yet."
            >
              <RuleTable {...go} rules={rules} own={capability.evidence} capability={capability} />
            </Block>
            {capability.tradeoffs.length ? (
              <Block title={<LeftLabel kind="tradeoff" size={18} />} count={capability.tradeoffs.length} note="Chosen on purpose, with the benefits and drawbacks that came with each.">
                <Card>
                  <Tradeoffs state={state} ids={capability.tradeoffs} detailed bare />
                </Card>
              </Block>
            ) : null}
            {state.checklist ? (
              <Block title="Stability checklist" id="checklist">
                <StabilityChecklist key={capability.id} state={state} checklist={state.checklist} capability={capability} />
              </Block>
            ) : null}
          </>
        }
        rail={
          <>
            <Card>
              <WhatsLeft
                state={state}
                capability={capability}
                detailed
                checklist={<a href="#checklist">See the checklist</a>}
                onConcept={onConcept}
                onShow={noShow}
                onPick={onPick}
              />
            </Card>
            <DecidedCard {...go} doc={capability} />
            <CameFromCard {...go} kind="capability" id={capability.id} />
            {on.length ? (
              <Card title="Built on" count={on.length}>
                <TechnicalRows state={state} docs={on} />
              </Card>
            ) : null}
            {personas.length ? (
              <Card title="Who it serves" count={personas.length}>
                <PersonaRows state={state} personas={personas} onOpen={onOpen} />
              </Card>
            ) : null}
            {concepts.length ? (
              <Card title="Concepts it uses" count={concepts.length}>
                <ConceptChips concepts={concepts} onOpen={onConcept} scopeOf={(c) => domainName(state, c.domain)} />
              </Card>
            ) : null}
          </>
        }
      />
    </>
  );
}

function FeaturePage({ feature, ...go }: Go & { feature: Feature }) {
  const { state, onOpen, onConcept, onPick } = go;
  const capabilities = feature.capabilities.flatMap((id) => find(state.capabilities, id) ?? []);
  const concepts = featureConcepts(state, feature);
  const rules = [...new Set(capabilities.flatMap((c) => c.rules))].flatMap((id) => find(state.rules, id) ?? []);
  const personas = state.personas.filter((p) => p.features.includes(feature.id));
  return (
    <>
      <Hero
        state={state}
        kind="feature"
        doc={feature}
        trail={<DomainCrumbs state={state} domains={feature.parts.map((p) => p.domain)} onOpen={onOpen} />}
        tiles={
          <>
            <Tile label="Maturity" value={<MaturityValue value={feature.maturity} />} note="From its capabilities' levels" />
            <Tile label="Capabilities" value={capabilities.length} note={<LevelBar capabilities={capabilities} />} />
            <LeftTile state={state} capabilities={capabilities} />
            <RulesTile rules={rules} capabilities={capabilities} />
            {personas.length ? <Tile label="Serves" value={<Avatars personas={personas} />} note={plural(personas.length, "persona", "personas")} /> : null}
          </>
        }
      />
      <Columns
        main={
          <>
            <About {...go} kind="feature" doc={feature} title="About it" />
            {feature.parts.length ? (
              feature.parts.map((part) => (
                <Block
                  key={part.domain}
                  title={feature.parts.length > 1 ? `Capabilities in ${domainName(state, part.domain)}` : "Capabilities"}
                  count={part.capabilities.length}
                  aside={feature.parts.length > 1 ? <MaturityValue value={part.maturity} /> : undefined}
                >
                  <CapabilityTable {...go} capabilities={part.capabilities.flatMap((id) => find(state.capabilities, id) ?? [])} domain={part.domain} />
                </Block>
              ))
            ) : (
              <Block title="Capabilities">
                <p className="concepts-empty">A job the software doesn't do yet.</p>
              </Block>
            )}
            {feature.tradeoffs.length ? (
              <Block title={<LeftLabel kind="tradeoff" size={18}>Decided not to build</LeftLabel>} count={feature.tradeoffs.length} note="Left out on purpose, with the benefits and drawbacks of leaving each out.">
                <Card>
                  <Tradeoffs state={state} ids={feature.tradeoffs} detailed bare />
                </Card>
              </Block>
            ) : null}
            {rules.length ? (
              <Block title="Rules and evidence" count={rules.length}>
                <RuleTable {...go} rules={rules} followers />
              </Block>
            ) : null}
          </>
        }
        rail={
          <>
            <Card>
              <LeftRollup state={state} own={feature} capabilities={capabilities} onOpen={onOpen} detailed onConcept={onConcept} onPick={onPick} />
            </Card>
            <DecidedCard {...go} doc={feature} />
            <CameFromCard {...go} kind="feature" id={feature.id} />
            {personas.length ? (
              <Card title="Who it serves" count={personas.length}>
                <PersonaRows state={state} personas={personas} feature={feature} onOpen={onOpen} />
              </Card>
            ) : null}
            {builtOnAll(state, capabilities).length ? (
              <Card title="Built on" count={builtOnAll(state, capabilities).length}>
                <TechnicalRows state={state} docs={builtOnAll(state, capabilities)} />
              </Card>
            ) : null}
            {concepts.length ? (
              <Card title="Concepts its capabilities use" count={concepts.length}>
                <ConceptChips concepts={concepts} onOpen={onConcept} scopeOf={(c) => domainName(state, c.domain)} />
              </Card>
            ) : null}
          </>
        }
      />
    </>
  );
}

function DomainPage({ domain, ...go }: Go & { domain: Domain }) {
  const { state, onOpen, onConcept, onPick } = go;
  const features = domain.features.flatMap((id) => find(state.features, id) ?? []);
  const loose = domain.capabilities.flatMap((id) => find(state.capabilities, id) ?? []);
  const capabilities = domainCapabilities(state, domain);
  const concepts = state.concepts.filter((c) => c.domain === domain.id).sort((a, b) => a.name.localeCompare(b.name));
  const rules = state.rules.filter((r) => r.domain === domain.id);
  return (
    <>
      <Hero
        state={state}
        kind="domain"
        doc={domain}
        tiles={
          <>
            <Tile label="Maturity" value={<MaturityValue value={domain.maturity} />} note="From its parts of features" />
            <Tile label="Features" value={features.length} note={loose.length ? `and ${plural(loose.length, "capability", "capabilities")} in none` : undefined} />
            <Tile label="Capabilities" value={capabilities.length} note={<LevelBar capabilities={capabilities} />} />
            <LeftTile state={state} capabilities={capabilities} />
            <RulesTile rules={rules} capabilities={capabilities} />
          </>
        }
      />
      <Columns
        main={
          <>
            <About {...go} kind="domain" doc={domain} title="About it" />
            <Block title="Features" count={features.length}>
              {features.length ? (
                <div className="page-feature-grid">
                  {features.map((f) => {
                    const part = partOf(f, domain.id);
                    const caps = (part?.capabilities ?? []).flatMap((id) => find(state.capabilities, id) ?? []);
                    const elsewhere = f.parts.filter((p) => p.domain !== domain.id).map((p) => domainName(state, p.domain));
                    return (
                      <button key={f.id} type="button" className="page-feature" onClick={() => onOpen("feature", f.id)}>
                        <span className="page-feature-head">
                          {NAMES.feature.icon}
                          <strong>{f.name}</strong>
                          {part?.maturity != null ? <RingGlyph progress={part.maturity} size={22} /> : null}
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
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="concepts-empty">A part of the business the software doesn't serve yet.</p>
              )}
            </Block>
            {loose.length ? (
              <Block title="Capabilities in no feature" count={loose.length}>
                <CapabilityTable {...go} capabilities={loose} domain={domain.id} />
              </Block>
            ) : null}
            {rules.length ? (
              <Block title="Rules and evidence" count={rules.length}>
                <RuleTable {...go} rules={rules} followers />
              </Block>
            ) : null}
          </>
        }
        rail={
          <>
            <Card>
              <LeftRollup state={state} own={domain} capabilities={capabilities} onOpen={onOpen} detailed onConcept={onConcept} onPick={onPick} />
            </Card>
            <DecidedCard {...go} doc={domain} />
            {concepts.length ? (
              <Card title="Glossary" count={concepts.length}>
                <ul>
                  {concepts.map((c) => (
                    <li key={c.id}>
                      <Row icon={<ConceptIcon size={15} />} name={c.name} summary={c.description} onClick={() => onConcept(c.id)} />
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}
          </>
        }
      />
    </>
  );
}

function PersonaPage({ persona, ...go }: Go & { persona: Persona }) {
  const { state, onOpen, onConcept, onPick } = go;
  const capabilities = persona.capabilities.flatMap((id) => find(state.capabilities, id) ?? []);
  const features = persona.features.flatMap((id) => find(state.features, id) ?? []);
  const loose = capabilities.filter((c) => !c.feature);
  const domains = [...new Set(capabilities.flatMap((c) => docDomains(c)))];
  return (
    <>
      <Hero
        state={state}
        kind="persona"
        doc={persona}
        {...personaNameAndRole(persona)}
        picture={<PersonaAvatar persona={persona} size={88} />}
        trail={domains.length ? <DomainCrumbs state={state} domains={domains} onOpen={onOpen} /> : undefined}
        tiles={
          <>
            <Tile
              label="Readiness"
              value={persona.readiness !== null ? <ReadinessMeter value={persona.readiness} basis={readinessBasis(state, persona)} large /> : "None yet"}
              note="From the levels of what serves them"
            />
            <Tile label="Features" value={features.length} note="that serve them" />
            <Tile label="Capabilities" value={capabilities.length} note={<LevelBar capabilities={capabilities} />} />
            <LeftTile state={state} capabilities={capabilities} technical={false} />
          </>
        }
      />
      <Columns
        main={
          <>
            <About {...go} kind="persona" doc={persona} title="Who they are" />
            {features.map((f) => {
              const readiness = personaReadinessIn(state, persona, f);
              return (
                <Block
                  key={f.id}
                  title={
                    <button type="button" className="link page-block-link" onClick={() => onOpen("feature", f.id)}>
                      {NAMES.feature.icon}
                      {f.name}
                    </button>
                  }
                  aside={readiness !== null ? <ReadinessMeter value={readiness} basis={readinessBasis(state, persona, f)} large /> : undefined}
                >
                  <CapabilityTable {...go} capabilities={capabilities.filter((c) => c.feature === f.id)} />
                </Block>
              );
            })}
            {!features.length ? (
              <Block title="What serves them">
                <p className="concepts-empty">No feature serves them yet.</p>
              </Block>
            ) : null}
            {loose.length ? (
              <Block title="Capabilities in no feature" count={loose.length}>
                <CapabilityTable {...go} capabilities={loose} />
              </Block>
            ) : null}
          </>
        }
        rail={
          <>
            <Card>
              <LeftRollup state={state} capabilities={capabilities} technical={false} onOpen={onOpen} detailed onConcept={onConcept} onPick={onPick} />
            </Card>
            <CameFromCard {...go} kind="persona" id={persona.id} />
          </>
        }
      />
    </>
  );
}

function ConceptPage({ concept, ...go }: Go & { concept: Concept }) {
  const { state, onOpen, onConcept } = go;
  const groups = byFeature(state, concept.capabilities);
  const rules = concept.rules.flatMap((id) => find(state.rules, id) ?? []);
  const others = related(state, concept);
  const elsewhere = state.concepts.filter((c) => c.id !== concept.id && bareId(c.id) === bareId(concept.id));
  return (
    <>
      <Hero
        state={state}
        kind="concept"
        doc={concept}
        trail={
          <span className="explore-crumb">
            <DomainIcon size={14} />
            <button type="button" className="link" onClick={() => onOpen("domain", concept.domain)}>
              {domainName(state, concept.domain)}
            </button>
          </span>
        }
        tiles={
          <>
            <Tile label="Used by" value={plural(concept.capabilities.length, "capability", "capabilities")} note={plural(groups.filter((g) => g.feature).length, "feature", "features")} />
            <Tile label="Referred to by" value={plural(rules.length, "rule", "rules")} />
            {elsewhere.length ? <Tile label="Also defined in" value={elsewhere.map((c) => domainName(state, c.domain)).join(", ")} note="With a meaning of its own there" /> : null}
          </>
        }
      />
      <Columns
        main={
          <>
            <About {...go} kind="concept" doc={concept} title="What it means" aside={<code className="faint">{concept.file}</code>} />
            <Block title="Rules that refer to it" count={rules.length}>
              <RuleTable {...go} rules={rules} followers />
            </Block>
          </>
        }
        rail={
          <>
            <CameFromCard {...go} kind="concept" id={concept.id} />
            <Card title="Used by" count={concept.capabilities.length}>
              {groups.length ? (
                groups.map(({ feature, capabilities }) => (
                  <div key={feature?.id ?? ""} className="concept-group">
                    <div className="concept-group-name">
                      {NAMES.feature.icon}
                      {feature ? (
                        <button type="button" className="link" onClick={() => onOpen("feature", feature.id)}>
                          {feature.name}
                        </button>
                      ) : (
                        "Not in a feature"
                      )}
                    </div>
                    <ul>
                      {capabilities.map((c) => (
                        <li key={c.id}>
                          <Row icon={NAMES.capability.icon} name={c.name} onClick={() => onOpen("capability", c.id)}>
                            <CapabilityStability level={c.stability} name={c.name} focusable={false} />
                          </Row>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <p className="concepts-empty">No capability says it uses this yet.</p>
              )}
            </Card>
            {elsewhere.length ? (
              <Card title="The same word elsewhere">
                <ul>
                  {elsewhere.map((c) => (
                    <li key={c.id}>
                      <Row icon={<ConceptIcon size={15} />} name={`In ${domainName(state, c.domain)}`} summary={c.description} onClick={() => onConcept(c.id)} />
                    </li>
                  ))}
                </ul>
              </Card>
            ) : null}
            {others.length ? (
              <Card title="Related concepts" count={others.length}>
                <ConceptChips concepts={others} onOpen={onConcept} />
              </Card>
            ) : null}
          </>
        }
      />
    </>
  );
}

/* Every mechanism and component some capabilities are built on, each once. */
const builtOnAll = (state: DocketState, capabilities: Capability[]) => [...new Set(capabilities.flatMap((c) => builtOn(state, c)))];

/* A doc's open decisions, from each of its sources, as a list. */
function Decisions({ doc, ...go }: Go & { doc: Doc }) {
  return (
    <>
      {doc.from.map((f, i) => {
        const open = (f.decisions ?? []).filter((d) => d.status !== "closed");
        return open.length ? <DecisionList key={i} from={f} decisions={open} go={go} /> : null;
      })}
    </>
  );
}

/* A doc's closed decisions, with what each became, in a card of their own, or nothing with none. */
function DecidedCard({ doc, ...go }: Go & { doc: Doc }) {
  const count = closedDecisions(doc).length;
  return count ? (
    <Card title="Decided" count={count}>
      <Decided doc={doc} go={go} />
    </Card>
  ) : null;
}

/* The closed decisions this came from, in a card of their own, or nothing with none. */
function CameFromCard({ kind, id, ...go }: Go & { kind: BecameKind; id: string }) {
  const count = decidedBy(go.state, kind, id).length;
  return count ? (
    <Card title="Came from a decision" count={count}>
      <CameFrom kind={kind} id={id} go={go} />
    </Card>
  ) : null;
}

/* Capabilities as rows, each with its level, opening its page. */
function CapabilityList({ capabilities, onOpen }: { capabilities: Capability[]; onOpen: Go["onOpen"] }) {
  return (
    <ul>
      {capabilities.map((c) => (
        <li key={c.id}>
          <Row icon={NAMES.capability.icon} name={c.name} summary={c.description} onClick={() => onOpen("capability", c.id)}>
            <CapabilityStability level={c.stability} name={c.name} focusable={false} />
          </Row>
        </li>
      ))}
    </ul>
  );
}

/*
 * A mechanism or component: how it's built, in the code's words, and where that
 * falls short of what we intend. Its technical gaps; its tradeoffs, with their benefits and drawbacks; where it is in the code,
 * from the annotations that implement or verify it; the checklist outcomes it meets for the capabilities it serves;
 * and, beside them,
 * its open decisions and the capabilities that rely on it.
 */
function TechnicalPage({ doc, ...go }: Go & { doc: TechnicalDoc }) {
  const { state, onOpen } = go;
  const capabilities = doc.capabilities.flatMap((id) => find(state.capabilities, id) ?? []);
  const gaps = gapsById(state, doc.gaps);
  const outcomes = doc.meets.flatMap((id) => checklistOutcome(state.checklist, id) ?? []);
  const places = doc.evidence.implements.length + doc.evidence.verifies.length;
  const decisions = openDecisions(doc);
  return (
    <>
      <Hero
        state={state}
        kind={doc.kind}
        doc={doc}
        tiles={
          <>
            <Tile label="Serves" value={plural(capabilities.length, "capability", "capabilities")} note={<LevelBar capabilities={capabilities} />} />
            <Tile label={<LeftLabel kind="technical-gap" size={13} />} value={gaps.length || "None"} note={gaps.length ? "What only someone working on the code would notice" : "None written down"} />
            <Tile label={<LeftLabel kind="tradeoff" size={13} />} value={doc.tradeoffs.length || "None"} note="Chosen on purpose, benefits and drawbacks alike" />
            <Tile label="Outcomes it meets" value={outcomes.length || "None"} note={places ? `Evidence in ${plural(places, "place", "places")}` : "Nothing points at it yet"} />
          </>
        }
      />
      <Columns
        main={
          <>
            <About {...go} kind={doc.kind} doc={doc} title="How it's built" />
            <Block title={<LeftLabel kind="technical-gap" size={18} />} count={gaps.length} note={gaps.length ? "Shortfalls we know about and mean to close. Written down so nobody is surprised, each with what it affects." : undefined}>
              {gaps.length ? (
                <Card>
                  <LeftList detailed>
                    {gaps.map((g) => (
                      <GapItem key={g.id} state={state} gap={g} detailed />
                    ))}
                  </LeftList>
                </Card>
              ) : (
                <p className="concepts-empty">None written down: nothing only someone working on the code would notice.</p>
              )}
            </Block>
            {doc.tradeoffs.length ? (
              <Block title={<LeftLabel kind="tradeoff" size={18} />} count={doc.tradeoffs.length} note="Chosen on purpose, with the benefits and drawbacks that came with each.">
                <Card>
                  <Tradeoffs state={state} ids={doc.tradeoffs} detailed bare />
                </Card>
              </Block>
            ) : null}
            <Block title="In the code" count={places || undefined} note="Where the code says it implements or verifies it, from its annotations.">
              <Card>
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
              </Card>
            </Block>
            <Block title="Outcomes it meets" count={outcomes.length}>
              {outcomes.length ? (
                <Card>
                  <p className="faint page-note">
                    For each capability it serves, these count as met on its checklist, with the places in the code as evidence, unless a gap names one.
                  </p>
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
                </Card>
              ) : (
                <p className="concepts-empty">It doesn't say it meets any checklist outcome.</p>
              )}
            </Block>
          </>
        }
        rail={
          <>
            <Card title={<LeftLabel kind="decision" size={14} />} count={decisions.length || undefined}>
              {decisions.length ? <Decisions {...go} doc={doc} /> : <p className="concepts-empty">None written down.</p>}
            </Card>
            <DecidedCard {...go} doc={doc} />
            <CameFromCard {...go} kind={doc.kind} id={doc.id} />
            <Card title={doc.kind === "component" ? "Capabilities that rely on it" : doc.applies === "platform" ? "Applies across the platform" : "Applies to"} count={capabilities.length}>
              {capabilities.length ? <CapabilityList capabilities={capabilities} onOpen={onOpen} /> : <p className="concepts-empty">{doc.kind === "mechanism" ? doc.applies === "platform" ? "Its platform serves none yet." : "Its project serves none yet." : "It doesn't list any."}</p>}
            </Card>
          </>
        }
      />
    </>
  );
}

/* What a gap, tradeoff or open decision is on, as a link to its page: a capability with its level, a feature, a domain, a mechanism or a component. */
function SubjectLink({ state, type, id, onPick }: { state: DocketState; type: string; id: string; onPick: Go["onPick"] }) {
  if (type === "mechanism" || type === "component") {
    const doc = technicalDoc(state, `${type}:${id}`);
    return doc ? <TechnicalLink doc={doc} /> : <span>{id}</span>;
  }
  const kind = type as "capability" | "feature" | "domain";
  const doc = find<Doc>(pickList(state, kind), id);
  const capability = kind === "capability" ? (doc as Capability | undefined) : undefined;
  return (
    <span className="explore-crumb">
      <button type="button" className="link explore-crumb" onClick={() => onPick({ kind, id })}>
        {kind === "domain" ? <DomainIcon size={14} /> : NAMES[kind].icon}
        {doc?.name ?? id}
      </button>
      {capability ? <CapabilityStability level={capability.stability} name={capability.name} focusable={false} /> : null}
    </span>
  );
}

type Show = "all" | "product" | "technical";

/*
 * Everything that differs from what's intended, across the projects showing,
 * on one page: gaps and tradeoffs by what they're on, and open decisions
 * by where they are. It can show just what someone using the product would
 * notice, or just technical gaps.
 */
function GapsPage(go: Go) {
  const { state, onPick } = go;
  const [show, setShow] = useState<Show>("all");
  const technicalType = (type: string) => type === "mechanism" || type === "component";
  const shown = (type: string) => show === "all" || (show === "technical") === technicalType(type);

  const gaps = state.gaps.filter((g) => shown(subjectOf(g).type));
  const productGaps = state.gaps.filter((g) => !technicalType(subjectOf(g).type)).length;
  const tradeoffs = state.tradeoffs.filter((t) => shown(subjectOf(t).type));
  const decided: { type: string; doc: Doc }[] = [
    ...state.domains.map((doc) => ({ type: "domain", doc })),
    ...state.features.map((doc) => ({ type: "feature", doc })),
    ...state.capabilities.map((doc) => ({ type: "capability", doc })),
    ...state.mechanisms.map((doc) => ({ type: "mechanism", doc })),
    ...state.components.map((doc) => ({ type: "component", doc })),
  ].filter(({ type, doc }) => shown(type) && openDecisions(doc).length);
  const decisions = decided.reduce((n, { doc }) => n + openDecisions(doc).length, 0);
  /* Where decisions have been made, and how many. */
  const closedOn = [
    ...state.domains.map((doc) => ({ type: "domain", doc })),
    ...state.features.map((doc) => ({ type: "feature", doc })),
    ...state.capabilities.map((doc) => ({ type: "capability", doc })),
    ...state.mechanisms.map((doc) => ({ type: "mechanism", doc })),
    ...state.components.map((doc) => ({ type: "component", doc })),
  ].filter(({ type, doc }) => shown(type) && closedDecisions(doc).length);
  const closed = closedOn.reduce((n, { doc }) => n + closedDecisions(doc).length, 0);
  /* Gaps and tradeoffs grouped by what they're on, in the order they come. */
  const bySubject = <T extends { id: string }>(items: T[]) =>
    [...new Set(items.map((i) => i.id.slice(0, i.id.indexOf("#"))))].map((key) => ({
      ...subjectOf({ id: `${key}#` }),
      items: items.filter((i) => i.id.startsWith(`${key}#`)),
    }));
  const gapGroups = bySubject(gaps);
  const tradeoffGroups = bySubject(tradeoffs);
  const technicalDocs = [...state.mechanisms, ...state.components];

  return (
    <>
      <div className="page-hero">
        <div className="page-wrap">
          <div className="page-hero-head">
            <div className="page-hero-text">
              <div className="explore-kind">
                <GapIcon sx={{ fontSize: 17 }} />
                Across {state.projects.length === 1 ? state.projects[0].name : plural(state.projects.length, "project", "projects")}
              </div>
              <h1>Gaps and tradeoffs</h1>
              <p className="page-lede">
                Where the software differs from what's intended: what's left to close, what's still to decide, and what we chose to live with.
              </p>
            </div>
          </div>
          <div className="page-tiles">
            <Tile label={<LeftLabel kind="product-gap" size={13} />} value={productGaps || "None"} note="What someone using it would notice" />
            <Tile label={<LeftLabel kind="technical-gap" size={13} />} value={state.gaps.length - productGaps || "None"} note="What only someone working on the code would" />
            <Tile label={<LeftLabel kind="decision" size={13} />} value={decisions || "None"} note={`In ${plural(decided.length, "place", "places")}`} />
            <Tile label={<LeftLabel kind="tradeoff" size={13} />} value={state.tradeoffs.length || "None"} note="Chosen on purpose, benefits and drawbacks alike" />
          </div>
        </div>
      </div>
      <Columns
        main={
          <>
            <div className="page-show" role="radiogroup" aria-label="Show">
              {(
                [
                  ["all", "Everything"],
                  ["product", "Product gaps"],
                  ["technical", "Technical gaps"],
                ] as const
              ).map(([value, label]) => (
                <button key={value} type="button" role="radio" aria-checked={show === value} className="filter-toggle" aria-pressed={show === value} onClick={() => setShow(value)}>
                  {label}
                </button>
              ))}
            </div>
            <Block title={<LeftLabel kind="product-gap" size={18}>Gaps</LeftLabel>} count={gaps.length} note={gaps.length ? "Shortfalls we know about and mean to close. Written down so nobody is surprised, each with what it affects." : undefined}>
              {gapGroups.length ? (
                <Card>
                  {gapGroups.map((g) => (
                    <div key={`${g.type}:${g.id}`} className="page-subject-group">
                      <div className="page-subject">
                        <SubjectLink state={state} type={g.type} id={g.id} onPick={onPick} />
                      </div>
                      <LeftList detailed>
                        {g.items.map((gap) => (
                          <GapItem key={gap.id} state={state} gap={gap} detailed />
                        ))}
                      </LeftList>
                    </div>
                  ))}
                </Card>
              ) : (
                <p className="concepts-empty">None written down.</p>
              )}
            </Block>
            <Block title={<LeftLabel kind="tradeoff" size={18} />} count={tradeoffs.length} note={tradeoffs.length ? "Chosen on purpose, with the benefits and drawbacks that came with each." : undefined}>
              {tradeoffGroups.length ? (
                <Card>
                  {tradeoffGroups.map((g) => (
                    <div key={`${g.type}:${g.id}`} className="page-subject-group">
                      <div className="page-subject">
                        <SubjectLink state={state} type={g.type} id={g.id} onPick={onPick} />
                        {g.type === "feature" ? <span className="faint">Decided not to build</span> : null}
                      </div>
                      <Tradeoffs state={state} ids={g.items.map((t) => t.id)} detailed bare />
                    </div>
                  ))}
                </Card>
              ) : (
                <p className="concepts-empty">None written down.</p>
              )}
            </Block>
          </>
        }
        rail={
          <>
            <Card title={<LeftLabel kind="decision" size={14} />} count={decisions || undefined}>
              {decided.length ? (
                decided.map(({ type, doc }) => (
                  <div key={`${type}:${doc.id}`} className="page-subject-group">
                    <div className="page-subject">
                      <SubjectLink state={state} type={type} id={doc.id} onPick={onPick} />
                    </div>
                    <Decisions {...go} doc={doc} />
                  </div>
                ))
              ) : (
                <p className="concepts-empty">None written down.</p>
              )}
            </Card>
            {closed ? (
              <Card title="Decided" count={closed}>
                {closedOn.map(({ type, doc }) => (
                  <div key={`${type}:${doc.id}`} className="page-subject-group">
                    <div className="page-subject">
                      <SubjectLink state={state} type={type} id={doc.id} onPick={onPick} />
                    </div>
                    <Decided doc={doc} go={go} />
                  </div>
                ))}
              </Card>
            ) : null}
            {technicalDocs.length ? (
              <Card title="How it's built" count={technicalDocs.length}>
                <TechnicalRows state={state} docs={technicalDocs} />
              </Card>
            ) : null}
          </>
        }
      />
    </>
  );
}
