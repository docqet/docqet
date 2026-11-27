// docqet:implements capability:improvements
import { useState, type ReactNode } from "react";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import { AreaRows, ImprovementRows, ImprovementsFigure, areasNote, bestStep, improvementWords } from "../../components/improvements/Improvements";
import { ReadinessMark } from "../../components/Readiness";
import { useStatusFor } from "../../model";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { DecisionList, type Go } from "../../components/Fields";
import { NAMES, TECHNICAL_NAMES, plural } from "../../components/names";
import { CapabilityStability } from "../../components/CapabilityLabel";
import Tooltip from "@mui/material/Tooltip";
import { LeftLabel } from "../../components/left/LeftMark";
import { Excerpt, plainText } from "../../components/markdown/Markdown";
import { IMPACT_NAMES, ImpactBadge, JudgementBadge, LIKELIHOOD_NAMES, PartTag, REACH_NAMES, RiskPartIcon } from "../../components/risk/ImpactBadge";
import { GapRiskMark, RiskBars, RiskScore, VERDICT_NAMES } from "../../components/risk/RiskScore";
import { STABILITY } from "../../components/stability/stability";
import { docHref, navigate, sectionHref, withParam, type Route } from "../../routes";
import { Count, Empty, PageHeader, Section, Stat, Tabs, View, currentTab } from "../../components/shell/layout";
import { VERDICTS, bySubject, openDecisions, subjectOf, type DecisionHolder, type DocqetState, type Level, type Verdict } from "../../state";
import {
  PARTS,
  PART_IDS,
  acrossRows,
  filtersFrom,
  holdersIn,
  passes,
  scopeOf,
  useRowsFor,
  type Filters,
  type GapRow,
  type PartId,
  type Scope,
  type ScopeKind,
} from "./components/leftScope";
import { ScopePicker, visuallyHidden } from "./components/ScopePicker";
import { GapInitiatives } from "../../components/risk/GapRows";
import { SubjectLink } from "../../components/SubjectLink";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Skeleton from "@mui/material/Skeleton";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme, type Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import { ReadError, ReadFallback } from "../../components/ReadFallback";
import { menuSlots } from "../../components/shell/ProductFilter";

/*
 * What would make it more ready: its improvements, most first, for
 * everything showing, or for one project, persona, initiative, domain,
 * feature or capability. Then every gap still open and every question still
 * to answer, which is what the improvements are drawn from. Tradeoffs are
 * decided, so they're on the Decided page. Each gap is scored on the
 * capabilities of what's chosen. Gaps can be filtered by each part of the risk model, its
 * verdict, impact, likelihood, reach, stability and whether it breaks a claim,
 * and by kind, and ordered by any of them, riskiest first within each. All of
 * it is in the address, so a view can be linked to.
 */
