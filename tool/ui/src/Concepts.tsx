import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import MyLocationRoundedIcon from "@mui/icons-material/MyLocationRounded";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import Box from "@mui/material/Box";
import { DetailsCard, DetailsEyebrow, DetailsPopover } from "./design/DetailsPopover";
import { Facets, facets } from "./Fields";
import { Excerpt, MoreAboutFold, follow } from "./design/markdown/Markdown";
import { CapabilityStability } from "./design/catalog/CapabilityLabel";
import {
  byFeature,
  capabilityTarget,
  conceptLinked,
  fieldsText,
  find,
  bareId,
  domainName,
  targetOf,
  pageHref,
  type Concept,
  type DocketState,
  type Pick,
  type Target,
} from "./state";
import { Tip } from "./design/Tip";

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/* "Billing · " before a concept's details: its domain, when several are showing. */
const fromProject = (state: DocketState, c: Concept) =>
  state.domains.length > 1 ? `${domainName(state, c.domain)} · ` : "";

/*
 * The top of a side panel: a list's kind and name, or, showing one of them, a
 * way back named for where it goes; and a way to close it.
 */
export function PanelHeader({
  icon,
  title,
  back,
  onBack,
  onClose,
  extra,
}: {
  icon: ReactNode;
  title: string;
  /* Where back goes, or null when there's nowhere to go back to. */
  back: string | null;
  onBack: () => void;
  onClose: () => void;
  /* Beside close: a way to the detail page of what's showing. */
  extra?: ReactNode;
}) {
  return (
    <header className="concepts-header">
      {back ? (
        <Tip title={`Back to ${back}`}>
          <button type="button" className="panel-back" onClick={onBack}>
            <ArrowBackRoundedIcon sx={{ fontSize: 17, flex: "none" }} />
            <span>{back}</span>
          </button>
        </Tip>
      ) : (
        <>
          {icon}
          <span className="concepts-title">{title}</span>
        </>
      )}
      {extra}
      <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
        <CloseRoundedIcon sx={{ fontSize: 18 }} />
      </button>
    </header>
  );
}

/*
 * A way from a side panel to a doc's detail page, in a tab of its own, so the
 * map stays where it was in this one.
 */
export function PageLink({ pick, children = "Details" }: { pick: Pick; children?: ReactNode }) {
  return (
    <Tip title="Open everything about it in a new tab">
      <a className="filter-toggle page-link" href={pageHref(pick)} target="_blank" rel="noopener">
        <OpenInNewRoundedIcon sx={{ fontSize: 14 }} />
        {children}
      </a>
    </Tip>
  );
}

export function ConceptIcon({ size = 16 }: { size?: number }) {
  return <MenuBookOutlinedIcon sx={{ fontSize: size, flex: "none", color: "var(--concept)" }} />;
}

/*
 * Concepts as a row of small chips, each opening the concept in the panel.
 * With `popovers`, hovering one shows what it means first; inside a popover
 * of its own, it doesn't.
 */
export function ConceptChips({
  concepts,
  onOpen,
  popovers = true,
  scopeOf,
}: {
  concepts: Concept[];
  onOpen: (id: string) => void;
  popovers?: boolean;
  /* Where a concept is from, such as its domain, said beside those whose names repeat here. */
  scopeOf?: (concept: Concept) => string;
}) {
  const repeated = new Set(concepts.map((c) => c.name).filter((name, i, all) => all.indexOf(name) !== i));
  return (
    <span className="concept-chips">
      {concepts.map((c) => {
        const chip = (
          <button
            key={c.id}
            type="button"
            className="concept-chip"
            data-concept={c.id}
            data-no-pan
            onClick={(e) => {
              e.stopPropagation();
              onOpen(c.id);
            }}
          >
            {c.name}
            {scopeOf && repeated.has(c.name) ? <span className="concept-chip-scope">{scopeOf(c)}</span> : null}
          </button>
        );
        return popovers ? (
          <DetailsPopover key={c.id} hoverOnly title={<ConceptSummary concept={c} />}>
            {chip}
          </DetailsPopover>
        ) : (
          chip
        );
      })}
    </span>
  );
}

function ConceptSummary({ concept }: { concept: Concept }) {
  return (
    <DetailsCard card>
      <DetailsEyebrow>Concept</DetailsEyebrow>
      <Box sx={{ mt: 0.5, fontSize: "1.12em", fontWeight: 700, lineHeight: 1.3 }}>{concept.name}</Box>
      {concept.summary ? <Box sx={{ mt: 0.75 }}>{concept.summary}</Box> : null}
      <Box sx={{ mt: 1, fontSize: 12, color: "text.secondary" }}>Click to see everything it's related to.</Box>
    </DetailsCard>
  );
}

