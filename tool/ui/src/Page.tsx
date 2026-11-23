import { useEffect, useRef, useState, type ReactNode } from "react";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import IncompleteCircleRoundedIcon from "@mui/icons-material/IncompleteCircleRounded";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import { StabilityChecklist } from "./Checklist";
import { ConceptChips, ConceptIcon, Markdown, related } from "./Concepts";
import { RingGlyph } from "./design/maturity/RingGlyph";
import { MATURITY_BANDS, maturityBand } from "./design/maturity/maturity";
import { STABILITY, STABILITY_LEVEL_IDS, levelColor } from "./design/stability/stability";
import { CapabilityStability } from "./design/catalog/CapabilityLabel";
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
  Places,
  Row,
  Tradeoffs,
  WhatsLeft,
  withoutDecisions,
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
  dueOf,
  technicalDoc,
  gapsById,
  openDecisions,
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
  type Due,
  type TechnicalDoc,
  type TechnicalKind,
  type Evidence,
  type Feature,
  type Level,
  type PageAt,
  type Persona,
  type Pick,
  type Rule,
} from "./state";

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
      : page.kind === "system" || page.kind === "component"
        ? find(page.kind === "system" ? state.systems : state.components, page.id)
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
  const onMap = doc && page.kind !== "gaps" && page.kind !== "system" && page.kind !== "component" ? (page as Pick) : undefined;
  const back = mapHref(onMap);

  return (
    <div className="page" ref={scroller}>
      <header className="page-top">
        <a className="page-brand" href={back} title="The map">
          <Logo />
        </a>
        <a className="page-back" href={back} title={onMap ? `Back to the map, with ${doc!.name} open` : "Back to the map"}>
          <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
          Map
        </a>
        <span className="divider" aria-hidden />
        <span className="page-projects">{state.projects.map((p) => p.name).join(", ")}</span>
        <a className="filter-toggle" href={pageHref({ kind: "gaps", id: "" })} aria-current={page.kind === "gaps" ? "page" : undefined}>
          <IncompleteCircleRoundedIcon sx={{ fontSize: 14 }} />
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
      ) : page.kind === "system" || page.kind === "component" ? (
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
            {single && doc.summary ? <p className="page-lede">{doc.summary}</p> : null}
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
function Tile({ label, value, note, tone }: { label: string; value: ReactNode; note?: ReactNode; tone?: "warn" | "ok" }) {
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

function Block({ title, count, id, aside, children }: { title: ReactNode; count?: number; id?: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="page-block" id={id}>
      <header className="page-block-head">
        <h2>{title}</h2>
        {count !== undefined ? <span className="explore-count">{count}</span> : null}
        {aside ? <span className="page-block-aside">{aside}</span> : null}
      </header>
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

/* A body's parts: what comes before any heading, then each `##` section, with its heading. */
function bodySections(body: string): { heading: string | null; text: string }[] {
  const parts: { heading: string | null; text: string }[] = [{ heading: null, text: "" }];
  for (const line of body.split("\n")) {
    const heading = line.match(/^#{1,2}\s+(.*)$/);
    if (heading) parts.push({ heading: heading[1].trim(), text: "" });
    else parts[parts.length - 1].text += `${line}\n`;
  }
  return parts.filter((p) => p.text.trim());
}

/*
 * What a doc's body says, its sections side by side as cards, such as a
 * capability's Covers, Learning and Success, or a persona's Needs and
 * Context. Where several sources define it, each gets a column, headed by
 * where it's from, so they can be compared.
 */
function Sources({ state, doc, body = (f) => f.body, onConcept, onPick }: Go & { doc: Doc; body?: (f: Contribution) => string }) {
  const several = doc.from.length > 1;
  const shown = doc.from.filter((f) => body(f).trim() || (several && f.summary));
  if (!shown.length) return null;
  const sections = (f: Contribution) =>
    bodySections(body(f)).map((s, i) => (
      <div key={i} className="page-facet">
        {s.heading ? <span className="page-label">{s.heading}</span> : null}
        <Markdown state={state} concept={f} text={s.text} onConcept={onConcept} onShow={noShow} onPick={onPick} />
      </div>
    ));
  if (!several) return <div className="page-facets">{sections(shown[0])}</div>;
  return (
    <div className="page-sources">
      {shown.map((f, i) => (
        <div key={i} className="page-source">
          <div className="page-source-from">
            {doc.from.some((o) => o.domain !== f.domain) ? (
              <span className="explore-crumb">
                <DomainIcon size={14} />
                {domainName(state, f.domain)}
              </span>
            ) : null}
            <span className="explore-crumb">
              <ProjectIcon size={14} />
              {projectName(state, f.project)}
            </span>
          </div>
          {f.summary ? <p className="page-source-summary">{f.summary}</p> : null}
          {sections(f)}
        </div>
      ))}
    </div>
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
      note={n ? `in ${plural(open, "capability", "capabilities")}` : "No open decisions, gaps, or rules without evidence"}
      tone={n ? "warn" : "ok"}
    />
  );
}

/* How many of some rules something verifies, as a tile. */
function RulesTile({ rules }: { rules: Rule[] }) {
  const verified = rules.filter((r) => r.evidence.verifies.length).length;
  const implemented = rules.filter((r) => r.evidence.implements.length).length;
  return (
    <Tile
      label="Rules verified"
      value={rules.length ? `${verified} of ${rules.length}` : "No rules"}
      note={rules.length ? `${implemented} of ${rules.length} implemented` : "None written down yet"}
      tone={rules.length && (verified < rules.length || implemented < rules.length) ? "warn" : undefined}
    />
  );
}

function Avatars({ personas }: { personas: Persona[] }) {
  return (
    <span className="page-avatars">
      {personas.map((p) => (
        <span key={p.id} title={personaNameAndRole(p).name}>
          <PersonaAvatar persona={p} size={26} />
        </span>
      ))}
    </span>
  );
}

/* ——— Tables ——— */

/*
 * Capabilities as a table: what each does, its level (in `domain`, when
 * given), how many of its rules something verifies, what's left, and who it
 * serves. Each row opens its page.
 */
function CapabilityTable({ state, capabilities, domain, onOpen }: Go & { capabilities: Capability[]; domain?: string }) {
  if (!capabilities.length) return <p className="concepts-empty">None yet.</p>;
  return (
    <div className="page-table cap-table" role="table">
      <div className="page-table-row page-table-head" role="row">
        <span role="columnheader">Capability</span>
        <span role="columnheader">Level</span>
        <span role="columnheader">Rules verified</span>
        <span role="columnheader">What's left</span>
        <span role="columnheader">Serves</span>
      </div>
      {capabilities.map((c) => {
        const level = (domain && c.levels.find((l) => l.domain === domain)?.level) || c.stability;
        const rules = c.rules.flatMap((id) => find(state.rules, id) ?? []);
        const verified = rules.filter((r) => r.evidence.verifies.length).length;
        const left = leftIn(state, c);
        const n = leftCount(left);
        return (
          <button key={c.id} type="button" className="page-table-row" role="row" onClick={() => onOpen("capability", c.id)}>
            <span className="page-table-name" role="cell">
              <strong>{c.name}</strong>
              {c.summary ? <span>{c.summary}</span> : null}
            </span>
            <span role="cell">
              <LevelName level={level} name={c.name} />
            </span>
            <span role="cell" data-tone={rules.length && verified < rules.length ? "warn" : undefined}>
              {rules.length ? `${verified} of ${rules.length}` : <span className="faint">No rules</span>}
            </span>
            <span role="cell" data-tone={n ? "warn" : undefined} title={n ? leftLine(left) : undefined}>
              {n ? plural(n, "open item", "open items") : <span className="faint">Nothing open</span>}
            </span>
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
  { verb: "verifies", none: "Nothing verifies it", icon: <FactCheckOutlinedIcon sx={{ fontSize: 14 }} /> },
  { verb: "implements", none: "Nothing implements it", icon: <CodeRoundedIcon sx={{ fontSize: 14 }} /> },
] as const;

/*
 * Rules as a table: what each says, beside every place that verifies it and
 * every place that implements it, with a warning where there's none. With
 * `followers`, each says which capabilities follow it. `own`, when given,
 * is a first row for a capability's evidence of its own.
 */
function RuleTable({ state, rules, own, followers = false, onOpen }: Go & { rules: Rule[]; own?: Evidence; followers?: boolean }) {
  const several = state.projects.length > 1;
  const places = (evidence: Evidence, verb: "verifies" | "implements", none: string, icon: ReactNode) =>
    evidence[verb].length ? (
      <ul className="page-places">
        {evidence[verb].map((e) => (
          <li key={`${e.project}:${e.file}:${e.line}`}>
            <span className="page-place-icon">{icon}</span>
            <span className="page-place">
              <code title={e.text}>{e.text}</code>
              <span className="page-place-where">
                {e.file}:{e.line}
                {several && e.project ? ` · ${projectName(state, e.project)}` : ""}
              </span>
            </span>
          </li>
        ))}
      </ul>
    ) : (
      <span className="explore-evidence-warning">
        <WarningAmberRoundedIcon sx={{ fontSize: 13 }} />
        {none}
      </span>
    );
  const row = (key: string, name: ReactNode, summary: ReactNode, evidence: Evidence) => (
    <div key={key} className="page-table-row" role="row">
      <span className="page-table-name" role="cell">
        {name}
        {summary}
      </span>
      {VERBS.map(({ verb, none, icon }) => (
        <span key={verb} role="cell" className="page-evidence-cell">
          <span className="page-cell-label">{verb === "verifies" ? "Verified by" : "Implemented by"}</span>
          {places(evidence, verb, none, icon)}
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
            <RuleRoundedIcon sx={{ fontSize: 15, color: "text.secondary", flex: "none", mt: "2px" }} />
            {r.name}
          </strong>,
          <>
            {r.summary ? <span>{r.summary}</span> : null}
            {notYet.length ? (
              <span className="explore-evidence-warning">
                <WarningAmberRoundedIcon sx={{ fontSize: 13 }} />
                Not yet held in {notYet.map((c) => c.name).join(", ")}, by a known gap
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
            <RulesTile rules={rules} />
            {counts ? (
              <Tile
                label="Checklist"
                value={`${counts.count - counts.notMet} of ${counts.count}`}
                note={`${levelName(level)} outcomes met${counts.evidence ? `, ${counts.evidence} with evidence` : ""}`}
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
            {capability.from.some((f) => withoutDecisions(f).trim()) || capability.from.length > 1 ? (
              <Block title="What it does">
                <Sources {...go} doc={capability} body={withoutDecisions} />
              </Block>
            ) : null}
            <Block title="Rules and evidence" count={rules.length}>
              <RuleTable {...go} rules={rules} own={capability.evidence} />
            </Block>
            {capability.tradeoffs.length ? (
              <Block title="Tradeoffs" count={capability.tradeoffs.length}>
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
            {capability.code.length ? (
              <Card title="Code" count={capability.code.length}>
                <ul className="page-code">
                  {capability.code.map((c) => (
                    <li key={c.glob}>
                      <code>{c.glob}</code>
                      <span className="faint">{plural(c.files, "file", "files")}</span>
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
            <RulesTile rules={rules} />
            {personas.length ? <Tile label="Serves" value={<Avatars personas={personas} />} note={plural(personas.length, "persona", "personas")} /> : null}
          </>
        }
      />
      <Columns
        main={
          <>
            {feature.from.some((f) => withoutDecisions(f).trim()) || feature.from.length > 1 ? (
              <Block title="About it">
                <Sources {...go} doc={feature} body={withoutDecisions} />
              </Block>
            ) : null}
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
              <Block title="Decided not to build" count={feature.tradeoffs.length}>
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
            <RulesTile rules={rules} />
          </>
        }
      />
      <Columns
        main={
          <>
            {domain.from.some((f) => withoutDecisions(f).trim()) || domain.from.length > 1 ? (
              <Block title="About it">
                <Sources {...go} doc={domain} body={withoutDecisions} />
              </Block>
            ) : null}
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
                        {f.summary ? <span className="page-feature-summary">{f.summary}</span> : null}
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
            {concepts.length ? (
              <Card title="Glossary" count={concepts.length}>
                <ul>
                  {concepts.map((c) => (
                    <li key={c.id}>
                      <Row icon={<ConceptIcon size={15} />} name={c.name} summary={c.summary} onClick={() => onConcept(c.id)} />
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
            {persona.from.some((f) => f.body.trim()) ? (
              <Block title="Who they are">
                <Sources {...go} doc={persona} />
              </Block>
            ) : null}
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
          <Card>
            <LeftRollup state={state} capabilities={capabilities} technical={false} onOpen={onOpen} detailed onConcept={onConcept} onPick={onPick} />
          </Card>
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
            {concept.from.some((f) => f.body.trim()) ? (
              <Block title="What it means" aside={<code className="faint">{concept.file}</code>}>
                <Sources {...go} doc={concept} />
              </Block>
            ) : null}
            <Block title="Rules that refer to it" count={rules.length}>
              <RuleTable {...go} rules={rules} followers />
            </Block>
          </>
        }
        rail={
          <>
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
                      <Row icon={<ConceptIcon size={15} />} name={`In ${domainName(state, c.domain)}`} summary={c.summary} onClick={() => onConcept(c.id)} />
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

/* Every system and component some capabilities are built on, each once. */
const builtOnAll = (state: DocketState, capabilities: Capability[]) => [...new Set(capabilities.flatMap((c) => builtOn(state, c)))];

/* A doc's open decisions, as a list. */
function DecisionList({ state, doc, onConcept, onPick }: Go & { doc: Doc }) {
  const decisions = openDecisions(doc);
  if (!decisions.length) return null;
  return <Markdown state={state} concept={doc} text={decisions.map((d) => `- ${d}`).join("\n")} onConcept={onConcept} onShow={noShow} onPick={onPick} />;
}

/* Capabilities as rows, each with its level, opening its page. */
function CapabilityList({ capabilities, onOpen }: { capabilities: Capability[]; onOpen: Go["onOpen"] }) {
  return (
    <ul>
      {capabilities.map((c) => (
        <li key={c.id}>
          <Row icon={NAMES.capability.icon} name={c.name} summary={c.summary} onClick={() => onOpen("capability", c.id)}>
            <CapabilityStability level={c.stability} name={c.name} focusable={false} />
          </Row>
        </li>
      ))}
    </ul>
  );
}

/*
 * A system or component: how it's built, in the code's words, and where that
 * falls short of what we intend. Its technical gaps, each with when it's to
 * close; its tradeoffs, with what they cost; the checklist outcomes it meets
 * for the capabilities it serves, and the evidence for it; and, beside them,
 * its open decisions and the capabilities that rely on it.
 */
function TechnicalPage({ doc, ...go }: Go & { doc: TechnicalDoc }) {
  const { state, onOpen } = go;
  const capabilities = doc.capabilities.flatMap((id) => find(state.capabilities, id) ?? []);
  const gaps = gapsById(state, doc.gaps);
  const due = gaps.filter((g) => dueOf(state, g).when === "due").length;
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
            <Tile
              label="Technical gaps"
              value={gaps.length || "None"}
              note={gaps.length ? (due ? `${due} due now` : "None due yet") : "None written down"}
              tone={due ? "warn" : undefined}
            />
            <Tile label="Tradeoffs" value={doc.tradeoffs.length || "None"} note="Chosen on purpose, with their cost" />
            <Tile label="Outcomes it meets" value={outcomes.length || "None"} note={places ? `Evidence in ${plural(places, "place", "places")}` : "Nothing points at it yet"} />
          </>
        }
      />
      <Columns
        main={
          <>
            {doc.from.some((f) => withoutDecisions(f).trim()) ? (
              <Block title="How it's built">
                <Sources {...go} doc={doc} body={withoutDecisions} />
              </Block>
            ) : null}
            <Block title="Technical gaps" count={gaps.length}>
              {gaps.length ? (
                <Card>
                  <ul className="explore-left-list">
                    {gaps.map((g) => (
                      <GapItem key={g.id} state={state} gap={g} detailed />
                    ))}
                  </ul>
                </Card>
              ) : (
                <p className="concepts-empty">None written down: nothing only someone working on the code would notice.</p>
              )}
            </Block>
            {doc.tradeoffs.length ? (
              <Block title="Tradeoffs" count={doc.tradeoffs.length}>
                <Card>
                  <Tradeoffs state={state} ids={doc.tradeoffs} detailed bare />
                </Card>
              </Block>
            ) : null}
            <Block title="Outcomes it meets" count={outcomes.length}>
              {outcomes.length ? (
                <Card>
                  <p className="faint page-note">
                    For each capability it serves, these count as met with evidence on its checklist, unless a gap names one.
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
                  <div className="page-evidence-pair">
                    <div>
                      <span className="page-label">Implemented by</span>
                      {doc.evidence.implements.length ? <Places state={state} places={doc.evidence.implements} label="" detailed /> : <EvidenceNone>Nothing implements it</EvidenceNone>}
                    </div>
                    <div>
                      <span className="page-label">Verified by</span>
                      {doc.evidence.verifies.length ? <Places state={state} places={doc.evidence.verifies} label="" detailed /> : <EvidenceNone>Nothing verifies it</EvidenceNone>}
                    </div>
                  </div>
                </Card>
              ) : (
                <p className="concepts-empty">It doesn't say it meets any checklist outcome.</p>
              )}
            </Block>
          </>
        }
        rail={
          <>
            <Card title="Open decisions" count={decisions.length || undefined}>
              {decisions.length ? <DecisionList {...go} doc={doc} /> : <p className="concepts-empty">None written down.</p>}
            </Card>
            <Card title="Capabilities that rely on it" count={capabilities.length}>
              {capabilities.length ? <CapabilityList capabilities={capabilities} onOpen={onOpen} /> : <p className="concepts-empty">It doesn't list any.</p>}
            </Card>
            {doc.code.length ? (
              <Card title="Code" count={doc.code.length}>
                <ul className="page-code">
                  {doc.code.map((c) => (
                    <li key={c.glob}>
                      <code>{c.glob}</code>
                      <span className="faint">{plural(c.files, "file", "files")}</span>
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

function EvidenceNone({ children }: { children: ReactNode }) {
  return (
    <span className="explore-evidence-warning">
      <WarningAmberRoundedIcon sx={{ fontSize: 13 }} />
      {children}
    </span>
  );
}

/* What a gap, tradeoff or open decision is on, as a link to its page: a capability with its level, a feature, a domain, a system or a component. */
function SubjectLink({ state, type, id, onPick }: { state: DocketState; type: string; id: string; onPick: Go["onPick"] }) {
  if (type === "system" || type === "component") {
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

const DUE_GROUPS: { when: Due["when"]; title: string; note: string }[] = [
  { when: "due", title: "Due now", note: "What they're about is already at the level they were to close by, so that level expects them closed." },
  { when: "next", title: "Before the next level", note: "To close before what they're about is promoted." },
  { when: "later", title: "Later", note: "To close before a level further on." },
  { when: "event", title: "When something happens", note: "To close once something has happened." },
  { when: "undecided", title: "Not decided", note: "Nobody has decided when." },
];

type Show = "all" | "product" | "technical";

/*
 * Everything that differs from what's intended, across the projects showing,
 * on one page: known gaps by when they're to close, open decisions by where
 * they are, and tradeoffs, which are decided. It can show just what someone
 * using the product would notice, or just what's under the hood.
 */
function GapsPage(go: Go) {
  const { state, onPick } = go;
  const [show, setShow] = useState<Show>("all");
  const technicalType = (type: string) => type === "system" || type === "component";
  const shown = (type: string) => show === "all" || (show === "technical") === technicalType(type);

  const gaps = state.gaps.filter((g) => shown(subjectOf(g).type)).map((g) => ({ gap: g, due: dueOf(state, g) }));
  const productGaps = state.gaps.filter((g) => !technicalType(subjectOf(g).type)).length;
  const dueNow = gaps.filter((g) => g.due.when === "due").length;
  const tradeoffs = state.tradeoffs.filter((t) => shown(subjectOf(t).type));
  const decided: { type: string; doc: Doc }[] = [
    ...state.domains.map((doc) => ({ type: "domain", doc })),
    ...state.features.map((doc) => ({ type: "feature", doc })),
    ...state.capabilities.map((doc) => ({ type: "capability", doc })),
    ...state.systems.map((doc) => ({ type: "system", doc })),
    ...state.components.map((doc) => ({ type: "component", doc })),
  ].filter(({ type, doc }) => shown(type) && openDecisions(doc).length);
  const decisions = decided.reduce((n, { doc }) => n + openDecisions(doc).length, 0);
  /* Tradeoffs grouped by what they're on, in the order they come. */
  const tradeoffGroups = [...new Set(tradeoffs.map((t) => t.id.slice(0, t.id.indexOf("#"))))].map((key) => ({
    ...subjectOf({ id: `${key}#` }),
    ids: tradeoffs.filter((t) => t.id.startsWith(`${key}#`)).map((t) => t.id),
  }));
  const technicalDocs = [...state.systems, ...state.components];

  return (
    <>
      <div className="page-hero">
        <div className="page-wrap">
          <div className="page-hero-head">
            <div className="page-hero-text">
              <div className="explore-kind">
                <IncompleteCircleRoundedIcon sx={{ fontSize: 17 }} />
                Across {state.projects.length === 1 ? state.projects[0].name : plural(state.projects.length, "project", "projects")}
              </div>
              <h1>Gaps and tradeoffs</h1>
              <p className="page-lede">
                Where the software differs from what's intended: what's left to close and when, what's still to decide, and what we chose to live with.
              </p>
            </div>
          </div>
          <div className="page-tiles">
            <Tile label="Known gaps" value={productGaps || "None"} note="What someone using it would notice" />
            <Tile label="Technical gaps" value={state.gaps.length - productGaps || "None"} note="What only someone working on the code would" />
            <Tile label="Due now" value={dueNow || "None"} note={show === "all" ? "Their level already expects them closed" : "Of those showing"} tone={dueNow ? "warn" : "ok"} />
            <Tile label="Open decisions" value={decisions || "None"} note={`In ${plural(decided.length, "place", "places")}`} />
            <Tile label="Tradeoffs" value={state.tradeoffs.length || "None"} note="Chosen on purpose, with their cost" />
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
                  ["product", "What people notice"],
                  ["technical", "Under the hood"],
                ] as const
              ).map(([value, label]) => (
                <button key={value} type="button" role="radio" aria-checked={show === value} className="filter-toggle" aria-pressed={show === value} onClick={() => setShow(value)}>
                  {label}
                </button>
              ))}
            </div>
            <Block title="Known gaps" count={gaps.length}>
              {gaps.length ? (
                DUE_GROUPS.map(({ when, title, note }) => {
                  const group = gaps.filter((g) => g.due.when === when);
                  if (!group.length) return null;
                  return (
                    <Card key={when} title={title} count={group.length}>
                      <p className="faint page-note">{note}</p>
                      <ul className="explore-left-list">
                        {group.map(({ gap }) => {
                          const subject = subjectOf(gap);
                          return (
                            <GapItem
                              key={gap.id}
                              state={state}
                              gap={gap}
                              detailed
                              subject={
                                <>
                                  <SubjectLink state={state} type={subject.type} id={subject.id} onPick={onPick} />
                                  {technicalType(subject.type) ? <span className="explore-tag">Under the hood</span> : null}
                                </>
                              }
                            />
                          );
                        })}
                      </ul>
                    </Card>
                  );
                })
              ) : (
                <p className="concepts-empty">None written down.</p>
              )}
            </Block>
            <Block title="Tradeoffs" count={tradeoffs.length}>
              {tradeoffGroups.length ? (
                <Card>
                  {tradeoffGroups.map((g) => (
                    <div key={`${g.type}:${g.id}`} className="page-subject-group">
                      <div className="page-subject">
                        <SubjectLink state={state} type={g.type} id={g.id} onPick={onPick} />
                        {g.type === "feature" ? <span className="faint">Decided not to build</span> : null}
                      </div>
                      <Tradeoffs state={state} ids={g.ids} detailed bare />
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
            <Card title="Open decisions" count={decisions || undefined}>
              {decided.length ? (
                decided.map(({ type, doc }) => (
                  <div key={`${type}:${doc.id}`} className="page-subject-group">
                    <div className="page-subject">
                      <SubjectLink state={state} type={type} id={doc.id} onPick={onPick} />
                    </div>
                    <DecisionList {...go} doc={doc} />
                  </div>
                ))
              ) : (
                <p className="concepts-empty">None written down.</p>
              )}
            </Card>
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
