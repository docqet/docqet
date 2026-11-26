import { LeftLabel } from "../../components/left/LeftMark";
import { param, sectionHref, type Route } from "../../routes";
import { Count, Empty, PageHeader, Section, Stat, Tabs, View, currentTab } from "../../components/shell/layout";
import { bySubject, subjectOf, type DocketState, type Tradeoff } from "../../state";
import { Choice } from "../../components/Choice";
import { SubjectLink } from "../../components/SubjectLink";
import "../left.css";
import { TradeoffRows } from "../../components/TradeoffRows";
import Box from "@mui/material/Box";
import { groupHeadSx, groupSx, introSx } from "../left/List";
import { visuallyHidden } from "../left/components/ScopePicker";

/*
 * What we chose on purpose, none of it left to do: tradeoffs, each with the
 * benefit and drawback that came with it, by what they're on; and non-goals,
 * what a feature has decided never to build. An answered decision is deleted,
 * written as whatever it became, so it isn't here.
 */
export default function DecidedPage({ state, route }: { state: DocketState; route: Route }) {
  const tradeoffs = state.tradeoffs.filter((t) => subjectOf(t).type !== "feature");
  const nonGoals = state.tradeoffs.filter((t) => subjectOf(t).type === "feature");
  const tabs = [
    { id: "tradeoffs", label: <LeftLabel kind="tradeoff" size={14} hoverOnly />, count: tradeoffs.length },
    { id: "non-goals", label: "Non-goals", term: "tradeoff" as const, count: nonGoals.length },
  ];
  const tab = currentTab(route, tabs);
  return (
    <View title="Decided">
      <PageHeader
        title="Decided"
        lede={
          <>
            What we chose on purpose: the tradeoffs we live with, and what features will never do. None of it is left to do; that&apos;s under{" "}
            <a href={sectionHref("left")}>What&apos;s left</a>.
          </>
        }
        stats={
          <>
            <Stat
              label={<LeftLabel kind="tradeoff" size={13} hoverOnly />}
              value={tradeoffs.length || "None"}
              note="Limits and technical choices"
              href={sectionHref("decided")}
            />
            <Stat
              label="Non-goals"
              term="tradeoff"
              value={nonGoals.length || "None"}
              note="What features have decided never to build"
              href={sectionHref("decided", { tab: "non-goals" })}
            />
          </>
        }
      />
      <Tabs tabs={tabs} current={tab} />
      {tab === "tradeoffs" ? <TradeoffsTab state={state} tradeoffs={tradeoffs} /> : <NonGoalsTab state={state} nonGoals={nonGoals} />}
    </View>
  );
}

type Kind = "all" | "product" | "technical";

/* Tradeoffs on capabilities, mechanisms and components, grouped by what they're on, product or technical as the address says. */
function TradeoffsTab({ state, tradeoffs }: { state: DocketState; tradeoffs: Tradeoff[] }) {
  const kind = (param("kind") ?? "all") as Kind;
  const product = tradeoffs.filter((t) => subjectOf(t).type === "capability").length;
  const shown = tradeoffs.filter((t) => kind === "all" || (kind === "product") === (subjectOf(t).type === "capability"));
  if (!tradeoffs.length) return <Empty>No tradeoffs written down.</Empty>;
  return (
    <>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px 24px", mt: -1, mb: 2.5 }}>
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
        {/* How many the choice leaves, said aloud as it changes. */}
        <Box component="span" aria-live="polite" sx={visuallyHidden}>
          {`${shown.length} of ${tradeoffs.length} tradeoffs`}
        </Box>
      </Box>
      <Section
        title="By what they're on"
        count={shown.length}
        note={shown.length ? "Open one for its drawback and benefit. A tradeoff has no risk, since it's chosen." : undefined}
      >
        {shown.length ? (
          bySubject(shown).map((g) => (
            <Box key={`${g.type}:${g.id}`} sx={groupSx}>
              <Box component="header" sx={groupHeadSx}>
                <SubjectLink state={state} type={g.type} id={g.id} />
                <Count n={g.items.length} />
              </Box>
              <TradeoffRows state={state} tradeoffs={g.items} here={{ id: g.id }} />
            </Box>
          ))
        ) : (
          <Empty>No tradeoffs match.</Empty>
        )}
      </Section>
    </>
  );
}

/* Non-goals: tradeoffs on features, grouped by feature. */
function NonGoalsTab({ state, nonGoals }: { state: DocketState; nonGoals: Tradeoff[] }) {
  if (!nonGoals.length) return <Empty>No non-goals written down.</Empty>;
  return (
    <>
      <Box component="p" sx={introSx}>
        What a feature has decided never to build, with what that buys and what it costs.
      </Box>
      {bySubject(nonGoals).map((g) => (
        <Box key={g.id} sx={groupSx}>
          <Box component="header" sx={groupHeadSx}>
            <SubjectLink state={state} type={g.type} id={g.id} />
            <Count n={g.items.length} />
          </Box>
          <TradeoffRows state={state} tradeoffs={g.items} here={{ id: g.id }} />
        </Box>
      ))}
    </>
  );
}
