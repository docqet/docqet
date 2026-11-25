import { useState } from "react";
import { Term } from "../design/term/Term";
import { RULE_STANDING_LABELS } from "../Explore";
import { Excerpt } from "../design/markdown/Markdown";
import { StandingMark } from "../design/standing/StandingMark";
import type { Route } from "../routes";
import { Empty, PageHeader, Section, Tabs, View, currentTab, type TabDef } from "../shell/layout";
import { domainName, find, ruleStanding, type Concept, type DocketState, type Rule, type RuleStanding } from "../state";
import { DocLink, FilterBox, Num, byName, matches } from "./indexParts";

/*
 * The domain's language: what its words mean, and the rules that must hold.
 * Two tabs, concepts and rules, each grouped by domain, one line a row, with
 * a box to narrow them by name, since there can be hundreds of rules.
 */
export default function LanguagePage({ state, route }: { state: DocketState; route: Route }) {
  const tabs: TabDef[] = [
    { id: "concepts", label: "Concepts", term: "concept" as const, count: state.concepts.length },
    { id: "rules", label: "Rules", term: "rule" as const, count: state.rules.length },
  ];
  const tab = currentTab(route, tabs);
  /* What's typed in each tab's box, kept apart so switching tabs doesn't carry it over. */
  const [queries, setQueries] = useState<Record<string, string>>({});
  const query = queries[tab] ?? "";
  const setQuery = (q: string) => setQueries((all) => ({ ...all, [tab]: q }));
  return (
    <View title="Language" wide>
      <PageHeader title="Language" lede="What do the words mean? Each domain's concepts, and the rules that must always or never happen." />
      <Tabs tabs={tabs} current={tab} />
      <div className="ix-bar">
        <FilterBox value={query} onChange={setQuery} placeholder={tab === "rules" ? "Filter rules by name" : "Filter concepts"} />
      </div>
      {tab === "rules" ? <Rules state={state} query={query} /> : <Concepts state={state} query={query} />}
    </View>
  );
}

/* Docs grouped by the domain they're written in, in the order domains come, each group's docs A to Z. */
function byDomain<T extends { domain: string; name: string }>(state: DocketState, docs: T[]): { domain: string; docs: T[] }[] {
  const ids = [...state.domains.map((d) => d.id), ...docs.map((d) => d.domain)];
  return [...new Set(ids)].map((domain) => ({ domain, docs: docs.filter((d) => d.domain === domain).sort(byName) })).filter((g) => g.docs.length);
}

/* Each domain's concepts: name, what it means, and how many capabilities use it. */
function Concepts({ state, query }: { state: DocketState; query: string }) {
  if (!state.concepts.length) return <Empty>No concepts are written down yet.</Empty>;
  const groups = byDomain(
    state,
    state.concepts.filter((c) => matches(query, c, c.description)),
  );
  if (!groups.length) return <Empty>No concept matches “{query}”.</Empty>;
  return (
    <>
      {groups.map((g) => (
        <Section key={g.domain} title={domainName(state, g.domain)} count={g.docs.length}>
          <table className="view-table ix-table ix-oneline">
            <thead>
              <tr>
                <th className="ix-col-name"><Term id="concept" hoverOnly>Concept</Term></th>
                <th>What it means</th>
                <th className="num ix-col-count"><Term id="capability" hoverOnly>Capabilities</Term></th>
              </tr>
            </thead>
            <tbody>
              {g.docs.map((c) => (
                <ConceptRow key={c.id} concept={c} />
              ))}
            </tbody>
          </table>
        </Section>
      ))}
    </>
  );
}

function ConceptRow({ concept }: { concept: Concept }) {
  return (
    <tr>
      <td className="ix-col-name">
        <DocLink kind="concept" id={concept.id} name={concept.name} />
      </td>
      <td className="ix-desc">
        <Excerpt text={concept.description} lines={1} />
      </td>
      <td className="num ix-col-count">
        <Num n={concept.capabilities.length} />
      </td>
    </tr>
  );
}

/*
 * Each domain's rules: name, how many capabilities follow it, and whether
 * they hold to it, as counts of each standing. Within a domain, rules some
 * capability doesn't hold to yet come first, then the rest A to Z.
 */
function Rules({ state, query }: { state: DocketState; query: string }) {
  if (!state.rules.length) return <Empty>No rules are written down yet.</Empty>;
  const standings = new Map(state.rules.map((r) => [r.id, standingsOf(state, r)]));
  const groups = byDomain(
    state,
    state.rules.filter((r) => matches(query, r)),
  ).map((g) => ({ ...g, docs: [...g.docs].sort((a, b) => Number(standings.get(b.id)!.gap > 0) - Number(standings.get(a.id)!.gap > 0)) }));
  if (!groups.length) return <Empty>No rule matches “{query}”.</Empty>;
  return (
    <>
      {groups.map((g) => (
        <Section key={g.domain} title={domainName(state, g.domain)} count={g.docs.length}>
          <table className="view-table ix-table ix-oneline">
            <thead>
              <tr>
                <th><Term id="rule" hoverOnly>Rule</Term></th>
                <th className="num ix-col-count"><Term id="capability" hoverOnly>Capabilities</Term></th>
                <th className="ix-col-standing">Held</th>
              </tr>
            </thead>
            <tbody>
              {g.docs.map((r) => (
                <tr key={r.id}>
                  <td className="ix-col-rule">
                    <DocLink kind="rule" id={r.id} name={r.name} />
                  </td>
                  <td className="num ix-col-count">
                    <Num n={r.capabilities.length} />
                  </td>
                  <td className="ix-col-standing">
                    <StandingCounts counts={standings.get(r.id)!} followed={r.capabilities.length} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      ))}
    </>
  );
}

/* How many capabilities following a rule hold to it with evidence, on trust, and not yet. */
type Counts = Record<RuleStanding, number>;

function standingsOf(state: DocketState, rule: Rule): Counts {
  const counts: Counts = { evidence: 0, trust: 0, gap: 0 };
  for (const id of rule.capabilities) {
    const capability = find(state.capabilities, id);
    if (capability) counts[ruleStanding(capability, rule)]++;
  }
  return counts;
}

/* Each standing with any, as its mark and how many: not held first, since that's what needs looking at. */
function StandingCounts({ counts, followed }: { counts: Counts; followed: number }) {
  if (!followed) return <span className="ix-none">No capability follows it</span>;
  const order: RuleStanding[] = ["gap", "evidence", "trust"];
  return (
    <span className="ix-standings">
      {order
        .filter((s) => counts[s])
        .map((s) => (
          <span key={s} className="ix-standing" data-standing={s}>
            <StandingMark standing={s} label={`${RULE_STANDING_LABELS[s]}: ${counts[s]} of ${followed}`} />
            {counts[s]}
          </span>
        ))}
    </span>
  );
}
