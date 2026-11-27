import Box from "@mui/material/Box";
import type { CapabilityLevel } from "../../state";
import { DetailsCard, DetailsEyebrow, DetailsHead, DetailsWorkings } from "./DetailsPopover";
import { MATURITY_BANDS, MATURITY_LEVELS, clampMaturity, maturityBand } from "../maturity/maturity";
import { RingGlyph } from "../maturity/RingGlyph";
import { STABILITY, STABILITY_LEVEL_IDS, levelColor, type StabilityLevelId } from "../stability/stability";
import { LevelSpread } from "../stability/StabilitySpread";

/*
 * A feature's maturity comes from its capabilities, a domain's from its parts
 * of features, and a project's from its features. A persona's is of what
 * serves them, from the capabilities that list them, as a feature's is, and
 * a problem's of what solves it, and a constraint's of what keeps to it.
 */
export type MaturitySubject = "feature" | "domain" | "project" | "persona" | "problem" | "constraint" | "initiative";

export const SUBJECT_NAMES: Record<MaturitySubject, string> = {
  feature: "Feature",
  domain: "Domain",
  project: "Project",
  persona: "Persona",
  problem: "Problem",
  constraint: "Constraint",
  initiative: "Initiative",
};

/* What the work is on, in a sentence: "this feature", or "what serves them". */
export const subjectPhrase = (subject: MaturitySubject) =>
  subject === "persona" ? "what serves them" : subject === "problem" ? "what solves it" : subject === "constraint" ? "what keeps to it" : `this ${subject}`;

/* Whether it's worked out from capabilities, rather than from features. */
export const fromCapabilities = (subject: MaturitySubject) =>
  subject === "feature" || subject === "persona" || subject === "problem" || subject === "constraint" || subject === "initiative";

export type MaturityDetailsProps = {
  /** 0 to 100; anything outside is clamped, and fractions rounded. */
  progress: number;
  /** A Feature's maturity, from its Capabilities, or a project's, from its Features. */
  subject: MaturitySubject;
  /** How many Capabilities (a Feature) or Features (a project) it's worked out from. */
  count?: number;
  /**
   * What it's worked out from, for its spread: each Capability's level, null
   * for a draft, or each Feature's band, null for one not started.
   */
  spread?: CapabilityLevel[];
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
  prototype: "Early days. Much of it is still being explored, and could change completely or be dropped.",
  alpha: "Taking shape. Some of it works, but much is still changing often, so expect bugs and breaking changes.",
  beta: "Firming up. Enough of it is settled or stable for real use, while other parts are still changing.",
  ga: "Well established. Most of it is stable and supported, while any newer parts settle in.",
};

function basis(subject: MaturitySubject, count: number) {
  return fromCapabilities(subject)
    ? `Based on ${subject === "persona" || subject === "problem" || subject === "constraint" ? "the" : "its"} ${count} ${count === 1 ? "capability" : "capabilities"}`
    : `The weighted average of its ${count} ${count === 1 ? "feature" : "features"}`;
}

/*
 * How mature a Feature or a project is, for the client looking at it, laid
 * out as exposure's popover is: its ring and band, what that band means,
 * how what it's worked out from spreads across the levels (or bands), and
 * what maturity is. It's the content of MaturityRing's popover. Maturity is
 * always drawn as the ring, here too, never as a bar.
 */
export function MaturityDetails({ progress, subject, count, spread, card = true }: MaturityDetailsProps) {
  const value = clampMaturity(progress);
  const band = maturityBand(value);
  const capabilities = fromCapabilities(subject);
  return (
    <DetailsCard card={card} width={320}>
      <DetailsEyebrow>
        {subject === "persona"
          ? "Maturity of what serves them"
          : subject === "problem"
            ? "Maturity of what solves it"
            : subject === "constraint"
              ? "Maturity of what keeps to it"
              : `${SUBJECT_NAMES[subject]} maturity`}
      </DetailsEyebrow>
      <Box sx={{ mt: 1.25, display: "flex", alignItems: "center", gap: 1.5 }}>
        <RingGlyph progress={value} size={56} />
        <Box sx={{ minWidth: 0 }}>
          <Box sx={[{ fontSize: "1.12em", fontWeight: 700 }, levelColor(band)]}>{MATURITY_BANDS[band]}</Box>
          {count === undefined ? null : <Box sx={{ color: "text.secondary" }}>{basis(subject, count)}</Box>}
        </Box>
      </Box>
      <Box sx={{ mt: 1.25 }}>{BAND_SUMMARIES[band]}</Box>
      {spread?.length ? (
        <>
          <DetailsHead>
            {spread.length} {capabilities ? (spread.length === 1 ? "capability" : "capabilities") : spread.length === 1 ? "feature" : "features"} by{" "}
            {capabilities ? "level" : "maturity"}
          </DetailsHead>
          <LevelSpread levels={spread} bands={!capabilities} />
        </>
      ) : null}
      <Box sx={{ mt: 1.25, color: "text.secondary", fontSize: "0.92em" }}>
        Maturity is how far along the work on {subjectPhrase(subject)} is, for planning: how close the work under way is to being stable and supported. Whether
        people can use it is its readiness.
      </Box>
      <DetailsWorkings>
        {capabilities ? (
          <>
            <div>Each capability scores by its level: {STABILITY_LEVEL_IDS.map((id) => `${STABILITY[id].name} ${MATURITY_LEVELS[id].score}`).join(", ")}.</div>
            <div>
              The scores are averaged, weighted so dependable work counts most: one GA as much as 1.5 Betas, 2 Alphas or 3 Prototypes. Drafts don&rsquo;t count.
            </div>
          </>
        ) : (
          <div>
            Each feature&rsquo;s maturity is averaged, weighted by its band as a capability at that level would be, so dependable features count most. Those not
            started don&rsquo;t count.
          </div>
        )}
        <div>Each quarter is a band: experimental, emerging, promising and established.</div>
      </DetailsWorkings>
    </DetailsCard>
  );
}
