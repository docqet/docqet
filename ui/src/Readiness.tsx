import Box from "@mui/material/Box";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import { DetailsCard, DetailsEyebrow, DetailsPopover, DetailsWorkings } from "./design/DetailsPopover";
import { LeftMark, gapKind } from "./design/left/LeftMark";
import NorthRoundedIcon from "@mui/icons-material/NorthRounded";
import { InlineMarkdown } from "./design/markdown/Markdown";
import { STABILITY, levelColor } from "./design/stability/stability";
import { LevelSpread } from "./design/stability/StabilitySpread";
import { RingGlyph } from "./design/maturity/RingGlyph";
import { MATURITY_BANDS, maturityBand } from "./design/maturity/maturity";
import { RiskRing } from "./design/risk/RiskRing";
import { VerdictSpread } from "./design/risk/RiskScore";
import { CapabilityStability } from "./design/catalog/CapabilityLabel";
import { Tip } from "./design/Tip";
import { Pie } from "./design/ring/Pie";
import { docHref } from "./routes";
import { exposureText, readinessBand, startedOf, type NotReady, type Readiness } from "./state";

/*
 * Readiness: how ready people can rely on it being, as a recommendation for
 * them to judge, and what it still needs. It's the maturity of its
 * capabilities less their exposure. It's drawn as maturity and exposure
 * are, at their sizes, but as a pie (see Pie) rather than a ring, in its
 * own color scale (readinessColor) rather than a band's: it isn't a level.
 * Its band's name takes the same color, as maturity's and exposure's take theirs.
 */

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/* Readiness's color, for its pie and percentage: from grey, not ready at all, toward --ready-high, blended by how ready. */
export const readinessColor = (percent: number) => `color-mix(in oklch, var(--ready-high) ${Math.min(Math.max(percent, 0), 100)}%, var(--ready-low))`;

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
      <Tip title={readiness.notStarted.length ? "Only drafts so far, and drafts don't count." : "No capabilities yet."}>
        <span className="readiness faint">Nothing started</span>
      </Tip>
    );
  const label = readinessLabel(readiness)!;
  return (
    <DetailsPopover hoverOnly={inButton} title={<ReadinessDetails readiness={readiness} of={of} />}>
      <span className="readiness" role="img" aria-label={`${of}: ${label}`} tabIndex={inButton ? undefined : 0}>
        <Pie percent={readiness.percent} size={size} figure={`${readiness.percent}%`} sx={{ color: readinessColor(readiness.percent) }} />
        {bare ? null : <strong style={{ color: readinessColor(readiness.percent) }}>{readinessBand(readiness)!.name}</strong>}
      </span>
    </DetailsPopover>
  );
}

/*
 * Readiness for its popover, laid out as maturity's and exposure's are:
 * its quarter, percentage and bar, what that recommends, then why it's
 * there: the maturity and exposure it's worked out from, each as its
 * ring, and how its capabilities spread across the levels and its gaps
 * across the verdicts. Then what readiness is, and how it's worked out.
 * What each capability still needs is on the page, not here.
 */
function ReadinessDetails({ readiness, of }: { readiness: Readiness; of: string }) {
  const started = startedOf(readiness);
  const { exposure, levels, gaps } = readiness;
  const maturity = Math.round(readiness.maturity!);
  const band = maturityBand(maturity);
  return (
    <DetailsCard card width={320}>
      <DetailsEyebrow>{of}</DetailsEyebrow>
      <Box sx={{ mt: 1.25, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Pie percent={readiness.percent!} size={56} sx={{ color: readinessColor(readiness.percent!) }} />
        <div>
          <Box sx={{ fontSize: "1.12em", fontWeight: 700, color: readinessColor(readiness.percent!) }}>{readinessBand(readiness)!.name}</Box>
          <Box sx={{ color: readinessColor(readiness.percent!), fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{readiness.percent}%</Box>
        </div>
      </Box>
      <Box sx={{ mt: 1.25 }}>{readinessBand(readiness)!.says}</Box>
      <div className="readiness-factors">
        <div className="readiness-factor">
          <RingGlyph progress={maturity} size={40} />
          <div>
            <div className="readiness-factor-name">Maturity</div>
            <Box component="strong" sx={levelColor(band)}>
              {MATURITY_BANDS[band]}
            </Box>
          </div>
        </div>
        {exposure.percent !== null && exposure.band ? (
          <div className="readiness-factor" data-risk-band={exposure.band.id}>
            <RiskRing percent={exposure.percent} size={40} />
            <div>
              <div className="readiness-factor-name">Exposure</div>
              <Box component="strong" sx={{ color: "var(--risk-band)" }}>
                {exposure.band.name}
              </Box>
            </div>
          </div>
        ) : null}
      </div>
      <div className="risk-details-head">{plural(levels.length, "capability", "capabilities")} by level</div>
      <LevelSpread levels={levels} />
      {gaps.items.length ? (
        <>
          <div className="risk-details-head">{plural(gaps.items.length, "gap", "gaps")} by risk</div>
          <VerdictSpread risk={gaps} />
        </>
      ) : null}
      <Box sx={{ mt: 1.25, color: "text.secondary", fontSize: "0.92em" }}>
        Our view of how ready this is to serve people in production, from the stability levels, gaps and impacts written down, for you to judge.
      </Box>
      <DetailsWorkings>
        <div className="details-workings-sum">
          {maturity}% mature × (1 − {exposureText(exposure.percent ?? 0)} exposure) = {readiness.percent}%
        </div>
        <div>
          Its maturity, less the share of the most its open gaps could put at stake, both from its{" "}
          {plural(started, "started capability", "started capabilities")}. Drafts don&rsquo;t count.
        </div>
        <div>Each quarter is a band: unready, partial, viable and ready.</div>
      </DetailsWorkings>
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
