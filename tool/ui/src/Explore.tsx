import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ExtensionOutlinedIcon from "@mui/icons-material/ExtensionOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import MyLocationRoundedIcon from "@mui/icons-material/MyLocationRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import Box from "@mui/material/Box";
import { MATURITY_BANDS, maturityBand } from "./design/maturity/maturity";
import { RingGlyph } from "./design/maturity/RingGlyph";
import { STABILITY, levelColor } from "./design/stability/stability";
import { StabilityMark } from "./design/stability/StabilityMark";
import { CapabilityStability } from "./design/catalog/CapabilityLabel";
import { StandingMark } from "./design/standing/StandingMark";
import { GapFilter, GapKindTag, LeftCounts, LeftItem, LeftLabel, LeftList, gapKind, type GapShow, type LeftKind } from "./design/left/LeftMark";
import { ConceptChips, PageLink, PanelHeader } from "./Concepts";
import { Term } from "./design/term/Term";
import { InlineMarkdown, MoreAboutFold } from "./design/markdown/Markdown";
import { CameFrom, Decided, DecisionList, Facets, facets } from "./Fields";
import { DomainIcon } from "./FeatureMap";
import { DecisionsHint } from "./CapabilityHints";
import { PersonaAvatar, PersonaIcon, ReadinessMeter, personaNameAndRole, readinessBasis, type ReadinessBasis } from "./Personas";
import { ProjectIcon } from "./PlatformFilter";
import {
  capabilityTarget,
  checklistOutcome,
  openDecisions,
  closedDecisions,
  outcomeStanding,
  outcomesOf,
  tradeoffsById,
  contradictionsOf,
  docDomains,
  domainGroup,
  domainName,
  featureConcepts,
  featureTarget,
  find,
  leftCount,
  leftIn,
  pageHref,
  projectName,
  partOf,
  personaReadinessIn,
  targetOf,
  type Capability,
  type CapabilityLevel,
  type Contribution,
  type TechnicalDoc,
  type TechnicalKind,
  type EvidencePlace,
  type Domain,
  type Doc,
  type DocketState,
  type Feature,
  type Gap,
  type TechnicalGap,
  type Left,
  type Persona,
  type Pick,
  type Rule,
  type RuleStanding,
  ruleStanding,
  type Target,
} from "./state";
import { Tip } from "./design/Tip";

/* What the panel can show: the product's parts, each as a list or one of them. */
export type ExploreKind = "domain" | "feature" | "capability" | "persona";

export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export const NAMES: Record<ExploreKind, { one: string; many: string; icon: ReactNode }> = {
  domain: { one: "Domain", many: "Domains", icon: <DomainIcon size={18} /> },
  feature: { one: "Feature", many: "Features", icon: <WidgetsOutlinedIcon sx={{ fontSize: 18, color: "secondary.main" }} /> },
  capability: { one: "Capability", many: "Capabilities", icon: <BoltOutlinedIcon sx={{ fontSize: 18, color: "primary.main" }} /> },
  persona: { one: "Persona", many: "Personas", icon: <PersonaIcon size={18} /> },
};

/*
 * The product's domains, features and capabilities, in a panel beside the
 * canvas, as the concepts panel shows the domain's concepts: every one of a
 * kind, found by typing, and one at a time with what it is, what it's part
 * of and what's part of it, so how they relate can be followed from one to
 * the next. Back returns to wherever the reader came from.
 */
export function ExplorePanel({
  state,
  kind,
  selected,
  backLabel,
  onOpen,
  onConcept,
  onBack,
  onClose,
  onShow,
  isFiltering,
  onFilter,
}: {
  state: DocketState;
  kind: ExploreKind;
  /* The one showing, or null for the list. */
  selected: string | null;
  /* Where back goes, or null when it's this kind's list. */
  backLabel: string | null;
  onOpen: (kind: ExploreKind, id: string | null) => void;
  onConcept: (id: string) => void;
  onBack: () => void;
  onClose: () => void;
  onShow: (target: Target) => void;
  /* Whether the map is filtered to something, and filtering to it or not. */
  isFiltering: (pick: Pick) => boolean;
  onFilter: (pick: Pick) => void;
}) {
  const body = useRef<HTMLDivElement>(null);
  useEffect(() => {
    body.current?.scrollTo({ top: 0 });
  }, [kind, selected]);
  const names = NAMES[kind];
  const domain = kind === "domain" && selected ? find(state.domains, selected) : undefined;
  const feature = kind === "feature" && selected ? find(state.features, selected) : undefined;
  const capability = kind === "capability" && selected ? find(state.capabilities, selected) : undefined;
  const persona = kind === "persona" && selected ? find(state.personas, selected) : undefined;
  const one = domain ?? feature ?? capability ?? persona;
  const links = { state, onOpen, onConcept, onShow, isFiltering, onFilter };

  return (
    <aside className="panel concepts" data-no-pan aria-label={names.many}>
      <PanelHeader
        icon={names.icon}
        title={<Term id={kind}>{names.many}</Term>}
        back={one ? (backLabel ?? `All ${names.many.toLowerCase()}`) : null}
        onBack={onBack}
        onClose={onClose}
        extra={one ? <PageLink pick={{ kind, id: one.id }} /> : null}
      />
      <div className="concepts-body" ref={body}>
        {domain ? (
          <DomainView domain={domain} {...links} />
        ) : feature ? (
          <FeatureView feature={feature} {...links} />
        ) : capability ? (
          <CapabilityView capability={capability} {...links} />
        ) : persona ? (
          <PersonaView persona={persona} {...links} />
        ) : (
          <List state={state} kind={kind} onOpen={(id) => onOpen(kind, id)} />
        )}
      </div>
    </aside>
  );
}

type Links = {
  state: DocketState;
  onOpen: (kind: ExploreKind, id: string | null) => void;
  onConcept: (id: string) => void;
  onShow: (target: Target) => void;
  isFiltering: (pick: Pick) => boolean;
  onFilter: (pick: Pick) => void;
};

