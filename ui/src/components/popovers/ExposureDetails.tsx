import Box from "@mui/material/Box";
import { exposureText, type Gap, type RiskAcross, type Exposure } from "../../state";
import { DetailsCard, DetailsEyebrow, DetailsHead, DetailsWorkings } from "./DetailsPopover";
import { RISK_BAND_COLORS, RiskRing } from "../risk/RiskRing";
import { VerdictSpread } from "../risk/RiskScore";

/*
 * The exposure of some capabilities, for its popover: its band and what that
 * puts at stake, the share, how the gaps on them spread across the
 * verdicts, how it's worked out, and that it isn't their stability. `of`
 * names what it's of, as a phrase: "Scheduling", "what serves Mira".
 */
export function ExposureDetails<T extends Gap>({ risk, exposure, of }: { risk: RiskAcross<T>; exposure: Exposure; of: string }) {
  const band = exposure.band!;
  const n = exposure.capabilities;
  return (
    <DetailsCard card width={320}>
      <DetailsEyebrow>Exposure of {of}</DetailsEyebrow>
      <Box sx={{ mt: 1.25, display: "flex", alignItems: "center", gap: 1.5 }}>
        <RiskRing percent={exposure.percent!} size={56} band={band.id} />
        <div>
          <Box sx={{ fontSize: "1.12em", fontWeight: 700, color: RISK_BAND_COLORS[band.id] }}>{band.name}</Box>
          <Box sx={{ color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>{exposureText(exposure.percent!)} of the most it could be exposed to</Box>
        </div>
      </Box>
      <Box sx={{ mt: 1.25 }}>{band.says}</Box>
      {exposure.unacceptable ? (
        <Box sx={{ mt: 1 }}>
          {risk.counts.unacceptable === 1 ? "A gap here is" : "Gaps here are"} unacceptable, so it&rsquo;s at least moderate, whatever the share.
        </Box>
      ) : null}
      <DetailsHead>
        {risk.items.length} {risk.items.length === 1 ? "gap" : "gaps"} by risk
      </DetailsHead>
      <VerdictSpread risk={risk} />
      <Box sx={{ mt: 1.25, color: "text.secondary", fontSize: "0.92em" }}>
        Exposure is to risk what maturity is to stability: one figure for the whole. It isn&rsquo;t stability. Each capability&rsquo;s level is declared, and
        says how much people can depend on it; this is what the gaps still open against those levels put at stake.
      </Box>
      <DetailsWorkings>
        <div>
          Each capability is exposed to its riskiest gap&rsquo;s share of the most it could be: a certain, damaging gap reaching everyone that breaks a claim
          its level makes.
        </div>
        <div>
          Its {n} {n === 1 ? "capability" : "capabilities"} then count by their level, GA most, as in maturity. Drafts don&rsquo;t count. Each quarter is a
          band: low, minor, moderate and high.
        </div>
      </DetailsWorkings>
    </DetailsCard>
  );
}
