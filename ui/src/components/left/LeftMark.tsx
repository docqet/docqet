import type { ReactNode } from "react";
import BalanceRoundedIcon from "@mui/icons-material/BalanceRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import Box from "@mui/material/Box";
import { createSvgIcon } from "@mui/material/utils";
import Tooltip from "@mui/material/Tooltip";
import { Term } from "../term/Term";
import type { TermId } from "../term/terms";

/*
 * What's open, and what we chose to live with, look the same wherever they
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

/* Each kind's mark, name and color: gaps amber, open decisions violet, and tradeoffs muted, since they're decided. */
export const LEFT_KINDS: Record<LeftKind, { one: string; many: string; Icon: typeof GapIcon; color: string }> = {
  "product-gap": { one: "Product gap", many: "Product gaps", Icon: GapIcon, color: "warning.main" },
  "technical-gap": { one: "Technical gap", many: "Technical gaps", Icon: GapIcon, color: "warning.main" },
  decision: { one: "Open decision", many: "Open decisions", Icon: HelpOutlineRoundedIcon, color: "primary.main" },
  tradeoff: { one: "Tradeoff", many: "Tradeoffs", Icon: BalanceRoundedIcon, color: "text.secondary" },
};

/* A gap's kind: a technical gap is on a mechanism or component; a product gap is on anything else. */
export const gapKind = (gap: { id: string }): LeftKind => (/^(mechanism|component):/.test(gap.id) ? "technical-gap" : "product-gap");

/* A gap's kind, as a label before what it says: "Product" in a gap's amber, or "Technical", quieter. */
export function GapKindTag({ kind }: { kind: LeftKind }) {
  const technical = kind === "technical-gap";
  return (
    <Box
      component="span"
      sx={{
        display: "inline-block",
        mr: "7px",
        px: 0.75,
        fontSize: 10.5,
        fontWeight: 650,
        lineHeight: "17px",
        letterSpacing: "0.03em",
        textTransform: "uppercase",
        verticalAlign: "1px",
        color: technical ? "text.secondary" : "warning.main",
        bgcolor: (t) => `color-mix(in srgb, ${technical ? t.vars.palette.text.primary : t.vars.palette.warning.main} ${technical ? 8 : 13}%, transparent)`,
        borderRadius: "4px",
      }}
    >
      {technical ? "Technical" : "Product"}
    </Box>
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
      <Tooltip title={show === kind ? "Show all gaps" : `Show only ${word} gaps`}>
        <Box
          component="button"
          type="button"
          aria-pressed={show === kind}
          onClick={() => onShow(show === kind ? "all" : (kind as GapShow))}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: "5px",
            px: "9px",
            py: "2px",
            font: "inherit",
            fontSize: 12,
            fontWeight: 600,
            lineHeight: "18px",
            color: "text.secondary",
            cursor: "pointer",
            bgcolor: "transparent",
            border: 1,
            borderColor: "surface.borderStrong",
            borderRadius: 999,
            transition: "color 120ms, border-color 120ms, background-color 120ms",
            "& > span": { lineHeight: 0 },
            "& > span svg": { display: "block" },
            "&:hover": { color: "text.primary", borderColor: "warning.main" },
            "&[aria-pressed=true]": {
              color: "text.primary",
              bgcolor: (t) => `color-mix(in srgb, ${t.vars.palette.warning.main} 14%, transparent)`,
              borderColor: "warning.main",
            },
          }}
        >
          <LeftMark kind={kind} size={13} decorative />
          {n} {word}
        </Box>
      </Tooltip>
    );
  };
  return (
    <Box component="span" role="group" aria-label="Show gaps" sx={{ display: "inline-flex", flexWrap: "wrap", gap: 0.75 }}>
      {toggle("product-gap", product)}
      {toggle("technical-gap", technical)}
    </Box>
  );
}

/* A kind's mark. `decorative` where its name is already beside it. */
export function LeftMark({ kind, size = 16, decorative = false }: { kind: LeftKind; size?: number; decorative?: boolean }) {
  const { one, Icon, color } = LEFT_KINDS[kind];
  const sx = { display: "inline-flex", flex: "none", color };
  if (decorative)
    return (
      <Box component="span" aria-hidden sx={sx}>
        <Icon sx={{ fontSize: size }} />
      </Box>
    );
  return (
    <Tooltip title={one}>
      <Box component="span" role="img" aria-label={one} sx={sx}>
        <Icon sx={{ fontSize: size }} />
      </Box>
    </Tooltip>
  );
}

const LEFT_TERMS: Record<LeftKind, TermId> = {
  "product-gap": "product-gap",
  "technical-gap": "technical-gap",
  decision: "open-decision",
  tradeoff: "tradeoff",
};

/*
 * A kind's mark before a name for it, as a heading, label or tile: by default,
 * the kind's own name. The name opens what the kind means; `term` says which
 * word it is when the name isn't the kind's own, such as "Gaps" for both kinds.
 * `hoverOnly` where a tap does something else, such as a fold's heading.
 */
export function LeftLabel({
  kind,
  size = 15,
  term,
  hoverOnly,
  children,
}: {
  kind: LeftKind;
  size?: number;
  term?: TermId;
  hoverOnly?: boolean;
  children?: ReactNode;
}) {
  return (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
      <LeftMark kind={kind} size={size} decorative />
      <Term id={term ?? LEFT_TERMS[kind]} hoverOnly={hoverOnly}>
        {children ?? LEFT_KINDS[kind].many}
      </Term>
    </Box>
  );
}

/*
 * Open items or tradeoffs, each a row: its mark, then what it says,
 * and under that anything more. `detailed`, as on a detail page, spaces them
 * out and rules them off, each with more under it.
 */
export function LeftList({ detailed = false, children }: { detailed?: boolean; children: ReactNode }) {
  return (
    <Box
      component="ul"
      sx={[
        { display: "flex", flexDirection: "column", minWidth: 0, fontSize: 13.5 },
        detailed && {
          "& > li": { gap: 1.5, py: 1.5, "& > span": { mt: "3px" }, "& > div": { gap: 1 } },
          "& > li:first-of-type": { pt: "2px" },
          "& > li:last-of-type": { pb: "2px" },
          "& > li + li": { borderTop: 1, borderColor: "divider" },
        },
      ]}
    >
      {children}
    </Box>
  );
}

export function LeftItem({ kind, children }: { kind: LeftKind; children: ReactNode }) {
  return (
    <Box component="li" sx={{ display: "grid", gridTemplateColumns: "16px minmax(0, 1fr)", gap: 1.25, py: 0.5, "& > span": { mt: "2px" } }}>
      <LeftMark kind={kind} />
      <Box sx={{ display: "flex", flexDirection: "column", gap: "3px", minWidth: 0, lineHeight: 1.5 }}>{children}</Box>
    </Box>
  );
}

/* How many of each kind, each with its mark: "? 1 open decision  ◔ 2 product gaps". Kinds with none are left out. */
export function LeftCounts({ counts, lead }: { counts: [LeftKind, number][]; lead?: ReactNode }) {
  const shown = counts.filter(([, n]) => n);
  return (
    <Box component="span" sx={{ display: "inline-flex", flexWrap: "wrap", alignItems: "center", gap: "2px 10px" }}>
      {lead ? <span>{lead}</span> : null}
      {shown.map(([kind, n]) => (
        <Box component="span" key={kind} sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
          <LeftMark kind={kind} size={13} decorative />
          {n} {(n === 1 ? LEFT_KINDS[kind].one : LEFT_KINDS[kind].many).toLowerCase()}
        </Box>
      ))}
    </Box>
  );
}
