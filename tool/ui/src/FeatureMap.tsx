import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import { GROUP_HEAD, GROUP_PAD, type CanvasGroup, type CanvasItem, type Pos, type Size } from "./Canvas";
import { CapabilityCard } from "./design/catalog/CapabilityCard";
import { FeatureCard } from "./design/catalog/FeatureCard";
import { MaturityRing } from "./design/maturity/MaturityRing";
import { RingGlyph } from "./design/maturity/RingGlyph";
import { CapabilityDetails, ContradictionHint, RulesHint } from "./CapabilityDetails";
import { ConceptChips, ConceptIcon } from "./Concepts";
import { ProjectIcon } from "./ProjectFilter";
import {
  capabilityCard,
  conceptsOf,
  contradictionsOf,
  domainGroup,
  domainName,
  featureCard,
  find,
  levelId,
  projectName,
  partOf,
  ruleAppliesTo,
  type Capability,
  type Doc,
  type DocketState,
  type Domain,
} from "./state";

/* A domain's mark, wherever one is named. */
export function DomainIcon({ size = 14 }: { size?: number }) {
  return <SpaceDashboardOutlinedIcon sx={{ fontSize: size, flex: "none", color: "text.secondary" }} />;
}

/* A card's width, and the room between cards, as tidy lays them out. */
const SLOT = 320;
const GAP = 28;

/*
 * A capability's line on a card in a domain: its name opens its rules on
 * hover, and says how many it has. Rules belong to a domain, so each also
 * says which other capabilities follow it, with their feature when it isn't
 * this one's. The card's level is the capability's in that domain, and the
 * hover shows every domain's. The concepts it uses come last, each opening in
 * the concepts panel.
 */
function line(state: DocketState, c: Capability, domain: string, openConcept: (id: string) => void) {
  const concepts = c.concepts.flatMap((id) => find(state.concepts, id) ?? []);
  const rules = c.rules.flatMap((id) => {
    const rule = find(state.rules, id);
    if (!rule) return [];
    const also = ruleAppliesTo(state, rule)
      .filter((a) => a.capability.id !== c.id)
      .map((a) =>
        a.capability.feature === c.feature
          ? a.capability.name
          : `${a.capability.name} (${a.feature?.name ?? "not in a feature"})`,
      );
    return [{ ...rule, also }];
  });
  const several = state.projects.length > 1;
  const parts = c.from.map((f, i) => ({
    name: `${domainName(state, f.domain)}${several ? ` · ${projectName(state, f.project)}` : ""}`,
    level: c.levels[i].level,
    summary: f.summary,
  }));
  const here = c.levels.find((l) => l.domain === domain)?.level ?? c.stability;
  const contradictions = contradictionsOf(state, "capability", c.id).map((p) => p.message);
  return {
    name: c.name,
    level: levelId(here),
    details: (
      <CapabilityDetails
        capability={c}
        rules={rules}
        concepts={concepts.length ? <ConceptChips concepts={concepts} onOpen={openConcept} popovers={false} /> : null}
        projects={parts}
        contradictions={contradictions}
      />
    ),
    hint: (
      <>
        <ContradictionHint messages={contradictions} />
        <RulesHint count={rules.length} />
      </>
    ),
  };
}

/*
 * The map's cards, in their domains: each domain's part of each feature it
 * has a part in, holding the capabilities that domain builds, at their levels
 * there, and each capability in no feature on a card of its own. A feature
 * that spans domains has a card in each, saying where else it is. The cards
 * are the design system's, rethemed. Each feature ends with the concepts its
 * capabilities use there, which open in the concepts panel. With several
 * projects showing, each card says which define it, and one that projects
 * contradict each other on says so. With `cards`, only those are on the map,
 * as a concept filter leaves them.
 */
