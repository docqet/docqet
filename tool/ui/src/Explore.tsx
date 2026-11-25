import { useState, type ReactNode } from "react";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ExtensionOutlinedIcon from "@mui/icons-material/ExtensionOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import Box from "@mui/material/Box";
import { MATURITY_BANDS, maturityBand } from "./design/maturity/maturity";
import { MaturityRing } from "./design/maturity/MaturityRing";
import type { MaturitySubject } from "./design/maturity/MaturityDetails";
import { STABILITY, levelColor } from "./design/stability/stability";
import { CapabilityStability } from "./design/catalog/CapabilityLabel";
import { GapFilter, GapKindTag, LeftCounts, LeftItem, LeftLabel, LeftList, gapKind, type GapShow, type LeftKind } from "./design/left/LeftMark";
import { RiskSection } from "./design/risk/ImpactBadge";
import { ExposureMark, GapRiskMark, VERDICT_NAMES } from "./design/risk/RiskScore";
import { RiskWorkings } from "./design/risk/RiskWorkings";
import { Term } from "./design/term/Term";
import { InlineMarkdown, MoreAboutFold } from "./design/markdown/Markdown";
import { DecisionList, Facets, facets } from "./Fields";
import { DomainIcon } from "./FeatureMap";
import { PersonaAvatar, PersonaIcon, personaNameAndRole } from "./Personas";
import { ReadinessMark } from "./Readiness";
import { ProjectIcon } from "./ProductFilter";
import {
  
  checklistOutcome,
  openDecisions,
  
  outcomeStanding,
  outcomesOf,
  tradeoffsById,
  contradictionsOf,
  docDomains,
  
  domainName,
  
  
  find,
  inRiskOrder,
  leftCount,
  leftIn,
  riskOf,
  riskAcross,
  riskScore,
  verdictOf,
  pageHref,
  projectName,
  personaCapabilitiesIn,
  readinessOf,
  startedOf,
  
  type Capability,
  type CapabilityLevel,
  type Contribution,
  type TechnicalDoc,
  type TechnicalKind,
  type EvidencePlace,
  type Doc,
  type DocketState,
  type Feature,
  type Gap,
  type Risk,
  type TechnicalGap,
  type Left,
  type Persona,
  type Pick,
  
  type RuleStanding,
  
  type Target,
} from "./state";
import { Tip } from "./design/Tip";
import { InitiativeTags } from "./Initiatives";

/* What the panel can show: the product's parts, each as a list or one of them. */
export type ExploreKind = "domain" | "feature" | "capability" | "persona";

export const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export const NAMES: Record<ExploreKind, { one: string; many: string; icon: ReactNode }> = {
  domain: { one: "Domain", many: "Domains", icon: <DomainIcon size={18} /> },
  feature: { one: "Feature", many: "Features", icon: <WidgetsOutlinedIcon sx={{ fontSize: 18, color: "secondary.main" }} /> },
  capability: { one: "Capability", many: "Capabilities", icon: <BoltOutlinedIcon sx={{ fontSize: 18, color: "primary.main" }} /> },
  persona: { one: "Persona", many: "Personas", icon: <PersonaIcon size={18} /> },
};

type Links = {
  state: DocketState;
  onOpen: (kind: ExploreKind, id: string | null) => void;
  onConcept: (id: string) => void;
  onShow: (target: Target) => void;
  isFiltering: (pick: Pick) => boolean;
  onFilter: (pick: Pick) => void;
};


/*
 * The top of any one doc: its kind, its name, what it's part of, its maturity
 * or level, and `actions`, such as finding it on the map; then any
 * contradictions; then what it is. Where several sources say what it is, such
 * as two projects or two domains defining it, each gets a card of its own,
 * headed by the domain and project it's from, so it's always clear who says
 * what, and several can be compared. With one source, its trail says where
 * it's from instead. Each source shows what it is (its description and fields)
 * first, then its body apart, folded under "More about it".
 */
