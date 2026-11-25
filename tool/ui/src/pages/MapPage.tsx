import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import Canvas, { type CanvasHandle } from "../Canvas";
import { mapGroups, mapItems, tidyMap } from "../FeatureMap";
import Peek, { PICK_KINDS } from "../Peek";
import { navigate, useSearch } from "../routes";
import {
  RISK_BANDS,
  cardsOf,
  domainGroup,
  filterBy,
  find,
  mapHref,
  personaCard,
  pickList,
  pickName,
  shownInUrl,
  targetOf,
  type DocketState,
  type Pick,
  type Target,
} from "../state";
import { Ring } from "../design/ring/Ring";
import { MATURITY_BANDS } from "../design/maturity/maturity";
import { RiskRing } from "../design/risk/RiskRing";
import { STABILITY_LEVEL_IDS, levelColor } from "../design/stability/stability";
import { Tip } from "../design/Tip";
import "./map.css";

/*
 * What the map shows on its cards, one at a time: each shows only its own
 * marks on the canvas, and the rest stay in the peek, which always shows
 * everything about what's clicked. A persona's readiness is about the
 * persona, so it always shows on their card.
 */
type Lens = "stability" | "risk";
const LENSES: { id: Lens; label: string; tip: string }[] = [
  { id: "stability", label: "Maturity", tip: "Each capability's stability level, and each feature's and domain's maturity" },
  { id: "risk", label: "Exposure", tip: "What the open gaps on each capability, feature and domain put at stake: their exposure" },
];

/*
 * The map: the features and capabilities of the projects showing, on a
 * canvas, in their domains, with their personas. It answers how everything
 * fits together. Clicking something peeks at it in a slim panel, which leads
 * to its page; the filters set there show across the top, beside what the
 * cards are colored by. Where the cards sit is this browser's own, for each
 * platform, under `layoutKey`.
 */
export default function MapPage({ state, layoutKey }: { state: DocketState; layoutKey: string }) {
  const header = useRef<HTMLDivElement>(null);
  useEffect(() => {
    document.title = "Map · Docket";
  }, []);
  const canvas = useRef<CanvasHandle>(null);
  /* What the peek shows, or null with it closed. */
  const [peek, setPeek] = useState<Pick | null>(null);
  const open = useCallback((pick: Pick) => setPeek(pick), []);
  const close = useCallback(() => setPeek(null), []);
  /* An address asking to show something, as `?view=map&show=<kind>:<id>`, opens it in the peek, then forgets having been asked. */
  const search = useSearch();
  useEffect(() => {
    const shown = shownInUrl();
    if (!shown) return;
    if (isPick(state, shown)) open(shown);
    navigate(mapHref(), true);
  }, [search]);
  /* Something clicked on the map opens without the map moving to it, since it's already in view. */
  const quiet = useRef(false);
  const atNow = useRef(peek);
  atNow.current = peek;
  const openHere = useCallback(
    (pick: Pick) => {
      if (atNow.current?.kind !== pick.kind || atNow.current.id !== pick.id) quiet.current = true;
      open(pick);
    },
    [open],
  );
  /*
   * What the map is filtered to: it shows only what any of these covers.
   * Filters are set from the peek, for what it's showing, and removed from
   * the bar at the top. Those from projects not showing drop out.
   */
  const [chosenFilters, setFilters] = useState<Pick[]>([]);
  const filters = useMemo(() => chosenFilters.filter((f) => isPick(state, f)), [chosenFilters, state]);
  const same = (a: Pick, b: Pick) => a.kind === b.kind && a.id === b.id;
  const toggleFilter = (pick: Pick) => setFilters((fs) => (fs.some((f) => same(f, pick)) ? fs.filter((f) => !same(f, pick)) : [...fs, pick]));
  const filtered = useMemo(() => filterBy(state, filters), [state, filters]);
  const items = useMemo(() => mapItems(state, openHere, filtered?.cards), [state, openHere, filtered]);
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
  /* Whatever the peek opens, the map focuses on. */
  useEffect(() => {
    if (quiet.current) quiet.current = false;
    else if (peek) show(targetOf(state, peek));
  }, [peek?.kind, peek?.id]);

  /* What the cards are colored by. */
  const [lens, setLens] = useState<Lens>("stability");
  /* The capabilities lit on the map: those using the concept or serving the persona the peek has open. */
  const litBy: Pick | null = peek && (peek.kind === "concept" || peek.kind === "persona") ? peek : null;
  const lit = litBy ? ((litBy.kind === "concept" ? find(state.concepts, litBy.id) : find(state.personas, litBy.id))?.capabilities ?? []) : [];
  const showing = state.projects.map((o) => o.id).join(",");
  /* While a persona is lit, lines from their card to every card with something that serves them. */
  const links = useMemo(
    () => (litBy?.kind === "persona" ? { from: personaCard(litBy.id), to: [...new Set(lit.flatMap((id) => cardsOf(state, id)))] } : null),
    [state, litBy?.kind, litBy?.id, lit.join(",")],
  );

  return (
    <>
      <Canvas
        ref={canvas}
        items={items}
        groups={groups}
        tidy={(sizes) => tidyMap(state, sizes, filtered?.cards)}
        storageKey={`docket.layout.v4:${layoutKey}`}
        clearOf={header}
        clearRight={peek ? PEEK_ROOM : 0}
        fitKey={`${showing}|${filters.map((f) => `${f.kind}:${f.id}`).join(",")}`}
        links={links}
        lens={lens}
      />
      {lit.length ? <LitCapabilities ids={lit} color={litBy?.kind === "persona" ? "persona" : "concept"} /> : null}
      <FocusStyle at={peek} />
      {filtered ? <FilterStyle capabilities={filtered.capabilities} /> : null}
      <div className="map-top" ref={header} data-peek={peek ? "" : undefined}>
        <LensBar lens={lens} onLens={setLens} />
        {filters.length ? <FilterBar state={state} filters={filters} onOpen={open} onRemove={toggleFilter} onClear={() => setFilters([])} /> : null}
      </div>
      {peek ? (
        <Peek
          key={`${peek.kind}:${peek.id}`}
          state={state}
          at={peek}
          onClose={close}
          filtering={filters.some((f) => same(f, peek))}
          onFilter={() => toggleFilter(peek)}
        />
      ) : null}
    </>
  );
}

