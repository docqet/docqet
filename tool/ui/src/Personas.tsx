import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import { Grip } from "./design/Grip";
import { ReadinessMark } from "./Readiness";
import { capabilitiesById, readinessOf, startedOf, type DocketState, type Persona } from "./state";

export function PersonaIcon({ size = 16 }: { size?: number }) {
  return <PersonOutlineRoundedIcon sx={{ fontSize: size, flex: "none", color: "var(--persona)" }} />;
}

/* A persona's picture, round, or their initials without one. Decorative: their name is always beside it. */
export function PersonaAvatar({ persona, size = 28 }: { persona: Persona; size?: number }) {
  if (!persona.image) {
    const initials = persona.name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join("");
    return (
      <span className="persona-avatar persona-initials" aria-hidden style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}>
        {initials}
      </span>
    );
  }
  return <img className="persona-avatar" src={persona.image} alt="" width={size} height={size} loading="lazy" />;
}

/* A persona's name, and under it their job title and role in the software, whichever they have: "Founder · Client Admin". */
export function personaNameAndRole(persona: Persona): { name: string; role: string | null } {
  const under = [persona.title, persona.role].filter(Boolean).join(" · ");
  return { name: persona.name, role: under || null };
}

/* A persona on the map: their picture, name and role, and how ready the software is for them. Clicking it opens the rest in the side panel. */
export function PersonaCard({ state, persona }: { state: DocketState; persona: Persona }) {
  const { name, role } = personaNameAndRole(persona);
  const readiness = personaReadiness(state, persona);
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
        {startedOf(readiness) ? (
          <Box sx={{ mt: 0.5 }}>
            <ReadinessMark readiness={readiness} of={`Readiness for ${name}`} inButton />
          </Box>
        ) : null}
      </Box>
    </Card>
  );
}

/* How ready the software is for a persona: every capability that lists them. */
export const personaReadiness = (state: DocketState, persona: Persona) => readinessOf(state, capabilitiesById(state, persona.capabilities));
