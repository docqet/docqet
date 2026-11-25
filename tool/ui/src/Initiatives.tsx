import { Tip } from "./design/Tip";
import { docHref } from "./routes";
import { InitiativeIcon } from "./ScopeFilter";
import { find, type Capability, type DocketState } from "./state";

/*
 * The initiatives some capabilities are part of, each once, in the order
 * state lists them: what a feature, domain, rule, concept or gap is part of,
 * worked out from its capabilities.
 */
export const initiativesOf = (state: DocketState, capabilities: Capability[]): string[] => {
  const ids = new Set(capabilities.flatMap((c) => c.initiatives));
  return state.initiatives.filter((i) => ids.has(i.id)).map((i) => i.id);
};

/*
 * The initiatives something is part of, as small tags beside its name, each
 * linking to the initiative's page. `plain` leaves out the links, for inside
 * a button or link, and `block` puts them on a line of their own, under a
 * name. Nothing when it's in none.
 */
export function InitiativeTags({ state, ids, plain = false, block = false }: { state: DocketState; ids: string[]; plain?: boolean; block?: boolean }) {
  const initiatives = ids.flatMap((id) => find(state.initiatives, id) ?? []);
  if (!initiatives.length) return null;
  return (
    <span className={block ? "initiative-tags block" : "initiative-tags"} aria-label={`Part of ${initiatives.map((i) => i.name).join(", ")}`}>
      {initiatives.map((i) =>
        plain ? (
          <span key={i.id} className="initiative-tag">
            <InitiativeIcon size={11} />
            {i.name}
          </span>
        ) : (
          <Tip key={i.id} title={i.description}>
            <a className="initiative-tag" href={docHref("initiative", i.id)}>
              <InitiativeIcon size={11} />
              {i.name}
            </a>
          </Tip>
        ),
      )}
    </span>
  );
}
