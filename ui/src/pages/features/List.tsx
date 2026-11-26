import type { ReactNode } from "react";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { Maturity } from "../../components/maturity/Maturity";
import { plural } from "../../components/names";
import { MaturityRing } from "../../components/maturity/MaturityRing";
import { ExposureMark } from "../../components/risk/RiskScore";
import { STABILITY, STABILITY_LEVEL_IDS } from "../../components/stability/stability";
import { Term } from "../../components/term/Term";
import { docHref, withParam, type Route } from "../../routes";
import { Empty, PageHeader, Section, Stat, View } from "../../components/shell/layout";
import {
  domainName,
  levelInDomain,
  find,
  gapsOn,
  openDecisions,
  partOf,
  RISK_BANDS,
  type Capability,
  type CapabilityLevel,
  type DocketState,
  type Domain,
  type Feature,
} from "../../state";
import { DocLink, GapsCell, LevelMark, PersonaFaces, ExposureStat } from "../../components/indexParts";
import { InitiativeTags, initiativesOf } from "../../components/Initiatives";
import { useStatusFor } from "../../model";
import Skeleton from "@mui/material/Skeleton";
import { ReadFallback } from "../../components/ReadFallback";

type Group = "domain" | "stability" | "exposure";
const GROUPS: Group[] = ["domain", "stability", "exposure"];

/*
 * Every domain, feature and capability, and how far along each is. By
 * default a tree: each domain, the features it has a part in, and the
 * capabilities of that part, each with its level in that domain, the risk it
 * is exposed to, what's left and who it serves. Domains and features show
 * their maturity and exposure in the same columns, as rings, as the map does;
 * what either is worked out from is in its popover. Grouped by stability
 * instead, every capability under its level, least stable first; grouped by
 * exposure, under the band of its exposure, most exposed first. Which grouping
 * is in `&group=`. Above it, cards for the maturity and risk of every feature
 * showing, and how many capabilities there are.
 */
export default function FeaturesPage({ state }: { state: DocketState; route: Route }) {
  const asked = new URLSearchParams(window.location.search).get("group") as Group | null;
  const group: Group = asked && GROUPS.includes(asked) ? asked : "domain";
  const overall = state.status.maturity;
  return (
    <View title="Features" wide>
      <PageHeader
        title="Features"
        lede="What can it do? Every domain, the features it has a part in, and their capabilities, with how far along each is."
        stats={
          <>
            <Stat
              label="Maturity"
              term="maturity"
              value={
                <Maturity
                  value={overall}
                  subject="project"
                  count={state.features.length}
                  of="nothing showing has a capability in a feature yet"
                  spread={state.features.map((f) => f.band)}
                />
              }
              note={`Across ${plural(state.features.length, "feature", "features")}`}
            />
            <ExposureStat exposure={state.status.exposure} risk={state.status.risk} of="every capability showing" />
            <Stat
              label="Capabilities"
              term="capability"
              value={state.capabilities.length || "None"}
              note={`${plural(state.features.length, "feature", "features")} · ${plural(state.domains.length, "domain", "domains")}`}
            />
          </>
        }
        actions={<GroupToggle group={group} />}
      />
      {!state.capabilities.length && !state.domains.length ? (
        <Empty>No domains, features or capabilities are written down yet.</Empty>
      ) : group === "domain" ? (
        <DomainTree state={state} />
      ) : group === "stability" ? (
        <ByStability state={state} />
      ) : (
        <ByExposure state={state} />
      )}
    </View>
  );
}

const GROUP_NAMES: Record<Group, string> = { domain: "Domain", stability: "Stability", exposure: "Exposure" };

/* Group by domain, stability or risk, as links that change `&group=`. */
function GroupToggle({ group }: { group: Group }) {
  return (
    <div className="ix-toggle" role="group" aria-label="Group by">
      <span className="ix-toggle-label">Group by</span>
      {GROUPS.map((g) => (
        <a key={g} href={withParam("group", g === "domain" ? null : g)} aria-current={group === g ? "true" : undefined}>
          {GROUP_NAMES[g]}
        </a>
      ))}
    </div>
  );
}

/* The names of the columns every capability row has, once, at the top. */
function ColumnHeads({ first }: { first: ReactNode }) {
  return (
    <div className="ix-cap ix-cap-head">
      <span className="ix-cap-name">{first}</span>
      <span className="ix-cap-level">
        <Term id="stability" />
      </span>
      <span className="ix-cap-risk">
        <Term id="exposure" />
      </span>
      <span className="ix-cap-left">What's left</span>
      <span className="ix-cap-who">Serves</span>
    </div>
  );
}

const levelIn = (c: Capability, domain?: string): CapabilityLevel => (domain && c.levels.find((l) => l.domain === domain)?.level) || c.stability;

/*
 * A capability's row: its name, linking to its page, and `where` it is when
 * that isn't plain from where the row sits; its level, in `domain` when
 * that's given; its exposure; what's left, its open decisions and
 * every gap on it, its own and those of what it's built on; and the personas
 * it serves.
 */
function CapabilityRow({ state, capability, domain, where }: { state: DocketState; capability: Capability; domain?: string; where?: ReactNode }) {
  const personas = capability.personas.flatMap((id) => find(state.personas, id) ?? []);
  return (
    <li className="ix-cap">
      <span className="ix-cap-name">
        <DocLink kind="capability" id={capability.id} name={capability.name} />
        <InitiativeTags state={state} ids={capability.initiatives} />
        {where ? <span className="ix-where">{where}</span> : null}
      </span>
      <span className="ix-cap-level">
        <LevelMark name={capability.name} level={levelIn(capability, domain)} />
      </span>
      <span className="ix-cap-risk">
        <ExposureMark exposure={capability.exposure} risk={capability.risk} of={capability.name} />
      </span>
      <span className="ix-cap-left">
        <GapsCell
          gaps={[...new Set(gapsOn(state, capability))]}
          kind="gap"
          decisions={openDecisions(capability).length}
          href={docHref("capability", capability.id, "left")}
        />
      </span>
      <span className="ix-cap-who">
        <PersonaFaces personas={personas} />
      </span>
    </li>
  );
}

