import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode, type Ref } from "react";
import Box from "@mui/material/Box";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import IncompleteCircleRoundedIcon from "@mui/icons-material/IncompleteCircleRounded";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import Canvas, { type CanvasHandle } from "./Canvas";
import { ConceptIcon, ConceptsPanel } from "./Concepts";
import { ExplorePanel, type ExploreKind } from "./Explore";
import { MaturityRing } from "./design/maturity/MaturityRing";
import { RingGlyph } from "./design/maturity/RingGlyph";
import { MATURITY_BANDS, maturityBand } from "./design/maturity/maturity";
import { levelColor } from "./design/stability/stability";
import { DomainIcon, mapGroups, mapItems, tidyMap } from "./FeatureMap";
import Logo from "./Logo";
import DetailPage from "./Page";
import { PersonaIcon } from "./Personas";
import PlatformFilter, { type PlatformChoice } from "./PlatformFilter";
import Search, { type Selection } from "./Search";
import {
  cardsOf,
  combine,
  domainGroup,
  dueOf,
  filterBy,
  pickName,
  targetOf,
  find,
  loadProjects,
  loadState,
  mapHref,
  maturityOf,
  pageHref,
  pageInUrl,
  personaCard,
  pickList,
  platformsOf,
  projectOf,
  shownInUrl,
  type DocketState,
  type PageAt,
  type Pick,
  type Platform,
  type StateFile,
  type Target,
} from "./state";

/* The platform and projects named in the page's address, as `?platform=<id>&project=<id>,<id>`. */
const showingInUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return { platform: params.get("platform"), projects: (params.get("project") ?? "").split(",").filter(Boolean) };
};

/*
 * Docket's one page: the features and capabilities of one platform's
 * projects, mapped together on a canvas, under a header with their maturity.
 * `projects.json` lists the projects' state, or else there's the one
 * `state.json`. The page shows one platform at a time, and can be filtered to
 * some of its projects; the address says which. Where the cards sit is this
 * browser's own, for each platform. An address naming one doc, such as
 * `?capability=deposits`, shows its detail page instead.
 */
