import { useTheme } from "@mui/material/styles";
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

export default function Logo() {
  return (
    <span className="logo">
      <Mark />
      <span className="wordmark">docket</span>
    </span>
  );
}
