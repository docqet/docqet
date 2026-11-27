import { Fragment, useEffect, useRef, type ReactNode } from "react";
import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { ConceptIcon } from "../Concepts";
import { StabilityMark } from "../stability/StabilityMark";
import { Term } from "../term/Term";
import { CapabilityStability } from "../CapabilityLabel";
import { TECHNICAL_NAMES, NAMES, type ExploreKind } from "../names";
import { ConstraintIcon, AreaIcon, ProblemIcon } from "../names";
import { PersonaAvatar, personaNameAndRole } from "../Personas";
import { ProjectIcon } from "../shell/ProductFilter";
import { InitiativeIcon } from "../shell/ScopeFilter";
import { InitiativeTags } from "../Initiatives";
import {
  areaName,
  contradictionsOf,
  pageHref,
  projectName,
  type Capability,
  type CapabilityLevel,
  type Doc,
  type DocqetState,
  type TechnicalKind,
  type PageAt,
  type Persona,
  type Pick,
} from "../../state";
import Tooltip from "@mui/material/Tooltip";
import { docHref, navigate, withParam, type Route } from "../../routes";
import { PageHeader, View } from "../shell/layout";

export type DocGo = {
  state: DocqetState;
  onOpen: (kind: ExploreKind, id: string | null) => void;
  onConcept: (id: string) => void;
  onPick: (pick: Pick) => void;
};

export type DocPageProps = DocGo & { route: Route };

export const KIND_NAMES: Record<Pick["kind"] | TechnicalKind | "problem" | "constraint" | "initiative", { one: string; icon: ReactNode }> = {
  ...NAMES,
  concept: { one: "Concept", icon: <ConceptIcon size={18} /> },
  problem: { one: "Problem", icon: <ProblemIcon size={18} /> },
  constraint: { one: "Constraint", icon: <ConstraintIcon size={18} /> },
  initiative: { one: "Initiative", icon: <InitiativeIcon size={18} /> },
  ...TECHNICAL_NAMES,
};

/* A tab's address on this page. */
export const tabHref = (tab: string) => withParam("tab", tab);

/*
 * The looks doc pages share. A card holds rows, such as an area's features
 * or what implements something; in a Section it sits flush with the
 * section's width.
 */
export const cardSx: SystemStyleObject<Theme> = {
  px: 2.25,
  py: 1.75,
  bgcolor: "background.paper",
  border: 1,
  borderColor: "divider",
  borderRadius: "12px",
};

/* A line of prose in a section, such as what a level means or that nothing serves them yet, with its links in the accent. */
export const lineSx: SystemStyleObject<Theme> = {
  maxWidth: 760,
  fontSize: 14,
  lineHeight: 1.55,
  color: "text.secondary",
  "& a": { color: "primary.main", textDecoration: "none" },
};

/* A line apiece: an area's or feature's name, then its level, maturity or readiness. */
export const levelsSx: SystemStyleObject<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: "2px",
  maxWidth: 640,
  mb: 1.5,
  "& > li": {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto auto",
    alignItems: "center",
    gap: 1.5,
    py: 1,
    fontSize: 13.5,
    borderBottom: 1,
    borderColor: "divider",
  },
  "& > li > a": { fontWeight: 600 },
};

/* A small outlined tag, such as a rubric quality's name or a kind of software. */
export const tagSx: SystemStyleObject<Theme> = {
  px: "7px",
  fontSize: 11,
  fontWeight: 600,
  lineHeight: "18px",
  color: "text.secondary",
  border: 1,
  borderColor: "surface.borderStrong",
  borderRadius: 999,
};

/* What's faint beside what matters, such as a separator in a trail or "None" in a table. */
export const faintSx: SystemStyleObject<Theme> = { color: "text.disabled" };

/*
 * Something named with its icon, as in a trail: a link to its page, given
 * `href`, lit in the accent on hover. Icons come at 14px, whatever size
 * they're made at.
 */
export function Crumb({ href, icon, children }: { href?: string; icon?: ReactNode; children: ReactNode }) {
  const sx: SystemStyleObject<Theme> = { display: "inline-flex", alignItems: "center", gap: 0.5, "& svg": { fontSize: "14px !important" } };
  return href ? (
    <Box component="a" href={href} sx={{ ...sx, color: "inherit", textDecoration: "none", "&:hover": { color: "primary.main" } }}>
      {icon}
      {children}
    </Box>
  ) : (
    <Box component="span" sx={sx}>
      {icon}
      {children}
    </Box>
  );
}

/*
 * A doc's page: its view, which lands at its top when it opens and whenever
 * its tab changes, or at the section its address names, such as #rubric.
 */
export function DocView({ title, route, children }: { title: string; route: Route; children: ReactNode }) {
  const top = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const section = window.location.hash.slice(1);
    const at = section ? document.getElementById(section) : null;
    if (at) at.scrollIntoView();
    else top.current?.closest("[data-view]")?.scrollTo({ top: 0 });
  }, [route.tab]);
  return (
    <View title={title}>
      <div ref={top}>{children}</div>
    </View>
  );
}

/*
 * The top of a doc's page: where it is, as a trail of links, its kind, name
 * and the mark beside it, what it is in a sentence, its figures, and any
 * contradictions. Where several sources say what it is, each says so on its
 * first tab, so there's no one sentence here.
 */
