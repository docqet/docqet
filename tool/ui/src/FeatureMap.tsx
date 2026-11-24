import type { MouseEvent } from "react";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import { GROUP_HEAD, GROUP_PAD, type CanvasGroup, type CanvasItem, type Pos, type Size } from "./Canvas";
import { CapabilityCard } from "./design/catalog/CapabilityCard";
import { FeatureCard } from "./design/catalog/FeatureCard";
import { MaturityRing } from "./design/maturity/MaturityRing";
import { RingGlyph } from "./design/maturity/RingGlyph";
import { ContradictionHint, RiskDot } from "./CapabilityHints";
import { EvidenceSpread } from "./design/standing/EvidenceSpread";
import { ConceptChips, ConceptIcon } from "./Concepts";
import { PersonaCard } from "./Personas";
import { ProjectIcon } from "./PlatformFilter";
import { RiskScore } from "./design/risk/RiskScore";
import {
  capabilitiesById,
  capabilityCard,
  conceptsOf,
  contradictionsOf,
  domainCapabilities,
  domainGroup,
  domainName,
  featureCard,
  find,
  gapsOn,
  personaCard,
  projectName,
  partOf,
  ruleStanding,
  riskAcross,
  type Capability,
  type Doc,
  type DocketState,
  type Domain,
  type Pick,
  type RuleStanding,
} from "./state";
import { Tip } from "./design/Tip";

/* A domain's mark, wherever one is named. */
export function DomainIcon({ size = 14 }: { size?: number }) {
  return <SpaceDashboardOutlinedIcon sx={{ fontSize: size, flex: "none", color: "text.secondary" }} />;
}

/* A card's width, and the room between cards, as tidy lays them out. A persona's card is narrower. */
const SLOT = 320;
const PERSONA_SLOT = 240;
const GAP = 28;

/*
 * A capability's line on a card in a domain: its name, any contradiction, its
 * risk, the highest score among its gaps on it, and its level in that domain.
 * How its rules hold sits in it too, shown only while the map is colored by
 * evidence. `data` is what the map's lenses color its row or card by: its
 * risk's verdict and how its rules hold, as map.css reads them.
 * Clicking it opens it in the peek.
 */
function line(state: DocketState, c: Capability, domain: string) {
  const here = c.levels.find((l) => l.domain === domain)?.level ?? c.stability;
  const contradictions = contradictionsOf(state, "capability", c.id).map((p) => p.message);
  const gaps = gapsOn(state, c);
  const risk = riskAcross(state, gaps, [c]);
  const standings = standingsOf(state, [c]);
  return {
    name: c.name,
    level: here,
    hint: (
      <>
        <ContradictionHint messages={contradictions} />
        <span className="lens-risk">
          <RiskDot risk={risk} />
        </span>
        <span className="lens-evidence">
          <EvidenceSpread standings={standings} of={c.name} inButton />
        </span>
      </>
    ),
    data: {
      "data-verdict": gaps.length ? (risk.verdict ?? "none") : undefined,
      "data-evidence": overallStanding(standings) ?? undefined,
    },
  };
}

/*
 * How the rules some capabilities follow hold: each rule's standing on each
 * capability that follows it, for their evidence spread.
 */
function standingsOf(state: DocketState, capabilities: Capability[]): RuleStanding[] {
  return capabilities.flatMap((c) =>
    c.rules.flatMap((id) => {
      const rule = find(state.rules, id);
      return rule ? [ruleStanding(c, rule)] : [];
    }),
  );
}

