import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";

/*
 * Readiness's one look: a plain pie, one slice filling clockwise from the
 * top as far as `percent`, in the current color (set it with `sx`), over a
 * faint disc of the same. Sized as the Ring is wherever they sit together,
 * with `figure` beside it, since text can't sit on a filled pie.
 * Decorative: what shows it says what it means.
 */
export function Pie({ percent, size, figure, sx }: { percent: number; size: number; figure?: string; sx?: SxProps<Theme> }) {
  const share = Math.min(Math.max(percent, 0), 100) / 100;
  const r = size / 2;
  const angle = share * 2 * Math.PI;
  const x = r + r * Math.sin(angle);
  const y = r - r * Math.cos(angle);
  return (
    <Box component="span" aria-hidden sx={[{ display: "inline-flex", alignItems: "center", gap: 0.75, flexShrink: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block", flexShrink: 0 }}>
        <circle cx={r} cy={r} r={r} fill="currentColor" opacity={0.18} />
        {share >= 1 ? (
          <circle cx={r} cy={r} r={r} fill="currentColor" />
        ) : share > 0 ? (
          <path d={`M ${r} ${r} L ${r} 0 A ${r} ${r} 0 ${share > 0.5 ? 1 : 0} 1 ${x} ${y} Z`} fill="currentColor" />
        ) : null}
      </svg>
      {figure === undefined ? null : (
        <Box component="span" sx={{ fontSize: 12, fontWeight: 700, lineHeight: 1, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
          {figure}
        </Box>
      )}
    </Box>
  );
}
