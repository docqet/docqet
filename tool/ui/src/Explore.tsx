import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import MyLocationRoundedIcon from "@mui/icons-material/MyLocationRounded";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import Box from "@mui/material/Box";
import { DetailsEyebrow } from "./design/DetailsPopover";
import { MATURITY_BANDS, maturityBand } from "./design/maturity/maturity";
import { RingGlyph } from "./design/maturity/RingGlyph";
import { STABILITY, levelColor } from "./design/stability/stability";
import { StabilityMark } from "./design/stability/StabilityMark";
import { ConceptChips, Markdown } from "./Concepts";
import { DomainIcon } from "./FeatureMap";
import {
  capabilityTarget,
  contradictionsOf,
  docDomains,
  docProjects,
  domainGroup,
  domainName,
  featureConcepts,
  featureTarget,
  find,
  levelId,
  projectName,
  partOf,
  type Capability,
  type Contribution,
  type Domain,
  type Doc,
  type DocketState,
  type Feature,
  type Pick,
  type Target,
} from "./state";

/* What the panel can show: the product's parts, each as a list or one of them. */
export type ExploreKind = "domain" | "feature" | "capability";

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

const NAMES: Record<ExploreKind, { one: string; many: string; icon: ReactNode }> = {
  domain: { one: "Domain", many: "Domains", icon: <DomainIcon size={18} /> },
  feature: { one: "Feature", many: "Features", icon: <WidgetsOutlinedIcon sx={{ fontSize: 18, color: "secondary.main" }} /> },
  capability: { one: "Capability", many: "Capabilities", icon: <BoltOutlinedIcon sx={{ fontSize: 18, color: "primary.main" }} /> },
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
  const one = domain ?? feature ?? capability;
  const links = { state, onOpen, onConcept, onShow, isFiltering, onFilter };

  return (
    <aside className="panel concepts" data-no-pan aria-label={names.many}>
      <header className="concepts-header">
        {one ? (
          <button type="button" className="icon-button" onClick={onBack} aria-label={backLabel ?? `All ${names.many.toLowerCase()}`}>
            <ArrowBackRoundedIcon sx={{ fontSize: 18 }} />
          </button>
        ) : (
          names.icon
        )}
        <span className="concepts-title">{one ? (backLabel ?? `All ${names.many.toLowerCase()}`) : names.many}</span>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
          <CloseRoundedIcon sx={{ fontSize: 18 }} />
        </button>
      </header>
      <div className="concepts-body" ref={body}>
        {domain ? (
          <DomainView domain={domain} {...links} />
        ) : feature ? (
          <FeatureView feature={feature} {...links} />
        ) : capability ? (
          <CapabilityView capability={capability} {...links} />
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
    const docs: { doc: Doc; meta: string; mark: ReactNode }[] =
      kind === "domain"
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
              mark: <StabilityMark level={levelId(c.stability)} feature={c.name} focusable={false} size="short" />,
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
          {shown.map(({ doc, meta, mark }) => (
            <li key={doc.id}>
              <button type="button" onClick={() => onOpen(doc.id)}>
                <span className="explore-name">
                  <span className="concept-name">{doc.name}</span>
                  {mark}
                </span>
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
 * The top of any one doc: its kind and the projects that define it, its name,
 * what it's part of, its summary (each project's, where they differ), any
 * contradictions, a way to find it on the map, and each project's body.
 */
function Head({
  state,
  kind,
  doc,
  trail,
  extra,
  target,
  onShow,
  onConcept,
  isFiltering,
  onFilter,
}: {
  state: DocketState;
  kind: ExploreKind;
  doc: Doc;
  /* What it's part of, outermost first. */
  trail?: ReactNode;
  /* Under its name: its maturity or levels. */
  extra?: ReactNode;
  target: Target;
  onShow: (target: Target) => void;
  onConcept: (id: string) => void;
  isFiltering: Links["isFiltering"];
  onFilter: Links["onFilter"];
}) {
  const pick: Pick = { kind, id: doc.id };
  const filtering = isFiltering(pick);
  const projects = docProjects(doc);
  const several = state.projects.length > 1;
  const who = (f: Contribution) =>
    kind === "domain" ? projectName(state, f.project) : `${domainName(state, f.domain)}${several ? ` · ${projectName(state, f.project)}` : ""}`;
  const summaries = new Set(doc.from.map((f) => f.summary ?? ""));
  const problems = contradictionsOf(state, kind, doc.id);
  const bodies = doc.from.filter((f) => f.body.trim());
  return (
    <>
      <DetailsEyebrow>
        {NAMES[kind].one}
        {several ? ` · ${projects.map((id) => projectName(state, id)).join(" + ")}` : ""}
      </DetailsEyebrow>
      {trail ? <div className="explore-trail">{trail}</div> : null}
      <h2>{doc.name}</h2>
      {extra}
      {summaries.size > 1 ? (
        <div className="explore-said">
          {doc.from.map((f, i) => (
            <p key={i}>
              <span className="concept-elsewhere-scope">{who(f)}</span>
              {f.summary}
            </p>
          ))}
        </div>
      ) : doc.summary ? (
        <p className="concept-lede">{doc.summary}</p>
      ) : null}
      {problems.map((p) => (
        <p key={p.message} className="explore-problem">
          <WarningAmberRoundedIcon sx={{ fontSize: 16, flex: "none", mt: "2px" }} />
          {p.message}
        </p>
      ))}
      <div className="explore-actions">
        <button type="button" className="filter-toggle" onClick={() => onShow(target)}>
          <MyLocationRoundedIcon sx={{ fontSize: 15 }} />
          Show on the map
        </button>
        <button type="button" className="filter-toggle" aria-pressed={filtering} onClick={() => onFilter(pick)}>
          <FilterListRoundedIcon sx={{ fontSize: 15 }} />
          {filtering ? "Filtering the map to this" : "Filter the map to this"}
          {filtering ? <CloseRoundedIcon sx={{ fontSize: 14, ml: 0.25 }} /> : null}
        </button>
      </div>
      {bodies.map((f, i) => (
        <div key={i}>
          {bodies.length > 1 || doc.from.length > 1 ? (
            <div className="explore-body-scope">From {who(f)}</div>
          ) : null}
          <Markdown state={state} concept={f} text={f.body} onConcept={onConcept} onShow={onShow} />
        </div>
      ))}
    </>
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
        <h3>Its part of {plural(features.length, "feature", "features")}</h3>
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
          <h3>Capabilities in no feature</h3>
          <CapabilityRows capabilities={loose} domain={domain.id} onOpen={onOpen} />
        </section>
      ) : null}
      {concepts.length ? (
        <section>
          <h3>What its words mean</h3>
          <ConceptChips concepts={concepts} onOpen={onConcept} />
        </section>
      ) : null}
      {rules.length ? (
        <section>
          <h3>Its {plural(rules.length, "rule", "rules")}</h3>
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
              <StabilityMark level={levelId(level)} feature={c.name} focusable={false} size="short" />
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
            <h3 className="explore-part">
              {feature.parts.length > 1 ? (
                <>
                  <span>In {domainName(state, part.domain)}</span>
                  {part.maturity !== null ? <RingGlyph progress={part.maturity} size={18} /> : null}
                </>
              ) : (
                plural(part.capabilities.length, "capability", "capabilities")
              )}
            </h3>
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
      {concepts.length ? (
        <section>
          <h3>Concepts its capabilities use</h3>
          <ConceptChips concepts={concepts} onOpen={onConcept} />
        </section>
      ) : null}
      {rules.length ? (
        <section>
          <h3>Rules its capabilities follow</h3>
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
  const several = capability.levels.length > 1;
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
        extra={
          <ul className="explore-levels">
            {capability.levels.map((l) => (
              <Box component="li" key={`${l.domain}:${l.project}`} sx={levelColor(levelId(l.level))}>
                <StabilityMark level={levelId(l.level)} feature={capability.name} size="short" />
                <strong>{STABILITY[levelId(l.level)].name}</strong>
                {several ? (
                  <span className="faint">
                    in {domainName(state, l.domain)}
                    {state.projects.length > 1 ? `, says ${projectName(state, l.project)}` : ""}
                  </span>
                ) : null}
              </Box>
            ))}
          </ul>
        }
        target={capabilityTarget(state, capability.id)}
        onShow={onShow}
        onConcept={onConcept}
        isFiltering={isFiltering}
        onFilter={onFilter}
      />
      <section>
        <h3>Follows {plural(rules.length, "rule", "rules")}</h3>
        {rules.length ? <RuleList state={state} rules={rules} /> : <p className="concepts-empty">None written down yet.</p>}
      </section>
      {concepts.length ? (
        <section>
          <h3>Uses {plural(concepts.length, "concept", "concepts")}</h3>
          <ConceptChips concepts={concepts} onOpen={onConcept} />
        </section>
      ) : null}
      {gaps.length ? (
        <section>
          <h3>Known {gaps.length === 1 ? "gap" : "gaps"}</h3>
          <ul>
            {gaps.map((g) => (
              <li key={g.id} className="explore-text">
                <span className="explore-gap-kind">
                  {g.kind === "accepted-tradeoff" ? "Accepted tradeoff" : "To close later"}
                </span>
                {g.text}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {capability.code.length ? (
        <section>
          <h3>Code</h3>
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
              {r.kind === "core" ? "Core" : "Edge case"} · {r.status}
              {state.domains.length > 1 ? ` · ${domainName(state, r.domain)}` : ""}
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
