import { Decided, type Go } from "../Fields";
import { plural } from "../Explore";
import { LeftLabel } from "../design/left/LeftMark";
import { impactCounts } from "../design/risk/ImpactBadge";
import { sectionHref, type Route } from "../routes";
import { Empty, PageHeader, Section, Stat, Tabs, View, currentTab } from "../shell/layout";
import { closedDecisions, inRiskOrder, subjectOf, type DocketState, type Tradeoff } from "../state";
import { Choice, HolderGroups, SubjectLink, bySubject, goFor, holdersOf, param } from "./LeftPage";
import "./left.css";
import { TradeoffRows } from "../TradeoffRows";

/*
 * What we chose on purpose, none of it left to do: tradeoffs, each with the
 * benefit and drawback that came with it, riskiest drawback first; non-goals,
 * what a feature has decided never to build; and the decisions we've
 * answered, with what each became.
 */
export default function DecidedPage({ state, route }: { state: DocketState; route: Route }) {
  const go = goFor(state);
  const tradeoffs = state.tradeoffs.filter((t) => subjectOf(t).type !== "feature");
  const nonGoals = state.tradeoffs.filter((t) => subjectOf(t).type === "feature");
  const holders = holdersOf(state).filter((h) => closedDecisions(h.doc).length);
  const closed = holders.reduce((n, h) => n + closedDecisions(h.doc).length, 0);
  const tabs = [
    { id: "tradeoffs", label: <LeftLabel kind="tradeoff" size={14} hoverOnly />, count: tradeoffs.length },
    { id: "non-goals", label: "Non-goals", term: "tradeoff" as const, count: nonGoals.length },
    { id: "closed", label: "Closed decisions", term: "open-decision" as const, count: closed },
  ];
  const tab = currentTab(route, tabs);
  return (
    <View title="Decided">
      <PageHeader
        title="Decided"
        lede={
          <>
            What we chose on purpose: the tradeoffs we live with, what features will never do, and the questions we've answered. None of it is left to do; that's
            under <a href={sectionHref("left")}>What's left</a>.
          </>
        }
        stats={
          <>
            <Stat
              label={<LeftLabel kind="tradeoff" size={13} hoverOnly />}
              value={tradeoffs.length || "None"}
              note={tradeoffs.length ? `Drawbacks: ${impactCounts(tradeoffs)}` : "Limits and technical choices"}
              href={sectionHref("decided")}
            />
            <Stat label="Non-goals" term="tradeoff" value={nonGoals.length || "None"} note="What features have decided never to build" href={sectionHref("decided", { tab: "non-goals" })} />
            <Stat
              label="Closed decisions" term="open-decision"
              value={closed || "None"}
              note={holders.length ? `In ${plural(holders.length, "place", "places")}` : "None answered yet"}
              href={sectionHref("decided", { tab: "closed" })}
            />
          </>
        }
      />
      <Tabs tabs={tabs} current={tab} />
      {tab === "tradeoffs" ? (
        <TradeoffsTab state={state} tradeoffs={tradeoffs} go={go} />
      ) : tab === "non-goals" ? (
        <NonGoalsTab state={state} nonGoals={nonGoals} go={go} />
      ) : holders.length ? (
        <>
          <p className="lf-intro">Questions that were open and have been answered: what was asked, what was decided, and what it became.</p>
          <HolderGroups state={state} holders={holders} count={(h) => closedDecisions(h.doc).length} render={(h) => <Decided doc={h.doc} go={go} />} />
        </>
      ) : (
        <Empty>No closed decisions written down.</Empty>
      )}
    </View>
  );
}

type Kind = "all" | "product" | "technical";

/* Tradeoffs on capabilities, mechanisms and components, riskiest drawback first, product or technical as the address says. */
function TradeoffsTab({ state, tradeoffs, go }: { state: DocketState; tradeoffs: Tradeoff[]; go: Go }) {
  const kind = (param("kind") ?? "all") as Kind;
  const product = tradeoffs.filter((t) => subjectOf(t).type === "capability").length;
  const shown = inRiskOrder(
    state,
    tradeoffs.filter((t) => kind === "all" || (kind === "product") === (subjectOf(t).type === "capability")),
    (t) => t,
  );
  if (!tradeoffs.length) return <Empty>No tradeoffs written down.</Empty>;
  return (
    <>
      <div className="lf-filters">
        <Choice
          label="Kind"
          param="kind"
          value={kind}
          options={[
            ["all", "All", tradeoffs.length],
            ["product", "Limits of capabilities", product],
            ["technical", "Technical choices", tradeoffs.length - product],
          ]}
        />
      </div>
      <Section
        title="By the drawback's impact"
        count={shown.length}
        note={shown.length ? "Worst first. The milder ones are folded; open one for its drawback and benefit." : undefined}
      >
        {shown.length ? (
          <TradeoffRows state={state} tradeoffs={shown} go={go} />
        ) : (
          <Empty>No tradeoffs match.</Empty>
        )}
      </Section>
    </>
  );
}

/* Non-goals: tradeoffs on features, grouped by feature, the one with the riskiest drawback first. */
function NonGoalsTab({ state, nonGoals, go }: { state: DocketState; nonGoals: Tradeoff[]; go: Go }) {
  if (!nonGoals.length) return <Empty>No non-goals written down.</Empty>;
  return (
    <>
      <p className="lf-intro">What a feature has decided never to build, with what that buys and what it costs.</p>
      {bySubject(inRiskOrder(state, nonGoals, (t) => t)).map((g) => (
        <div key={g.id} className="lf-card lf-group">
          <header className="lf-group-head">
            <SubjectLink state={state} type={g.type} id={g.id} />
            <span className="view-section-count">{g.items.length}</span>
          </header>
          <TradeoffRows state={state} tradeoffs={g.items} go={go} here={{ id: g.id }} grouped={false} />
        </div>
      ))}
    </>
  );
}

