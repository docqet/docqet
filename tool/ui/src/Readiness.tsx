import Box from "@mui/material/Box";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import { DetailsCard, DetailsEyebrow, DetailsPopover } from "./design/DetailsPopover";
import { GapIcon } from "./design/left/LeftMark";
import { InlineMarkdown } from "./design/markdown/Markdown";
import { STABILITY } from "./design/stability/stability";
import { CapabilityStability } from "./design/catalog/CapabilityLabel";
import { Tip } from "./design/Tip";
import { docHref } from "./routes";
import { isReady, startedOf, type NotReady, type Readiness } from "./state";

/*
 * Readiness: whether people can use it yet, and if not, what it still needs.
 * Maturity says how far along the work is; readiness doesn't depend on it.
 * It's never in a level's color, since it isn't a level: Ready is in --ok,
 * with a check, and anything less in the text's own color, with a small ring
 * filled as far as how many of its started capabilities are ready.
 */

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/* Readiness in a few words: "Ready", "5 of 6 ready", or null with nothing started. */
export function readinessLabel(r: Readiness): string | null {
  const started = startedOf(r);
  if (!started) return null;
  return r.notReady.length ? `${r.ready.length} of ${started} ready` : "Ready";
}

/* What a not-ready capability still needs, in a line: "Reach Beta (now Alpha) · close 2 unacceptable gaps". */
export function needsLine(n: NotReady): string {
  const parts = [
    ...(n.belowBeta ? [`reach Beta (now ${n.capability.stability ? STABILITY[n.capability.stability].name : "a draft"})`] : []),
    ...(n.gaps.length ? [`close ${plural(n.gaps.length, "unacceptable gap", "unacceptable gaps")}`] : []),
  ].join(" · ");
  return parts.charAt(0).toUpperCase() + parts.slice(1);
}

/* A small ring, filled as far as `share`, 0 to 1. Decorative. */
function ShareRing({ share, size = 14 }: { share: number; size?: number }) {
  const r = (size - 3) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg className="readiness-ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={3} className="readiness-ring-track" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={3}
        strokeDasharray={`${c * share} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="readiness-ring-fill"
      />
    </svg>
  );
}

/*
 * How ready something is, beside its name or in a row: Ready, with a check,
 * or "5 of 6 ready", with its ring; large, as at the top of a page, Not
 * ready yet first. Its popover (hover, focus, or tap) breaks it down. With
 * nothing started, it says so. `of` says whose it is in the popover:
 * "Readiness for Maria". Inside something clickable, `inButton` opens the
 * popover on hover only, so a tap still reaches what it's in.
 */
export function ReadinessMark({ readiness, of, large = false, inButton = false }: { readiness: Readiness; of: string; large?: boolean; inButton?: boolean }) {
  const started = startedOf(readiness);
  const ready = isReady(readiness);
  if (!started)
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
        data-ready={ready || undefined}
        role="img"
        aria-label={`${of}: ${ready ? "ready" : `not ready yet, ${label}`}`}
        tabIndex={inButton ? undefined : 0}
      >
        {ready ? <CheckCircleRoundedIcon className="readiness-check" /> : <ShareRing share={readiness.ready.length / started} size={large ? 16 : 14} />}
        {large ? (
          <>
            <strong>{ready ? "Ready" : "Not ready yet"}</strong>
            <span className="readiness-count">{ready ? `all ${plural(started, "capability", "capabilities")}` : label}</span>
          </>
        ) : (
          <span>{label}</span>
        )}
      </span>
    </DetailsPopover>
  );
}

/* How many of a list a popover names before saying how many more. */
const SHOWN = 5;

/*
 * Readiness for its popover: whether it's ready, how many of its started
 * capabilities are, what the ones not ready yet still need, the drafts, and
 * what readiness is.
 */
function ReadinessDetails({ readiness, of }: { readiness: Readiness; of: string }) {
  const started = startedOf(readiness);
  const ready = isReady(readiness);
  const section = { mt: 1.5, pt: 1.5, borderTop: 1, borderColor: "divider" } as const;
  return (
    <DetailsCard card width={320}>
      <DetailsEyebrow>{of}</DetailsEyebrow>
      <Box sx={{ mt: 1, display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1 }}>
        <Box className="readiness-details-name" data-ready={ready || undefined} sx={{ fontSize: "1.12em", fontWeight: 700 }}>
          {ready ? "Ready" : "Not ready yet"}
        </Box>
        <Box sx={{ color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>
          {readiness.ready.length} of {started} ready
        </Box>
      </Box>
      <Box sx={{ mt: 0.75, color: "text.secondary" }}>
        {plural(started, "capability", "capabilities")} started
        {readiness.notStarted.length ? `, and ${plural(readiness.notStarted.length, "draft", "drafts")} not started` : ""}
      </Box>
      {readiness.notReady.length ? (
        <Box sx={section}>
          <Box sx={{ fontWeight: 600 }}>Still needs</Box>
          <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
            {readiness.notReady.slice(0, SHOWN).map((n) => (
              <Box key={n.capability.id} component="li" sx={{ py: 0.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                  <span>{n.capability.name}</span>
                  <CapabilityStability level={n.capability.stability} name={n.capability.name} focusable={false} />
                </Box>
                <Box sx={{ color: "text.secondary" }}>{needsLine(n)}</Box>
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
        A capability is ready when it&rsquo;s at Beta or GA, settled enough for real use, and no gap&rsquo;s risk on it is unacceptable.
        Drafts don&rsquo;t count either way.
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
  const ready = isReady(readiness);
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
        {n.belowBeta ? <li>Reach Beta (now {n.capability.stability ? STABILITY[n.capability.stability].name : "a draft"})</li> : null}
        {n.gaps.map((g) => (
          <li key={g.id}>
            <GapIcon sx={{ fontSize: 14 }} className="needs-gap-mark" />
            <span>
              Close{" "}
              <a href={docHref("gap", g.id)}>
                <InlineMarkdown text={g.name} />
              </a>
            </span>
          </li>
        ))}
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