export default function App() {
  const [files, setFiles] = useState<StateFile[] | null>(null);
  const [wanted, setWanted] = useState(showingInUrl);
  const [page, setPage] = useState(pageInUrl);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects()
      .then((paths) => Promise.all(paths.length ? paths.map((p) => loadState(p)) : [loadState()]))
      .then(setFiles, (e: unknown) => setError(String(e)));
    const onPop = () => {
      setWanted(showingInUrl());
      setPage(pageInUrl());
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const all = useMemo(() => (files ?? []).map(projectOf), [files]);
  /* Each platform, with the maturity of all its projects together. */
  const platforms = useMemo(
    () =>
      platformsOf(all).map((p) => {
        const ids = p.projects.map((x) => x.id);
        return { ...p, maturity: maturityOf(combine((files ?? []).filter((f) => ids.includes(f.project.id)))) };
      }),
    [all, files],
  );
  /*
   * The platform showing: the one the address names, or else the one its
   * first named project is in, or else the first. And its projects showing:
   * those the address names, or else all of them.
   */
  const platform = useMemo(() => {
    const named = platforms.find((p) => p.id === wanted.platform) ?? platforms.find((p) => p.projects.some((x) => x.id === wanted.projects[0]));
    return named ?? platforms[0];
  }, [platforms, wanted]);
  const chosen = useMemo(() => {
    const known = platform?.projects.map((p) => p.id) ?? [];
    const named = wanted.projects.filter((id) => known.includes(id));
    return named.length ? named : known;
  }, [platform, wanted]);
  const state = useMemo(() => files && combine(files.filter((f) => chosen.includes(f.project.id))), [files, chosen]);

  useEffect(() => {
    if (state && platform && !page)
      document.title = `${state.projects.length === 1 ? state.projects[0].name : platform.name} · Docket`;
  }, [state, platform, page]);

  /* From one detail page to another, in the same tab, so back returns. */
  const go = (pick: PageAt) => {
    window.history.pushState(null, "", pageHref(pick));
    setPage(pick);
  };

  /* Show a platform, and some of its projects, or all of them with none named. The address names the platform only when there's a choice of them. */
  const choose = (platformId: string, ids: string[] = []) => {
    const of = platforms.find((p) => p.id === platformId);
    if (!of) return;
    const projects = ids.length === of.projects.length ? [] : ids;
    const params = new URLSearchParams();
    if (platforms.length > 1) params.set("platform", platformId);
    if (projects.length) params.set("project", projects.join(","));
    window.history.pushState(null, "", params.size ? `?${params}` : window.location.pathname);
    setWanted({ platform: platformId, projects });
  };

  if (error) {
    return (
      <div className="message">
        <Logo />
        <h1>The state couldn't be read</h1>
        <p>
          Docket reads <code>projects.json</code>, or else <code>state.json</code>, from beside this page.
          Run <code>docket index</code>, then reload.
        </p>
        <p className="faint">{error}</p>
      </div>
    );
  }
  if (!state || !files || !platform) return <div className="message faint">Loading…</div>;
  if (page) return <DetailPage state={state} page={page} onGo={go} />;

  /* Keyed by the platform's projects, so each platform has a canvas of its own and a different set starts it afresh. */
  const key = platform.projects.map((p) => p.id).join(",");
  return (
    <View
      key={key}
      layoutKey={key}
      state={state}
      platform={platform}
      platforms={platforms}
      onPlatform={(id) => choose(id)}
      onProjects={(ids) => choose(platform.id, ids)}
    />
  );
}

function View({
  state,
  platform,
  platforms,
  layoutKey,
  onPlatform,
  onProjects,
}: {
  state: DocketState;
  /* The platform showing, with every one of its projects, showing or not. */
  platform: Platform;
  /* Every platform there is, with its maturity. */
  platforms: PlatformChoice[];
  layoutKey: string;
  onPlatform: (id: string) => void;
  onProjects: (ids: string[]) => void;
}) {
  const header = useRef<HTMLDivElement>(null);
  const canvas = useRef<CanvasHandle>(null);
  /*
   * The side panel: closed, or a kind's list (id null) or one of them, with
   * where the reader came from, so back retraces their steps.
   */
  const [panel, setPanel] = useState<{ at: PanelAt; back: PanelAt[] } | null>(() => {
    /* Back from a detail page, the map opens on the doc it was about, then forgets having been asked. */
    const shown = shownInUrl();
    return shown && isPick(state, shown) ? { at: shown, back: [] } : null;
  });
  useEffect(() => {
    if (shownInUrl()) window.history.replaceState(null, "", mapHref());
  }, []);
  const open = useCallback(
    (at: PanelAt) => setPanel((p) => (p && (p.at.kind !== at.kind || p.at.id !== at.id) ? { at, back: [...p.back, p.at] } : { at, back: p?.back ?? [] })),
    [],
  );
  const openConcept = useCallback((id: string | null) => open({ kind: "concept", id }), [open]);
  /* Something clicked on the map opens without the map moving to it, since it's already in view. */
  const quiet = useRef(false);
  const atNow = useRef(panel?.at);
  atNow.current = panel?.at;
  const openHere = useCallback(
    (pick: Pick) => {
      if (atNow.current?.kind !== pick.kind || atNow.current.id !== pick.id) quiet.current = true;
      open(pick);
    },
    [open],
  );
  /* A stat in the header opens its kind's list, or closes it when it's showing. */
  const toggle = (kind: PanelKind) =>
    setPanel((p) => (p?.at.kind === kind && p.at.id === null ? null : { at: { kind, id: null }, back: [] }));
  const back = () =>
    setPanel((p) => (!p ? p : p.back.length ? { at: p.back[p.back.length - 1], back: p.back.slice(0, -1) } : { at: { kind: p.at.kind, id: null }, back: [] }));
  const concepts = panel?.at.kind === "concept" ? { concept: panel.at.id } : null;
  /*
   * What the map is filtered to: it shows only what any of these covers.
   * Filters are set from the side panel, for what it's showing, and removed
   * from the bar at the top. Those from projects not showing drop out.
   */
  const [chosenFilters, setFilters] = useState<Pick[]>([]);
  const filters = useMemo(() => chosenFilters.filter((f) => isPick(state, f)), [chosenFilters, state]);
  const same = (a: Pick, b: Pick) => a.kind === b.kind && a.id === b.id;
  const isFiltering = (pick: Pick) => filters.some((f) => same(f, pick));
  const toggleFilter = (pick: Pick) => setFilters((fs) => (fs.some((f) => same(f, pick)) ? fs.filter((f) => !same(f, pick)) : [...fs, pick]));
  const filtered = useMemo(() => filterBy(state, filters), [state, filters]);
  const items = useMemo(() => mapItems(state, openConcept, openHere, filtered?.cards), [state, openConcept, openHere, filtered]);
  const groups = useMemo(() => mapGroups(state, openHere), [state, openHere]);
  /* Bring something into view. When the filter hides all of it, the filter is cleared first. A domain shows while any of its cards do. */
  const show = (t: Target) => {
    canvas.current?.show(t.items, t.row);
    const visible = (id: string) => {
      const group = groups.find((g) => g.id === id);
      return group ? group.items.some((card) => filtered?.cards.has(card)) : filtered?.cards.has(id);
    };
    if (filtered && !t.items.some(visible)) setFilters([]);
  };
  /* Whatever the panel opens, the map focuses on. */
  const at = panel?.at;
  useEffect(() => {
    if (quiet.current) quiet.current = false;
    else if (at?.id) show(targetOf(state, { kind: at.kind, id: at.id }));
  }, [at?.kind, at?.id]);
  const select = (s: Selection) => {
    if ("pick" in s) {
      /* Opening what's already open changes nothing, so it's brought into view here instead. */
      if (at?.kind === s.pick.kind && at.id === s.pick.id) show(targetOf(state, s.pick));
      else open(s.pick);
    }
    else if ("project" in s) onProjects([s.project]);
    else show(s);
  };
  /* While a concept or persona is open, the capabilities that use it, or serve them. */
  const lit =
    at?.kind === "concept" && at.id
      ? (find(state.concepts, at.id)?.capabilities ?? [])
      : at?.kind === "persona" && at.id
        ? (find(state.personas, at.id)?.capabilities ?? [])
        : [];
  const showing = state.projects.map((o) => o.id).join(",");
  /* While a persona is open, lines from their card to every card with something that serves them. */
  const links = useMemo(
    () =>
      at?.kind === "persona" && at.id
        ? { from: personaCard(at.id), to: [...new Set(lit.flatMap((id) => cardsOf(state, id)))] }
        : null,
    [state, at?.kind, at?.id, lit.join(",")],
  );

  /* Esc closes the panel, unless it's clearing the search. */
  useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || (e.target as HTMLElement).closest?.(".search, .MuiPopover-root")) return;
      const filter = e.target instanceof HTMLInputElement && e.target.value;
      if (!filter) setPanel(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel]);

  return (
    <>
      <Canvas
        ref={canvas}
        items={items}
        groups={groups}
        tidy={(sizes) => tidyMap(state, sizes, filtered?.cards)}
        storageKey={`docket.layout.v4:${layoutKey}`}
        clearOf={header}
        fitKey={`${showing}|${filters.map((f) => `${f.kind}:${f.id}`).join(",")}`}
        links={links}
      />
      {lit.length ? <LitCapabilities ids={lit} color={at?.kind === "persona" ? "persona" : "concept"} /> : null}
      <FocusStyle at={at} />
      {filtered ? (
        <FilterStyle concepts={filters.filter((f) => f.kind === "concept").map((f) => f.id)} capabilities={filtered.capabilities} />
      ) : null}
      <Header
        state={state}
        platform={platform}
        platforms={platforms}
        onPlatform={onPlatform}
        onProjects={onProjects}
        ref={header}
        onSelect={select}
        onPanel={toggle}
        panel={panel?.at.kind ?? null}
        filters={
          filters.length ? (
            <FilterBar
              state={state}
              filters={filters}
              onOpen={open}
              onRemove={toggleFilter}
              onClear={() => setFilters([])}
            />
          ) : null
        }
      />
      {panel && panel.at.kind !== "concept" ? (
        <ExplorePanel
          state={state}
          kind={panel.at.kind}
          selected={panel.at.id}
          backLabel={panel.back.length ? backTo(state, panel.back[panel.back.length - 1]) : null}
          onOpen={(kind, id) => open({ kind, id })}
          onConcept={openConcept}
          onBack={back}
          onClose={() => setPanel(null)}
          onShow={show}
          isFiltering={isFiltering}
          onFilter={toggleFilter}
        />
      ) : null}
      {concepts ? (
        <ConceptsPanel
          state={state}
          selected={concepts.concept}
          onSelect={(id) => (id === null ? back() : openConcept(id))}
          onOpen={(kind, id) => open({ kind, id })}
          backLabel={panel?.back.length ? backTo(state, panel.back[panel.back.length - 1]) : null}
          onClose={() => setPanel(null)}
          onShow={show}
          filter={filters.filter((f) => f.kind === "concept").map((f) => f.id)}
          onFilter={(id) => toggleFilter({ kind: "concept", id })}
        />
      ) : null}
    </>
  );
}