export function DocHeader({
  state,
  kind,
  doc,
  title = doc.name,
  kindNote,
  trail,
  initiatives = [],
  marks,
  stats,
  under,
}: {
  state: DocqetState;
  kind: Pick["kind"] | TechnicalKind | "problem" | "constraint" | "initiative";
  doc: Doc;
  title?: ReactNode;
  kindNote?: ReactNode;
  trail?: ReactNode;
  /* The initiatives it's part of, its own or its capabilities', as tags at the end of the trail. */
  initiatives?: string[];
  marks?: ReactNode;
  stats: ReactNode;
  /* More it says about itself, under the figures, such as what a problem costs, or where a constraint comes from. */
  under?: ReactNode;
}) {
  const findings = contradictionsOf(state, kind, doc.id);
  const single = doc.from.length === 1;
  const project = single && state.projects.length > 1 ? projectName(state, doc.from[0].project) : null;
  return (
    <>
      <PageHeader
        trail={
          trail || project || initiatives.length ? (
            <>
              {trail}
              {trail && project ? (
                <Box component="span" sx={faintSx}>
                  ·
                </Box>
              ) : null}
              {project ? <Crumb icon={<ProjectIcon size={14} />}>{project}</Crumb> : null}
              <InitiativeTags state={state} ids={initiatives} />
            </>
          ) : undefined
        }
        kind={
          <>
            {KIND_NAMES[kind].icon}
            <Term id={kind}>{KIND_NAMES[kind].one}</Term>
            {kindNote ? (
              <Box component="span" sx={{ fontWeight: 500, color: "text.disabled" }}>
                · {kindNote}
              </Box>
            ) : null}
          </>
        }
        title={title}
        marks={marks}
        lede={single && doc.description ? doc.description : undefined}
        stats={stats}
      />
      {under}
      {/* A contradiction, as a callout of its own, under the header and over the tabs. */}
      {findings.map((p) => (
        <Box
          component="p"
          key={p.message}
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1,
            mt: -1,
            mb: 2.5,
            px: 1.5,
            py: 1.25,
            fontSize: 13,
            lineHeight: 1.45,
            color: "warning.main",
            bgcolor: (t) => `color-mix(in srgb, ${t.vars.palette.warning.main} 9%, transparent)`,
            border: 1,
            borderColor: (t) => `color-mix(in srgb, ${t.vars.palette.warning.main} 30%, transparent)`,
            borderRadius: "8px",
          }}
        >
          <WarningAmberRoundedIcon sx={{ fontSize: 17, flex: "none", mt: "1px" }} />
          {p.message}
        </Box>
      ))}
    </>
  );
}

/* An area in a trail, as a link to its page. */
export function AreaCrumb({ state, id }: { state: DocqetState; id: string }) {
  return (
    <Crumb href={docHref("area", id)} icon={<AreaIcon size={14} />}>
      {areaName(state, id)}
    </Crumb>
  );
}

/* The areas something is in, or what serves it is, as links. */
export function AreaTrail({ state, areas }: { state: DocqetState; areas: string[] }) {
  if (!areas.length) return <span>In no area</span>;
  return (
    <>
      {areas.map((id, i) => (
        <Fragment key={id}>
          {i ? (
            <Box component="span" sx={faintSx}>
              +
            </Box>
          ) : null}
          <AreaCrumb state={state} id={id} />
        </Fragment>
      ))}
    </>
  );
}

/* A capability as a link to its page, with its level. */
export function CapabilityLink({ capability, tab }: { capability: Capability; tab?: string }) {
  return (
    <Crumb>
      <Crumb href={docHref("capability", capability.id, tab)} icon={NAMES.capability.icon}>
        {capability.name}
      </Crumb>
      <CapabilityStability level={capability.stability} name={capability.name} focusable={false} />
    </Crumb>
  );
}

/*
 * A capability's level. In a list, just its mark, whose popover says what
 * the level means; with `named`, its name too, inside the mark so hovering
 * either opens it. A draft is the word Draft, which has no mark.
 */
export function LevelName({ level, name, named = false }: { level: CapabilityLevel; name: string; named?: boolean }) {
  if (!level || !named) return <CapabilityStability level={level} name={name} />;
  return <StabilityMark level={level} feature={name} size="long" />;
}

export const MAX_AVATARS = 6;

/* Personas' pictures, overlapping, each ringed in the card's color, and how many more past the first few. */
export function Avatars({ personas }: { personas: Persona[] }) {
  const more = personas.length - MAX_AVATARS;
  return (
    <Box component="span" sx={{ display: "inline-flex" }}>
      {personas.slice(0, MAX_AVATARS).map((p, i) => (
        <Tooltip key={p.id} title={personaNameAndRole(p).name}>
          <Box
            component="span"
            sx={{
              display: "inline-flex",
              ml: i ? "-6px" : 0,
              borderRadius: "50%",
              boxShadow: (t) => `0 0 0 2px ${t.vars.palette.background.paper}`,
            }}
          >
            <PersonaAvatar persona={p} size={26} />
          </Box>
        </Tooltip>
      ))}
      {more > 0 ? (
        <Box component="span" sx={{ alignSelf: "center", ml: 0.75, fontSize: 12, fontWeight: 600, color: "text.secondary" }}>
          +{more}
        </Box>
      ) : null}
    </Box>
  );
}

/* Where links on a doc page go: to the page of what they name. */
export function docGo(state: DocqetState): DocGo {
  const onGo = (pick: PageAt) => navigate(pageHref(pick));
  return {
    state,
    onOpen: (kind, id) => {
      if (id) onGo({ kind, id });
    },
    onConcept: (id) => onGo({ kind: "concept", id }),
    onPick: onGo,
  };
}
