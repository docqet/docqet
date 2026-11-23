import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import { DetailsCard, DetailsEyebrow, DetailsPopover } from "../DetailsPopover";

/*
 * What's at stake in a gap, or in a tradeoff's drawback: its impact, as a
 * meter that rises from low to high, with a popover (hover, focus, or tap)
 * saying what the impact means and what else its risk is worked out from.
 * Its own shape, steps rising like a signal, so it's never read as
 * readiness, maturity or a stability mark.
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

/* An impact's step, 1 to 4 from low to high, or 0 with none rated. */
const stepOf = (impact: ImpactId | null) => (impact ? IMPACT_ORDER.indexOf(impact) + 1 : 0);

/* The steps, lit up to its impact, rising like a signal: small beside its name, or wide, as in the popover, with each step named under it. */
function RiskTrack({ impact, size }: { impact: ImpactId | null; size: "small" | "wide" }) {
  const step = stepOf(impact);
  return (
    <span className={`risk-track ${size}`} aria-hidden>
      {IMPACT_ORDER.map((i, n) => (
        <span key={i} className="risk-step" data-on={n < step || undefined} />
      ))}
    </span>
  );
}

/*
 * An impact as a meter: its steps and its name, in its color, opening what's
 * at stake. `eyebrow` heads the popover; `lead` goes before its name, as
 * "Worst". `children` are the popover's sections, from RiskSection. Inside
 * something clickable, `inButton` opens the popover on hover only, so a tap
 * still reaches it.
 */
export function RiskMeter({
  impact,
  eyebrow,
  lead,
  inButton = false,
  children,
}: {
  impact: ImpactId | null;
  eyebrow: string;
  lead?: string;
  inButton?: boolean;
  children?: ReactNode;
}) {
  const name = impact ? IMPACT_NAMES[impact].name : "Not rated";
  return (
    <DetailsPopover hoverOnly={inButton} title={<RiskDetails impact={impact} eyebrow={eyebrow}>{children}</RiskDetails>}>
      <span className="risk-meter" data-impact={impact ?? "none"} role="img" aria-label={`${lead ? `${lead} impact` : "Impact"}: ${name}`} tabIndex={inButton ? undefined : 0}>
        <RiskTrack impact={impact} size="small" />
        <span>{lead ? `${lead} ${name.toLowerCase()}` : name}</span>
      </span>
    </DetailsPopover>
  );
}

/* A section of the popover, under a rule: a label, then what it says. */
export function RiskSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box sx={{ mt: 1.25, pt: 1.25, borderTop: 1, borderColor: "divider" }}>
      <Box sx={{ mb: 0.5, fontSize: "0.84em", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "text.secondary" }}>{label}</Box>
      {children}
    </Box>
  );
}

/* What's at stake, for the popover: the impact, its step on the bar, its test, then its sections, and what risk is. */
function RiskDetails({ impact, eyebrow, children }: { impact: ImpactId | null; eyebrow: string; children?: ReactNode }) {
  const step = stepOf(impact);
  return (
    <DetailsCard card width={330}>
      <div className="risk-details" data-impact={impact ?? "none"}>
        <DetailsEyebrow>{eyebrow}</DetailsEyebrow>
        <Box sx={{ mt: 1, display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1 }}>
          <Box className="risk-details-name" sx={{ fontSize: "1.12em", fontWeight: 700 }}>
            {impact ? IMPACT_NAMES[impact].name : "Not rated"}
          </Box>
          {step ? <Box sx={{ color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>Impact {step} of 4</Box> : null}
        </Box>
        <Box sx={{ mt: 1 }}>
          <RiskTrack impact={impact} size="wide" />
          <span className="risk-scale" aria-hidden>
            {IMPACT_ORDER.map((i) => (
              <span key={i} data-current={i === impact || undefined}>
                {IMPACT_NAMES[i].name}
              </span>
            ))}
          </span>
        </Box>
        <Box sx={{ mt: 1.25 }}>
          {impact ? IMPACT_NAMES[impact].test : "Nobody has said what happens when it bites, so it comes after everything that's rated."}
        </Box>
        {impact ? (
          <Box sx={{ mt: 0.5, color: "text.secondary" }}>
            What whoever relies on it loses: <strong>{IMPACT_NAMES[impact].lost}</strong>.
          </Box>
        ) : null}
        {children}
        <Box sx={{ mt: 1.25, pt: 1.25, borderTop: 1, borderColor: "divider", fontSize: "0.92em", color: "text.secondary" }}>
          Risk orders gaps by impact, then whether one breaks a promise its level makes, then how much relies on it. Impact
          is the only part written by hand. When it bites isn't part of it: Docket can't know how the running system is used.
        </Box>
      </div>
    </DetailsCard>
  );
}
