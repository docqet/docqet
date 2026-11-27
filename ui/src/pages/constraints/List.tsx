// docqet:implements capability:constraints
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Term } from "../../components/term/Term";
import { ConstraintIcon } from "../../components/names";
import { InlineMarkdown } from "../../components/markdown/Markdown";
import { ReadinessMark } from "../../components/Readiness";
import { docHref, type Route } from "../../routes";
import { Empty, PageHeader, View } from "../../components/shell/layout";
import { capabilitiesById, gapsById, readyShare, respecting, type Constraint, type DocqetState } from "../../state";
import { GapsCell, NameLink, Num, numSx, wideOnlySx } from "../../components/indexParts";
import { faintSx } from "../../components/doc/DocPage";

/*
 * What the software must keep to that nobody on the team chose: a row per
 * constraint, those nothing respects yet first, then those with nothing
 * started, then the least ready, with where it comes from, how many rules
 * and mechanisms respect it, and the product gaps in the capabilities they
 * bear on. A phone leaves out where it comes from and how many respect it.
 */
export default function ConstraintsPage({ state }: { state: DocqetState; route: Route }) {
  const order = (c: Constraint) => (respecting(c) ? (readyShare(c.readiness) ?? -1) : -2);
  const constraints = [...state.constraints].sort((a, b) => order(a) - order(b) || a.name.localeCompare(b.name));
  return (
    <View title="Constraints" wide>
      <PageHeader
        title="Constraints"
        lede="What must it keep to that nobody here can change, and is what keeps to each ready? Constraints nothing respects yet first, then the least ready."
      />
      {constraints.length ? (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Term id="constraint" hoverOnly>
                    Constraint
                  </Term>
                </TableCell>
                <TableCell sx={wideOnlySx}>Where it comes from</TableCell>
                <TableCell>
                  <Term id="readiness" hoverOnly>
                    Readiness
                  </Term>
                </TableCell>
                <TableCell align="right" sx={[numSx, wideOnlySx]}>
                  <Term id="rule" hoverOnly>
                    Respected by
                  </Term>
                </TableCell>
                <TableCell>Product gaps</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {constraints.map((c) => (
                <ConstraintRow key={c.id} state={state} constraint={c} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Empty>No constraints are written down yet.</Empty>
      )}
    </View>
  );
}

/* A constraint's row: its name, where it comes from, readiness, how many rules and mechanisms respect it, and the product gaps in what they bear on. */
function ConstraintRow({ state, constraint }: { state: DocqetState; constraint: Constraint }) {
  const capabilities = capabilitiesById(state, constraint.capabilities);
  const gaps = gapsById(state, [...new Set(capabilities.flatMap((c) => c.gaps))]);
  const count = respecting(constraint);
  return (
    <TableRow>
      <TableCell>
        <NameLink href={docHref("constraint", constraint.id)} mark={<ConstraintIcon size={20} />} name={constraint.name} wrap />
      </TableCell>
      <TableCell sx={[wideOnlySx, { color: "text.secondary" }]}>
        {constraint.source ? (
          <InlineMarkdown text={constraint.source} />
        ) : (
          <Box component="span" sx={faintSx}>
            Not written down
          </Box>
        )}
      </TableCell>
      <TableCell>
        {count ? (
          <ReadinessMark readiness={constraint.readiness} of={`Readiness of what keeps to “${constraint.name}”`} />
        ) : (
          <Box component="span" sx={{ color: "text.secondary", fontWeight: 500 }}>
            Nothing respects it yet
          </Box>
        )}
      </TableCell>
      <TableCell align="right" sx={[numSx, wideOnlySx]}>
        <Num n={count} />
      </TableCell>
      <TableCell>
        <GapsCell
          gaps={gaps}
          exposure={{ exposure: constraint.exposure, risk: constraint.readiness.gaps }}
          kind="product-gap"
          of="what keeps to it"
          href={docHref("constraint", constraint.id, "improvements")}
        />
      </TableCell>
    </TableRow>
  );
}
