import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme, type Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import { STABILITY, levelColor } from "../stability/stability";
import { StabilityTrack } from "../stability/StabilityTrack";
import { ConceptIcon } from "../Concepts";
import { PersonaIcon } from "../Personas";
import { InitiativeIcon } from "./ScopeFilter";
import { ConstraintIcon, DomainIcon, ProblemIcon } from "../names";
import { ProjectIcon } from "./ProductFilter";
import { searchProduct, type SearchResultResource } from "../../services/docqet/search";
import {
  docDomains,
  domainName,
  find,
  docProjects,
  projectName,
  respecting,
  ruleAppliesTo,
  type DocqetState,
  type Level,
  type Project,
  type Rule,
  type Pick,
} from "../../state";
import LinearProgress from "@mui/material/LinearProgress";
import { isAbort } from "../../services/docqet/client";
import { ReadError, useDelayed } from "../ReadFallback";

/*
 * What choosing a result does: opens a domain, feature, capability, concept,
 * persona, problem, constraint or rule on its page, or shows only that project.
 */
export type Selection = { pick: Pick | { kind: "problem" | "constraint" | "initiative"; id: string } } | { rule: string } | { project: string };

type Kind = "project" | "domain" | "feature" | "capability" | "rule" | "concept" | "persona" | "problem" | "constraint" | "initiative";

type Entry = {
  key: string;
  kind: Kind;
  title: string;
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
  { kind: "problem", label: "Problems" },
  { kind: "constraint", label: "Constraints" },
  { kind: "initiative", label: "Initiatives" },
];

/* How many results each group shows at most. */
const PER_GROUP = 6;

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/*
 * Where a rule applies, grouped by feature, since one rule can apply to
 * capabilities in several: "Reservations: Room booking, Group bookings ·
 * Front desk: Check-in". Capabilities in no feature are named on their own.
 */
function appliesTo(state: DocqetState, rule: Rule): string {
  const groups = new Map<string | null, string[]>();
  for (const { capability, feature } of ruleAppliesTo(state, rule)) {
    const key = feature?.name ?? null;
    groups.set(key, [...(groups.get(key) ?? []), capability.name]);
  }
  return [...groups].map(([feature, names]) => (feature ? `${feature}: ${names.join(", ")}` : names.join(", "))).join(" · ");
}

/*
 * How each result shows, and what choosing it does, by `<kind>:<id>`. The
 * server finds them; this only says what each is in. The product's projects
 * show when it has several. With several projects showing, everything else
 * says which projects define it.
 */
function index(state: DocqetState, all: Project[]): Entry[] {
  const several = state.projects.length > 1;
  const from = (...ids: string[]) => (several ? ids.map((id) => projectName(state, id)).join(", ") : undefined);
  const projects: Entry[] =
    all.length > 1
      ? all.map((p) => ({
          key: `project:${p.id}`,
          kind: "project" as const,
          title: p.name,
          context: state.projects.some((x) => x.id === p.id)
            ? state.projects.length === 1
              ? "Showing"
              : "Showing · choose to show only this"
            : "Not showing · choose to show only this",
          target: { project: p.id },
        }))
      : [];
  return [...projects, ...entries(state).map((e) => (several ? { ...e, from: from(...e.projects) } : e))];
}

