import Box from "@mui/material/Box";
import type { RubricQuality } from "../../state";
import { StabilityMark } from "../stability/StabilityMark";
import { DetailsCard, DetailsEyebrow } from "./DetailsPopover";

/* What a quality of the rubric is about, and how much each level asks of it. */
export function QualityDetails({ quality }: { quality: RubricQuality }) {
  return (
    <DetailsCard card width={380}>
      <DetailsEyebrow>Quality</DetailsEyebrow>
      <strong>{quality.question}</strong>
      <Box component="p" sx={{ mt: 0.5, color: "text.secondary" }}>
        {quality.why}
      </Box>
      <Box component="ul" sx={{ display: "grid", gap: 0.75, mt: 1.25, pt: 1.25, borderTop: 1, borderColor: "divider" }}>
        {quality.levels.map((l) => (
          <Box component="li" key={l.level} sx={{ display: "grid", gridTemplateColumns: "84px minmax(0, 1fr)", alignItems: "baseline", gap: 1 }}>
            <StabilityMark level={l.level} statement={false} focusable={false} />
            <Box component="span" sx={l.summary ? undefined : { color: "text.disabled" }}>
              {l.summary ?? "Nothing expected."}
            </Box>
          </Box>
        ))}
      </Box>
    </DetailsCard>
  );
}
