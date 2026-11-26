import type { Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";

/*
 * An icon that's a link or button in the top bar: muted, lit in the accent
 * when hovered or when it's where the reader is. Roomier on a phone, where
 * it's tapped.
 */
export const barIconSx: SystemStyleObject<Theme> = {
  display: "inline-flex",
  flex: "none",
  p: { xs: 1.25, sm: 0.75 },
  color: "text.secondary",
  borderRadius: "6px",
  "&:hover, &[aria-current=page]": { color: "primary.main", bgcolor: "surface.accentSoft" },
};