function entries(state: DocqetState): (Entry & { projects: string[] })[] {
  /* "Guest stays + Billing": the domains something is written in. Found by them too. */
  const domains = (ids: string[]) => ids.map((id) => domainName(state, id)).join(" + ");
  return [
    ...state.domains.map((d) => ({
      key: `domain:${d.id}`,
      kind: "domain" as const,
      title: d.name,
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
        context: `${spans} · ${plural(f.capabilities.length, "capability", "capabilities")}`,
        target: { pick: { kind: "feature" as const, id: f.id } },
        projects: docProjects(f),
      };
    }),
    ...state.capabilities.map((c) => ({
      key: `capability:${c.id}`,
      kind: "capability" as const,
      title: c.name,
      context: `${(c.feature && find(state.features, c.feature)?.name) || "Not in a feature"} · ${domains(docDomains(c))}`,
      level: c.stability,
      target: { pick: { kind: "capability" as const, id: c.id } },
      projects: docProjects(c),
    })),
    ...state.rules.map((r) => ({
      key: `rule:${r.id}`,
      kind: "rule" as const,
      title: r.name,
      context: r.capabilities.length ? appliesTo(state, r) : domainName(state, r.domain),
      target: { rule: r.id },
      projects: docProjects(r),
    })),
    ...state.concepts.map((c) => ({
      key: `concept:${c.id}`,
      kind: "concept" as const,
      title: c.name,
      context: `${state.domains.length > 1 ? `${domainName(state, c.domain)} · ` : ""}${c.description ?? plural(c.capabilities.length, "capability", "capabilities")}`,
      target: { pick: { kind: "concept" as const, id: c.id } },
      projects: docProjects(c),
    })),
    ...state.personas.map((p) => ({
      key: `persona:${p.id}`,
      kind: "persona" as const,
      title: p.name,
      context: p.description ?? plural(p.capabilities.length, "capability", "capabilities"),
      target: { pick: { kind: "persona" as const, id: p.id } },
      projects: docProjects(p),
    })),
    ...state.problems.map((p) => ({
      key: `problem:${p.id}`,
      kind: "problem" as const,
      title: p.name,
      context: p.capabilities.length ? plural(p.capabilities.length, "capability solves it", "capabilities solve it") : "Nothing solves it yet",
      target: { pick: { kind: "problem" as const, id: p.id } },
      projects: docProjects(p),
    })),
    ...state.constraints.map((c) => ({
      key: `constraint:${c.id}`,
      kind: "constraint" as const,
      title: c.name,
      context: respecting(c)
        ? (c.source ?? plural(respecting(c), "rule or mechanism respects it", "rules and mechanisms respect it"))
        : "Nothing respects it yet",
      target: { pick: { kind: "constraint" as const, id: c.id } },
      projects: docProjects(c),
    })),
    ...state.initiatives.map((i) => ({
      key: `initiative:${i.id}`,
      kind: "initiative" as const,
      title: i.name,
      context: i.description ?? plural(i.capabilities.length, "capability", "capabilities"),
      target: { pick: { kind: "initiative" as const, id: i.id } },
      projects: docProjects(i),
    })),
  ];
}

/* The title with the first match of each term marked: the search, as one term, since that's what the server matches. */
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
    parts.push(
      <Box component="mark" key={start} sx={{ bgcolor: "transparent", color: "primary.main", fontWeight: 700 }}>
        {title.slice(start, end)}
      </Box>,
    );
    i = end;
  }
  parts.push(title.slice(i));
  return parts;
}

/* Ctrl + K, or ⌘ + K on a Mac, as the keys are labelled there. */
const MOD = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌘" : "Ctrl";

/*
 * Search across projects, domains, features, capabilities, rules, concepts,
 * personas, problems and constraints. The header only says how to open it; `/` or Ctrl/⌘ + K, or
 * clicking that, opens it in the middle of the page over a blurred canvas.
 * The arrow keys move through the results, Enter shows one on the canvas, and
 * Esc or a click outside closes it. It keeps what was typed for next time.
 */
