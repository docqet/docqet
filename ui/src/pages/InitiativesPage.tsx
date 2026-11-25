import { Term } from "../design/term/Term";
import { ReadinessMark } from "../Readiness";
import { docHref, type Route } from "../routes";
import { InitiativeIcon } from "../ScopeFilter";
import { Empty, PageHeader, View } from "../shell/layout";
import { capabilitiesById, find, gapsById, readinessOf, type Capability, type DocketState } from "../state";
import { GapsCell, Num } from "./indexParts";

/*
 * The bodies of work, such as the MVP, and how ready each is: a row each,
 * with how many capabilities are in it, who it's for, and the product gaps in its
 * capabilities. Like every page, it counts only the scope showing.
 */
export default function InitiativesPage({ state }: { state: DocketState; route: Route }) {
  return (
    <View title="Initiatives" wide>
      <PageHeader
        title="Initiatives"
        lede="Bodies of work, such as the MVP, and how ready each is. The scope at the top shows any one of them on every page."
      />
      {state.initiatives.length ? (
        <table className="view-table ix-table">
          <thead>
            <tr>
              <th><Term id="initiative" hoverOnly>Initiative</Term></th>
              <th><Term id="readiness" hoverOnly>Readiness</Term></th>
              <th className="num"><Term id="capability" hoverOnly>Capabilities</Term></th>
              <th className="num"><Term id="persona" hoverOnly>Personas</Term></th>
              <th>Product gaps in it</th>
            </tr>
          </thead>
          <tbody>
            {state.initiatives.map((i) => (
              <Row
                key={i.id}
                state={state}
                name={i.name}
                note={i.description}
                href={docHref("initiative", i.id)}
                left={docHref("initiative", i.id, "left")}
                capabilities={capabilitiesById(state, i.capabilities)}
                personas={i.personas.filter((id) => find(state.personas, id)).length}
              />
            ))}
          </tbody>
        </table>
      ) : (
        <Empty>No initiatives are written down yet.</Empty>
      )}
    </View>
  );
}

/* A row: the name, readiness, how many capabilities are in it, and the product gaps in those. */
function Row({ state, name, note, href, left, capabilities, personas }: { state: DocketState; name: string; note?: string; href: string; left: string; capabilities: Capability[]; personas: number }) {
  const gaps = gapsById(state, [...new Set(capabilities.flatMap((c) => c.gaps))]);
  return (
    <tr>
      <td>
        <a className="ix-persona" href={href}>
          <InitiativeIcon size={20} />
          <span className="ix-persona-text">
            <span className="ix-doc-name">{name}</span>
            {note ? <span className="ix-persona-role">{note}</span> : null}
          </span>
        </a>
      </td>
      <td>
        <ReadinessMark readiness={readinessOf(state, capabilities)} of={`Readiness of ${name}`} />
      </td>
      <td className="num">
        <Num n={capabilities.length} />
      </td>
      <td className="num">
        <Num n={personas} />
      </td>
      <td>
        <GapsCell gaps={gaps} exposure={{ state, capabilities }} kind="product-gap" of={name} href={left} />
      </td>
    </tr>
  );
}
