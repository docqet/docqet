import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import type { ReactNode } from "react";
import { DetailsPopover } from "./popovers/DetailsPopover";
import { LeftMark, gapKind } from "./left/LeftMark";
import NorthRoundedIcon from "@mui/icons-material/NorthRounded";
import { InlineMarkdown } from "./markdown/Markdown";
import { STABILITY } from "./stability/stability";
import { CapabilityStability } from "./CapabilityLabel";
import Tooltip from "@mui/material/Tooltip";
import { Pie } from "./ring/Pie";
import { docHref } from "../routes";
import { readinessBand, startedOf, type NotReady, type Readiness } from "../state";
import { ReadinessDetails } from "./popovers/ReadinessDetails";

/*
 * Readiness: how ready people can rely on it being, as a recommendation for
 * them to judge, and what it still needs. It's the maturity of its
 * capabilities less their exposure. It's drawn as maturity and exposure
 * are, at their sizes, but as a pie (see Pie) rather than a ring, in its
 * own color scale (readinessColor) rather than a band's: it isn't a level.
 * Its band's name takes the same color, as maturity's and exposure's take theirs.
 */

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/* Readiness's color, for its pie and percentage: from grey, not ready at all, toward the theme's ready.high, blended by how ready. */
export const readinessColor = (percent: number) => (theme: Theme) =>
  `color-mix(in oklch, ${theme.vars.palette.ready.high} ${Math.min(Math.max(percent, 0), 100)}%, ${theme.vars.palette.ready.low})`;

/* Readiness in a few words: "Viable · 59%", or null with nothing started. */
export function readinessLabel(r: Readiness): string | null {
  const band = readinessBand(r);
  return band ? `${band.name} · ${r.percent}%` : null;
}

/* What a not-ready capability still needs, in a line: "Reach Beta (now Alpha) · close 2 unacceptable gaps". */
export function needsLine(n: NotReady): string {
  const parts = [
    ...(n.belowBeta ? [`reach Beta (now ${n.capability.stability ? STABILITY[n.capability.stability].name : "a draft"})`] : []),
    ...(n.gaps.length ? [`close ${plural(n.gaps.length, "unacceptable gap", "unacceptable gaps")}`] : []),
  ].join(" · ");
  return parts.charAt(0).toUpperCase() + parts.slice(1);
}

/* A readiness beside a name or in a row: its pie and percentage, then its band. `readiness` is a hook for a header's stat, which lays it out as maturity's and exposure's. */
const markSx: SystemStyleObject<Theme> = {
  flex: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: 1,
  fontSize: 13.5,
  color: "text.primary",
  whiteSpace: "nowrap",
};

/*
 * How ready something is, beside its name or in a row, as maturity and
 * exposure are: its pie, with the percentage beside it, then its band, "75%
 * Ready"; `bare`, as on a persona's card on the map, just the pie and the
 * percentage. `size` is the pie's diameter, 22 by default, as theirs is
 * beside a name. Its popover (hover, focus, or tap) breaks it down. With
 * nothing started, it says so. `of` heads the popover: "Readiness for
 * Maria". Inside something clickable, `inButton` opens the popover on hover
 * only, so a tap still reaches what it's in.
 */
export function ReadinessMark({
  readiness,
  of,
  inButton = false,
  bare = false,
  size = 22,
}: {
  readiness: Readiness;
  of: string;
  inButton?: boolean;
  bare?: boolean;
  size?: number;
}) {
  const started = startedOf(readiness);
  if (!started || readiness.percent === null)
    return (
      <Tooltip title={readiness.notStarted.length ? "Only drafts so far, and drafts don't count." : "No capabilities yet."}>
        <Box component="span" className="readiness" sx={[markSx, { fontWeight: 500, color: "text.disabled" }]}>
          Nothing started
        </Box>
      </Tooltip>
    );
  const label = readinessLabel(readiness)!;
  const color = readinessColor(readiness.percent);
  return (
    <DetailsPopover hoverOnly={inButton} title={<ReadinessDetails readiness={readiness} of={of} />}>
      <Box
        component="span"
        className="readiness"
        role="img"
        aria-label={`${of}: ${label}`}
        tabIndex={inButton ? undefined : 0}
        sx={[markSx, !inButton && { borderRadius: 999, cursor: "help", "&:focus-visible": { outline: "2px solid currentColor", outlineOffset: 2 } }]}
      >
        <Pie percent={readiness.percent} size={size} figure={`${readiness.percent}%`} sx={{ color }} />
        {bare ? null : (
          <Box component="strong" sx={{ color }}>
            {readinessBand(readiness)!.name}
          </Box>
        )}
      </Box>
    </DetailsPopover>
  );
}

/* A line under what a capability still needs: its mark, a little lower to sit on the words' first line, then what it says. */
const needSx: SystemStyleObject<Theme> = { display: "flex", alignItems: "flex-start", gap: 0.75, "& > :first-of-type": { mt: "3px" } };

