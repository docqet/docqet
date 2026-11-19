import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import MyLocationRoundedIcon from "@mui/icons-material/MyLocationRounded";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import Box from "@mui/material/Box";
import { MATURITY_BANDS, maturityBand } from "./design/maturity/maturity";
import { RingGlyph } from "./design/maturity/RingGlyph";
import { STABILITY, levelColor } from "./design/stability/stability";
import { StabilityMark } from "./design/stability/StabilityMark";
import { ConceptChips, Markdown, PageLink, PanelHeader } from "./Concepts";
import { DomainIcon } from "./FeatureMap";
import { PersonaAvatar, PersonaIcon, ReadinessMeter, personaNameAndRole, type ReadinessBasis } from "./Personas";
import { ProjectIcon } from "./ProjectFilter";
import {
  appliesAt,
  capabilityTarget,
  checklistItem,
  contradictionsOf,
  docDomains,
  domainGroup,
  domainName,
  featureConcepts,
  featureTarget,
  find,
  leftCount,
  leftIn,
  onlySection,
  pageHref,
  withoutSection,
  projectName,
  partOf,
  personaReadinessIn,
  targetOf,
  type Capability,
  type ChecklistItem,
  type ChecklistKind,
  type Contribution,
  type Domain,
  type Doc,
  type DocketState,
  type Feature,
  type Gap,
  type Left,
  type Persona,
  type Pick,
  type Rule,
  type Target,
} from "./state";

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
        title={names.many}
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
    const docs: { doc: Doc; meta: string; mark: ReactNode; picture?: ReactNode; name?: string; role?: string | null }[] =
      kind === "persona"
        ? state.personas.map((p) => ({
            doc: p,
            ...personaNameAndRole(p),
            meta: `${plural(p.capabilities.length, "capability", "capabilities")} · ${plural(p.features.length, "feature", "features")}`,
            mark: p.readiness !== null ? <ReadinessMeter value={p.readiness} basis={readinessBasis(state, p)} inButton /> : null,
            picture: <PersonaAvatar persona={p} size={36} />,
          }))
        : kind === "domain"
        ? state.domains.map((d) => ({
            doc: d,
            meta: plural(d.features.length, "feature", "features"),
            mark: d.maturity !== null ? <RingGlyph progress={d.maturity} size={20} /> : null,
          }))
        : kind === "feature"
          ? state.features.map((f) => ({
              doc: f,
              meta: `${domains(f.parts.map((p) => p.domain))} · ${plural(f.capabilities.length, "capability", "capabilities")}`,
              mark: f.maturity !== null ? <RingGlyph progress={f.maturity} size={20} /> : null,
            }))
          : state.capabilities.map((c) => ({
              doc: c,
              meta: `${c.feature ? (find(state.features, c.feature)?.name ?? c.feature) : "Not in a feature"} · ${domains(docDomains(c))}`,
              mark: <StabilityMark level={c.stability} feature={c.name} focusable={false} size="short" />,
            }));
    return docs.sort((a, b) => a.doc.name.localeCompare(b.doc.name));
  }, [state, kind]);
  const shown = rows.filter(({ doc, meta }) => {
    const text = `${doc.name} ${doc.summary ?? ""} ${doc.id} ${meta}`.toLowerCase();
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
          {shown.map(({ doc, meta, mark, picture, name, role }) => (
            <li key={doc.id}>
              <button type="button" className={picture ? "has-picture" : undefined} onClick={() => onOpen(doc.id)}>
                {picture}
                <span className="explore-name">
                  <span className="concept-name">{name ?? doc.name}</span>
                  {mark}
                </span>
                {role ? <span className="persona-role">{role}</span> : null}
                {doc.summary ? <span className="concept-summary">{doc.summary}</span> : null}
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
 * it's from instead. `body` picks what of each source's body shows.
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
  body = (f) => f.body,
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
  body?: (f: Contribution) => string;
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
  const markdown = (f: Contribution) => {
    const text = body(f);
    return text.trim() ? <Markdown state={state} concept={f} text={text} onConcept={onConcept} onShow={onShow} onPick={onPick} /> : null;
  };
  return (
    <>
      <header className="explore-hero">
        <div className="explore-kind">
          {NAMES[kind].icon}
          {NAMES[kind].one}
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
                    <span className="explore-source-label">Domain</span>
                    <span className="explore-source-name">
                      <DomainIcon size={14} />
                      {domainName(state, f.domain)}
                    </span>
                  </span>
                )}
                <span className="explore-source-from">
                  <span className="explore-source-label">Project</span>
                  <span className="explore-source-name">
                    <ProjectIcon size={14} />
                    {projectName(state, f.project)}
                  </span>
                </span>
              </div>
            ) : null}
            <div className="explore-source-body">
              {f.summary ? <p className="explore-source-summary">{f.summary}</p> : null}
              {markdown(f)}
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

/* Maturity in short, beside a name: its ring, with the percentage, and its band; or why there's none. */
export function Maturity({ value, of }: { value: number | null; of: string }) {
  if (value === null)
    return (
      <span className="explore-level faint" title={`No maturity yet: ${of}`}>
        No maturity yet
      </span>
    );
  const band = maturityBand(value);
  return (
    <Box component="span" className="explore-level" sx={levelColor(band)} title={`${value}% maturity`}>
      <RingGlyph progress={value} size={22} />
      <strong>{MATURITY_BANDS[band]}</strong>
    </Box>
  );
}

/* Where a capability's domains are at different levels, each of theirs: "Alpha in Billing · GA in Guest stays". */
function DomainLevels({ state, capability }: { state: DocketState; capability: Capability }) {
  if (new Set(capability.levels.map((l) => l.level)).size < 2) return null;
  return (
    <p className="explore-domain-levels faint">
      {capability.levels.map((l) => `${STABILITY[l.level].name} in ${domainName(state, l.domain)}`).join(" · ")}
    </p>
  );
}

/* How ready the software is for a persona, on readiness's own scale. */
export function Readiness({ value, basis }: { value: number | null; basis: ReadinessBasis }) {
  if (value === null)
    return (
      <span className="explore-level faint" title="Nothing serves them yet, so there's no readiness.">
        No readiness yet
      </span>
    );
  return <ReadinessMeter value={value} basis={basis} large />;
}

/* What a persona's readiness is worked out from: the capabilities that serve them, in `feature` or everywhere. */
export function readinessBasis(state: DocketState, persona: Persona, feature?: Feature): ReadinessBasis {
  const ids = feature ? feature.capabilities.filter((id) => persona.capabilities.includes(id)) : persona.capabilities;
  return { persona: personaNameAndRole(persona).name, feature: feature?.name, capabilities: ids.flatMap((id) => find(state.capabilities, id) ?? []) };
}

/* A capability's level, as a mark and its name in the level's color. */
function Level({ name, level }: { name: string; level: Capability["stability"] }) {
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
      <LeftRollup state={state} capabilities={domainCapabilities(state, domain)} onOpen={onOpen} />
      <section>
        <Heading count={features.length}>Features</Heading>
        <DomainFeatures state={state} domain={domain} features={features} onOpen={onOpen} />
      </section>
      {loose.length ? (
        <section>
          <Heading count={loose.length}>Capabilities in no feature</Heading>
          <CapabilityRows capabilities={loose} domain={domain.id} onOpen={onOpen} />
        </section>
      ) : null}
      {concepts.length ? (
        <section>
          <Heading count={concepts.length}>Concepts</Heading>
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
              summary={elsewhere.length ? `${f.summary ?? ""} Also in ${elsewhere.join(", ")}.`.trim() : f.summary}
              onClick={() => onOpen("feature", f.id)}
            >
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
            <Row icon={NAMES.capability.icon} name={c.name} summary={c.summary} onClick={() => onOpen("capability", c.id)}>
              <StabilityMark level={level} feature={c.name} focusable={false} size="short" />
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
            <Heading count={part.capabilities.length}>Capabilities</Heading>
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
      <LeftRollup state={state} capabilities={capabilities} onOpen={onOpen} />
      <FeatureParts state={state} feature={feature} onOpen={onOpen} />
      {personas.length ? (
        <section>
          <Heading count={personas.length}>Who it serves</Heading>
          <PersonaRows state={state} personas={personas} feature={feature} onOpen={onOpen} />
        </section>
      ) : null}
      {concepts.length ? (
        <section>
          <Heading count={concepts.length}>Concepts its capabilities use</Heading>
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

/* A capability's body without its open decisions, which show under what's left. */
export const capabilityBody = (f: Contribution) => withoutSection(f.body, "open decisions");

/*
 * In the side panel, a capability: what it does, its level, what's left
 * about it, who it serves, the rules it follows by name, and the concepts it
 * uses. The evidence, checklist and code are on its detail page.
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
        body={capabilityBody}
        onShow={onShow}
        onConcept={onConcept}
      />
      <WhatsLeft
        state={state}
        capability={capability}
        onConcept={onConcept}
        onShow={onShow}
        checklist={<a href={pageHref(pick, "checklist")} target="_blank" rel="noopener">See the checklist</a>}
      />
      {personas.length ? (
        <section>
          <Heading count={personas.length}>Who it serves</Heading>
          <PersonaRows state={state} personas={personas} onOpen={onOpen} />
        </section>
      ) : null}
      <section>
        <Heading count={rules.length}>Rules it follows</Heading>
        {rules.length ? <RuleNames rules={rules} /> : <p className="concepts-empty">None written down yet.</p>}
      </section>
      {concepts.length ? (
        <section>
          <Heading count={concepts.length}>Concepts it uses</Heading>
          <ConceptChips concepts={concepts} onOpen={onConcept} scopeOf={(c) => domainName(state, c.domain)} />
        </section>
      ) : null}
    </article>
  );
}

/* Rules by name alone, for the side panel: what each says shows on hover, and in full on the detail page. */
function RuleNames({ rules }: { rules: Rule[] }) {
  return (
    <ul className="explore-rule-names">
      {rules.map((r) => (
        <li key={r.id} title={r.summary}>
          <RuleRoundedIcon sx={{ fontSize: 15, color: "text.secondary", flex: "none", mt: "2px" }} />
          <span>{r.name}</span>
        </li>
      ))}
    </ul>
  );
}

const countOf = (n: number, one: string, many: string) => (n ? [plural(n, one, many)] : []);

/* What's left about a capability, in a line: "1 open decision · 2 known gaps". */
export const leftLine = (left: Left) =>
  [
    ...countOf(left.decisions.length, "open decision", "open decisions"),
    ...countOf(left.gaps.length, "known gap", "known gaps"),
    ...countOf(left.rules.length, "rule without evidence", "rules without evidence"),
  ].join(" · ");

/*
 * What's still open about a capability, near the top so it's read first:
 * decisions nobody has made, its known gaps, and the rules it follows that
 * nothing verifies or implements yet; then how much of its level's checklist
 * is met, and `checklist`, a way to the whole of it. With `detailed`, as on
 * its detail page, each gap says the checklist item it falls short of.
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
  const counts = checklistCounts(state, capability, left.gaps);
  return (
    <section className="explore-left">
      <Heading count={n || undefined}>What's left</Heading>
      {n ? (
        <LeftItems state={state} capability={capability} left={left} detailed={detailed} onConcept={onConcept} onShow={onShow} onPick={onPick} />
      ) : (
        <p className="concepts-empty">Nothing open: no open decisions, known gaps, or rules without evidence are written down.</p>
      )}
      {counts ? (
        <p className="explore-left-checklist">
          <span>
            {counts.count - counts.notMet} of {counts.count} {STABILITY[capability.stability].name} checklist items met.
          </span>
          {checklist}
        </p>
      ) : null}
    </section>
  );
}

/* What's left about a capability: its open decisions, known gaps and rules without evidence, each under a label. */
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
      {left.decisions.length ? (
        <div className="explore-left-group">
          <span className="explore-gap-kind">Open decisions</span>
          <Markdown
            state={state}
            concept={capability}
            text={left.decisions.map((d) => `- ${d}`).join("\n")}
            onConcept={onConcept}
            onShow={onShow}
            onPick={onPick}
          />
        </div>
      ) : null}
      {left.gaps.length ? (
        <div className="explore-left-group">
          <span className="explore-gap-kind">Known gaps</span>
          <ul className="explore-left-list">
            {left.gaps.map((g) => {
              const named = detailed && g.item ? checklistItem(state.checklist, g.item) : undefined;
              return (
                <li key={g.id}>
                  {g.text}
                  <span className="explore-left-meta">
                    <span className="explore-tag">{gapKind(g)}</span>
                    {named ? (
                      <span>
                        Falls short of {named.category.name}{named.item.expect ? `: ${named.item.expect}` : ""}
                      </span>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
      {left.rules.length ? (
        <div className="explore-left-group">
          <span className="explore-gap-kind">Rules without evidence</span>
          <ul className="explore-left-list">
            {left.rules.map(({ rule, missing }) => (
              <li key={rule.id}>
                {rule.name}
                <span className="explore-left-meta">
                  <EvidenceWarning>
                    {missing.length === 2 ? "Nothing verifies or implements it" : missing[0] === "verifies" ? "Nothing verifies it" : "Nothing implements it"}
                  </EvidenceWarning>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  );
}

/*
 * What's left across several capabilities, such as a feature's: in the side
 * panel, a row for each with anything open, saying how much, which opens it;
 * with `detailed`, as on a detail page, each one's items in full.
 */
export function LeftRollup({
  state,
  capabilities,
  onOpen,
  detailed = false,
  onConcept = () => {},
  onShow = () => {},
  onPick,
}: {
  state: DocketState;
  capabilities: Capability[];
  onOpen: Links["onOpen"];
  detailed?: boolean;
  onConcept?: (id: string) => void;
  onShow?: (target: Target) => void;
  onPick?: (pick: Pick) => void;
}) {
  const open = capabilities.map((c) => ({ capability: c, left: leftIn(state, c) })).filter(({ left }) => leftCount(left));
  const total = open.reduce((n, { left }) => n + leftCount(left), 0);
  return (
    <section className="explore-left">
      <Heading count={total || undefined}>What's left</Heading>
      {!capabilities.length ? (
        <p className="concepts-empty">It has no capabilities yet.</p>
      ) : !open.length ? (
        <p className="concepts-empty">
          Nothing open across its {plural(capabilities.length, "capability", "capabilities")}: no open decisions, known gaps, or rules without evidence are
          written down.
        </p>
      ) : detailed ? (
        open.map(({ capability, left }) => (
          <div key={capability.id} className="explore-left-capability">
            <button type="button" className="concept-group-name link-row" onClick={() => onOpen("capability", capability.id)}>
              {NAMES.capability.icon}
              <span className="concept-row-name">{capability.name}</span>
              <StabilityMark level={capability.stability} feature={capability.name} focusable={false} size="short" />
            </button>
            <LeftItems state={state} capability={capability} left={left} detailed onConcept={onConcept} onShow={onShow} onPick={onPick} />
          </div>
        ))
      ) : (
        <ul>
          {open.map(({ capability, left }) => (
            <li key={capability.id}>
              <Row icon={NAMES.capability.icon} name={capability.name} summary={leftLine(left)} onClick={() => onOpen("capability", capability.id)}>
                <StabilityMark level={capability.stability} feature={capability.name} focusable={false} size="short" />
              </Row>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export const gapKind = (g: Gap) => (g.kind === "accepted-tradeoff" ? "Accepted tradeoff" : "To close later");

/*
 * How many items a capability's level expects, and how many of those a gap
 * says aren't met; or null with no checklist. An item that applies counts as
 * met unless a known gap names it, since declaring a level claims what it
 * expects, except the gaps written down.
 */
export function checklistCounts(state: DocketState, capability: Capability, gaps: Gap[]) {
  if (!state.checklist) return null;
  const items = state.checklist.categories.flatMap((c) => c.items).filter((i) => appliesAt(i, capability.stability));
  return { count: items.length, notMet: items.filter((i) => gaps.some((g) => g.item === i.id)).length };
}

/* What an item might look like for different kinds of software, and what to leave until later, folded away. */
export function ChecklistGuidance({ item, kinds }: { item: ChecklistItem; kinds: ChecklistKind[] }) {
  if (!item.examples.length && !item.notYet.length) return null;
  const kindName = (id: string) => kinds.find((k) => k.id === id)?.name ?? id;
  return (
    <details className="explore-checklist-guidance">
      <summary>What this might look like</summary>
      {item.examples.length ? (
        <ul>
          {item.examples.map((e) => (
            <li key={e.text}>
              {e.kinds.length ? <span className="explore-checklist-guidance-kinds">{e.kinds.map(kindName).join(", ")}: </span> : null}
              {e.text}
            </li>
          ))}
        </ul>
      ) : null}
      {item.notYet.length ? (
        <>
          <span className="explore-checklist-guidance-label">Not yet</span>
          <ul>
            {item.notYet.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </>
      ) : null}
    </details>
  );
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
        body={(f) => onlySection(f.body, "needs")}
        onShow={onShow}
        onConcept={onConcept}
      />
      <LeftRollup state={state} capabilities={capabilities} onOpen={onOpen} />
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
        <Heading count={features.length}>Features that serve them</Heading>
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
          <Heading count={loose.length}>Capabilities in no feature</Heading>
          <CapabilityRows capabilities={loose} onOpen={onOpen} />
        </section>
      ) : null}
    </>
  );
}

/* A persona's row: their name, with their role under it. */
const rowName = (p: Persona) => {
  const { name, role } = personaNameAndRole(p);
  return { name, summary: role ?? p.summary };
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

export function EvidenceWarning({ children }: { children: ReactNode }) {
  return (
    <span className="explore-evidence-warning">
      <WarningAmberRoundedIcon sx={{ fontSize: 13 }} />
      {children}
    </span>
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
  summary?: string;
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
