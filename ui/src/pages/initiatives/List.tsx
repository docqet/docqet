import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Term } from "../../components/term/Term";
import { ReadinessMark } from "../../components/Readiness";
import { docHref, type Route } from "../../routes";
import { InitiativeIcon } from "../../components/shell/ScopeFilter";
import { Empty, PageHeader, View } from "../../components/shell/layout";
import { capabilitiesById, find, gapsById, type Capability, type DocqetState, type Initiative } from "../../state";
import { GapsCell, NameLink, Num, numSx, wideOnlySx } from "../../components/indexParts";

/*
 * The bodies of work, such as the MVP, and how ready each is: a row each,
 * with how many capabilities are in it, who it's for, and the product gaps in its
 * capabilities. Like every page, it counts only the scope showing. A phone
 * leaves out the counts.
 */
export default function InitiativesPage({ state }: { state: DocqetState; route: Route }) {
  return (
    <View title="Initiatives" wide>
      <PageHeader
        title="Initiatives"
        lede="Bodies of work, such as the MVP, and how ready each is. The scope at the top shows any one of them on every page."
      />
      {state.initiatives.length ? (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Term id="initiative" hoverOnly>
                    Initiative
                  </Term>
                </TableCell>
                <TableCell>
                  <Term id="readiness" hoverOnly>
                    Readiness
                  </Term>
                </TableCell>
                <TableCell align="right" sx={[numSx, wideOnlySx]}>
                  <Term id="capability" hoverOnly>
                    Capabilities
                  </Term>
                </TableCell>
                <TableCell align="right" sx={[numSx, wideOnlySx]}>
                  <Term id="persona" hoverOnly>
                    Personas
                  </Term>
                </TableCell>
                <TableCell>Product gaps in it</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {state.initiatives.map((i) => (
                <Row key={i.id} state={state} initiative={i} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Empty>No initiatives are written down yet.</Empty>
      )}
    </View>
  );
}

/* An initiative's row: the name, readiness, how many capabilities and personas are in it, and the product gaps in those capabilities. */
function Row({ state, initiative: i }: { state: DocqetState; initiative: Initiative }) {
  const { name, description: note } = i;
  const href = docHref("initiative", i.id);
  const left = docHref("initiative", i.id, "left");
  const capabilities: Capability[] = capabilitiesById(state, i.capabilities);
  const personas = i.personas.filter((id) => find(state.personas, id)).length;
  const gaps = gapsById(state, [...new Set(capabilities.flatMap((c) => c.gaps))]);
  return (
    <TableRow>
      <TableCell>
        <NameLink href={href} mark={<InitiativeIcon size={20} />} name={name} note={note} />
      </TableCell>
      <TableCell>
        <ReadinessMark readiness={i.readiness} of={`Readiness of ${name}`} />
      </TableCell>
      <TableCell align="right" sx={[numSx, wideOnlySx]}>
        <Num n={capabilities.length} />
      </TableCell>
      <TableCell align="right" sx={[numSx, wideOnlySx]}>
        <Num n={personas} />
      </TableCell>
      <TableCell>
        <GapsCell gaps={gaps} exposure={{ exposure: i.exposure, risk: i.readiness.gaps }} kind="product-gap" of={name} href={left} />
      </TableCell>
    </TableRow>
  );
}
