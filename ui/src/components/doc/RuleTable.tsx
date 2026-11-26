import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import { Excerpt } from "../markdown/Markdown";
import { Term } from "../term/Term";
import { StandingMark } from "../standing/StandingMark";
import { RULE_STANDING_LABELS, plural } from "../names";
import { type Capability, type DocketState, type Rule } from "../../state";
import { docHref } from "../../routes";
import { Empty } from "../shell/layout";
import { CapabilityTable } from "./CapabilityTable";

/* Where something stands: each of its capabilities, with its stability beside what's left on it. Past `limit`, a link to them all. */
export function StandingSummary({
  state,
  capabilities,
  domain,
  limit = 8,
  all,
}: {
  state: DocketState;
  capabilities: Capability[];
  domain?: string;
  limit?: number;
  all: string;
}) {
  const shown = capabilities.slice(0, limit);
  return (
    <>
      <CapabilityTable state={state} capabilities={shown} domain={domain} technical={false} compact />
      {capabilities.length > shown.length ? (
        <p className="page-line">
          <a href={all}>See all {capabilities.length} capabilities</a>
        </p>
      ) : null}
    </>
  );
}

/* How a rule stands for a capability, in a few words. */
export const STANDING_SHORT = { gap: "Not held yet", evidence: "Held, with evidence", trust: "Held, on trust" } as const;

export const placesOf = (r: Rule) => r.evidence.verifies.length + r.evidence.implements.length;

/*
 * Rules as a table: each one's name, opening its page, with why it exists
 * under it. With `capability`, whether that capability holds to it, the ones
 * a gap says it doesn't first; otherwise how many capabilities follow it and
 * how many places are its evidence. Evidence is optional, so none is no
 * warning.
 */
export function RuleTable({ rules, capability }: { rules: Rule[]; capability?: Capability }) {
  if (!rules.length) return <Empty>None written down yet.</Empty>;
  const sorted = capability
    ? [...rules].sort((a, b) => Number(capability.ruleStandings[b.id] === "gap") - Number(capability.ruleStandings[a.id] === "gap"))
    : rules;
  return (
    <div className="page-table-scroll">
      <table className="view-table page-rule-table">
        <thead>
          <tr>
            <th>
              <Term id="rule" hoverOnly>
                Rule
              </Term>
            </th>
            {capability ? <th>Standing</th> : <th className="num">Followed by</th>}
            <th className="num">
              <Term id="evidence" hoverOnly>
                Evidence
              </Term>
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => {
            const standing = capability ? capability.ruleStandings[r.id] : null;
            const places = placesOf(r);
            return (
              <tr key={r.id}>
                <td>
                  <span className="page-rule-cell">
                    {standing ? (
                      <StandingMark standing={standing} label={RULE_STANDING_LABELS[standing]} />
                    ) : (
                      <RuleRoundedIcon sx={{ fontSize: 15, color: "text.secondary", flex: "none", mt: "2px" }} />
                    )}
                    <span>
                      <a href={docHref("rule", r.id)}>{r.name}</a>
                      <Excerpt text={r.why} lines={2} className="page-cell-sub" />
                    </span>
                  </span>
                </td>
                {standing ? (
                  <td className="page-standing-cell" data-tone={standing === "gap" ? "warn" : undefined}>
                    {STANDING_SHORT[standing]}
                  </td>
                ) : (
                  <td className="num">{r.capabilities.length || <span className="faint">None</span>}</td>
                )}
                <td className="num">{places ? plural(places, "place", "places") : <span className="faint">None</span>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
