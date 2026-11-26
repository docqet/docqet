import Box from "@mui/material/Box";
import { MATURITY_BANDS, maturityBand } from "./maturity";
import { MaturityRing } from "./MaturityRing";
import type { MaturitySubject } from "../popovers/MaturityDetails";
import { levelColor } from "../stability/stability";
import { type CapabilityLevel } from "../../state";
import { Tip } from "../Tip";

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
  if (value === null)
    return (
      <span className="explore-level">
        <Tip title={`No maturity yet: ${of}`}>
          <span className="faint">No maturity yet</span>
        </Tip>
      </span>
    );
  const band = maturityBand(value);
  return (
    <Box component="span" className="explore-level" sx={levelColor(band)}>
      <MaturityRing progress={value} subject={subject} count={count} size={22} spread={spread} />
      <strong>{MATURITY_BANDS[band]}</strong>
    </Box>
  );
}
