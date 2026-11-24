import type { CSSProperties } from "react";
import Box from "@mui/material/Box";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import { DetailsCard, DetailsEyebrow, DetailsPopover } from "./design/DetailsPopover";
import { LeftMark, gapKind } from "./design/left/LeftMark";
import NorthRoundedIcon from "@mui/icons-material/NorthRounded";
import { InlineMarkdown } from "./design/markdown/Markdown";
import { STABILITY } from "./design/stability/stability";
import { CapabilityStability } from "./design/catalog/CapabilityLabel";
import { Tip } from "./design/Tip";
import { docHref } from "./routes";
import { READINESS_BANDS, carriedText, readinessBand, startedOf, type NotReady, type Readiness } from "./state";

/*
 * Readiness: how ready people can rely on it being, as a recommendation for
 * them to judge, and what it still needs. It's the maturity of its
 * capabilities less the risk they carry. It's never in a level's color,
 * since it isn't a level, and never a ring, since that's maturity's: a short straight bar filled as far as its
 * percentage, in --ok in the Ready quarter, and in the text's own color below.
 */

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/* Readiness in a few words: "Mostly ready · 59%", or null with nothing started. */
export function readinessLabel(r: Readiness): string | null {
  const band = readinessBand(r);
  return band ? `${band.name} · ${r.percent}%` : null;
}

/* A readiness in words, its percentage in its bar's color: "Mostly ready · 59%". Null with nothing started. */
export function ReadinessText({ readiness }: { readiness: Readiness }) {
  const band = readinessBand(readiness);
  if (!band) return null;
  return (
    <>
      {band.name} ·{" "}
      <span className="readiness-percent" style={{ color: readinessColor(readiness.percent!) }}>
        {readiness.percent}%
      </span>
    </>
  );
}

/* What a not-ready capability still needs, in a line: "Reach Beta (now Alpha) · close 2 unacceptable gaps". */
export function needsLine(n: NotReady): string {
  const parts = [
    ...(n.belowBeta ? [`reach Beta (now ${n.capability.stability ? STABILITY[n.capability.stability].name : "a draft"})`] : []),
    ...(n.gaps.length ? [`close ${plural(n.gaps.length, "unacceptable gap", "unacceptable gaps")}`] : []),
  ].join(" · ");
  return parts.charAt(0).toUpperCase() + parts.slice(1);
}

/*
 * What a capability with something left still needs, as marks by kind, so
 * reaching Beta, product and technical gaps, and open decisions read apart:
 * "↑ Beta · now Alpha   ◌ 3 product gaps   ◌ 8 technical gaps   ? 1 open
 * decision". Only the unacceptable gaps are counted; decisions don't count
 * toward readiness, but are shown as left to settle.
 */
export function NeedsChips({ needs }: { needs: NotReady }) {
  const product = needs.gaps.filter((g) => gapKind(g) === "product-gap").length;
  const technical = needs.gaps.length - product;
  return (
    <span className="needs-chips">
      {needs.belowBeta ? (
        <span className="needs-chip">
          <span className="needs-mark level" aria-hidden>
            <NorthRoundedIcon sx={{ fontSize: 13 }} />
          </span>
          Beta <span className="needs-faint">· now {needs.capability.stability ? STABILITY[needs.capability.stability].name : "a draft"}</span>
        </span>
      ) : null}
      {product ? (
        <span className="needs-chip">
          <LeftMark kind="product-gap" size={13} decorative />
          {plural(product, "product gap", "product gaps")}
        </span>
      ) : null}
      {technical ? (
        <span className="needs-chip">
          <LeftMark kind="technical-gap" size={13} decorative />
          {plural(technical, "technical gap", "technical gaps")}
        </span>
      ) : null}
      {needs.decisions.length ? (
        <span className="needs-chip aside">
          <LeftMark kind="decision" size={13} decorative />
          {plural(needs.decisions.length, "open decision", "open decisions")}
        </span>
      ) : null}
    </span>
  );
}

/* Readiness's color: from grey, not ready at all, to green, ready, blended by how ready. */
export const readinessColor = (percent: number) => `color-mix(in oklch, var(--ready-high) ${Math.min(Math.max(percent, 0), 100)}%, var(--ready-low))`;

/*
 * A straight bar, filled as far as `percent`, from grey to its color. Decorative.
 * A bar, never a ring: the ring is maturity's. `wide` spans its popover, notched
 * at each quarter.
 */
