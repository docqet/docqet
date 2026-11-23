import { useState } from "react";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import { Tip } from "../design/Tip";
import { RiskExposure, TECHNICAL_NAMES, exposureText, plural } from "../Explore";
import { CameFrom, Text } from "../Fields";
import { CapabilityStability } from "../design/catalog/CapabilityLabel";
import { LEFT_KINDS, LeftLabel, gapKind } from "../design/left/LeftMark";
import { InlineMarkdown, plainText } from "../design/markdown/Markdown";
import { IMPACT_NAMES, ImpactBadge, RiskSection } from "../design/risk/ImpactBadge";
import { RiskBars, VERDICT_NAMES } from "../design/risk/RiskScore";
import { STABILITY, STABILITY_LEVEL_IDS } from "../design/stability/stability";
import { docHref, sectionHref, type Route } from "../routes";
import { View } from "../shell/layout";
import {
  checklistOutcome,
  find,
  riskOf,
  riskScore,
  subjectOf,
  technicalDoc,
  type Capability,
  type Contribution,
  type Decision,
  type DecisionHolder,
  type DocketState,
  type Gap,
} from "../state";
import { EvidenceList, Missing, pageGo } from "./RulePage";
import "./doc.css";

/*
 * One gap's page. Its name comes first, as the heading, with what it's in
 * above it and what it says in full under it. Under it, a row of chips: its impact, whether it breaks a
 * promise, when it bites and how much it's on, each with its detail in a
 * popover. Then only the links it has: the rule or checklist outcome it
 * falls short of, what it shows on, the open decision it waits on, and where
 * the code marks it.
 */
export default function GapPage({ state, id }: { state: DocketState; id: string; route: Route }) {
  const gap = state.gaps.find((g) => g.id === id);
  if (!gap) return <Missing kind="gap" id={id} />;
  return <GapView state={state} gap={gap} />;
}

/* The checklist reference's place for an outcome's quality, on the glossary. */
const qualityHref = (quality: string) => `${sectionHref("glossary", { tab: "checklist" })}#${quality}`;

/* Most stable first, drafts last. */
const byLevel = (a: Capability, b: Capability) => rank(b) - rank(a);
const rank = (c: Capability) => (c.stability ? STABILITY_LEVEL_IDS.indexOf(c.stability) : -1);

function GapView({ state, gap }: { state: DocketState; gap: Gap }) {
  const go = pageGo(state);
  const kind = gapKind(gap);
  const risk = riskOf(state, gap);
  const rule = gap.rule ? find(state.rules, gap.rule) : undefined;
  const named = gap.outcome ? checklistOutcome(state.checklist, gap.outcome) : undefined;
  const riding = ridingOn(state, gap);
  const on = risk.on.map((o) => o.capability).sort(byLevel);

  return (
    <View title={plainTitle(gap.name)}>
      <header className="dp-gap-head">
        <div className="dp-gap-kind">
          <LeftLabel kind={kind}>{LEFT_KINDS[kind].one}</LeftLabel>
          <span className="dp-faint">in</span>
          <Subject state={state} gap={gap} />
        </div>
        <h1 className="dp-gap-title">{gap.name}</h1>
        <Clamped text={gap.description} />
        <div className="dp-chips">
          <ImpactBadge impact={gap.impact} eyebrow="What's at stake when it bites">
            {gap.impact ? <RiskSection label="Someone relying on it loses">{IMPACT_NAMES[gap.impact].lost}</RiskSection> : null}
            <RiskExposure risk={risk} />
          </ImpactBadge>
          {risk.score !== null ? (
            <Tip title={`${VERDICT_NAMES[risk.verdict!].means}${exposureText(risk) && risk.on.length > 1 ? ` By capability: ${exposureText(risk)}` : ""}`}>
              <span className="dp-chip risk-score" data-verdict={risk.verdict ?? "none"}>
                <RiskBars verdict={risk.verdict} size="small" />
                Risk {riskScore(risk.score)} &middot; {VERDICT_NAMES[risk.verdict!].name}
              </span>
            </Tip>
          ) : null}
          <Tip
            title={
              rule
                ? `Doesn't hold to “${rule.name}”${risk.promise ? "" : ", which no capability it's on with a level follows"}`
                : named
                  ? `${named.quality.name} at ${STABILITY[named.outcome.level].name}${risk.promise ? ", which its level expects" : ", which no level it's on expects yet"}`
                  : "It names no rule or checklist outcome"
            }
          >
            <span className="dp-chip" data-tone={risk.promise ? "warn" : undefined}>
              {risk.promise ? "Breaks a promise" : "Breaks no promise"}
            </span>
          </Tip>
          <Tip title={gap.when ? plainText(gap.when) : "Nothing says it waits on a condition"}>
            <span className="dp-chip">{gap.when ? "Only sometimes" : "Bites now"}</span>
          </Tip>
          <span className="dp-chip">On {plural(risk.capabilities, "capability", "capabilities")}</span>
        </div>
      </header>

      <dl className="dp-links">
        {rule ? (
          <>
            <dt>Doesn&rsquo;t hold to</dt>
            <dd>
              <a href={docHref("rule", rule.id)}>{rule.name}</a>
            </dd>
          </>
        ) : null}

        {named ? (
          <>
            <dt>Falls short of</dt>
            <dd className="dp-links-many">
              <span>&ldquo;{named.outcome.text}&rdquo;</span>
              <a className="dp-links-sub" href={qualityHref(named.quality.id)}>
                {named.quality.name} &middot; {STABILITY[named.outcome.level].name}
              </a>
            </dd>
          </>
        ) : null}

        {kind === "technical-gap" && on.length ? (
          <>
            <dt>Shows on</dt>
            <dd className="dp-links-many">
              <ShowsOn capabilities={on} />
            </dd>
          </>
        ) : null}

        {riding.length ? (
          <>
            <dt>Waits on</dt>
            <dd className="dp-links-many">
              {riding.map(({ on: holder, from, decision }, i) => (
                <span key={i} className="dp-links-item">
                  <Text from={from} text={decision.question} go={go} />
                  <a className="dp-links-sub" href={docHref(holder.kind, holder.doc.id, "left")}>
                    {holder.doc.name}
                  </a>
                </span>
              ))}
            </dd>
          </>
        ) : null}

        <dt>In the code</dt>
        <dd>
          {gap.places.length ? (
            <EvidenceList state={state} places={gap.places} icon={<CodeRoundedIcon sx={{ fontSize: 15 }} />} />
          ) : (
            <span className="dp-faint">Not marked yet</span>
          )}
        </dd>
      </dl>
      <div className="dp-came-from">
        <CameFrom kind="gap" id={gap.id} go={go} inline />
      </div>
    </View>
  );
}

