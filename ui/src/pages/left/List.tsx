import { useState, type ReactNode } from "react";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { DecisionList, type Go } from "../../components/Fields";
import { NAMES, TECHNICAL_NAMES, plural } from "../../components/names";
import { CapabilityStability } from "../../components/CapabilityLabel";
import Tooltip from "@mui/material/Tooltip";
import { GapIcon, LeftLabel } from "../../components/left/LeftMark";
import { Excerpt, plainText } from "../../components/markdown/Markdown";
import { IMPACT_NAMES, ImpactBadge, JudgementBadge, LIKELIHOOD_NAMES, PartTag, REACH_NAMES, RiskPartIcon } from "../../components/risk/ImpactBadge";
import { GapRiskMark, RiskBars, RiskScore, VERDICT_NAMES } from "../../components/risk/RiskScore";
import { STABILITY } from "../../components/stability/stability";
import { docHref, navigate, sectionHref, withParam, type Route } from "../../routes";
import { Empty, PageHeader, Section, Stat, Tabs, View, currentTab } from "../../components/shell/layout";
import { VERDICTS, bySubject, openDecisions, subjectOf, type DecisionHolder, type DocketState, type Level, type Verdict } from "../../state";
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
import { ScopePicker } from "./components/ScopePicker";
import "../left.css";
import { GapInitiatives } from "../../components/risk/GapRows";
import { SubjectLink } from "../../components/SubjectLink";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Skeleton from "@mui/material/Skeleton";
import { ReadError, ReadFallback } from "../../components/ReadFallback";

/*
 * What's left to do, and what matters most: the gaps to close and the
 * questions still open, and nothing else. Tradeoffs are decided, so they're
 * on the Decided page. It's for everything showing, or for one project,
 * persona, domain, feature or capability, each gap scored on that one's
 * capabilities. Gaps can be filtered by each part of the risk model, its
 * verdict, impact, likelihood, reach, stability and whether it breaks a claim,
 * and by kind, and ordered by any of them, riskiest first within each. All of
 * it is in the address, so a view can be linked to.
 */
