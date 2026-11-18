import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import Box from "@mui/material/Box";
import { STABILITY, levelColor } from "./design/stability/stability";
import { StabilityTrack } from "./design/stability/StabilityTrack";
import { ConceptIcon } from "./Concepts";
import { DomainIcon } from "./FeatureMap";
import { ProjectIcon } from "./ProjectFilter";
import {
  docDomains,
  domainName,
  capabilityTarget,
  find,
  levelId,
  bareId,
  docProjects,
  projectName,
  ruleAppliesTo,
  type DocketState,
  type Level,
  type Project,
  type Rule,
  type Pick,
  type Target,
} from "./state";

/*
 * What choosing a result does: opens a domain, feature, capability or
 * concept in the side panel, which brings it into view on the map; shows the
 * capabilities that follow a rule on the map; or shows only that project.
 */
export type Selection = { pick: Pick } | Target | { project: string };

type Kind = "project" | "domain" | "feature" | "capability" | "rule" | "concept";

type Entry = {
  key: string;
  kind: Kind;
  title: string;
  /* What else it's found by: its summary and ID. */
  text: string;
  /* A line under it, for context: what it's in, or applies to. */
  context: string;
  level?: Level;
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
 * Everything there is to find, with where each is on the canvas. Projects
 * are found whether they're showing or not, from `all`. With several projects
 * showing, everything else says which projects define it, and is found by
 * their names too.
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
  /* Where a rule is on the map: every capability that follows it. */
  const where = (capabilityIds: string[]) => {
    const targets = capabilityIds.map((id) => capabilityTarget(state, id));
    return { items: [...new Set(targets.flatMap((t) => t.items))], row: targets.map((t) => t.row).join(",") };
  };
  return [
    ...state.domains.map((d) => ({
      key: `domain:${d.id}`,
      kind: "domain" as const,
      title: d.name,
      text: `${d.summary ?? ""} ${d.id}`,
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
        text: `${f.summary ?? ""} ${f.id} ${spans}`,
        context: `${spans} · ${plural(f.capabilities.length, "capability", "capabilities")}`,
        target: { pick: { kind: "feature" as const, id: f.id } },
        projects: docProjects(f),
      };
    }),
    ...state.capabilities.map((c) => ({
      key: `capability:${c.id}`,
      kind: "capability" as const,
      title: c.name,
      text: `${c.summary ?? ""} ${c.id} ${domains(docDomains(c))}`,
      context: `${(c.feature && find(state.features, c.feature)?.name) || "Not in a feature"} · ${domains(docDomains(c))}`,
      level: c.stability,
      target: { pick: { kind: "capability" as const, id: c.id } },
      projects: docProjects(c),
    })),
    ...state.rules.flatMap((r) =>
      r.capabilities.length
        ? [
            {
              key: `rule:${r.id}`,
              kind: "rule" as const,
              title: r.name,
              text: `${r.summary ?? ""} ${bareId(r.id)}`,
              context: appliesTo(state, r),
              target: where(r.capabilities),
              projects: docProjects(r),
            },
          ]
        : [],
    ),
    /* Found by what they mean, too, so "guest" finds Booking. */
    ...state.concepts.map((c) => ({
      key: `concept:${c.id}`,
      kind: "concept" as const,
      title: c.name,
      text: `${c.summary ?? ""} ${bareId(c.id)} ${c.body} ${domainName(state, c.domain)}`,
      context: `${state.domains.length > 1 ? `${domainName(state, c.domain)} · ` : ""}${c.summary ?? plural(c.capabilities.length, "capability", "capabilities")}`,
      target: { pick: { kind: "concept" as const, id: c.id } },
      projects: docProjects(c),
    })),
  ];
}

/*
 * How well an entry matches every term, or null if one is missing. A title
 * that starts with a term beats one with a word that does, which beats the
 * term anywhere in the title, which beats it only in the summary or ID.
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

/*
 * Search across projects, domains, features, capabilities, rules, and concepts. `/` or Ctrl/⌘ + K jumps
 * to it from anywhere; the arrow keys move through the results, Enter shows
 * one on the canvas, and Esc clears it.
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
  const input = useRef<HTMLInputElement>(null);
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
      const typing = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        input.current?.focus();
        input.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const choose = (entry: Entry) => {
    onSelect(entry.target);
    setOpen(false);
    input.current?.blur();
  };

  const showing = open && terms.length > 0;

  return (
    <div className="panel search" data-no-pan>
      <label className="search-field">
        <SearchRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
        <input
          ref={input}
          type="search"
          value={query}
          placeholder={all.length > 1 ? "Search projects, features, capabilities…" : "Search domains, features, capabilities, rules…"}
          aria-label="Search projects, domains, features, capabilities, rules, and concepts"
          aria-expanded={showing}
          aria-controls="search-results"
          aria-activedescendant={showing && flat[active] ? `result-${flat[active].key}` : undefined}
          role="combobox"
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
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
            } else if (e.key === "Escape") {
              if (query) setQuery("");
              else input.current?.blur();
            }
          }}
        />
        {query ? null : <kbd>/</kbd>}
      </label>

      {showing ? (
        <div className="search-results" id="search-results" role="listbox">
          {groups.length ? (
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
                      onMouseEnter={() => setActive(i)}
                      onClick={() => choose(entry)}
                    >
                      <KindIcon kind={entry.kind} />
                      <span className="search-text">
                        <span className="search-title">{highlight(entry.title, terms)}</span>
                        <span className="search-context">
                          {entry.from ? `${entry.from} · ${entry.context}` : entry.context}
                        </span>
                      </span>
                      {entry.level ? <LevelMark level={entry.level} /> : null}
                    </div>
                  );
                })}
              </div>
            ))
          ) : (
            <div className="search-empty">Nothing matches “{query.trim()}”.</div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function KindIcon({ kind }: { kind: Kind }) {
  const sx = { fontSize: 16, flex: "none" };
  if (kind === "project") return <ProjectIcon size={16} />;
  if (kind === "domain") return <DomainIcon size={16} />;
  if (kind === "feature") return <WidgetsOutlinedIcon sx={{ ...sx, color: "secondary.main" }} />;
  if (kind === "capability") return <BoltOutlinedIcon sx={{ ...sx, color: "primary.main" }} />;
  if (kind === "concept") return <ConceptIcon />;
  return <RuleRoundedIcon sx={{ ...sx, color: "text.secondary" }} />;
}

/* A capability's level in a result, as its mark looks, without a popover of its own. */
function LevelMark({ level }: { level: Level }) {
  const id = levelId(level);
  return (
    <Box
      component="span"
      sx={[
        { display: "inline-flex", alignItems: "center", gap: 0.75, fontSize: 12, fontWeight: 500, flex: "none" },
        levelColor(id),
      ]}
    >
      <StabilityTrack level={id} />
      {STABILITY[id].name}
    </Box>
  );
}
