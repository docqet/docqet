import type { ReactNode } from "react";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { Maturity, plural } from "../Explore";
import { STABILITY, STABILITY_LEVEL_IDS } from "../design/stability/stability";
import { Term } from "../design/term/Term";
import { docHref, withParam, type Route } from "../routes";
import { Empty, PageHeader, Section, View } from "../shell/layout";
import {
  domainName,
  find,
  gapsById,
  maturityOf,
  openDecisions,
  partOf,
  type Capability,
  type CapabilityLevel,
  riskAcross,
  type DocketState,
  type Domain,
  type Feature,
} from "../state";
import { DocLink, GapsCell, LevelMark, PersonaFaces } from "./indexParts";

type Group = "domain" | "stability";

/*
 * Every domain, feature and capability, and how far along each is. By
 * default a tree: each domain, the features it has a part in, and the
 * capabilities of that part, each with its level in that domain, what's left
 * and who it serves. Grouped by stability level instead, every capability
 * under its level, least stable first. Which grouping is in `&group=`.
 */
export default function FeaturesPage({ state }: { state: DocketState; route: Route }) {
  const group: Group = new URLSearchParams(window.location.search).get("group") === "stability" ? "stability" : "domain";
  const overall = maturityOf(state);
  return (
    <View title="Features" wide>
      <PageHeader
        title="Features"
        lede="What can it do? Every domain, the features it has a part in, and their capabilities, with how far along each is."
        marks={<Maturity value={overall} subject="project" of="nothing showing has a capability in a feature yet" />}
        actions={<GroupToggle group={group} />}
      />
      {!state.capabilities.length && !state.domains.length ? (
        <Empty>No domains, features or capabilities are written down yet.</Empty>
      ) : group === "domain" ? (
        <DomainTree state={state} />
      ) : (
        <ByStability state={state} />
      )}
    </View>
  );
}

/* Group by domain, or by stability level, as two links that change `&group=`. */
function GroupToggle({ group }: { group: Group }) {
  return (
    <div className="ix-toggle" role="group" aria-label="Group by">
      <span className="ix-toggle-label">Group by</span>
      <a href={withParam("group", null)} aria-current={group === "domain" ? "true" : undefined}>
        Domain
      </a>
      <a href={withParam("group", "stability")} aria-current={group === "stability" ? "true" : undefined}>
        Stability level
      </a>
    </div>
  );
}

/* The names of the columns every capability row has, once, at the top. */
function ColumnHeads({ first }: { first: ReactNode }) {
  return (
    <div className="ix-cap ix-cap-head" aria-hidden>
      <span className="ix-cap-name">{first}</span>
      <span className="ix-cap-level">Stability</span>
      <span className="ix-cap-left">What's left</span>
      <span className="ix-cap-who">Serves</span>
    </div>
  );
}

const levelIn = (c: Capability, domain?: string): CapabilityLevel => (domain && c.levels.find((l) => l.domain === domain)?.level) || c.stability;

/*
 * A capability's row: its name, linking to its page, and `where` it is when
 * that isn't plain from where the row sits; its level, in `domain` when
 * that's given; its open decisions and product gaps, with the worst gap's
 * impact; and the personas it serves.
 */
function CapabilityRow({ state, capability, domain, where }: { state: DocketState; capability: Capability; domain?: string; where?: ReactNode }) {
  const personas = capability.personas.flatMap((id) => find(state.personas, id) ?? []);
  return (
    <li className="ix-cap">
      <span className="ix-cap-name">
        <DocLink kind="capability" id={capability.id} name={capability.name} />
        {where ? <span className="ix-where">{where}</span> : null}
      </span>
      <span className="ix-cap-level">
        <LevelMark name={capability.name} level={levelIn(capability, domain)} />
      </span>
      <span className="ix-cap-left">
        <GapsCell gaps={gapsById(state, capability.gaps)} risk={riskAcross(state, gapsById(state, capability.gaps), [capability])} kind="product-gap" decisions={openDecisions(capability).length} of={capability.name} href={docHref("capability", capability.id, "left")} />
      </span>
      <span className="ix-cap-who">
        <PersonaFaces personas={personas} />
      </span>
    </li>
  );
}

/* A row that folds what's under it, open to begin with. */
function FoldRow({ className, head, children }: { className: string; head: ReactNode; children: ReactNode }) {
  return (
    <details className={`ix-fold ${className}`} open>
      <summary>
        <ExpandMoreRoundedIcon className="ix-chev" sx={{ fontSize: 18 }} />
        {head}
      </summary>
      <div className="ix-fold-body">{children}</div>
    </details>
  );
}

