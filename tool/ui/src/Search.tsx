import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { STABILITY, levelColor } from "./design/stability/stability";
import { StabilityTrack } from "./design/stability/StabilityTrack";
import { ConceptIcon } from "./Concepts";
import { PersonaIcon } from "./Personas";
import { DomainIcon } from "./FeatureMap";
import { ProjectIcon } from "./PlatformFilter";
import {
  docDomains,
  fieldsText,
  domainName,
  find,
  bareId,
  docProjects,
  projectName,
  ruleAppliesTo,
  type DocketState,
  type Level,
  type Project,
  type Rule,
  type Pick,
} from "./state";

/*
 * What choosing a result does: opens a domain, feature, capability, concept,
 * persona or rule on its page, or shows only that project.
 */
export type Selection = { pick: Pick } | { rule: string } | { project: string };

type Kind = "project" | "domain" | "feature" | "capability" | "rule" | "concept" | "persona";

type Entry = {
  key: string;
  kind: Kind;
  title: string;
  /* What else it's found by: its description and ID. */
  text: string;
  /* A line under it, for context: what it's in, or applies to. */
  context: string;
  /* A capability's level, or null for a draft. */
  level?: Level | null;
  target: Selection;
  /* The projects that define it, named, when several are showing. */
  from?: string;
};

const GROUPS: { kind: Kind; label: string }[] = [
  { kind: "project", label: "Projects" },
  { kind: "domain", label: "Domains" },
  { kind: "feature", label: "Features" },
  { kind: "capability", label: "Capabilities" },
  { kind: "rule", label: "Rules" },
  { kind: "concept", label: "Concepts" },
  { kind: "persona", label: "Personas" },
];

/* How many results each group shows at most. */
const PER_GROUP = 6;

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/*
 * Where a rule applies, grouped by feature, since one rule can apply to
 * capabilities in several: "Reservations: Room booking, Group bookings ·
 * Front desk: Check-in". Capabilities in no feature are named on their own.
 */
function appliesTo(state: DocketState, rule: Rule): string {
  const groups = new Map<string | null, string[]>();
  for (const { capability, feature } of ruleAppliesTo(state, rule)) {
    const key = feature?.name ?? null;
    groups.set(key, [...(groups.get(key) ?? []), capability.name]);
  }
  return [...groups].map(([feature, names]) => (feature ? `${feature}: ${names.join(", ")}` : names.join(", "))).join(" · ");
}

/*
 * Everything there is to find, with where each is on the canvas. The
 * platform's projects are found whether they're showing or not, from `all`.
 * With several projects showing, everything else says which projects define
 * it, and is found by their names too.
 */
function index(state: DocketState, all: Project[]): Entry[] {
  const several = state.projects.length > 1;
  const from = (...ids: string[]) => (several ? ids.map((id) => projectName(state, id)).join(", ") : undefined);
  const projects: Entry[] =
    all.length > 1
      ? all.map((p) => ({
          key: `project:${p.id}`,
          kind: "project" as const,
          title: p.name,
          text: p.id,
          context: state.projects.some((x) => x.id === p.id)
            ? state.projects.length === 1
              ? "Showing"
              : "Showing · choose to show only this"
            : "Not showing · choose to show only this",
          target: { project: p.id },
        }))
      : [];
  return [...projects, ...entries(state).map((e) => (several ? { ...e, from: from(...e.projects), text: `${e.text} ${from(...e.projects)}` } : e))];
}

