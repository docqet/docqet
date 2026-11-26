import type { ReactNode } from "react";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import { DomainIcon } from "../names";
import { Excerpt, plainText } from "../markdown/Markdown";
import { LeftMark } from "../left/LeftMark";
import Tooltip from "@mui/material/Tooltip";
import { docHref } from "../../routes";
import { VERDICTS, find, subjectOf, technicalDoc, type DocketState, type Gap, type Risk, type RiskAcross, type TechnicalDoc } from "../../state";
import { GapRiskMark, RiskBars, RiskScore, VERDICT_NAMES } from "./RiskScore";
import "../gaprows.css";
import { InitiativeTags } from "../Initiatives";

export type GapRow = { gap: Gap; on?: TechnicalDoc };

/*
 * Gaps, easy to take in at a glance however many there are: one line each,
 * led by its risk, its bars and score, which opens how it's worked out, so
 * no part of its risk shows alone. Grouped by risk, worst first: the
 * unacceptable and tolerable are open, the acceptable folded, with how many
 * each holds. Each line is what the gap says, cut to one line, which opens
 * the gap's own page, and what it's on, unless that's the page it's shown on
 * (`here`). Product and technical gaps are told apart by a word, quietly.
 *
 * `grouped={false}` lists them as given, for a short list such as the
 * riskiest few. `allOpen` opens every group, as when a filter has already
 * picked the ones wanted.
 */
export function GapRows({
  state,
  rows,
  here,
  grouped = true,
  allOpen = false,
}: {
  state: DocketState;
  rows: GapRow[];
  here?: { id: string };
  grouped?: boolean;
  allOpen?: boolean;
}) {
  const scored = rows.map((r) => ({ ...r, risk: r.gap.risk }));
  if (!grouped)
    return (
      <ul className="gr-list gr-flat">
        {scored.map((r) => (
          <GapLine key={r.gap.id} state={state} row={r} risk={r.risk} here={here} />
        ))}
      </ul>
    );
  return (
    <div className="gr-groups">
      {VERDICTS.map((verdict) => {
        const these = scored.filter((r) => r.risk.verdict === verdict).sort((a, b) => b.risk.score - a.risk.score);
        if (!these.length) return null;
        const open = allOpen || verdict === "unacceptable" || verdict === "tolerable";
        return (
          <details key={verdict} className="gr-group" open={open}>
            <summary className="gr-group-head" data-verdict={verdict}>
              <span className="gr-group-verdict risk-score" data-verdict={verdict}>
                <RiskBars verdict={verdict} size="small" />
                {VERDICT_NAMES[verdict].name}
              </span>
              <span className="gr-group-count">{these.length}</span>
              <span className="gr-group-test">{VERDICT_NAMES[verdict].means}</span>
            </summary>
            <ul className="gr-list">
              {these.map((r) => (
                <GapLine key={r.gap.id} state={state} row={r} risk={r.risk} here={here} />
              ))}
            </ul>
          </details>
        );
      })}
    </div>
  );
}

function GapLine({ state, row, risk, here }: { state: DocketState; row: GapRow; risk: Risk; here?: { id: string } }) {
  const { gap } = row;
  const technical = !gap.domain;
  return (
    <li className="gr-row">
      <GapRiskMark risk={risk} on={risk.on[0] ?? null} />
      <span className="gr-kind">{technical ? "Technical" : "Product"}</span>
      <Tooltip title={plainText(gap.description)}>
        <a className="gr-summary" href={docHref("gap", gap.id)}>
          <Excerpt text={gap.name} lines={1} />
        </a>
      </Tooltip>
      <span className="gr-on">
        {onLink(state, row, here)}
        <GapInitiatives state={state} gap={gap} />
      </span>
    </li>
  );
}

/* The initiatives a product gap's capability is part of. A technical gap shows on too many capabilities to say. */
export function GapInitiatives({ state, gap }: { state: DocketState; gap: Gap }) {
  const { type, id } = subjectOf(gap);
  const capability = type === "capability" ? find(state.capabilities, id) : undefined;
  return capability ? <InitiativeTags state={state} ids={capability.initiatives} block /> : null;
}

/* What a gap is on, as a link, unless it's the page it's shown on. */
function onLink(state: DocketState, { gap, on }: GapRow, here?: { id: string }): ReactNode {
  const { type, id } = subjectOf(gap);
  if (here && id === here.id) return null;
  if (on || type === "mechanism" || type === "component") {
    const doc = on ?? technicalDoc(state, `${type}:${id}`);
    return doc ? <a href={docHref(doc.kind, doc.id)}>{doc.name}</a> : null;
  }
  if (type === "capability") {
    const c = find(state.capabilities, id);
    return c ? (
      <a href={docHref("capability", c.id)}>
        <BoltOutlinedIcon sx={{ fontSize: 13, color: "primary.main" }} />
        {c.name}
      </a>
    ) : null;
  }
  if (type === "domain") {
    const d = find(state.domains, id);
    return d ? (
      <a href={docHref("domain", d.id)}>
        <DomainIcon size={13} />
        {d.name}
      </a>
    ) : null;
  }
  return null;
}

/*
 * What's left, as a tile's figure: the gap mark and how many, the decision
 * mark and how many, the same marks every list uses, and under them the
 * highest risk among the gaps, worked out by whoever passes it. Inside a
 * link, so the risk's popover opens on hover only.
 */
export function LeftFigure({ gaps, decisions, risk, of }: { gaps: Gap[]; decisions: number; risk: RiskAcross<Gap>; of: string }) {
  if (!gaps.length && !decisions) return <span className="lf-figure-none">Nothing open</span>;
  return (
    <span className="lf-figure">
      <span className="lf-figure-counts">
        {gaps.length ? (
          <span>
            <LeftMark kind="product-gap" size={17} decorative />
            {gaps.length}
          </span>
        ) : null}
        {decisions ? (
          <span>
            <LeftMark kind="decision" size={17} decorative />
            {decisions}
          </span>
        ) : null}
      </span>
      {gaps.length ? <RiskScore risk={risk} of={of} verdict inButton /> : null}
    </span>
  );
}
