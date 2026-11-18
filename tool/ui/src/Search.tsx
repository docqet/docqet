import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import Box from "@mui/material/Box";
import { STABILITY, levelColor } from "./design/stability/stability";
import { StabilityTrack } from "./design/stability/StabilityTrack";
import { find, levelId, ruleAppliesTo, type DocketState, type Level, type Rule } from "./state";

/* Where a result is on the canvas: its card, and the row in it, if any. */
export type Target = { item: string; row?: string };

type Kind = "feature" | "capability" | "rule";

type Entry = {
  key: string;
  kind: Kind;
  title: string;
  /* What else it's found by: its summary and ID. */
  text: string;
  /* A line under it, for context: what it's in, or applies to. */
  context: string;
  level?: Level;
  target: Target;
};

const GROUPS: { kind: Kind; label: string }[] = [
  { kind: "feature", label: "Features" },
  { kind: "capability", label: "Capabilities" },
  { kind: "rule", label: "Rules" },
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

/* Everything there is to find, with where each is on the canvas. */
function index(state: DocketState): Entry[] {
  const featureName = (id: string | null) => (id ? find(state.features, id)?.name : undefined);
  const where = (capabilityId: string): Target => {
    const c = find(state.capabilities, capabilityId);
    return c?.feature
      ? { item: `feature:${c.feature}`, row: `[data-capability="${capabilityId}"]` }
      : { item: `capability:${capabilityId}` };
  };
  return [
    ...state.features.map((f) => ({
      key: `feature:${f.id}`,
      kind: "feature" as const,
      title: f.name,
      text: `${f.summary ?? ""} ${f.id}`,
      context: plural(f.capabilities.length, "capability", "capabilities"),
      target: { item: `feature:${f.id}` },
    })),
    ...state.capabilities.map((c) => ({
      key: `capability:${c.id}`,
      kind: "capability" as const,
      title: c.name,
      text: `${c.summary ?? ""} ${c.id}`,
      context: featureName(c.feature) ?? "Not in a feature",
      level: c.stability,
      target: where(c.id),
    })),
    ...state.rules.flatMap((r) =>
      r.capabilities.length
        ? [
            {
              key: `rule:${r.id}`,
              kind: "rule" as const,
              title: r.name,
              text: `${r.summary ?? ""} ${r.id}`,
              context: appliesTo(state, r),
              target: where(r.capabilities[0]),
            },
          ]
        : [],
    ),
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
 * Search across features, capabilities, and rules. `/` or Ctrl/⌘ + K jumps
 * to it from anywhere; the arrow keys move through the results, Enter shows
 * one on the canvas, and Esc clears it.
 */
export default function Search({ state, onSelect }: { state: DocketState; onSelect: (target: Target) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const entries = useMemo(() => index(state), [state]);

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
          placeholder="Search features, capabilities, rules…"
          aria-label="Search features, capabilities, and rules"
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
                        <span className="search-context">{entry.context}</span>
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
  if (kind === "feature") return <WidgetsOutlinedIcon sx={{ ...sx, color: "secondary.main" }} />;
  if (kind === "capability") return <BoltOutlinedIcon sx={{ ...sx, color: "primary.main" }} />;
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
