import Box from "@mui/material/Box";
import type { CapabilityLevel } from "../../state";
import { DetailsCard, DetailsEyebrow } from "./DetailsPopover";
import { StabilityTrack } from "../stability/StabilityTrack";
import { SpreadSwatch, StabilitySpreadBar, levelName, levelVar, spreadOf } from "../stability/StabilitySpread";

export function StabilitySpreadDetails({ levels, of }: { levels: CapabilityLevel[]; of: string }) {
  return (
    <DetailsCard card width={300}>
      <DetailsEyebrow>Stability spread in {of}</DetailsEyebrow>
      <Box sx={{ mt: 1.25 }}>
        <StabilitySpreadBar levels={levels} wide />
      </Box>
      <ul className="stability-spread-counts">
        {spreadOf(levels).map(({ level, n }) => (
          <Box component="li" key={level ?? "draft"} sx={level ? levelVar(level) : undefined}>
            <span className="stability-spread-name">
              <SpreadSwatch draft={!level} />
              {level ? <StabilityTrack level={level} /> : null}
              {levelName(level)}
            </span>
            <span className="stability-spread-n">{n}</span>
          </Box>
        ))}
      </ul>
      <Box sx={{ mt: 1, color: "text.secondary", fontSize: "0.92em" }}>
        How many capabilities are at each level, counted once each at their level in short. Maturity is worked out from it; drafts don&rsquo;t count there.
      </Box>
    </DetailsCard>
  );
}
