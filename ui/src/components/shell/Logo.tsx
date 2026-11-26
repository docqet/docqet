import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { ResponsiveStyleValue } from "@mui/system";
import { useId } from "react";

/*
 * Docket's mark, a geometric "d" on a violet tile with a status light, and
 * its wordmark. The tile is the theme's brand colors, the same in both
 * schemes, since it holds up on light and dark backgrounds alike.
 */
export function Mark({ size = 28 }: { size?: number }) {
  const gradient = useId();
  const brand = useTheme().vars.palette.brand;
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
      <circle cx="14.5" cy="18" r="5.5" style={{ stroke: brand.mark }} strokeWidth="3.2" />
      <path d="M20.5 8v15.5" style={{ stroke: brand.mark }} strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="9.5" cy="9.5" r="1.9" style={{ fill: brand.dot }} />
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
        docket
      </Box>
    </Box>
  );
}
