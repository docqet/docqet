// docqet:implements capability:personas
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Term } from "../../components/term/Term";
import { PersonaAvatar, personaNameAndRole } from "../../components/Personas";
import { ReadinessMark } from "../../components/Readiness";
import { docHref, type Route } from "../../routes";
import { Empty, PageHeader, View } from "../../components/shell/layout";
import { find, gapsById, readyShare, type DocqetState, type Persona } from "../../state";
import { GapsCell, NameLink, Num, numSx, wideOnlySx } from "../../components/indexParts";
import { InitiativeTags } from "../../components/Initiatives";

/*
 * Who the software serves, and how ready it is for each of them: a row per
 * persona, least ready first, by their readiness, with
 * how many capabilities serve them and the product gaps in those, the worst
 * one's impact beside them. Those with nothing started come first of all. Technical gaps are left out: they're what
 * only someone working on the code would notice. A phone leaves out how many
 * capabilities serve them.
 */
export default function PersonasPage({ state }: { state: DocqetState; route: Route }) {
  const share = new Map(state.personas.map((p) => [p, readyShare(p.readiness)]));
  const personas = [...state.personas].sort((a, b) => (share.get(a) ?? -1) - (share.get(b) ?? -1));
  return (
    <View title="Personas" wide>
      <PageHeader title="Personas" lede="Who does it serve, and is it ready for them? Least ready first." />
      {personas.length ? (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Term id="persona" hoverOnly>
                    Persona
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
                <TableCell>Product gaps for them</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {personas.map((p) => (
                <PersonaRow key={p.id} state={state} persona={p} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Empty>No personas are written down yet.</Empty>
      )}
    </View>
  );
}

/* A persona's row: picture, name and role, readiness, how many capabilities serve them, and the product gaps in those. */
function PersonaRow({ state, persona }: { state: DocqetState; persona: Persona }) {
  const { name, role } = personaNameAndRole(persona);
  const capabilities = persona.capabilities.flatMap((id) => find(state.capabilities, id) ?? []);
  const gaps = gapsById(state, [...new Set(capabilities.flatMap((c) => c.gaps))]);
  return (
    <TableRow>
      <TableCell>
        <NameLink href={docHref("persona", persona.id)} mark={<PersonaAvatar persona={persona} size={36} />} name={name} note={role} />
        <InitiativeTags state={state} ids={persona.initiatives} block />
      </TableCell>
      <TableCell>
        <ReadinessMark readiness={persona.readiness} of={`Readiness for ${name}`} />
      </TableCell>
      <TableCell align="right" sx={[numSx, wideOnlySx]}>
        <Num n={capabilities.length} />
      </TableCell>
      <TableCell>
        <GapsCell
          gaps={gaps}
          exposure={{ exposure: persona.exposure, risk: persona.readiness.gaps }}
          kind="product-gap"
          of={`what serves ${name}`}
          href={docHref("persona", persona.id, "improvements")}
        />
      </TableCell>
    </TableRow>
  );
}