function ReadinessBar({ percent, size = "small" }: { percent: number; size?: "small" | "large" | "wide" }) {
  const p = Math.min(Math.max(percent, 0), 100);
  return (
    <span className={`readiness-bar${size === "small" ? "" : ` ${size}`}`} aria-hidden style={{ "--ready": readinessColor(p) } as CSSProperties}>
      <span className="readiness-bar-fill" style={{ width: `${p}%` }} />
    </span>
  );
}

/*
 * How ready something is, beside its name or in a row: its quarter and
 * percentage, "Mostly ready · 59%", with its bar; large, as at the top of a
 * page, the quarter in bold; `bare`, as on the map, just the bar and the
 * percentage, since the popover and side panel name the quarter. Its popover (hover, focus, or tap) breaks it down. With
 * nothing started, it says so. `of` says whose it is in the popover:
 * "Readiness for Maria". Inside something clickable, `inButton` opens the
 * popover on hover only, so a tap still reaches what it's in.
 */
export function ReadinessMark({
  readiness,
  of,
  large = false,
  inButton = false,
  bare = false,
}: {
  readiness: Readiness;
  of: string;
  large?: boolean;
  inButton?: boolean;
  bare?: boolean;
}) {
  const started = startedOf(readiness);
  if (!started || readiness.percent === null)
    return (
      <Tip title={readiness.notStarted.length ? "Only drafts so far, and drafts don't count." : "No capabilities yet."}>
        <span className="readiness faint">Nothing started</span>
      </Tip>
    );
  const label = readinessLabel(readiness)!;
  return (
    <DetailsPopover hoverOnly={inButton} title={<ReadinessDetails readiness={readiness} of={of} />}>
      <span
        className={`readiness${large ? " large" : ""}`}
        role="img"
        aria-label={`${of}: ${label}`}
        tabIndex={inButton ? undefined : 0}
      >
        <ReadinessBar percent={readiness.percent} size={large ? "large" : "small"} />
        {large ? (
          <>
            <strong>{readinessBand(readiness)!.name}</strong>
            <span className="readiness-count" style={{ color: readinessColor(readiness.percent) }}>
              {readiness.percent}%
            </span>
          </>
        ) : bare ? (
          <span className="readiness-count" style={{ color: readinessColor(readiness.percent), fontWeight: 600 }}>
            {readiness.percent}%
          </span>
        ) : (
          <span>
            <ReadinessText readiness={readiness} />
          </span>
        )}
      </span>
    </DetailsPopover>
  );
}

/* How many of a list a popover names before saying how many more. */
const SHOWN = 5;

/*
 * Readiness for its popover: its quarter and percentage, what that
 * recommends, how it's worked out from maturity and risk carried, what it's
 * worked out from, what each capability with something
 * left still needs, the drafts, and what readiness is.
 */
