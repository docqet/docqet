import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import { Grip } from "./Grip";
import { ReadinessMark } from "./Readiness";
import type { ReactNode } from "react";
import { InitiativeTags } from "./Initiatives";
import type { ExploreKind } from "./names";
import { useStatusFor } from "../model";
import { startedOf, type DocketState, type Feature, type Persona, type Pick, type Target } from "../state";
import Skeleton from "@mui/material/Skeleton";
import { ReadFallback } from "./ReadFallback";

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

/* A persona on the map: their picture, name and role, and at its right how ready the software is for them, as a feature card has its maturity at its right. Clicking it opens the rest in the side panel. */
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
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box component="h3" sx={{ m: 0, typography: "subtitle1", fontWeight: 700, lineHeight: 1.3 }}>
          {name}
        </Box>
        {role ? <Box sx={{ typography: "body2", color: "text.secondary", lineHeight: 1.35 }}>{role}</Box> : null}
      </Box>
      {startedOf(readiness) ? <ReadinessMark readiness={readiness} of={`Readiness for ${name}`} inButton bare size={24} /> : null}
    </Card>
  );
}

/* How ready the software is for a persona: every capability that lists them, as the server works it out. */
export const personaReadiness = (_state: DocketState, persona: Persona) => persona.readiness;

/* A persona's row: their name, with their role under it. */
export const rowName = (p: Persona) => {
  const { name, role } = personaNameAndRole(p);
  return { name, summary: role ?? p.description };
};

/* Personas as rows, each opening in the panel, with how ready `feature` is for them when it's given. */
export function PersonaRows({ state, personas, feature, onOpen }: { state: DocketState; personas: Persona[]; feature?: Feature; onOpen: Links["onOpen"] }) {
  return (
    <ul>
      {personas.map((p) => (
        <PersonaRow key={p.id} state={state} persona={p} feature={feature} onOpen={onOpen} />
      ))}
    </ul>
  );
}

/* One persona's row, with how ready `feature` is for them, as the server works it out, when it's given. */
export function PersonaRow({ state, persona: p, feature, onOpen }: { state: DocketState; persona: Persona; feature?: Feature; onOpen: Links["onOpen"] }) {
  const read = useStatusFor(state, feature ? `persona:${p.id},feature:${feature.id}` : null);
  const readiness = read.data?.readiness ?? null;
  /* Beside the row's button rather than in it, so its popover and a retry are their own to focus and press. */
  return (
    <Box component="li" sx={{ display: "flex", alignItems: "center", gap: 1, "& > .concept-row": { flex: 1, minWidth: 0 } }}>
      <Row
        icon={<PersonaAvatar persona={p} size={28} />}
        {...rowName(p)}
        tags={<InitiativeTags state={state} ids={p.initiatives} plain />}
        onClick={() => onOpen("persona", p.id)}
      />
      {!feature ? null : readiness ? (
        startedOf(readiness) ? (
          <ReadinessMark readiness={readiness} of={`${feature.name}'s readiness for ${personaNameAndRole(p).name}`} />
        ) : null
      ) : (
        <ReadFallback read={read} what="readiness" inline skeleton={<Skeleton variant="rounded" width={96} height={20} />} />
      )}
    </Box>
  );
}

export function Row({
  icon,
  name,
  summary,
  tags,
  onClick,
  children,
}: {
  icon: ReactNode;
  name: string;
  summary?: ReactNode;
  /* What it's part of, such as its initiatives, under its name. */
  tags?: ReactNode;
  onClick: () => void;
  children?: ReactNode;
}) {
  return (
    <button type="button" className="concept-row" onClick={onClick}>
      <span style={{ alignSelf: "flex-start", marginTop: 2, display: "inline-flex" }}>{icon}</span>
      <span className="concept-row-text">
        <span className="concept-row-name">{name}</span>
        {summary ? <span className="concept-row-summary">{summary}</span> : null}
        {tags}
      </span>
      {children}
    </button>
  );
}

export type Links = {
  state: DocketState;
  onOpen: (kind: ExploreKind, id: string | null) => void;
  onConcept: (id: string) => void;
  onShow: (target: Target) => void;
  isFiltering: (pick: Pick) => boolean;
  onFilter: (pick: Pick) => void;
};
