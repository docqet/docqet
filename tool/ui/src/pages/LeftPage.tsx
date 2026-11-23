import { useState, type ReactNode } from "react";
import { DecisionList, type Go } from "../Fields";
import { NAMES, TECHNICAL_NAMES, plural } from "../Explore";
import { DomainIcon } from "../FeatureMap";
import { CapabilityStability } from "../design/catalog/CapabilityLabel";
import { GapIcon, LeftLabel, gapKind } from "../design/left/LeftMark";
import { IMPACT_NAMES, impactCounts } from "../design/risk/ImpactBadge";
import { docHref, navigate, sectionHref, withParam, type DocKind, type Route } from "../routes";
import { Empty, PageHeader, Section, Stat, Tabs, View, currentTab } from "../shell/layout";
import {
  IMPACTS,
  
  find,
  gapsById,
  inRiskOrder,
  openDecisions,
  riskOf,
  riskAcross,
  subjectOf,
  technicalDoc,
  type Capability,
  type DecisionHolder,
  type Doc,
  type DocketState,
  type Gap,
  
} from "../state";
import "./left.css";
import { RiskScore } from "../design/risk/RiskScore";
import { GapRows } from "../GapRows";

/*
 * What's left to do, and what matters most: the gaps to close and the
 * questions still open, and nothing else. Tradeoffs are decided, so they're
 * on the Decided page. Gaps are riskiest first, in one list cut short at
 * first, or grouped by what they're on; which kind, which impact and which
 * order are in the address, so a view of them can be linked to.
 */
export default function LeftPage({ state, route }: { state: DocketState; route: Route }) {
  const go = goFor(state);
  const product = state.gaps.filter((g) => gapKind(g) === "product-gap").length;
  const unrated = state.gaps.filter((g) => !g.impact).length;
  const holders = holdersOf(state).filter((h) => openDecisions(h.doc).length);
  const decisions = holders.reduce((n, h) => n + openDecisions(h.doc).length, 0);
  const tabs = [
    { id: "gaps", label: <LeftLabel kind="product-gap" term="gap" size={14} hoverOnly>Gaps</LeftLabel>, count: state.gaps.length },
    { id: "decisions", label: <LeftLabel kind="decision" size={14} hoverOnly />, count: decisions },
  ];
  const tab = currentTab(route, tabs);
  return (
    <View title="What's left">
      <PageHeader
        kind={
          <>
            <GapIcon sx={{ fontSize: 16 }} />
            Across {state.projects.length === 1 ? state.projects[0].name : plural(state.projects.length, "project", "projects")}
          </>
        }
        title="What's left"
        lede={
          <>
            The gaps still to close and the questions still to answer, riskiest first. What we chose on purpose isn't left to do: it's under{" "}
            <a href={sectionHref("decided")}>Decided</a>.
          </>
        }
        stats={
          <>
            {IMPACTS.map((i) => (
              <Stat
                key={i}
                label={IMPACT_NAMES[i].name}
                value={<ImpactValue impact={i} n={state.gaps.filter((g) => g.impact === i).length} />}
                note={`Gaps that lose ${IMPACT_NAMES[i].lost}`}
                href={sectionHref("left", { impact: i })}
              />
            ))}
            {unrated ? <Stat label="Not rated" value={unrated} note="Gaps nobody has given an impact" href={sectionHref("left", { impact: "none" })} /> : null}
            <Stat
              label={<LeftLabel kind="decision" size={13} hoverOnly />}
              value={decisions || "None"}
              note={holders.length ? `In ${plural(holders.length, "place", "places")}` : "Nothing waiting on an answer"}
              href={sectionHref("left", { tab: "decisions" })}
            />
            <Stat label={<LeftLabel kind="product-gap" size={13} hoverOnly />} value={product || "None"} note="What someone using it would notice" href={sectionHref("left", { kind: "product" })} />
            <Stat
              label={<LeftLabel kind="technical-gap" size={13} hoverOnly />}
              value={state.gaps.length - product || "None"}
              note="What only someone working on the code would"
              href={sectionHref("left", { kind: "technical" })}
            />
          </>
        }
      />
      <Tabs tabs={tabs} current={tab} />
      {tab === "gaps" ? <GapsTab state={state} /> : <DecisionsTab holders={holders} go={go} />}
    </View>
  );
}

