import Box from "@mui/material/Box";
import { STABILITY_LEVEL_IDS, stabilityStep, type StabilityMarkLevel } from "./stability";

/*
 * The Track: four cells, one per level from Prototype to GA, lit up to
 * `level` in the current text color, or none for Planned, so whatever sets the
 * level's color sets the Track's. Sized in em, so it scales with the text around it: 4px cells, 2px
 * apart, next to 12px text. Decorative: the mark around it carries the name.
 */
export function StabilityTrack({ level }: { level: StabilityMarkLevel }) {
  const step = stabilityStep(level);
  return (
    <Box
      component="span"
      aria-hidden
      /* At least 2px apart: a gap in em alone rounds to nothing at small sizes, and the cells run together. */
      sx={{ display: "inline-flex", flex: "none", gap: "max(2px, 0.1667em)", verticalAlign: "middle" }}
    >
      {STABILITY_LEVEL_IDS.map((id, index) => (
        <Box
          key={id}
          component="span"
          sx={{
            width: "0.3333em",
            height: "0.3333em",
            borderRadius: "0.0833em",
            bgcolor: index < step ? "currentColor" : "divider",
          }}
        />
      ))}
    </Box>
  );
}
