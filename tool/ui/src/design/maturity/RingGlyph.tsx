import { Ring } from "../ring/Ring";
import { clampMaturity, maturityBand } from "./maturity";
import { levelColor } from "../stability/stability";

/*
 * Maturity's one look: the Ring (Prototype, Alpha, Beta, GA quarters),
 * filled as far as the maturity reaches, in the band's color, with the
 * percentage in the middle, or beside it on a small ring. Decorative: MaturityRing and MaturityDetails carry the meaning
 * around it.
 */
export function RingGlyph({ progress, size }: { progress: number; size: number }) {
  const value = clampMaturity(progress);
  return <Ring percent={value} size={size} figure={`${value}%`} sx={levelColor(maturityBand(value))} />;
}