export default function ImprovementsPage({ state, route }: { state: DocqetState; route: Route }) {
  const go = goFor(state);
  const search = new URLSearchParams(window.location.search);
  const scope = scopeOf(state, search.get("for"));
  const read = useRowsFor(state, scope);
  /* The readiness of what's chosen, with its improvements: everything's from the page, anything else's from the server. */
  const status = useStatusFor(state, scope.kind === "all" ? null : scope.key);
  const readiness = scope.kind === "all" ? state.status.readiness : (status.data?.readiness ?? null);
  /* While another scope's gaps are read, the last ones stay on screen, marked as refreshing. */
  const shown = read.data ?? read.previous;
  const rows = shown ?? [];
  const holders = holdersIn(state, holdersOf(state), scope).filter((h) => openDecisions(h.doc).length);
  const decisions = holders.reduce((n, h) => n + openDecisions(h.doc).length, 0);
  const tabs = [
    { id: "improvements", label: "Improvements", count: readiness ? readiness.areas.length : undefined },
    {
      id: "gaps",
      label: (
        <LeftLabel kind="product-gap" term="gap" size={14} hoverOnly>
          Gaps
        </LeftLabel>
      ),
      count: shown ? rows.length : undefined,
    },
    { id: "decisions", label: <LeftLabel kind="decision" size={14} hoverOnly />, count: decisions },
  ];
  const tab = currentTab(route, tabs);
  /* The improvements by area, or each single step on asking. */
  const oneAtATime = search.get("show") === "steps";
  /* On a phone the picker sits over the name, the width of the page, rather than squeezing the name and its sentence at the right. */
  const phone = useMediaQuery(useTheme().breakpoints.down("sm"), { noSsr: true });
  const picker = <ScopePicker state={state} scope={scope} />;
  return (
    <View title="Improvements" wide>
      <PageHeader
        kind={
          <>
            <TrendingUpRoundedIcon sx={{ fontSize: 16 }} />
            {scope.kind === "all"
              ? `Across ${state.projects.length === 1 ? state.projects[0].name : plural(state.projects.length, "project", "projects")}`
              : `For ${SCOPE_KINDS[scope.kind].toLowerCase()} ${scope.name}`}
          </>
        }
        title="Improvements"
        lede={
          <>
            What would make it more ready, most first, then every gap still open and every question still to answer, riskiest first
            {scope.capabilities ? `, each scored on the ${plural(scope.capabilities.length, "capability", "capabilities")} it's for` : ""}. They&rsquo;re what
            could be done, not a finish line: what&rsquo;s worth doing is yours to judge. What we chose on purpose is under{" "}
            <a href={sectionHref("decided")}>Decided</a>.
          </>
        }
        trail={phone ? picker : undefined}
        actions={phone ? undefined : picker}
        stats={
          <>
            <Stat
              label="Readiness"
              term="readiness"
              value={
                !readiness ? (
                  <Skeleton width={60} />
                ) : readiness.percent === null ? (
                  "Nothing started"
                ) : (
                  <ReadinessMark readiness={readiness} of="Readiness" inButton />
                )
              }
            />
            <Stat
              label="Improvements"
              term="improvement"
              value={!readiness ? <Skeleton width={40} /> : readiness.areas.length ? <ImprovementsFigure readiness={readiness} /> : "None now"}
              note={readiness && bestStep(readiness) ? `Most from ${improvementWords(bestStep(readiness)!)}` : undefined}
              href={withParam("tab", "improvements")}
            />
            <Stat
              wide
              label={
                <LeftLabel kind="product-gap" term="gap" size={13} hoverOnly>
                  Gaps
                </LeftLabel>
              }
              value={shown ? rows.length || "None" : <Skeleton width={40} />}
              note={!shown ? <Skeleton width={160} /> : rows.length ? <GapSpread rows={rows} /> : "Nothing written down to close"}
            />
            <Stat
              label={<LeftLabel kind="decision" size={13} hoverOnly />}
              value={decisions || "None"}
              note={holders.length ? `In ${plural(holders.length, "place", "places")}` : "Nothing waiting on an answer"}
              href={withParam("tab", "decisions")}
            />
          </>
        }
      />
      <Tabs tabs={tabs} current={tab} />
      {tab === "improvements" ? (
        readiness ? (
          oneAtATime ? (
            <Section
              title="One at a time"
              term="improvement"
              count={readiness.improvements.length || undefined}
              note="Each single step by how much it would raise readiness, most first: promoting a capability raises maturity, and closing a gap or answering a rated decision lowers exposure."
              aside={<ShowToggle oneAtATime />}
            >
              <ImprovementRows readiness={readiness} limit={50} />
            </Section>
          ) : (
            <Section
              title={scope.kind === "capability" ? "Steps" : `By ${AREA_LEVELS[scope.kind]}`}
              term="improvement"
              count={readiness.areas.length || undefined}
              note={areasNote(readiness)}
              aside={<ShowToggle oneAtATime={false} />}
            >
              <AreaRows readiness={readiness} limit={50} />
            </Section>
          )
        ) : (
          <ReadFallback read={status} what="the improvements for this scope" skeleton={<Skeleton variant="rounded" height={240} />} />
        )
      ) : tab !== "gaps" ? (
        <DecisionsTab holders={holders} go={go} />
      ) : read.error ? (
        <ReadError what="the gaps for this scope" onRetry={read.retry} />
      ) : shown ? (
        <Box aria-busy={read.loading || undefined} sx={{ position: "relative", opacity: read.loading ? 0.6 : 1, transition: "opacity 150ms" }}>
          {read.loading ? <LinearProgress sx={{ position: "absolute", top: -6, left: 0, right: 0, height: 2 }} /> : null}
          <GapsTab state={state} rows={rows} scope={scope} search={search} />
        </Box>
      ) : (
        <ReadFallback read={read} what="the gaps for this scope" skeleton={<Skeleton variant="rounded" height={240} />} />
      )}
    </View>
  );
}

