import { Term } from "../../components/term/Term";
import { ReadinessMark } from "../../components/Readiness";
import { docHref, type Route } from "../../routes";
import { InitiativeIcon } from "../../components/shell/ScopeFilter";
import { Empty, PageHeader, View } from "../../components/shell/layout";
import { capabilitiesById, find, gapsById, type Capability, type DocketState, type Initiative } from "../../state";
import { GapsCell, Num } from "../../components/indexParts";

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
              <th>
                <Term id="initiative" hoverOnly>
                  Initiative
                </Term>
              </th>
              <th>
                <Term id="readiness" hoverOnly>
                  Readiness
                </Term>
              </th>
              <th className="num">
                <Term id="capability" hoverOnly>
                  Capabilities
                </Term>
              </th>
              <th className="num">
                <Term id="persona" hoverOnly>
                  Personas
                </Term>
              </th>
              <th>Product gaps in it</th>
            </tr>
          </thead>
          <tbody>
            {state.initiatives.map((i) => (
              <Row key={i.id} state={state} initiative={i} />
            ))}
          </tbody>
        </table>
      ) : (
        <Empty>No initiatives are written down yet.</Empty>
      )}
    </View>
  );
}

/* An initiative's row: the name, readiness, how many capabilities and personas are in it, and the product gaps in those capabilities. */
function Row({ state, initiative: i }: { state: DocketState; initiative: Initiative }) {
  const { name, description: note } = i;
  const href = docHref("initiative", i.id);
  const left = docHref("initiative", i.id, "left");
  const capabilities: Capability[] = capabilitiesById(state, i.capabilities);
  const personas = i.personas.filter((id) => find(state.personas, id)).length;
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
        <ReadinessMark readiness={i.readiness} of={`Readiness of ${name}`} />
      </td>
      <td className="num">
        <Num n={capabilities.length} />
      </td>
      <td className="num">
        <Num n={personas} />
      </td>
      <td>
        <GapsCell gaps={gaps} exposure={{ exposure: i.exposure, risk: i.readiness.gaps }} kind="product-gap" of={name} href={left} />
      </td>
    </tr>
  );
}
