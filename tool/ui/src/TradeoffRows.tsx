import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import type { ReactNode } from "react";
import { CameFrom } from "./Fields";
import { Excerpt, InlineMarkdown, type Go } from "./design/markdown/Markdown";
import { ImpactBadge } from "./design/risk/ImpactBadge";
import { STABILITY } from "./design/stability/stability";
import { sectionHref, docHref } from "./routes";
import { IMPACTS, checklistOutcome, find, inRiskOrder, subjectOf, technicalDoc, type DocketState, type Impact, type Tradeoff } from "./state";
import "./gaprows.css";

/*
 * Tradeoffs, easy to take in however many there are, the way GapRows shows
 * gaps: one line each, what was chosen, grouped by its drawback's impact,
 * worst first, with the worst two open and the milder ones folded. A line
 * opens in place to show the drawback, the benefit where one is written
 * down, the checklist outcome it falls short of on purpose and the decision
 * it came from. What it's on is named unless that's the page it's shown on
 * (`here`). `grouped={false}` lists them as given, each with its impact.
 */
export function TradeoffRows({
  state,
  tradeoffs,
  go,
  here,
  grouped = true,
}: {
  state: DocketState;
  tradeoffs: Tradeoff[];
  go: Go;
  here?: { id: string };
  grouped?: boolean;
}) {
  const ordered = inRiskOrder(state, tradeoffs, (t) => t);
  if (!grouped)
    return (
      <ul className="gr-list gr-flat">
        {ordered.map((t) => (
          <TradeoffLine key={t.id} state={state} tradeoff={t} go={go} here={here} impact />
        ))}
      </ul>
    );
  const levels: (Impact | null)[] = [...IMPACTS, null];
  return (
    <div className="gr-groups">
      {levels.map((impact) => {
        const these = ordered.filter((t) => t.impact === impact);
        if (!these.length) return null;
        return (
          <details key={impact ?? "none"} className="gr-group" open={impact === "damaging" || impact === "blocking"}>
            <summary className="gr-group-head" data-impact={impact ?? "none"}>
              <ImpactBadge impact={impact} eyebrow="The impact of these drawbacks" inButton />
              <span className="gr-group-count">{these.length}</span>
            </summary>
            <ul className="gr-list">
              {these.map((t) => (
                <TradeoffLine key={t.id} state={state} tradeoff={t} go={go} here={here} />
              ))}
            </ul>
          </details>
        );
      })}
    </div>
  );
}

function TradeoffLine({ state, tradeoff: t, go, here, impact = false }: { state: DocketState; tradeoff: Tradeoff; go: Go; here?: { id: string }; impact?: boolean }) {
  const { type } = subjectOf(t);
  const named = t.outcome ? checklistOutcome(state.checklist, t.outcome) : undefined;
  return (
    <li>
      <details className="tr-item">
        <summary className="gr-row tr-row">
          {impact ? <ImpactBadge impact={t.impact} eyebrow="The impact of its drawback" inButton /> : null}
          <span className="gr-kind">{type === "feature" ? "Non-goal" : type === "capability" ? "Limit" : "Technical"}</span>
          <span className="gr-summary">
            <Excerpt text={t.name} lines={1} />
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
              {t.when ? (
                <span className="tr-when">
                  When: <InlineMarkdown text={t.when} />
                </span>
              ) : null}
            </dd>
            {t.benefit?.trim() ? (
              <>
                <dt data-side="benefit">Benefit</dt>
                <dd>
                  <InlineMarkdown text={t.benefit} />
                </dd>
              </>
            ) : null}
            {named ? (
              <>
                <dt>Falls short of</dt>
                <dd>
                  &ldquo;{named.outcome.text}&rdquo;{" "}
                  <a href={`${sectionHref("glossary", { tab: "checklist" })}#${named.quality.id}`}>
                    {named.quality.name} &middot; {STABILITY[named.outcome.level].name}
                  </a>
                </dd>
              </>
            ) : null}
          </dl>
          <CameFrom kind="tradeoff" id={t.id} go={go} inline />
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
