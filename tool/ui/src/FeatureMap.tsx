import type { CanvasItem, Pos, Size } from "./Canvas";
import { CapabilityCard } from "./design/catalog/CapabilityCard";
import { FeatureCard } from "./design/catalog/FeatureCard";
import { CapabilityDetails, RulesHint } from "./CapabilityDetails";
import { find, levelId, ruleAppliesTo, type Capability, type DocketState } from "./state";

/* A card's width, and the room between cards, as tidy lays them out. */
const SLOT = 320;
const GAP = 28;

const looseOf = (state: DocketState) => state.capabilities.filter((c) => !c.feature);

/*
 * A capability's line on a card: its name opens its rules on hover, and says
 * how many it has. Rules belong to the domain, so each also says which other
 * capabilities follow it, with their feature when it isn't this one's.
 */
function line(state: DocketState, c: Capability) {
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
  return {
    name: c.name,
    level: levelId(c.stability),
    details: <CapabilityDetails capability={c} rules={rules} />,
    hint: <RulesHint count={rules.length} />,
  };
}

/*
 * The map's cards: every feature, holding its capabilities in the order its
 * doc lists them, and each capability in no feature on a card of its own.
 * The cards are the design system's, rethemed.
 */
export function mapItems(state: DocketState): CanvasItem[] {
  return [
    ...looseOf(state).map((c) => ({
      id: `capability:${c.id}`,
      node: (
        <div className="slot">
          <CapabilityCard {...line(state, c)} />
        </div>
      ),
    })),
    ...state.features.map((feature) => ({
      id: `feature:${feature.id}`,
      node: (
        <div className="slot">
          <FeatureCard
            name={feature.name}
            description={feature.summary}
            maturity={feature.maturity}
            capabilities={feature.capabilities.flatMap((id) => {
              const c = find(state.capabilities, id);
              return c ? [{ id: c.id, ...line(state, c) }] : [];
            })}
          />
        </div>
      ),
    })),
  ];
}

/*
 * Where each card goes when tidy, as the old catalog's canvas started:
 * capabilities in no feature in rows along the top, then the features in up
 * to three columns, each into whichever column is shortest so far.
 */
export function tidyMap(state: DocketState, sizes: Record<string, Size>): Record<string, Pos> {
  const columns = Math.min(Math.max(state.features.length, 1), 3);
  const height = (id: string) => sizes[id]?.h ?? 0;
  const positions: Record<string, Pos> = {};
  let y = 0;

  const loose = looseOf(state).map((c) => `capability:${c.id}`);
  if (loose.length) {
    let row = 0;
    loose.forEach((id, i) => {
      const column = i % columns;
      if (column === 0 && i > 0) {
        y += row + 12;
        row = 0;
      }
      positions[id] = { x: column * (SLOT + GAP), y };
      row = Math.max(row, height(id));
    });
    y += row + 48;
  }

  const tops: number[] = Array(columns).fill(y);
  for (const feature of state.features) {
    const id = `feature:${feature.id}`;
    const column = tops.indexOf(Math.min(...tops));
    positions[id] = { x: column * (SLOT + GAP), y: tops[column] };
    tops[column] += height(id) + GAP;
  }
  return positions;
}