/* What the areas are, one level below what's chosen. */
const AREA_LEVELS: Record<ScopeKind, string> = {
  all: "domain",
  project: "domain",
  persona: "feature",
  initiative: "feature",
  domain: "feature",
  feature: "capability",
  capability: "step",
};

/* Between the improvements by area and each single step, kept in the address. */
function ShowToggle({ oneAtATime }: { oneAtATime: boolean }) {
  return oneAtATime ? <a href={withParam("show", null)}>By area</a> : <a href={withParam("show", "steps")}>One at a time</a>;
}

/* The gaps' risk spread, under their count: the bar, then how many there are of each risk, each in its color, each showing only those. */
function GapSpread({ rows }: { rows: GapRow[] }) {
  const count = (v: Verdict) => rows.filter((r) => r.verdict === v).length;
  const parts = VERDICTS.filter((v) => count(v));
  return (
    <Box component="span" sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 0.5 }}>
      <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
        <Box component="span" sx={{ typography: "overline", color: "text.disabled" }}>
          Risk spread
        </Box>
        <Box component="span" aria-hidden sx={{ display: "flex", flex: 1, gap: "2px", height: 8, borderRadius: "2px" }}>
          {parts.map((v) => (
            <Box key={v} component="span" sx={{ flexGrow: count(v), minWidth: 4, borderRadius: "2px", bgcolor: VERDICT_COLOR[v] }} />
          ))}
        </Box>
      </Box>
      <Box component="span" sx={{ display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
        {parts.map((v) => (
          <Box
            component="a"
            key={v}
            href={withParam("verdict", v)}
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              fontSize: 12.5,
              color: "text.secondary",
              textDecoration: "none",
              "&:hover": { color: "text.primary" },
              "& strong": { fontWeight: 700, color: VERDICT_COLOR[v] },
            }}
          >
            <RiskBars verdict={v} size="small" />
            <strong>{count(v)}</strong> {VERDICT_NAMES[v].name.toLowerCase()}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/* Each verdict's color: unacceptable the alarm color, tolerable the soft yellow, and acceptable neutral, since it may rightly stay open for good. */
const VERDICT_COLOR: Record<Verdict, string> = { unacceptable: "error.main", tolerable: "impact.inconvenient", acceptable: "text.disabled" };

const SCOPE_KINDS: Record<ScopeKind, string> = {
  all: "Everything",
  project: "Project",
  persona: "Persona",
  initiative: "Initiative",
  domain: "Domain",
  feature: "Feature",
  capability: "Capability",
};

/* ——— Gaps ——— */

/* What each value of a part is called. */
function valueName(part: PartId, value: string): string {
  if (part === "stability" && value === "none") return "No level";
  switch (part) {
    case "verdict":
      return VERDICT_NAMES[value as Verdict].name;
    case "impact":
      return IMPACT_NAMES[value as keyof typeof IMPACT_NAMES].name;
    case "likelihood":
      return LIKELIHOOD_NAMES[value as keyof typeof LIKELIHOOD_NAMES].name;
    case "reach":
      return REACH_NAMES[value as keyof typeof REACH_NAMES].name;
    case "stability":
      return STABILITY[value as Level].name;
    case "claim":
      return value === "breaks" ? "Breaks a claim" : "Keeps its claims";
    case "kind":
      return value === "product" ? "Product" : "Technical";
  }
}

/* How the gaps can be ordered: riskiest first, or grouped by a part of the risk model or by what they're on, riskiest first within each. */
const ORDERS = ["risk", "verdict", "impact", "likelihood", "reach", "stability", "subject"] as const;
type Order = (typeof ORDERS)[number];
const ORDER_NAMES: Record<Order, string> = {
  risk: "Riskiest first",
  verdict: "Risk",
  impact: "Impact",
  likelihood: "Likelihood",
  reach: "Reach",
  stability: "Stability",
  subject: "What it's on",
};

/* The gaps in the scope, filtered as the address says, in its order, as a table with every part of each one's risk. */
function GapsTab({ state, rows, scope, search }: { state: DocqetState; rows: GapRow[]; scope: Scope; search: URLSearchParams }) {
  const filters = filtersFrom(search);
  const order: Order = (ORDERS as readonly string[]).includes(search.get("order") ?? "") ? (search.get("order") as Order) : "risk";
  const shown = rows.filter((r) => passes(r, filters));
  const active = PART_IDS.filter((id) => filters[id]);
  return (
    <>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "10px 24px", mt: -1, mb: 2.5 }}>
        <Box role="group" aria-label="Filters" sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 0.75 }}>
          <Box component="span" sx={{ mr: 0.5, typography: "overline", color: "text.disabled" }}>
            Filter
          </Box>
          {PART_IDS.map((id) => (
            <FilterMenu key={id} part={id} rows={rows} filters={filters} />
          ))}
          {active.length ? (
            <Box component="a" href={clearHref()} sx={{ ml: 0.5, fontSize: 12.5, color: "primary.main" }}>
              Clear filters
            </Box>
          ) : null}
        </Box>
        <OrderMenu order={order} />
        {/* How many the filters leave, said aloud as they change. */}
        <Box component="span" aria-live="polite" sx={visuallyHidden}>
          {active.length ? `${shown.length} of ${plural(rows.length, "gap", "gaps")} match` : plural(rows.length, "gap", "gaps")}
        </Box>
      </Box>
      <Section
        title={`Gaps${scope.capabilities ? ` for ${scope.name}` : ""}`}
        count={shown.length}
        note={
          shown.length
            ? order === "risk"
              ? "Riskiest first. Open a score to see how it's worked out."
              : `By ${ORDER_NAMES[order].toLowerCase()}, worst first, and riskiest first within each. Open a score to see how it's worked out.`
            : undefined
        }
      >
        {!shown.length ? (
          <Empty>{rows.length ? "No gaps match these filters." : "No gaps written down."}</Empty>
        ) : order === "risk" ? (
          <GapTable state={state} rows={shown} first={30} />
        ) : order === "subject" ? (
          bySubject(shown.map((r) => ({ ...r, id: r.gap.id }))).map((g) => (
            <GapGroup
              key={`${g.type}:${g.id}`}
              head={<SubjectLink state={state} type={g.type} id={g.id} withLevel />}
              state={state}
              rows={g.items}
              here={g.id}
            />
          ))
        ) : (
          PARTS[order].values.map((v) => {
            const these = shown.filter((r) => PARTS[order].of(r) === v);
            return these.length ? <GapGroup key={v} head={<GroupHead part={order} value={v} />} state={state} rows={these} /> : null;
          })
        )}
      </Section>
    </>
  );
}

