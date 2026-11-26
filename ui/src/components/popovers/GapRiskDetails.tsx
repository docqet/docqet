import { verdictOf, type Risk, type RiskOn } from "../../state";
import { VERDICT_NAMES } from "../risk/RiskScore";
import { DetailsCard, DetailsEyebrow } from "./DetailsPopover";
import { RiskWorkings } from "./RiskWorkings";

/* One gap's risk on `on`, the capability it scores highest on there: its verdict, its score, and how it's worked out. */
export function GapRiskDetails({ risk, on }: { risk: Risk; on: RiskOn }) {
  const verdict = verdictOf(on.score);
  return (
    <DetailsCard card width={340}>
      <div className="risk-details" data-verdict={verdict}>
        <DetailsEyebrow>How its risk is worked out</DetailsEyebrow>
        <div className="gap-risk-head">
          <span className="risk-details-verdict">{VERDICT_NAMES[verdict].name}</span>
          <span>{on.score} of 100</span>
        </div>
        <RiskWorkings risk={risk} on={on} />
      </div>
    </DetailsCard>
  );
}
