import type { ReactNode } from "react";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import { DomainIcon } from "../names";
import { Excerpt, plainText } from "../markdown/Markdown";
import { LeftMark } from "../left/LeftMark";
import Tooltip from "@mui/material/Tooltip";
import { docHref } from "../../routes";
import { VERDICTS, find, subjectOf, technicalDoc, type DocqetState, type Gap, type Risk, type RiskAcross, type TechnicalDoc } from "../../state";
import { GapRiskMark, RiskBars, RiskScore, VERDICT_NAMES, riskScoreSx } from "./RiskScore";
import { InitiativeTags } from "../Initiatives";
import { Count } from "../shell/layout";

export type GapRow = { gap: Gap; on?: TechnicalDoc };

/*
 * A gap's line, and a tradeoff's: its risk, its kind, what it says, and what
 * it's on, each in a column so the lines read down the page; on a phone, one
 * under another. In a group, indented past its heading's chevron; `flat`,
 * not. A tradeoff has no risk of its own, so its line has no risk column.
 */
export const rowSx = (flat: boolean, risk = true): SystemStyleObject<Theme> => ({
  display: "grid",
  gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: risk ? "52px 74px minmax(0, 1fr) minmax(0, 220px)" : "74px minmax(0, 1fr) minmax(0, 220px)" },
  alignItems: "center",
  gap: { xs: "2px", sm: 1.5 },
  py: 0.75,
  pr: 1.75,
  pl: flat ? 0 : 4.25,
  fontSize: 13.5,
  /* The risk keeps to its own width, not its column's. */
  "& > :first-of-type": { justifySelf: "start" },
  "&:hover": { bgcolor: (t) => `color-mix(in srgb, ${t.vars.palette.text.primary} 2.5%, transparent)` },
});

/* A line's kind, quietly: "Product", "Technical", "Limit". */
export const kindSx: SystemStyleObject<Theme> = { fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "text.disabled" };

/* What a line says, cut to one line, opening its page. */
export const summarySx: SystemStyleObject<Theme> = { minWidth: 0, color: "text.primary", textDecoration: "none", "&:hover": { color: "primary.main" } };

/* What a line is on, at its right, linked; on a phone, at its left under it. */
export const onSx: SystemStyleObject<Theme> = {
  minWidth: 0,
  overflow: "hidden",
  fontSize: 12.5,
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  textAlign: { xs: "left", sm: "right" },
  "& a": {
    display: "inline-flex",
    alignItems: "center",
    gap: 0.5,
    maxWidth: "100%",
    color: "text.secondary",
    textDecoration: "none",
    "&:hover": { color: "primary.main" },
  },
};

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
  state: DocqetState;
  rows: GapRow[];
  here?: { id: string };
  grouped?: boolean;
  allOpen?: boolean;
}) {
  const scored = rows.map((r) => ({ ...r, risk: r.gap.risk }));
  if (!grouped)
    return (
      <Box component="ul" sx={{ display: "flex", flexDirection: "column" }}>
        {scored.map((r) => (
          <GapLine key={r.gap.id} state={state} row={r} risk={r.risk} here={here} flat />
        ))}
      </Box>
    );
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        border: 1,
        borderColor: "divider",
        borderRadius: "10px",
        overflow: "hidden",
        "& > details + details": { borderTop: 1, borderColor: "divider" },
      }}
    >
      {VERDICTS.map((verdict) => {
        const these = scored.filter((r) => r.risk.verdict === verdict).sort((a, b) => b.risk.score - a.risk.score);
        if (!these.length) return null;
        const open = allOpen || verdict === "unacceptable" || verdict === "tolerable";
        return (
          <Box component="details" key={verdict} open={open} sx={{ "&[open] > summary::before": { transform: "rotate(90deg)" } }}>
            <Box
              component="summary"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                px: 1.75,
                py: 1.25,
                fontSize: 13,
                cursor: "pointer",
                listStyle: "none",
                userSelect: "none",
                "&::-webkit-details-marker": { display: "none" },
                "&::before": { content: '"›"', width: 10, color: "text.disabled", transition: "transform 120ms" },
                "&:hover": { bgcolor: (t) => `color-mix(in srgb, ${t.vars.palette.text.primary} 3%, transparent)` },
              }}
            >
              <Box component="span" sx={[riskScoreSx(verdict, false), { fontSize: 13 }]}>
                <RiskBars verdict={verdict} size="small" />
                {VERDICT_NAMES[verdict].name}
              </Box>
              <Count n={these.length} />
              <Box component="span" sx={{ ml: "auto", fontSize: 12, color: "text.disabled" }}>
                {VERDICT_NAMES[verdict].means}
              </Box>
            </Box>
            <Box component="ul" sx={{ display: "flex", flexDirection: "column", pb: 0.75 }}>
              {these.map((r) => (
                <GapLine key={r.gap.id} state={state} row={r} risk={r.risk} here={here} />
              ))}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

function GapLine({ state, row, risk, here, flat = false }: { state: DocqetState; row: GapRow; risk: Risk; here?: { id: string }; flat?: boolean }) {
  const { gap } = row;
  const technical = !gap.domain;
  return (
    <Box component="li" sx={rowSx(flat)}>
      <GapRiskMark risk={risk} on={risk.on[0] ?? null} />
      <Box component="span" sx={kindSx}>
        {technical ? "Technical" : "Product"}
      </Box>
      <Tooltip title={plainText(gap.description)}>
        <Box component="a" href={docHref("gap", gap.id)} sx={summarySx}>
          <Excerpt text={gap.name} lines={{ xs: 3, sm: 1 }} />
        </Box>
      </Tooltip>
      <Box component="span" sx={onSx}>
        {onLink(state, row, here)}
        <GapInitiatives state={state} gap={gap} />
      </Box>
    </Box>
  );
}

/* The initiatives a product gap's capability is part of, at the right under what it's on. A technical gap shows on too many capabilities to say. */
export function GapInitiatives({ state, gap }: { state: DocqetState; gap: Gap }) {
  const { type, id } = subjectOf(gap);
  const capability = type === "capability" ? find(state.capabilities, id) : undefined;
  return capability ? <InitiativeTags state={state} ids={capability.initiatives} block end /> : null;
}

/* What a gap is on, as a link, unless it's the page it's shown on. */
function onLink(state: DocqetState, { gap, on }: GapRow, here?: { id: string }): ReactNode {
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
 * What's open, as a tile's figure: the gap mark and how many, the decision
 * mark and how many, the same marks every list uses, and under them the
 * highest risk among the gaps, worked out by whoever passes it. Inside a
 * link, so the risk's popover opens on hover only.
 */
export function LeftFigure({ gaps, decisions, risk, of }: { gaps: Gap[]; decisions: number; risk: RiskAcross<Gap>; of: string }) {
  if (!gaps.length && !decisions) return <span>Nothing open</span>;
  const count = { display: "inline-flex", alignItems: "center", gap: 0.75 };
  return (
    <Box component="span" sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
      <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1.75 }}>
        {gaps.length ? (
          <Box component="span" sx={count}>
            <LeftMark kind="product-gap" size={17} decorative />
            {gaps.length}
          </Box>
        ) : null}
        {decisions ? (
          <Box component="span" sx={count}>
            <LeftMark kind="decision" size={17} decorative />
            {decisions}
          </Box>
        ) : null}
      </Box>
      {gaps.length ? <RiskScore risk={risk} of={of} verdict inButton /> : null}
    </Box>
  );
}
