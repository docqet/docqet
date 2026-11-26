import { Fragment, useEffect, useRef, type ReactNode } from "react";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { ConceptIcon } from "../Concepts";
import { StabilityMark } from "../stability/StabilityMark";
import { Term } from "../term/Term";
import { CapabilityStability } from "../CapabilityLabel";
import { TECHNICAL_NAMES, NAMES, type ExploreKind } from "../names";
import { DomainIcon } from "../names";
import { PersonaAvatar, personaNameAndRole } from "../Personas";
import { ProjectIcon } from "../shell/ProductFilter";
import { InitiativeIcon } from "../shell/ScopeFilter";
import { InitiativeTags } from "../Initiatives";
import {
  contradictionsOf,
  domainName,
  pageHref,
  projectName,
  type Capability,
  type CapabilityLevel,
  type Doc,
  type DocketState,
  type TechnicalKind,
  type PageAt,
  type Persona,
  type Pick,
} from "../../state";
import { Tip } from "../Tip";
import { docHref, navigate, withParam, type Route } from "../../routes";
import { PageHeader, View } from "../shell/layout";
import "./page.css";

export type DocGo = {
  state: DocketState;
  onOpen: (kind: ExploreKind, id: string | null) => void;
  onConcept: (id: string) => void;
  onPick: (pick: Pick) => void;
};

export type DocPageProps = DocGo & { route: Route };

export const KIND_NAMES: Record<Pick["kind"] | TechnicalKind | "initiative", { one: string; icon: ReactNode }> = {
  ...NAMES,
  concept: { one: "Concept", icon: <ConceptIcon size={18} /> },
  initiative: { one: "Initiative", icon: <InitiativeIcon size={18} /> },
  ...TECHNICAL_NAMES,
};

/* A tab's address on this page. */
export const tabHref = (tab: string) => withParam("tab", tab);

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
    else top.current?.closest(".view")?.scrollTo({ top: 0 });
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
}: {
  state: DocketState;
  kind: Pick["kind"] | TechnicalKind | "initiative";
  doc: Doc;
  title?: ReactNode;
  kindNote?: ReactNode;
  trail?: ReactNode;
  /* The initiatives it's part of, its own or its capabilities', as tags at the end of the trail. */
  initiatives?: string[];
  marks?: ReactNode;
  stats: ReactNode;
}) {
  const problems = contradictionsOf(state, kind, doc.id);
  const single = doc.from.length === 1;
  const project = single && state.projects.length > 1 ? projectName(state, doc.from[0].project) : null;
  return (
    <>
      <PageHeader
        trail={
          trail || project || initiatives.length ? (
            <>
              {trail}
              {trail && project ? <span className="faint">·</span> : null}
              {project ? (
                <span className="page-crumb">
                  <ProjectIcon size={14} />
                  {project}
                </span>
              ) : null}
              <InitiativeTags state={state} ids={initiatives} />
            </>
          ) : undefined
        }
        kind={
          <>
            {KIND_NAMES[kind].icon}
            <Term id={kind}>{KIND_NAMES[kind].one}</Term>
            {kindNote ? <span className="page-kind-note">· {kindNote}</span> : null}
          </>
        }
        title={title}
        marks={marks}
        lede={single && doc.description ? doc.description : undefined}
        stats={stats}
      />
      {problems.map((p) => (
        <p key={p.message} className="explore-problem page-problem">
          <WarningAmberRoundedIcon sx={{ fontSize: 17, flex: "none" }} />
          {p.message}
        </p>
      ))}
    </>
  );
}

/* A domain in a trail, as a link to its page. */
export function DomainCrumb({ state, id }: { state: DocketState; id: string }) {
  return (
    <a className="page-crumb" href={docHref("domain", id)}>
      <DomainIcon size={14} />
      {domainName(state, id)}
    </a>
  );
}

/* The domains something spans, as links. */
export function DomainTrail({ state, domains }: { state: DocketState; domains: string[] }) {
  if (!domains.length) return <span>In no domain</span>;
  return (
    <>
      {domains.map((id, i) => (
        <Fragment key={id}>
          {i ? <span className="faint">+</span> : null}
          <DomainCrumb state={state} id={id} />
        </Fragment>
      ))}
    </>
  );
}

/* A capability as a link to its page, with its level. */
export function CapabilityLink({ capability, tab }: { capability: Capability; tab?: string }) {
  return (
    <span className="page-crumb">
      <a className="page-crumb" href={docHref("capability", capability.id, tab)}>
        {NAMES.capability.icon}
        {capability.name}
      </a>
      <CapabilityStability level={capability.stability} name={capability.name} focusable={false} />
    </span>
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

export function Avatars({ personas }: { personas: Persona[] }) {
  const more = personas.length - MAX_AVATARS;
  return (
    <span className="page-avatars">
      {personas.slice(0, MAX_AVATARS).map((p) => (
        <Tip key={p.id} title={personaNameAndRole(p).name}>
          <span>
            <PersonaAvatar persona={p} size={26} />
          </span>
        </Tip>
      ))}
      {more > 0 ? <span className="page-avatars-more">+{more}</span> : null}
    </span>
  );
}

/* Where links on a doc page go: to the page of what they name. */
export function docGo(state: DocketState): DocGo {
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
