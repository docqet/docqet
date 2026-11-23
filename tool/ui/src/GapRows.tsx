import type { ReactNode } from "react";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import { DomainIcon } from "./FeatureMap";
import { Excerpt, plainText } from "./design/markdown/Markdown";
import { IMPACT_NAMES, ImpactBadge } from "./design/risk/ImpactBadge";
import { LeftMark } from "./design/left/LeftMark";
import { Tip } from "./design/Tip";
import { docHref } from "./routes";
import { IMPACTS, find, subjectOf, technicalDoc, type DocketState, type Gap, type Impact, type RiskAcross, type TechnicalDoc } from "./state";
import { RiskScore } from "./design/risk/RiskScore";
import "./gaprows.css";

export type GapRow = { gap: Gap; on?: TechnicalDoc };

/*
 * Gaps, easy to take in at a glance however many there are: one line each,
 * grouped by impact, worst first. The worst two impacts are open; the
 * milder ones are folded, with how many each holds, so a long list leads
 * with what matters. Each line is what the gap says, cut to one line, which
 * opens the gap's own page where all of it is, and what it's on, unless
 * that's the page it's shown on (`here`). Product and technical gaps are told
 * apart by a word at the start, quietly, rather than a badge.
 *
 * `grouped={false}` lists them as given, each with its impact, for a short
 * list such as the riskiest few. `allOpen` opens every group, as when a
 * filter has already picked the ones wanted.
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
  if (!grouped)
    return (
      <ul className="gr-list gr-flat">
        {rows.map((r) => (
          <GapLine key={r.gap.id} state={state} row={r} here={here} impact />
        ))}
      </ul>
    );
  const levels: (Impact | null)[] = [...IMPACTS, null];
  return (
    <div className="gr-groups">
      {levels.map((impact) => {
        const these = rows.filter((r) => r.gap.impact === impact);
        if (!these.length) return null;
        const open = allOpen || impact === "damaging" || impact === "blocking";
        return (
          <details key={impact ?? "none"} className="gr-group" open={open}>
            <summary className="gr-group-head" data-impact={impact ?? "none"}>
              <ImpactBadge impact={impact} eyebrow="What this impact means" inButton />
              <span className="gr-group-count">{these.length}</span>
              {impact ? <span className="gr-group-test">What&rsquo;s lost: {IMPACT_NAMES[impact].lost}</span> : null}
            </summary>
            <ul className="gr-list">
              {these.map((r) => (
                <GapLine key={r.gap.id} state={state} row={r} here={here} />
              ))}
            </ul>
          </details>
        );
      })}
    </div>
  );
}

function GapLine({ state, row, here, impact = false }: { state: DocketState; row: GapRow; here?: { id: string }; impact?: boolean }) {
  const { gap } = row;
  const technical = !gap.domain;
  return (
    <li className="gr-row">
      {impact ? <ImpactBadge impact={gap.impact} eyebrow="What's at stake in this gap" inButton /> : null}
      <span className="gr-kind">{technical ? "Technical" : "Product"}</span>
      <Tip title={plainText(gap.description)}>
        <a className="gr-summary" href={docHref("gap", gap.id)}>
          <Excerpt text={gap.name} lines={1} />
        </a>
      </Tip>
      <span className="gr-on">{onLink(state, row, here)}</span>
    </li>
  );
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
