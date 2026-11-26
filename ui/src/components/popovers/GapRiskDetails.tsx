import Box from "@mui/material/Box";
import { verdictOf, type Risk, type RiskOn } from "../../state";
import { VERDICT_COLORS, VERDICT_NAMES } from "../risk/RiskScore";
import { DetailsCard, DetailsEyebrow } from "./DetailsPopover";
import { RiskWorkings } from "./RiskWorkings";

/* One gap's risk on `on`, the capability it scores highest on there: its verdict, its score, and how it's worked out. */
export function GapRiskDetails({ risk, on }: { risk: Risk; on: RiskOn }) {
  const verdict = verdictOf(on.score);
  return (
    <DetailsCard card width={340}>
      <DetailsEyebrow>How its risk is worked out</DetailsEyebrow>
      <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1, mt: 1, mb: 1.5, fontSize: "1.05em", fontWeight: 700 }}>
        <Box component="span" sx={{ color: VERDICT_COLORS[verdict] }}>
          {VERDICT_NAMES[verdict].name}
        </Box>
        <Box component="span" sx={{ fontWeight: 500, color: "text.secondary" }}>
          {on.score} of 100
        </Box>
      </Box>
      <RiskWorkings risk={risk} on={on} />
    </DetailsCard>
  );
}