/* Each domain, with its parts of features and their capabilities, then any capabilities in no feature. */
function DomainTree({ state }: { state: DocketState }) {
  return (
    <div className="ix-tree">
      <ColumnHeads first="Domain, feature and capability" />
      {state.domains.map((d) => (
        <DomainBranch key={d.id} state={state} domain={d} />
      ))}
    </div>
  );
}

function DomainBranch({ state, domain }: { state: DocketState; domain: Domain }) {
  const features = domain.features.flatMap((id) => find(state.features, id) ?? []);
  const loose = domain.capabilities.flatMap((id) => find(state.capabilities, id) ?? []);
  const capabilities = new Set([...features.flatMap((f) => partOf(f, domain.id)?.capabilities ?? []), ...loose.map((c) => c.id)]).size;
  return (
    <FoldRow
      className="ix-domain"
      head={
        <>
          <DocLink kind="domain" id={domain.id} name={domain.name} />
          <Maturity value={domain.maturity} subject="domain" of="it builds no capability in a feature yet" />
          <span className="ix-meta">
            {plural(features.length, "feature", "features")} · {plural(capabilities, "capability", "capabilities")}
          </span>
        </>
      }
    >
      {!features.length && !loose.length ? <p className="ix-empty">A part of the business the software doesn't serve yet.</p> : null}
      {features.map((f) => (
        <FeatureBranch key={f.id} state={state} feature={f} domain={domain.id} />
      ))}
      {loose.length ? (
        <div className="ix-loose">
          <div className="ix-loose-head">
            In no <Term id="feature">feature</Term>
          </div>
          <ul className="ix-caps">
            {loose.map((c) => (
              <CapabilityRow key={c.id} state={state} capability={c} domain={domain.id} />
            ))}
          </ul>
        </div>
      ) : null}
    </FoldRow>
  );
}

/* A feature's part in one domain: its maturity there, how many capabilities, where else it is, and those capabilities. */
function FeatureBranch({ state, feature, domain }: { state: DocketState; feature: Feature; domain: string }) {
  const part = partOf(feature, domain);
  const capabilities = (part?.capabilities ?? []).flatMap((id) => find(state.capabilities, id) ?? []);
  const elsewhere = feature.parts.filter((p) => p.domain !== domain);
  return (
    <FoldRow
      className="ix-feature"
      head={
        <>
          <DocLink kind="feature" id={feature.id} name={feature.name} />
          <Maturity value={part?.maturity ?? null} of="it has no capabilities here yet" />
          <span className="ix-meta">
            {plural(capabilities.length, "capability", "capabilities")}
            {elsewhere.length ? (
              <>
                {" · Also in "}
                {elsewhere.map((p, i) => (
                  <span key={p.domain}>
                    {i ? ", " : null}
                    <a href={docHref("domain", p.domain)}>{domainName(state, p.domain)}</a>
                  </span>
                ))}
              </>
            ) : null}
          </span>
        </>
      }
    >
      {capabilities.length ? (
        <ul className="ix-caps">
          {capabilities.map((c) => (
            <CapabilityRow key={c.id} state={state} capability={c} domain={domain} />
          ))}
        </ul>
      ) : (
        <p className="ix-empty">No capabilities here yet.</p>
      )}
    </FoldRow>
  );
}

/*
 * Every capability under its level, least stable first: drafts, then
 * Prototype up to GA. A capability built at different levels in different
 * domains is under the lowest. Each says which feature it's in, or which
 * domains when it's in none.
 */
function ByStability({ state }: { state: DocketState }) {
  const levels: CapabilityLevel[] = [null, ...STABILITY_LEVEL_IDS];
  return (
    <>
      {levels.map((level) => {
        const capabilities = state.capabilities.filter((c) => c.stability === level);
        if (!capabilities.length) return null;
        return (
          <Section key={level ?? "draft"} title={level ? STABILITY[level].name : "Draft"} count={capabilities.length}>
            <div className="ix-tree">
              <ColumnHeads first="Capability" />
              <ul className="ix-caps">
                {capabilities.map((c) => (
                  <CapabilityRow key={c.id} state={state} capability={c} where={whereIs(state, c)} />
                ))}
              </ul>
            </div>
          </Section>
        );
      })}
    </>
  );
}

/* Where a capability is: its feature, or else its domains. */
function whereIs(state: DocketState, c: Capability): string {
  const feature = c.feature ? find(state.features, c.feature) : undefined;
  if (feature) return feature.name;
  return [...new Set(c.levels.map((l) => domainName(state, l.domain)))].join(", ");
}
