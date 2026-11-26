import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme, type Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import Canvas, { panelSx, type CanvasHandle } from "./components/Canvas";
import { mapGroups, mapItems, tidyMap } from "./components/FeatureMap";
import Peek, { PICK_KINDS, linkSx } from "./components/Peek";
import { navigate, useSearch } from "../../routes";
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
  type RiskBand,
} from "../../state";
import { Ring } from "../../components/ring/Ring";
import { MATURITY_BANDS } from "../../components/maturity/maturity";
import { RiskRing } from "../../components/risk/RiskRing";
import { STABILITY_LEVEL_IDS, levelColor } from "../../components/stability/stability";

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
 * product, under `layoutKey`.
 */
export default function MapPage({ state, layoutKey }: { state: DocketState; layoutKey: string }) {
  const header = useRef<HTMLDivElement>(null);
  /* On a phone, the peek is a sheet across the bottom rather than a panel at the right. */
  const phone = useMediaQuery(useTheme().breakpoints.down("sm"), { noSsr: true });
  const sheet = useRef<HTMLElement>(null);
  useEffect(() => {
    document.title = "Map · Docket";
  }, []);
  const canvas = useRef<CanvasHandle>(null);
  /*
   * What the peek shows, or null with it closed, and whether the map moves to
   * it: not for something clicked on the map, since it's already in view.
   */
  const [peekAt, setPeekAt] = useState<{ pick: Pick; move: boolean } | null>(null);
  const peek = peekAt?.pick ?? null;
  const openHere = useCallback((pick: Pick) => setPeekAt({ pick, move: false }), []);
  const close = useCallback(() => setPeekAt(null), []);
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
  /* Open something and bring it into view. When the filter hides all of it, the filter is cleared. A domain shows while any of its cards do. */
  const open = (pick: Pick) => {
    setPeekAt({ pick, move: true });
    const visible = (id: string) => {
      const group = groups.find((g) => g.id === id);
      return group ? group.items.some((card) => filtered?.cards.has(card)) : filtered?.cards.has(id);
    };
    if (filtered && !targetOf(state, pick).items.some(visible)) setFilters([]);
  };
  /* An address asking to show something, as `?view=map&show=<kind>:<id>`, opens it in the peek, then forgets having been asked. */
  const search = useSearch();
  const openShown = useEffectEvent(() => {
    const shown = shownInUrl();
    if (!shown) return;
    if (isPick(state, shown)) open(shown);
    navigate(mapHref(), true);
  });
  // The address is outside React: opening what it names keeps the peek in step with it.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => openShown(), [search]);
  /* Whatever the peek opens, the map focuses on, once the canvas has drawn it. */
  const focusPeek = useEffectEvent(() => {
    if (!peekAt?.move) return;
    const t = targetOf(state, peekAt.pick);
    canvas.current?.show(t.items, t.row);
  });
  useEffect(() => focusPeek(), [peek?.kind, peek?.id]);

  /* What the cards are colored by. */
  const [lens, setLens] = useState<Lens>("stability");
  /* The capabilities lit on the map: those using the concept or serving the persona the peek has open. */
  const litBy: Pick | null = peek && (peek.kind === "concept" || peek.kind === "persona") ? peek : null;
  const lit = useMemo(
    () => (litBy ? ((litBy.kind === "concept" ? find(state.concepts, litBy.id) : find(state.personas, litBy.id))?.capabilities ?? []) : []),
    [state, litBy],
  );
  const showing = state.projects.map((o) => o.id).join(",");
  /* While a persona is lit, lines from their card to every card with something that serves them. */
  const links = useMemo(
    () => (litBy?.kind === "persona" ? { from: personaCard(litBy.id), to: [...new Set(lit.flatMap((id) => cardsOf(state, id)))] } : null),
    [state, litBy, lit],
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
        clearRight={peek && !phone ? PEEK_ROOM : 0}
        clearUnder={peek && phone ? sheet : undefined}
        fitKey={`${showing}|${filters.map((f) => `${f.kind}:${f.id}`).join(",")}`}
        links={links}
        sx={[lensSx(lens), litSx(lit, litBy?.kind === "persona" ? "persona" : "concept"), focusSx(peek), filtered ? fadedSx(filtered.capabilities) : null]}
      />
      <Box ref={header} sx={[topSx, peek ? { right: { sm: PEEK_ROOM } } : null]}>
        <LensBar lens={lens} onLens={setLens} />
        {filters.length ? <FilterBar state={state} filters={filters} onOpen={open} onRemove={toggleFilter} onClear={() => setFilters([])} /> : null}
      </Box>
      {peek ? (
        <Peek
          key={`${peek.kind}:${peek.id}`}
          ref={sheet}
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

/* How much of the map's right edge the peek covers, with the room around it: its width in Peek, and 12px either side. */
const PEEK_ROOM = 340 + 24;

/*
 * Across the top of the canvas: what the cards are colored by, and the
 * filters, if any. The canvas fits its content below it. With the peek open
 * at the right, it stops short of it.
 */
const topSx: SystemStyleObject<Theme> = {
  position: "absolute",
  top: 12,
  left: 12,
  right: 12,
  display: "flex",
  flexWrap: "wrap",
  alignItems: "flex-start",
  gap: 1,
  pointerEvents: "none",
  zIndex: 4,
  "& > *": { pointerEvents: "auto" },
};

/*
 * The styles below are the canvas's, from the page: rules rather than props,
 * so the cards don't rebuild when what's lit or shown changes.
 */

/* Each exposure band's color. */
const BAND_COLOR: Record<RiskBand["id"], (t: Theme) => string> = {
  low: (t) => t.vars.palette.text.disabled,
  minor: (t) => t.vars.palette.impact.inconvenient,
  moderate: (t) => t.vars.palette.impact.blocking,
  high: (t) => t.vars.palette.error.main,
};

/*
 * The risk lens tints rows, and the cards of capabilities in no feature, from
 * each one's exposure: data-risk-band, the band of the exposure its gaps give
 * it. Low exposure gets the bar alone. Tinted under the card's own background,
 * and at a lower specificity than hovering or what the peek has open, which
 * stay on top.
 */
const RISK_TINTS: SystemStyleObject<Theme> = Object.fromEntries(
  RISK_BANDS.map((b) => [
    `& li:where([data-risk-band="${b.id}"]), & .slot:where([data-risk-band="${b.id}"]) > .MuiCard-root`,
    {
      boxShadow: (t: Theme) => `inset 3px 0 ${BAND_COLOR[b.id](t)}`,
      backgroundImage: (t: Theme) => {
        if (b.id === "low") return "none";
        const tint = `color-mix(in srgb, ${BAND_COLOR[b.id](t)} 13%, transparent)`;
        return `linear-gradient(${tint}, ${tint})`;
      },
    },
  ]),
);

/*
 * Each lens shows only its own marks on the canvas: stability marks and
 * maturity, or exposure. The peek shows them all, and a persona's readiness
 * always shows on their card. Nothing to show, such as no gaps or only
 * drafts, takes no room.
 */
function lensSx(lens: Lens): SystemStyleObject<Theme> {
  return {
    "& .lens-risk:empty": { display: "none" },
    ...(lens === "stability" ? { "& .lens-risk": { display: "none !important" } } : { "& .lens-stability": { display: "none !important" } }),
    ...(lens === "risk" ? RISK_TINTS : {}),
  };
}

/*
 * While a concept or persona is lit, the capabilities that use it or serve
 * them are lit on the canvas, rows and cards alike, in its color, so where it
 * matters can be seen at a glance.
 */
function litSx(ids: string[], color: "concept" | "persona"): SystemStyleObject<Theme> | null {
  if (!ids.length) return null;
  const rows = ids.map((id) => `& li[data-capability="${CSS.escape(id)}"]`).join(",");
  const cards = ids.map((id) => `& .slot[data-capability="${CSS.escape(id)}"]`).join(",");
  return {
    [rows]: { bgcolor: `${color}.soft`, boxShadow: (t: Theme) => `inset 3px 0 ${t.vars.palette[color].main}` },
    [cards]: { borderRadius: "10px", outline: (t: Theme) => `2px solid ${t.vars.palette[color].main}`, outlineOffset: "2px" },
  };
}

/*
 * What the peek has open is lit on the map just as it is while hovered: a
 * domain's region, a feature's cards, or a capability's rows and cards. Its
 * look is the hover rules' in FeatureMap and Canvas.
 */
const LIT: SystemStyleObject<Theme> = { borderColor: "primary.main", boxShadow: (t) => t.vars.palette.lit.ring };
const LIT_ROW: SystemStyleObject<Theme> = { bgcolor: "lit.row", boxShadow: (t) => `inset 3px 0 ${t.vars.palette.primary.main}` };
function focusSx(at: Pick | null): SystemStyleObject<Theme> | null {
  if (!at || at.kind === "concept") return null;
  const id = CSS.escape(at.id);
  if (at.kind === "persona") return { [`& .slot[data-persona="${id}"] > .MuiCard-root`]: LIT };
  if (at.kind === "domain") return { [`& .group[data-id="${CSS.escape(domainGroup(at.id))}"]`]: LIT };
  if (at.kind === "feature") return { [`& .slot[data-feature="${id}"] > .MuiCard-root`]: LIT };
  return { [`& .slot[data-capability="${id}"] > .MuiCard-root`]: LIT, [`& li[data-capability="${id}"]`]: LIT_ROW };
}

/* While the map is filtered, the capabilities on a card left on it that nothing filtered to covers are faded. */
function fadedSx(capabilities: Set<string>): SystemStyleObject<Theme> {
  const rows = [...capabilities].map((id) => `& li[data-capability="${CSS.escape(id)}"]`).join(",");
  return { "& li[data-capability]": { opacity: 0.38 }, ...(rows ? { [rows]: { opacity: 1 } } : {}) };
}

/* Whether a pick names something showing. */
function isPick(state: DocketState, pick: Pick): boolean {
  return pickList(state, pick.kind).some((d) => d.id === pick.id);
}

/* The rings in a lens's legend, each filled to the top of its band. */
const LEGEND_RING = 14;

/*
 * What the map shows, floating over the top left of the canvas: one view at
 * a time, as a segmented control, with what each color means beside it.
 */
function LensBar({ lens, onLens }: { lens: Lens; onLens: (lens: Lens) => void }) {
  return (
    <Box
      sx={[panelSx, { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 10px", p: "4px 6px 4px 10px", maxWidth: "100%" }]}
      data-no-pan
      role="group"
      aria-label="Show on the map"
    >
      <Box component="span" sx={{ fontSize: 12.5, color: "text.secondary" }}>
        Show
      </Box>
      <Box
        component="span"
        sx={{
          display: "inline-flex",
          p: "2px",
          gap: "2px",
          borderRadius: "6px",
          bgcolor: (t) => `color-mix(in srgb, ${t.vars.palette.text.primary} 5%, transparent)`,
        }}
      >
        {LENSES.map((l) => (
          <Tooltip key={l.id} title={l.tip}>
            <Box component="button" type="button" sx={choiceSx} aria-pressed={lens === l.id} onClick={() => onLens(l.id)}>
              {l.label}
            </Box>
          </Tooltip>
        ))}
      </Box>
      <Box component="span" sx={legendSx}>
        {lens === "risk"
          ? RISK_BANDS.map((b) => (
              <span key={b.id} data-risk-band={b.id}>
                <RiskRing percent={b.from + 25} size={LEGEND_RING} figure={false} />
                {b.name}
              </span>
            ))
          : STABILITY_LEVEL_IDS.map((id, n) => (
              <span key={id}>
                <Ring percent={(n + 1) * 25} size={LEGEND_RING} sx={levelColor(id)} />
                {MATURITY_BANDS[id]}
              </span>
            ))}
      </Box>
    </Box>
  );
}

/* One of the lens bar's choices. */
const choiceSx: SystemStyleObject<Theme> = {
  font: "inherit",
  fontSize: 12.5,
  fontWeight: 550,
  height: 26,
  px: 1.25,
  color: "text.secondary",
  bgcolor: "transparent",
  border: 0,
  borderRadius: "4px",
  cursor: "pointer",
  "&:hover:not(:disabled)": { color: "text.primary" },
  "&[aria-pressed=true]": { color: "primary.main", bgcolor: "background.paper", boxShadow: 1 },
};

/* What each color means. */
const legendSx: SystemStyleObject<Theme> = {
  display: "inline-flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "4px 12px",
  fontSize: 12,
  color: "text.secondary",
  "& > span": { display: "inline-flex", alignItems: "center", gap: "5px" },
};

/*
 * The filters the map has, as a row of its own across the top of the
 * canvas, under the lens bar: each one's name, which peeks at it, and its ×,
 * which takes it away, or all of them. Filters are only set from the peek,
 * for what it's showing.
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
    <Box
      sx={[
        panelSx,
        {
          flex: "1 0 100%",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 0.75,
          p: "6px 10px",
          borderColor: (t) => `color-mix(in srgb, ${t.vars.palette.primary.main} 35%, ${t.vars.palette.divider})`,
        },
      ]}
      data-no-pan
      role="region"
      aria-label="Filters"
    >
      <FilterListRoundedIcon sx={{ fontSize: 17, color: "text.secondary" }} />
      <Box component="span" sx={{ fontSize: 12.5, color: "text.secondary", mr: "2px" }}>
        Showing only
      </Box>
      {filters.map((f) => (
        <Box
          key={`${f.kind}:${f.id}`}
          component="span"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            maxWidth: "100%",
            borderRadius: 999,
            bgcolor: "surface.accentSoft",
            border: 1,
            borderColor: (t) => `color-mix(in srgb, ${t.vars.palette.primary.main} 30%, transparent)`,
          }}
        >
          <Tooltip title={`${PICK_KINDS[f.kind].one}: peek at it`}>
            <Box component="button" type="button" sx={chipNameSx} onClick={() => onOpen(f)}>
              {PICK_KINDS[f.kind].icon(15)}
              {pickName(state, f)}
            </Box>
          </Tooltip>
          <Box component="button" type="button" sx={chipRemoveSx} aria-label={`Stop filtering to ${pickName(state, f)}`} onClick={() => onRemove(f)}>
            <CloseRoundedIcon sx={{ fontSize: 14 }} />
          </Box>
        </Box>
      ))}
      {filters.length > 1 ? (
        <Box component="button" type="button" sx={[linkSx, { ml: 0.5, fontSize: 12.5 }]} onClick={onClear}>
          Clear filters
        </Box>
      ) : null}
    </Box>
  );
}

/* A filter's name, which peeks at it. */
const chipNameSx: SystemStyleObject<Theme> = {
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
  minWidth: 0,
  p: "3px 4px 3px 9px",
  border: 0,
  bgcolor: "transparent",
  font: "inherit",
  fontSize: 13,
  fontWeight: 550,
  color: "text.primary",
  textAlign: "left",
  cursor: "pointer",
  "&:hover": { textDecoration: "underline" },
};

/* A filter's ×. */
const chipRemoveSx: SystemStyleObject<Theme> = {
  display: "inline-flex",
  alignItems: "center",
  p: "4px 7px 4px 3px",
  border: 0,
  bgcolor: "transparent",
  color: "text.secondary",
  cursor: "pointer",
  "&:hover": { color: "text.primary" },
};
