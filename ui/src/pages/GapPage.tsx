import { Fragment, useState } from "react";
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
import { HeldDecisions } from "../Fields";
import {
  appliesAt,
  find,
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
import { InitiativeTags, initiativesOf } from "../Initiatives";

/*
 * One gap's page. Its name comes first, as the heading, with what it's in
 * above it and what it says in full under it. Then its risk profile, its own
 * section: its risk, how it's worked out, which claims it breaks, and its
 * score on each capability it's on. Then only the links it has: the rules and
 * expected outcomes it falls short of, the open decisions it waits on, and
 * where the code marks it.
 */
export default function GapPage({ state, id }: { state: DocketState; id: string; route: Route }) {
  const gap = state.gaps.find((g) => g.id === id);
  if (!gap) return <Missing kind="gap" id={id} />;
  return <GapView state={state} gap={gap} />;
}

/* The rubric reference's place for an outcome's quality, on the glossary. */
const qualityHref = (quality: string) => `${sectionHref("glossary", { tab: "rubric" })}#${quality}`;

function GapView({ state, gap }: { state: DocketState; gap: Gap }) {
  const kind = gapKind(gap);
  const risk = gap.risk;
  const affected = gap.affected;
  const waits = gap.decisions;

  return (
    <View title={plainTitle(gap.name)}>
      <header className="dp-gap-head">
        <div className="dp-gap-kind">
          <LeftLabel kind={kind}>{LEFT_KINDS[kind].one}</LeftLabel>
          <span className="dp-faint">in</span>
          <Subject state={state} gap={gap} />
          <InitiativeTags state={state} ids={initiativesOf(state, risk.on.map((o) => o.capability))} />
        </div>
        <h1 className="dp-gap-title">{gap.name}</h1>
        <Clamped text={gap.description} />
      </header>

      <RiskProfile gap={gap} risk={risk} />

      <dl className="dp-links">
        {affected.map((a) =>
          a.kind === "rule" ? (
            <Fragment key={a.rule.id}>
              <dt>Doesn&rsquo;t hold to</dt>
              <dd>
                <a href={docHref("rule", a.rule.id)}>{a.rule.name}</a>
              </dd>
            </Fragment>
          ) : a.kind === "outcome" ? (
            <Fragment key={a.outcome.id}>
              <dt>Falls short of</dt>
              <dd className="dp-links-many">
                <span>&ldquo;{a.outcome.text}&rdquo;</span>
                <a className="dp-links-sub" href={qualityHref(a.quality.id)}>
                  {a.quality.name} &middot; {STABILITY[a.outcome.level].name}
                </a>
              </dd>
            </Fragment>
          ) : null,
        )}

        {waits.length ? (
          <>
            <dt>Waits on</dt>
            <dd>
              <HeldDecisions held={waits} />
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
 * and what it contributes; which claims it breaks, and why, or why it breaks
 * none; and, on more than one capability, its score on each, highest first.
 */
function RiskProfile({ gap, risk }: { gap: Gap; risk: Risk }) {
  const top = risk.on[0];
  const claims = claimsOf(gap, risk);
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
        <div className="dp-risk-claims">
          {claims.map((c, i) => (
            <p key={i} className="dp-risk-claim" data-breaks={c.breaks || undefined}>
              {c.text}
            </p>
          ))}
        </div>
      </div>
      {risk.on.length > 1 ? (
        <div className="dp-risk-on">
          <h3>On each of its {risk.on.length} capabilities</h3>
          <ul>
            {risk.on.map((o) => (
              <li key={o.capability.id}>
                <a href={docHref("capability", o.capability.id)}>{o.capability.name}</a>
                {o.claim ? <span className="dp-risk-breaks">Breaks a claim</span> : null}
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

/*
 * For each rule and expected outcome a gap affects, whether it breaks a
 * claim, and why: a rule, where a capability it's on with a level follows
 * it; an outcome, where a capability it's on is at a level that expects it.
 * Affecting neither, it breaks none.
 */
function claimsOf(gap: Gap, risk: Risk): { breaks: boolean; text: string }[] {
  const started = risk.on.filter((o) => o.weight > 0).map((o) => o.capability);
  const claims = gap.affected.flatMap((a) => {
    if (a.kind === "rule") {
      const by = started.filter((c) => c.rules.includes(a.rule.id));
      return [
        by.length
          ? { breaks: true, text: `It breaks a claim: ${names(by)} ${by.length === 1 ? "follows" : "follow"} “${a.rule.name}”, and it doesn't hold to it yet.` }
          : { breaks: false, text: `It doesn't hold to “${a.rule.name}”, but no capability it's on with a level follows it, so it breaks no claim there.` },
      ];
    }
    if (a.kind === "outcome") {
      const level = STABILITY[a.outcome.level].name;
      const by = started.filter((c) => appliesAt(a.outcome, c.stability));
      return [
        by.length
          ? { breaks: true, text: `It breaks a claim: ${level} expects “${a.outcome.text}”, and ${names(by)} ${by.length === 1 ? "is" : "are"} at a level that does.` }
          : { breaks: false, text: `It falls short of “${a.outcome.text}”, which ${level} expects, but no capability it's on is at a level that does, so it breaks no claim there.` },
      ];
    }
    return [];
  });
  return claims.length ? claims : [{ breaks: false, text: "It affects no rule or expected outcome, so it breaks no claim." }];
}

/* Capabilities by name: "A", "A and B", or, past three, how many. */
const names = (capabilities: { name: string }[]) =>
  capabilities.length > 3
    ? `${capabilities.length} capabilities it's on`
    : capabilities.length > 1
      ? `${capabilities.slice(0, -1).map((c) => c.name).join(", ")} and ${capabilities[capabilities.length - 1].name}`
      : capabilities[0].name;

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
