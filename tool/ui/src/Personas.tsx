import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import type { CSSProperties } from "react";
import { DetailsCard, DetailsEyebrow, DetailsPopover } from "./design/DetailsPopover";
import { Grip } from "./design/Grip";
import { STABILITY_LEVEL_IDS } from "./design/stability/stability";
import { CapabilityStability } from "./design/catalog/CapabilityLabel";
import type { Capability, Persona } from "./state";

export function PersonaIcon({ size = 16 }: { size?: number }) {
  return <PersonOutlineRoundedIcon sx={{ fontSize: size, flex: "none", color: "var(--persona)" }} />;
}

/* A persona's picture, round. Decorative: their name is always beside it. */
export function PersonaAvatar({ persona, size = 28 }: { persona: Persona; size?: number }) {
  return <img className="persona-avatar" src={persona.image} alt="" width={size} height={size} loading="lazy" />;
}

/* A persona's title, `<Name>, <role>` as the spec has it, split in two: "Maria" and "Front desk clerk". */
export function personaNameAndRole(persona: Persona): { name: string; role: string | null } {
  const at = persona.name.indexOf(", ");
  if (at < 0) return { name: persona.name, role: null };
  const role = persona.name.slice(at + 2);
  return { name: persona.name.slice(0, at), role: role[0].toUpperCase() + role.slice(1) };
}

/* A persona on the map: just their picture, name and role. Clicking it opens the rest in the side panel. */
export function PersonaCard({ persona }: { persona: Persona }) {
  const { name, role } = personaNameAndRole(persona);
  return (
    <Card
      component="article"
      aria-label={persona.name}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        py: 1.25,
        pl: 1.25,
        pr: 2,
        width: "100%",
        boxSizing: "border-box",
        "&:hover .grip": { color: "text.secondary" },
      }}
    >
      <Grip />
      <PersonaAvatar persona={persona} size={40} />
      <Box sx={{ minWidth: 0 }}>
        <Box component="h3" sx={{ m: 0, typography: "subtitle1", fontWeight: 700, lineHeight: 1.3 }}>
          {name}
        </Box>
        {role ? <Box sx={{ typography: "body2", color: "text.secondary", lineHeight: 1.35 }}>{role}</Box> : null}
      </Box>
    </Card>
  );
}

/*
 * Readiness's own scale, so it's never mistaken for maturity, though it's
 * worked out from it: a quarter each, like maturity's bands, with names of its
 * own, and shown as a straight bar in the persona color, never as a ring in a
 * level's.
 */
export function readinessName(value: number): string {
  if (value >= 75) return "Ready";
  if (value >= 50) return "Mostly ready";
  if (value >= 25) return "Partly ready";
  return "Not ready yet";
}

/*
 * Readiness's color: from Prototype's, not ready at all, to GA's green, ready,
 * blended by how ready, so it warms up as it rises.
 */
export const readinessColor = (value: number) =>
  `color-mix(in oklch, var(--ready-high) ${Math.min(Math.max(value, 0), 100)}%, var(--ready-low))`;

/*
 * Readiness drawn as the road to ready: a track notched at each step, filled
 * as far as they've come, with a round marker for the person at their
 * percentage, and, but for the smallest, a flag at the end. Its own shape,
 * so it's never read as a maturity ring or a stability mark.
 */
function ReadinessTrack({ value, size }: { value: number; size: "small" | "large" | "wide" }) {
  return (
    <span
      className={`readiness-track ${size}${value >= 75 ? " reached" : ""}`}
      style={{ "--v": Math.min(Math.max(value, 0), 100) / 100, "--ready": readinessColor(value) } as CSSProperties}
      aria-hidden
    >
      <span className="readiness-fill" />
      <span className="readiness-person">
        <PersonRoundedIcon />
      </span>
      {size !== "small" ? <FlagRoundedIcon className="readiness-flag" /> : null}
    </span>
  );
}

/* What each step of readiness tells whoever is looking, about the person and what they need. */
const READINESS_SUMMARIES: Record<string, string> = {
  "Not ready yet": "Most of what they need is still being explored, and could change completely or be dropped.",
  "Partly ready": "Some of what they need works, but much of it is still taking shape, so expect changes and bugs.",
  "Mostly ready": "Enough of what they need is settled or stable for them to rely on day to day.",
  Ready: "What they need is mostly stable and supported, while any newer parts settle in.",
};