function entries(state: DocketState): (Entry & { projects: string[] })[] {
  /* "Guest stays + Billing": the domains something is written in. Found by them too. */
  const domains = (ids: string[]) => ids.map((id) => domainName(state, id)).join(" + ");
  return [
    ...state.domains.map((d) => ({
      key: `domain:${d.id}`,
      kind: "domain" as const,
      title: d.name,
      text: `${d.description ?? ""} ${d.id}`,
      context: plural(d.features.length, "feature", "features"),
      target: { pick: { kind: "domain" as const, id: d.id } },
      projects: docProjects(d),
    })),
    ...state.features.map((f) => {
      const spans = domains(f.parts.map((p) => p.domain));
      return {
        key: `feature:${f.id}`,
        kind: "feature" as const,
        title: f.name,
        text: `${f.description ?? ""} ${f.id} ${spans}`,
        context: `${spans} · ${plural(f.capabilities.length, "capability", "capabilities")}`,
        target: { pick: { kind: "feature" as const, id: f.id } },
        projects: docProjects(f),
      };
    }),
    ...state.capabilities.map((c) => ({
      key: `capability:${c.id}`,
      kind: "capability" as const,
      title: c.name,
      text: `${c.description ?? ""} ${c.id} ${domains(docDomains(c))}`,
      context: `${(c.feature && find(state.features, c.feature)?.name) || "Not in a feature"} · ${domains(docDomains(c))}`,
      level: c.stability,
      target: { pick: { kind: "capability" as const, id: c.id } },
      projects: docProjects(c),
    })),
    ...state.rules.map((r) => ({
      key: `rule:${r.id}`,
      kind: "rule" as const,
      title: r.name,
      text: `${r.from.map((f) => f.body).join(" ")} ${bareId(r.id)}`,
      context: r.capabilities.length ? appliesTo(state, r) : domainName(state, r.domain),
      target: { rule: r.id },
      projects: docProjects(r),
    })),
    /* Found by what they mean, too, so "guest" finds Booking. */
    ...state.concepts.map((c) => ({
      key: `concept:${c.id}`,
      kind: "concept" as const,
      title: c.name,
      text: `${c.description ?? ""} ${bareId(c.id)} ${c.from.map((f) => `${fieldsText(f)} ${f.body}`).join(" ")} ${domainName(state, c.domain)}`,
      context: `${state.domains.length > 1 ? `${domainName(state, c.domain)} · ` : ""}${c.description ?? plural(c.capabilities.length, "capability", "capabilities")}`,
      target: { pick: { kind: "concept" as const, id: c.id } },
      projects: docProjects(c),
    })),
    /* Found by what they need, too, so "payment" finds the guest. */
    ...state.personas.map((p) => ({
      key: `persona:${p.id}`,
      kind: "persona" as const,
      title: p.name,
      text: `${p.description ?? ""} ${p.id} ${p.from.map((f) => `${fieldsText(f)} ${f.body}`).join(" ")}`,
      context: p.description ?? plural(p.capabilities.length, "capability", "capabilities"),
      target: { pick: { kind: "persona" as const, id: p.id } },
      projects: docProjects(p),
    })),
  ];
}

/*
 * How well an entry matches every term, or null if one is missing. A title
 * that starts with a term beats one with a word that does, which beats the
 * term anywhere in the title, which beats it only in the description or ID.
 */
function score(entry: Entry, terms: string[]): number | null {
  const title = entry.title.toLowerCase();
  const rest = entry.text.toLowerCase();
  let total = 0;
  for (const term of terms) {
    if (title.startsWith(term)) total += 4;
    else if (title.includes(` ${term}`) || title.includes(`-${term}`)) total += 3;
    else if (title.includes(term)) total += 2;
    else if (rest.includes(term)) total += 1;
    else return null;
  }
  return total;
}

/* The title with the first match of each term marked. */
function highlight(title: string, terms: string[]): ReactNode {
  const lower = title.toLowerCase();
  const spans: [number, number][] = [];
  for (const term of terms) {
    const at = lower.indexOf(term);
    if (at >= 0) spans.push([at, at + term.length]);
  }
  spans.sort((a, b) => a[0] - b[0]);
  const parts: ReactNode[] = [];
  let i = 0;
  for (const [start, end] of spans) {
    if (start < i) continue;
    if (start > i) parts.push(title.slice(i, start));
    parts.push(<mark key={start}>{title.slice(start, end)}</mark>);
    i = end;
  }
  parts.push(title.slice(i));
  return parts;
}

/* Ctrl + K, or ⌘ + K on a Mac, as the keys are labelled there. */
const MOD = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘" : "Ctrl";

/*
 * Search across projects, domains, features, capabilities, rules, concepts,
 * and personas. The header only says how to open it; `/` or Ctrl/⌘ + K, or
 * clicking that, opens it in the middle of the page over a blurred canvas.
 * The arrow keys move through the results, Enter shows one on the canvas, and
 * Esc or a click outside closes it. It keeps what was typed for next time.
 */
