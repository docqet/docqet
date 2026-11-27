// docqet:implements capability:language
import { useState } from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import type { Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import { Term } from "../../components/term/Term";
import { RULE_STANDING_LABELS } from "../../components/names";
import { Excerpt } from "../../components/markdown/Markdown";
import { StandingMark } from "../../components/standing/StandingMark";
import type { Route } from "../../routes";
import { Empty, PageHeader, Tabs, View, currentTab, type TabDef } from "../../components/shell/layout";
import { find, type Concept, type DocqetState, type Rule, type RuleStanding } from "../../state";
import { DocLink, FilterBox, Num, byName, faintSx, matches, numSx, visuallyHiddenSx, wideOnlySx } from "../../components/indexParts";

/*
 * The product's language: what its words mean, and the rules that must hold.
 * Two tabs, concepts and rules, each one list, one line a row, with a box to
 * narrow them by name, since there can be hundreds of rules. How
 * many match is read out as the box narrows them.
 */
export default function LanguagePage({ state, route }: { state: DocqetState; route: Route }) {
  const tabs: TabDef[] = [
    { id: "concepts", label: "Concepts", term: "concept" as const, count: state.concepts.length },
    { id: "rules", label: "Rules", term: "rule" as const, count: state.rules.length },
  ];
  const tab = currentTab(route, tabs);
  /* What's typed in each tab's box, kept apart so switching tabs doesn't carry it over. */
  const [queries, setQueries] = useState<Record<string, string>>({});
  const query = queries[tab] ?? "";
  const setQuery = (q: string) => setQueries((all) => ({ ...all, [tab]: q }));
  const matching =
    tab === "rules" ? state.rules.filter((r) => matches(query, r)).length : state.concepts.filter((c) => matches(query, c, c.description)).length;
  const noun = tab === "rules" ? (matching === 1 ? "rule" : "rules") : matching === 1 ? "concept" : "concepts";
  return (
    <View title="Language" wide>
      <PageHeader title="Language" lede="What do the words mean? The product's concepts, and the rules that must always or never happen." />
      <Tabs tabs={tabs} current={tab} />
      <Box sx={{ mb: 2 }}>
        <FilterBox value={query} onChange={setQuery} placeholder={tab === "rules" ? "Filter rules by name" : "Filter concepts"} />
        <Box role="status" aria-live="polite" sx={visuallyHiddenSx}>
          {query.trim() ? `${matching} ${noun} match` : ""}
        </Box>
      </Box>
      {tab === "rules" ? <Rules state={state} query={query} /> : <Concepts state={state} query={query} />}
    </View>
  );
}

/* A table of one line a row, its columns as wide as its headings say, what doesn't fit cut short. */
const onelineSx: SystemStyleObject<Theme> = {
  tableLayout: "fixed",
  "& td": { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
};

/* A count of capabilities: a phone leaves it out. */
const countSx: SystemStyleObject<Theme>[] = [numSx, { width: 110 }, wideOnlySx];

/* A name that fits its cell, cut short when it doesn't. */
const fitSx: SystemStyleObject<Theme> = { maxWidth: "100%" };

/* The concepts, A to Z: name, what it means, and how many capabilities use it. A phone shows just the names and counts. */
function Concepts({ state, query }: { state: DocqetState; query: string }) {
  if (!state.concepts.length) return <Empty>No concepts are written down yet.</Empty>;
  const shown = state.concepts.filter((c) => matches(query, c, c.description)).sort(byName);
  if (!shown.length) return <Empty>No concept matches “{query}”.</Empty>;
  return (
    <TableContainer>
      <Table sx={onelineSx}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: { sm: "28%" } }}>
              <Term id="concept" hoverOnly>
                Concept
              </Term>
            </TableCell>
            <TableCell sx={wideOnlySx}>What it means</TableCell>
            <TableCell align="right" sx={countSx}>
              <Term id="capability" hoverOnly>
                Capabilities
              </Term>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {shown.map((c) => (
            <ConceptRow key={c.id} concept={c} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function ConceptRow({ concept }: { concept: Concept }) {
  return (
    <TableRow>
      <TableCell>
        <DocLink kind="concept" id={concept.id} name={concept.name} sx={fitSx} />
      </TableCell>
      <TableCell sx={[{ color: "text.secondary" }, wideOnlySx]}>
        <Excerpt text={concept.description} lines={1} />
      </TableCell>
      <TableCell align="right" sx={countSx}>
        <Num n={concept.capabilities.length} />
      </TableCell>
    </TableRow>
  );
}

/*
 * The rules: name, how many capabilities follow it, and whether they hold
 * to it, as counts of each standing. Rules some capability doesn't hold to
 * yet come first, then the rest, each A to Z. A phone leaves out how many
 * follow it.
 */
function Rules({ state, query }: { state: DocqetState; query: string }) {
  if (!state.rules.length) return <Empty>No rules are written down yet.</Empty>;
  const standings = new Map(state.rules.map((r) => [r.id, standingsOf(state, r)]));
  const notHeld = (r: Rule) => Number(standings.get(r.id)!.gap > 0);
  const shown = state.rules.filter((r) => matches(query, r)).sort((a, b) => notHeld(b) - notHeld(a) || byName(a, b));
  if (!shown.length) return <Empty>No rule matches “{query}”.</Empty>;
  const heldSx: SystemStyleObject<Theme> = { width: { xs: 96, sm: 200 } };
  return (
    <TableContainer>
      <Table sx={onelineSx}>
        <TableHead>
          <TableRow>
            <TableCell>
              <Term id="rule" hoverOnly>
                Rule
              </Term>
            </TableCell>
            <TableCell align="right" sx={countSx}>
              <Term id="capability" hoverOnly>
                Capabilities
              </Term>
            </TableCell>
            <TableCell sx={heldSx}>Held</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {shown.map((r) => (
            <TableRow key={r.id}>
              <TableCell>
                <DocLink kind="rule" id={r.id} name={r.name} sx={fitSx} />
              </TableCell>
              <TableCell align="right" sx={countSx}>
                <Num n={r.capabilities.length} />
              </TableCell>
              <TableCell sx={heldSx}>
                <StandingCounts counts={standings.get(r.id)!} followed={r.capabilities.length} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/* How many capabilities following a rule hold to it with evidence, on trust, and not yet. */
type Counts = Record<RuleStanding, number>;

function standingsOf(state: DocqetState, rule: Rule): Counts {
  const counts: Counts = { evidence: 0, trust: 0, gap: 0 };
  for (const id of rule.capabilities) {
    const capability = find(state.capabilities, id);
    if (capability) counts[capability.ruleStandings[rule.id]]++;
  }
  return counts;
}

/* Each standing with any, as its mark and how many: not held first, since that's what needs looking at. */
function StandingCounts({ counts, followed }: { counts: Counts; followed: number }) {
  if (!followed)
    return (
      <Box component="span" sx={faintSx}>
        No capability follows it
      </Box>
    );
  const order: RuleStanding[] = ["gap", "evidence", "trust"];
  return (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1.5 }}>
      {order
        .filter((s) => counts[s])
        .map((s) => (
          <Box
            component="span"
            key={s}
            /* The mark sits centered beside its number, without the nudge down it has beside text. */
            sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontVariantNumeric: "tabular-nums", "& > [role=img]": { mt: 0 } }}
          >
            <StandingMark standing={s} label={`${RULE_STANDING_LABELS[s]}: ${counts[s]} of ${followed}`} />
            {counts[s]}
          </Box>
        ))}
    </Box>
  );
}