/* A count of gaps in its impact's color. */
function ImpactValue({ impact, n }: { impact: string; n: number }) {
  return (
    <span className="lf-impact-value" data-impact={n ? impact : "none"}>
      {n || "None"}
    </span>
  );
}

/* ——— Gaps ——— */

type Kind = "all" | "product" | "technical";


/* Every gap, filtered by kind and impact as the address says, riskiest first or grouped by what each is on. */
function GapsTab({ state }: { state: DocketState }) {
  const kind = (param("kind") ?? "all") as Kind;
  const impact = param("impact");
  const order = param("order") === "subject" ? "subject" : "risk";
  const ofKind = state.gaps.filter((g) => kind === "all" || (kind === "technical") === (gapKind(g) === "technical-gap"));
  const gaps = inRiskOrder(
    state,
    ofKind.filter((g) => !impact || (impact === "none" ? !g.impact : g.impact === impact)),
    (g) => g,
  );
  const product = state.gaps.filter((g) => gapKind(g) === "product-gap").length;
  const unrated = ofKind.filter((g) => !g.impact).length;
  return (
    <>
      <div className="lf-filters">
        <Choice
          label="Kind"
          param="kind"
          value={kind}
          options={[
            ["all", "All", state.gaps.length],
            ["product", "Product", product],
            ["technical", "Technical", state.gaps.length - product],
          ]}
        />
        <Choice
          label="Impact"
          param="impact"
          value={impact ?? "any"}
          options={[
            ["any", "Any", ofKind.length],
            ...IMPACTS.map((i) => [i, IMPACT_NAMES[i].name, ofKind.filter((g) => g.impact === i).length] as [string, string, number]),
            ...(unrated ? [["none", "Not rated", unrated] as [string, string, number]] : []),
          ]}
        />
        <Choice
          label="Order"
          param="order"
          value={order}
          options={[
            ["risk", "By impact"],
            ["subject", "Grouped by what it's on"],
          ]}
        />
      </div>
      <Section
        title={order === "risk" ? "By impact" : "By what they're on"}
        count={gaps.length}
        note={
          gaps.length
            ? `${impactCounts(gaps)}. ${
                order === "risk"
                  ? "Worst first. The milder ones are folded; open a gap for all it says."
                  : "The one with the riskiest gap first, and each one's gaps riskiest first."
              }`
            : undefined
        }
      >
        {!gaps.length ? (
          <Empty>{state.gaps.length ? "No gaps match." : "No gaps written down."}</Empty>
        ) : order === "risk" ? (
          <GapRows state={state} rows={gaps.map((gap) => ({ gap }))} allOpen={!!impact} />
        ) : (
          bySubject(gaps).map((g) => <GapGroup key={`${g.type}:${g.id}`} state={state} type={g.type} id={g.id} gaps={g.items} />)
        )}
      </Section>
    </>
  );
}

/* What's on one thing, its riskiest few, then the rest on asking. */
function GapGroup({ state, type, id, gaps }: { state: DocketState; type: string; id: string; gaps: Gap[] }) {
  return (
    <div className="lf-card lf-group">
      <header className="lf-group-head">
        <SubjectLink state={state} type={type} id={id} withLevel />
        <span className="view-section-count">{gaps.length}</span>
        {type !== "capability" ? <span className="lf-faint">On {plural(riskOf(state, gaps[0]).capabilities, "capability", "capabilities")}</span> : null}
        <span className="lf-group-risk">
          <RiskScore risk={riskAcross(state, gaps)} of="these gaps" />
        </span>
      </header>
      <ShowFirst n={3} total={gaps.length} more="more" inline>
        {(shown) => (
          <GapRows state={state} rows={gaps.slice(0, shown).map((gap) => ({ gap }))} here={{ id }} grouped={false} />
        )}
      </ShowFirst>
    </div>
  );
}



