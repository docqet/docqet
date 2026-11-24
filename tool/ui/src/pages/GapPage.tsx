import { useState } from "react";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import { TECHNICAL_NAMES } from "../Explore";
import { CapabilityStability } from "../design/catalog/CapabilityLabel";
import { LEFT_KINDS, LeftLabel, gapKind } from "../design/left/LeftMark";
import { InlineMarkdown } from "../design/markdown/Markdown";
import { RiskBars, VERDICT_NAMES } from "../design/risk/RiskScore";
import { RiskWorkings } from "../design/risk/RiskWorkings";
import { STABILITY } from "../design/stability/stability";
import { docHref, sectionHref, type Route } from "../routes";
import { View } from "../shell/layout";
import {
  checklistOutcome,
  find,
  riskOf,
  riskScore,
  subjectOf,
  technicalDoc,
  verdictOf,
  type DocketState,
  type Gap,
  type Risk,
} from "../state";
import { EvidenceList, Missing } from "./RulePage";
import "./doc.css";

/*
 * One gap's page. Its name comes first, as the heading, with what it's in
 * above it and what it says in full under it. Then its risk profile, its own
 * section: its risk, how it's worked out, whether it breaks a promise, and
 * its score on each capability it's on. Then only the links it has: the rule
 * or checklist outcome it falls short of, the open decision it waits on, and
 * where the code marks it.
 */
export default function GapPage({ state, id }: { state: DocketState; id: string; route: Route }) {
  const gap = state.gaps.find((g) => g.id === id);
  if (!gap) return <Missing kind="gap" id={id} />;
  return <GapView state={state} gap={gap} />;
}

/* The checklist reference's place for an outcome's quality, on the glossary. */
const qualityHref = (quality: string) => `${sectionHref("glossary", { tab: "checklist" })}#${quality}`;

function GapView({ state, gap }: { state: DocketState; gap: Gap }) {
  const kind = gapKind(gap);
  const risk = riskOf(state, gap);
  const rule = gap.rule ? find(state.rules, gap.rule) : undefined;
  const named = gap.outcome ? checklistOutcome(state.checklist, gap.outcome) : undefined;

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
      </header>

      <RiskProfile state={state} gap={gap} risk={risk} />

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

        <dt>In the code</dt>
        <dd>
          {gap.places.length ? (
            <EvidenceList state={state} places={gap.places} icon={<CodeRoundedIcon sx={{ fontSize: 15 }} />} />
          ) : (
            <span className="dp-faint">Not marked yet</span>
          )}
        </dd>
      </dl>
    </View>
  );
}

/*
 * A gap's risk profile, its own section: its risk and verdict, and what that
 * means; how it's worked out on the capability it scores highest on, each
 * part as its tag, opening what it means, with where it sits in its range
 * and what it contributes; whether it breaks a promise, and why; and, on
 * more than one capability, its score on each, highest first.
 */
function RiskProfile({ state, gap, risk }: { state: DocketState; gap: Gap; risk: Risk }) {
  const top = risk.on[0];
  const rule = gap.rule ? find(state.rules, gap.rule) : undefined;
  const named = gap.outcome ? checklistOutcome(state.checklist, gap.outcome) : undefined;
  const promise = rule
    ? risk.promise
      ? `It breaks a promise: a capability it's on follows “${rule.name}”, and it doesn't hold to it yet.`
      : `It doesn't hold to “${rule.name}”, but no capability it's on with a level follows it, so it breaks no promise.`
    : named
      ? risk.promise
        ? `It breaks a promise: ${STABILITY[named.outcome.level].name} expects “${named.outcome.text}”, and a capability it's on is at that level or above.`
        : `It falls short of “${named.outcome.text}”, which no capability it's on is at ${STABILITY[named.outcome.level].name} yet to expect, so it breaks no promise.`
      : "It names no rule or checklist outcome, so it breaks no promise.";
  return (
    <section className="dp-risk" data-verdict={risk.verdict ?? "none"}>
      <h2 className="dp-risk-title">Risk</h2>
      <div className="dp-risk-card">
        <div className="dp-risk-head">
          {risk.score !== null ? (
            <>
              <span className="dp-risk-score risk-score" data-verdict={risk.verdict!}>
                <RiskBars verdict={risk.verdict} size="small" />
                {riskScore(risk.score)}
                <span className="dp-risk-verdict">{VERDICT_NAMES[risk.verdict!].name}</span>
              </span>
              <span className="dp-risk-means">{VERDICT_NAMES[risk.verdict!].means}</span>
            </>
          ) : (
            <span className="dp-faint">Not rated: with no impact, it has no risk.</span>
          )}
        </div>
        {top ? (
          <div className="dp-risk-workings">
            <RiskWorkings risk={risk} on={top} interactive />
          </div>
        ) : (
          <p className="dp-faint">It isn't on any capability showing.</p>
        )}
        <p className="dp-risk-promise" data-breaks={risk.promise || undefined}>
          {promise}
        </p>
      </div>
      {risk.on.length > 1 ? (
        <div className="dp-risk-on">
          <h3>On each of its {risk.on.length} capabilities</h3>
          <ul>
            {risk.on.map((o) => (
              <li key={o.capability.id}>
                <a href={docHref("capability", o.capability.id)}>{o.capability.name}</a>
                {o.promise ? <span className="dp-risk-breaks">Breaks its promise</span> : null}
                <CapabilityStability level={o.capability.stability} name={o.capability.name} />
                {risk.score !== null ? (
                  <span className="risk-on-score" data-verdict={verdictOf(o.score) ?? "none"}>
                    {riskScore(o.score)}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
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

/* A gap's summary, short enough for the tab's title. */
const plainTitle = (summary: string) => (summary.length > 60 ? `${summary.slice(0, 60).trimEnd()}…` : summary);
