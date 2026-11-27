// docqet:implements capability:problems
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Term } from "../../components/term/Term";
import { ProblemIcon } from "../../components/names";
import { ReadinessMark } from "../../components/Readiness";
import { docHref, type Route } from "../../routes";
import { Empty, PageHeader, View } from "../../components/shell/layout";
import { capabilitiesById, find, gapsById, readyShare, type DocqetState, type Problem } from "../../state";
import { GapsCell, NameLink, Num, PersonaFaces, numSx, wideOnlySx } from "../../components/indexParts";

/*
 * The problems the software means to solve: a row per problem, those nothing
 * solves yet first, then those with nothing started, then the least ready,
 * with who has it, how many capabilities solve it and the product gaps in
 * those. Technical gaps are left out, as on the personas page. A phone
 * leaves out who has it and how many capabilities solve it.
 */
export default function ProblemsPage({ state }: { state: DocqetState; route: Route }) {
  const order = (p: Problem) => (p.capabilities.length ? (readyShare(p.readiness) ?? -1) : -2);
  const problems = [...state.problems].sort((a, b) => order(a) - order(b) || a.name.localeCompare(b.name));
  return (
    <View title="Problems" wide>
      <PageHeader title="Problems" lede="Why does it exist, and is what solves each problem ready? Problems nothing solves yet first, then the least ready." />
      {problems.length ? (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Term id="problem" hoverOnly>
                    Problem
                  </Term>
                </TableCell>
                <TableCell sx={wideOnlySx}>
                  <Term id="persona" hoverOnly>
                    Who has it
                  </Term>
                </TableCell>
                <TableCell>
                  <Term id="readiness" hoverOnly>
                    Readiness
                  </Term>
                </TableCell>
                <TableCell align="right" sx={[numSx, wideOnlySx]}>
                  <Term id="capability" hoverOnly>
                    Solving it
                  </Term>
                </TableCell>
                <TableCell>Product gaps</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {problems.map((p) => (
                <ProblemRow key={p.id} state={state} problem={p} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Empty>No problems are written down yet.</Empty>
      )}
    </View>
  );
}

/* A problem's row: its name, who has it, readiness, how many capabilities solve it, and the product gaps in those. */
function ProblemRow({ state, problem }: { state: DocqetState; problem: Problem }) {
  const capabilities = capabilitiesById(state, problem.capabilities);
  const personas = problem.personas.flatMap((id) => find(state.personas, id) ?? []);
  const gaps = gapsById(state, [...new Set(capabilities.flatMap((c) => c.gaps))]);
  const unsolved = !capabilities.length;
  return (
    <TableRow>
      <TableCell>
        <NameLink href={docHref("problem", problem.id)} mark={<ProblemIcon size={20} />} name={problem.name} wrap />
      </TableCell>
      <TableCell sx={wideOnlySx}>
        <PersonaFaces personas={personas} />
      </TableCell>
      <TableCell>
        {unsolved ? (
          <Box component="span" sx={{ color: "text.secondary", fontWeight: 500 }}>
            Nothing solves it yet
          </Box>
        ) : (
          <ReadinessMark readiness={problem.readiness} of={`Readiness of what solves “${problem.name}”`} />
        )}
      </TableCell>
      <TableCell align="right" sx={[numSx, wideOnlySx]}>
        <Num n={capabilities.length} />
      </TableCell>
      <TableCell>
        <GapsCell
          gaps={gaps}
          exposure={{ exposure: problem.exposure, risk: problem.readiness.gaps }}
          kind="product-gap"
          of="what solves it"
          href={docHref("problem", problem.id, "improvements")}
        />
      </TableCell>
    </TableRow>
  );
}