/*
 * While a concept or persona is open, the capabilities that use it or serve
 * them are lit on the canvas, rows and cards alike, in its color, so where it
 * matters can be seen at a glance. A style rule rather than props, so the
 * cards don't rebuild.
 */
function LitCapabilities({ ids, color }: { ids: string[]; color: "concept" | "persona" }) {
  if (!ids.length) return null;
  const rows = ids.map((id) => `li[data-capability="${CSS.escape(id)}"]`).join(",");
  const cards = ids.map((id) => `.slot[data-capability="${CSS.escape(id)}"]`).join(",");
  return (
    <style>{`${rows}{background:var(--${color}-soft);box-shadow:inset 3px 0 var(--${color})}${cards}{border-radius:10px;outline:2px solid var(--${color});outline-offset:2px}`}</style>
  );
}

/*
 * What the side panel has open is lit on the map just as it is while
 * hovered: a domain's region, a feature's cards, or a capability's rows and
 * cards. A style rule rather than props, so the cards don't rebuild. Its
 * declarations are the hover rules' in styles.css.
 */
const LIT = "border-color:var(--accent);box-shadow:var(--lit-ring)";
const LIT_ROW = "background-color:var(--lit-row);box-shadow:inset 3px 0 var(--accent)";
function FocusStyle({ at }: { at: PanelAt | undefined }) {
  if (!at?.id || at.kind === "concept") return null;
  if (at.kind === "persona") return <style>{`.slot[data-persona="${CSS.escape(at.id)}"]>.MuiCard-root{${LIT}}`}</style>;
  const id = CSS.escape(at.id);
  const rule =
    at.kind === "domain"
      ? `.group[data-id="${CSS.escape(domainGroup(at.id))}"]{${LIT}}`
      : at.kind === "feature"
        ? `.slot[data-feature="${id}"]>.MuiCard-root{${LIT}}`
        : `.slot[data-capability="${id}"]>.MuiCard-root{${LIT}}li[data-capability="${id}"]{${LIT_ROW}}`;
  return <style>{rule}</style>;
}

