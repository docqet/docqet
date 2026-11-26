import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import Box from "@mui/material/Box";
import { Fragment, type ReactNode } from "react";
import { Excerpt, InlineMarkdown } from "./markdown/Markdown";
import { STABILITY } from "./stability/stability";
import { sectionHref, docHref } from "../routes";
import { HeldDecisions } from "./Fields";
import { kindSx, onSx, rowSx } from "./risk/GapRows";
import { expectedOutcome, find, outcomesAffected, subjectOf, technicalDoc, type DocketState, type Tradeoff } from "../state";

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
    <Box component="ul" sx={{ display: "flex", flexDirection: "column" }}>
      {tradeoffs.map((t) => (
        <TradeoffLine key={t.id} state={state} tradeoff={t} here={here} />
      ))}
    </Box>
  );
}

/* Each side's label: the drawback in the warning's color, the benefit in success's, and what reopened it in a decision's. */
const SIDE_COLORS = { drawback: "warning.main", benefit: "success.main", reopened: "primary.main" } as const;

function Side({ side, children }: { side?: keyof typeof SIDE_COLORS; children: ReactNode }) {
  return (
    <Box
      component="dt"
      sx={{ pt: "2px", fontSize: 11, fontWeight: 650, letterSpacing: "0.06em", textTransform: "uppercase", color: side ? SIDE_COLORS[side] : "text.disabled" }}
    >
      {children}
    </Box>
  );
}

function TradeoffLine({ state, tradeoff: t, here }: { state: DocketState; tradeoff: Tradeoff; here?: { id: string } }) {
  const { type } = subjectOf(t);
  const named = outcomesAffected(t).flatMap((id) => expectedOutcome(state.rubric, id) ?? []);
  const reopened = t.decisions;
  return (
    <li>
      <Box component="details" sx={{ "&[open] > summary": { bgcolor: (th) => `color-mix(in srgb, ${th.vars.palette.primary.main} 6%, transparent)` } }}>
        <Box component="summary" sx={[rowSx(true, false), { cursor: "pointer", listStyle: "none", "&::-webkit-details-marker": { display: "none" } }]}>
          <Box component="span" sx={kindSx}>
            {type === "feature" ? "Non-goal" : type === "capability" ? "Limit" : "Technical"}
          </Box>
          {/* What was chosen, then, where an open decision has reopened it, a mark saying so, in a decision's color. Bolder while it's open. */}
          <Box
            component="span"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              minWidth: 0,
              color: "text.primary",
              "& > :first-of-type": { minWidth: 0 },
              "details[open] > summary > & > :first-of-type": { fontWeight: 600 },
            }}
          >
            <Excerpt text={t.name} lines={{ xs: 3, sm: 1 }} />
            {reopened.length ? (
              <Box component="span" sx={{ flex: "none", fontSize: 11, fontWeight: 600, color: "primary.main" }}>
                Reopened
              </Box>
            ) : null}
          </Box>
          <Box component="span" sx={onSx}>
            {onLink(state, t, here)}
          </Box>
        </Box>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, pt: 1, pr: 1.75, pb: 1.75, fontSize: 13.5 }}>
          <Box sx={{ maxWidth: 760, lineHeight: 1.5 }}>
            <InlineMarkdown text={t.description} />
          </Box>
          <Box
            component="dl"
            sx={{
              display: "grid",
              gridTemplateColumns: "110px minmax(0, 1fr)",
              gap: "8px 16px",
              maxWidth: 760,
              m: 0,
              "& dd": { m: 0, lineHeight: 1.5 },
              "& dd a": { color: "primary.main", textDecoration: "none" },
            }}
          >
            <Side side="drawback">Drawback</Side>
            <dd>
              <InlineMarkdown text={t.drawback} />
            </dd>
            {t.benefit?.trim() ? (
              <>
                <Side side="benefit">Benefit</Side>
                <dd>
                  <InlineMarkdown text={t.benefit} />
                </dd>
              </>
            ) : null}
            {named.map((n) => (
              <Fragment key={n.outcome.id}>
                <Side>Falls short of</Side>
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
                <Side side="reopened">Reopened by</Side>
                <dd>
                  <HeldDecisions held={reopened} />
                </dd>
              </>
            ) : null}
          </Box>
        </Box>
      </Box>
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
