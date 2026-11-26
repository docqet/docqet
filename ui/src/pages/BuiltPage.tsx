import { plural } from "../Explore";
import { Term } from "../design/term/Term";
import { Excerpt } from "../design/markdown/Markdown";
import { docHref, type Route } from "../routes";
import { Empty, PageHeader, Tabs, View, currentTab, type TabDef } from "../shell/layout";
import { gapsById, type DocketState, type TechnicalDoc, type TechnicalKind } from "../state";
import { DocLink, GapsCell, Num } from "./indexParts";

/*
 * How the software is meant to be built: its mechanisms and its components,
 * a tab each. Each row says what it is, what relies on it, its technical gaps
 * with the worst one's impact, and how many tradeoffs and expected outcomes
 * it has. The one with the worst gap comes first.
 */
export default function BuiltPage({ state, route }: { state: DocketState; route: Route }) {
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
        lede="How is it meant to be built? Mechanisms work across a whole project or product; components are one area of the code. Worst gap first."
      />
      <Tabs tabs={tabs} current={tab} />
      {docs.length ? <TechnicalTable state={state} kind={kind} docs={docs} /> : <Empty>No {kind}s are written down yet.</Empty>}
    </View>
  );
}

function TechnicalTable({ state, kind, docs }: { state: DocketState; kind: TechnicalKind; docs: TechnicalDoc[] }) {
  const risk = (d: TechnicalDoc) => d.risk.score ?? -1;
  const rows = [...docs].sort((a, b) => risk(b) - risk(a) || b.gaps.length - a.gaps.length);
  return (
    <table className="view-table ix-table">
      <thead>
        <tr>
          <th>{kind === "component" ? "Component" : "Mechanism"}</th>
          <th>{kind === "component" ? "Relied on by" : "Applies to"}</th>
          <th>
            <Term id="technical-gap" hoverOnly>
              Technical gaps
            </Term>
          </th>
          <th className="num">
            <Term id="tradeoff" hoverOnly>
              Tradeoffs
            </Term>
          </th>
          <th className="num">Outcomes met</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((d) => (
          <tr key={d.id}>
            <td className="ix-tech-name">
              <DocLink kind={kind} id={d.id} name={d.name} />
              <Excerpt text={d.description} lines={1} className="ix-tech-desc" />
            </td>
            <td className="ix-nowrap">
              {plural(d.capabilities.length, "capability", "capabilities")}
              {kind === "mechanism" ? <span className="ix-where">{d.applies === "product" ? "Across its product" : "Across its project"}</span> : null}
            </td>
            <td className="ix-nowrap">
              <GapsCell gaps={gapsById(state, d.gaps)} risk={d.risk} kind="technical-gap" of={d.name} href={docHref(d.kind, d.id, "left")} />
            </td>
            <td className="num">
              <Num n={d.tradeoffs.length} />
            </td>
            <td className="num">
              <Num n={d.meets.length} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
