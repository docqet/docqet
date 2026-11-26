import type { ReactNode } from "react";
import BalanceRoundedIcon from "@mui/icons-material/BalanceRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import { createSvgIcon } from "@mui/material/utils";
import { Tip } from "../Tip";
import { Term } from "../term/Term";
import type { TermId } from "../term/terms";

/*
 * What's left, and what we chose to live with, look the same wherever they
 * show: on the map, in the side panel, on a detail page and on the
 * rubric. Each kind has one mark, in one color, and one name. A gap is a
 * gap whoever would notice it, so product and technical gaps share a mark
 * and are told apart by name: each gap is labelled with its kind.
 */

/*
 * A gap's mark: an open circle, its edge dotted, for something not yet there.
 * Ten even dashes whatever its size; with round caps, each dash looks about
 * 2.9 units long, with 2.3 between.
 */
export const GapIcon = createSvgIcon(
  <circle cx="12" cy="12" r="8.25" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" pathLength="40" strokeDasharray="0.7 3.3" />,
  "Gap",
);
export type LeftKind = "product-gap" | "technical-gap" | "decision" | "tradeoff";

export const LEFT_KINDS: Record<LeftKind, { one: string; many: string; Icon: typeof GapIcon }> = {
  "product-gap": { one: "Product gap", many: "Product gaps", Icon: GapIcon },
  "technical-gap": { one: "Technical gap", many: "Technical gaps", Icon: GapIcon },
  decision: { one: "Open decision", many: "Open decisions", Icon: HelpOutlineRoundedIcon },
  tradeoff: { one: "Tradeoff", many: "Tradeoffs", Icon: BalanceRoundedIcon },
};

/* A gap's kind: a product gap is in a domain; a technical gap, on a mechanism or component, isn't. */
export const gapKind = (gap: { domain?: string }): LeftKind => (gap.domain ? "product-gap" : "technical-gap");

/* A gap's kind, as a label before what it says: "Product" or "Technical". */
export function GapKindTag({ kind }: { kind: LeftKind }) {
  return (
    <span className="gap-kind-tag" data-kind={kind}>
      {kind === "technical-gap" ? "Technical" : "Product"}
    </span>
  );
}

/* Which gaps a list shows: all of them, or one kind. */
export type GapShow = "all" | "product-gap" | "technical-gap";

/*
 * How many product and how many technical gaps there are, each with its mark.
 * With both kinds, each count is a toggle that shows only that kind, and
 * pressing it again shows all; with one kind, there's nothing to choose.
 */
export function GapFilter({ product, technical, show, onShow }: { product: number; technical: number; show: GapShow; onShow: (show: GapShow) => void }) {
  if (!product || !technical)
    return (
      <LeftCounts
        counts={[
          ["product-gap", product],
          ["technical-gap", technical],
        ]}
      />
    );
  const toggle = (kind: LeftKind, n: number) => {
    const word = kind === "product-gap" ? "product" : "technical";
    return (
      <Tip title={show === kind ? "Show all gaps" : `Show only ${word} gaps`}>
        <button type="button" className="gap-filter-toggle" aria-pressed={show === kind} onClick={() => onShow(show === kind ? "all" : (kind as GapShow))}>
          <LeftMark kind={kind} size={13} decorative />
          {n} {word}
        </button>
      </Tip>
    );
  };
  return (
    <span className="gap-filter" role="group" aria-label="Show gaps">
      {toggle("product-gap", product)}
      {toggle("technical-gap", technical)}
    </span>
  );
}

/* A kind's mark. `decorative` where its name is already beside it. */
export function LeftMark({ kind, size = 16, decorative = false }: { kind: LeftKind; size?: number; decorative?: boolean }) {
  const { one, Icon } = LEFT_KINDS[kind];
  if (decorative)
    return (
      <span className="left-mark" data-kind={kind} aria-hidden>
        <Icon sx={{ fontSize: size }} />
      </span>
    );
  return (
    <Tip title={one}>
      <span className="left-mark" data-kind={kind} role="img" aria-label={one}>
        <Icon sx={{ fontSize: size }} />
      </span>
    </Tip>
  );
}

const LEFT_TERMS: Record<LeftKind, TermId> = { "product-gap": "product-gap", "technical-gap": "technical-gap", decision: "open-decision", tradeoff: "tradeoff" };

/*
 * A kind's mark before a name for it, as a heading, label or tile: by default,
 * the kind's own name. The name opens what the kind means; `term` says which
 * word it is when the name isn't the kind's own, such as "Gaps" for both kinds.
 * `hoverOnly` where a tap does something else, such as a fold's heading.
 */
export function LeftLabel({ kind, size = 15, term, hoverOnly, children }: { kind: LeftKind; size?: number; term?: TermId; hoverOnly?: boolean; children?: ReactNode }) {
  return (
    <span className="left-label">
      <LeftMark kind={kind} size={size} decorative />
      <Term id={term ?? LEFT_TERMS[kind]} hoverOnly={hoverOnly}>
        {children ?? LEFT_KINDS[kind].many}
      </Term>
    </span>
  );
}

/* Items of what's left or tradeoffs, each a row: its mark, then what it says. `detailed`, as on a detail page, spaces them out and rules them off. */
export function LeftList({ detailed = false, children }: { detailed?: boolean; children: ReactNode }) {
  return (
    <ul className="left-list" data-detailed={detailed || undefined}>
      {children}
    </ul>
  );
}

export function LeftItem({ kind, children }: { kind: LeftKind; children: ReactNode }) {
  return (
    <li className="left-item">
      <LeftMark kind={kind} />
      <div className="left-item-body">{children}</div>
    </li>
  );
}

/* How many of each kind, each with its mark: "? 1 open decision  ◔ 2 product gaps". Kinds with none are left out. */
export function LeftCounts({ counts, lead }: { counts: [LeftKind, number][]; lead?: ReactNode }) {
  const shown = counts.filter(([, n]) => n);
  return (
    <span className="left-counts">
      {lead ? <span>{lead}</span> : null}
      {shown.map(([kind, n]) => (
        <span key={kind} className="left-count">
          <LeftMark kind={kind} size={13} decorative />
          {n} {(n === 1 ? LEFT_KINDS[kind].one : LEFT_KINDS[kind].many).toLowerCase()}
        </span>
      ))}
    </span>
  );
}
