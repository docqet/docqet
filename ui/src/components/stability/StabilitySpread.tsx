import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import type { CapabilityLevel, Level } from "../../state";
import { DetailsPopover } from "../popovers/DetailsPopover";
import { MATURITY_BANDS } from "../maturity/maturity";
import { STABILITY, STABILITY_LEVEL_IDS, levelName } from "./stability";
import { StabilitySpreadDetails } from "../popovers/StabilitySpreadDetails";

/*
 * Stability spread: how many capabilities are at each level, as a bar split
 * by how many there are of each, drafts first, then Prototype up to GA, in
 * each level's color, unlabeled. Its popover counts each. It goes where
 * maturity does, since maturity is worked out from it, and wherever
 * capabilities are counted together.
 */

/* Drafts first, then the levels from Prototype to GA, as the bar runs left to right. */
const ORDER: CapabilityLevel[] = [null, ...STABILITY_LEVEL_IDS];

/* A level's color as `--level`, in the shade for the color scheme. */
export const levelVar = (level: Level) => (theme: Theme) => ({
  "--level": STABILITY[level].colors.light,
  ...theme.applyStyles("dark", { "--level": STABILITY[level].colors.dark }),
});

/* How many there are at each level, in order, leaving out any with none. */
export const spreadOf = (levels: CapabilityLevel[]) => ORDER.map((level) => ({ level, n: levels.filter((l) => l === level).length })).filter((s) => s.n);

/* "1 Prototype · 4 Beta · 1 GA". */
export const stabilityCounts = (levels: CapabilityLevel[]) =>
  spreadOf(levels)
    .map(({ level, n }) => `${n} ${level ? levelName(level) : n === 1 ? "draft" : "drafts"}`)
    .join(" · ");

/* The bar alone: small beside a name, or `wide` across its space. */
export function StabilitySpreadBar({ levels, wide = false }: { levels: CapabilityLevel[]; wide?: boolean }) {
  return (
    <span className={`stability-spread-bar${wide ? " wide" : ""}`} aria-hidden>
      {spreadOf(levels).map(({ level, n }) =>
        level ? <Box key={level} component="span" sx={levelVar(level)} style={{ flexGrow: n }} /> : <span key="draft" data-draft style={{ flexGrow: n }} />,
      )}
    </span>
  );
}

/*
 * The bar, opening its counts. `of` names what the capabilities are in, for
 * the popover. Inside something clickable, `inButton` opens it on hover only.
 */
export function StabilitySpread({ levels, of, wide = false, inButton = false }: { levels: CapabilityLevel[]; of: string; wide?: boolean; inButton?: boolean }) {
  if (!levels.length) return null;
  return (
    <DetailsPopover hoverOnly={inButton} title={<StabilitySpreadDetails levels={levels} of={of} />}>
      <span
        className={`stability-spread-mark${wide ? " wide" : ""}`}
        role="img"
        aria-label={`Stability spread: ${stabilityCounts(levels)}`}
        tabIndex={inButton ? undefined : 0}
      >
        <StabilitySpreadBar levels={levels} wide={wide} />
      </span>
    </DetailsPopover>
  );
}

/* A part's color, as a small square beside its count, the same as its part of the bar: the level's (--level), or a draft's hatch. */
export function SpreadSwatch({ draft = false }: { draft?: boolean }) {
  return <span className={draft ? "spread-swatch draft" : "spread-swatch"} aria-hidden />;
}

/*
 * How several spread across the levels, for a popover, as risk's spread
 * across the verdicts is drawn: the wide bar, with each count under it in
 * the bar's order, each with its part's swatch and its number in that
 * color. With `bands`, they're features' maturity bands, named for them,
 * and null is one not started; otherwise null is a draft.
 */
export function LevelSpread({ levels, bands = false }: { levels: CapabilityLevel[]; bands?: boolean }) {
  return (
    <div className="verdict-spread">
      <StabilitySpreadBar levels={levels} wide />
      <span className="verdict-spread-counts">
        {spreadOf(levels).map(({ level, n }) => (
          <Box component="span" key={level ?? "none"} className="spread-count" sx={level ? levelVar(level) : undefined}>
            <SpreadSwatch draft={!level} />
            <strong>{n}</strong>
            {level ? (bands ? MATURITY_BANDS[level].toLowerCase() : levelName(level)) : bands ? "not started" : n === 1 ? "draft" : "drafts"}
          </Box>
        ))}
      </span>
    </div>
  );
}
