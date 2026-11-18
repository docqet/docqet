import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { DetailsCard, DetailsEyebrow } from "./design/DetailsPopover";
import { STABILITY, levelColor } from "./design/stability/stability";
import { StabilityTrack } from "./design/stability/StabilityTrack";
import { levelId, type Capability, type Level, type Rule } from "./state";

/* A rule as a capability shows it, with the other capabilities that follow it. */
export type RuleLine = Rule & { also: string[] };

/* One project's part of a capability: the project's name, its level there, and how that project describes it. */
export type ProjectLine = { name: string; level: Level; summary?: string };

/* "A", "A and B", "A, B and C". */
const list = (names: string[]) =>
  names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : names[0];

/*
 * What a capability's name opens on hover: its name and level, what it's
 * for, and the rules it follows, each as its name, the rule itself, and where
 * else it applies, since rules belong to the domain and not to one capability.
 * Kept simple for now: no status or evidence yet.
 */
export function CapabilityDetails({
  capability,
  rules,
  concepts,
  projects = [],
  contradictions = [],
}: {
  capability: Capability;
  rules: RuleLine[];
  /* The concepts it uses, as the app shows them. */
  concepts?: ReactNode;
  /* Each project that builds it, named, with its level and summary there. Shown when there are two or more. */
  projects?: ProjectLine[];
  /* What combining found wrong with it, such as projects describing it differently. */
  contradictions?: string[];
}) {
  const level = levelId(capability.stability);
  const summaries = new Set(projects.map((s) => s.summary ?? ""));
  return (
    <DetailsCard card>
      <DetailsEyebrow>Capability</DetailsEyebrow>
      <Box sx={{ mt: 0.5, fontSize: "1.12em", fontWeight: 700, lineHeight: 1.3 }}>{capability.name}</Box>
      {projects.length > 1 ? (
        <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, mt: 0.5, display: "grid", gap: 0.25 }}>
          {projects.map((s) => (
            <Box
              component="li"
              key={s.name}
              sx={[{ display: "flex", alignItems: "center", gap: 0.75, fontWeight: 500 }, levelColor(levelId(s.level))]}
            >
              <StabilityTrack level={levelId(s.level)} />
              {STABILITY[levelId(s.level)].name}
              <Box component="span" sx={{ color: "text.secondary", fontWeight: 400 }}>
                in {s.name}
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Box
          sx={[
            { display: "flex", alignItems: "center", gap: 0.75, mt: 0.5, fontWeight: 500 },
            levelColor(level),
          ]}
        >
          <StabilityTrack level={level} />
          {STABILITY[level].name}
        </Box>
      )}
      {/* Where projects describe it differently, each one's summary, so the contradiction can be seen. */}
      {summaries.size > 1 ? (
        <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, mt: 1.25, display: "grid", gap: 0.75 }}>
          {projects.map((s) => (
            <li key={s.name}>
              <Box sx={{ fontSize: 12, fontWeight: 600, color: "text.secondary" }}>{s.name}</Box>
              {s.summary}
            </li>
          ))}
        </Box>
      ) : capability.summary ? (
        <Box sx={{ mt: 1.25 }}>{capability.summary}</Box>
      ) : null}

      {contradictions.length ? (
        <Box sx={{ mt: 1.25, display: "grid", gap: 0.5 }}>
          {contradictions.map((message) => (
            <Box key={message} sx={{ display: "flex", gap: 0.75, color: "var(--warning)", fontSize: 13 }}>
              <WarningAmberRoundedIcon sx={{ fontSize: 16, mt: "1px", flex: "none" }} />
              {message}
            </Box>
          ))}
        </Box>
      ) : null}

      {concepts ? (
        <Box sx={{ mt: 1.5, pt: 1.5, borderTop: 1, borderColor: "divider" }}>
          <DetailsEyebrow>Concepts</DetailsEyebrow>
          <Box sx={{ mt: 0.75 }}>{concepts}</Box>
        </Box>
      ) : null}

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

/* A warning after a name, for something with a contradiction; what it is shows on hover. */
export function ContradictionHint({ messages }: { messages: string[] }) {
  if (!messages.length) return null;
  return (
    <WarningAmberRoundedIcon
      aria-label={messages.join(" ")}
      sx={{ flex: "none", fontSize: 15, color: "var(--warning)" }}
    />
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
