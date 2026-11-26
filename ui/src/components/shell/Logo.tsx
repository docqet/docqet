import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { ResponsiveStyleValue } from "@mui/system";
import { useId } from "react";

/*
 * Docqet's mark, a folded page shaped as a capital "D" on a violet tile, and
 * its wordmark. The page holds two rules, each a track for what's meant and a
 * fill for what's met: one met, one halfway. The tile is the theme's brand
 * colors, the same in both schemes, since it holds up on light and dark
 * backgrounds alike. docs/assets/logo/ has it as files.
 */
export function Mark({ size = 28 }: { size?: number }) {
  const gradient = useId();
  const brand = useTheme().vars.palette.brand;
  /* Under 24px a paler track disappears, and the halfway rule reads as a short one. */
  const track = size <= 24 ? brand.trackSmall : brand.track;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <defs>
        <linearGradient id={gradient} x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop style={{ stopColor: brand.light }} />
          <stop offset=".55" style={{ stopColor: brand.main }} />
          <stop offset="1" style={{ stopColor: brand.dark }} />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="9" fill={`url(#${gradient})`} />
      <rect x="1.5" y="1.5" width="29" height="29" rx="8.5" style={{ stroke: brand.mark }} strokeOpacity=".2" />
      <path d="M12 7H15.5C21.3 7 25 10.9 25 16.2C25 21.5 21.3 25.5 15.5 25.5H9A1.5 1.5 0 0 1 7.5 24V11.5Z" style={{ fill: brand.mark }} />
      <path d="M12 7V11.5H7.5Z" style={{ fill: brand.fold }} />
      <rect x="10.7" y="13.55" width="10.77" height="2.4" rx="1.2" style={{ fill: brand.fill }} />
      <rect x="10.7" y="18.15" width="10.14" height="2.4" rx="1.2" style={{ fill: track }} />
      <rect x="10.7" y="18.15" width="5.07" height="2.4" rx="1.2" style={{ fill: brand.fill }} />
    </svg>
  );
}

/* The mark and wordmark. `wordmark` says where the word shows, such as `{ sm: "none", md: "inline" }` to leave the mark alone in a crowded bar. */
export default function Logo({ wordmark = "inline" }: { wordmark?: ResponsiveStyleValue<"inline" | "none"> }) {
  return (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: "9px" }}>
      <Mark />
      <Box
        component="span"
        sx={{
          display: wordmark,
          fontWeight: 650,
          fontSize: 19,
          letterSpacing: "-0.03em",
          background: (t) => `linear-gradient(120deg, ${t.vars.palette.text.primary} 30%, ${t.vars.palette.primary.main} 100%)`,
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
        }}
      >
        docqet
      </Box>
    </Box>
  );
}
