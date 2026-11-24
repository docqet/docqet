import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import type { CapabilityLevel, Level } from "../../state";
import { DetailsCard, DetailsEyebrow, DetailsPopover } from "../DetailsPopover";
import { STABILITY, STABILITY_LEVEL_IDS } from "./stability";
import { StabilityTrack } from "./StabilityTrack";

/*
 * Stability spread: how many capabilities are at each level, as a bar split
 * by how many there are of each, drafts first, then Prototype up to GA, in
 * each level's color, unlabeled. Its popover counts each. It goes where
 * maturity does, since maturity is worked out from it, and wherever
 * capabilities are counted together.
 */

/* Drafts first, then the levels from Prototype to GA, as the bar runs left to right. */
const ORDER: CapabilityLevel[] = [null, ...STABILITY_LEVEL_IDS];

const levelName = (level: CapabilityLevel) => (level ? STABILITY[level].name : "Draft");

/* A level's color as `--level`, in the shade for the color scheme. */
const levelVar = (level: Level) => (theme: Theme) => ({
  "--level": STABILITY[level].colors.light,
  ...theme.applyStyles("dark", { "--level": STABILITY[level].colors.dark }),
});

/* How many there are at each level, in order, leaving out any with none. */
const spreadOf = (levels: CapabilityLevel[]) => ORDER.map((level) => ({ level, n: levels.filter((l) => l === level).length })).filter((s) => s.n);

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
        level ? (
          <Box key={level} component="span" sx={levelVar(level)} style={{ flexGrow: n }} />
        ) : (
          <span key="draft" data-draft style={{ flexGrow: n }} />
        ),
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

function StabilitySpreadDetails({ levels, of }: { levels: CapabilityLevel[]; of: string }) {
  return (
    <DetailsCard card width={300}>
      <DetailsEyebrow>Stability spread in {of}</DetailsEyebrow>
      <Box sx={{ mt: 1.25 }}>
        <StabilitySpreadBar levels={levels} wide />
      </Box>
      <ul className="stability-spread-counts">
        {[...spreadOf(levels)].reverse().map(({ level, n }) => (
          <li key={level ?? "draft"}>
            {level ? (
              <Box component="span" sx={levelVar(level)} className="stability-spread-name">
                <StabilityTrack level={level} />
                {levelName(level)}
              </Box>
            ) : (
              <span className="stability-spread-name">Draft</span>
            )}
            <span className="stability-spread-n">{n}</span>
          </li>
        ))}
      </ul>
      <Box sx={{ mt: 1, color: "text.secondary", fontSize: "0.92em" }}>
        How many capabilities are at each level, counted once each at their level in short. Maturity is worked out from it; drafts don&rsquo;t count there.
      </Box>
    </DetailsCard>
  );
}