/* How much of the map's right edge the peek covers, with the room around it: its width in map.css, and 12px either side. */
const PEEK_ROOM = 340 + 24;

/*
 * While a concept or persona is lit, the capabilities that use it or serve
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
 * What the peek has open is lit on the map just as it is while hovered: a
 * domain's region, a feature's cards, or a capability's rows and cards. A
 * style rule rather than props, so the cards don't rebuild. Its declarations
 * are the hover rules' in styles.css.
 */
const LIT = "border-color:var(--accent);box-shadow:var(--lit-ring)";
const LIT_ROW = "background-color:var(--lit-row);box-shadow:inset 3px 0 var(--accent)";
function FocusStyle({ at }: { at: Pick | null }) {
  if (!at || at.kind === "concept") return null;
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

/* While the map is filtered, the capabilities on a card left on it that nothing filtered to covers are faded. */
function FilterStyle({ capabilities }: { capabilities: Set<string> }) {
  const rows = [...capabilities].map((id) => `li[data-capability="${CSS.escape(id)}"]`).join(",");
  return <style>{`li[data-capability]{opacity:.38}${rows ? `${rows}{opacity:1}` : ""}`}</style>;
}

/* Whether a pick names something showing. */
function isPick(state: DocketState, pick: Pick): boolean {
  return pickList(state, pick.kind).some((d) => d.id === pick.id);
}

/* The rings in a lens's legend, each filled to the top of its band. */
const LEGEND_RING = 14;

/*
 * What the map shows, floating over the top left of the canvas: one view at
 * a time, with what each color means beside it.
 */
function LensBar({ lens, onLens }: { lens: Lens; onLens: (lens: Lens) => void }) {
  return (
    <div className="panel lens-bar" data-no-pan role="group" aria-label="Show on the map">
      <span className="lens-label">Show</span>
      <span className="lens-choices">
        {LENSES.map((l) => (
          <Tip key={l.id} title={l.tip}>
            <button type="button" aria-pressed={lens === l.id} onClick={() => onLens(l.id)}>
              {l.label}
            </button>
          </Tip>
        ))}
      </span>
      {lens === "risk" ? (
        <span className="lens-legend">
          {RISK_BANDS.map((b) => (
            <span key={b.id} data-risk-band={b.id}>
              <RiskRing percent={b.from + 25} size={LEGEND_RING} figure={false} />
              {b.name}
            </span>
          ))}
        </span>
      ) : (
        <span className="lens-legend">
          {STABILITY_LEVEL_IDS.map((id, n) => (
            <span key={id}>
              <Ring percent={(n + 1) * 25} size={LEGEND_RING} sx={levelColor(id)} />
              {MATURITY_BANDS[id]}
            </span>
          ))}
        </span>
      )}
    </div>
  );
}

/*
 * The filters the map has, across the top of the canvas: each one's name,
 * which peeks at it, and a way to take it away, or all of them. Filters are
 * only set from the peek, for what it's showing.
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
  onOpen: (at: Pick) => void;
  onRemove: (pick: Pick) => void;
  onClear: () => void;
}) {
  return (
    <div className="panel filter-bar" data-no-pan role="region" aria-label="Filters">
      <FilterListRoundedIcon sx={{ fontSize: 17, color: "text.secondary" }} />
      <span className="filter-bar-label">Showing only</span>
      {filters.map((f) => (
        <span key={`${f.kind}:${f.id}`} className="filter-chip">
          <Tip title={`${PICK_KINDS[f.kind].one}: peek at it`}>
            <button type="button" className="filter-chip-name" onClick={() => onOpen(f)}>
              {PICK_KINDS[f.kind].icon(15)}
              {pickName(state, f)}
            </button>
          </Tip>
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