/* How long a description can be before it's cut to three lines, with a way to read all of it. */
const CLAMP_FROM = 280;

/* What a gap says in full, at reading size: cut to three lines when it's long, with "Read all" to open the rest. */
function Clamped({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > CLAMP_FROM;
  return (
    <div className="dp-gap-description" data-clamped={long && !open ? "" : undefined}>
      <p>
        <InlineMarkdown text={text} />
      </p>
      {long ? (
        <button type="button" className="dp-read-all" onClick={() => setOpen((o) => !o)}>
          {open ? "Show less" : "Read all"}
        </button>
      ) : null}
    </div>
  );
}

/*
 * The capabilities a technical gap shows on, however many: a line for each
 * stability level, most stable first, with its mark, how many, and their
 * names as links that wrap, so dozens take a few lines rather than a column.
 */
function ShowsOn({ capabilities }: { capabilities: Capability[] }) {
  const levels: (Capability["stability"])[] = [...[...STABILITY_LEVEL_IDS].reverse(), null];
  return (
    <div className="dp-shows-on">
      {levels.map((level) => {
        const these = capabilities.filter((c) => c.stability === level);
        if (!these.length) return null;
        return (
          <div key={level ?? "draft"} className="dp-shows-on-level">
            <span className="dp-shows-on-head">
              <CapabilityStability level={level} name={level ? STABILITY[level].name : "Draft"} />
              {level ? STABILITY[level].name : "Draft"}
              <span className="dp-faint">{these.length}</span>
            </span>
            <span className="dp-shows-on-names">
              {these.map((c, i) => (
                <span key={c.id}>
                  <a href={docHref("capability", c.id)}>{c.name}</a>
                  {i < these.length - 1 ? <span className="dp-faint">, </span> : null}
                </span>
              ))}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* What a gap is on, as a link with its kind's icon: a capability, with its stability, or a mechanism or component. */
function Subject({ state, gap }: { state: DocketState; gap: Gap }) {
  const { type, id } = subjectOf(gap);
  if (type === "capability") {
    const capability = find(state.capabilities, id);
    return (
      <span className="dp-gap-subject">
        <a href={docHref("capability", id)}>
          <BoltOutlinedIcon sx={{ fontSize: 15, color: "primary.main" }} />
          {capability?.name ?? id}
        </a>
        {capability ? <CapabilityStability level={capability.stability} name={capability.name} /> : null}
      </span>
    );
  }
  const doc = technicalDoc(state, `${type}:${id}`);
  if (!doc) return <span>{id}</span>;
  return (
    <span className="dp-gap-subject">
      <a href={docHref(doc.kind, doc.id)}>
        {TECHNICAL_NAMES[doc.kind].icon}
        {doc.name}
      </a>
    </span>
  );
}

/* The open decisions whose answer this gap's cost depends on: those that have it riding on them. */
function ridingOn(state: DocketState, gap: Gap): { on: DecisionHolder; from: Contribution; decision: Decision }[] {
  const holders: DecisionHolder[] = [
    ...state.domains.map((doc) => ({ kind: "domain" as const, doc })),
    ...state.features.map((doc) => ({ kind: "feature" as const, doc })),
    ...state.capabilities.map((doc) => ({ kind: "capability" as const, doc })),
    ...state.mechanisms.map((doc) => ({ kind: "mechanism" as const, doc })),
    ...state.components.map((doc) => ({ kind: "component" as const, doc })),
  ];
  return holders.flatMap((on) =>
    on.doc.from.flatMap((from) =>
      (from.decisions ?? []).filter((d) => d.status !== "closed" && d.riding?.includes(gap.id)).map((decision) => ({ on, from, decision })),
    ),
  );
}

/* A gap's summary, short enough for the tab's title. */
const plainTitle = (summary: string) => (summary.length > 60 ? `${summary.slice(0, 60).trimEnd()}…` : summary);