/* The quieter part of a line, after what it says. */
function Faint({ children }: { children: ReactNode }) {
  return (
    <Box component="span" sx={{ color: "text.disabled" }}>
      {children}
    </Box>
  );
}

/*
 * What it still needs before people can use it, on a page: each capability
 * not ready yet, linking to its page, with its level, whether it must reach
 * Beta, and each unacceptable gap on it, linking to the gap's page; then the
 * drafts, not started. Ready, it says so plainly, in `readyText`. Past
 * `limit`, the rest are folded.
 */
export function StillNeeds({ readiness, readyText, limit = 8 }: { readiness: Readiness; readyText: string; limit?: number }) {
  const ready = readiness.percent === null ? null : !readiness.notReady.length;
  const row = (n: NotReady) => (
    <Box
      component="li"
      key={n.capability.id}
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "minmax(180px, 280px) minmax(0, 1fr)" },
        alignItems: "start",
        gap: "4px 16px",
        py: 1,
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1, minWidth: 0 }}>
        <Box
          component="a"
          href={docHref("capability", n.capability.id)}
          sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, minWidth: 0, fontWeight: 600, color: "inherit", textDecoration: "none" }}
        >
          <BoltOutlinedIcon sx={{ fontSize: 16, color: "primary.main" }} />
          {n.capability.name}
        </Box>
        <CapabilityStability level={n.capability.stability} name={n.capability.name} focusable={false} />
      </Box>
      <Box component="ul" sx={{ display: "flex", flexDirection: "column", gap: "2px", color: "text.secondary", "& a": { color: "text.primary" } }}>
        {n.belowBeta ? (
          <Box component="li" sx={needSx}>
            {/* Reaching Beta: an arrow up, in the text's color, apart from gaps' amber and decisions' violet. */}
            <Box component="span" aria-hidden sx={{ display: "inline-flex", flex: "none", color: "text.primary" }}>
              <NorthRoundedIcon sx={{ fontSize: 14 }} />
            </Box>
            <span>
              Reach Beta <Faint>· now {n.capability.stability ? STABILITY[n.capability.stability].name : "a draft"}</Faint>
            </span>
          </Box>
        ) : null}
        {n.gaps.map((g) => (
          <Box component="li" key={g.id} sx={needSx}>
            <LeftMark kind={gapKind(g)} size={14} />
            <span>
              Close{" "}
              <a href={docHref("gap", g.id)}>
                <InlineMarkdown text={g.name} />
              </a>
              <Faint> · {gapKind(g) === "technical-gap" ? "technical" : "product"}</Faint>
            </span>
          </Box>
        ))}
        {/* Open decisions are left to settle, but don't count toward readiness. */}
        {n.decisions.length ? (
          <Box component="li" sx={needSx}>
            <LeftMark kind="decision" size={14} />
            <span>
              <a href={docHref("capability", n.capability.id)}>{plural(n.decisions.length, "open decision", "open decisions")}</a>
              <Faint> · to settle, not counted in readiness</Faint>
            </span>
          </Box>
        ) : null}
      </Box>
    </Box>
  );
  const rest = readiness.notReady.slice(limit);
  const lineSx: SystemStyleObject<Theme> = { color: "text.secondary", "& a": { color: "text.primary" } };
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, fontSize: 13.5, "& a:hover": { color: "primary.main" } }}>
      {ready === true ? (
        <Box component="p" sx={{ display: "flex", alignItems: "center", gap: 1, fontWeight: 600, color: "text.primary" }}>
          <CheckCircleRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          {readyText}
        </Box>
      ) : ready === null ? (
        <Box component="p" sx={lineSx}>
          Nothing started yet, so there&rsquo;s nothing to be ready.
        </Box>
      ) : (
        <Box component="ul" sx={{ display: "flex", flexDirection: "column" }}>
          {readiness.notReady.slice(0, limit).map(row)}
        </Box>
      )}
      {rest.length ? (
        <details>
          <Box component="summary" sx={{ cursor: "pointer", color: "text.secondary" }}>
            {plural(rest.length, "more capability", "more capabilities")} not ready yet
          </Box>
          <Box component="ul" sx={{ display: "flex", flexDirection: "column" }}>
            {rest.map(row)}
          </Box>
        </details>
      ) : null}
      {readiness.notStarted.length ? (
        <Box component="p" sx={lineSx}>
          <Box component="span" sx={{ fontWeight: 600 }}>
            Not started:
          </Box>{" "}
          {readiness.notStarted.map((c, i) => (
            <span key={c.id}>
              {i ? ", " : null}
              <a href={docHref("capability", c.id)}>{c.name}</a>
            </span>
          ))}
        </Box>
      ) : null}
    </Box>
  );
}