export default function Search({ state, all, onSelect }: { state: DocqetState; all: Project[]; onSelect: (selection: Selection) => void }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const entries = useMemo(() => new Map(index(state, all).map((e) => [e.key, e])), [state, all]);

  /*
   * What the server found, and for what: once typing pauses, so it isn't
   * asked at every key. A new search cancels the one before, and the last
   * results stay, marked as refreshing, until the next arrive. A search that
   * fails says so, with a retry.
   */
  const q = query.trim();
  const [found, setFound] = useState<{ q: string; results: SearchResultResource[]; failed?: boolean } | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!q) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      searchProduct(state.showing, q, controller.signal).then(
        (results) => setFound({ q, results }),
        (e: unknown) => {
          if (!isAbort(e)) setFound({ q, results: [], failed: true });
        },
      );
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [state.showing, q, attempt]);
  const searching = useDelayed(!!q && found?.q !== q);

  const terms = useMemo(() => (q && found ? [found.q.toLowerCase()] : []), [q, found]);
  const groups = useMemo(() => {
    if (!q || !found) return [];
    const results = found.results.flatMap((r) => entries.get(`${r.kind}:${r.id}`) ?? []);
    return GROUPS.map((g) => ({
      ...g,
      results: results.filter((e) => e.kind === g.kind).slice(0, PER_GROUP),
    })).filter((g) => g.results.length);
  }, [entries, q, found]);
  const flat = groups.flatMap((g) => g.results);

  /* New results start at the first. */
  const [activeFor, setActiveFor] = useState(found);
  if (activeFor !== found) {
    setActiveFor(found);
    setActive(0);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing =
        e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target instanceof HTMLElement && e.target.isContentEditable);
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

  const placeholder = all.length > 1 ? "Search projects, features, capabilities…" : "Search domains, features, capabilities, rules…";
  const theme = useTheme();
  const phone = useMediaQuery(theme.breakpoints.down("sm"), { noSsr: true });
  const still = useMediaQuery("(prefers-reduced-motion: reduce)", { noSsr: true });

  return (
    <>
      <Box
        component="button"
        type="button"
        aria-label="Search"
        data-no-pan
        onClick={() => setOpen(true)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          flex: { sm: "0 1 240px" },
          minWidth: 0,
          height: 40,
          width: { xs: 40, sm: "auto" },
          justifyContent: { xs: "center", sm: "flex-start" },
          pl: { xs: 0, sm: 1.5 },
          pr: { xs: 0, sm: 1 },
          font: "inherit",
          fontSize: 13.5,
          fontWeight: 500,
          color: { xs: "text.secondary", sm: "text.disabled" },
          bgcolor: { xs: "transparent", sm: (t: Theme) => `color-mix(in srgb, ${t.vars.palette.text.primary} 3%, transparent)` },
          border: { xs: 0, sm: 1 },
          borderColor: { sm: "divider" },
          borderRadius: { xs: "6px", sm: "8px" },
          cursor: "pointer",
          transition: "border-color 0.15s, color 0.15s",
          "&:hover": { color: { xs: "primary.main", sm: "text.secondary" }, borderColor: "surface.borderStrong", bgcolor: { xs: "surface.accentSoft" } },
          "&:focus-visible": { outline: 2, outlineColor: "primary.main", outlineOffset: 2 },
        }}
      >
        <SearchRoundedIcon aria-hidden sx={{ fontSize: { xs: 20, sm: 18 } }} />
        <Box component="span" aria-hidden sx={{ display: { xs: "none", sm: "inline" }, flex: 1, textAlign: "left" }}>
          Search
        </Box>
        <Box component="span" aria-hidden sx={{ display: { xs: "none", sm: "inline-flex" }, gap: "3px" }}>
          <Kbd>{MOD}</Kbd>
          <Kbd>K</Kbd>
        </Box>
      </Box>

      {/*
       * Open search: in the middle of the page, a little above centre, over
       * the view dimmed and blurred; on a phone, the whole screen.
       */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullScreen={phone}
        maxWidth={false}
        disableAutoFocus
        disableScrollLock
        transitionDuration={still ? 0 : { enter: 160, exit: 0 }}
        slotProps={{
          backdrop: {
            sx: {
              bgcolor: (t: Theme) => `color-mix(in srgb, ${t.vars.palette.background.default} 45%, transparent)`,
              backdropFilter: "blur(6px) saturate(0.9)",
            },
          },
          paper: { "aria-label": "Search", "data-no-pan": true, sx: paperSx } as object,
        }}
        sx={{ "& .MuiDialog-container": { alignItems: "flex-start" } }}
      >
        <Box
          component="label"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            flex: "none",
            pl: 2,
            pr: 1.75,
            height: 56,
            borderBottom: 1,
            borderColor: "divider",
            cursor: "text",
          }}
        >
          <SearchRoundedIcon aria-hidden sx={{ fontSize: 20, color: "text.secondary" }} />
          <Box
            component="input"
            ref={field}
            type="search"
            value={query}
            placeholder={placeholder}
            aria-label="Search projects, domains, features, capabilities, rules, concepts, personas, problems, and constraints"
            aria-expanded={q.length > 0}
            aria-controls="search-results"
            aria-activedescendant={flat[active] ? `result-${flat[active].key}` : undefined}
            role="combobox"
            autoComplete="off"
            spellCheck={false}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
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
            sx={{
              flex: 1,
              minWidth: 0,
              border: 0,
              outline: 0,
              bgcolor: "transparent",
              font: "inherit",
              fontSize: 16,
              color: "text.primary",
              "&::placeholder": { color: "text.disabled", opacity: 1 },
              "&::-webkit-search-cancel-button": { display: "none" },
            }}
          />
          <Box
            component="button"
            type="button"
            onClick={() => setOpen(false)}
            sx={[kbdSx, { bgcolor: "transparent", cursor: "pointer", font: "inherit", fontFamily: "fontFamilyMono", fontSize: 11 }]}
          >
            Esc
          </Box>
        </Box>

        {searching ? <LinearProgress sx={{ height: 2 }} /> : null}
        <Box
          id="search-results"
          role="listbox"
          aria-busy={searching || undefined}
          sx={{ flex: 1, minHeight: 0, maxHeight: { sm: 440 }, overflowY: "auto", p: 0.75 }}
        >
          {!q ? (
            <Box sx={emptySx}>Find a project, domain, feature, capability, rule, concept, persona, problem, or constraint, and open it.</Box>
          ) : groups.length ? (
            groups.map((g) => (
              <div key={g.kind} role="group" aria-label={g.label}>
                <Box sx={{ px: 1.25, pt: 1, pb: 0.5, typography: "overline", color: "text.disabled" }}>{g.label}</Box>
                {g.results.map((entry) => {
                  const i = flat.indexOf(entry);
                  return (
                    <Box
                      key={entry.key}
                      id={`result-${entry.key}`}
                      role="option"
                      aria-selected={i === active}
                      onMouseDown={(e) => e.preventDefault()}
                      onMouseMove={() => setActive(i)}
                      onClick={() => choose(entry)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.25,
                        px: 1.25,
                        py: "7px",
                        borderRadius: "5px",
                        cursor: "pointer",
                        "&[aria-selected=true]": { bgcolor: "surface.accentSoft" },
                      }}
                    >
                      <KindIcon kind={entry.kind} />
                      <Box component="span" sx={{ flex: 1, minWidth: 0, display: "grid" }}>
                        <Box component="span" sx={[ellipsisSx, { fontSize: 13.5, fontWeight: 550 }]}>
                          {highlight(entry.title, terms)}
                        </Box>
                        <Box component="span" sx={[ellipsisSx, { fontSize: 12, color: "text.secondary" }]}>
                          {entry.from ? `${entry.from} · ${entry.context}` : entry.context}
                        </Box>
                      </Box>
                      {entry.level ? (
                        <LevelMark level={entry.level} />
                      ) : entry.level === null ? (
                        <Box component="span" sx={{ color: "text.disabled" }}>
                          Draft
                        </Box>
                      ) : null}
                    </Box>
                  );
                })}
              </div>
            ))
          ) : found?.q === q ? (
            found.failed ? (
              <Box sx={emptySx}>
                <ReadError what="search results" onRetry={() => setAttempt((a) => a + 1)} />
              </Box>
            ) : (
              <Box sx={emptySx} aria-live="polite">
                Nothing matches “{q}”.
              </Box>
            )
          ) : null}
        </Box>

        {/* How to work it, along its foot, where there's a keyboard. */}
        <Box
          aria-hidden
          sx={{
            display: { xs: "none", sm: "flex" },
            flexWrap: "wrap",
            gap: "6px 16px",
            flex: "none",
            px: 2,
            py: "9px",
            borderTop: 1,
            borderColor: "divider",
            fontSize: 12,
            color: "text.disabled",
            "& kbd": { mr: "2px" },
          }}
        >
          <span>
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> to move
          </span>
          <span>
            <Kbd>↵</Kbd> to show on the map
          </span>
          <span>
            <Kbd>Esc</Kbd> to close
          </span>
        </Box>
      </Dialog>
    </>
  );
}