/*
 * A row that folds what's under it, open to begin with: its `head`, then its
 * maturity and exposure under the capability rows' Stability and Exposure
 * columns.
 */
function FoldRow({
  className,
  head,
  maturity,
  exposure,
  children,
}: {
  className: string;
  head: ReactNode;
  maturity: ReactNode;
  exposure: ReactNode;
  children: ReactNode;
}) {
  return (
    <details className={`ix-fold ${className}`} open>
      <summary>
        <ExpandMoreRoundedIcon className="ix-chev" sx={{ fontSize: 18 }} />
        <span className="ix-cap-name">{head}</span>
        <span className="ix-cap-level">{maturity}</span>
        <span className="ix-cap-risk">{exposure}</span>
        <span className="ix-cap-left" />
        <span className="ix-cap-who" />
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
  const parts = features.map((f) => partOf(f, domain.id));
  return (
    <FoldRow
      className="ix-domain"
      maturity={
        domain.maturity === null ? null : (
          <MaturityRing
            progress={domain.maturity}
            subject="domain"
            count={parts.filter((p) => p?.maturity != null).length}
            label={`${domain.name} maturity`}
            size={22}
            spread={parts.map((p) => p?.band ?? null)}
          />
        )
      }
      exposure={<ExposureMark exposure={domain.exposure} risk={domain.readiness.gaps} of={domain.name} />}
      head={<DocLink kind="domain" id={domain.id} name={domain.name} />}
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

/* A feature's part in one domain: its maturity and risk there, where else it is, and those capabilities. */
function FeatureBranch({ state, feature, domain }: { state: DocketState; feature: Feature; domain: string }) {
  const part = partOf(feature, domain);
  const capabilities = (part?.capabilities ?? []).flatMap((id) => find(state.capabilities, id) ?? []);
  const elsewhere = feature.parts.filter((p) => p.domain !== domain);
  const levels = capabilities.map((c) => levelInDomain(c, domain));
  /* Its figures in this domain: the feature's own when it's in no other, or else the server's for its part here. */
  const inPart = useStatusFor(state, elsewhere.length ? `feature:${feature.id},domain:${domain}` : null);
  const figures = elsewhere.length
    ? inPart.data && { exposure: inPart.data.exposure, risk: inPart.data.risk }
    : { exposure: feature.exposure, risk: feature.readiness.gaps };
  return (
    <FoldRow
      className="ix-feature"
      maturity={
        part?.maturity == null ? null : (
          <MaturityRing
            progress={part.maturity}
            subject="feature"
            count={levels.filter(Boolean).length}
            label={`${feature.name} maturity`}
            size={22}
            spread={levels}
          />
        )
      }
      exposure={
        figures ? (
          <ExposureMark exposure={figures.exposure} risk={figures.risk} of={feature.name} />
        ) : (
          <ReadFallback read={inPart} what="its exposure here" inline skeleton={<Skeleton variant="circular" width={22} height={22} />} />
        )
      }
      head={
        <>
          <DocLink kind="feature" id={feature.id} name={feature.name} />
          <InitiativeTags state={state} ids={initiativesOf(state, capabilities)} />
          {elsewhere.length ? (
            <span className="ix-meta">
              {"Also in "}
              {elsewhere.map((p, i) => (
                <span key={p.domain}>
                  {i ? ", " : null}
                  <a href={docHref("domain", p.domain)}>{domainName(state, p.domain)}</a>
                </span>
              ))}
            </span>
          ) : null}
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

/*
 * Every capability under the band of its exposure, most exposed first,
 * and riskiest first within each; then those with no gaps, then drafts,
 * which aren't exposed to anything. Each says where it is, as grouped by stability.
 */
function ByExposure({ state }: { state: DocketState }) {
  const scored = state.capabilities.map((c) => ({ c, exposure: c.exposure, gaps: gapsOn(state, c).length }));
  const groups = [
    ...[...RISK_BANDS].reverse().map((band) => ({
      key: band.id,
      title: band.name,
      rows: scored.filter((s) => s.gaps && s.exposure.band?.id === band.id).sort((a, b) => (b.exposure.percent ?? 0) - (a.exposure.percent ?? 0)),
    })),
    { key: "none", title: "No gaps", rows: scored.filter((s) => !s.gaps && s.c.stability) },
    { key: "draft", title: "Draft", rows: scored.filter((s) => !s.c.stability) },
  ];
  return (
    <>
      {groups.map(({ key, title, rows }) =>
        rows.length ? (
          <Section key={key} title={title} count={rows.length}>
            <div className="ix-tree">
              <ColumnHeads first="Capability" />
              <ul className="ix-caps">
                {rows.map(({ c }) => (
                  <CapabilityRow key={c.id} state={state} capability={c} where={whereIs(state, c)} />
                ))}
              </ul>
            </div>
          </Section>
        ) : null,
      )}
    </>
  );
}

/* Where a capability is: its feature, or else its domains. */
function whereIs(state: DocketState, c: Capability): string {
  const feature = c.feature ? find(state.features, c.feature) : undefined;
  if (feature) return feature.name;
  return [...new Set(c.levels.map((l) => domainName(state, l.domain)))].join(", ");
}
