import Box from "@mui/material/Box";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import { DetailsCard, DetailsEyebrow } from "./design/DetailsPopover";
import { STABILITY, levelColor } from "./design/stability/stability";
import { StabilityTrack } from "./design/stability/StabilityTrack";
import { levelId, type Capability, type Rule } from "./state";

/* A rule as a capability shows it, with the other capabilities that follow it. */
export type RuleLine = Rule & { also: string[] };

/* "A", "A and B", "A, B and C". */
const list = (names: string[]) =>
  names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : names[0];

/*
 * What a capability's name opens on hover: its name and level, what it's
 * for, and the rules it follows, each as its name, the rule itself, and where
 * else it applies, since rules belong to the domain and not to one capability.
 * Kept simple for now: no status or evidence yet.
 */
export function CapabilityDetails({ capability, rules }: { capability: Capability; rules: RuleLine[] }) {
  const level = levelId(capability.stability);
  return (
    <DetailsCard card>
      <DetailsEyebrow>Capability</DetailsEyebrow>
      <Box sx={{ mt: 0.5, fontSize: "1.12em", fontWeight: 700, lineHeight: 1.3 }}>{capability.name}</Box>
      <Box
        sx={[
          { display: "flex", alignItems: "center", gap: 0.75, mt: 0.5, fontWeight: 500 },
          levelColor(level),
        ]}
      >
        <StabilityTrack level={level} />
        {STABILITY[level].name}
      </Box>
      {capability.summary ? <Box sx={{ mt: 1.25 }}>{capability.summary}</Box> : null}

      <Box sx={{ mt: 1.5, pt: 1.5, borderTop: 1, borderColor: "divider" }}>
        <DetailsEyebrow>{rules.length === 1 ? "1 rule" : `${rules.length} rules`}</DetailsEyebrow>
        {rules.length ? (
          <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, mt: 0.75, display: "grid", gap: 1.25 }}>
            {rules.map((rule) => (
              <li key={rule.id}>
                <Box sx={{ fontWeight: 600 }}>{rule.name}</Box>
                {rule.summary ? <Box sx={{ color: "text.secondary" }}>{rule.summary}</Box> : null}
                {rule.also.length ? (
                  <Box sx={{ mt: 0.25, fontSize: 12, color: "text.secondary" }}>Also applies to {list(rule.also)}</Box>
                ) : null}
              </li>
            ))}
          </Box>
        ) : (
          <Box sx={{ mt: 0.5, color: "text.secondary" }}>None written down yet.</Box>
        )}
      </Box>
    </DetailsCard>
  );
}

/* After a capability's name, how many rules it has, so it's clear there's more on hover. */
export function RulesHint({ count }: { count: number }) {
  if (!count) return null;
  return (
    <Box
      component="span"
      aria-label={count === 1 ? "1 rule" : `${count} rules`}
      sx={{
        flex: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: 0.25,
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1,
        color: "text.secondary",
      }}
    >
      <RuleRoundedIcon sx={{ fontSize: 14 }} />
      {count}
    </Box>
  );
}
