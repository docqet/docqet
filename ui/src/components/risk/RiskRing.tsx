import { exposureText, type RiskBand } from "../../state";
import { Ring } from "../ring/Ring";

/*
 * Exposure's band as a color, on the same scale as impact: low neutral,
 * minor the soft yellow, moderate orange, and high the alarm color.
 */
export const RISK_BAND_COLORS: Record<RiskBand["id"], string> = {
  low: "text.disabled",
  minor: "impact.inconvenient",
  moderate: "impact.blocking",
  high: "error.main",
};

/*
 * Exposure, drawn as maturity is: the Ring, its quarters the bands (low,
 * some, moderate, high), filled as far as the share of the most it could
 * be exposed to, in its band's color, with the share in the middle, or
 * beside it on a small ring, unless `figure` is false. Decorative: what
 * shows it says what it means.
 */
export function RiskRing({ percent, size, band, figure = true }: { percent: number; size: number; band: RiskBand["id"]; figure?: boolean }) {
  return <Ring percent={percent} size={size} figure={figure ? exposureText(percent) : undefined} sx={{ color: RISK_BAND_COLORS[band] }} />;
}