/* Every one of a kind, found by typing, each with what it's in and what's in it. */
function List({ state, kind, onOpen }: { state: DocketState; kind: ExploreKind; onOpen: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const rows = useMemo(() => {
    const domains = (ids: string[]) => ids.map((id) => domainName(state, id)).join(" + ");
    /* Open decisions on some capabilities, as what's left counts them under a feature, domain or persona. */
    const decidedIn = (capabilities: Capability[]) => capabilities.reduce((n, c) => n + openDecisions(c).length, 0);
    const capabilitiesOf = (ids: string[]) => ids.flatMap((id) => find(state.capabilities, id) ?? []);
    const docs: { doc: Doc; meta: string; mark: ReactNode; decisions: number; picture?: ReactNode; name?: string; role?: string | null }[] =
      kind === "persona"
        ? state.personas.map((p) => ({
            doc: p,
            ...personaNameAndRole(p),
            meta: `${plural(p.capabilities.length, "capability", "capabilities")} · ${plural(p.features.length, "feature", "features")}`,
            mark: p.readiness !== null ? <ReadinessMeter value={p.readiness} basis={readinessBasis(state, p)} inButton /> : null,
            decisions: decidedIn(capabilitiesOf(p.capabilities)),
            picture: <PersonaAvatar persona={p} size={36} />,
          }))
        : kind === "domain"
        ? state.domains.map((d) => ({
            doc: d,
            meta: plural(d.features.length, "feature", "features"),
            mark: d.maturity !== null ? <RingGlyph progress={d.maturity} size={20} /> : null,
            decisions: openDecisions(d).length + decidedIn(domainCapabilities(state, d)),
          }))
        : kind === "feature"
          ? state.features.map((f) => ({
              doc: f,
              meta: `${domains(f.parts.map((p) => p.domain))} · ${plural(f.capabilities.length, "capability", "capabilities")}`,
              mark: f.maturity !== null ? <RingGlyph progress={f.maturity} size={20} /> : null,
              decisions: openDecisions(f).length + decidedIn(capabilitiesOf(f.capabilities)),
            }))
          : state.capabilities.map((c) => ({
              doc: c,
              meta: `${c.feature ? (find(state.features, c.feature)?.name ?? c.feature) : "Not in a feature"} · ${domains(docDomains(c))}`,
              mark: <CapabilityStability level={c.stability} name={c.name} focusable={false} />,
              decisions: openDecisions(c).length,
            }));
    return docs.sort((a, b) => a.doc.name.localeCompare(b.doc.name));
  }, [state, kind]);
  const shown = rows.filter(({ doc, meta }) => {
    const text = `${doc.name} ${doc.description ?? ""} ${doc.id} ${meta}`.toLowerCase();
    return terms.every((t) => text.includes(t));
  });
  const many = NAMES[kind].many.toLowerCase();

  if (!rows.length) return <p className="concepts-empty">No {many} are written down yet.</p>;
  return (
    <>
      <label className="concepts-filter">
        <SearchRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
        <input
          type="search"
          value={query}
          placeholder={`Filter ${rows.length} ${rows.length === 1 ? NAMES[kind].one.toLowerCase() : many}…`}
          aria-label={`Filter ${many}`}
          autoFocus
          spellCheck={false}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && shown[0]) onOpen(shown[0].doc.id);
          }}
        />
      </label>
      {shown.length ? (
        <ul className="concept-list">
          {shown.map(({ doc, meta, mark, decisions, picture, name, role }) => (
            <li key={doc.id}>
              <button type="button" className={picture ? "has-picture" : undefined} onClick={() => onOpen(doc.id)}>
                {picture}
                <span className="explore-name">
                  <span className="concept-name">{name ?? doc.name}</span>
                  <DecisionsHint count={decisions} />
                  {mark}
                </span>
                {role ? <span className="persona-role">{role}</span> : null}
                {doc.description ? <span className="concept-summary">{doc.description}</span> : null}
                <span className="concept-meta">{meta}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="concepts-empty">Nothing matches “{query.trim()}”.</p>
      )}
    </>
  );
}

/*
 * The top of any one doc: its kind, its name, what it's part of, its maturity
 * or level, and `actions`, such as finding it on the map; then any
 * contradictions; then what it is. Where several sources say what it is, such
 * as two projects or two domains defining it, each gets a card of its own,
 * headed by the domain and project it's from, so it's always clear who says
 * what, and several can be compared. With one source, its trail says where
 * it's from instead. Each source shows what it is (its description and fields)
 * first, then its body apart, folded under "More about it".
 */
export function Head({
  state,
  kind,
  doc,
  trail,
  status,
  extra,
  picture,
  name = doc.name,
  role,
  actions,
  onShow,
  onConcept,
  onPick,
}: {
  state: DocketState;
  kind: ExploreKind;
  doc: Doc;
  /* Beside its name: a persona's picture, and under it, their role. */
  picture?: ReactNode;
  name?: string;
  role?: string | null;
  /* What it's part of, outermost first. */
  trail?: ReactNode;
  /* Beside its name, at the right: its level, maturity or readiness. */
  status?: ReactNode;
  /* Under what it's part of: more about its status, such as each domain's level. */
  extra?: ReactNode;
  actions?: ReactNode;
  onShow: (target: Target) => void;
  onConcept: (id: string) => void;
  /* On a detail page: where links in its body to capabilities and features go. */
  onPick?: (pick: Pick) => void;
}) {
  const problems = contradictionsOf(state, kind, doc.id);
  /* Domains and personas aren't written in a domain, so their sources are told apart by project alone. */
  const byProject = kind === "domain" || kind === "persona";
  const several = doc.from.length > 1;
  const project = !several && state.projects.length > 1 ? projectName(state, doc.from[0].project) : null;
  const go = { state, onConcept, onShow, onPick };
  const says = (f: Contribution) => (
    <>
      <Facets items={facets(kind, f, go)} stacked />
      <MoreAboutFold from={f} go={go} />
    </>
  );
  return (
    <>
      <header className="explore-hero">
        <div className="explore-kind">
          {NAMES[kind].icon}
          <Term id={kind}>{NAMES[kind].one}</Term>
        </div>
        <div className="explore-name-row" data-picture={picture ? true : undefined}>
          {picture ? (
            <div className="explore-title">
              {picture}
              <div>
                <h2>{name}</h2>
                {role ? <div className="explore-role">{role}</div> : null}
              </div>
            </div>
          ) : (
            <h2>{doc.name}</h2>
          )}
          {status ? <div className="explore-status">{status}</div> : null}
        </div>
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
        {extra}
        {actions ? <div className="explore-actions">{actions}</div> : null}
      </header>
      {problems.map((p) => (
        <p key={p.message} className="explore-problem">
          <WarningAmberRoundedIcon sx={{ fontSize: 17, flex: "none" }} />
          {p.message}
        </p>
      ))}
      <div className="explore-sources">
        {doc.from.map((f, i) => (
          <div key={i} className="explore-source">
            {several ? (
              <div className="explore-source-head">
                {byProject ? null : (
                  <span className="explore-source-from">
                    <span className="explore-source-label"><Term id="domain" /></span>
                    <span className="explore-source-name">
                      <DomainIcon size={14} />
                      {domainName(state, f.domain)}
                    </span>
                  </span>
                )}
                <span className="explore-source-from">
                  <span className="explore-source-label"><Term id="project" /></span>
                  <span className="explore-source-name">
                    <ProjectIcon size={14} />
                    {projectName(state, f.project)}
                  </span>
                </span>
              </div>
            ) : null}
            <div className="explore-source-body">
              {f.description ? <p className="explore-source-summary">{f.description}</p> : null}
              {says(f)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* In the side panel, under a doc's name: find it on the map, or filter the map to it. */
function MapActions({ pick, target, onShow, isFiltering, onFilter }: Omit<Links, "state" | "onOpen" | "onConcept"> & { pick: Pick; target: Target }) {
  const filtering = isFiltering(pick);
  return (
    <>
      <button type="button" className="filter-toggle" onClick={() => onShow(target)}>
        <MyLocationRoundedIcon sx={{ fontSize: 15 }} />
        Show on map
      </button>
      <button type="button" className="filter-toggle" aria-pressed={filtering} onClick={() => onFilter(pick)}>
        <FilterListRoundedIcon sx={{ fontSize: 15 }} />
        {filtering ? "Filtering to this" : "Filter to this"}
        {filtering ? <CloseRoundedIcon sx={{ fontSize: 14, ml: 0.25 }} /> : null}
      </button>
    </>
  );
}

/* A section's heading, with how many it holds. */
export function Heading({ children, count }: { children: ReactNode; count?: number }) {
  return (
    <h3 className="explore-heading">
      {children}
      {count !== undefined ? <span className="explore-count">{count}</span> : null}
    </h3>
  );
}

/*
 * A section folded shut until it's opened, for what the side panel keeps
 * at hand without showing: its heading and count say what's inside.
 */
/* In the side panel, a doc's closed decisions and what each became, folded. */
function DecidedFold({ state, doc, onConcept, onShow }: { state: DocketState; doc: Doc; onConcept: (id: string) => void; onShow: (target: Target) => void }) {
  const count = closedDecisions(doc).length;
  return count ? (
    <Fold title="Decided" count={count}>
      <Decided doc={doc} go={{ state, onConcept, onShow }} />
    </Fold>
  ) : null;
}

export function Fold({ title, count, children }: { title: ReactNode; count?: number; children: ReactNode }) {
  return (
    <section>
      <details className="explore-fold">
        <summary>
          <Heading count={count}>{title}</Heading>
          <FoldChevron />
        </summary>
        <div className="explore-fold-body">{children}</div>
      </details>
    </section>
  );
}

function FoldChevron() {
  return <ExpandMoreRoundedIcon className="explore-fold-chevron" sx={{ fontSize: 18 }} />;
}

/* Maturity in short, beside a name: its ring, with the percentage, and its band; or why there's none. */
export function Maturity({ value, of }: { value: number | null; of: string }) {
  if (value === null)
    return (
      <Tip title={`No maturity yet: ${of}`}>
        <span className="explore-level faint">No maturity yet</span>
      </Tip>
    );
  const band = maturityBand(value);
  return (
    <Tip title={`${value}% maturity`}>
      <Box component="span" className="explore-level" sx={levelColor(band)}>
        <RingGlyph progress={value} size={22} />
        <strong>{MATURITY_BANDS[band]}</strong>
      </Box>
    </Tip>
  );
}

/* Where a capability's domains are at different levels, each of theirs: "Alpha in Billing · GA in Guest stays". */
function DomainLevels({ state, capability }: { state: DocketState; capability: Capability }) {
  if (new Set(capability.levels.map((l) => l.level)).size < 2) return null;
  return (
    <p className="explore-domain-levels faint">
      {capability.levels.map((l) => `${levelName(l.level)} in ${domainName(state, l.domain)}`).join(" · ")}
    </p>
  );
}

/* A capability's level by name: "GA", or "Draft" for one declared and not started. */
export const levelName = (level: CapabilityLevel) => (level ? STABILITY[level].name : "Draft");

/* How ready the software is for a persona, on readiness's own scale. */
export function Readiness({ value, basis }: { value: number | null; basis: ReadinessBasis }) {
  if (value === null)
    return (
      <Tip title="Nothing serves them yet, so there's no readiness.">
        <span className="explore-level faint">No readiness yet</span>
      </Tip>
    );
  return <ReadinessMeter value={value} basis={basis} large />;
}

/* A capability's level, as a mark and its name in the level's color; a draft has neither, only the word. */
function Level({ name, level }: { name: string; level: CapabilityLevel }) {
  if (!level) return <CapabilityStability name={name} level={null} />;
  return (
    <Box component="span" className="explore-level-mark" sx={levelColor(level)}>
      <StabilityMark level={level} feature={name} size="short" />
      {STABILITY[level].name}
    </Box>
  );
}

/* Every capability with a part in a domain: those in its parts of features, and those in no feature. */
export function domainCapabilities(state: DocketState, domain: Domain): Capability[] {
  const ids = [...domain.features.flatMap((id) => partOf(find(state.features, id), domain.id)?.capabilities ?? []), ...domain.capabilities];
  return [...new Set(ids)].flatMap((id) => find(state.capabilities, id) ?? []);
}

/*
 * In the side panel, a domain: what it is, its maturity, what's left across
 * its capabilities, the features it has a part in, and its concepts. Its
 * rules are on its detail page.
 */
function DomainView({ state, domain, onOpen, onConcept, onShow, isFiltering, onFilter }: Links & { domain: Domain }) {
  const features = domain.features.flatMap((id) => find(state.features, id) ?? []);
  const loose = domain.capabilities.flatMap((id) => find(state.capabilities, id) ?? []);
  const concepts = state.concepts.filter((c) => c.domain === domain.id);
  const pick: Pick = { kind: "domain", id: domain.id };
  return (
    <article className="concept">
      <Head
        state={state}
        kind="domain"
        doc={domain}
        status={<Maturity value={domain.maturity} of="it builds no capability in a feature yet" />}
        actions={<MapActions pick={pick} target={{ items: [domainGroup(domain.id)] }} onShow={onShow} isFiltering={isFiltering} onFilter={onFilter} />}
        onShow={onShow}
        onConcept={onConcept}
      />
      <LeftRollup state={state} own={domain} capabilities={domainCapabilities(state, domain)} onOpen={onOpen} onConcept={onConcept} onShow={onShow} />
      <DecidedFold state={state} doc={domain} onConcept={onConcept} onShow={onShow} />
      <section>
        <Heading count={features.length}><Term id="feature">Features</Term></Heading>
        <DomainFeatures state={state} domain={domain} features={features} onOpen={onOpen} />
      </section>
      {loose.length ? (
        <section>
          <Heading count={loose.length}><Term id="capability">Capabilities</Term> in no <Term id="feature">feature</Term></Heading>
          <CapabilityRows capabilities={loose} domain={domain.id} onOpen={onOpen} />
        </section>
      ) : null}
      {concepts.length ? (
        <section>
          <Heading count={concepts.length}><Term id="concept">Concepts</Term></Heading>
          <ConceptChips concepts={concepts} onOpen={onConcept} />
        </section>
      ) : null}
    </article>
  );
}

/* The features a domain has a part in, each with its part's maturity. */
function DomainFeatures({ state, domain, features, onOpen }: { state: DocketState; domain: Domain; features: Feature[]; onOpen: Links["onOpen"] }) {
  if (!features.length) return <p className="concepts-empty">A part of the business the software doesn't serve yet.</p>;
  return (
    <ul>
      {features.map((f) => {
        const part = partOf(f, domain.id);
        const elsewhere = f.parts.filter((p) => p.domain !== domain.id).map((p) => domainName(state, p.domain));
        return (
          <li key={f.id}>
            <Row
              icon={NAMES.feature.icon}
              name={f.name}
              summary={elsewhere.length ? `${f.description ?? ""} Also in ${elsewhere.join(", ")}.`.trim() : f.description}
              onClick={() => onOpen("feature", f.id)}
            >
              <DecisionsHint count={openDecisions(f).length} />
              {part?.maturity != null ? <RingGlyph progress={part.maturity} size={20} /> : null}
            </Row>
          </li>
        );
      })}
    </ul>
  );
}

/* Capabilities as rows, each opening in the panel, at their level in `domain` when it's given. */
export function CapabilityRows({
  capabilities,
  domain,
  onOpen,
}: {
  capabilities: Capability[];
  domain?: string;
  onOpen: Links["onOpen"];
}) {
  return (
    <ul>
      {capabilities.map((c) => {
        const level = (domain && c.levels.find((l) => l.domain === domain)?.level) || c.stability;
        return (
          <li key={c.id}>
            <Row icon={NAMES.capability.icon} name={c.name} summary={c.description} onClick={() => onOpen("capability", c.id)}>
              <CapabilityStability level={level} name={c.name} focusable={false} />
            </Row>
          </li>
        );
      })}
    </ul>
  );
}

/* A feature's capabilities, by its part in each domain, with that part's maturity where there are several. */
function FeatureParts({ state, feature, onOpen }: { state: DocketState; feature: Feature; onOpen: Links["onOpen"] }) {
  if (!feature.parts.length)
    return (
      <section>
        <p className="concepts-empty">A job the software doesn't do yet.</p>
      </section>
    );
  return (
    <>
      {feature.parts.map((part) => (
        <section key={part.domain}>
          {feature.parts.length > 1 ? (
            <h3 className="explore-heading explore-part">
              <span>Capabilities in {domainName(state, part.domain)}</span>
              <span className="explore-count">{part.capabilities.length}</span>
              {part.maturity !== null ? <RingGlyph progress={part.maturity} size={18} /> : null}
            </h3>
          ) : (
            <Heading count={part.capabilities.length}><Term id="capability">Capabilities</Term></Heading>
          )}
          <CapabilityRows
            capabilities={part.capabilities.flatMap((id) => find(state.capabilities, id) ?? [])}
            domain={part.domain}
            onOpen={onOpen}
          />
        </section>
      ))}
    </>
  );
}

/*
 * In the side panel, a feature: the domains it spans, its maturity, what's
 * left across its capabilities, then each domain's part, with the
 * capabilities it builds there, who it serves, and the concepts they use.
 * The rules they follow are on its detail page.
 */
function FeatureView({ state, feature, onOpen, onConcept, onShow, isFiltering, onFilter }: Links & { feature: Feature }) {
  const capabilities = feature.capabilities.flatMap((id) => find(state.capabilities, id) ?? []);
  const concepts = featureConcepts(state, feature);
  const personas = state.personas.filter((p) => p.features.includes(feature.id));
  const pick: Pick = { kind: "feature", id: feature.id };
  return (
    <article className="concept">
      <Head
        state={state}
        kind="feature"
        doc={feature}
        trail={<DomainCrumbs state={state} domains={feature.parts.map((p) => p.domain)} onOpen={onOpen} />}
        status={<Maturity value={feature.maturity} of="it has no capabilities yet" />}
        actions={<MapActions pick={pick} target={featureTarget(state, feature.id)} onShow={onShow} isFiltering={isFiltering} onFilter={onFilter} />}
        onShow={onShow}
        onConcept={onConcept}
      />
      <LeftRollup state={state} own={feature} capabilities={capabilities} onOpen={onOpen} onConcept={onConcept} onShow={onShow} />
      <DecidedFold state={state} doc={feature} onConcept={onConcept} onShow={onShow} />
      <FeatureParts state={state} feature={feature} onOpen={onOpen} />
      {personas.length ? (
        <section>
          <Heading count={personas.length}>Who it serves</Heading>
          <PersonaRows state={state} personas={personas} feature={feature} onOpen={onOpen} />
        </section>
      ) : null}
      <Tradeoffs state={state} ids={feature.tradeoffs} title="Decided not to build" />
      {concepts.length ? (
        <section>
          <Heading count={concepts.length}><Term id="concept">Concepts</Term> its capabilities use</Heading>
          <ConceptChips concepts={concepts} onOpen={onConcept} scopeOf={(c) => domainName(state, c.domain)} />
        </section>
      ) : null}
    </article>
  );
}

/* A capability's trail: the domains it's in, then its feature. */
export function CapabilityTrail({ state, capability, onOpen }: { state: DocketState; capability: Capability; onOpen: Links["onOpen"] }) {
  const feature = capability.feature ? find(state.features, capability.feature) : undefined;
  return (
    <>
      <DomainCrumbs state={state} domains={docDomains(capability)} onOpen={onOpen} />
      <span className="faint">›</span>
      {feature ? <Crumb icon={NAMES.feature.icon} name={feature.name} onClick={() => onOpen("feature", feature.id)} /> : "Not in a feature"}
    </>
  );
}

/*
 * In the side panel, a capability: what it does, its level, the rules it
 * follows by name (folded), who it serves, what's left about it, its
 * tradeoffs (folded), and the concepts it uses. What it's built on, the
 * evidence, checklist and code are on its detail page.
 */
function CapabilityView({ state, capability, onOpen, onConcept, onShow, isFiltering, onFilter }: Links & { capability: Capability }) {
  const concepts = capability.concepts.flatMap((id) => find(state.concepts, id) ?? []);
  const rules = capability.rules.flatMap((id) => find(state.rules, id) ?? []);
  const personas = capability.personas.flatMap((id) => find(state.personas, id) ?? []);
  const pick: Pick = { kind: "capability", id: capability.id };
  return (
    <article className="concept">
      <Head
        state={state}
        kind="capability"
        doc={capability}
        trail={<CapabilityTrail state={state} capability={capability} onOpen={onOpen} />}
        status={<Level name={capability.name} level={capability.stability} />}
        extra={<DomainLevels state={state} capability={capability} />}
        actions={<MapActions pick={pick} target={capabilityTarget(state, capability.id)} onShow={onShow} isFiltering={isFiltering} onFilter={onFilter} />}
        onShow={onShow}
        onConcept={onConcept}
      />
      <Fold title={<><Term id="rule" hoverOnly>Rules</Term> it follows</>} count={rules.length}>
        {rules.length ? <RuleNames capability={capability} rules={rules} /> : <p className="concepts-empty">None written down yet.</p>}
      </Fold>
      {personas.length ? (
        <section>
          <Heading count={personas.length}>Who it serves</Heading>
          <PersonaRows state={state} personas={personas} onOpen={onOpen} />
        </section>
      ) : null}
      <WhatsLeft
        state={state}
        capability={capability}
        onConcept={onConcept}
        onShow={onShow}
        checklist={<a href={pageHref(pick, "checklist")} target="_blank" rel="noopener">See the checklist</a>}
      />
      <DecidedFold state={state} doc={capability} onConcept={onConcept} onShow={onShow} />
      <Tradeoffs state={state} ids={capability.tradeoffs} />
      {concepts.length ? (
        <section>
          <Heading count={concepts.length}><Term id="concept">Concepts</Term> it uses</Heading>
          <ConceptChips concepts={concepts} onOpen={onConcept} scopeOf={(c) => domainName(state, c.domain)} />
        </section>
      ) : null}
    </article>
  );
}

/* How a rule a capability follows stands, in words, wherever its mark shows. */
export const RULE_STANDING_LABELS: Record<RuleStanding, string> = {
  evidence: "Held, with evidence",
  trust: "Held, on trust",
  gap: "Not held yet: a gap says so",
};

/*
 * Rules by name alone, for the side panel, each with whether the capability
 * holds to it: why it exists shows on hover, and all of it on the detail page.
 */
function RuleNames({ capability, rules }: { capability: Capability; rules: Rule[] }) {
  return (
    <ul className="explore-rule-names">
      {rules.map((r) => {
        const standing = ruleStanding(capability, r);
        return (
          <li key={r.id}>
            <StandingMark standing={standing} label={RULE_STANDING_LABELS[standing]} />
            <Tip title={r.why?.trim() ? <InlineMarkdown text={r.why} /> : undefined}>
              <span>
                {r.name}
                {standing === "gap" ? <span className="explore-rule-standing"> · Not held yet</span> : null}
              </span>
            </Tip>
          </li>
        );
      })}
    </ul>
  );
}

const countOf = (n: number, one: string, many: string) => (n ? [plural(n, one, many)] : []);

/* What's left about a capability, as counts, each with its mark. */
export function LeftSummary({ left }: { left: Left }) {
  const counts: [LeftKind, number][] = [
    ["decision", left.decisions.length],
    ["product-gap", left.gaps.length],
    ["technical-gap", left.technical.length],
  ];
  return <LeftCounts counts={counts} />;
}

/* What's left about a capability, in a line: "1 open decision · 2 product gaps". */
export const leftLine = (left: Left) =>
  [
    ...countOf(left.decisions.length, "open decision", "open decisions"),
    ...countOf(left.gaps.length, "product gap", "product gaps"),
    ...countOf(left.technical.length, "technical gap", "technical gaps"),
  ].join(" · ");

/* Mechanisms' and components' names and icons, wherever one is named. */
export const TECHNICAL_NAMES: Record<TechnicalKind, { one: string; many: string; icon: ReactNode }> = {
  mechanism: { one: "Mechanism", many: "Mechanisms", icon: <HubOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} /> },
  component: { one: "Component", many: "Components", icon: <ExtensionOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} /> },
};

/* A link to a mechanism's or component's page: in this tab on a detail page, or a new one from the side panel. */
export function TechnicalLink({ doc, newTab = false, children }: { doc: TechnicalDoc; newTab?: boolean; children?: ReactNode }) {
  return (
    <a className="link explore-crumb" href={pageHref({ kind: doc.kind, id: doc.id })} {...(newTab ? { target: "_blank", rel: "noopener" } : {})}>
      {children ?? (
        <>
          {TECHNICAL_NAMES[doc.kind].icon}
          {doc.name}
        </>
      )}
    </a>
  );
}

/*
 * Places in the code a gap or tradeoff names, with `docket:gap` or
 * `docket:tradeoff`: each line as written, and its file. In short, how many.
 */
export function Places({ state, places, label, detailed = false }: { state: DocketState; places: EvidencePlace[]; label: string; detailed?: boolean }) {
  if (!places.length) return null;
  if (!detailed) return <span>{plural(places.length, `${label} in 1 place`, `${label} in ${places.length} places`).replace(/^\d+ /, "")}</span>;
  const several = state.projects.length > 1;
  return (
    <ul className="page-places explore-places">
      {places.map((e) => (
        <li key={`${e.project}:${e.file}:${e.line}`}>
          <span className="page-place-icon">
            <CodeRoundedIcon sx={{ fontSize: 14 }} />
          </span>
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
  );
}

/*
 * A gap, as an item in a LeftList: something we know falls short and mean to
 * close, with its mark, labelled product or technical. With `detailed`, it says what it affects (the
 * checklist outcome it falls short of, the rule it doesn't hold to yet, the
 * mechanism or component it's in) and where it shows in the code. `on`, for a
 * technical gap, is the mechanism or component it's on.
 */
export function GapItem({
  state,
  gap,
  on,
  subject,
  detailed = false,
  newTab = false,
}: {
  state: DocketState;
  gap: Gap;
  on?: TechnicalDoc;
  /* Above it, what it's on, where that isn't clear from where it's shown. */
  subject?: ReactNode;
  detailed?: boolean;
  newTab?: boolean;
}) {
  const named = detailed && gap.outcome ? checklistOutcome(state.checklist, gap.outcome) : undefined;
  const rule = gap.rule ? find(state.rules, gap.rule) : undefined;
  if (detailed)
    return (
      <LeftItem kind={gapKind(gap)}>
          {subject ? <span className="explore-gap-subject">{subject}</span> : null}
          <div className="left-item-text">
            <GapKindTag kind={gapKind(gap)} />
            <InlineMarkdown text={gap.summary} />
          </div>
          <CameFrom kind="gap" id={gap.id} go={{ state, onConcept: () => {} }} inline />
          {named || rule || on ? (
            <div className="gap-affects">
              <span className="gap-affects-label">Affects</span>
              {named ? (
                <span className="gap-affect">
                  <span className="explore-tag">
                    {named.quality.name} · {STABILITY[named.outcome.level].name}
                  </span>
                  {named.outcome.text}
                </span>
              ) : null}
              {rule ? (
                <span className="gap-affect">
                  <span className="explore-tag">Rule</span>
                  {rule.name}
                </span>
              ) : null}
              {on ? (
                <span className="gap-affect">
                  <span className="explore-tag">In</span>
                  <TechnicalLink doc={on} newTab={newTab} />
                </span>
              ) : null}
            </div>
          ) : null}
          <Places state={state} places={gap.places} label="Marked" detailed />
      </LeftItem>
    );
  return (
    <LeftItem kind={gapKind(gap)}>
      {subject ? <span className="explore-gap-subject">{subject}</span> : null}
      <div className="left-item-text">
        <GapKindTag kind={gapKind(gap)} />
        <InlineMarkdown text={gap.summary} />
      </div>
      <span className="explore-left-meta">
        {on ? (
          <span>
            In <TechnicalLink doc={on} newTab={newTab} />
          </span>
        ) : null}
        {rule ? <span>Doesn't yet hold to: {rule.name}</span> : null}
        <Places state={state} places={gap.places} label="Marked" />
      </span>
    </LeftItem>
  );
}

/*
 * One side of a tradeoff, as a list: its benefits, marked +, or its
 * drawbacks, marked −. Both are what came with the choice. Benefits not
 * written down say so, since there's nothing to weigh the drawbacks against.
 */
function TradeoffSide({ side, points }: { side: "benefits" | "drawbacks"; points: string[] }) {
  const Icon = side === "benefits" ? AddRoundedIcon : RemoveRoundedIcon;
  return (
    <div className={`tradeoff-side tradeoff-${side}`}>
      <span className="tradeoff-side-label">{side === "benefits" ? "Benefits" : "Drawbacks"}</span>
      {points.length ? (
        <ul className="tradeoff-points">
          {points.map((p) => (
            <li key={p}>
              <span className="tradeoff-point-mark" aria-hidden>
                <Icon sx={{ fontSize: 14 }} />
              </span>
              <span>
                <InlineMarkdown text={p} />
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <span className="tradeoff-none">Not written down</span>
      )}
    </div>
  );
}

/* The checklist outcome a tradeoff falls short of on purpose, if it names one, as a gap shows what it affects. */
function FallsShortOf({ state, outcome }: { state: DocketState; outcome: string | null }) {
  const named = outcome ? checklistOutcome(state.checklist, outcome) : undefined;
  if (!named) return null;
  return (
    <div className="gap-affects">
      <span className="gap-affects-label">Falls short of</span>
      <span className="gap-affect">
        <span className="explore-tag">
          {named.quality.name} · {STABILITY[named.outcome.level].name}
        </span>
        {named.outcome.text}
      </span>
    </div>
  );
}

/*
 * Tradeoffs: what we chose on purpose, and its benefits and drawbacks, since
 * they're decided, not open. A feature's are what it's decided not to do. In
 * the side panel, folded, each is what we chose alone; with `detailed`, each
 * is a card, its benefits and drawbacks side by side, with the code it
 * explains.
 */
export function Tradeoffs({
  state,
  ids,
  title = "Tradeoffs",
  detailed = false,
  bare = false,
}: {
  state: DocketState;
  ids: string[];
  title?: string;
  detailed?: boolean;
  /* Without its own heading, as in a block that has one. */
  bare?: boolean;
}) {
  const list = tradeoffsById(state, ids);
  if (!list.length) return null;
  const items = detailed ? (
    <LeftList detailed>
      {list.map((t) => (
        <LeftItem key={t.id} kind="tradeoff">
          <div className="tradeoff-choice left-item-text">
            <span className="tradeoff-label">We chose</span>
            <InlineMarkdown text={t.summary} />
          </div>
          <CameFrom kind="tradeoff" id={t.id} go={{ state, onConcept: () => {} }} inline />
          <div className="tradeoff-sides">
            <TradeoffSide side="benefits" points={t.benefits} />
            <TradeoffSide side="drawbacks" points={t.drawbacks} />
          </div>
          <FallsShortOf state={state} outcome={t.outcome} />
          <Places state={state} places={t.places} label="Marked" detailed />
        </LeftItem>
      ))}
    </LeftList>
  ) : (
    <LeftList>
      {list.map((t) => (
        <LeftItem key={t.id} kind="tradeoff">
          <div className="left-item-text">
            <InlineMarkdown text={t.summary} />
          </div>
        </LeftItem>
      ))}
    </LeftList>
  );
  if (bare) return items;
  const heading = <LeftLabel kind="tradeoff" hoverOnly={!detailed}>{title}</LeftLabel>;
  if (!detailed)
    return (
      <Fold title={heading} count={list.length}>
        {items}
      </Fold>
    );
  return (
    <section className="explore-left">
      <Heading count={list.length}>{heading}</Heading>
      {items}
    </section>
  );
}

/* Mechanisms and components as rows: each one's name, kind, and how many technical gaps it has. */
export function TechnicalRows({ docs, newTab = false }: { state: DocketState; docs: TechnicalDoc[]; newTab?: boolean }) {
  return (
    <ul>
      {docs.map((e) => (
        <li key={`${e.kind}:${e.id}`}>
          <a className="concept-row" href={pageHref({ kind: e.kind, id: e.id })} {...(newTab ? { target: "_blank", rel: "noopener" } : {})}>
            <span style={{ alignSelf: "flex-start", marginTop: 2, display: "inline-flex" }}>{TECHNICAL_NAMES[e.kind].icon}</span>
            <span className="concept-row-text">
              <span className="concept-row-name">{e.name}</span>
              <span className="concept-row-summary">
                <LeftCounts
                  lead={TECHNICAL_NAMES[e.kind].one}
                  counts={[
                    ["decision", openDecisions(e).length],
                    ["technical-gap", e.gaps.length],
                    ["tradeoff", e.tradeoffs.length],
                  ]}
                />
              </span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/*
 * What's still open about a capability, near the top so it's read first:
 * decisions nobody has made, its product gaps, and the technical gaps of what
 * it's built on; then how much of its level's checklist is met, and `checklist`, a way to the
 * whole of it. With `detailed`, as on its detail page, each gap says more.
 */
export function WhatsLeft({
  state,
  capability,
  checklist,
  detailed = false,
  onConcept,
  onShow,
  onPick,
}: {
  state: DocketState;
  capability: Capability;
  checklist?: ReactNode;
  detailed?: boolean;
  onConcept: (id: string) => void;
  onShow: (target: Target) => void;
  onPick?: (pick: Pick) => void;
}) {
  const left = leftIn(state, capability);
  const n = leftCount(left);
  const counts = checklistCounts(state, capability);
  return (
    <section className="explore-left">
      <Heading count={n || undefined}>What's left</Heading>
      {n ? (
        <LeftItems state={state} capability={capability} left={left} detailed={detailed} onConcept={onConcept} onShow={onShow} onPick={onPick} />
      ) : (
        <p className="concepts-empty">Nothing open: no open decisions or gaps are written down.</p>
      )}
      {counts ? (
        <p className="explore-left-checklist">
          <span>
            {counts.count - counts.notMet - counts.byChoice} of {counts.count} {levelName(capability.stability)} checklist outcomes met
            {counts.evidence ? `, ${counts.evidence} with evidence` : ""}
            {counts.byChoice ? `, ${counts.byChoice} not met by choice` : ""}.
          </span>
          {checklist}
        </p>
      ) : capability.stability === null ? (
        <p className="explore-left-checklist">
          <span>A draft: declared, and not started, so it claims nothing on the checklist yet.</span>
        </p>
      ) : null}
    </section>
  );
}

/* A doc's open decisions, from each of its sources, as a list under their label. */
function Decisions({ state, doc, onConcept, onShow, onPick }: { state: DocketState; doc: Doc; onConcept: (id: string) => void; onShow: (target: Target) => void; onPick?: (pick: Pick) => void }) {
  if (!openDecisions(doc).length) return null;
  return (
    <div className="explore-left-group">
      <span className="explore-gap-kind">
        <LeftLabel kind="decision" size={14} />
      </span>
      {doc.from.map((f, i) => {
        const open = (f.decisions ?? []).filter((d) => d.status !== "closed");
        return open.length ? <DecisionList key={i} from={f} decisions={open} go={{ state, onConcept, onShow, onPick }} /> : null;
      })}
    </div>
  );
}

/* What's left about a capability: its open decisions and its gaps, product and technical, each under a label. */
function LeftItems({
  state,
  capability,
  left,
  detailed,
  onConcept,
  onShow,
  onPick,
}: {
  state: DocketState;
  capability: Capability;
  left: Left;
  detailed: boolean;
  onConcept: (id: string) => void;
  onShow: (target: Target) => void;
  onPick?: (pick: Pick) => void;
}) {
  return (
    <>
      <Decisions state={state} doc={capability} onConcept={onConcept} onShow={onShow} onPick={onPick} />
      <Gaps state={state} product={left.gaps} technical={left.technical} detailed={detailed} />
    </>
  );
}

/*
 * A capability's gaps, product and technical, in one list, each labelled with
 * its kind. Over it, how many of each, which narrow it to one kind. A
 * technical gap says what it's in, which, from the side panel, opens in a new
 * tab.
 */
function Gaps({ state, product, technical, detailed }: { state: DocketState; product: Gap[]; technical: TechnicalGap[]; detailed: boolean }) {
  const [show, setShow] = useState<GapShow>("all");
  if (!product.length && !technical.length) return null;
  return (
    <div className="explore-left-group">
      <div className="explore-gaps-head">
        <span className="explore-gap-kind">
          <LeftLabel kind="product-gap" size={14}>
            Gaps
          </LeftLabel>
        </span>
        <GapFilter product={product.length} technical={technical.length} show={show} onShow={setShow} />
      </div>
      <LeftList detailed={detailed}>
        {show !== "technical-gap" ? product.map((g) => <GapItem key={g.id} state={state} gap={g} detailed={detailed} />) : null}
        {show !== "product-gap"
          ? technical.map(({ gap, on }) => <GapItem key={gap.id} state={state} gap={gap} on={on} detailed={detailed} newTab={!detailed} />)
          : null}
      </LeftList>
    </div>
  );
}

/*
 * What's left across several capabilities, such as a feature's: in the side
 * panel, a row for each with anything open, saying how much, which opens it;
 * with `detailed`, as on a detail page, each one's items in full. `own`, a
 * feature, domain or other doc they're under, adds its own open decisions
 * first. With `technical` false, as for a persona, only what someone using
 * the product would notice.
 */
export function LeftRollup({
  state,
  capabilities,
  own,
  technical = true,
  onOpen,
  detailed = false,
  onConcept = () => {},
  onShow = () => {},
  onPick,
}: {
  state: DocketState;
  capabilities: Capability[];
  own?: Doc;
  technical?: boolean;
  onOpen: Links["onOpen"];
  detailed?: boolean;
  onConcept?: (id: string) => void;
  onShow?: (target: Target) => void;
  onPick?: (pick: Pick) => void;
}) {
  const decisions = own ? openDecisions(own) : [];
  const open = capabilities.map((c) => ({ capability: c, left: leftIn(state, c, technical) })).filter(({ left }) => leftCount(left));
  const total = decisions.length + open.reduce((n, { left }) => n + leftCount(left), 0);
  return (
    <section className="explore-left">
      <Heading count={total || undefined}>What's left</Heading>
      {own ? <Decisions state={state} doc={own} onConcept={onConcept} onShow={onShow} onPick={onPick} /> : null}
      {!capabilities.length ? (
        <p className="concepts-empty">It has no capabilities yet.</p>
      ) : !open.length ? (
        <p className="concepts-empty">
          Nothing open across its {plural(capabilities.length, "capability", "capabilities")}: no open decisions or gaps are written down.
        </p>
      ) : detailed ? (
        open.map(({ capability, left }) => (
          <div key={capability.id} className="explore-left-capability">
            <button type="button" className="concept-group-name link-row" onClick={() => onOpen("capability", capability.id)}>
              {NAMES.capability.icon}
              <span className="concept-row-name">{capability.name}</span>
              <CapabilityStability level={capability.stability} name={capability.name} focusable={false} />
            </button>
            <LeftItems state={state} capability={capability} left={left} detailed onConcept={onConcept} onShow={onShow} onPick={onPick} />
          </div>
        ))
      ) : (
        <ul>
          {open.map(({ capability, left }) => (
            <li key={capability.id}>
              <Row icon={NAMES.capability.icon} name={capability.name} summary={<LeftSummary left={left} />} onClick={() => onOpen("capability", capability.id)}>
                <CapabilityStability level={capability.stability} name={capability.name} focusable={false} />
              </Row>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/*
 * How many outcomes a capability's level expects, how many of those a gap
 * says aren't met, how many a tradeoff says aren't met by choice, and how many
 * a mechanism or component it's built on says it meets; or null with no
 * checklist, or for a draft, which claims none. An outcome nothing names counts
 * as met on its level's word.
 */
export function checklistCounts(state: DocketState, capability: Capability) {
  if (!state.checklist || capability.stability === null) return null;
  const standings = state.checklist.qualities
    .flatMap(outcomesOf)
    .map((o) => outcomeStanding(state, capability, o).standing)
    .filter((s) => s !== "not-expected");
  const n = (standing: string) => standings.filter((s) => s === standing).length;
  return { count: standings.length, notMet: n("gap"), byChoice: n("tradeoff"), evidence: n("evidence") };
}

/*
 * A persona: who they are and what they need, how ready the software is for
 * them, then each feature that serves them, with how ready it is for them and
 * the capabilities in it that do, and any in no feature.
 */
function PersonaView({ state, persona, onOpen, onConcept, onShow, isFiltering, onFilter }: Links & { persona: Persona }) {
  const capabilities = persona.capabilities.flatMap((id) => find(state.capabilities, id) ?? []);
  const domains = [...new Set(capabilities.flatMap((c) => docDomains(c)))];
  const pick: Pick = { kind: "persona", id: persona.id };
  return (
    <article className="concept">
      <Head
        state={state}
        kind="persona"
        doc={persona}
        picture={<PersonaAvatar persona={persona} size={56} />}
        {...personaNameAndRole(persona)}
        trail={domains.length ? <DomainCrumbs state={state} domains={domains} onOpen={onOpen} /> : undefined}
        status={<Readiness value={persona.readiness} basis={readinessBasis(state, persona)} />}
        actions={<MapActions pick={pick} target={targetOf(state, pick)} onShow={onShow} isFiltering={isFiltering} onFilter={onFilter} />}
        onShow={onShow}
        onConcept={onConcept}
      />
      <LeftRollup state={state} capabilities={capabilities} technical={false} onOpen={onOpen} />
      <PersonaFeatures state={state} persona={persona} onOpen={onOpen} />
    </article>
  );
}

/* Each feature that serves a persona, with how ready it is for them and the capabilities in it that do; then any in no feature. */
function PersonaFeatures({ state, persona, onOpen }: { state: DocketState; persona: Persona; onOpen: Links["onOpen"] }) {
  const features = persona.features.flatMap((id) => find(state.features, id) ?? []);
  const capabilities = persona.capabilities.flatMap((id) => find(state.capabilities, id) ?? []);
  const loose = capabilities.filter((c) => !c.feature);
  return (
    <>
      <section>
        <Heading count={features.length}><Term id="feature">Features</Term> that serve them</Heading>
        {features.length ? (
          features.map((f) => {
            const readiness = personaReadinessIn(state, persona, f);
            return (
              <div key={f.id} className="concept-group">
                <div className="concept-group-name">
                  <WidgetsOutlinedIcon sx={{ fontSize: 14, color: "secondary.main" }} />
                  <button type="button" className="link" onClick={() => onOpen("feature", f.id)}>
                    {f.name}
                  </button>
                  {readiness !== null ? (
                    <span className="persona-feature-readiness">
                      <ReadinessMeter value={readiness} basis={readinessBasis(state, persona, f)} />
                    </span>
                  ) : null}
                </div>
                <CapabilityRows capabilities={capabilities.filter((c) => c.feature === f.id)} onOpen={onOpen} />
              </div>
            );
          })
        ) : (
          <p className="concepts-empty">No feature serves them yet.</p>
        )}
      </section>
      {loose.length ? (
        <section>
          <Heading count={loose.length}><Term id="capability">Capabilities</Term> in no <Term id="feature">feature</Term></Heading>
          <CapabilityRows capabilities={loose} onOpen={onOpen} />
        </section>
      ) : null}
    </>
  );
}

/* A persona's row: their name, with their role under it. */
const rowName = (p: Persona) => {
  const { name, role } = personaNameAndRole(p);
  return { name, summary: role ?? p.description };
};

/* Personas as rows, each opening in the panel, with how ready `feature` is for them when it's given. */
export function PersonaRows({ state, personas, feature, onOpen }: { state: DocketState; personas: Persona[]; feature?: Feature; onOpen: Links["onOpen"] }) {
  return (
    <ul>
      {personas.map((p) => {
        const readiness = feature ? personaReadinessIn(state, p, feature) : null;
        return (
          <li key={p.id}>
            <Row icon={<PersonaAvatar persona={p} size={28} />} {...rowName(p)} onClick={() => onOpen("persona", p.id)}>
              {readiness !== null && feature ? <ReadinessMeter value={readiness} basis={readinessBasis(state, p, feature)} inButton /> : null}
            </Row>
          </li>
        );
      })}
    </ul>
  );
}

export function Row({
  icon,
  name,
  summary,
  onClick,
  children,
}: {
  icon: ReactNode;
  name: string;
  summary?: ReactNode;
  onClick: () => void;
  children?: ReactNode;
}) {
  return (
    <button type="button" className="concept-row" onClick={onClick}>
      <span style={{ alignSelf: "flex-start", marginTop: 2, display: "inline-flex" }}>{icon}</span>
      <span className="concept-row-text">
        <span className="concept-row-name">{name}</span>
        {summary ? <span className="concept-row-summary">{summary}</span> : null}
      </span>
      {children}
    </button>
  );
}

function Crumb({ icon, name, onClick }: { icon: ReactNode; name: string; onClick: () => void }) {
  return (
    <button type="button" className="link explore-crumb" onClick={onClick}>
      {icon}
      {name}
    </button>
  );
}

/* The domains something spans, each opening in the panel. */
export function DomainCrumbs({ state, domains, onOpen }: { state: DocketState; domains: string[]; onOpen: Links["onOpen"] }) {
  if (!domains.length) return <>In no domain</>;
  return (
    <>
      {domains.map((id, i) => (
        <span key={id} className="explore-crumb">
          {i ? <span className="faint">+</span> : null}
          <Crumb icon={<DomainIcon />} name={domainName(state, id)} onClick={() => onOpen("domain", id)} />
        </span>
      ))}
    </>
  );
}
