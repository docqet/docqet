import type { MouseEvent } from "react";
import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import { GROUP_HEAD, GROUP_PAD, type CanvasGroup, type CanvasItem, type Pos, type Size } from "./Canvas";
import { CapabilityCard } from "./CapabilityCard";
import { FeatureCard } from "./FeatureCard";
import { MaturityRing } from "../../../components/maturity/MaturityRing";
import { ContradictionHint } from "./CapabilityHints";
import { ConceptChips, ConceptIcon } from "../../../components/Concepts";
import { PersonaCard } from "../../../components/Personas";
import { ProjectIcon } from "../../../components/shell/ProductFilter";
import { RiskScore } from "../../../components/risk/RiskScore";
import {
  capabilityCard,
  conceptsOf,
  contradictionsOf,
  domainGroup,
  domainName,
  featureCard,
  find,
  personaCard,
  projectName,
  partOf,
  type Capability,
  type Doc,
  type DocqetState,
  type Domain,
  type Exposure,
  type Feature,
  type Gap,
  type Pick,
  type RiskAcross,
} from "../../../state";
import { useStatusFor } from "../../../model";
import Tooltip from "@mui/material/Tooltip";
import { DomainIcon } from "../../../components/names";
import Skeleton from "@mui/material/Skeleton";
import { ReadFallback } from "../../../components/ReadFallback";

/* A card's width, and the room between cards, as tidy lays them out. A persona's card is narrower. */
const SLOT = 320;
const PERSONA_SLOT = 280;
const GAP = 28;

/* A row's risk ring: as tall as the row's line, so switching between the map's views doesn't change its height. */
const ROW_RING = 22;

/*
 * A capability's line on a card in a domain: its name, any contradiction, the
 * exposure from its gaps, and its level in that domain. `data` is what the map's
 * risk lens colors its row or card by: that risk's band, as View's lens styles read it.
 * Clicking it opens it in the peek.
 */
function line(state: DocqetState, c: Capability, domain: string) {
  const here = c.levels.find((l) => l.domain === domain)?.level ?? c.stability;
  const contradictions = contradictionsOf(state, "capability", c.id).map((p) => p.message);
  const { risk, exposure } = c;
  return {
    name: c.name,
    level: here,
    hint: (
      <>
        <ContradictionHint messages={contradictions} />
        <span className="lens-risk">
          <RiskScore risk={risk} exposure={exposure} of={c.name} size={ROW_RING} inButton />
        </span>
      </>
    ),
    data: {
      "data-risk-band": risk.items.length ? exposure.band?.id : undefined,
    },
  };
}

/*
 * A click on a card opens what it is in the peek: the capability whose row
 * it's on, or else the card's own. Not a click on its grip or a button in it,
 * nor one in a popover it opened.
 */
const opener = (onOpen: (pick: Pick) => void, pick: Pick) => (e: MouseEvent<HTMLElement>) => {
  const target = e.target as HTMLElement;
  if (!e.currentTarget.contains(target) || target.closest(".grip, button, a, [data-no-pan]")) return;
  const row = target.closest<HTMLElement>("li[data-capability]")?.dataset.capability;
  onOpen(row ? { kind: "capability", id: row } : pick);
};

/*
 * The map's cards, in their domains: each domain's part of each feature it
 * has a part in, holding the capabilities that domain builds, at their levels
 * there, and each capability in no feature on a card of its own. A feature
 * that spans domains has a card in each, saying where else it is. The cards
 * keep to what shows how things relate: names, levels and maturity, and each feature ends with the
 * concepts its capabilities use there, which open in the peek; its improvements
 * and the rules are on each one's page. With several projects showing, each card says which define it,
 * and one that projects contradict each other on has a warning. Above the
 * domains, each persona has a small card of their own, in no region. With
 * `cards`, only those are on the map, as a filter leaves them. Clicking a
 * card, or a capability's row on one, calls `onOpen` with it.
 */
