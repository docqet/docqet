import { Term } from "../design/term/Term";
import { PersonaAvatar, personaNameAndRole, personaReadiness } from "../Personas";
import { ReadinessMark } from "../Readiness";
import { docHref, type Route } from "../routes";
import { Empty, PageHeader, View } from "../shell/layout";
import { find, gapsById, readyShare, type DocketState, type Persona } from "../state";
import { GapsCell, Num } from "./indexParts";

/*
 * Who the software serves, and how ready it is for each of them: a row per
 * persona, least ready first, by their readiness, with
 * how many capabilities serve them and the product gaps in those, the worst
 * one's impact beside them. Those with nothing started come first of all. Technical gaps are left out: they're what
 * only someone working on the code would notice.
 */
export default function PersonasPage({ state }: { state: DocketState; route: Route }) {
  const share = new Map(state.personas.map((p) => [p, readyShare(personaReadiness(state, p))]));
  const personas = [...state.personas].sort((a, b) => (share.get(a) ?? -1) - (share.get(b) ?? -1));
  return (
    <View title="Personas" wide>
      <PageHeader title="Personas" lede="Who does it serve, and is it ready for them? Least ready first." />
      {personas.length ? (
        <table className="view-table ix-table">
          <thead>
            <tr>
              <th><Term id="persona" hoverOnly>Persona</Term></th>
              <th><Term id="readiness" hoverOnly>Readiness</Term></th>
              <th className="num"><Term id="capability" hoverOnly>Capabilities</Term></th>
              <th>Product gaps for them</th>
            </tr>
          </thead>
          <tbody>
            {personas.map((p) => (
              <PersonaRow key={p.id} state={state} persona={p} />
            ))}
          </tbody>
        </table>
      ) : (
        <Empty>No personas are written down yet.</Empty>
      )}
    </View>
  );
}

/* A persona's row: picture, name and role, readiness, how many capabilities serve them, and the product gaps in those. */
function PersonaRow({ state, persona }: { state: DocketState; persona: Persona }) {
  const { name, role } = personaNameAndRole(persona);
  const capabilities = persona.capabilities.flatMap((id) => find(state.capabilities, id) ?? []);
  const gaps = gapsById(state, [...new Set(capabilities.flatMap((c) => c.gaps))]);
  return (
    <tr>
      <td>
        <a className="ix-persona" href={docHref("persona", persona.id)}>
          <PersonaAvatar persona={persona} size={36} />
          <span className="ix-persona-text">
            <span className="ix-doc-name">{name}</span>
            {role ? <span className="ix-persona-role">{role}</span> : null}
          </span>
        </a>
      </td>
      <td>
        <ReadinessMark readiness={personaReadiness(state, persona)} of={`Readiness for ${name}`} />
      </td>
      <td className="num">
        <Num n={capabilities.length} />
      </td>
      <td>
        <GapsCell gaps={gaps} exposure={{ state, capabilities }} kind="product-gap" of={`what serves ${name}`} href={docHref("persona", persona.id, "left")} />
      </td>
    </tr>
  );
}