export function Head({
  state,
  kind,
  doc,
  trail,
  status,
  extra,
  picture,
  name = doc.name,
  role,
  actions,
  onShow,
  onConcept,
  onPick,
}: {
  state: DocketState;
  kind: ExploreKind;
  doc: Doc;
  /* Beside its name: a persona's picture, and under it, their role. */
  picture?: ReactNode;
  name?: string;
  role?: string | null;
  /* What it's part of, outermost first. */
  trail?: ReactNode;
  /* Beside its name, at the right: its level, maturity or readiness. */
  status?: ReactNode;
  /* Under what it's part of: more about its status, such as each domain's level. */
  extra?: ReactNode;
  actions?: ReactNode;
  onShow: (target: Target) => void;
  onConcept: (id: string) => void;
  /* On a detail page: where links in its body to capabilities and features go. */
  onPick?: (pick: Pick) => void;
}) {
  const problems = contradictionsOf(state, kind, doc.id);
  /* Domains and personas aren't written in a domain, so their sources are told apart by project alone. */
  const byProject = kind === "domain" || kind === "persona";
  const several = doc.from.length > 1;
  const project = !several && state.projects.length > 1 ? projectName(state, doc.from[0].project) : null;
  const go = { state, onConcept, onShow, onPick };
  const says = (f: Contribution) => (
    <>
      <Facets items={facets(kind, f, go)} stacked />
      <MoreAboutFold from={f} go={go} />
    </>
  );
  return (
    <>
      <header className="explore-hero">
        <div className="explore-kind">
          {NAMES[kind].icon}
          <Term id={kind}>{NAMES[kind].one}</Term>
        </div>
        <div className="explore-name-row" data-picture={picture ? true : undefined}>
          {picture ? (
            <div className="explore-title">
              {picture}
              <div>
                <h2>{name}</h2>
                {role ? <div className="explore-role">{role}</div> : null}
              </div>
            </div>
          ) : (
            <h2>{doc.name}</h2>
          )}
          {status ? <div className="explore-status">{status}</div> : null}
        </div>
        {trail || project ? (
          <div className="explore-trail">
            {trail}
            {trail && project ? <span className="faint">·</span> : null}
            {project ? (
              <span className="explore-crumb">
                <ProjectIcon size={14} />
                {project}
              </span>
            ) : null}
          </div>
        ) : null}
        {extra}
        {actions ? <div className="explore-actions">{actions}</div> : null}
      </header>
      {problems.map((p) => (
        <p key={p.message} className="explore-problem">
          <WarningAmberRoundedIcon sx={{ fontSize: 17, flex: "none" }} />
          {p.message}
        </p>
      ))}
      <div className="explore-sources">
        {doc.from.map((f, i) => (
          <div key={i} className="explore-source">
            {several ? (
              <div className="explore-source-head">
                {byProject ? null : (
                  <span className="explore-source-from">
                    <span className="explore-source-label"><Term id="domain" /></span>
                    <span className="explore-source-name">
                      <DomainIcon size={14} />
                      {domainName(state, f.domain)}
                    </span>
                  </span>
                )}
                <span className="explore-source-from">
                  <span className="explore-source-label"><Term id="project" /></span>
                  <span className="explore-source-name">
                    <ProjectIcon size={14} />
                    {projectName(state, f.project)}
                  </span>
                </span>
              </div>
            ) : null}
            <div className="explore-source-body">
              {f.description ? <p className="explore-source-summary">{f.description}</p> : null}
              {says(f)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}


/* A section's heading, with how many it holds. */
export function Heading({ children, count }: { children: ReactNode; count?: number }) {
  return (
    <h3 className="explore-heading">
      {children}
      {count !== undefined ? <span className="explore-count">{count}</span> : null}
    </h3>
  );
}

/*
 * A section folded shut until it's opened, for what the side panel keeps
 * at hand without showing: its heading and count say what's inside.
 */

export function Fold({ title, count, children }: { title: ReactNode; count?: number; children: ReactNode }) {
  return (
    <section>
      <details className="explore-fold">
        <summary>
          <Heading count={count}>{title}</Heading>
          <FoldChevron />
        </summary>
        <div className="explore-fold-body">{children}</div>
      </details>
    </section>
  );
}

function FoldChevron() {
  return <ExpandMoreRoundedIcon className="explore-fold-chevron" sx={{ fontSize: 18 }} />;
}

/*
 * Maturity in short, beside a name: its ring, with the percentage, and its
 * band; or why there's none. What it's worked out from, `spread`, is in the
 * ring's popover, never beside it.
 */
export function Maturity({
  value,
  of,
  subject = "feature",
  count,
  spread,
}: {
  value: number | null;
  of: string;
  subject?: MaturitySubject;
  count?: number;
  /* What it's worked out from, for its ring's popover (see MaturityRing). */
  spread?: CapabilityLevel[];
}) {
  if (value === null)
    return (
      <span className="explore-level">
        <Tip title={`No maturity yet: ${of}`}>
          <span className="faint">No maturity yet</span>
        </Tip>
      </span>
    );
  const band = maturityBand(value);
  return (
    <Box component="span" className="explore-level" sx={levelColor(band)}>
      <MaturityRing progress={value} subject={subject} count={count} size={22} spread={spread} />
      <strong>{MATURITY_BANDS[band]}</strong>
    </Box>
  );
}


/* A capability's level by name: "GA", or "Draft" for one declared and not started. */
export const levelName = (level: CapabilityLevel) => (level ? STABILITY[level].name : "Draft");




/* Capabilities as rows, each opening in the panel, at their level in `domain` when it's given. */
export function CapabilityRows({
  capabilities,
  domain,
  onOpen,
}: {
  capabilities: Capability[];
  domain?: string;
  onOpen: Links["onOpen"];
}) {
  return (
    <ul>
      {capabilities.map((c) => {
        const level = (domain && c.levels.find((l) => l.domain === domain)?.level) || c.stability;
        return (
          <li key={c.id}>
            <Row icon={NAMES.capability.icon} name={c.name} summary={c.description} onClick={() => onOpen("capability", c.id)}>
              <CapabilityStability level={level} name={c.name} focusable={false} />
            </Row>
          </li>
        );
      })}
    </ul>
  );
}



/* A capability's trail: the domains it's in, then its feature. */
export function CapabilityTrail({ state, capability, onOpen }: { state: DocketState; capability: Capability; onOpen: Links["onOpen"] }) {
  const feature = capability.feature ? find(state.features, capability.feature) : undefined;
  return (
    <>
      <DomainCrumbs state={state} domains={docDomains(capability)} onOpen={onOpen} />
      <span className="faint">›</span>
      {feature ? <Crumb icon={NAMES.feature.icon} name={feature.name} onClick={() => onOpen("feature", feature.id)} /> : "Not in a feature"}
    </>
  );
}


/* How a rule a capability follows stands, in words, wherever its mark shows. */
export const RULE_STANDING_LABELS: Record<RuleStanding, string> = {
  evidence: "Held, with evidence",
  trust: "Held, on trust",
  gap: "Not held yet: a gap says so",
};


const countOf = (n: number, one: string, many: string) => (n ? [plural(n, one, many)] : []);

/* What's left about a capability, as counts, each with its mark. */
export function LeftSummary({ left }: { left: Left }) {
  const counts: [LeftKind, number][] = [
    ["decision", left.decisions.length],
    ["product-gap", left.gaps.length],
    ["technical-gap", left.technical.length],
  ];
  return <LeftCounts counts={counts} />;
}

/* What's left about a capability, in a line: "1 open decision · 2 product gaps". */
export const leftLine = (left: Left) =>
  [
    ...countOf(left.decisions.length, "open decision", "open decisions"),
    ...countOf(left.gaps.length, "product gap", "product gaps"),
    ...countOf(left.technical.length, "technical gap", "technical gaps"),
  ].join(" · ");

/* Mechanisms' and components' names and icons, wherever one is named. */
export const TECHNICAL_NAMES: Record<TechnicalKind, { one: string; many: string; icon: ReactNode }> = {
  mechanism: { one: "Mechanism", many: "Mechanisms", icon: <HubOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} /> },
  component: { one: "Component", many: "Components", icon: <ExtensionOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} /> },
};

/* A link to a mechanism's or component's page: in this tab on a detail page, or a new one from the side panel. */
export function TechnicalLink({ doc, newTab = false, children }: { doc: TechnicalDoc; newTab?: boolean; children?: ReactNode }) {
  return (
    <a className="link explore-crumb" href={pageHref({ kind: doc.kind, id: doc.id })} {...(newTab ? { target: "_blank", rel: "noopener" } : {})}>
      {children ?? (
        <>
          {TECHNICAL_NAMES[doc.kind].icon}
          {doc.name}
        </>
      )}
    </a>
  );
}

/*
 * Places in the code a gap or tradeoff names, with `docket:gap` or
 * `docket:tradeoff`: each line as written, and its file. In short, how many.
 */
export function Places({ state, places, label, detailed = false }: { state: DocketState; places: EvidencePlace[]; label: string; detailed?: boolean }) {
  if (!places.length) return null;
  if (!detailed) return <span>{plural(places.length, `${label} in 1 place`, `${label} in ${places.length} places`).replace(/^\d+ /, "")}</span>;
  const several = state.projects.length > 1;
  return (
    <ul className="page-places explore-places">
      {places.map((e) => (
        <li key={`${e.project}:${e.file}:${e.line}`}>
          <span className="page-place-icon">
            <CodeRoundedIcon sx={{ fontSize: 14 }} />
          </span>
          <span className="page-place">
            <Tip title={e.text}>
              <code>{e.text}</code>
            </Tip>
            <span className="page-place-where">
              {e.file}:{e.line}
              {several && e.project ? ` · ${projectName(state, e.project)}` : ""}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/*
 * A gap, as an item in a LeftList: something we know falls short and mean to
 * close, with its mark, labelled product or technical. With `detailed`, it says what it affects (the
 * checklist outcome it falls short of, the rule it doesn't hold to yet, the
 * mechanism or component it's in) and where it shows in the code. `on`, for a
 * technical gap, is the mechanism or component it's on.
 */
export function GapItem({
  state,
  gap,
  on,
  subject,
  detailed = false,
  newTab = false,
}: {
  state: DocketState;
  gap: Gap;
  on?: TechnicalDoc;
  /* Above it, what it's on, where that isn't clear from where it's shown. */
  subject?: ReactNode;
  detailed?: boolean;
  newTab?: boolean;
}) {
  const named = detailed && gap.outcome ? checklistOutcome(state.checklist, gap.outcome) : undefined;
  const rule = gap.rule ? find(state.rules, gap.rule) : undefined;
  /* How many capabilities a technical gap shows on, beyond the one it's shown under. */
  const reach = on ? riskOf(state, gap).capabilities : 0;
  const reachText = reach > 1 ? ` · on ${reach} capabilities` : "";
  if (detailed)
    return (
      <LeftItem kind={gapKind(gap)}>
          <div className="gap-head">
            {subject ? <span className="explore-gap-subject">{subject}</span> : null}
            <GapKindTag kind={gapKind(gap)} />
            <GapRisk state={state} gap={gap} />
          </div>
          <div className="left-item-text">
            <InlineMarkdown text={gap.name} />
          </div>
          {named || rule || on ? (
            <div className="gap-affects">
              <span className="gap-affects-label">Affects</span>
              {named ? (
                <span className="gap-affect">
                  <span className="explore-tag">
                    {named.quality.name} · {STABILITY[named.outcome.level].name}
                  </span>
                  {named.outcome.text}
                </span>
              ) : null}
              {rule ? (
                <span className="gap-affect">
                  <span className="explore-tag">Rule</span>
                  {rule.name}
                </span>
              ) : null}
              {on ? (
                <span className="gap-affect">
                  <span className="explore-tag">In</span>
                  <TechnicalLink doc={on} newTab={newTab} />
                  {reachText ? <span className="faint">{reachText.slice(3)}</span> : null}
                </span>
              ) : null}
            </div>
          ) : null}
          <Places state={state} places={gap.places} label="Marked" detailed />
      </LeftItem>
    );
  return (
    <LeftItem kind={gapKind(gap)}>
      <div className="gap-head">
        {subject ? <span className="explore-gap-subject">{subject}</span> : null}
        <GapKindTag kind={gapKind(gap)} />
        <GapRisk state={state} gap={gap} />
      </div>
      <div className="left-item-text">
        <InlineMarkdown text={gap.name} />
      </div>
      <span className="explore-left-meta">
        {on ? (
          <span>
            In <TechnicalLink doc={on} newTab={newTab} />
            {reachText}
          </span>
        ) : null}
        {rule ? <span>Doesn't yet hold to: {rule.name}</span> : null}
        <Places state={state} places={gap.places} label="Marked" />
      </span>
    </LeftItem>
  );
}

/* How a risk's scores spread across the capabilities: "36 on 2 · 12 on 1". */
export const spreadText = (risk: Risk) => risk.spread.map((e) => `${riskScore(e.score)} on ${e.capabilities}`).join(" · ");

/*
 * A gap's risk, for a risk popover: its score and verdict, how
 * it's worked out where it scores highest, each part and what it
 * contributes, then each capability it shows on, highest score first, with
 * its level, whether it breaks that level's promise, and its score there.
 */
export function RiskSpread({ risk }: { risk: Risk }) {
  const n = risk.on.length;
  const rated = risk.score !== null;
  return (
    <RiskSection label={rated ? `Risk ${riskScore(risk.score!)} · ${VERDICT_NAMES[risk.verdict!].name}` : n === 1 ? "On 1 capability" : `On ${n} capabilities`}>
      {n ? <RiskWorkings risk={risk} on={risk.on[0]} /> : null}
      {n > 1 ? <div className="risk-workings-group risk-on-head">On each capability</div> : null}
      {n > 1 || !rated ? (
        <ul className="risk-on">
          {risk.on.map(({ capability: c, promise, score }) => (
            <li key={c.id}>
              <span>
                {c.name}
                {promise ? <span className="risk-on-promise"> &middot; breaks its promise</span> : null}
              </span>
              <span className="risk-on-right">
                <CapabilityStability level={c.stability} name={c.name} focusable={false} />
                {rated ? (
                  <span className="risk-on-score" data-verdict={verdictOf(score) ?? "none"}>
                    {riskScore(score)}
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      ) : n ? null : (
        "None showing."
      )}
    </RiskSection>
  );
}

/* What's at stake in a gap: its risk, its bars and score, opening how it's worked out, so no part of its risk shows alone. */
function GapRisk({ state, gap }: { state: DocketState; gap: Gap }) {
  const risk = riskOf(state, gap);
  return <GapRiskMark risk={risk} on={risk.on[0] ?? null} />;
}

/*
 * One side of a tradeoff: its benefit, marked +, or its drawback, marked −,
 * Both are what came with the choice. A benefit
 * not written down says so, since there's nothing to weigh the drawback
 * against.
 */
function TradeoffSide({ side, text }: { side: "benefits" | "drawbacks"; text: string | null }) {
  const Icon = side === "benefits" ? AddRoundedIcon : RemoveRoundedIcon;
  return (
    <div className={`tradeoff-side tradeoff-${side}`}>
      <span className="tradeoff-side-label">{side === "benefits" ? "Benefit" : "Drawback"}</span>
      {text?.trim() ? (
        <ul className="tradeoff-points">
          <li>
            <span className="tradeoff-point-mark" aria-hidden>
              <Icon sx={{ fontSize: 14 }} />
            </span>
            <span>
              <InlineMarkdown text={text} />
            </span>
          </li>
        </ul>
      ) : (
        <span className="tradeoff-none">Not written down</span>
      )}
    </div>
  );
}

/* The checklist outcome a tradeoff falls short of on purpose, if it names one, as a gap shows what it affects. */
function FallsShortOf({ state, outcome }: { state: DocketState; outcome: string | null }) {
  const named = outcome ? checklistOutcome(state.checklist, outcome) : undefined;
  if (!named) return null;
  return (
    <div className="gap-affects">
      <span className="gap-affects-label">Falls short of</span>
      <span className="gap-affect">
        <span className="explore-tag">
          {named.quality.name} · {STABILITY[named.outcome.level].name}
        </span>
        {named.outcome.text}
      </span>
    </div>
  );
}

/*
 * Tradeoffs: what we chose on purpose, and its benefit and drawback, since
 * they're decided, not open. A feature's are what it's decided not to do. In
 * the side panel, folded, each is what we chose alone; with `detailed`, each
 * is a card, its benefit and drawback side by side, with the code it
 * explains.
 */
export function Tradeoffs({
  state,
  ids,
  title = "Tradeoffs",
  detailed = false,
  bare = false,
}: {
  state: DocketState;
  ids: string[];
  title?: string;
  detailed?: boolean;
  /* Without its own heading, as in a block that has one. */
  bare?: boolean;
}) {
  const list = tradeoffsById(state, ids);
  if (!list.length) return null;
  const items = detailed ? (
    <LeftList detailed>
      {list.map((t) => (
        <LeftItem key={t.id} kind="tradeoff">
          <div className="tradeoff-choice left-item-text">
            <span className="tradeoff-label">
              We chose
            </span>
            <InlineMarkdown text={t.name} />
          </div>
          <div className="tradeoff-sides">
            <TradeoffSide side="benefits" text={t.benefit} />
            <TradeoffSide side="drawbacks" text={t.drawback} />
          </div>
          <FallsShortOf state={state} outcome={t.outcome} />
          <Places state={state} places={t.places} label="Marked" detailed />
        </LeftItem>
      ))}
    </LeftList>
  ) : (
    <LeftList>
      {list.map((t) => (
        <LeftItem key={t.id} kind="tradeoff">
          <div className="left-item-text">
            <InlineMarkdown text={t.name} />
          </div>
        </LeftItem>
      ))}
    </LeftList>
  );
  if (bare) return items;
  const heading = <LeftLabel kind="tradeoff" hoverOnly={!detailed}>{title}</LeftLabel>;
  if (!detailed)
    return (
      <Fold title={heading} count={list.length}>
        {items}
      </Fold>
    );
  return (
    <section className="explore-left">
      <Heading count={list.length}>{heading}</Heading>
      {items}
    </section>
  );
}

/* Mechanisms and components as rows: each one's name, kind, and how many technical gaps it has. */
export function TechnicalRows({ docs, newTab = false }: { state: DocketState; docs: TechnicalDoc[]; newTab?: boolean }) {
  return (
    <ul>
      {docs.map((e) => (
        <li key={`${e.kind}:${e.id}`}>
          <a className="concept-row" href={pageHref({ kind: e.kind, id: e.id })} {...(newTab ? { target: "_blank", rel: "noopener" } : {})}>
            <span style={{ alignSelf: "flex-start", marginTop: 2, display: "inline-flex" }}>{TECHNICAL_NAMES[e.kind].icon}</span>
            <span className="concept-row-text">
              <span className="concept-row-name">{e.name}</span>
              <span className="concept-row-summary">
                <LeftCounts
                  lead={TECHNICAL_NAMES[e.kind].one}
                  counts={[
                    ["decision", openDecisions(e).length],
                    ["technical-gap", e.gaps.length],
                    ["tradeoff", e.tradeoffs.length],
                  ]}
                />
              </span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/*
 * What's still open about a capability, near the top so it's read first:
 * decisions nobody has made, its product gaps, and the technical gaps of what
 * it's built on; then how much of its level's checklist is met, and `checklist`, a way to the
 * whole of it. With `detailed`, as on its detail page, each gap says more.
 */
export function WhatsLeft({
  state,
  capability,
  checklist,
  detailed = false,
  onConcept,
  onShow,
  onPick,
}: {
  state: DocketState;
  capability: Capability;
  checklist?: ReactNode;
  detailed?: boolean;
  onConcept: (id: string) => void;
  onShow: (target: Target) => void;
  onPick?: (pick: Pick) => void;
}) {
  const left = leftIn(state, capability);
  const n = leftCount(left);
  const counts = checklistCounts(state, capability);
  return (
    <section className="explore-left">
      <Heading count={n || undefined}>What's left</Heading>
      {n ? (
        <LeftItems state={state} capability={capability} left={left} detailed={detailed} onConcept={onConcept} onShow={onShow} onPick={onPick} />
      ) : (
        <p className="concepts-empty">Nothing open: no open decisions or gaps are written down.</p>
      )}
      {counts ? (
        <p className="explore-left-checklist">
          <span>
            {counts.count - counts.notMet - counts.byChoice} of {counts.count} {levelName(capability.stability)} checklist outcomes met
            {counts.evidence ? `, ${counts.evidence} with evidence` : ""}
            {counts.byChoice ? `, ${counts.byChoice} not met by choice` : ""}.
          </span>
          {checklist}
        </p>
      ) : capability.stability === null ? (
        <p className="explore-left-checklist">
          <span>A draft: declared, and not started, so it claims nothing on the checklist yet.</span>
        </p>
      ) : null}
    </section>
  );
}

/* A doc's open decisions, from each of its sources, as a list under their label. */
function Decisions({ state, doc, onConcept, onShow, onPick }: { state: DocketState; doc: Doc; onConcept: (id: string) => void; onShow: (target: Target) => void; onPick?: (pick: Pick) => void }) {
  if (!openDecisions(doc).length) return null;
  return (
    <div className="explore-left-group">
      <span className="explore-gap-kind">
        <LeftLabel kind="decision" size={14} />
      </span>
      {doc.from.map((f, i) => {
        const open = f.decisions ?? [];
        return open.length ? <DecisionList key={i} from={f} decisions={open} go={{ state, onConcept, onShow, onPick }} /> : null;
      })}
    </div>
  );
}

/* What's left about a capability: its open decisions and its gaps, product and technical, each under a label. */
function LeftItems({
  state,
  capability,
  left,
  detailed,
  onConcept,
  onShow,
  onPick,
}: {
  state: DocketState;
  capability: Capability;
  left: Left;
  detailed: boolean;
  onConcept: (id: string) => void;
  onShow: (target: Target) => void;
  onPick?: (pick: Pick) => void;
}) {
  return (
    <>
      <Decisions state={state} doc={capability} onConcept={onConcept} onShow={onShow} onPick={onPick} />
      <Gaps state={state} product={left.gaps} technical={left.technical} detailed={detailed} />
    </>
  );
}

/*
 * A capability's gaps, product and technical, in one list, riskiest first,
 * each labelled with its impact and kind. Over it, how many of each kind,
 * which narrow it to one. A
 * technical gap says what it's in, which, from the side panel, opens in a new
 * tab.
 */
function Gaps({ state, product, technical, detailed }: { state: DocketState; product: Gap[]; technical: TechnicalGap[]; detailed: boolean }) {
  const [show, setShow] = useState<GapShow>("all");
  if (!product.length && !technical.length) return null;
  return (
    <div className="explore-left-group">
      <div className="explore-gaps-head">
        <span className="explore-gap-kind">
          <LeftLabel kind="product-gap" size={14}>
            Gaps
          </LeftLabel>
        </span>
        <GapFilter product={product.length} technical={technical.length} show={show} onShow={setShow} />
      </div>
      <LeftList detailed={detailed}>
        {inRiskOrder(state, [...product.map((gap) => ({ gap, on: undefined as TechnicalDoc | undefined })), ...technical], (i) => i.gap)
          .filter(({ on }) => show === "all" || (show === "technical-gap") === !!on)
          .map(({ gap, on }) => (
            <GapItem key={gap.id} state={state} gap={gap} on={on} detailed={detailed} newTab={!!on && !detailed} />
          ))}
      </LeftList>
    </div>
  );
}

/*
 * What's left across several capabilities, such as a feature's: in the side
 * panel, a row for each with anything open, the one whose worst gap is worst
 * first, saying how much and that worst impact, which opens it;
 * with `detailed`, as on a detail page, each one's items in full. `own`, a
 * feature, domain or other doc they're under, adds its own open decisions
 * first. With `technical` false, as for a persona, only what someone using
 * the product would notice.
 */
export function LeftRollup({
  state,
  capabilities,
  own,
  technical = true,
  onOpen,
  detailed = false,
  onConcept = () => {},
  onShow = () => {},
  onPick,
}: {
  state: DocketState;
  capabilities: Capability[];
  own?: Doc;
  technical?: boolean;
  onOpen: Links["onOpen"];
  detailed?: boolean;
  onConcept?: (id: string) => void;
  onShow?: (target: Target) => void;
  onPick?: (pick: Pick) => void;
}) {
  const decisions = own ? openDecisions(own) : [];
  /* Capabilities with anything open, the riskiest first: each gap scored on that capability. */
  const open = capabilities
    .map((c) => ({ capability: c, left: leftIn(state, c, technical) }))
    .filter(({ left }) => leftCount(left))
    .map((o) => ({ ...o, risk: riskAcross(state, [...o.left.gaps, ...o.left.technical.map((t) => t.gap)], [o.capability]) }))
    .sort((a, b) => (b.risk.score ?? -1) - (a.risk.score ?? -1));
  const total = decisions.length + open.reduce((n, { left }) => n + leftCount(left), 0);
  return (
    <section className="explore-left">
      <Heading count={total || undefined}>What's left</Heading>
      {own ? <Decisions state={state} doc={own} onConcept={onConcept} onShow={onShow} onPick={onPick} /> : null}
      {!capabilities.length ? (
        <p className="concepts-empty">It has no capabilities yet.</p>
      ) : !open.length ? (
        <p className="concepts-empty">
          Nothing open across its {plural(capabilities.length, "capability", "capabilities")}: no open decisions or gaps are written down.
        </p>
      ) : detailed ? (
        open.map(({ capability, left }) => (
          <div key={capability.id} className="explore-left-capability">
            <button type="button" className="concept-group-name link-row" onClick={() => onOpen("capability", capability.id)}>
              {NAMES.capability.icon}
              <span className="concept-row-name">{capability.name}</span>
              <CapabilityStability level={capability.stability} name={capability.name} focusable={false} />
            </button>
            <LeftItems state={state} capability={capability} left={left} detailed onConcept={onConcept} onShow={onShow} onPick={onPick} />
          </div>
        ))
      ) : (
        <ul>
          {open.map(({ capability, left }) => (
            <li key={capability.id}>
              <Row
                icon={NAMES.capability.icon}
                name={capability.name}
                summary={
                  <>
                    <ExposureMark state={state} capabilities={[capability]} of={capability.name} inButton />
                    <LeftSummary left={left} />
                  </>
                }
                onClick={() => onOpen("capability", capability.id)}
              >
                <CapabilityStability level={capability.stability} name={capability.name} focusable={false} />
              </Row>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/*
 * How many outcomes a capability's level expects, how many of those a gap
 * says aren't met, how many a tradeoff says aren't met by choice, and how many
 * a mechanism or component it's built on says it meets; or null with no
 * checklist, or for a draft, which claims none. An outcome nothing names counts
 * as met on its level's word.
 */
export function checklistCounts(state: DocketState, capability: Capability) {
  if (!state.checklist || capability.stability === null) return null;
  const standings = state.checklist.qualities
    .flatMap(outcomesOf)
    .map((o) => outcomeStanding(state, capability, o).standing)
    .filter((s) => s !== "not-expected");
  const n = (standing: string) => standings.filter((s) => s === standing).length;
  return { count: standings.length, notMet: n("gap"), byChoice: n("tradeoff"), evidence: n("evidence") };
}



/* A persona's row: their name, with their role under it. */
const rowName = (p: Persona) => {
  const { name, role } = personaNameAndRole(p);
  return { name, summary: role ?? p.description };
};

/* Personas as rows, each opening in the panel, with how ready `feature` is for them when it's given. */
export function PersonaRows({ state, personas, feature, onOpen }: { state: DocketState; personas: Persona[]; feature?: Feature; onOpen: Links["onOpen"] }) {
  return (
    <ul>
      {personas.map((p) => {
        const readiness = feature ? readinessOf(state, personaCapabilitiesIn(state, p, feature)) : null;
        return (
          <li key={p.id}>
            <Row
              icon={<PersonaAvatar persona={p} size={28} />}
              {...rowName(p)}
              tags={<InitiativeTags state={state} ids={p.initiatives} plain />}
              onClick={() => onOpen("persona", p.id)}
            >
              {readiness && feature && startedOf(readiness) ? (
                <ReadinessMark readiness={readiness} of={`${feature.name}'s readiness for ${personaNameAndRole(p).name}`} inButton />
              ) : null}
            </Row>
          </li>
        );
      })}
    </ul>
  );
}

export function Row({
  icon,
  name,
  summary,
  tags,
  onClick,
  children,
}: {
  icon: ReactNode;
  name: string;
  summary?: ReactNode;
  /* What it's part of, such as its initiatives, under its name. */
  tags?: ReactNode;
  onClick: () => void;
  children?: ReactNode;
}) {
  return (
    <button type="button" className="concept-row" onClick={onClick}>
      <span style={{ alignSelf: "flex-start", marginTop: 2, display: "inline-flex" }}>{icon}</span>
      <span className="concept-row-text">
        <span className="concept-row-name">{name}</span>
        {summary ? <span className="concept-row-summary">{summary}</span> : null}
        {tags}
      </span>
      {children}
    </button>
  );
}

function Crumb({ icon, name, onClick }: { icon: ReactNode; name: string; onClick: () => void }) {
  return (
    <button type="button" className="link explore-crumb" onClick={onClick}>
      {icon}
      {name}
    </button>
  );
}

/* The domains something spans, each opening in the panel. */
export function DomainCrumbs({ state, domains, onOpen }: { state: DocketState; domains: string[]; onOpen: Links["onOpen"] }) {
  if (!domains.length) return <>In no domain</>;
  return (
    <>
      {domains.map((id, i) => (
        <span key={id} className="explore-crumb">
          {i ? <span className="faint">+</span> : null}
          <Crumb icon={<DomainIcon />} name={domainName(state, id)} onClick={() => onOpen("domain", id)} />
        </span>
      ))}
    </>
  );
}
