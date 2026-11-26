import { Excerpt } from "../markdown/Markdown";
import { Term } from "../term/Term";
import { LeftSummary, leftOf } from "../left/LeftSummary";
import { InitiativeTags } from "../Initiatives";
import { find, leftCount, type Capability, type DocketState } from "../../state";
import { docHref } from "../../routes";
import { Empty } from "../shell/layout";
import { LevelName } from "./DocPage";
import { Avatars } from "./DocPage";

/*
 * Capabilities as a table: each one's name, opening its page, its level (in
 * `domain`, when given), what's left about it, opening that tab of its page,
 * and who it serves. With `technical` false, as for a persona, what's left is
 * only what someone using the product would notice.
 */
export function CapabilityTable({
  state,
  capabilities,
  domain,
  technical = true,
  compact = false,
}: {
  state: DocketState;
  capabilities: Capability[];
  domain?: string;
  technical?: boolean;
  /* Just each one's level, name and what's left, for where it stands. */
  compact?: boolean;
}) {
  if (!capabilities.length) return <Empty>None yet.</Empty>;
  return (
    <div className="page-table-scroll">
      <table className="view-table page-cap-table">
        <thead>
          <tr>
            <th>
              <Term id="capability" hoverOnly>
                Capability
              </Term>
            </th>
            <th>Level</th>
            <th>
              <Term id="gap" hoverOnly>
                What's left
              </Term>
            </th>
            {compact ? null : (
              <th>
                <Term id="persona" hoverOnly>
                  Serves
                </Term>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {capabilities.map((c) => {
            const level = (domain && c.levels.find((l) => l.domain === domain)?.level) || c.stability;
            const left = leftOf(c, technical);
            return (
              <tr key={c.id}>
                <td>
                  <a href={docHref("capability", c.id)}>{c.name}</a>
                  <InitiativeTags state={state} ids={c.initiatives} />
                  {compact ? null : <Excerpt text={c.description} lines={1} className="page-cell-sub" />}
                </td>
                <td>
                  <LevelName level={level} name={c.name} />
                </td>
                <td>
                  {leftCount(left) ? (
                    <a className="page-left-cell" href={docHref("capability", c.id, "left")}>
                      <LeftSummary left={left} />
                    </a>
                  ) : (
                    <span className="faint">Nothing open</span>
                  )}
                </td>
                {compact ? null : (
                  <td>
                    <Avatars personas={c.personas.flatMap((id) => find(state.personas, id) ?? [])} />
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