/*
 * Concepts it's not to be confused with, then those its Markdown links to,
 * then those that share a rule with it, since a rule that refers to two
 * concepts says how they bear on each other.
 */
export function related(state: DocketState, concept: Concept): Concept[] {
  const ids = new Set<string>();
  for (const f of concept.from)
    for (const c of f.confusedWith ?? []) {
      const to = c.concept ? conceptLinked(state, c.concept, f.domain) : undefined;
      if (to) ids.add(to.id);
    }
  for (const f of concept.from)
    for (const [, href] of `${f.body} ${fieldsText(f)}`.matchAll(/\]\(([^)\s]+)\)/g)) {
      const to = follow(state, f, href);
      if (to && "concept" in to) ids.add(to.concept);
    }
  for (const ruleId of concept.rules) for (const id of find(state.rules, ruleId)?.concepts ?? []) ids.add(id);
  ids.delete(concept.id);
  return [...ids].flatMap((id) => find(state.concepts, id) ?? []);
}

/*
 * The domain's concepts, in a panel beside the canvas: every concept, found
 * by typing, and one concept at a time with what it means and everything
 * related to it: the capabilities that use it, by feature, the rules that
 * refer to it, and other concepts. Choosing a capability or rule shows it on
 * the canvas.
 */
export function ConceptsPanel({
  state,
  selected,
  onSelect,
  onClose,
  onShow,
  filter,
  onFilter,
  onOpen,
  backLabel = null,
}: {
  state: DocketState;
  /* The concept showing, or null for the list. */
  selected: string | null;
  onSelect: (id: string | null) => void;
  onClose: () => void;
  onShow: (target: Target) => void;
  /* The concepts the map is filtered by, and adding or taking one away. */
  filter: string[];
  onFilter: (id: string) => void;
  /* Open a feature or capability in the side panel. */
  onOpen: (kind: "feature" | "capability", id: string) => void;
  /* Where back goes, named, or null for the list of concepts. */
  backLabel?: string | null;
}) {
  const concept = selected ? find(state.concepts, selected) : undefined;
  const body = useRef<HTMLDivElement>(null);
  /* Braces, so it returns nothing: newer browsers' scrollTo returns a promise, which React would take for a cleanup. */
  useEffect(() => {
    body.current?.scrollTo({ top: 0 });
  }, [selected]);

  return (
    <aside className="panel concepts" data-no-pan aria-label="Concepts">
      <PanelHeader
        icon={<ConceptIcon size={18} />}
        title="Concepts"
        back={concept ? (backLabel ?? "All concepts") : null}
        onBack={() => onSelect(null)}
        onClose={onClose}
        extra={concept ? <PageLink pick={{ kind: "concept", id: concept.id }} /> : null}
      />
      <div className="concepts-body" ref={body}>
        {concept ? (
          <ConceptView
            state={state}
            concept={concept}
            onSelect={onSelect}
            onShow={onShow}
            onOpen={onOpen}
            filtering={filter.includes(concept.id)}
            onFilter={() => onFilter(concept.id)}
          />
        ) : (
          <ConceptList state={state} onSelect={onSelect} />
        )}
      </div>
    </aside>
  );
}