/* What a readiness is worked out from, for its popover: whose it is, and the capabilities that serve them, in a feature or everywhere. */
export type ReadinessBasis = { persona: string; feature?: string; capabilities: Capability[] };

/*
 * How ready the software is for someone, for its popover: its step and bar,
 * what that step means, the capabilities it's worked out from with their
 * levels, most stable first, and what readiness is.
 */
function ReadinessDetails({ value, basis }: { value: number; basis: ReadinessBasis }) {
  const name = readinessName(value);
  const n = basis.capabilities.length;
  const section = { mt: 1.5, pt: 1.5, borderTop: 1, borderColor: "divider" } as const;
  return (
    <DetailsCard card>
      <DetailsEyebrow>
        {basis.feature ? `${basis.feature}'s readiness for ${basis.persona}` : `Readiness for ${basis.persona}`}
      </DetailsEyebrow>
      <Box sx={{ mt: 1, lineHeight: 1.3 }}>
        <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1 }}>
          <Box sx={{ fontSize: "1.12em", fontWeight: 700 }} style={{ color: readinessColor(value) }}>
            {name}
          </Box>
          <Box sx={{ fontWeight: 650, fontVariantNumeric: "tabular-nums" }}>{value}%</Box>
        </Box>
        <Box sx={{ mt: 1 }}>
          <ReadinessTrack value={value} size="wide" />
        </Box>
        <Box sx={{ mt: 0.75, color: "text.secondary" }}>
          From the {n === 1 ? "capability" : `${n} capabilities`} {basis.feature ? `in ${basis.feature} ` : ""}that serve
          {n === 1 ? "s" : ""} them
        </Box>
      </Box>
      <Box sx={{ mt: 1.5 }}>{READINESS_SUMMARIES[name]}</Box>
      {n ? (
        <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, ...section }}>
          {[...basis.capabilities]
            .sort((a, b) => (b.stability ? STABILITY_LEVEL_IDS.indexOf(b.stability) : -1) - (a.stability ? STABILITY_LEVEL_IDS.indexOf(a.stability) : -1))
            .map((c) => (
              <Box key={c.id} component="li" sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, py: 0.5 }}>
                <span>{c.name}</span>
                <CapabilityStability level={c.stability} name={c.name} focusable={false} />
              </Box>
            ))}
        </Box>
      ) : null}
      <Box sx={{ ...section, fontSize: "0.92em", color: "text.secondary" }}>
        Readiness is how ready the software is for this person: worked out from the maturity of what they need. It
        says nothing about the rest of the software, which is what maturity is for. Before relying on one thing they
        need, check its stability.
      </Box>
    </DetailsCard>
  );
}

/*
 * How ready the software is for someone, as a bar, with a popover (hover,
 * focus, or tap) saying what it means and what it's from. Small, in a row,
 * it's just the bar; large, it says its step and percentage beside it. Inside
 * something clickable, `inButton` opens the popover on hover only, so a tap
 * still reaches the row.
 */
export function ReadinessMeter({
  value,
  basis,
  large = false,
  inButton = false,
}: {
  value: number;
  basis: ReadinessBasis;
  large?: boolean;
  inButton?: boolean;
}) {
  const name = readinessName(value);
  const said = `${name}: ${value}% ready for ${basis.persona}${basis.feature ? ` in ${basis.feature}` : ""}`;
  return (
    <DetailsPopover hoverOnly={inButton} title={<ReadinessDetails value={value} basis={basis} />}>
      <span
        className={`readiness${large ? " large" : ""}`}
        style={{ color: readinessColor(value) }}
        role="img"
        aria-label={said}
        tabIndex={inButton ? undefined : 0}
      >
        {large ? <strong>{name}</strong> : null}
        <ReadinessTrack value={value} size={large ? "large" : "small"} />
        {large ? <span className="readiness-value">{value}%</span> : null}
      </span>
    </DetailsPopover>
  );
}
