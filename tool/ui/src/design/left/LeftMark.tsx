import type { ReactNode } from "react";
import BalanceRoundedIcon from "@mui/icons-material/BalanceRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import IncompleteCircleRoundedIcon from "@mui/icons-material/IncompleteCircleRounded";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";

/*
 * What's left, and what we chose to live with, look the same wherever they
 * show: on the map, in the side panel, on a detail page and on the
 * checklist. Each kind has one mark, in one color, and one name. A gap is a
 * gap whoever would notice it, so product and technical gaps share a mark
 * and are told apart by name.
 */
export type LeftKind = "product-gap" | "technical-gap" | "decision" | "rule" | "tradeoff";

export const LEFT_KINDS: Record<LeftKind, { one: string; many: string; Icon: typeof RuleRoundedIcon }> = {
  "product-gap": { one: "Product gap", many: "Product gaps", Icon: IncompleteCircleRoundedIcon },
  "technical-gap": { one: "Technical gap", many: "Technical gaps", Icon: IncompleteCircleRoundedIcon },
  decision: { one: "Open decision", many: "Open decisions", Icon: HelpOutlineRoundedIcon },
  rule: { one: "Rule without evidence", many: "Rules without evidence", Icon: RuleRoundedIcon },
  tradeoff: { one: "Tradeoff", many: "Tradeoffs", Icon: BalanceRoundedIcon },
};

/* A gap's kind: a product gap is in a domain; a technical gap, on a system or component, isn't. */
export const gapKind = (gap: { domain?: string }): LeftKind => (gap.domain ? "product-gap" : "technical-gap");

/* A kind's mark. `decorative` where its name is already beside it. */
export function LeftMark({ kind, size = 16, decorative = false }: { kind: LeftKind; size?: number; decorative?: boolean }) {
  const { one, Icon } = LEFT_KINDS[kind];
  return (
    <span className="left-mark" data-kind={kind} {...(decorative ? { "aria-hidden": true } : { role: "img", "aria-label": one, title: one })}>
      <Icon sx={{ fontSize: size }} />
    </span>
  );
}

/* A kind's mark before a name for it, as a heading, label or tile: by default, the kind's own name. */
export function LeftLabel({ kind, size = 15, children }: { kind: LeftKind; size?: number; children?: ReactNode }) {
  return (
    <span className="left-label">
      <LeftMark kind={kind} size={size} decorative />
      {children ?? LEFT_KINDS[kind].many}
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
