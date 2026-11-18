import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import IncompleteCircleRoundedIcon from "@mui/icons-material/IncompleteCircleRounded";
import MyLocationRoundedIcon from "@mui/icons-material/MyLocationRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import Box from "@mui/material/Box";
import { MATURITY_BANDS, maturityBand } from "./design/maturity/maturity";
import { RingGlyph } from "./design/maturity/RingGlyph";
import { STABILITY, levelColor } from "./design/stability/stability";
import { StabilityMark } from "./design/stability/StabilityMark";
import { ConceptChips, Markdown, PanelHeader } from "./Concepts";
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
  nextLevel,
  projectName,
  partOf,
  personaReadinessIn,
  targetOf,
  type Capability,
  type ChecklistItem,
  type Contribution,
  type Domain,
  type Doc,
  type DocketState,
  type Feature,
  type Gap,
  type Persona,
  type Pick,
  type Target,
} from "./state";

/* What the panel can show: the product's parts, each as a list or one of them. */
export type ExploreKind = "domain" | "feature" | "capability" | "persona";

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

const NAMES: Record<ExploreKind, { one: string; many: string; icon: ReactNode }> = {
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
 * or level, and ways to find it on the map; then any contradictions; then what
 * it is. Each source, one or several, such as two projects or two domains
 * defining it, gets a card of its own, headed by the domain and project it's
 * from, so it's always clear who says what, and several can be compared.
 */
function Head({
  state,
  kind,
  doc,
  trail,
  extra,
  mark,
  picture,
  name = doc.name,
  role,
  target,
  onShow,
  onConcept,
  isFiltering,
  onFilter,
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
  /* Under its name: its maturity. */
  extra?: ReactNode;
  /* Under its name: its level. */
  mark?: ReactNode;
  target: Target;
  onShow: (target: Target) => void;
  onConcept: (id: string) => void;
  isFiltering: Links["isFiltering"];
  onFilter: Links["onFilter"];
}) {
  const pick: Pick = { kind, id: doc.id };
  const filtering = isFiltering(pick);
  const problems = contradictionsOf(state, kind, doc.id);
  /* Domains and personas aren't written in a domain, so their sources are told apart by project alone. */
  const byProject = kind === "domain" || kind === "persona";
  const markdown = (f: Contribution) =>
    f.body.trim() ? <Markdown state={state} concept={f} text={f.body} onConcept={onConcept} onShow={onShow} /> : null;
  return (
    <>
      <header className="explore-hero">
        <div className="explore-kind">
          {NAMES[kind].icon}
          {NAMES[kind].one}
        </div>
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
        {trail ? <div className="explore-trail">{trail}</div> : null}
        {extra}
        {mark ? <div className="explore-mark">{mark}</div> : null}
        <div className="explore-actions">
          <button type="button" className="filter-toggle" onClick={() => onShow(target)}>
            <MyLocationRoundedIcon sx={{ fontSize: 15 }} />
            Show on map
          </button>
          <button type="button" className="filter-toggle" aria-pressed={filtering} onClick={() => onFilter(pick)}>
            <FilterListRoundedIcon sx={{ fontSize: 15 }} />
            {filtering ? "Filtering to this" : "Filter to this"}
            {filtering ? <CloseRoundedIcon sx={{ fontSize: 14, ml: 0.25 }} /> : null}
          </button>
        </div>
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

/* A section's heading, with how many it holds. */
function Heading({ children, count }: { children: ReactNode; count?: number }) {
  return (
    <h3 className="explore-heading">
      {children}
      {count !== undefined ? <span className="explore-count">{count}</span> : null}
    </h3>
  );
}

function Maturity({ value, of }: { value: number | null; of: string }) {
  if (value === null) return <p className="explore-level faint">No maturity yet: {of}</p>;
  const band = maturityBand(value);
  return (
    <Box className="explore-level" sx={levelColor(band)}>
      <RingGlyph progress={value} size={22} />
      <strong>{MATURITY_BANDS[band]}</strong>
      <span className="faint">{value}% maturity</span>
    </Box>
  );
}

/*
 * A capability's level in short, and, where its domains are at different
 * levels, each of theirs: "Alpha in Billing · GA in Guest stays".
 */
function CapabilityLevel({ state, capability }: { state: DocketState; capability: Capability }) {
  const differ = new Set(capability.levels.map((l) => l.level)).size > 1;
  return (
    <span className="explore-level-line">
      <Level name={capability.name} level={capability.stability} />
      {differ ? (
        <span className="faint">
          {capability.levels.map((l) => `${STABILITY[l.level].name} in ${domainName(state, l.domain)}`).join(" · ")}
        </span>
      ) : null}
    </span>
  );
}

/* How ready the software is for a persona, on readiness's own scale. */
function Readiness({ value, basis }: { value: number | null; basis: ReadinessBasis }) {
  if (value === null) return <p className="explore-level faint">Nothing serves them yet, so there's no readiness.</p>;
  return (
    <div className="explore-level">
      <ReadinessMeter value={value} basis={basis} large />
    </div>
  );
}

/* What a persona's readiness is worked out from: the capabilities that serve them, in `feature` or everywhere. */
function readinessBasis(state: DocketState, persona: Persona, feature?: Feature): ReadinessBasis {
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

function DomainView({ state, domain, onOpen, onConcept, onShow, isFiltering, onFilter }: Links & { domain: Domain }) {
  const features = domain.features.flatMap((id) => find(state.features, id) ?? []);
  const loose = domain.capabilities.flatMap((id) => find(state.capabilities, id) ?? []);
  const concepts = state.concepts.filter((c) => c.domain === domain.id);
  const rules = state.rules.filter((r) => r.domain === domain.id);
  return (
    <article className="concept">
      <Head
        state={state}
        kind="domain"
        doc={domain}
        extra={<Maturity value={domain.maturity} of="it builds no capability in a feature yet" />}
        target={{ items: [domainGroup(domain.id)] }}
        onShow={onShow}
        onConcept={onConcept}
        isFiltering={isFiltering}
        onFilter={onFilter}
      />
      <section>
        <Heading count={features.length}>Features</Heading>
        {features.length ? (
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
        ) : (
          <p className="concepts-empty">A part of the business the software doesn't serve yet.</p>
        )}
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
      {rules.length ? (
        <section>
          <Heading count={rules.length}>Rules</Heading>
          <RuleList state={state} rules={rules} />
        </section>
      ) : null}
    </article>
  );
}

/* Capabilities as rows, each opening in the panel, at their level in `domain` when it's given. */
function CapabilityRows({
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

/*
 * A feature: the domains it spans, its maturity across all of them, then each
 * domain's part, with that part's maturity and the capabilities it builds at
 * their levels there, then the concepts and rules its capabilities use.
 */
function FeatureView({ state, feature, onOpen, onConcept, onShow, isFiltering, onFilter }: Links & { feature: Feature }) {
  const capabilities = feature.capabilities.flatMap((id) => find(state.capabilities, id) ?? []);
  const concepts = featureConcepts(state, feature);
  const rules = [...new Set(capabilities.flatMap((c) => c.rules))].flatMap((id) => find(state.rules, id) ?? []);
  const personas = state.personas.filter((p) => p.features.includes(feature.id));
  return (
    <article className="concept">
      <Head
        state={state}
        kind="feature"
        doc={feature}
        trail={<DomainCrumbs state={state} domains={feature.parts.map((p) => p.domain)} onOpen={onOpen} />}
        extra={<Maturity value={feature.maturity} of="it has no capabilities yet" />}
        target={featureTarget(state, feature.id)}
        onShow={onShow}
        onConcept={onConcept}
        isFiltering={isFiltering}
        onFilter={onFilter}
      />
      {feature.parts.length ? (
        feature.parts.map((part) => (
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
        ))
      ) : (
        <section>
          <p className="concepts-empty">A job the software doesn't do yet.</p>
        </section>
      )}
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
      {rules.length ? (
        <section>
          <Heading count={rules.length}>Rules its capabilities follow</Heading>
          <RuleList state={state} rules={rules} />
        </section>
      ) : null}
    </article>
  );
}

function CapabilityView({ state, capability, onOpen, onConcept, onShow, isFiltering, onFilter }: Links & { capability: Capability }) {
  const feature = capability.feature ? find(state.features, capability.feature) : undefined;
  const concepts = capability.concepts.flatMap((id) => find(state.concepts, id) ?? []);
  const rules = capability.rules.flatMap((id) => find(state.rules, id) ?? []);
  const gaps = capability.gaps.flatMap((id) => state.gaps.find((g) => g.id === id) ?? []);
  const personas = capability.personas.flatMap((id) => find(state.personas, id) ?? []);
  return (
    <article className="concept">
      <Head
        state={state}
        kind="capability"
        doc={capability}
        trail={
          <>
            <DomainCrumbs state={state} domains={docDomains(capability)} onOpen={onOpen} />
            <span className="faint">›</span>
            {feature ? (
              <Crumb icon={NAMES.feature.icon} name={feature.name} onClick={() => onOpen("feature", feature.id)} />
            ) : (
              "Not in a feature"
            )}
          </>
        }
        mark={<CapabilityLevel state={state} capability={capability} />}
        target={capabilityTarget(state, capability.id)}
        onShow={onShow}
        onConcept={onConcept}
        isFiltering={isFiltering}
        onFilter={onFilter}
      />
      {personas.length ? (
        <section>
          <Heading count={personas.length}>Who it serves</Heading>
          <PersonaRows state={state} personas={personas} onOpen={onOpen} />
        </section>
      ) : null}
      <section>
        <Heading count={rules.length}>Rules it follows</Heading>
        {rules.length ? <RuleList state={state} rules={rules} /> : <p className="concepts-empty">None written down yet.</p>}
      </section>
      {concepts.length ? (
        <section>
          <Heading count={concepts.length}>Concepts it uses</Heading>
          <ConceptChips concepts={concepts} onOpen={onConcept} scopeOf={(c) => domainName(state, c.domain)} />
        </section>
      ) : null}
      {gaps.length ? (
        <section>
          <Heading count={gaps.length}>Known gaps</Heading>
          <ul>
            {gaps.map((g) => {
              const named = g.item ? checklistItem(state.checklist, g.item) : undefined;
              return (
                <li key={g.id} className="explore-text">
                  <span className="explore-gap-kind">{gapKind(g)}</span>
                  {g.text}
                  {named ? (
                    <span className="explore-gap-item">
                      Falls short of {named.area.name}: {withoutExamples(named.item.text)}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
      <ChecklistSection key={capability.id} state={state} capability={capability} gaps={gaps} />
      {capability.code.length ? (
        <section>
          <Heading count={capability.code.length}>Code</Heading>
          <ul>
            {capability.code.map((c) => (
              <li key={c.glob} className="explore-text">
                <code>{c.glob}</code> <span className="faint">{plural(c.files, "file", "files")}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}

const gapKind = (g: Gap) => (g.kind === "accepted-tradeoff" ? "Accepted tradeoff" : "To close later");

/* A checklist item's text without its examples in parentheses, to name it in a line. */
const withoutExamples = (text: string) => text.replace(/\s*\([^)]*\)/g, "");

/*
 * What a capability's level generally includes, and how much of it is met.
 * An item that applies counts as met unless a known gap names it, since
 * declaring a level claims its items, except the gaps written down. By
 * default only what isn't met shows, by area. The whole checklist can be
 * shown too, each area opening to its items, and then the next level's new
 * items as well, to see what promoting it would take.
 */
function ChecklistSection({ state, capability, gaps }: { state: DocketState; capability: Capability; gaps: Gap[] }) {
  const level = capability.stability;
  const next = nextLevel(level);
  const gapsOf = (item: ChecklistItem) => gaps.filter((g) => g.item === item.id);
  const areas = (state.checklist?.groups.flatMap((g) => g.areas) ?? []).map((area) => {
    const items = area.items.filter((i) => appliesAt(i, level));
    return {
      area,
      items,
      notMet: items.filter((i) => gapsOf(i).length),
      added: next ? area.items.filter((i) => appliesAt(i, next) && !appliesAt(i, level)) : [],
    };
  });
  const [showAll, setShowAll] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [open, setOpen] = useState(() => new Set(areas.filter((a) => a.notMet.length).map((a) => a.area.id)));
  if (!state.checklist) return null;
  const toggle = (id: string) =>
    setOpen((was) => {
      const now = new Set(was);
      if (!now.delete(id)) now.add(id);
      return now;
    });
  const count = areas.reduce((n, a) => n + a.items.length, 0);
  const notMet = areas.reduce((n, a) => n + a.notMet.length, 0);
  const adds = areas.reduce((n, a) => n + a.added.length, 0);
  const levelName = STABILITY[level].name;
  const nextName = next ? STABILITY[next].name : "";
  const row = (item: ChecklistItem) => {
    const itemGaps = gapsOf(item);
    const isNew = !appliesAt(item, level);
    return (
      <li key={item.id} className="explore-checklist-item" data-met={isNew ? undefined : itemGaps.length ? "no" : "yes"}>
        {isNew ? (
          <RadioButtonUncheckedRoundedIcon className="explore-checklist-icon" aria-label="Not yet expected" sx={{ fontSize: 15 }} />
        ) : itemGaps.length ? (
          <IncompleteCircleRoundedIcon className="explore-checklist-icon" aria-label="Not met" sx={{ fontSize: 15 }} />
        ) : (
          <CheckRoundedIcon className="explore-checklist-icon" aria-label="Met" sx={{ fontSize: 15 }} />
        )}
        <span className="explore-checklist-text">
          {item.text}
          {item.baseline || isNew ? (
            <span className="explore-rule-meta">
              {item.baseline ? <span className="explore-tag">Baseline</span> : null}
              {isNew ? (
                <Box component="span" className="explore-tag" sx={levelColor(next!)}>
                  New at {nextName}
                </Box>
              ) : null}
            </span>
          ) : null}
          {itemGaps.map((g) => (
            <span key={g.id} className="explore-checklist-gap">
              <span className="explore-gap-kind">{gapKind(g)}</span>
              {g.text}
            </span>
          ))}
        </span>
      </li>
    );
  };
  return (
    <section>
      <Heading>Stability checklist</Heading>
      <p className="explore-checklist-note">
        {count - notMet} of {count} items {levelName} includes are met. Anything not listed as a gap counts as met.
      </p>
      {showAll ? (
        <ul className="explore-checklist">
          {areas.map(({ area, items, notMet: missing, added }) => {
            const shown = showNext ? [...items, ...added] : items;
            if (!shown.length) return null;
            const isOpen = open.has(area.id);
            return (
              <li key={area.id}>
                <button type="button" className="explore-checklist-area" aria-expanded={isOpen} title={area.why} onClick={() => toggle(area.id)}>
                  <ChevronRightRoundedIcon className="explore-checklist-chevron" sx={{ fontSize: 16 }} />
                  <span className="explore-checklist-area-name">{area.name}</span>
                  {missing.length ? <span className="explore-checklist-gaps">{missing.length} not met</span> : null}
                  <span className="explore-count">
                    {items.length}
                    {showNext && added.length ? ` +${added.length}` : ""}
                  </span>
                </button>
                {isOpen ? <ul className="explore-checklist-items">{shown.map(row)}</ul> : null}
              </li>
            );
          })}
        </ul>
      ) : notMet ? (
        areas
          .filter((a) => a.notMet.length)
          .map(({ area, notMet: missing }) => (
            <div key={area.id} className="explore-checklist-unmet">
              <span className="explore-checklist-area-label" title={area.why}>
                {area.name}
              </span>
              <ul>{missing.map(row)}</ul>
            </div>
          ))
      ) : (
        <p className="concepts-empty">Everything {levelName} includes is met.</p>
      )}
      <div className="explore-checklist-toggles">
        <label className="explore-checklist-toggle">
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
          Show all {count} items
        </label>
        {showAll && next && adds ? (
          <label className="explore-checklist-toggle">
            <input type="checkbox" checked={showNext} onChange={(e) => setShowNext(e.target.checked)} />
            Show what {nextName} adds ({adds})
          </label>
        ) : null}
      </div>
    </section>
  );
}

/*
 * A persona: who they are and what they need, how ready the software is for
 * them, then each feature that serves them, with how ready it is for them and
 * the capabilities in it that do, and any in no feature.
 */
function PersonaView({ state, persona, onOpen, onConcept, onShow, isFiltering, onFilter }: Links & { persona: Persona }) {
  const features = persona.features.flatMap((id) => find(state.features, id) ?? []);
  const capabilities = persona.capabilities.flatMap((id) => find(state.capabilities, id) ?? []);
  const loose = capabilities.filter((c) => !c.feature);
  const domains = [...new Set(capabilities.flatMap((c) => docDomains(c)))];
  return (
    <article className="concept">
      <Head
        state={state}
        kind="persona"
        doc={persona}
        picture={<PersonaAvatar persona={persona} size={56} />}
        {...personaNameAndRole(persona)}
        trail={domains.length ? <DomainCrumbs state={state} domains={domains} onOpen={onOpen} /> : undefined}
        extra={<Readiness value={persona.readiness} basis={readinessBasis(state, persona)} />}
        target={targetOf(state, { kind: "persona", id: persona.id })}
        onShow={onShow}
        onConcept={onConcept}
        isFiltering={isFiltering}
        onFilter={onFilter}
      />
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
                <CapabilityRows
                  capabilities={capabilities.filter((c) => c.feature === f.id)}
                  onOpen={onOpen}
                />
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
    </article>
  );
}

/* A persona's row: their name, with their role under it. */
const rowName = (p: Persona) => {
  const { name, role } = personaNameAndRole(p);
  return { name, summary: role ?? p.summary };
};

/* Personas as rows, each opening in the panel, with how ready `feature` is for them when it's given. */
function PersonaRows({ state, personas, feature, onOpen }: { state: DocketState; personas: Persona[]; feature?: Feature; onOpen: Links["onOpen"] }) {
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

/* A rule as the panel shows it: its name, what it says, its kind and status, and its domain when several are showing. */
function RuleList({ state, rules }: { state: DocketState; rules: { id: string; name: string; summary?: string; kind: string; status: string; domain: string }[] }) {
  return (
    <ul>
      {rules.map((r) => (
        <li key={r.id} className="explore-rule">
          <RuleRoundedIcon sx={{ fontSize: 15, color: "text.secondary", flex: "none", mt: "2px" }} />
          <span className="concept-row-text">
            <span className="concept-row-name">{r.name}</span>
            {r.summary ? <span className="concept-row-summary">{r.summary}</span> : null}
            <span className="explore-rule-meta">
              <span className="explore-tag">{r.kind === "core" ? "Core" : "Edge case"}</span>
              <span className="explore-tag" data-status={r.status}>
                {r.status[0].toUpperCase() + r.status.slice(1)}
              </span>
              {state.domains.length > 1 ? <span className="faint">{domainName(state, r.domain)}</span> : null}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function Row({
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
function DomainCrumbs({ state, domains, onOpen }: { state: DocketState; domains: string[]; onOpen: Links["onOpen"] }) {
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