/* How a capability's rules hold, all together, for tinting its row: not, where a gap says one doesn't; with evidence, where every one has some; or else on trust. Null with no rules. */
function overallStanding(standings: RuleStanding[]): RuleStanding | null {
  if (!standings.length) return null;
  return standings.includes("gap") ? "gap" : standings.every((s) => s === "evidence") ? "evidence" : "trust";
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
 * are the design system's, rethemed, and kept to what shows how things
 * relate: names, levels and maturity, and each feature ends with the
 * concepts its capabilities use there, which open in the peek; what's left
 * and the rules are on each one's page. With several projects showing, each card says which define it,
 * and one that projects contradict each other on has a warning. Above the
 * domains, each persona has a small card of their own, in no region. With
 * `cards`, only those are on the map, as a filter leaves them. Clicking a
 * card, or a capability's row on one, calls `onOpen` with it.
 */
export function mapItems(state: DocketState, onOpen: (pick: Pick) => void, cards?: Set<string>): CanvasItem[] {
  const header = (doc: Doc, type: string, domain: string) => {
    /* A capability's own card says so on its line instead. */
    const problems = type === "capability" ? [] : contradictionsOf(state, type, doc.id).map((p) => p.message);
    const elsewhere = type === "feature" ? (find(state.features, doc.id)?.parts ?? []).filter((p) => p.domain !== domain) : [];
    /* Its projects, said only where they aren't just those of its domain, which its region names. */
    const projects = [...new Set(doc.from.filter((f) => f.domain === domain).map((f) => f.project))];
    const domainProjects = new Set(find(state.domains, domain)?.from.map((f) => f.project));
    const ownProjects = state.projects.length > 1 && !(projects.length === domainProjects.size && projects.every((id) => domainProjects.has(id)));
    if (!ownProjects && !problems.length && !elsewhere.length) return null;
    return (
      <span className="card-project">
        {ownProjects ? (
          <>
            <ProjectIcon size={13} />
            {projects.map((id) => projectName(state, id)).join(" + ")}
          </>
        ) : null}
        {elsewhere.length ? (
          <Tip title="This feature spans domains: each has its part">
            <span className="card-elsewhere">
              <DomainIcon size={13} />
              Also in {elsewhere.map((p) => domainName(state, p.domain)).join(", ")}
            </span>
          </Tip>
        ) : null}
        <ContradictionHint messages={problems} />
      </span>
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
            <div className="slot" data-capability={c.id} {...data} onClick={opener(onOpen, { kind: "capability", id: c.id })}>
              {header(c, "capability", domain.id)}
              <CapabilityCard grip {...row} />
            </div>
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
            <div className="slot" data-feature={feature.id} onClick={opener(onOpen, { kind: "feature", id: feature.id })}>
              {header(feature, "feature", domain.id)}
              <FeatureCard
                grip
                name={feature.name}
                maturity={part.maturity}
                hint={<AreaMarks state={state} capabilities={capabilitiesById(state, part.capabilities)} of={feature.name} />}
                capabilities={part.capabilities.flatMap((cid) => {
                  const c = find(state.capabilities, cid);
                  return c ? [{ id: c.id, ...line(state, c, domain.id) }] : [];
                })}
                footer={
                  concepts.length ? (
                    <span className="feature-concepts">
                      <ConceptIcon size={15} />
                      <ConceptChips concepts={concepts} onOpen={(id) => onOpen({ kind: "concept", id })} />
                    </span>
                  ) : undefined
                }
              />
            </div>
          ),
        },
      ];
    }),
  ]);
  for (const p of state.personas) {
    items.push({
      id: personaCard(p.id),
      node: (
        <div className="slot persona-slot" data-persona={p.id} onClick={opener(onOpen, { kind: "persona", id: p.id })}>
          <PersonaCard state={state} persona={p} />
        </div>
      ),
    });
  }
  return cards ? items.filter((item) => cards.has(item.id)) : items;
}

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
export function mapGroups(state: DocketState, onOpen: (pick: Pick) => void): CanvasGroup[] {
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
          <Tip title="Domain">
            <span className="area-text">
              <DomainIcon size={15} />
              <span className="area-name">{domain.name}</span>
              {state.projects.length > 1 ? (
                <span className="area-projects">
                  {[...new Set(domain.from.map((f) => f.project))].map((id) => projectName(state, id)).join(" + ")}
                </span>
              ) : null}
            </span>
          </Tip>
          <span className="area-marks" data-no-pan>
            <AreaMarks state={state} capabilities={domainCapabilities(state, domain)} of={domain.name} />
          </span>
          {domain.maturity !== null ? (
            <span className="area-maturity lens-stability" data-no-pan>
              <MaturityRing
                progress={domain.maturity}
                subject="domain"
                count={parts.length}
                label={`${domain.name} maturity`}
                size={24}
                breakdown={<PartBreakdown parts={parts} />}
              />
            </span>
          ) : null}
        </>
      ),
    };
  });
}

/*
 * What the map shows about a feature's or domain's capabilities beyond
 * maturity, each only in its view: the risk across them, every gap on them,
 * their own and those of what they're built on, each scored on them, as a
 * spread or one gap's score; and their evidence spread.
 */
function AreaMarks({ state, capabilities, of }: { state: DocketState; capabilities: Capability[]; of: string }) {
  const gaps = [...new Set(capabilities.flatMap((c) => gapsOn(state, c)))];
  return (
    <>
      {gaps.length ? (
        <span className="lens-risk">
          <RiskScore risk={riskAcross(state, gaps, capabilities)} of={of} inButton />
        </span>
      ) : null}
      <span className="lens-evidence">
        <EvidenceSpread standings={standingsOf(state, capabilities)} of={of} inButton />
      </span>
    </>
  );
}

/* A domain's parts of features in its maturity's popover, most mature first. */
function PartBreakdown({ parts }: { parts: { id: string; name: string; maturity: number }[] }) {
  return (
    <ul className="maturity-breakdown">
      {[...parts]
        .sort((a, b) => b.maturity - a.maturity)
        .map((p) => (
          <li key={p.id}>
            <span>{p.name}</span>
            <RingGlyph progress={p.maturity} size={20} />
          </li>
        ))}
    </ul>
  );
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
export function tidyMap(state: DocketState, sizes: Record<string, Size>, cards?: Set<string>): Record<string, Pos> {
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