/*
 * While the map is filtered by concepts, the capabilities in a feature that
 * don't use any of them are faded, and the concepts filtered by are filled
 * in wherever they show as chips.
 */
function FilterStyle({ concepts, capabilities }: { concepts: string[]; capabilities: Set<string> }) {
  const rows = [...capabilities].map((id) => `li[data-capability="${CSS.escape(id)}"]`).join(",");
  const chips = concepts.map((id) => `.concept-chip[data-concept="${CSS.escape(id)}"]`).join(",");
  return (
    <style>{`li[data-capability]{opacity:.38}${rows ? `${rows}{opacity:1}` : ""}${chips}{background:var(--concept);color:var(--popover)}`}</style>
  );
}

function Header({
  state,
  platform,
  platforms,
  onPlatform,
  onProjects,
  ref,
  onSelect,
  onPanel,
  panel,
  filters,
}: {
  state: DocketState;
  platform: Platform;
  platforms: PlatformChoice[];
  onPlatform: (id: string) => void;
  onProjects: (ids: string[]) => void;
  ref: Ref<HTMLDivElement>;
  onSelect: (selection: Selection) => void;
  /* Open a kind's list in the side panel, or close it; and which kind it's showing. */
  onPanel: (kind: PanelKind) => void;
  panel: PanelKind | null;
  /* The bar of active filters, across the top of the canvas, or null with none. */
  filters: ReactNode;
}) {
  const maturity = maturityOf(state);
  const several = state.projects.length > 1;
  const parts = state.features.flatMap((f) => f.parts.filter((p) => p.maturity !== null).map((p) => ({ ...p, name: f.name })));
  /* With several projects showing, the breakdown is by project; with one, by its parts of features. */
  const breakdown = several
    ? state.projects.filter((p) => p.maturity !== null).map((p) => ({ key: p.id, name: p.name, maturity: p.maturity! }))
    : parts.map((p) => ({ key: `${p.name}@${p.domain}`, name: p.name, maturity: p.maturity! }));
  return (
    <div className="topbar" ref={ref}>
      <div className="panel brand" data-no-pan>
        <Logo />
        <span className="divider" aria-hidden />
        <PlatformFilter
          showing={state.projects}
          platform={platform}
          platforms={platforms}
          onPlatform={onPlatform}
          onProjects={onProjects}
        />
      </div>

      <div className="finders">
        <Search state={state} all={platform.projects} onSelect={onSelect} />
      </div>

      <div className="panel stats" data-no-pan>
        {maturity !== null ? (
          <div className="stat stat-maturity">
            <MaturityRing
              progress={maturity}
              subject="project"
              count={parts.length}
              label={several ? "Maturity across projects" : undefined}
              size={40}
              breakdown={
                <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
                  {[...breakdown]
                    .sort((a, b) => b.maturity - a.maturity)
                    .map((x) => (
                      <Box
                        key={x.key}
                        component="li"
                        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, py: 0.5 }}
                      >
                        <span>{x.name}</span>
                        <RingGlyph progress={x.maturity} size={20} />
                      </Box>
                    ))}
                </Box>
              }
            />
            <div>
              <Box component="span" className="stat-n" sx={levelColor(maturityBand(maturity))}>
                {MATURITY_BANDS[maturityBand(maturity)]}
              </Box>
              <span className="stat-label">{several ? "maturity across projects" : "project maturity"}</span>
            </div>
          </div>
        ) : null}
        <StatButton
          kind="domain"
          n={state.domains.length}
          label={state.domains.length === 1 ? "domain" : "domains"}
          title="Browse the parts of the business, each with its own language"
          pressed={panel === "domain"}
          onClick={() => onPanel("domain")}
        />
        <StatButton
          kind="feature"
          n={state.features.length}
          label={state.features.length === 1 ? "feature" : "features"}
          title="Browse the jobs the product does"
          pressed={panel === "feature"}
          onClick={() => onPanel("feature")}
        />
        <StatButton
          kind="capability"
          n={state.capabilities.length}
          label={state.capabilities.length === 1 ? "capability" : "capabilities"}
          title="Browse what the software can do, and how stable each is"
          pressed={panel === "capability"}
          onClick={() => onPanel("capability")}
        />
        <StatButton
          kind="concept"
          n={state.concepts.length}
          label={state.concepts.length === 1 ? "concept" : "concepts"}
          title="Browse the domain's concepts"
          pressed={panel === "concept"}
          onClick={() => onPanel("concept")}
        />
        <StatButton
          kind="persona"
          n={state.personas.length}
          label={state.personas.length === 1 ? "persona" : "personas"}
          title="Browse who the software serves, and how far along it is for each"
          pressed={panel === "persona"}
          onClick={() => onPanel("persona")}
        />
        <GapsLink state={state} />
      </div>
      {filters}
    </div>
  );
}

