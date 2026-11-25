import { exposureText } from "../../state";
import { Ring } from "../ring/Ring";

/*
 * Exposure, drawn as maturity is: the Ring, its quarters the bands (low,
 * some, moderate, high), filled as far as the share of the most it could
 * be exposed to, in its band's color (--risk-band, from data-risk-band), with the
 * share in the middle, or beside it on a small ring, unless `figure` is
 * false. Decorative: what shows it says what it means.
 */
export function RiskRing({ percent, size, figure = true }: { percent: number; size: number; figure?: boolean }) {
  return <Ring percent={percent} size={size} figure={figure ? exposureText(percent) : undefined} sx={{ color: "var(--risk-band)" }} />;
}