export default function LeftPage({ state, route }: { state: DocketState; route: Route }) {
  const go = goFor(state);
  const search = new URLSearchParams(window.location.search);
  const scope = scopeOf(state, search.get("for"));
  const read = useRowsFor(state, scope);
  /* While another scope's gaps are read, the last ones stay on screen, marked as refreshing. */
  const shown = read.data ?? read.previous;
  const rows = shown ?? [];
  const holders = holdersIn(state, holdersOf(state), scope).filter((h) => openDecisions(h.doc).length);
  const decisions = holders.reduce((n, h) => n + openDecisions(h.doc).length, 0);
  const tabs = [
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
  return (
    <View title="What's left" wide>
      <PageHeader
        kind={
          <>
            <GapIcon sx={{ fontSize: 16 }} />
            {scope.kind === "all"
              ? `Across ${state.projects.length === 1 ? state.projects[0].name : plural(state.projects.length, "project", "projects")}`
              : `For ${SCOPE_KINDS[scope.kind].toLowerCase()} ${scope.name}`}
          </>
        }
        title="What's left"
        lede={
          <>
            The gaps still to close and the questions still to answer, riskiest first
            {scope.capabilities ? `, each scored on the ${plural(scope.capabilities.length, "capability", "capabilities")} it's for` : ""}. What we chose on
            purpose isn't left to do: it's under <a href={sectionHref("decided")}>Decided</a>.
          </>
        }
        actions={<ScopePicker state={state} scope={scope} />}
        stats={
          <>
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
      {tab !== "gaps" ? (
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

/* The gaps' risk spread, under their count: the bar, then how many there are of each risk, each in its color, each showing only those. */
function GapSpread({ rows }: { rows: GapRow[] }) {
  const count = (v: Verdict) => rows.filter((r) => r.verdict === v).length;
  const parts = VERDICTS.filter((v) => count(v));
  return (
    <span className="lf-gap-spread">
      <span className="lf-gap-spread-bar">
        <span className="lf-spread-label">Risk spread</span>
        <span className="verdict-spread-bar wide" aria-hidden>
          {parts.map((v) => (
            <span key={v} data-verdict={v} style={{ flexGrow: count(v) }} />
          ))}
        </span>
      </span>
      <span className="lf-gap-spread-counts">
        {parts.map((v) => (
          <a key={v} href={withParam("verdict", v)} data-verdict={v}>
            <RiskBars verdict={v} size="small" />
            <strong>{count(v)}</strong> {VERDICT_NAMES[v].name.toLowerCase()}
          </a>
        ))}
      </span>
    </span>
  );
}

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
function GapsTab({ state, rows, scope, search }: { state: DocketState; rows: GapRow[]; scope: Scope; search: URLSearchParams }) {
  const filters = filtersFrom(search);
  const order: Order = (ORDERS as readonly string[]).includes(search.get("order") ?? "") ? (search.get("order") as Order) : "risk";
  const shown = rows.filter((r) => passes(r, filters));
  const active = PART_IDS.filter((id) => filters[id]);
  return (
    <>
      <div className="lf-toolbar">
        <div className="lf-filter-row" role="group" aria-label="Filters">
          <span className="lf-choice-label">Filter</span>
          {PART_IDS.map((id) => (
            <FilterMenu key={id} part={id} rows={rows} filters={filters} />
          ))}
          {active.length ? (
            <a className="lf-clear" href={clearHref()}>
              Clear filters
            </a>
          ) : null}
        </div>
        <OrderMenu order={order} />
      </div>
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
      <button type="button" className="lf-filter" data-on={value ? true : undefined} onClick={(e) => setAnchor(e.currentTarget)} aria-haspopup="menu">
        {!value && (part === "impact" || part === "likelihood" || part === "reach") ? <RiskPartIcon part={part} size={14} /> : null}
        {PARTS[part].label}
        {value ? <FilterValue part={part} value={value} /> : null}
        <ExpandMoreRoundedIcon sx={{ fontSize: 16 }} />
      </button>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        slotProps={{ paper: { className: "project-menu" }, list: { className: "project-menu-list" } }}
      >
        <MenuItem component="a" href={withParam(part, null)} selected={!value} className="project-menu-item lf-filter-item">
          <span>Any</span>
          <span className="lf-choice-count">{others.length}</span>
        </MenuItem>
        {values.map((v) => (
          <MenuItem key={v} component="a" href={withParam(part, v)} selected={value === v} className="project-menu-item lf-filter-item">
            <FilterValue part={part} value={v} />
            <span className="lf-choice-count">{others.filter((r) => PARTS[part].of(r) === v).length}</span>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

/* A value in a filter's menu or a group's heading, in its color where it has one. */
function FilterValue({ part, value }: { part: PartId; value: string }) {
  if (part === "verdict")
    return (
      <span className="lf-verdict-value risk-score" data-verdict={value}>
        <RiskBars verdict={value as Verdict} size="small" />
        {valueName(part, value)}
      </span>
    );
  if (part === "impact" || part === "likelihood" || part === "reach") return <PartTag part={part} value={value} />;
  if (part === "claim")
    return (
      <span className="lf-claim-value" data-breaks={value === "breaks" || undefined}>
        {valueName(part, value)}
      </span>
    );
  if (part === "stability" && value !== "none")
    return (
      <span className="lf-level-value">
        <CapabilityStability level={value as Level} name={valueName(part, value)} focusable={false} />
        {valueName(part, value)}
      </span>
    );
  return <span>{valueName(part, value)}</span>;
}

/* The order, as a button saying it, opening each order there is. */
function OrderMenu({ order }: { order: Order }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return (
    <>
      <button type="button" className="lf-filter" onClick={(e) => setAnchor(e.currentTarget)} aria-haspopup="menu">
        Order by
        <strong>{ORDER_NAMES[order]}</strong>
        <ExpandMoreRoundedIcon sx={{ fontSize: 16 }} />
      </button>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        slotProps={{ paper: { className: "project-menu" }, list: { className: "project-menu-list" } }}
      >
        {ORDERS.map((o) => (
          <MenuItem key={o} component="a" href={withParam("order", o === "risk" ? null : o)} selected={o === order} className="project-menu-item">
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
    <span className="lf-group-value">
      <FilterValue part={part} value={value} />
    </span>
  );
}

/* A group of gaps under a heading, with how many and how they spread, its first few, then the rest on asking. */
function GapGroup({ head, state, rows, here }: { head: ReactNode; state: DocketState; rows: GapRow[]; here?: string }) {
  return (
    <div className="lf-card lf-group">
      <header className="lf-group-head">
        {head}
        <span className="view-section-count">{rows.length}</span>
        {rows.length > 1 ? (
          <span className="lf-group-risk">
            <RiskScore risk={acrossRows(rows)} of="this group" />
          </span>
        ) : null}
      </header>
      <GapTable state={state} rows={rows} first={8} here={here} />
    </div>
  );
}

/*
 * Gaps as a table: each one's risk there, opening how it's worked out, its
 * impact, likelihood and reach, the stability of the capability it scores
 * highest on, its kind and name, whether it breaks a claim, and what it's
 * on. The first `first`, then the rest on asking.
 */
function GapTable({ state, rows, first, here }: { state: DocketState; rows: GapRow[]; first: number; here?: string }) {
  return (
    <div className="lf-table" role="table">
      <div className="lf-tr lf-th" role="row">
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
      </div>
      <ShowFirst n={first} total={rows.length} more="gaps">
        {(n) => rows.slice(0, n).map((r) => <GapLine key={r.gap.id} state={state} row={r} here={here} />)}
      </ShowFirst>
    </div>
  );
}

function GapLine({ state, row: r, here }: { state: DocketState; row: GapRow; here?: string }) {
  const { type, id } = subjectOf(r.gap);
  return (
    <div className="lf-tr" role="row">
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
        {r.on ? <CapabilityStability level={r.on.capability.stability} name={r.on.capability.name} focusable={false} /> : <span className="lf-default">–</span>}
      </span>
      <span role="cell" className="lf-gap">
        <Tooltip title={plainText(r.gap.description)}>
          <a className="lf-gap-name" href={docHref("gap", r.gap.id)}>
            <Excerpt text={r.gap.name} lines={1} />
          </a>
        </Tooltip>
        <span className="lf-gap-tags">
          <span>{r.kind === "technical" ? "Technical" : "Product"}</span>
          {r.claim ? <span className="lf-claim">Breaks a claim</span> : null}
        </span>
      </span>
      <span role="cell" className="lf-on">
        {here === id ? null : <SubjectLink state={state} type={type} id={id} />}
        <GapInitiatives state={state} gap={r.gap} />
      </span>
    </div>
  );
}

/* ——— Open decisions ——— */

/* Open decisions, by the kind of doc they're held on, then by doc. */
function DecisionsTab({ holders, go }: { holders: DecisionHolder[]; go: Go }) {
  if (!holders.length) return <Empty>No open decisions written down.</Empty>;
  return (
    <>
      <p className="lf-intro">
        Questions about what's intended that nobody has answered yet. Answering one deletes it, and the answer is written as whatever it became.
      </p>
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

/* Links in Markdown, such as a concept's, open its page. */
export const goFor = (state: DocketState): Go => ({
  state,
  onConcept: (id) => navigate(docHref("concept", id)),
  onPick: (pick) => navigate(docHref(pick.kind, pick.id)),
});

/* Every doc that can hold decisions, by kind, in the spec's order. */
export function holdersOf(state: DocketState): DecisionHolder[] {
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
  state: DocketState;
  holders: DecisionHolder[];
  count: (h: DecisionHolder) => number;
  render: (h: DecisionHolder) => ReactNode;
}) {
  return HOLDER_KINDS.map((kind) => {
    const of = holders.filter((h) => h.kind === kind);
    if (!of.length) return null;
    return (
      <Section key={kind} title={`On ${KIND_NAMES[kind].many.toLowerCase()}`} count={of.reduce((n, h) => n + count(h), 0)}>
        <div className="lf-card">
          {of.map((h) => (
            <div key={h.doc.id} className="lf-holder">
              <header className="lf-holder-head">
                <SubjectLink state={state} type={h.kind} id={h.doc.id} withLevel />
              </header>
              {render(h)}
            </div>
          ))}
        </div>
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
        <button type="button" className={inline ? "lf-more lf-more-inline" : "lf-more"} onClick={() => setAll(true)}>
          {inline ? `${total - shown} ${more}` : `Show all ${total} ${more}`}
        </button>
      ) : null}
    </>
  );
}
