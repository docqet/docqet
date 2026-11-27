import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import { DetailsPopover } from "./popovers/DetailsPopover";
import Tooltip from "@mui/material/Tooltip";
import { Pie } from "./ring/Pie";
import { readinessBand, startedOf, type Readiness } from "../state";
import { ReadinessDetails } from "./popovers/ReadinessDetails";

/*
 * Readiness: how ready people can rely on it being, as a recommendation for
 * them to judge. What would raise it is its improvements (see Improvements). It's the maturity of its
 * capabilities less their exposure. It's drawn as maturity and exposure
 * are, at their sizes, but as a pie (see Pie) rather than a ring, in its
 * own color scale (readinessColor) rather than a band's: it isn't a level.
 * Its band's name takes the same color, as maturity's and exposure's take theirs.
 */

/* Readiness's color, for its pie and percentage: from grey, not ready at all, toward the theme's ready.high, blended by how ready. */
export const readinessColor = (percent: number) => (theme: Theme) =>
  `color-mix(in oklch, ${theme.vars.palette.ready.high} ${Math.min(Math.max(percent, 0), 100)}%, ${theme.vars.palette.ready.low})`;

/* Readiness in a few words: "Viable · 59%", or null with nothing started. */
export function readinessLabel(r: Readiness): string | null {
  const band = readinessBand(r);
  return band ? `${band.name} · ${r.percent}%` : null;
}

/* A readiness beside a name or in a row: its pie and percentage, then its band. `readiness` is a hook for a header's stat, which lays it out as maturity's and exposure's. */
const markSx: SystemStyleObject<Theme> = {
  flex: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: 1,
  fontSize: 13.5,
  color: "text.primary",
  whiteSpace: "nowrap",
};

/*
 * How ready something is, beside its name or in a row, as maturity and
 * exposure are: its pie, with the percentage beside it, then its band, "75%
 * Ready"; `bare`, as on a persona's card on the map, just the pie and the
 * percentage. `size` is the pie's diameter, 22 by default, as theirs is
 * beside a name. Its popover (hover, focus, or tap) breaks it down. With
 * nothing started, it says so. `of` heads the popover: "Readiness for
 * Maria". Inside something clickable, `inButton` opens the popover on hover
 * only, so a tap still reaches what it's in.
 */
export function ReadinessMark({
  readiness,
  of,
  inButton = false,
  bare = false,
  size = 22,
}: {
  readiness: Readiness;
  of: string;
  inButton?: boolean;
  bare?: boolean;
  size?: number;
}) {
  /* `readiness` on the mark: a hook for a header's stat, which lays it out as maturity's and exposure's. */
  const started = startedOf(readiness);
  if (!started || readiness.percent === null)
    return (
      <Tooltip title={readiness.notStarted.length ? "Only drafts so far, and drafts don't count." : "No capabilities yet."}>
        <Box component="span" className="readiness" sx={[markSx, { fontWeight: 500, color: "text.disabled" }]}>
          Nothing started
        </Box>
      </Tooltip>
    );
  const label = readinessLabel(readiness)!;
  const color = readinessColor(readiness.percent);
  return (
    <DetailsPopover hoverOnly={inButton} title={<ReadinessDetails readiness={readiness} of={of} />}>
      <Box
        component="span"
        className="readiness"
        role="img"
        aria-label={`${of}: ${label}`}
        tabIndex={inButton ? undefined : 0}
        sx={[markSx, !inButton && { borderRadius: 999, cursor: "help", "&:focus-visible": { outline: "2px solid currentColor", outlineOffset: 2 } }]}
      >
        <Pie percent={readiness.percent} size={size} figure={`${readiness.percent}%`} sx={{ color }} />
        {bare ? null : (
          <Box component="strong" sx={{ color }}>
            {readinessBand(readiness)!.name}
          </Box>
        )}
      </Box>
    </DetailsPopover>
  );
}
