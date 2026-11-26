import { type ReactNode } from "react";
import { InlineMarkdown, Markdown, plainText, type Go } from "./design/markdown/Markdown";
import { LeftItem, LeftList, LeftMark } from "./design/left/LeftMark";
import { GapRiskMark } from "./design/risk/RiskScore";
import { STABILITY } from "./design/stability/stability";
import { docHref, type DocKind } from "./routes";
import {
  affectedBy,
  conceptLinked,
  riskOf,
  subjectOf,
  type Affected,
  type Contribution,
  type Decision,
  type DocketState,
  type HeldDecision,
  type Tradeoff,
} from "./state";

/*
 * What a doc says, as the spec splits it: its frontmatter fields, which have a
 * set meaning and so a set place, here; and its body, free Markdown that's
 * shown apart from them, as more about it (see design/markdown).
 */

export type { Go } from "./design/markdown/Markdown";

/* A text value from frontmatter, as Markdown, with links resolved from the doc it's in. */
export function Text({ from, text, go }: { from: Contribution; text: string; go: Go }) {
  return <Markdown text={text} from={from} go={go} className="markdown-field" />;
}

/*
 * Open decisions, each its question under its topic, then what waits on its
 * answer. A decision has no risk: a question doesn't happen to anyone. Where
 * it affects gaps, the stakes are the riskiest of them: what's waiting on it,
 * not a risk of its own.
 */
export function DecisionList({ from, decisions, go }: { from: Contribution; decisions: Decision[]; go: Go }) {
  return (
    <LeftList>
      {decisions.map((d, i) => (
        <LeftItem key={i} kind="decision">
          {d.topic ? <span className="decision-topic">{d.topic}</span> : null}
          <Text from={from} text={d.question} go={go} />
          <DecisionAffects state={go.state} decision={d} />
        </LeftItem>
      ))}
    </LeftList>
  );
}

/* What waits on a decision's answer, and, where that's gaps, the riskiest of their risks. */
function DecisionAffects({ state, decision }: { state: DocketState; decision: Decision }) {
  const affected = affectedBy(state, decision);
  if (!affected.length) return null;
  const riskiest = affected
    .flatMap((a) => (a.kind === "gap" ? [riskOf(state, a.gap)] : []))
    .filter((r) => r.score !== null)
    .sort((a, b) => b.score! - a.score!)[0];
  return (
    <div className="gap-affects decision-affects">
      <span className="gap-affects-label">Affects</span>
      {affected.map((a, i) => (
        <AffectedItem key={i} item={a} />
      ))}
      {riskiest ? (
        <span className="gap-affect decision-stakes">
          <span className="gap-affects-label">Stakes</span>
          <GapRiskMark risk={riskiest} on={riskiest.on[0] ?? null} />
        </span>
      ) : null}
    </div>
  );
}

/* Where a tradeoff is shown: with what's decided, on the page of what it's on. */
export const tradeoffHref = (t: Tradeoff) => {
  const { type, id } = subjectOf(t);
  return docHref(type as DocKind, id, "decided");
};

/*
 * One thing a gap, tradeoff or decision affects, as a tag and what it is: a
 * expected outcome, with its quality and level; a rule; or a gap or
 * tradeoff, by name, linked.
 */
export function AffectedItem({ item }: { item: Affected }) {
  switch (item.kind) {
    case "outcome":
      return (
        <span className="gap-affect">
          <span className="explore-tag">
            {item.quality.name} · {STABILITY[item.outcome.level].name}
          </span>
          {item.outcome.text}
        </span>
      );
    case "rule":
      return (
        <span className="gap-affect">
          <span className="explore-tag">Rule</span>
          <a className="link" href={docHref("rule", item.rule.id)}>
            {item.rule.name}
          </a>
        </span>
      );
    case "gap":
      return (
        <span className="gap-affect">
          <span className="explore-tag">Gap</span>
          <a className="link" href={docHref("gap", item.gap.id)}>
            {plainText(item.gap.name)}
          </a>
        </span>
      );
    case "tradeoff":
      return (
        <span className="gap-affect">
          <span className="explore-tag">Tradeoff</span>
          <a className="link" href={tradeoffHref(item.tradeoff)}>
            {plainText(item.tradeoff.name)}
          </a>
        </span>
      );
  }
}

/* Open decisions, as what a gap waits on or what reopened a tradeoff, one to a line. */
export function HeldDecisions({ held }: { held: HeldDecision[] }) {
  return (
    <ul className="held-decisions">
      {held.map((h, i) => (
        <li key={i}>
          <HeldDecisionLine held={h} />
        </li>
      ))}
    </ul>
  );
}

/* An open decision, as what a gap waits on or what reopened a tradeoff: its question, and the doc it's held on, linked. */
export function HeldDecisionLine({ held }: { held: HeldDecision }) {
  return (
    <span className="held-decision">
      <LeftMark kind="decision" size={14} decorative />
      <span className="held-decision-question">
        <InlineMarkdown text={held.decision.question} />
      </span>
      <span className="held-decision-on">
        on <a href={docHref(held.on.kind, held.on.doc.id, "left")}>{held.on.doc.name}</a>
      </span>
    </span>
  );
}

/* A labelled field: what it is, then what it says. `wide` takes a whole row where fields sit side by side. */
export type Facet = { label: string; node: ReactNode; wide?: boolean };

/*
 * The fields a contribution has, by its type, labelled, in the spec's order:
 * part of what it is, so they show with its name and description, never with its
 * body. Open decisions aren't among them: they're shown with what's left.
 */
export function facets(kind: string, f: Contribution, go: Go): Facet[] {
  const out: Facet[] = [];
  const text = (label: string, value: string | null | undefined, wide = false) => {
    if (value?.trim()) out.push({ label, node: <Text from={f} text={value} go={go} />, wide });
  };
  if (kind === "rule") {
    text("Why", f.why);
  } else if (kind === "concept") {
    if (f.confusedWith?.length)
      out.push({
        label: "Not to be confused with",
        wide: true,
        node: (
          <ul className="confused-list">
            {f.confusedWith.map((c, i) => {
              const to = c.concept ? conceptLinked(go.state, c.concept, f.domain) : undefined;
              return (
                <li key={i}>
                  {to ? (
                    <button type="button" className="link confused-name" onClick={() => go.onConcept(to.id)}>
                      {to.name}
                    </button>
                  ) : (
                    <strong className="confused-name">{c.term ?? c.concept}</strong>
                  )}
                  <Text from={f} text={c.summary} go={go} />
                </li>
              );
            })}
          </ul>
        ),
      });
  }
  return out;
}

/* Fields as cards side by side, or, with `stacked`, one under another, as in the side panel. */
export function Facets({ items, stacked = false }: { items: Facet[]; stacked?: boolean }) {
  if (!items.length) return null;
  return (
    <div className={stacked ? "facets facets-stacked" : "facets"}>
      {items.map((item) => (
        <div key={item.label} className="facet" data-wide={item.wide || undefined}>
          <span className="page-label">{item.label}</span>
          {item.node}
        </div>
      ))}
    </div>
  );
}