export function mapItems(state: DocqetState, onOpen: (pick: Pick) => void, cards?: Set<string>): CanvasItem[] {
  const header = (doc: Doc, type: string, domain: string) => {
    /* A capability's own card says so on its line instead. */
    const findings = type === "capability" ? [] : contradictionsOf(state, type, doc.id).map((p) => p.message);
    const elsewhere = type === "feature" ? (find(state.features, doc.id)?.parts ?? []).filter((p) => p.domain !== domain) : [];
    /* Its projects, said only where they aren't just those of its domain, which its region names. */
    const projects = [...new Set(doc.from.filter((f) => f.domain === domain).map((f) => f.project))];
    const domainProjects = new Set(find(state.domains, domain)?.from.map((f) => f.project));
    const ownProjects = state.projects.length > 1 && !(projects.length === domainProjects.size && projects.every((id) => domainProjects.has(id)));
    if (!ownProjects && !findings.length && !elsewhere.length) return null;
    return (
      <Box component="span" sx={{ display: "flex", alignItems: "center", gap: "5px", m: "0 0 6px 2px", color: "text.disabled", fontSize: 12, fontWeight: 500 }}>
        {ownProjects ? (
          <>
            <ProjectIcon size={13} />
            {projects.map((id) => projectName(state, id)).join(" + ")}
          </>
        ) : null}
        {elsewhere.length ? (
          <Tooltip title="This feature spans domains: each has its part">
            <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: "3px", cursor: "help" }}>
              <DomainIcon size={13} />
              Also in {elsewhere.map((p) => domainName(state, p.domain)).join(", ")}
            </Box>
          </Tooltip>
        ) : null}
        <ContradictionHint messages={findings} />
      </Box>
    );
  };
  const items: CanvasItem[] = state.domains.flatMap((domain) => [
    ...domain.capabilities.flatMap((id) => {
      const c = find(state.capabilities, id);
      if (!c) return [];
      const { data, ...row } = line(state, c, domain.id);
      return [
        {
          id: capabilityCard(c.id, domain.id),
          node: (
            <Box className="slot" sx={slotSx} data-capability={c.id} {...data} onClick={opener(onOpen, { kind: "capability", id: c.id })}>
              {header(c, "capability", domain.id)}
              <CapabilityCard grip {...row} />
            </Box>
          ),
        },
      ];
    }),
    ...domain.features.flatMap((id) => {
      const feature = find(state.features, id);
      const part = partOf(feature, domain.id);
      if (!feature || !part) return [];
      const concepts = conceptsOf(state, part.capabilities);
      return [
        {
          id: featureCard(feature.id, domain.id),
          node: (
            <Box className="slot" sx={slotSx} data-feature={feature.id} onClick={opener(onOpen, { kind: "feature", id: feature.id })}>
              {header(feature, "feature", domain.id)}
              <FeatureCard
                grip
                name={feature.name}
                maturity={part.maturity}
                hint={<PartMarks state={state} feature={feature} domain={domain.id} />}
                capabilities={part.capabilities.flatMap((cid) => {
                  const c = find(state.capabilities, cid);
                  return c ? [{ id: c.id, ...line(state, c, domain.id) }] : [];
                })}
                footer={
                  concepts.length ? (
                    <Box component="span" sx={{ display: "flex", alignItems: "flex-start", gap: 1, "& > svg": { mt: "3px" } }}>
                      <ConceptIcon size={15} />
                      <ConceptChips concepts={concepts} onOpen={(id) => onOpen({ kind: "concept", id })} />
                    </Box>
                  ) : undefined
                }
              />
            </Box>
          ),
        },
      ];
    }),
  ]);
  for (const p of state.personas) {
    items.push({
      id: personaCard(p.id),
      node: (
        <Box className="slot" sx={[slotSx, { width: PERSONA_SLOT }]} data-persona={p.id} onClick={opener(onOpen, { kind: "persona", id: p.id })}>
          <PersonaCard state={state} persona={p} />
        </Box>
      ),
    });
  }
  return cards ? items.filter((item) => cards.has(item.id)) : items;
}

/*
 * A card's place on the map, `slot` to the page's rules for what's lit. What
 * can be clicked lights up while hovered, the same as while it's open in the
 * peek (focusSx, in View): a card, or a capability's row in one, on its own.
 * A row's grip, buttons and marks keep their own clicks.
 */
const slotSx: SystemStyleObject<Theme> = {
  width: SLOT,
  "& > .MuiCard-root, & li[data-capability]": { transition: "border-color 120ms, box-shadow 120ms, background-color 120ms" },
  "&:hover:not(:has(li[data-capability]:hover, button:hover)) > .MuiCard-root": {
    borderColor: "primary.main",
    boxShadow: (t) => t.vars.palette.lit.ring,
  },
  "& li[data-capability]:hover": { bgcolor: "lit.row", boxShadow: (t) => `inset 3px 0 ${t.vars.palette.primary.main}` },
};

/* A domain's cards on the map: its capabilities in no feature, then its parts of features. */
const cardsIn = (domain: Domain) => [
  ...domain.capabilities.map((id) => capabilityCard(id, domain.id)),
  ...domain.features.map((id) => featureCard(id, domain.id)),
];

/*
 * Each domain as a region behind its cards, labelled on one line with its
 * name, the projects that define it when several are showing, and its
 * maturity, worked out from its parts of features. A domain's region wraps
 * whichever of its cards are on the map, so one with none drawn has none.
 * Clicking it calls `onOpen` with it.
 */