/* Whether a pick names something showing. */
function isPick(state: DocketState, pick: Pick): boolean {
  return pickList(state, pick.kind).some((d) => d.id === pick.id);
}

/* Each kind's icon, the same everywhere it's named. */
function kindIcon(kind: Pick["kind"], size = 15): ReactNode {
  switch (kind) {
    case "domain":
      return <DomainIcon size={size} />;
    case "feature":
      return <WidgetsOutlinedIcon sx={{ fontSize: size, color: "secondary.main" }} />;
    case "capability":
      return <BoltOutlinedIcon sx={{ fontSize: size, color: "primary.main" }} />;
    case "concept":
      return <ConceptIcon size={size} />;
    case "persona":
      return <PersonaIcon size={size} />;
  }
}
const PICK_KINDS: Record<Pick["kind"], string> = { domain: "Domain", feature: "Feature", capability: "Capability", concept: "Concept", persona: "Persona" };

/*
 * The filters the map has, across the top of the canvas: each one's name,
 * which opens it in the side panel, and a way to take it away, or all of
 * them. Filters are only set from the side panel, for what it's showing.
 */
function FilterBar({
  state,
  filters,
  onOpen,
  onRemove,
  onClear,
}: {
  state: DocketState;
  filters: Pick[];
  onOpen: (at: PanelAt) => void;
  onRemove: (pick: Pick) => void;
  onClear: () => void;
}) {
  return (
    <div className="panel filter-bar" data-no-pan role="region" aria-label="Filters">
      <FilterListRoundedIcon sx={{ fontSize: 17, color: "text.secondary" }} />
      <span className="filter-bar-label">Showing only</span>
      {filters.map((f) => (
        <span key={`${f.kind}:${f.id}`} className="filter-chip">
          <button type="button" className="filter-chip-name" title={`${PICK_KINDS[f.kind]}: open it`} onClick={() => onOpen(f)}>
            {kindIcon(f.kind)}
            {pickName(state, f)}
          </button>
          <button
            type="button"
            className="filter-chip-remove"
            aria-label={`Stop filtering to ${pickName(state, f)}`}
            onClick={() => onRemove(f)}
          >
            <CloseRoundedIcon sx={{ fontSize: 14 }} />
          </button>
        </span>
      ))}
      {filters.length > 1 ? (
        <button type="button" className="link filter-bar-clear" onClick={onClear}>
          Clear filters
        </button>
      ) : null}
    </div>
  );
}

