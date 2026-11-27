// docqet:implements capability:how-its-built component:built-page
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { plural } from "../../components/names";
import { Term } from "../../components/term/Term";
import { Excerpt } from "../../components/markdown/Markdown";
import { docHref, type Route } from "../../routes";
import { Empty, PageHeader, Tabs, View, currentTab, type TabDef } from "../../components/shell/layout";
import { gapsById, type DocqetState, type TechnicalDoc, type TechnicalKind } from "../../state";
import { DocLink, GapsCell, Num, numSx, whereSx, wideOnlySx } from "../../components/indexParts";

/*
 * How the software is meant to be built: its mechanisms and its components,
 * a tab each. Each row says what it is, what relies on it, its technical gaps
 * with the worst one's impact, and how many tradeoffs and expected outcomes
 * it has. The one with the worst gap comes first.
 */
export default function BuiltPage({ state, route }: { state: DocqetState; route: Route }) {
  const tabs: TabDef[] = [
    { id: "mechanisms", label: "Mechanisms", term: "mechanism" as const, count: state.mechanisms.length },
    { id: "components", label: "Components", term: "component" as const, count: state.components.length },
  ];
  const tab = currentTab(route, tabs);
  const kind: TechnicalKind = tab === "components" ? "component" : "mechanism";
  const docs = kind === "component" ? state.components : state.mechanisms;
  return (
    <View title="How it's built" wide>
      <PageHeader
        title="How it's built"
        lede="How is it meant to be built? Mechanisms work across a whole project or product; components are one part of the code. Worst gap first."
      />
      <Tabs tabs={tabs} current={tab} />
      {docs.length ? <TechnicalTable state={state} kind={kind} docs={docs} /> : <Empty>No {kind}s are written down yet.</Empty>}
    </View>
  );
}

/* A row each, worst gap first. A phone leaves out the counts of tradeoffs and outcomes. */
function TechnicalTable({ state, kind, docs }: { state: DocqetState; kind: TechnicalKind; docs: TechnicalDoc[] }) {
  const risk = (d: TechnicalDoc) => d.risk.score ?? -1;
  const rows = [...docs].sort((a, b) => risk(b) - risk(a) || b.gaps.length - a.gaps.length);
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{kind === "component" ? "Component" : "Mechanism"}</TableCell>
            <TableCell>{kind === "component" ? "Relied on by" : "Applies to"}</TableCell>
            <TableCell>
              <Term id="technical-gap" hoverOnly>
                Technical gaps
              </Term>
            </TableCell>
            <TableCell align="right" sx={[numSx, wideOnlySx]}>
              <Term id="tradeoff" hoverOnly>
                Tradeoffs
              </Term>
            </TableCell>
            <TableCell align="right" sx={[numSx, wideOnlySx]}>
              Outcomes met
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((d) => (
            <TableRow key={d.id}>
              <TableCell sx={{ width: "40%" }}>
                <DocLink kind={kind} id={d.id} name={d.name} />
                <Box sx={{ mt: "2px", color: "text.secondary", fontSize: 12.5 }}>
                  <Excerpt text={d.description} lines={1} />
                </Box>
              </TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                {plural(d.capabilities.length, "capability", "capabilities")}
                {kind === "mechanism" ? (
                  <Box component="span" sx={{ ...whereSx, display: "block" }}>
                    {d.applies === "product" ? "Across its product" : "Across its project"}
                  </Box>
                ) : null}
              </TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                <GapsCell gaps={gapsById(state, d.gaps)} risk={d.risk} kind="technical-gap" of={d.name} href={docHref(d.kind, d.id, "open")} />
              </TableCell>
              <TableCell align="right" sx={[numSx, wideOnlySx]}>
                <Num n={d.tradeoffs.length} />
              </TableCell>
              <TableCell align="right" sx={[numSx, wideOnlySx]}>
                <Num n={d.meets.length} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