export function mapGroups(state: DocqetState, onOpen: (pick: Pick) => void): CanvasGroup[] {
  return state.domains.map((domain) => {
    const parts = domain.features.flatMap((id) => {
      const f = find(state.features, id);
      const part = partOf(f, domain.id);
      return f && part?.maturity != null ? [{ id: f.id, name: f.name, maturity: part.maturity }] : [];
    });
    return {
      id: domainGroup(domain.id),
      items: cardsIn(domain),
      onOpen: () => onOpen({ kind: "domain", id: domain.id }),
      label: (
        <>
          <Tooltip title="Domain">
            <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
              <DomainIcon size={15} />
              <Box component="span" sx={[ellipsisSx, { flex: "0 1 auto", fontSize: 15, fontWeight: 700, color: "text.primary" }]}>
                {domain.name}
              </Box>
              {state.projects.length > 1 ? (
                /* The projects that define it, when several are showing. */
                <Box component="span" sx={[ellipsisSx, { flex: "0 3 auto", fontSize: 12, color: "text.disabled" }]}>
                  {[...new Set(domain.from.map((f) => f.project))].map((id) => projectName(state, id)).join(" + ")}
                </Box>
              ) : null}
            </Box>
          </Tooltip>
          <Box component="span" sx={{ display: "contents", "& > .lens-risk": areaEndSx }} data-no-pan>
            <AreaMarks risk={domain.readiness.gaps} exposure={domain.exposure} of={domain.name} />
          </Box>
          {domain.maturity !== null ? (
            <Box component="span" className="lens-stability" sx={areaEndSx} data-no-pan>
              <MaturityRing
                progress={domain.maturity}
                subject="domain"
                count={parts.length}
                label={`${domain.name} maturity`}
                size={24}
                spread={domain.features.map((id) => partOf(find(state.features, id), domain.id)?.band ?? null)}
              />
            </Box>
          ) : null}
        </>
      ),
    };
  });
}

const ellipsisSx: SystemStyleObject<Theme> = { minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };

/* At the right of the domain's line, as what the map shows sits at the right of every card and row: only the lens's own shows, so only it takes the room. */
const areaEndSx: SystemStyleObject<Theme> = { flex: "none", ml: "auto", cursor: "default" };

/*
 * What the map shows about a feature's or domain's capabilities beyond
 * maturity, each only in its view: their exposure, from every gap on
 * them, their own and those of what they're built on, each scored on them,
 * as the server works it out. Nothing when there are no gaps or none of
 * them is started, since drafts aren't exposed to anything.
 */
function AreaMarks({ risk, exposure, of }: { risk: RiskAcross<Gap> | undefined; exposure: Exposure | undefined; of: string }) {
  if (!risk?.items.length || !exposure || exposure.percent === null || !exposure.band) return null;
  return (
    <span className="lens-risk">
      <RiskScore risk={risk} exposure={exposure} of={of} size={24} inButton />
    </span>
  );
}

/*
 * A feature's part in a domain's marks: the feature's own figures when that
 * part is all of it, or else the server's for the feature's capabilities in
 * that domain.
 */
function PartMarks({ state, feature, domain }: { state: DocqetState; feature: Feature; domain: string }) {
  const whole = feature.parts.length < 2;
  const read = useStatusFor(state, whole ? null : `feature:${feature.id},domain:${domain}`);
  if (whole) return <AreaMarks risk={feature.readiness.gaps} exposure={feature.exposure} of={feature.name} />;
  if (!read.data) return <ReadFallback read={read} what="its risk here" inline skeleton={<Skeleton variant="circular" width={24} height={24} />} />;
  return <AreaMarks risk={read.data.risk} exposure={read.data.exposure} of={feature.name} />;
}

/* How many card columns tidy puts side by side across domains, and the room between domains. */
const ACROSS = 4;
const DOMAIN_GAP = 36;

/* Masonry: each card into whichever of `columns` is shortest so far. Returns how tall it came out. */
function pack(ids: string[], columns: number, x: number, y: number, height: (id: string) => number, positions: Record<string, Pos>) {
  const tops: number[] = Array(columns).fill(y);
  for (const id of ids) {
    const column = tops.indexOf(Math.min(...tops));
    positions[id] = { x: x + column * (SLOT + GAP), y: tops[column] };
    tops[column] += height(id) + GAP;
  }
  return Math.max(...tops) - GAP - y;
}

/*
 * Where each card goes when tidy: the personas first, in a row across the top,
 * then each domain's cards inside its region, the domains side by side and
 * wrapping once a row is ACROSS columns wide. Within a domain, each card goes
 * into whichever column is shortest so far. With `cards`, only those are laid
 * out, so a filtered map packs together.
 */
export function tidyMap(state: DocqetState, sizes: Record<string, Size>, cards?: Set<string>): Record<string, Pos> {
  const height = (id: string) => sizes[id]?.h ?? 0;
  const positions: Record<string, Pos> = {};
  const domains = state.domains.map((d) => cardsIn(d).filter((id) => !cards || cards.has(id))).filter((ids) => ids.length);
  let x = 0;
  let y = 0;
  const people = state.personas.map((p) => personaCard(p.id)).filter((id) => !cards || cards.has(id));
  people.forEach((id, i) => (positions[id] = { x: i * (PERSONA_SLOT + GAP), y: 0 }));
  if (people.length) y = Math.max(...people.map(height)) + DOMAIN_GAP;
  let used = 0;
  let row = 0;
  for (const ids of domains) {
    const across = Math.min(ids.length, 3);
    if (used && used + across > ACROSS) {
      y += row + DOMAIN_GAP;
      x = used = row = 0;
    }
    const inner = pack(ids, across, x + GROUP_PAD, y + GROUP_HEAD, height, positions);
    row = Math.max(row, GROUP_HEAD + inner + GROUP_PAD);
    x += across * (SLOT + GAP) - GAP + GROUP_PAD * 2 + DOMAIN_GAP;
    used += across;
  }
  return positions;
}
