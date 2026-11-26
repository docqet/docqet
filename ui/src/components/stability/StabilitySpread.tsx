import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import type { ReactNode } from "react";
import type { CapabilityLevel, Level } from "../../state";
import { DetailsPopover } from "../popovers/DetailsPopover";
import { MATURITY_BANDS } from "../maturity/maturity";
import { STABILITY_LEVEL_IDS, levelName } from "./stability";
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

/* A level's color, in the shade for the color scheme. */
export const levelTone = (level: Level) => (theme: Theme) => theme.vars.palette.stability[level];

/* A draft's hatch, for its part of a bar or its swatch, at `strength` percent of the faint text color. */
const hatch = (strength: number) => (theme: Theme) =>
  `repeating-linear-gradient(135deg, color-mix(in srgb, ${theme.vars.palette.text.disabled} ${strength}%, transparent) 0 2px, transparent 2px 4px)`;

/*
 * A bar split into parts by how many fall in each, unlabeled: 44px beside a
 * name, or `wide` across its space. Stability's and risk's spreads both draw
 * theirs this way; each part is a span.
 */
export const spreadBarSx = (wide: boolean): SystemStyleObject<Theme> => ({
  display: wide ? "flex" : "inline-flex",
  flex: "none",
  gap: wide ? "2px" : "1px",
  width: wide ? "100%" : 44,
  height: wide ? 8 : 5,
  verticalAlign: "middle",
  borderRadius: wide ? "4px" : "3px",
  overflow: "hidden",
  "& > span": { minWidth: wide ? 4 : 2 },
});

/* What a spread's bar opens its counts from, on hover or focus. */
export const spreadMarkSx = (wide: boolean): SystemStyleObject<Theme> => ({
  display: wide ? "flex" : "inline-flex",
  alignItems: "center",
  minWidth: wide ? 0 : undefined,
  height: 16,
  borderRadius: "3px",
  cursor: "help",
  "&:focus-visible": { outline: 2, outlineColor: "primary.main", outlineOffset: 2 },
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
    <Box component="span" aria-hidden sx={spreadBarSx(wide)}>
      {spreadOf(levels).map(({ level, n }) => (
        <Box key={level ?? "draft"} component="span" sx={{ background: level ? levelTone(level) : hatch(45) }} style={{ flexGrow: n }} />
      ))}
    </Box>
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
      {/* stability-spread-mark: a hook for the overview's table, which stretches it across its cell. */}
      <Box
        component="span"
        className="stability-spread-mark"
        role="img"
        aria-label={`Stability spread: ${stabilityCounts(levels)}`}
        tabIndex={inButton ? undefined : 0}
        sx={spreadMarkSx(wide)}
      >
        <StabilitySpreadBar levels={levels} wide={wide} />
      </Box>
    </DetailsPopover>
  );
}

/* A part's color, as a small square beside its count, the same as its part of the bar: `color`, or a draft's hatch. */
export function SpreadSwatch({ color, draft = false }: { color?: (theme: Theme) => string; draft?: boolean }) {
  return (
    <Box
      component="span"
      aria-hidden
      sx={[
        { flex: "none", width: 8, height: 8, borderRadius: "2px", background: color },
        draft && { background: hatch(70), boxShadow: (t) => `inset 0 0 0 1px color-mix(in srgb, ${t.vars.palette.text.disabled} 45%, transparent)` },
      ]}
    />
  );
}

/* A spread's bar, then its counts under it in the bar's order. */
export const spreadSx: SystemStyleObject<Theme> = { display: "flex", flexDirection: "column", gap: 0.75, mt: 1.25 };
export const spreadCountsSx: SystemStyleObject<Theme> = { display: "flex", flexWrap: "wrap", gap: "2px 12px", fontSize: "0.92em", color: "text.secondary" };

/* One part's count under a spread's bar: its swatch, then its number in its color (`color`, or the text's for a draft), then its name. */
export function SpreadCount({ color, n, children }: { color?: (theme: Theme) => string; n: number; children: ReactNode }) {
  return (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
      <SpreadSwatch color={color} draft={!color} />
      <Box component="strong" sx={{ fontWeight: 650, color: color ?? "text.primary" }}>
        {n}
      </Box>
      {children}
    </Box>
  );
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
    <Box sx={spreadSx}>
      <StabilitySpreadBar levels={levels} wide />
      <Box component="span" sx={spreadCountsSx}>
        {spreadOf(levels).map(({ level, n }) => (
          <SpreadCount key={level ?? "none"} color={level ? levelTone(level) : undefined} n={n}>
            {level ? (bands ? MATURITY_BANDS[level].toLowerCase() : levelName(level)) : bands ? "not started" : n === 1 ? "draft" : "drafts"}
          </SpreadCount>
        ))}
      </Box>
    </Box>
  );
}
