import Box from "@mui/material/Box";
import type { CapabilityLevel } from "../../state";
import { DetailsCard, DetailsEyebrow } from "./DetailsPopover";
import { StabilityTrack } from "../stability/StabilityTrack";
import { SpreadSwatch, StabilitySpreadBar, levelTone, spreadOf } from "../stability/StabilitySpread";
import { levelName } from "../stability/stability";

export function StabilitySpreadDetails({ levels, of }: { levels: CapabilityLevel[]; of: string }) {
  return (
    <DetailsCard card width={300}>
      <DetailsEyebrow>Stability spread in {of}</DetailsEyebrow>
      <Box sx={{ mt: 1.25 }}>
        <StabilitySpreadBar levels={levels} wide />
      </Box>
      <Box component="ul" sx={{ display: "flex", flexDirection: "column", gap: "3px", mt: 1.25 }}>
        {spreadOf(levels).map(({ level, n }) => (
          <Box component="li" key={level ?? "draft"} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
            <Box
              component="span"
              sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, fontWeight: 600, color: level ? levelTone(level) : "text.secondary" }}
            >
              <SpreadSwatch color={level ? levelTone(level) : undefined} draft={!level} />
              {level ? <StabilityTrack level={level} /> : null}
              {levelName(level)}
            </Box>
            <Box component="span" sx={{ fontWeight: 650, fontVariantNumeric: "tabular-nums", color: level ? levelTone(level) : "text.primary" }}>
              {n}
            </Box>
          </Box>
        ))}
      </Box>
      <Box sx={{ mt: 1, color: "text.secondary", fontSize: "0.92em" }}>
        How many capabilities are at each level, counted once each at their level in short. Maturity is worked out from it; drafts don&rsquo;t count there.
      </Box>
    </DetailsCard>
  );
}
