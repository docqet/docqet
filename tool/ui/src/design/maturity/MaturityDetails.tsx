import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import { DetailsCard, DetailsEyebrow } from "../DetailsPopover";
import { MATURITY_BANDS, clampMaturity, maturityBand } from "./maturity";
import { RingGlyph } from "./RingGlyph";
import { levelColor, type StabilityLevelId } from "../stability/stability";

/*
 * A feature's maturity comes from its capabilities, a domain's from its parts
 * of features, and a project's from its features. A persona's is of what
 * serves them, from the capabilities that list them, as a feature's is.
 */
export type MaturitySubject = "feature" | "domain" | "project" | "persona";

export const SUBJECT_NAMES: Record<MaturitySubject, string> = { feature: "Feature", domain: "Domain", project: "Project", persona: "Persona" };

/* What the work is on, in a sentence: "this feature", or "what serves them". */
export const subjectPhrase = (subject: MaturitySubject) => (subject === "persona" ? "what serves them" : `this ${subject}`);

/* Whether it's worked out from capabilities, rather than from features. */
export const fromCapabilities = (subject: MaturitySubject) => subject === "feature" || subject === "persona";

export type MaturityDetailsProps = {
  /** 0 to 100; anything outside is clamped, and fractions rounded. */
  progress: number;
  /** A Feature's maturity, from its Capabilities, or a project's, from its Features. */
  subject: MaturitySubject;
  /** How many Capabilities (a Feature) or Features (a project) it's worked out from. */
  count?: number;
  /**
   * What it's made of, under the scale: each Capability with its
   * StabilityMark, or each Feature with a small MaturityRing, most mature first.
   */
  breakdown?: ReactNode;
  /** Draw the popover's card. `card={false}` leaves it out, for a card of your own. */
  card?: boolean;
};

/*
 * What each band tells whoever is looking, client or engineer: how far along
 * it is as a whole, and what to expect from it. True whatever the mix, since
 * a few established parts can carry a band, so it never claims what every
 * part is; the closing line sends them to each part's stability for that.
 */
const BAND_SUMMARIES: Record<StabilityLevelId, string> = {
  prototype:
    "Early days. Much of it is still being explored, and could change completely or be dropped.",
  alpha:
    "Taking shape. Some of it works, but much is still changing often, so expect bugs and breaking changes.",
  beta: "Firming up. Enough of it is settled or stable for real use, while other parts are still changing.",
  ga: "Well established. Most of it is stable and supported, while any newer parts settle in.",
};

function basis(subject: MaturitySubject, count: number) {
  return fromCapabilities(subject)
    ? `Based on ${subject === "persona" ? "the" : "its"} ${count} ${count === 1 ? "capability" : "capabilities"}`
    : `The weighted average of its ${count} ${count === 1 ? "feature" : "features"}`;
}

const section = { mt: 1.5, pt: 1.5, borderTop: 1, borderColor: "divider" } as const;

/*
 * How mature a Feature or a project is, for the client looking at it: its
 * ring and band, what that band means, optionally what it's made of, and what
 * maturity is. It's the content of MaturityRing's popover. Maturity is
 * always drawn as the ring, here too, never as a bar.
 */
export function MaturityDetails({
  progress,
  subject,
  count,
  breakdown,
  card = true,
}: MaturityDetailsProps) {
  const value = clampMaturity(progress);
  const band = maturityBand(value);
  return (
    <DetailsCard card={card}>
      <DetailsEyebrow>
        {subject === "persona" ? "Maturity of what serves them" : `${SUBJECT_NAMES[subject]} maturity`}
      </DetailsEyebrow>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 1 }}>
        <RingGlyph progress={value} size={56} />
        <Box sx={{ minWidth: 0, lineHeight: 1.3 }}>
          <Box sx={[{ fontSize: "1.12em", fontWeight: 700 }, levelColor(band)]}>
            {MATURITY_BANDS[band]}
          </Box>
          {count === undefined ? null : (
            <Box sx={{ color: "text.secondary" }}>{basis(subject, count)}</Box>
          )}
        </Box>
      </Box>
      <Box sx={{ mt: 1.5 }}>{BAND_SUMMARIES[band]}</Box>
      {breakdown ? <Box sx={section}>{breakdown}</Box> : null}
      <Box sx={[section, { fontSize: "0.92em", color: "text.secondary" }]}>
        Maturity is how far along the work on {subjectPhrase(subject)} is, for planning: how close the work under
        way is to being stable and supported. Whether people can use it is its readiness.
      </Box>
    </DetailsCard>
  );
}
