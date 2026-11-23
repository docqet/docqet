import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import { DetailsCard, DetailsEyebrow, DetailsPopover } from "../DetailsPopover";

/*
 * What's at stake in a gap, or in a tradeoff's drawback, when it bites: its
 * impact, as a badge in its color, with a popover (hover, focus, or tap)
 * saying what the impact means. Risk, which impact is one part of, has the
 * rising bars (see RiskScore).
 */

/*
 * What happens to whoever relies on it when a gap bites, or a tradeoff's
 * drawback does, least to most, whatever kind of software it's in: each with
 * what it takes from them and the test that sets it.
 */
export type ImpactId = "negligible" | "inconvenient" | "blocking" | "damaging";

export const IMPACT_ORDER: readonly ImpactId[] = ["negligible", "inconvenient", "blocking", "damaging"];

export const IMPACT_NAMES: Record<ImpactId, { name: string; lost: string; test: string }> = {
  negligible: { name: "Negligible", lost: "nothing", test: "Nothing anyone relies on changes. At most, someone notices it." },
  inconvenient: {
    name: "Inconvenient",
    lost: "time",
    test: "What people rely on still comes out right, but it takes them extra time, a step by hand, or a workaround.",
  },
  blocking: {
    name: "Blocking",
    lost: "the outcome",
    test: "Someone, or some group of people, can't get done what they rely on it for, by any route available, until it's closed. They know it, and it waits.",
  },
  damaging: {
    name: "Damaging",
    lost: "something they can't get back",
    test: "It leaves something wrong that can't be fully put right, or that someone acts on without knowing, at a cost: data lost or kept wrong, money moved wrongly, legal or financial exposure, someone able to do what they shouldn't.",
  },
};

/* How many there are of each impact, worst first: "3 damaging · 12 inconvenient · 2 not rated". */
export const impactCounts = (items: { impact: ImpactId | null }[]) =>
  [
    ...[...IMPACT_ORDER].reverse().map((i) => [IMPACT_NAMES[i].name.toLowerCase(), items.filter((g) => g.impact === i).length] as const),
    ["not rated", items.filter((g) => !g.impact).length] as const,
  ]
    .filter(([, n]) => n)
    .map(([name, n]) => `${n} ${name}`)
    .join(" · ");

/*
 * An impact as a badge: its name, in its color, opening what it means.
 * `eyebrow` heads the popover; `children` are its sections, from
 * RiskSection. Inside something clickable, `inButton` opens the popover on
 * hover only, so a tap still reaches it.
 */
export function ImpactBadge({
  impact,
  eyebrow,
  inButton = false,
  children,
}: {
  impact: ImpactId | null;
  eyebrow: string;
  inButton?: boolean;
  children?: ReactNode;
}) {
  const name = impact ? IMPACT_NAMES[impact].name : "Not rated";
  return (
    <DetailsPopover hoverOnly={inButton} title={<ImpactDetails impact={impact} eyebrow={eyebrow}>{children}</ImpactDetails>}>
      <span className="impact-badge" data-impact={impact ?? "none"} role="img" aria-label={`Impact: ${name}`} tabIndex={inButton ? undefined : 0}>
        {name}
      </span>
    </DetailsPopover>
  );
}

/* A section of a popover, under a rule: a label, then what it says. */
export function RiskSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box sx={{ mt: 1.25, pt: 1.25, borderTop: 1, borderColor: "divider" }}>
      <Box sx={{ mb: 0.5, fontSize: "0.84em", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "text.secondary" }}>{label}</Box>
      {children}
    </Box>
  );
}

/* What an impact means, for the popover: its name, its test and what it takes, then its sections. */
function ImpactDetails({ impact, eyebrow, children }: { impact: ImpactId | null; eyebrow: string; children?: ReactNode }) {
  return (
    <DetailsCard card width={320}>
      <div className="risk-details" data-impact={impact ?? "none"}>
        <DetailsEyebrow>{eyebrow}</DetailsEyebrow>
        <Box className="risk-details-name" sx={{ mt: 1, fontSize: "1.12em", fontWeight: 700 }}>
          {impact ? IMPACT_NAMES[impact].name : "Not rated"}
        </Box>
        <Box sx={{ mt: 0.75 }}>{impact ? IMPACT_NAMES[impact].test : "Nobody has said what happens when it bites."}</Box>
        {impact ? (
          <Box sx={{ mt: 0.5, color: "text.secondary" }}>
            What whoever relies on it loses: <strong>{IMPACT_NAMES[impact].lost}</strong>.
          </Box>
        ) : null}
        {impact ? (
          <Box sx={{ mt: 0.5, color: "text.secondary", fontSize: "0.92em" }}>
            Judged for the people this software serves: a gap that would reach only a few of them rates one step lower.
          </Box>
        ) : null}
        {children}
      </div>
    </DetailsCard>
  );
}