function ReadinessDetails({ readiness, of }: { readiness: Readiness; of: string }) {
  const started = startedOf(readiness);
  const section = { mt: 1.5, pt: 1.5, borderTop: 1, borderColor: "divider" } as const;
  return (
    <DetailsCard card width={320}>
      <DetailsEyebrow>{of}</DetailsEyebrow>
      <Box sx={{ mt: 1, display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1 }}>
        <Box className="readiness-details-name" sx={{ fontSize: "1.12em", fontWeight: 700 }}>
          {readinessBand(readiness)!.name}
        </Box>
        <Box sx={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }} style={{ color: readinessColor(readiness.percent!) }}>
          {readiness.percent}%
        </Box>
      </Box>
      <Box sx={{ mt: 1 }}>
        <ReadinessBar percent={readiness.percent!} size="wide" />
        <span className="readiness-bar-scale" aria-hidden>
          {READINESS_BANDS.map((b) => (
            <span key={b.name}>{b.name}</span>
          ))}
        </span>
      </Box>
      <Box sx={{ mt: 0.75, color: "text.secondary" }}>{readinessBand(readiness)!.says}</Box>
      <Box sx={{ mt: 1, fontSize: "0.92em", fontVariantNumeric: "tabular-nums" }}>
        {Math.round(readiness.maturity!)}% mature × (1 − {carriedText(readiness.risk.percent ?? 0)} risk carried) = {readiness.percent}%
      </Box>
      <Box sx={{ mt: 0.75, color: "text.secondary" }}>
        From {plural(started, "started capability", "started capabilities")}, {readiness.ready.length} with nothing left
        {readiness.notStarted.length ? `, and ${plural(readiness.notStarted.length, "draft", "drafts")} not started` : ""}
      </Box>
      {readiness.notReady.length ? (
        <Box sx={section}>
          <Box sx={{ fontWeight: 600 }}>Still needs</Box>
          <Box sx={{ color: "text.secondary", fontSize: "0.92em" }}>Gaps counted are the unacceptable ones.</Box>
          <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
            {readiness.notReady.slice(0, SHOWN).map((n) => (
              <Box key={n.capability.id} component="li" sx={{ py: 0.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                  <span>{n.capability.name}</span>
                  <CapabilityStability level={n.capability.stability} name={n.capability.name} focusable={false} />
                </Box>
                <NeedsChips needs={n} />
              </Box>
            ))}
          </Box>
          {readiness.notReady.length > SHOWN ? <Box sx={{ color: "text.secondary" }}>and {readiness.notReady.length - SHOWN} more</Box> : null}
        </Box>
      ) : null}
      {readiness.notStarted.length ? (
        <Box sx={[section, { color: "text.secondary" }]}>
          Not started: {readiness.notStarted.slice(0, SHOWN).map((c) => c.name).join(", ")}
          {readiness.notStarted.length > SHOWN ? ` and ${readiness.notStarted.length - SHOWN} more` : ""}
        </Box>
      ) : null}
      <Box sx={[section, { fontSize: "0.92em", color: "text.secondary" }]}>
        Our view of how ready this is to serve people in production, from the stability levels, gaps and impacts written down, for you
        to judge. It&rsquo;s maturity, less the share of risk its open gaps carry, and drafts don&rsquo;t count.
      </Box>
    </DetailsCard>
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
    <li key={n.capability.id}>
      <span className="needs-capability">
        <a href={docHref("capability", n.capability.id)}>
          <BoltOutlinedIcon sx={{ fontSize: 16, color: "primary.main" }} />
          {n.capability.name}
        </a>
        <CapabilityStability level={n.capability.stability} name={n.capability.name} focusable={false} />
      </span>
      <ul className="needs-what">
        {n.belowBeta ? (
          <li>
            <span className="needs-mark level" aria-hidden>
              <NorthRoundedIcon sx={{ fontSize: 14 }} />
            </span>
            <span>
              Reach Beta <span className="needs-faint">· now {n.capability.stability ? STABILITY[n.capability.stability].name : "a draft"}</span>
            </span>
          </li>
        ) : null}
        {n.gaps.map((g) => (
          <li key={g.id}>
            <LeftMark kind={gapKind(g)} size={14} />
            <span>
              Close{" "}
              <a href={docHref("gap", g.id)}>
                <InlineMarkdown text={g.name} />
              </a>
              <span className="needs-faint"> · {gapKind(g) === "technical-gap" ? "technical" : "product"}</span>
            </span>
          </li>
        ))}
        {n.decisions.length ? (
          <li className="needs-aside">
            <LeftMark kind="decision" size={14} />
            <span>
              <a href={docHref("capability", n.capability.id)}>{plural(n.decisions.length, "open decision", "open decisions")}</a>
              <span className="needs-faint"> · to settle, not counted in readiness</span>
            </span>
          </li>
        ) : null}
      </ul>
    </li>
  );
  const rest = readiness.notReady.slice(limit);
  return (
    <div className="needs">
      {ready === true ? (
        <p className="needs-ready">
          <CheckCircleRoundedIcon className="readiness-check" />
          {readyText}
        </p>
      ) : ready === null ? (
        <p className="needs-line">Nothing started yet, so there&rsquo;s nothing to be ready.</p>
      ) : (
        <ul className="needs-list">{readiness.notReady.slice(0, limit).map(row)}</ul>
      )}
      {rest.length ? (
        <details className="needs-more">
          <summary>{plural(rest.length, "more capability", "more capabilities")} not ready yet</summary>
          <ul className="needs-list">{rest.map(row)}</ul>
        </details>
      ) : null}
      {readiness.notStarted.length ? (
        <p className="needs-line">
          <span className="needs-label">Not started:</span>{" "}
          {readiness.notStarted.map((c, i) => (
            <span key={c.id}>
              {i ? ", " : null}
              <a href={docHref("capability", c.id)}>{c.name}</a>
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}