export default function Search({
  state,
  all,
  onSelect,
}: {
  state: DocketState;
  all: Project[];
  onSelect: (selection: Selection) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const entries = useMemo(() => index(state, all), [state, all]);

  const terms = useMemo(() => query.toLowerCase().split(/\s+/).filter(Boolean), [query]);
  const groups = useMemo(() => {
    if (!terms.length) return [];
    const scored = entries
      .map((entry) => ({ entry, score: score(entry, terms) }))
      .filter((r): r is { entry: Entry; score: number } => r.score !== null)
      .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title));
    return GROUPS.map((g) => ({
      ...g,
      results: scored.filter((r) => r.entry.kind === g.kind).slice(0, PER_GROUP).map((r) => r.entry),
    })).filter((g) => g.results.length);
  }, [entries, terms]);
  const flat = groups.flatMap((g) => g.results);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable);
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /*
   * Opening it puts the cursor in the field, with last time's search selected
   * to type over. The modal mounts its contents a render after it opens, so
   * this happens when the field mounts, not when `open` changes.
   */
  const field = useCallback((el: HTMLInputElement | null) => {
    el?.focus();
    el?.select();
  }, []);

  const choose = (entry: Entry) => {
    onSelect(entry.target);
    setOpen(false);
  };

  const placeholder =
    all.length > 1 ? "Search projects, features, capabilities…" : "Search domains, features, capabilities, rules…";

  return (
    <>
      <button type="button" className="panel search-trigger" data-no-pan onClick={() => setOpen(true)}>
        <SearchRoundedIcon aria-hidden sx={{ fontSize: 18 }} />
        <span className="search-trigger-label">Search</span>
        <span className="search-keys" aria-hidden>
          <kbd>{MOD}</kbd>
          <kbd>K</kbd>
        </span>
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        disableAutoFocus
        disableScrollLock
        slotProps={{ backdrop: { className: "search-backdrop" } }}
      >
        <div className="search" role="dialog" aria-modal aria-label="Search" data-no-pan>
          <label className="search-field">
            <SearchRoundedIcon aria-hidden sx={{ fontSize: 20, color: "text.secondary" }} />
            <input
              ref={field}
              type="search"
              value={query}
              placeholder={placeholder}
              aria-label="Search projects, domains, features, capabilities, rules, concepts, and personas"
              aria-expanded={terms.length > 0}
              aria-controls="search-results"
              aria-activedescendant={flat[active] ? `result-${flat[active].key}` : undefined}
              role="combobox"
              autoComplete="off"
              spellCheck={false}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActive((i) => Math.min(i + 1, flat.length - 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActive((i) => Math.max(i - 1, 0));
                } else if (e.key === "Enter" && flat[active]) {
                  e.preventDefault();
                  choose(flat[active]);
                }
              }}
            />
            <kbd className="search-esc" onClick={() => setOpen(false)}>
              Esc
            </kbd>
          </label>

          <div className="search-results" id="search-results" role="listbox">
            {!terms.length ? (
              <div className="search-empty">
                Find a project, domain, feature, capability, rule, concept, or persona, and open it.
              </div>
            ) : groups.length ? (
              groups.map((g) => (
                <div key={g.kind} role="group" aria-label={g.label}>
                  <div className="search-group">{g.label}</div>
                  {g.results.map((entry) => {
                    const i = flat.indexOf(entry);
                    return (
                      <div
                        key={entry.key}
                        id={`result-${entry.key}`}
                        role="option"
                        aria-selected={i === active}
                        className={`search-result${i === active ? " active" : ""}`}
                        onMouseDown={(e) => e.preventDefault()}
                        onMouseMove={() => setActive(i)}
                        onClick={() => choose(entry)}
                      >
                        <KindIcon kind={entry.kind} />
                        <span className="search-text">
                          <span className="search-title">{highlight(entry.title, terms)}</span>
                          <span className="search-context">
                            {entry.from ? `${entry.from} · ${entry.context}` : entry.context}
                          </span>
                        </span>
                        {entry.level ? <LevelMark level={entry.level} /> : entry.level === null ? <span className="faint">Draft</span> : null}
                      </div>
                    );
                  })}
                </div>
              ))
            ) : (
              <div className="search-empty">Nothing matches “{query.trim()}”.</div>
            )}
          </div>

          <div className="search-footer" aria-hidden>
            <span>
              <kbd>↑</kbd>
              <kbd>↓</kbd> to move
            </span>
            <span>
              <kbd>↵</kbd> to show on the map
            </span>
            <span>
              <kbd>Esc</kbd> to close
            </span>
          </div>
        </div>
      </Modal>
    </>
  );
}

function KindIcon({ kind }: { kind: Kind }) {
  const sx = { fontSize: 16, flex: "none" };
  if (kind === "project") return <ProjectIcon size={16} />;
  if (kind === "domain") return <DomainIcon size={16} />;
  if (kind === "feature") return <WidgetsOutlinedIcon sx={{ ...sx, color: "secondary.main" }} />;
  if (kind === "capability") return <BoltOutlinedIcon sx={{ ...sx, color: "primary.main" }} />;
  if (kind === "concept") return <ConceptIcon />;
  if (kind === "persona") return <PersonaIcon />;
  return <RuleRoundedIcon sx={{ ...sx, color: "text.secondary" }} />;
}

/* A capability's level in a result, as its mark looks, without a popover of its own. */
function LevelMark({ level }: { level: Level }) {
  return (
    <Box
      component="span"
      sx={[
        { display: "inline-flex", alignItems: "center", gap: 0.75, fontSize: 12, fontWeight: 500, flex: "none" },
        levelColor(level),
      ]}
    >
      <StabilityTrack level={level} />
      {STABILITY[level].name}
    </Box>
  );
}