/* How many known gaps there are, and how many are due, in the header: it opens the page with every gap, open decision and tradeoff. */
function GapsLink({ state }: { state: DocketState }) {
  const due = state.gaps.filter((g) => dueOf(state, g).when === "due").length;
  return (
    <a
      className="stat stat-button"
      href={pageHref({ kind: "gaps", id: "" })}
      title="Where the software differs from what's intended: known and technical gaps, open decisions and tradeoffs"
    >
      <span className="stat-icon" aria-hidden>
        <IncompleteCircleRoundedIcon sx={{ fontSize: 17, color: due ? "var(--warning)" : "text.secondary" }} />
      </span>
      <span className="stat-n">{state.gaps.length}</span>
      <span className="stat-label">
        {state.gaps.length === 1 ? "gap" : "gaps"}
        {due ? `, ${due} due` : ""}
      </span>
      <ChevronRightRoundedIcon className="stat-chevron" aria-hidden sx={{ fontSize: 16 }} />
    </a>
  );
}

/* A count in the header that opens its kind in the side panel. */
function StatButton({
  kind,
  n,
  label,
  title,
  pressed,
  onClick,
}: {
  kind: Pick["kind"];
  n: number;
  label: string;
  title: string;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className="stat stat-button" aria-pressed={pressed} title={title} onClick={onClick}>
      <span className="stat-icon" aria-hidden>
        {kindIcon(kind, 18)}
      </span>
      <span className="stat-n">{n}</span>
      <span className="stat-label">{label}</span>
      <ChevronRightRoundedIcon className="stat-chevron" aria-hidden sx={{ fontSize: 16 }} />
    </button>
  );
}

/* What the side panel can show, and where it is: a kind's list (id null), or one of them. */
type PanelKind = ExploreKind | "concept";
type PanelAt = { kind: PanelKind; id: string | null };

/* What back returns to, named: "Room booking", or "All features". */
function backTo(state: DocketState, at: PanelAt): string {
  const plurals = { domain: "domains", feature: "features", capability: "capabilities", concept: "concepts", persona: "personas" };
  return at.id ? (find(pickList(state, at.kind), at.id)?.name ?? "Back") : `All ${plurals[at.kind]}`;
}
