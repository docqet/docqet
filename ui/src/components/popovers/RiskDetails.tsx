import Box from "@mui/material/Box";
import { type Gap, type RiskAcross } from "../../state";
import { DetailsCard, DetailsEyebrow } from "./DetailsPopover";
import { plainText } from "../markdown/Markdown";
import { RiskWorkings } from "./RiskWorkings";
import { VERDICT_NAMES, VerdictSpread } from "../risk/RiskScore";

/*
 * The risk across several, for its popover. One alone is shown as it would
 * be on its own: how its risk is worked out. Several show their highest
 * risk, how they spread across the verdicts, as a bar split by how many fall
 * in each, and the riskiest few with their scores, out of how many. How each
 * is worked out is on the gap itself.
 */
export function RiskDetails<T extends Gap>({ risk, of }: { risk: RiskAcross<T>; of: string }) {
  const riskiest = risk.items.slice(0, 3);
  const alone = risk.items.length === 1 ? risk.items[0] : null;
  return (
    <DetailsCard card width={320}>
      <div className="risk-details" data-verdict={risk.verdict ?? "none"}>
        <DetailsEyebrow>{alone ? `Risk in ${of}` : `Risk spread in ${of}`}</DetailsEyebrow>
        {alone ? (
          <>
            <Box sx={{ mt: 1, display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1 }}>
              <Box className="risk-details-verdict" sx={{ fontSize: "1.12em", fontWeight: 700 }}>
                {VERDICT_NAMES[alone.verdict].name}
              </Box>
              <Box sx={{ color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>{alone.score} of 100</Box>
            </Box>
            <Box sx={{ mt: 1, fontWeight: 600 }}>{plainText(alone.item.name)}</Box>
            {alone.on ? (
              <Box sx={{ mt: 1.25 }}>
                <RiskWorkings risk={alone.risk} on={alone.on} />
              </Box>
            ) : null}
          </>
        ) : (
          <>
            <VerdictSpread risk={risk} />
            {riskiest.length ? (
              <>
                <div className="risk-details-head">Riskiest</div>
                <ul className="risk-riskiest">
                  {riskiest.map(({ item, score, verdict }) => (
                    <li key={item.id}>
                      <span className="risk-riskiest-name">{plainText(item.name)}</span>
                      <span className="risk-on-score" data-verdict={verdict}>
                        {score}
                      </span>
                    </li>
                  ))}
                </ul>
                {risk.items.length > riskiest.length ? (
                  <div className="risk-note">
                    The {riskiest.length} riskiest of {risk.items.length} gaps.
                  </div>
                ) : null}
              </>
            ) : null}
          </>
        )}
      </div>
    </DetailsCard>
  );
}
