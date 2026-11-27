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
  areaGroup,
  capabilityCard,
  conceptsOf,
  contradictionsOf,
  featureCard,
  find,
  personaCard,
  projectName,
  type Area,
  type Capability,
  type Doc,
  type DocqetState,
  type Exposure,
  type Gap,
  type Pick,
  type RiskAcross,
} from "../../../state";
import Tooltip from "@mui/material/Tooltip";
import { AreaIcon } from "../../../components/names";

/* A card's width, and the room between cards, as tidy lays them out. A persona's card is narrower. */
const SLOT = 320;
const PERSONA_SLOT = 280;
const GAP = 28;

/* A row's risk ring: as tall as the row's line, so switching between the map's views doesn't change its height. */
const ROW_RING = 22;

/*
 * A capability's line on a card: its name, any contradiction, the exposure
 * from its gaps, and its level. `data` is what the map's risk lens colors its
 * row or card by: that risk's band, as View's lens styles read it. Clicking
 * it opens it in the peek.
 */
function line(state: DocqetState, c: Capability) {
  const contradictions = contradictionsOf(state, "capability", c.id).map((p) => p.message);
  const { risk, exposure } = c;
  return {
    name: c.name,
    level: c.stability,
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
 * The map's cards, in their areas: each feature, holding its capabilities, by
 * name, and each capability in no feature on a card of its own, in the region
 * of what's in no area. The cards keep to what shows how things relate:
 * names, levels and maturity, and each feature ends with the concepts its
 * capabilities use, which open in the peek; its improvements and the rules
 * are on each one's page. With several projects showing, each card says which
 * define it, and one that projects contradict each other on has a warning.
 * Above the areas, each persona has a small card of their own, in no region.
 * With `cards`, only those are on the map, as a filter leaves them. Clicking
 * a card, or a capability's row on one, calls `onOpen` with it.
 */
export function mapItems(state: DocqetState, onOpen: (pick: Pick) => void, cards?: Set<string>): CanvasItem[] {
  const header = (doc: Doc, type: string) => {
    /* A capability's own card says so on its line instead. */
    const findings = type === "capability" ? [] : contradictionsOf(state, type, doc.id).map((p) => p.message);
    const projects = [...new Set(doc.from.map((f) => f.project))];
    const ownProjects = state.projects.length > 1;
    if (!ownProjects && !findings.length) return null;
    return (
      <Box component="span" sx={{ display: "flex", alignItems: "center", gap: "5px", m: "0 0 6px 2px", color: "text.disabled", fontSize: 12, fontWeight: 500 }}>
        {ownProjects ? (
          <>
            <ProjectIcon size={13} />
            {projects.map((id) => projectName(state, id)).join(" + ")}
          </>
        ) : null}
        <ContradictionHint messages={findings} />
      </Box>
    );
  };
  const items: CanvasItem[] = [
    ...state.capabilities
      .filter((c) => !c.feature || !find(state.features, c.feature))
      .map((c) => {
        const { data, ...row } = line(state, c);
        return {
          id: capabilityCard(c.id),
          node: (
            <Box className="slot" sx={slotSx} data-capability={c.id} {...data} onClick={opener(onOpen, { kind: "capability", id: c.id })}>
              {header(c, "capability")}
              <CapabilityCard grip {...row} />
            </Box>
          ),
        };
      }),
    ...state.features.map((feature) => {
      const concepts = conceptsOf(state, feature.capabilities);
      return {
        id: featureCard(feature.id),
        node: (
          <Box className="slot" sx={slotSx} data-feature={feature.id} onClick={opener(onOpen, { kind: "feature", id: feature.id })}>
            {header(feature, "feature")}
            <FeatureCard
              grip
              name={feature.name}
              maturity={feature.maturity}
              hint={<AreaMarks risk={feature.readiness.gaps} exposure={feature.exposure} of={feature.name} />}
              capabilities={feature.capabilities.flatMap((cid) => {
                const c = find(state.capabilities, cid);
                return c ? [{ id: c.id, ...line(state, c) }] : [];
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
      };
    }),
  ];
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

/* An area's cards on the map: its features'. */
const cardsIn = (area: Area) => area.features.map((id) => featureCard(id));

/* The cards in no area: the features that name none, then the capabilities in no feature. */
function cardsInNoArea(state: DocqetState): string[] {
  return [
    ...state.features.filter((f) => !f.area || !find(state.areas, f.area)).map((f) => featureCard(f.id)),
    ...state.capabilities.filter((c) => !c.feature || !find(state.features, c.feature)).map((c) => capabilityCard(c.id)),
  ];
}

/*
 * Each area as a region behind its features' cards, labelled on one line
 * with its name, the projects that define it when several are showing, and
 * its maturity, worked out from its features. Then, when there's any, a
 * region of what's in no area: features that name none, and capabilities in
 * no feature. A region wraps whichever of its cards are on the map, so one
 * with none drawn has none. Clicking an area's calls `onOpen` with it.
 */
export function mapGroups(state: DocqetState, onOpen: (pick: Pick) => void): CanvasGroup[] {
  const groups: CanvasGroup[] = state.areas.map((area) => {
    const features = area.features.flatMap((id) => find(state.features, id) ?? []);
    return {
      id: areaGroup(area.id),
      items: cardsIn(area),
      onOpen: () => onOpen({ kind: "area", id: area.id }),
      label: (
        <>
          <Tooltip title="Area">
            <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
              <AreaIcon size={15} />
              <Box component="span" sx={[ellipsisSx, { flex: "0 1 auto", fontSize: 15, fontWeight: 700, color: "text.primary" }]}>
                {area.name}
              </Box>
              {state.projects.length > 1 ? (
                /* The projects that define it, when several are showing. */
                <Box component="span" sx={[ellipsisSx, { flex: "0 3 auto", fontSize: 12, color: "text.disabled" }]}>
                  {[...new Set(area.from.map((f) => f.project))].map((id) => projectName(state, id)).join(" + ")}
                </Box>
              ) : null}
            </Box>
          </Tooltip>
          <Box component="span" sx={{ display: "contents", "& > .lens-risk": areaEndSx }} data-no-pan>
            <AreaMarks risk={area.readiness.gaps} exposure={area.exposure} of={area.name} />
          </Box>
          {area.maturity !== null ? (
            <Box component="span" className="lens-stability" sx={areaEndSx} data-no-pan>
              <MaturityRing
                progress={area.maturity}
                subject="area"
                count={features.filter((f) => f.maturity !== null).length}
                label={`${area.name} maturity`}
                size={24}
                spread={features.map((f) => f.band)}
              />
            </Box>
          ) : null}
        </>
      ),
    };
  });
  const loose = cardsInNoArea(state);
  if (loose.length)
    groups.push({
      id: areaGroup(null),
      items: loose,
      label: (
        <Box component="span" sx={[ellipsisSx, { flex: "0 1 auto", fontSize: 15, fontWeight: 700, color: "text.secondary" }]}>
          No area
        </Box>
      ),
    });
  return groups;
}

const ellipsisSx: SystemStyleObject<Theme> = { minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };

/* At the right of the area's line, as what the map shows sits at the right of every card and row: only the lens's own shows, so only it takes the room. */
const areaEndSx: SystemStyleObject<Theme> = { flex: "none", ml: "auto", cursor: "default" };

/*
 * What the map shows about a feature's or area's capabilities beyond
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

/* How many card columns tidy puts side by side across areas, and the room between areas. */
const ACROSS = 4;
const AREA_GAP = 36;

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
 * then each area's cards inside its region, the areas side by side and
 * wrapping once a row is ACROSS columns wide, what's in no area last. Within
 * an area, each card goes
 * into whichever column is shortest so far. With `cards`, only those are laid
 * out, so a filtered map packs together.
 */
export function tidyMap(state: DocqetState, sizes: Record<string, Size>, cards?: Set<string>): Record<string, Pos> {
  const height = (id: string) => sizes[id]?.h ?? 0;
  const positions: Record<string, Pos> = {};
  const regions = [...state.areas.map(cardsIn), cardsInNoArea(state)].map((ids) => ids.filter((id) => !cards || cards.has(id))).filter((ids) => ids.length);
  let x = 0;
  let y = 0;
  const people = state.personas.map((p) => personaCard(p.id)).filter((id) => !cards || cards.has(id));
  people.forEach((id, i) => (positions[id] = { x: i * (PERSONA_SLOT + GAP), y: 0 }));
  if (people.length) y = Math.max(...people.map(height)) + AREA_GAP;
  let used = 0;
  let row = 0;
  for (const ids of regions) {
    const across = Math.min(ids.length, 3);
    if (used && used + across > ACROSS) {
      y += row + AREA_GAP;
      x = used = row = 0;
    }
    const inner = pack(ids, across, x + GROUP_PAD, y + GROUP_HEAD, height, positions);
    row = Math.max(row, GROUP_HEAD + inner + GROUP_PAD);
    x += across * (SLOT + GAP) - GAP + GROUP_PAD * 2 + AREA_GAP;
    used += across;
  }
  return positions;
}
