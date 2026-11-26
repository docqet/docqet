import CasinoRoundedIcon from "@mui/icons-material/CasinoRounded";
import CrisisAlertRoundedIcon from "@mui/icons-material/CrisisAlertRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import { DetailsCard, DetailsEyebrow, DetailsPopover } from "../DetailsPopover";

/*
 * What's at stake in a gap, or was in the gap a tradeoff was, when it bites: its
 * impact, as a badge in its color, with a popover (hover, focus, or tap)
 * saying what the impact means. Risk, which impact is one part of, has the
 * rising bars (see RiskScore).
 */

/*
 * What a gap does to those it reaches when it bites, least to most,
 * whatever kind of software it's in: each with what it takes from them and
 * the test that sets it. How likely it is, and how many it reaches, are
 * rated apart (below).
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

/* Each part of a gap's risk that people rate has an icon: impact a target, likelihood dice, reach people. */
export type RiskPart = "impact" | "likelihood" | "reach";

export function RiskPartIcon({ part, size = 14 }: { part: RiskPart; size?: number }) {
  const sx = { fontSize: size };
  if (part === "impact") return <CrisisAlertRoundedIcon className="risk-tag-icon" sx={sx} aria-hidden />;
  if (part === "likelihood") return <CasinoRoundedIcon className="risk-tag-icon" sx={sx} aria-hidden />;
  return <GroupsRoundedIcon className="risk-tag-icon" sx={sx} aria-hidden />;
}

/* How likely it is to bite within a year, most first, with the test that sets it. */
export type LikelihoodId = "certain" | "expected" | "possible" | "unlikely";
export const LIKELIHOOD_NAMES: Record<LikelihoodId, { name: string; test: string }> = {
  certain: { name: "Certain", test: "It's happening, or it definitely will within a year." },
  expected: { name: "Expected", test: "You'd bet on it happening within a year." },
  possible: { name: "Possible", test: "It could happen, but you wouldn't bet on it." },
  unlikely: { name: "Unlikely", test: "It would surprise you." },
};

/* What share of the people the software serves it would reach if it bit, most first. */
export type ReachId = "all" | "most" | "some" | "few";
export const REACH_NAMES: Record<ReachId, { name: string; test: string }> = {
  all: { name: "All", test: "Everyone the software serves." },
  most: { name: "Most", test: "Most of them: it's the usual case." },
  some: { name: "Some", test: "A real share of them, but not the usual case." },
  few: { name: "Few", test: "A small group with a particular need or situation." },
};

/* Its likelihood and reach, in a few words, where either isn't the usual certain and all: "Possible · reaches few". Empty otherwise. */
export const judgementText = (likelihood: LikelihoodId, reach: ReachId) =>
  [likelihood !== "certain" ? LIKELIHOOD_NAMES[likelihood].name : null, reach !== "all" ? `reaches ${reach}` : null]
    .filter(Boolean)
    .join(" · ")
    .replace(/^r/, (c) => c.toUpperCase());

/* Its likelihood and reach, for a popover: each with what it means. */
export function JudgementSection({ likelihood, reach }: { likelihood: LikelihoodId; reach: ReachId }) {
  const l = LIKELIHOOD_NAMES[likelihood];
  const r = REACH_NAMES[reach];
  return (
    <RiskSection label={`${l.name} · reaches ${r.name.toLowerCase()}`}>
      <div>
        <strong>{l.name}:</strong> {l.test}
      </div>
      <Box sx={{ mt: 0.5 }}>
        <strong>Reaches {r.name.toLowerCase()}:</strong> {reach === "all" ? "All the people this software serves." : r.test}
      </Box>
    </RiskSection>
  );
}

/*
 * Each part of a gap's risk people rate, impact, likelihood and reach: its
 * values most first, what each is called, and the test that sets it. Each
 * value has a color, its tag's, used on the tag, the popover's heading and
 * its scale alike.
 */
type PartInfo = { eyebrow: string; scale: string; order: string[]; names: Record<string, { name: string; test: string }>; means: string };

const PARTS_INFO: Record<RiskPart, PartInfo> = {
  impact: {
    eyebrow: "How bad it is",
    scale: "Impact, most first",
    order: ["damaging", "blocking", "inconvenient", "negligible"],
    names: IMPACT_NAMES,
    means:
      "How bad it is for those it reaches if it bit, by the first test it meets, most first. Never lowered for being unlikely or reaching few: likelihood and reach say that.",
  },
  likelihood: {
    eyebrow: "How likely it is to bite",
    scale: "Likelihood, most first",
    order: ["certain", "expected", "possible", "unlikely"],
    names: LIKELIHOOD_NAMES,
    means:
      "How likely the gap is to bite within the next year, by judgement. When torn between two, pick the higher. Each step down takes a quarter off its risk.",
  },
  reach: {
    eyebrow: "How many it would reach",
    scale: "Reach, most first",
    order: ["all", "most", "some", "few"],
    names: { ...REACH_NAMES, all: { name: "All", test: "Everyone the software serves." } },
    means:
      "How many of the people this software serves it would reach if it bit, by who they are and what they do, not a count. When torn between two, pick the higher. Each step down takes a quarter off its risk.",
  },
};

/* The attributes that give a value its color: an impact's own, or a likelihood's or reach's hue at its strength, 4 for the most down to 1. */
const colorOf = (part: RiskPart, value: string) =>
  part === "impact" ? { "data-part": part, "data-impact": value } : { "data-part": part, "data-step": 4 - PARTS_INFO[part].order.indexOf(value) };