/* The address with every filter cleared, keeping the scope, tab and order. */
function clearHref() {
  const params = new URLSearchParams(window.location.search);
  for (const id of PART_IDS) params.delete(id);
  return `?${params}`;
}

/* A part's filter, as a button saying its value, opening each value with how many gaps it would leave given the other filters. */
function FilterMenu({ part, rows, filters }: { part: PartId; rows: GapRow[]; filters: Filters }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const others = rows.filter((r) => passes(r, filters, part));
  const values = (PARTS[part].values as readonly string[]).filter((v) => v !== "none" || others.some((r) => PARTS[part].of(r) === "none"));
  const value = filters[part];
  return (
    <>
      <Box
        component="button"
        type="button"
        data-on={value ? true : undefined}
        onClick={(e) => setAnchor(e.currentTarget)}
        aria-haspopup="menu"
        aria-expanded={anchor ? true : undefined}
        sx={filterSx}
      >
        {!value && (part === "impact" || part === "likelihood" || part === "reach") ? <RiskPartIcon part={part} size={14} /> : null}
        {PARTS[part].label}
        {value ? <FilterValue part={part} value={value} /> : null}
        <ExpandMoreRoundedIcon aria-hidden sx={{ fontSize: 16 }} />
      </Box>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} slotProps={menuSlots(anchor)}>
        <MenuItem component="a" href={withParam(part, null)} selected={!value} sx={filterItemSx}>
          <span>Any</span>
          <Box component="span" sx={countSx}>
            {others.length}
          </Box>
        </MenuItem>
        {values.map((v) => (
          <MenuItem key={v} component="a" href={withParam(part, v)} selected={value === v} sx={filterItemSx}>
            <FilterValue part={part} value={v} />
            <Box component="span" sx={countSx}>
              {others.filter((r) => PARTS[part].of(r) === v).length}
            </Box>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

/* A filter or the order: what it is, then its value where one is chosen, lit in the accent while a value is. */
const filterSx: SystemStyleObject<Theme> = {
  display: "inline-flex",
  alignItems: "center",
  gap: 0.75,
  py: "3px",
  pr: 0.75,
  pl: 1.25,
  font: "inherit",
  fontSize: 12.5,
  fontWeight: 600,
  color: "text.secondary",
  bgcolor: "transparent",
  border: 1,
  borderColor: "surface.borderStrong",
  borderRadius: "6px",
  cursor: "pointer",
  "&:hover": { color: "text.primary", borderColor: "text.disabled" },
  "& strong": { fontWeight: 650, color: "text.primary" },
  "&[data-on]": {
    color: "primary.main",
    bgcolor: "surface.accentSoft",
    borderColor: (t) => `color-mix(in srgb, ${t.vars.palette.primary.main} 45%, transparent)`,
    "& strong": { color: "primary.main" },
  },
};

/* A value in a filter's menu, with how many gaps it would leave at the right. */
const filterItemSx: SystemStyleObject<Theme> = { justifyContent: "space-between", gap: 2, minWidth: 200 };

const countSx: SystemStyleObject<Theme> = { fontSize: 11, fontVariantNumeric: "tabular-nums", color: "text.disabled" };

/* A value in a filter's menu or a group's heading, in its color where it has one. */
function FilterValue({ part, value }: { part: PartId; value: string }) {
  if (part === "verdict")
    return (
      /* Acceptable's name stays in the text's color, since its own is faint. */
      <Box
        component="span"
        sx={{
          flex: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 0.75,
          fontWeight: 650,
          lineHeight: "16px",
          whiteSpace: "nowrap",
          fontVariantNumeric: "tabular-nums",
          color: value === "acceptable" ? "text.primary" : VERDICT_COLOR[value as Verdict],
        }}
      >
        <RiskBars verdict={value as Verdict} size="small" />
        {valueName(part, value)}
      </Box>
    );
  if (part === "impact" || part === "likelihood" || part === "reach") return <PartTag part={part} value={value} />;
  if (part === "claim")
    return (
      <Box component="span" sx={value === "breaks" ? { fontWeight: 600, color: "warning.main" } : undefined}>
        {valueName(part, value)}
      </Box>
    );
  if (part === "stability" && value !== "none")
    return (
      <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
        <CapabilityStability level={value as Level} name={valueName(part, value)} focusable={false} />
        {valueName(part, value)}
      </Box>
    );
  return <span>{valueName(part, value)}</span>;
}

/* The order, as a button saying it, opening each order there is. */
function OrderMenu({ order }: { order: Order }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return (
    <>
      <Box
        component="button"
        type="button"
        onClick={(e) => setAnchor(e.currentTarget)}
        aria-haspopup="menu"
        aria-expanded={anchor ? true : undefined}
        sx={filterSx}
      >
        Order by
        <strong>{ORDER_NAMES[order]}</strong>
        <ExpandMoreRoundedIcon aria-hidden sx={{ fontSize: 16 }} />
      </Box>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)} slotProps={menuSlots(anchor)}>
        {ORDERS.map((o) => (
          <MenuItem key={o} component="a" href={withParam("order", o === "risk" ? null : o)} selected={o === order}>
            {ORDER_NAMES[o]}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

/* A group's heading: its value, in its color where it has one. */
function GroupHead({ part, value }: { part: PartId; value: string }) {
  return (
    <Box component="span" sx={{ fontWeight: 650 }}>
      <FilterValue part={part} value={value} />
    </Box>
  );
}

/* A group of gaps under a heading, with how many and how they spread, its first few, then the rest on asking. */
function GapGroup({ head, state, rows, here }: { head: ReactNode; state: DocqetState; rows: GapRow[]; here?: string }) {
  return (
    <Box sx={groupSx}>
      <Box component="header" sx={groupHeadSx}>
        {head}
        <Count n={rows.length} />
        {rows.length > 1 ? (
          <Box component="span" sx={{ ml: "auto" }}>
            <RiskScore risk={acrossRows(rows)} of="this group" />
          </Box>
        ) : null}
      </Box>
      <GapTable state={state} rows={rows} first={8} here={here} bare />
    </Box>
  );
}

/*
 * Gaps as a table: each one's risk there, opening how it's worked out, its
 * impact, likelihood and reach, the stability of the capability it scores
 * highest on, its kind and name, whether it breaks a claim, and what it's
 * on. The first `first`, then the rest on asking.
 */
function GapTable({ state, rows, first, here, bare = false }: { state: DocqetState; rows: GapRow[]; first: number; here?: string; bare?: boolean }) {
  return (
    <Box
      role="table"
      aria-label="Gaps"
      sx={[
        { position: "relative", overflow: "hidden", bgcolor: "background.paper", "& > [role=row] + [role=row]": { borderTop: 1, borderColor: "divider" } },
        !bare && cardSx,
      ]}
    >
      <Box role="row" sx={[trSx, thSx]}>
        <span role="columnheader">Risk</span>
        <span role="columnheader">
          <RiskPartIcon part="impact" size={13} />
          Impact
        </span>
        <span role="columnheader">
          <RiskPartIcon part="likelihood" size={13} />
          Likelihood
        </span>
        <span role="columnheader">
          <RiskPartIcon part="reach" size={13} />
          Reach
        </span>
        <span role="columnheader">Stability</span>
        <span role="columnheader">Gap</span>
        <span role="columnheader">On</span>
      </Box>
      <ShowFirst n={first} total={rows.length} more="gaps">
        {(n) => rows.slice(0, n).map((r) => <GapLine key={r.gap.id} state={state} row={r} here={here} />)}
      </ShowFirst>
    </Box>
  );
}

/*
 * A row of the table: on a desktop, a column for each part; from a tablet
 * down, the marks on one line over the gap and what it's on; on a phone,
 * the marks wrap.
 */
const trSx: SystemStyleObject<Theme> = {
  display: { xs: "flex", sm: "grid" },
  flexWrap: "wrap",
  gridTemplateColumns: { sm: "58px repeat(4, auto) minmax(0, 1fr)", md: "58px 124px 100px 64px 76px minmax(0, 1fr) minmax(0, 220px)" },
  alignItems: "center",
  columnGap: { xs: 1, sm: 1.5 },
  rowGap: { xs: 0.5, md: 1.5 },
  py: "7px",
  px: 1.75,
  fontSize: 13.5,
  /* Every cell is a span, so these are the impact, likelihood and reach. */
  "& > :nth-of-type(2), & > :nth-of-type(3), & > :nth-of-type(4)": { justifySelf: "start" },
};

/* The headings: small, uppercase and faint; from a tablet down, where the columns go, for screen readers only. */
const thSx = (t: Theme): SystemStyleObject<Theme> => ({
  py: 1,
  fontSize: 11,
  fontWeight: 650,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "text.disabled",
  "& > span": { display: "inline-flex", alignItems: "center", gap: "5px" },
  [t.breakpoints.down("md")]: visuallyHidden,
});

function GapLine({ state, row: r, here }: { state: DocqetState; row: GapRow; here?: string }) {
  const { type, id } = subjectOf(r.gap);
  return (
    <Box role="row" sx={[trSx, { "&:hover": { bgcolor: (t) => `color-mix(in srgb, ${t.vars.palette.text.primary} 2.5%, transparent)` } }]}>
      <span role="cell">
        <GapRiskMark risk={r.risk} on={r.on} />
      </span>
      <span role="cell">
        <ImpactBadge impact={r.impact} eyebrow="What's at stake in this gap" inButton />
      </span>
      <span role="cell">
        <JudgementBadge part="likelihood" value={r.likelihood} inButton />
      </span>
      <span role="cell">
        <JudgementBadge part="reach" value={r.reach} inButton />
      </span>
      <span role="cell">
        {r.on ? (
          <CapabilityStability level={r.on.capability.stability} name={r.on.capability.name} focusable={false} />
        ) : (
          <Box component="span" sx={{ color: "text.disabled" }}>
            –
          </Box>
        )}
      </span>
      <Box
        component="span"
        role="cell"
        sx={{ display: "flex", flexDirection: "column", minWidth: 0, flexBasis: "100%", gridColumn: { sm: "1 / -1", md: "auto" } }}
      >
        <Tooltip title={plainText(r.gap.description)}>
          <Box
            component="a"
            href={docHref("gap", r.gap.id)}
            sx={{ minWidth: 0, color: "text.primary", textDecoration: "none", "&:hover": { color: "primary.main" } }}
          >
            <Excerpt text={r.gap.name} lines={1} />
          </Box>
        </Tooltip>
        <Box component="span" sx={{ display: "inline-flex", gap: 1, fontSize: 11.5, color: "text.disabled" }}>
          <span>{r.kind === "technical" ? "Technical" : "Product"}</span>
          {r.claim ? (
            <Box component="span" sx={{ fontWeight: 600, color: "warning.main" }}>
              Breaks a claim
            </Box>
          ) : null}
        </Box>
      </Box>
      {/* What it's on, and its initiatives, quieter here and lined up at the right. */}
      <Box
        component="span"
        role="cell"
        sx={{
          minWidth: 0,
          flexBasis: "100%",
          gridColumn: { sm: "1 / -1", md: "auto" },
          overflow: "hidden",
          fontSize: 12.5,
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          textAlign: { xs: "left", md: "right" },
        }}
      >
        {here === id ? null : <SubjectLink state={state} type={type} id={id} quiet />}
        <GapInitiatives state={state} gap={r.gap} />
      </Box>
    </Box>
  );
}

/* ——— Open decisions ——— */

/* Open decisions, by the kind of doc they're held on, then by doc. */
function DecisionsTab({ holders, go }: { holders: DecisionHolder[]; go: Go }) {
  if (!holders.length) return <Empty>No open decisions written down.</Empty>;
  return (
    <>
      <Box component="p" sx={introSx}>
        Questions about what's intended that nobody has answered yet. Answering one deletes it, and the answer is written as whatever it became.
      </Box>
      <HolderGroups
        state={go.state}
        holders={holders}
        count={(h) => openDecisions(h.doc).length}
        render={(h) =>
          h.doc.from.map((f, i) => {
            const open = f.decisions ?? [];
            return open.length ? <DecisionList key={i} from={f} decisions={open} go={go} /> : null;
          })
        }
      />
    </>
  );
}

/* ——— Shared with the Decided page ——— */

/* A line under the tabs saying what a tab holds. */
export const introSx: SystemStyleObject<Theme> = { maxWidth: 760, mt: -1, mb: 2.5, fontSize: 13.5, color: "text.secondary" };

/* A card: on the paper, ruled, with rounder corners than MUI's Card. */
export const cardSx: SystemStyleObject<Theme> = { bgcolor: "background.paper", border: 1, borderColor: "divider", borderRadius: "10px" };

/* A group of rows under what they're on, in a card of its own. */
export const groupSx: SystemStyleObject<Theme> = { ...cardSx, mb: 1.5, overflow: "hidden" };

/* A group's heading: what they're on, how many, and anything else at the right, on a faint band. */
export const groupHeadSx: SystemStyleObject<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: "4px 10px",
  px: 1.75,
  py: 1.25,
  bgcolor: (t) => `color-mix(in srgb, ${t.vars.palette.text.primary} 2.5%, transparent)`,
  borderBottom: 1,
  borderColor: "divider",
};

/* Links in Markdown, such as a concept's, open its page. */
export const goFor = (state: DocqetState): Go => ({
  state,
  onConcept: (id) => navigate(docHref("concept", id)),
  onPick: (pick) => navigate(docHref(pick.kind, pick.id)),
});

/* Every doc that can hold decisions, by kind, in the spec's order. */
export function holdersOf(state: DocqetState): DecisionHolder[] {
  return [
    ...state.domains.map((doc) => ({ kind: "domain" as const, doc })),
    ...state.features.map((doc) => ({ kind: "feature" as const, doc })),
    ...state.capabilities.map((doc) => ({ kind: "capability" as const, doc })),
    ...state.mechanisms.map((doc) => ({ kind: "mechanism" as const, doc })),
    ...state.components.map((doc) => ({ kind: "component" as const, doc })),
  ];
}

const HOLDER_KINDS = ["domain", "feature", "capability", "mechanism", "component"] as const;
const KIND_NAMES = { ...NAMES, ...TECHNICAL_NAMES };

/* Decisions grouped by where they're held: a section per kind of doc, a card per doc, linking to its page. */
export function HolderGroups({
  state,
  holders,
  count,
  render,
}: {
  state: DocqetState;
  holders: DecisionHolder[];
  count: (h: DecisionHolder) => number;
  render: (h: DecisionHolder) => ReactNode;
}) {
  return HOLDER_KINDS.map((kind) => {
    const of = holders.filter((h) => h.kind === kind);
    if (!of.length) return null;
    return (
      <Section key={kind} title={`On ${KIND_NAMES[kind].many.toLowerCase()}`} count={of.reduce((n, h) => n + count(h), 0)}>
        <Box sx={cardSx}>
          {of.map((h) => (
            <Box key={h.doc.id} sx={{ px: 2, py: 1.75, "& + &": { borderTop: 1, borderColor: "divider" } }}>
              <Box component="header" sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 10px", mb: 1.25, fontSize: 14 }}>
                <SubjectLink state={state} type={h.kind} id={h.doc.id} withLevel />
              </Box>
              {render(h)}
            </Box>
          ))}
        </Box>
      </Section>
    );
  });
}

/* A long list cut short: its first `n`, then a button for the rest. `inline` is the smaller button under a group. */
export function ShowFirst({
  n,
  total,
  more,
  inline = false,
  children,
}: {
  n: number;
  total: number;
  more: string;
  inline?: boolean;
  children: (shown: number) => ReactNode;
}) {
  const [all, setAll] = useState(false);
  const shown = all ? total : Math.min(n, total);
  return (
    <>
      {children(shown)}
      {shown < total ? (
        <Box component="button" type="button" onClick={() => setAll(true)} sx={[moreSx, inline && moreInlineSx]}>
          {inline ? `${total - shown} ${more}` : `Show all ${total} ${more}`}
        </Box>
      ) : null}
    </>
  );
}

/* The rest of a long list, on asking: a dashed button the width of the list. */
const moreSx: SystemStyleObject<Theme> = {
  display: "block",
  width: "100%",
  mt: 1.25,
  p: 1,
  font: "inherit",
  fontSize: 13,
  fontWeight: 600,
  color: "primary.main",
  bgcolor: "transparent",
  border: "1px dashed",
  borderColor: "surface.borderStrong",
  borderRadius: "8px",
  cursor: "pointer",
  "&:hover": { bgcolor: "surface.accentSoft" },
};

/* Under a group's few: a quiet line inside its card, lined up with the rows' text on a wider screen. */
const moreInlineSx: SystemStyleObject<Theme> = {
  m: 0,
  pt: "7px",
  pr: 1.75,
  pb: "9px",
  pl: { xs: 1.75, sm: "138px" },
  textAlign: "left",
  fontSize: 12.5,
  border: 0,
  borderTop: 1,
  borderColor: "divider",
  borderRadius: 0,
};
