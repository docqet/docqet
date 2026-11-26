import Box from "@mui/material/Box";
import { MATURITY_BANDS, maturityBand } from "./maturity";
import { MaturityRing } from "./MaturityRing";
import type { MaturitySubject } from "../popovers/MaturityDetails";
import { levelColor } from "../stability/stability";
import { type CapabilityLevel } from "../../state";
import Tooltip from "@mui/material/Tooltip";

/* Maturity beside a name. `explore-level` is a hook for a header's stat, which lays it out as exposure's and readiness's. */
const levelSx = { display: "inline-flex", alignItems: "center", gap: 1, fontSize: 13.5 } as const;

/*
 * Maturity in short, beside a name: its ring, with the percentage, and its
 * band; or why there's none. What it's worked out from, `spread`, is in the
 * ring's popover, never beside it.
 */
export function Maturity({
  value,
  of,
  subject = "feature",
  count,
  spread,
}: {
  value: number | null;
  of: string;
  subject?: MaturitySubject;
  count?: number;
  /* What it's worked out from, for its ring's popover (see MaturityRing). */
  spread?: CapabilityLevel[];
}) {
  /* `explore-level` on the figure: a hook for a header's stat, which lays it out as readiness's and exposure's. */
  if (value === null)
    return (
      <Box component="span" className="explore-level" sx={levelSx}>
        <Tooltip title={`No maturity yet: ${of}`}>
          <Box component="span" sx={{ color: "text.disabled" }}>
            No maturity yet
          </Box>
        </Tooltip>
      </Box>
    );
  const band = maturityBand(value);
  return (
    <Box component="span" className="explore-level" sx={[levelSx, levelColor(band)]}>
      <MaturityRing progress={value} subject={subject} count={count} size={22} spread={spread} />
      <strong>{MATURITY_BANDS[band]}</strong>
    </Box>
  );
}