/* A value as a tag, without a popover: its part's icon and its name, in its color. `label` names the part first. */
export function PartTag({ part, value, label = false, children }: { part: RiskPart; value: string; label?: boolean; children?: ReactNode }) {
  const info = PARTS_INFO[part];
  return (
    <span className={part === "impact" ? "impact-badge" : "judgement-badge"} {...colorOf(part, value)}>
      <RiskPartIcon part={part} size={13} />
      {label ? <span className="judgement-badge-label">{part === "impact" ? "Impact" : part === "likelihood" ? "Likelihood" : "Reach"}</span> : null}
      {info.names[value].name}
      {children}
    </span>
  );
}

/* A part's scale, for its popover: each value as its tag, with its test, this one marked. */
function Scale({ part, value }: { part: RiskPart; value: string }) {
  const info = PARTS_INFO[part];
  return (
    <RiskSection label={info.scale}>
      <ul className="judgement-scale">
        {info.order.map((v) => (
          <li key={v} data-current={v === value || undefined}>
            <span>
              <PartTag part={part} value={v} />
            </span>
            <span>{info.names[v].test}</span>
          </li>
        ))}
      </ul>
    </RiskSection>
  );
}

/* The top of a part's popover: what it is, this value's name in its color, and its test. */
function PartHead({ part, value, eyebrow }: { part: RiskPart; value: string; eyebrow?: string }) {
  const info = PARTS_INFO[part];
  return (
    <>
      <DetailsEyebrow>{eyebrow ?? info.eyebrow}</DetailsEyebrow>
      <Box className="part-ink" {...colorOf(part, value)} sx={{ mt: 1, display: "flex", alignItems: "center", gap: 0.75, fontSize: "1.12em", fontWeight: 700 }}>
        <RiskPartIcon part={part} size={18} />
        {part === "reach" ? `Reaches ${info.names[value].name.toLowerCase()}` : info.names[value].name}
      </Box>
      <Box sx={{ mt: 0.75 }}>{info.names[value].test}</Box>
    </>
  );
}

/* `labelled` names the part in the badge too, where nothing around it says which it is. */
export function JudgementBadge({
  part,
  value,
  inButton = false,
  labelled = false,
}: {
  part: "likelihood" | "reach";
  value: LikelihoodId | ReachId;
  inButton?: boolean;
  labelled?: boolean;
}) {
  const info = PARTS_INFO[part];
  return (
    <DetailsPopover
      hoverOnly={inButton}
      title={
        <DetailsCard card width={340}>
          <PartHead part={part} value={value} />
          <Scale part={part} value={value} />
          <Box sx={{ mt: 1.25, color: "text.secondary", fontSize: "0.92em" }}>{info.means}</Box>
        </DetailsCard>
      }
    >
      <span
        role="img"
        aria-label={`${part === "likelihood" ? "Likelihood" : "Reach"}: ${info.names[value].name}`}
        tabIndex={inButton ? undefined : 0}
        className="part-tag-focus"
      >
        <PartTag part={part} value={value} label={labelled} />
      </span>
    </DetailsPopover>
  );
}

/* How many there are of each impact, worst first: "3 damaging · 12 inconvenient". */
export const impactCounts = (items: { impact: ImpactId }[]) =>
  [...IMPACT_ORDER]
    .reverse()
    .map((i) => [IMPACT_NAMES[i].name.toLowerCase(), items.filter((g) => g.impact === i).length] as const)
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
  likelihood,
  reach,
  eyebrow,
  inButton = false,
  children,
}: {
  impact: ImpactId;
  /* A gap's: given, the popover says them, and the badge says them where they aren't certain and all, unless `inButton`, where a row has no room. */
  likelihood?: LikelihoodId;
  reach?: ReachId;
  eyebrow: string;
  inButton?: boolean;
  children?: ReactNode;
}) {
  const name = IMPACT_NAMES[impact].name;
  const judgement = likelihood !== undefined && reach !== undefined ? { likelihood, reach } : null;
  const judged = judgement && !inButton ? judgementText(judgement.likelihood, judgement.reach) : "";
  return (
    <DetailsPopover
      hoverOnly={inButton}
      title={
        <ImpactDetails impact={impact} eyebrow={eyebrow}>
          {judgement ? <JudgementSection likelihood={judgement.likelihood} reach={judgement.reach} /> : null}
          {children}
        </ImpactDetails>
      }
    >
      <span role="img" aria-label={`Impact: ${name}${judged ? `, ${judged}` : ""}`} tabIndex={inButton ? undefined : 0} className="part-tag-focus">
        <PartTag part="impact" value={impact}>
          {judged ? <span className="impact-badge-judged">{judged}</span> : null}
        </PartTag>
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

/* What an impact means, for the popover, as likelihood's and reach's do: its name and test, what it takes, its scale, then its sections. */
function ImpactDetails({ impact, eyebrow, children }: { impact: ImpactId; eyebrow: string; children?: ReactNode }) {
  return (
    <DetailsCard card width={340}>
      <div className="risk-details" data-impact={impact}>
        <PartHead part="impact" value={impact} eyebrow={eyebrow} />
        <Box sx={{ mt: 0.5, color: "text.secondary" }}>
          What whoever relies on it loses: <strong>{IMPACT_NAMES[impact].lost}</strong>.
        </Box>
        <Scale part="impact" value={impact} />
        <Box sx={{ mt: 1.25, color: "text.secondary", fontSize: "0.92em" }}>{PARTS_INFO.impact.means}</Box>
        {children}
      </div>
    </DetailsCard>
  );
}
