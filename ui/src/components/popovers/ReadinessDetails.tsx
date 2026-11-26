import Box from "@mui/material/Box";
import { DetailsCard, DetailsEyebrow, DetailsWorkings } from "./DetailsPopover";
import { levelColor } from "../stability/stability";
import { LevelSpread } from "../stability/StabilitySpread";
import { RingGlyph } from "../maturity/RingGlyph";
import { MATURITY_BANDS, maturityBand } from "../maturity/maturity";
import { RiskRing } from "../risk/RiskRing";
import { VerdictSpread } from "../risk/RiskScore";
import { Pie } from "../ring/Pie";
import { exposureText, readinessBand, startedOf, type Readiness } from "../../state";
import { readinessColor } from "../Readiness";
import { plural } from "../names";

/*
 * Readiness for its popover, laid out as maturity's and exposure's are:
 * its quarter, percentage and bar, what that recommends, then why it's
 * there: the maturity and exposure it's worked out from, each as its
 * ring, and how its capabilities spread across the levels and its gaps
 * across the verdicts. Then what readiness is, and how it's worked out.
 * What each capability still needs is on the page, not here.
 */
export function ReadinessDetails({ readiness, of }: { readiness: Readiness; of: string }) {
  const started = startedOf(readiness);
  const { exposure, levels, gaps } = readiness;
  const maturity = Math.round(readiness.maturity!);
  const band = maturityBand(maturity);
  return (
    <DetailsCard card width={320}>
      <DetailsEyebrow>{of}</DetailsEyebrow>
      <Box sx={{ mt: 1.25, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Pie percent={readiness.percent!} size={56} sx={{ color: readinessColor(readiness.percent!) }} />
        <div>
          <Box sx={{ fontSize: "1.12em", fontWeight: 700, color: readinessColor(readiness.percent!) }}>{readinessBand(readiness)!.name}</Box>
          <Box sx={{ color: readinessColor(readiness.percent!), fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{readiness.percent}%</Box>
        </div>
      </Box>
      <Box sx={{ mt: 1.25 }}>{readinessBand(readiness)!.says}</Box>
      <div className="readiness-factors">
        <div className="readiness-factor">
          <RingGlyph progress={maturity} size={40} />
          <div>
            <div className="readiness-factor-name">Maturity</div>
            <Box component="strong" sx={levelColor(band)}>
              {MATURITY_BANDS[band]}
            </Box>
          </div>
        </div>
        {exposure.percent !== null && exposure.band ? (
          <div className="readiness-factor" data-risk-band={exposure.band.id}>
            <RiskRing percent={exposure.percent} size={40} />
            <div>
              <div className="readiness-factor-name">Exposure</div>
              <Box component="strong" sx={{ color: "var(--risk-band)" }}>
                {exposure.band.name}
              </Box>
            </div>
          </div>
        ) : null}
      </div>
      <div className="risk-details-head">{plural(levels.length, "capability", "capabilities")} by level</div>
      <LevelSpread levels={levels} />
      {gaps.items.length ? (
        <>
          <div className="risk-details-head">{plural(gaps.items.length, "gap", "gaps")} by risk</div>
          <VerdictSpread risk={gaps} />
        </>
      ) : null}
      <Box sx={{ mt: 1.25, color: "text.secondary", fontSize: "0.92em" }}>
        Our view of how ready this is to serve people in production, from the stability levels, gaps and impacts written down, for you to judge.
      </Box>
      <DetailsWorkings>
        <div className="details-workings-sum">
          {maturity}% mature × (1 − {exposureText(exposure.percent ?? 0)} exposure) = {readiness.percent}%
        </div>
        <div>
          Its maturity, less the share of the most its open gaps could put at stake, both from its{" "}
          {plural(started, "started capability", "started capabilities")}. Drafts don&rsquo;t count.
        </div>
        <div>Each quarter is a band: unready, partial, viable and ready.</div>
      </DetailsWorkings>
    </DetailsCard>
  );
}
