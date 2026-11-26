import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import { Fragment, type ReactNode } from "react";
import { Excerpt, InlineMarkdown } from "./design/markdown/Markdown";
import { STABILITY } from "./design/stability/stability";
import { sectionHref, docHref } from "./routes";
import { HeldDecisions } from "./Fields";
import { expectedOutcome, decisionsAffecting, find, outcomesAffected, subjectOf, technicalDoc, type DocketState, type Tradeoff } from "./state";
import "./gaprows.css";

/*
 * Tradeoffs, easy to take in however many there are, the way GapRows shows
 * gaps: one line each, what was chosen, in the order given. A tradeoff has no
 * risk, since it's chosen. A line opens in place to show the drawback, the
 * benefit where one is written down and the expected outcomes it falls
 * short of on purpose. One an open decision affects is reopened: it's marked
 * so, and opens to the question. What it's on is named unless that's the
 * page it's shown on (`here`).
 */
export function TradeoffRows({ state, tradeoffs, here }: { state: DocketState; tradeoffs: Tradeoff[]; here?: { id: string } }) {
  return (
    <ul className="gr-list gr-flat">
      {tradeoffs.map((t) => (
        <TradeoffLine key={t.id} state={state} tradeoff={t} here={here} />
      ))}
    </ul>
  );
}

function TradeoffLine({ state, tradeoff: t, here }: { state: DocketState; tradeoff: Tradeoff; here?: { id: string } }) {
  const { type } = subjectOf(t);
  const named = outcomesAffected(t).flatMap((id) => expectedOutcome(state.rubric, id) ?? []);
  const reopened = decisionsAffecting(state, t.id);
  return (
    <li>
      <details className="tr-item">
        <summary className="gr-row tr-row">
          <span className="gr-kind">{type === "feature" ? "Non-goal" : type === "capability" ? "Limit" : "Technical"}</span>
          <span className="gr-summary tr-summary">
            <Excerpt text={t.name} lines={1} />
            {reopened.length ? <span className="tr-reopened">Reopened</span> : null}
          </span>
          <span className="gr-on">{onLink(state, t, here)}</span>
        </summary>
        <div className="tr-detail">
          <div className="tr-chosen">
            <InlineMarkdown text={t.description} />
          </div>
          <dl className="tr-sides">
            <dt data-side="drawback">Drawback</dt>
            <dd>
              <InlineMarkdown text={t.drawback} />
            </dd>
            {t.benefit?.trim() ? (
              <>
                <dt data-side="benefit">Benefit</dt>
                <dd>
                  <InlineMarkdown text={t.benefit} />
                </dd>
              </>
            ) : null}
            {named.map((n) => (
              <Fragment key={n.outcome.id}>
                <dt>Falls short of</dt>
                <dd>
                  &ldquo;{n.outcome.text}&rdquo;{" "}
                  <a href={`${sectionHref("glossary", { tab: "rubric" })}#${n.quality.id}`}>
                    {n.quality.name} &middot; {STABILITY[n.outcome.level].name}
                  </a>
                </dd>
              </Fragment>
            ))}
            {reopened.length ? (
              <>
                <dt data-side="reopened">Reopened by</dt>
                <dd>
                  <HeldDecisions held={reopened} />
                </dd>
              </>
            ) : null}
          </dl>
        </div>
      </details>
    </li>
  );
}

/* What a tradeoff is on, as a link, unless it's the page it's shown on. */
function onLink(state: DocketState, t: Tradeoff, here?: { id: string }): ReactNode {
  const { type, id } = subjectOf(t);
  if (here && id === here.id) return null;
  if (type === "capability") {
    const c = find(state.capabilities, id);
    return c ? (
      <a href={docHref("capability", c.id)}>
        <BoltOutlinedIcon sx={{ fontSize: 13, color: "primary.main" }} />
        {c.name}
      </a>
    ) : null;
  }
  if (type === "feature") {
    const f = find(state.features, id);
    return f ? (
      <a href={docHref("feature", f.id)}>
        <WidgetsOutlinedIcon sx={{ fontSize: 13, color: "secondary.main" }} />
        {f.name}
      </a>
    ) : null;
  }
  const doc = technicalDoc(state, `${type}:${id}`);
  return doc ? <a href={docHref(doc.kind, doc.id)}>{doc.name}</a> : null;
}