export function mapItems(state: DocketState, openConcept: (id: string) => void, cards?: Set<string>): CanvasItem[] {
  const header = (doc: Doc, type: string, domain: string) => {
    const problems = contradictionsOf(state, type, doc.id).map((p) => p.message);
    const elsewhere = type === "feature" ? (find(state.features, doc.id)?.parts ?? []).filter((p) => p.domain !== domain) : [];
    const projects = doc.from.filter((f) => f.domain === domain).map((f) => f.project);
    if (state.projects.length < 2 && !problems.length && !elsewhere.length) return null;
    return (
      <span className="card-project">
        {state.projects.length > 1 ? (
          <>
            <ProjectIcon size={13} />
            {[...new Set(projects)].map((id) => projectName(state, id)).join(" + ")}
          </>
        ) : null}
        {elsewhere.length ? (
          <span className="card-elsewhere" title="This feature spans domains: each has its part">
            <DomainIcon size={13} />
            Also in {elsewhere.map((p) => domainName(state, p.domain)).join(", ")}
          </span>
        ) : null}
        {problems.length ? (
          <span className="card-contradiction" title={problems.join("\n")}>
            <ContradictionHint messages={problems} />
            {problems.length === 1 ? "Contradiction" : `${problems.length} contradictions`}
          </span>
        ) : null}
      </span>
    );
  };
  const items: CanvasItem[] = state.domains.flatMap((domain) => [
    ...domain.capabilities.flatMap((id) => {
      const c = find(state.capabilities, id);
      return c
        ? [
            {
              id: capabilityCard(c.id, domain.id),
              node: (
                <div className="slot" data-capability={c.id}>
                  {header(c, "capability", domain.id)}
                  <CapabilityCard {...line(state, c, domain.id, openConcept)} />
                </div>
              ),
            },
          ]
        : [];
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
            <div className="slot">
              {header(feature, "feature", domain.id)}
              <FeatureCard
                name={feature.name}
                description={feature.summary}
                maturity={part.maturity}
                capabilities={part.capabilities.flatMap((cid) => {
                  const c = find(state.capabilities, cid);
                  return c ? [{ id: c.id, ...line(state, c, domain.id, openConcept) }] : [];
                })}
                footer={
                  concepts.length ? (
                    <span className="feature-concepts">
                      <ConceptIcon size={15} />
                      <ConceptChips concepts={concepts} onOpen={openConcept} />
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
  return cards ? items.filter((item) => cards.has(item.id)) : items;
}

/* A domain's cards on the map: its capabilities in no feature, then its parts of features. */
const cardsIn = (domain: Domain) => [
  ...domain.capabilities.map((id) => capabilityCard(id, domain.id)),
  ...domain.features.map((id) => featureCard(id, domain.id)),
];

/*
 * Each domain as a region behind its cards, labelled with its name and its
 * maturity, worked out from its parts of features. A domain's region wraps
 * whichever of its cards are on the map, so one with none drawn has none.
 */
export function mapGroups(state: DocketState): CanvasGroup[] {
  return state.domains.map((domain) => {
    const parts = domain.features.flatMap((id) => {
      const f = find(state.features, id);
      const part = partOf(f, domain.id);
      return f && part?.maturity != null ? [{ id: f.id, name: f.name, maturity: part.maturity }] : [];
    });
    return {
      id: domainGroup(domain.id),
      items: cardsIn(domain),
      label: (
        <>
          <span className="area-text">
            <span className="area-eyebrow">
              <DomainIcon />
              Domain
            </span>
            <span className="area-name">{domain.name}</span>
          </span>
          {domain.maturity !== null ? (
            <span className="area-maturity" data-no-pan>
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
 * Where each card goes when tidy: each domain's cards inside its region, the
 * domains side by side and wrapping once a row is ACROSS columns wide. Within
 * a domain, each card goes into whichever column is shortest so far. With
 * `cards`, only those are laid out, so a filtered map packs together.
 */
export function tidyMap(state: DocketState, sizes: Record<string, Size>, cards?: Set<string>): Record<string, Pos> {
  const height = (id: string) => sizes[id]?.h ?? 0;
  const positions: Record<string, Pos> = {};
  const domains = state.domains.map((d) => cardsIn(d).filter((id) => !cards || cards.has(id))).filter((ids) => ids.length);
  let x = 0;
  let y = 0;
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