/* ——— Open decisions ——— */

/* Open decisions, by the kind of doc they're held on, then by doc, the one with the riskiest gap riding on it first. */
function DecisionsTab({ holders, go }: { holders: DecisionHolder[]; go: Go }) {
  if (!holders.length) return <Empty>No open decisions written down.</Empty>;
  const risk = (h: DecisionHolder) => riskAcross(go.state, gapsById(go.state, openDecisions(h.doc).flatMap((d) => d.riding ?? []))).score ?? -1;
  return (
    <>
      <p className="lf-intro">
        Questions about what's intended that nobody has answered yet. A decision has no risk of its own: where gaps ride on one, it shows the riskiest of them.
      </p>
      <HolderGroups
        state={go.state}
        holders={[...holders].sort((a, b) => risk(b) - risk(a))}
        count={(h) => openDecisions(h.doc).length}
        render={(h) =>
          h.doc.from.map((f, i) => {
            const open = (f.decisions ?? []).filter((d) => d.status !== "closed");
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

/* A param in the address, such as a filter. */
export const param = (key: string) => new URLSearchParams(window.location.search).get(key);

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

/* Gaps or tradeoffs grouped by what they're on, in the order they come, so a list in risk order gives groups with the riskiest first. */
export function bySubject<T extends { id: string }>(items: T[]): { type: string; id: string; items: T[] }[] {
  const groups = new Map<string, { type: string; id: string; items: T[] }>();
  for (const item of items) {
    const on = subjectOf(item);
    const key = `${on.type}:${on.id}`;
    if (!groups.has(key)) groups.set(key, { ...on, items: [] });
    groups.get(key)!.items.push(item);
  }
  return [...groups.values()];
}

/* What a gap, tradeoff or decision is on, as a link to its page, with its icon, and with `withLevel`, a capability's stability. */
export function SubjectLink({ state, type, id, withLevel = false }: { state: DocketState; type: string; id: string; withLevel?: boolean }) {
  const technical = type === "mechanism" || type === "component";
  const doc: Doc | undefined = technical
    ? technicalDoc(state, `${type}:${id}`)
    : find<Doc>(type === "domain" ? state.domains : type === "feature" ? state.features : state.capabilities, id);
  if (!doc) return <span className="lf-subject">{id}</span>;
  const icon = type === "domain" ? <DomainIcon size={15} /> : KIND_NAMES[type as keyof typeof KIND_NAMES]?.icon;
  return (
    <span className="lf-subject-wrap">
      <a className="lf-subject" href={docHref(type as DocKind, id)}>
        {icon}
        {doc.name}
      </a>
      {withLevel && type === "capability" ? <CapabilityStability level={(doc as Capability).stability} name={doc.name} focusable={false} /> : null}
    </span>
  );
}

/*
 * A choice kept in the address, as a row of links: what it is, then each
 * option, with how many it holds where that's known. The first option is the
 * default, which leaves the param out.
 */
export function Choice({ label, param: key, value, options }: { label: string; param: string; value: string; options: ([string, string] | [string, string, number])[] }) {
  return (
    <div className="lf-choice" role="group" aria-label={label}>
      <span className="lf-choice-label">{label}</span>
      {options.map(([v, name, n], i) => (
        <a key={v} href={withParam(key, i === 0 ? null : v)} aria-current={v === value ? "true" : undefined}>
          {name}
          {n !== undefined ? <span className="lf-choice-count">{n}</span> : null}
        </a>
      ))}
    </div>
  );
}

/* A long list cut short: its first `n`, then a button for the rest. `inline` is the smaller button under a group. */
export function ShowFirst({ n, total, more, inline = false, children }: { n: number; total: number; more: string; inline?: boolean; children: (shown: number) => ReactNode }) {
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