/* Open search's card, from sm up; on a phone, Dialog's fullScreen fills the screen instead. */
const paperSx = (t: Theme): SystemStyleObject<Theme> => ({
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  bgcolor: "background.paper",
  backgroundImage: "none",
  [t.breakpoints.up("sm")]: {
    m: 0,
    mt: "max(12vh, 16px)",
    width: "min(640px, calc(100vw - 32px))",
    maxHeight: "calc(100vh - max(12vh, 16px) - 16px)",
    border: 1,
    borderColor: "divider",
    borderRadius: "12px",
    boxShadow: 24,
  },
});

const ellipsisSx: SystemStyleObject<Theme> = { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };

const emptySx: SystemStyleObject<Theme> = { px: 1.25, py: 1.75, fontSize: 13, color: "text.secondary" };

/* A key, as it's labelled on the keyboard. */
const kbdSx: SystemStyleObject<Theme> = {
  fontFamily: "fontFamilyMono",
  fontSize: 11,
  color: "text.secondary",
  px: 0.75,
  py: "1px",
  border: 1,
  borderColor: "surface.borderStrong",
  borderBottomWidth: 2,
  borderRadius: "4px",
};

function Kbd({ children }: { children: ReactNode }) {
  return (
    <Box component="kbd" sx={kbdSx}>
      {children}
    </Box>
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
  if (kind === "problem") return <ProblemIcon />;
  if (kind === "constraint") return <ConstraintIcon />;
  if (kind === "initiative") return <InitiativeIcon />;
  return <RuleRoundedIcon sx={{ ...sx, color: "text.secondary" }} />;
}

/* A capability's level in a result, as its mark looks, without a popover of its own. */
function LevelMark({ level }: { level: Level }) {
  return (
    <Box component="span" sx={[{ display: "inline-flex", alignItems: "center", gap: 0.75, fontSize: 12, fontWeight: 500, flex: "none" }, levelColor(level)]}>
      <StabilityTrack level={level} />
      {STABILITY[level].name}
    </Box>
  );
}
