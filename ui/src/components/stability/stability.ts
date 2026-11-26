import type { Theme } from "@mui/material/styles";

// Stability levels: Prototype, Alpha, Beta, and GA. Each level sets the
// expectation for how stable something is, for the people who use it and the
// engineers who build on it.

export const STABILITY_LEVEL_IDS = ["prototype", "alpha", "beta", "ga"] as const;

export type StabilityLevelId = (typeof STABILITY_LEVEL_IDS)[number];

export type StabilityLevel = {
  id: StabilityLevelId;
  /** Short name shown on marks, e.g. "GA". */
  name: string;
  /** Name in running text and the popover, e.g. "General Availability". */
  fullName: string;
  /** How stable it is, in a word or two, e.g. "Refining". The extra-long mark and the popover show it. */
  stability: string;
  /** One-sentence definition, used in tooltips and the glossary. */
  summary: string;
  /** How much it will change. */
  changes: string;
  /** What to expect from bugs. */
  bugs: string;
  /** What people using it can expect, and rely on it for. */
  forUsers: string;
  /** What engineers building on it can expect. */
  forEngineers: string;
  /** GitHub label for issues and pull requests that target this level. */
  label: { name: string; color: string; description: string };
};

export const STABILITY: Record<StabilityLevelId, StabilityLevel> = {
  prototype: {
    id: "prototype",
    name: "Prototype",
    fullName: "Prototype",
    stability: "Exploring",
    summary: "Explores an idea so we can choose a direction. Its data may be fake, and it may change completely or be thrown away.",
    changes: "Anything can change, or it may be thrown away.",
    bugs: "Only what's being shown is expected to work, and its data may be fake.",
    forUsers: "React to it and help choose the direction. Don't use it for real work, or trust the data it shows.",
    forEngineers: "Don't build on it. Expect it to be rewritten.",
    label: {
      name: "stability: prototype",
      color: "6f6982",
      description: "Prototype: exploring an idea; expect it to change completely or be thrown away",
    },
  },
  alpha: {
    id: "alpha",
    name: "Alpha",
    fullName: "Alpha",
    stability: "Developing",
    summary: "Works, but is still taking shape. Expect frequent breaking changes and bugs.",
    changes: "Frequent breaking changes, with no promise of notice.",
    bugs: "Expected, even in the main workflow.",
    forUsers: "Try it with real work and share feedback. Keep your current way of working as a fallback, and don't keep the only copy of anything there.",
    forEngineers: "Build on it only to experiment. Expect its interfaces to change.",
    label: {
      name: "stability: alpha",
      color: "db2777",
      description: "Alpha: works but still taking shape; expect frequent breaking changes and bugs",
    },
  },
  beta: {
    id: "beta",
    name: "Beta",
    fullName: "Beta",
    stability: "Refining",
    summary: "Settled enough for real use. Breaking changes and bugs are occasional. We aim to announce breaking changes ahead of time, but can't always.",
    changes: "Occasional breaking changes, announced ahead of time when we can.",
    bugs: "Occasional, mostly at the edges, and fixed as they're found.",
    forUsers: "Use it for real work, with a fallback for anything critical.",
    forEngineers: "Build on it, and watch for changes. We aim to announce them ahead of time.",
    label: {
      name: "stability: beta",
      color: "2563eb",
      description: "Beta: refining; occasional breaking changes, announced ahead of time when we can",
    },
  },
  ga: {
    id: "ga",
    name: "GA",
    fullName: "General Availability",
    stability: "Stable",
    summary:
      "Generally available and stable. It keeps working as it does today. Breaking changes are rare, announced ahead of time, and come with time to move over.",
    changes: "Rare. When one is needed, we aim to announce it well ahead, with a deprecation window.",
    bugs: "Rare, and fixed first.",
    forUsers: "Depend on it, including for business-critical work.",
    forEngineers: "Build on it. Its interfaces are stable, and changes come with notice and time to move.",
    label: {
      name: "stability: ga",
      color: "047857",
      description: "GA: generally available and stable; rare breaking changes, announced with a deprecation window",
    },
  },
};

export const STABILITY_LEVELS: StabilityLevel[] = STABILITY_LEVEL_IDS.map((id) => STABILITY[id]);

/*
 * Planned comes before the levels: agreed, with no work done yet, so it isn't
 * one and has no stability. It's marked like them, with none of the Track lit,
 * and in muted text rather than a color of its own, since it has no level to
 * color. A draft, not yet agreed, has no mark at all.
 */
export const PLANNED = {
  id: "planned",
  name: "Planned",
  fullName: "Planned",
  stability: "Not started",
  summary: "Agreed, with no work done yet, so it has no stability.",
} as const;

/** What a stability mark can show: a level, or Planned. */
export type StabilityMarkLevel = StabilityLevelId | typeof PLANNED.id;

/** The level's position, 1 (Prototype) to 4 (GA), or 0 for Planned. */
export function stabilityStep(id: StabilityMarkLevel): number {
  return STABILITY_LEVEL_IDS.indexOf(id as StabilityLevelId) + 1;
}

/*
 * A level's color as the text color, from the theme's stability palette
 * (lilac grey, pink, blue and green), in the shade for the color scheme.
 */
export function levelColor(id: StabilityMarkLevel) {
  if (id === PLANNED.id) return { color: "text.secondary" };
  return (theme: Theme) => ({ color: theme.vars.palette.stability[id] });
}

/* A capability's level by name: "GA", or "Draft" for one declared and not started. */
export const levelName = (level: StabilityLevelId | null) => (level ? STABILITY[level].name : "Draft");
