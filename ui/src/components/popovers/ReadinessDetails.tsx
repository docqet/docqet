import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import { DetailsCard, DetailsEyebrow, DetailsHead, DetailsWorkings } from "./DetailsPopover";
import { levelColor } from "../stability/stability";
import { LevelSpread } from "../stability/StabilitySpread";
import { RingGlyph } from "../maturity/RingGlyph";
import { MATURITY_BANDS, maturityBand } from "../maturity/maturity";
import { RISK_BAND_COLORS, RiskRing } from "../risk/RiskRing";
import { VerdictSpread } from "../risk/RiskScore";
import { Pie } from "../ring/Pie";
import { exposureText, readinessBand, startedOf, type Readiness } from "../../state";
import { readinessColor } from "../Readiness";
import { plural } from "../names";

/* One of the two figures readiness is worked out from: its ring, then its name over its band. */
function Factor({ ring, name, children }: { ring: ReactNode; name: string; children: ReactNode }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0, lineHeight: 1.3 }}>
      {ring}
      <div>
        <Box sx={{ fontSize: "0.92em", color: "text.secondary" }}>{name}</Box>
        {children}
      </div>
    </Box>
  );
}

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
  const color = readinessColor(readiness.percent!);
  return (
    <DetailsCard card width={320}>
      <DetailsEyebrow>{of}</DetailsEyebrow>
      <Box sx={{ mt: 1.25, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Pie percent={readiness.percent!} size={56} sx={{ color }} />
        <div>
          <Box sx={{ fontSize: "1.12em", fontWeight: 700, color }}>{readinessBand(readiness)!.name}</Box>
          <Box sx={{ color, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{readiness.percent}%</Box>
        </div>
      </Box>
      <Box sx={{ mt: 1.25 }}>{readinessBand(readiness)!.says}</Box>
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mt: 1.5 }}>
        <Factor ring={<RingGlyph progress={maturity} size={40} />} name="Maturity">
          <Box component="strong" sx={levelColor(band)}>
            {MATURITY_BANDS[band]}
          </Box>
        </Factor>
        {exposure.percent !== null && exposure.band ? (
          <Factor ring={<RiskRing percent={exposure.percent} size={40} band={exposure.band.id} />} name="Exposure">
            <Box component="strong" sx={{ color: RISK_BAND_COLORS[exposure.band.id] }}>
              {exposure.band.name}
            </Box>
          </Factor>
        ) : null}
      </Box>
      <DetailsHead>{plural(levels.length, "capability", "capabilities")} by level</DetailsHead>
      <LevelSpread levels={levels} />
      {gaps.items.length ? (
        <>
          <DetailsHead>{plural(gaps.items.length, "gap", "gaps")} by risk</DetailsHead>
          <VerdictSpread risk={gaps} />
        </>
      ) : null}
      <Box sx={{ mt: 1.25, color: "text.secondary", fontSize: "0.92em" }}>
        Our view of how ready this is to serve people in production, from the stability levels, gaps and impacts written down, for you to judge.
      </Box>
      <DetailsWorkings>
        <Box sx={{ color: "text.primary", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
          {maturity}% mature × (1 − {exposureText(exposure.percent ?? 0)} exposure) = {readiness.percent}%
        </Box>
        <div>
          Its maturity, less the share of the most its open gaps could put at stake, both from its{" "}
          {plural(started, "started capability", "started capabilities")}. Drafts don&rsquo;t count.
        </div>
        <div>Each quarter is a band: unready, partial, viable and ready.</div>
      </DetailsWorkings>
    </DetailsCard>
  );
}
