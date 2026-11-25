import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";

/* Below this diameter the figure won't fit inside, so it sits beside the ring. */
const FIGURE_INSIDE_FROM = 40;

/*
 * The one ring maturity and exposure are both drawn as: four quarter
 * arcs, clockwise from the top, each filled as far as `percent` reaches into
 * it, in the current color (set it with `sx`), over the divider color, with
 * `figure` in the middle, or beside a small ring. Each quarter is a band of
 * what it shows. Decorative: what shows it says what it means.
 */
export function Ring({ percent, size, figure, sx }: { percent: number; size: number; figure?: string; sx?: SxProps<Theme> }) {
  const value = Math.min(Math.max(percent, 0), 100);
  const fills = [0, 1, 2, 3].map((q) => Math.min(Math.max((value - q * 25) / 25, 0), 1));
  const stroke = Math.max(3, Math.round(size / 11));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const quarter = circumference / 4;
  /* The gap between quarters, as a length along the ring, centred on each corner. */
  const gap = stroke * 0.9;
  const arc = quarter - gap;
  const inside = size >= FIGURE_INSIDE_FROM;

  const text =
    figure === undefined ? null : (
      <Box
        component="span"
        sx={{
          fontSize: inside ? Math.round(size * 0.26) : 12,
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: inside ? "-0.02em" : 0,
          fontVariantNumeric: "tabular-nums",
          whiteSpace: "nowrap",
        }}
      >
        {figure}
      </Box>
    );

  return (
    <Box
      component="span"
      aria-hidden
      sx={[{ display: "inline-flex", alignItems: "center", gap: 0.75, flexShrink: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Box component="span" sx={{ position: "relative", display: "inline-grid", placeItems: "center", flexShrink: 0, width: size, height: size }}>
        <Box component="svg" viewBox={`0 0 ${size} ${size}`} sx={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
          {fills.map((fill, index) => {
            const common = {
              cx: size / 2,
              cy: size / 2,
              r: radius,
              fill: "none",
              strokeWidth: stroke,
              strokeDashoffset: -(index * quarter + gap / 2),
            };
            return (
              <g key={index}>
                <Box component="circle" {...common} strokeDasharray={`${arc} ${circumference}`} sx={(theme) => ({ stroke: theme.vars.palette.divider })} />
                {fill > 0 ? <circle {...common} stroke="currentColor" strokeDasharray={`${arc * fill} ${circumference}`} /> : null}
              </g>
            );
          })}
        </Box>
        {inside ? text : null}
      </Box>
      {inside ? null : text}
    </Box>
  );
}