function ConceptList({ state, onSelect }: { state: DocketState; onSelect: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const sorted = useMemo(() => [...state.concepts].sort((a, b) => a.name.localeCompare(b.name)), [state]);
  const shown = sorted.filter((c) => {
    const text = `${c.name} ${c.summary ?? ""} ${c.id} ${fieldsText(c)} ${c.body}`.toLowerCase();
    return terms.every((t) => text.includes(t));
  });

  if (!state.concepts.length) return <p className="concepts-empty">No concepts are written down yet.</p>;
  return (
    <>
      <label className="concepts-filter">
        <SearchRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
        <input
          type="search"
          value={query}
          placeholder={`Filter ${plural(state.concepts.length, "concept", "concepts")}…`}
          aria-label="Filter concepts"
          autoFocus
          spellCheck={false}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && shown[0]) onSelect(shown[0].id);
          }}
        />
      </label>
      {shown.length ? (
        <ul className="concept-list">
          {shown.map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => onSelect(c.id)}>
                <span className="concept-name">{c.name}</span>
                {c.summary ? <span className="concept-summary">{c.summary}</span> : null}
                <span className="concept-meta">
                  {fromProject(state, c)}
                  {plural(c.capabilities.length, "capability", "capabilities")} ·{" "}
                  {plural(c.rules.length, "rule", "rules")}
                </span>
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

/* One concept, with ways to find it on the map. */
function ConceptView({
  state,
  concept,
  onSelect,
  onShow,
  onOpen,
  filtering,
  onFilter,
}: {
  state: DocketState;
  concept: Concept;
  onSelect: (id: string) => void;
  onShow: (target: Target) => void;
  onOpen: (kind: "feature" | "capability", id: string) => void;
  filtering: boolean;
  onFilter: () => void;
}) {
  const groups = byFeature(state, concept.capabilities);
  const rules = concept.rules.flatMap((id) => find(state.rules, id) ?? []);
  const others = related(state, concept);
  const elsewhere = state.concepts.filter((c) => c.id !== concept.id && bareId(c.id) === bareId(concept.id));

  return (
    <article className="concept">
      <div className="explore-kind">
        <ConceptIcon size={18} />
        Concept
        {state.domains.length > 1 ? <span className="faint">in {domainName(state, concept.domain)}</span> : null}
      </div>
      <h2>{concept.name}</h2>
      {concept.summary ? <p className="concept-lede">{concept.summary}</p> : null}
      {/* The same word in other domains: a definition of its own there, not a mistake in either. */}
      {elsewhere.length ? (
        <div className="concept-elsewhere">
          {elsewhere.map((c) => (
            <button key={c.id} type="button" className="concept-elsewhere-row" onClick={() => onSelect(c.id)}>
              <span className="concept-elsewhere-scope">In {domainName(state, c.domain)}</span>
              {c.summary ?? c.name}
            </button>
          ))}
        </div>
      ) : null}
      {concept.capabilities.length || filtering ? (
        <div className="explore-actions">
          <button type="button" className="filter-toggle" onClick={() => onShow(targetOf(state, { kind: "concept", id: concept.id }))}>
            <MyLocationRoundedIcon sx={{ fontSize: 15 }} />
            Show on map
          </button>
          <button type="button" className="filter-toggle" aria-pressed={filtering} onClick={onFilter}>
            <FilterListRoundedIcon sx={{ fontSize: 15 }} />
            {filtering ? "Filtering to this" : "Filter to this"}
            {filtering ? <CloseRoundedIcon sx={{ fontSize: 14, ml: 0.25 }} /> : null}
          </button>
        </div>
      ) : null}
      {concept.from.map((f, i) => (
        <div key={i} className="concept-says">
          <Facets items={facets("concept", f, { state, onConcept: onSelect, onShow })} stacked />
          <MoreAboutFold from={f} go={{ state, onConcept: onSelect, onShow }} />
        </div>
      ))}
      <p className="concept-file">
        <code>{concept.file}</code>
      </p>

      <section>
        <h3>Used by {plural(concept.capabilities.length, "capability", "capabilities")}</h3>
        {groups.length ? (
          groups.map(({ feature, capabilities }) => (
            <div key={feature?.id ?? ""} className="concept-group">
              <div className="concept-group-name">
                <WidgetsOutlinedIcon sx={{ fontSize: 14, color: "secondary.main" }} />
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
                    <button type="button" className="concept-row" onClick={() => onOpen("capability", c.id)}>
                      <BoltOutlinedIcon sx={{ fontSize: 15, color: "primary.main" }} />
                      <span className="concept-row-name">{c.name}</span>
                      <CapabilityStability level={c.stability} name={c.name} focusable={false} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p className="concepts-empty">No capability says it uses this yet.</p>
        )}
      </section>

      <section>
        <h3>Referred to by {plural(rules.length, "rule", "rules")}</h3>
        {rules.length ? (
          <ul>
            {rules.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  className="concept-row"
                  disabled={!r.capabilities.length}
                  onClick={() => onShow(capabilityTarget(state, r.capabilities[0]))}
                >
                  <RuleRoundedIcon sx={{ fontSize: 15, color: "text.secondary", alignSelf: "flex-start", mt: "2px" }} />
                  <span className="concept-row-text">
                    <span className="concept-row-name">{r.name}</span>
                    <Excerpt text={r.why} className="concept-row-summary" />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="concepts-empty">No rule refers to it yet.</p>
        )}
      </section>

      {others.length ? (
        <section>
          <h3>Related concepts</h3>
          <ConceptChips concepts={others} onOpen={onSelect} />
        </section>
      ) : null}
    </article>
  );
}
