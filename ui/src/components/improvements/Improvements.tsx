// docqet:implements capability:improvements
import NorthRoundedIcon from "@mui/icons-material/NorthRounded";
import Box from "@mui/material/Box";
import { keyframes, type Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import type { ReactNode } from "react";
import { docHref, sectionHref } from "../../routes";
import { nextLevel, type Area, type Capability, type Feature, type Improvement, type Part, type Readiness } from "../../state";
import { readinessColor } from "../Readiness";
import { tabHref } from "../doc/DocPage";
import { LeftMark, gapKind } from "../left/LeftMark";
import { InlineMarkdown, plainText } from "../markdown/Markdown";
import { Section, Stat } from "../shell/layout";
import { STABILITY } from "../stability/stability";

/*
 * Improvements: what would make something more ready, and by how much, as
 * the server works them out with its readiness.
 *
 * They're shown by part, one level below what's being looked at: a
 * product's areas, an area's, persona's or initiative's features, a
 * feature's capabilities, and a capability's own steps, with any gap or
 * decision spanning more than one of them as a part of its own. Each part
 * has its potential, what readiness would be with all of it settled, and
 * its next step, the one thing in it that would raise readiness most, drawn
 * together on a bar of the readiness: now, where the next step lands, and
 * the potential. Parts are ordered by potential, most first, and each opens
 * its own improvements, so the reader can go down level by level.
 *
 * One at a time, each step is listed flat too: promoting a capability to
 * its next level raises maturity; closing a gap or answering a rated
 * decision lowers exposure.
 *
 * They're what could be done, not a finish line: nothing here says anything
 * is done, or has to be. With none, it says only that nothing written down
 * would raise readiness now. Each one's words are conditional, what it
 * would do, never an instruction.
 */

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/* How much readiness an improvement would add, as a whole percentage: "+14%", or "+<1%" for a sliver. */
export const gainText = (gain: number) => (gain < 0.5 ? "+<1%" : `+${Math.round(gain)}%`);

/* The tab on a page that lists its improvements. */
export const IMPROVEMENTS_TAB = "improvements";

/* What an improvement is about, in a few plain words, for a note or a label: "closing Calendar needs a mouse". */
export function improvementWords(i: Improvement): string {
  if (i.kind === "promote" && i.capability && i.to) return `${i.capability.name} reaching ${STABILITY[i.to].name}`;
  if (i.kind === "promote-feature" && i.feature) return `promoting the ${i.capabilities.length} capabilities in ${i.feature.name}`;
  if (i.kind === "promote-area" && i.area) return `promoting the ${i.capabilities.length} capabilities in ${i.area.name}`;
  if (i.kind === "close" && i.gap) return `closing ${plainText(i.gap.name)}`;
  if (i.kind === "answer" && i.decision) return `answering ${plainText(i.decision.decision.topic ?? i.decision.decision.question)}`;
  return "";
}

/* The quieter part of a line. */
function Faint({ children }: { children: ReactNode }) {
  return (
    <Box component="span" sx={{ color: "text.disabled" }}>
      {children}
    </Box>
  );
}

/* How the capabilities a promotion of several promotes move, most first: "7 Prototype to Alpha, 2 Alpha to Beta". */
function levelSteps(capabilities: Capability[]): string {
  const steps = new Map<string, number>();
  for (const c of capabilities) {
    const to = nextLevel(c.stability);
    if (c.stability && to) {
      const step = `${STABILITY[c.stability].name} to ${STABILITY[to].name}`;
      steps.set(step, (steps.get(step) ?? 0) + 1);
    }
  }
  return [...steps]
    .sort((a, b) => b[1] - a[1])
    .map(([step, n]) => `${n} ${step}`)
    .join(", ");
}

/* Promoting: an arrow up, in the text's color, apart from gaps' amber and decisions' violet. */
function PromoteMark() {
  return (
    <Box component="span" aria-hidden sx={{ display: "inline-flex", flex: "none", color: "text.primary" }}>
      <NorthRoundedIcon sx={{ fontSize: 14 }} />
    </Box>
  );
}

/* What a page or a part is about, which an improvement needn't name. */
type Here = Capability | Feature | Area;

/* What an improvement does, as a line: its mark, then, conditionally, what would happen. `here` is the capability, feature or area the page or part is about, which needn't be named. */
function ImprovementWhat({ improvement: i, here }: { improvement: Improvement; here?: Here }) {
  const several = i.kind === "promote-feature" ? i.feature : i.kind === "promote-area" ? i.area : null;
  if (several)
    return (
      <>
        <PromoteMark />
        <span>
          Promoting{" "}
          {several === here ? (
            `all ${i.capabilities.length} of its capabilities`
          ) : (
            <>
              <a href={docHref(i.kind === "promote-feature" ? "feature" : "area", several.id)}>{several.name}</a>&rsquo;s {i.capabilities.length} capabilities
            </>
          )}
          <Faint> · each to its next level: {levelSteps(i.capabilities)}</Faint>
        </span>
      </>
    );
  if (i.kind === "promote" && i.capability && i.to)
    return (
      <>
        <PromoteMark />
        <span>
          {i.capability === here ? (
            "Reaching"
          ) : (
            <>
              <a href={docHref("capability", i.capability.id)}>{i.capability.name}</a> reaching
            </>
          )}{" "}
          {STABILITY[i.to].name}
          {i.from ? <Faint> · now {STABILITY[i.from].name}</Faint> : null}
        </span>
      </>
    );
  if (i.kind === "close" && i.gap) {
    const kind = gapKind(i.gap);
    return (
      <>
        <LeftMark kind={kind} size={14} />
        <span>
          Closing{" "}
          <a href={docHref("gap", i.gap.id)}>
            <InlineMarkdown text={i.gap.name} />
          </a>
          <Faint> · {kind === "technical-gap" ? "technical" : "product"} gap</Faint>
        </span>
      </>
    );
  }
  if (i.kind === "answer" && i.decision) {
    const { decision, on } = i.decision;
    return (
      <>
        <LeftMark kind="decision" size={14} />
        <span>
          Answering{" "}
          <a href={docHref(on.kind, on.doc.id)}>
            <InlineMarkdown text={decision.topic ?? decision.question} />
          </a>
          <Faint> · open decision{on.doc === here ? "" : ` on ${on.doc.name}`}</Faint>
        </span>
      </>
    );
  }
  return null;
}

/* Why it would help, quieter: which figure it moves and from what to what, where, and the quarter it would reach. */
function improvementWhy(i: Improvement, readiness: Readiness): string {
  const pct = (n: number) => `${Math.round(n)}%`;
  const parts: string[] = [];
  if (i.kind === "promote" || i.kind === "promote-feature" || i.kind === "promote-area") {
    parts.push(`would raise maturity from ${pct(readiness.maturity ?? 0)} to ${pct(i.maturity)}`);
    const before = readiness.exposure.percent ?? 0;
    if (Math.round(i.exposure) !== Math.round(before)) parts.push(`exposure would be ${pct(i.exposure)}`);
  } else {
    parts.push(`would lower exposure from ${pct(readiness.exposure.percent ?? 0)} to ${pct(i.exposure)}`);
    if (i.capabilities.length > 1) parts.push(`on ${plural(i.capabilities.length, "capability", "capabilities")}`);
  }
  if (i.band) parts.push(`would make it ${i.band.name}`);
  return parts.join(" · ");
}

const rowSx: SystemStyleObject<Theme> = {
  display: "grid",
  gridTemplateColumns: "64px minmax(0, 1fr)",
  alignItems: "baseline",
  gap: "2px 12px",
  py: 1,
  borderBottom: 1,
  borderColor: "divider",
};

const whatSx: SystemStyleObject<Theme> = { display: "flex", alignItems: "flex-start", gap: 0.75, "& > :first-of-type": { mt: "3px" } };

function ImprovementRow({ improvement, readiness, here }: { improvement: Improvement; readiness: Readiness; here?: Here }) {
  return (
    <Box component="li" sx={rowSx}>
      <Box
        component="strong"
        sx={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "text.primary" }}
        title="How much readiness it would add"
      >
        {gainText(improvement.gain)}
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
        <Box sx={whatSx}>
          <ImprovementWhat improvement={improvement} here={here} />
        </Box>
        <Box component="span" sx={{ fontSize: 12.5, color: "text.secondary" }}>
          {improvementWhy(improvement, readiness)}
        </Box>
      </Box>
    </Box>
  );
}

/*
 * A readiness's improvements one at a time, most first: each with how much
 * readiness it would add, what it would take, and which figure it would
 * move. Past `limit`, the rest are folded. With none, a line saying so, and
 * never that anything is done.
 */
export function ImprovementRows({ readiness, limit = 8, here }: { readiness: Readiness; limit?: number; here?: Here }) {
  const { improvements } = readiness;
  const lineSx: SystemStyleObject<Theme> = { fontSize: 13.5, color: "text.secondary" };
  if (readiness.percent === null)
    return (
      <Box component="p" sx={lineSx}>
        Nothing started yet, so there&rsquo;s no readiness to raise.
      </Box>
    );
  if (!improvements.length)
    return (
      <Box component="p" sx={lineSx}>
        Nothing written down would raise its readiness now.
      </Box>
    );
  const rest = improvements.slice(limit);
  return (
    <Box sx={listSx}>
      <Box component="ul" sx={{ display: "flex", flexDirection: "column" }}>
        {improvements.slice(0, limit).map((i, n) => (
          <ImprovementRow key={n} improvement={i} readiness={readiness} here={here} />
        ))}
      </Box>
      {rest.length ? (
        <details>
          <Box component="summary" sx={{ cursor: "pointer", color: "text.secondary" }}>
            {plural(rest.length, "more improvement", "more improvements")}, each adding less
          </Box>
          <Box component="ul" sx={{ display: "flex", flexDirection: "column" }}>
            {rest.map((i, n) => (
              <ImprovementRow key={n} improvement={i} readiness={readiness} here={here} />
            ))}
          </Box>
        </details>
      ) : null}
    </Box>
  );
}

/* A list of improvements or parts, its links in the text's color. */
const listSx: SystemStyleObject<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 1,
  fontSize: 13.5,
  "& a": { color: "text.primary" },
  "& a:hover": { color: "primary.main" },
};

/* ——— Parts ——— */

const pct = (n: number) => `${Math.round(n)}%`;

/* The step a part would take next, if any: the one that would raise readiness most. */
export function bestStep(readiness: Readiness): Improvement | null {
  let best: Improvement | null = null;
  for (const a of readiness.parts) if (a.next && (!best || a.next.gain > best.gain)) best = a.next;
  return best ?? readiness.improvements[0] ?? null;
}

/* What a part is, which its step needn't name. */
const hereOf = (a: Part): Here | undefined => a.area ?? a.feature ?? a.capability ?? undefined;

/* Whether a part is one step, rather than an area, feature or capability with steps in it. */
const isStep = (a: Part) => a.kind === "gap" || a.kind === "decision" || a.kind === "promotion";

const PART_KINDS = { area: "Area", feature: "Feature", capability: "Capability" } as const;

/* Where a part's own improvements are: the Improvements page, for it. */
function partHref(a: Part): string | null {
  const doc = a.area ?? a.feature ?? a.capability;
  return doc && !isStep(a) ? sectionHref("improvements", { for: `${a.kind}:${doc.id}` }) : null;
}

/*
 * The next step's part of the bar glowing while its row is hovered or
 * focused: the change the step would make to readiness, lit in the accent,
 * since readiness's own color is near grey while it's low.
 */
const glow = (t: Theme) => keyframes`
  0%, 100% { box-shadow: 0 0 2px 0 color-mix(in srgb, ${t.vars.palette.primary.main} 40%, transparent); }
  50% { box-shadow: 0 0 12px 3px color-mix(in srgb, ${t.vars.palette.primary.main} 65%, transparent); }
`;

/*
 * A readiness, and how far a part could raise it, as a bar 0 to 100: now,
 * solid in readiness's color; where its next step would land, the same
 * color, lighter; and its potential, faint and dashed. The quarters' edges
 * are ticks, so a step into Partial, Viable or Ready shows. The row it's in
 * makes the next step glow while hovered or focused, and its label says it
 * all for screen readers.
 */
function RiseBar({ now, next, potential, label }: { now: number; next: number | null; potential: number; label: string }) {
  const at = (n: number) => `${Math.min(Math.max(n, 0), 100)}%`;
  const lands = next ?? now;
  const seg: SystemStyleObject<Theme> = { position: "absolute", top: 0, bottom: 0 };
  return (
    <Box
      role="img"
      aria-label={label}
      sx={{ position: "relative", height: 8, borderRadius: "4px", bgcolor: (t) => `color-mix(in srgb, ${t.vars.palette.text.primary} 8%, transparent)` }}
    >
      {[25, 50, 75].map((q) => (
        <Box key={q} aria-hidden sx={{ ...seg, left: at(q), width: "1px", top: -2, bottom: -2, bgcolor: "divider", zIndex: 0 }} />
      ))}
      {potential > lands ? (
        <Box
          aria-hidden
          className="rise-potential"
          sx={{
            ...seg,
            left: at(lands),
            width: at(potential - lands),
            borderRadius: "0 4px 4px 0",
            border: "1px dashed",
            borderColor: (t) => `color-mix(in srgb, ${t.vars.palette.text.primary} 30%, transparent)`,
            bgcolor: (t) => `color-mix(in srgb, ${t.vars.palette.text.primary} 6%, transparent)`,
            transition: "border-color 150ms",
          }}
        />
      ) : null}
      {next !== null && next > now ? (
        <Box
          aria-hidden
          className="rise-next"
          sx={{
            ...seg,
            left: at(now),
            width: at(next - now),
            borderRadius: "0 4px 4px 0",
            bgcolor: (t) => `color-mix(in srgb, ${readinessColor(next)(t)} 55%, transparent)`,
            transition: "background-color 200ms",
            zIndex: 1,
          }}
        />
      ) : null}
      <Box aria-hidden sx={{ ...seg, left: 0, width: at(now), borderRadius: "4px", bgcolor: readinessColor(now), zIndex: 2 }} />
    </Box>
  );
}

/* While a row is hovered or focused, its next step lights up in the accent and glows, with its figure, and its potential firms up; without motion, the glow holds still. */
const partRowSx: SystemStyleObject<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 0.75,
  py: 1.25,
  px: 1,
  mx: -1,
  borderBottom: 1,
  borderColor: "divider",
  borderRadius: "6px",
  transition: "background-color 150ms",
  "&:hover, &:focus-within": {
    bgcolor: (t) => `color-mix(in srgb, ${t.vars.palette.text.primary} 2.5%, transparent)`,
    "& .rise-next": {
      bgcolor: "primary.main",
      animation: (t: Theme) => `${glow(t)} 1.6s ease-in-out infinite`,
      "@media (prefers-reduced-motion: reduce)": {
        animation: "none",
        boxShadow: (t: Theme) => `0 0 10px 2px color-mix(in srgb, ${t.vars.palette.primary.main} 55%, transparent)`,
      },
    },
    "& .rise-next-figure": { color: "primary.main" },
    "& .rise-potential": { borderColor: "text.secondary" },
  },
};

/* A part's figures at the right: where its next step lands, and its potential. */
function PartFigures({ part, next }: { part: Part; next: Improvement | null }) {
  const step = isStep(part);
  return (
    <Box component="span" sx={{ ml: "auto", display: "inline-flex", alignItems: "baseline", gap: 1, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
      {next ? (
        <Box component="span" sx={{ fontSize: 12.5, color: "text.secondary" }} title="Where readiness would be after the next step">
          {step ? "to " : "next "}
          <Box component="strong" className="rise-next-figure" sx={{ color: "text.primary", fontWeight: 650, transition: "color 150ms" }}>
            {pct(next.readiness)}
          </Box>{" "}
          <Faint>({gainText(next.gain)})</Faint>
        </Box>
      ) : null}
      {!step ? (
        <Box
          component="span"
          sx={{ fontSize: 12.5, color: "text.secondary" }}
          title="What readiness would be with all of it settled: every capability at GA, nothing open"
        >
          · potential{" "}
          <Box component="strong" sx={{ fontSize: 14, color: "text.primary", fontWeight: 700 }}>
            up to {pct(part.potential)}
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}

/* What a part is, as its row's heading: an area, feature or capability, linking to its own improvements, or the step it is. */
function PartHead({ part, here }: { part: Part; here?: Here }) {
  if (isStep(part) && part.next)
    return (
      <Box component="span" sx={whatSx}>
        <ImprovementWhat improvement={part.next} here={here} />
      </Box>
    );
  const doc = part.area ?? part.feature ?? part.capability;
  const href = partHref(part);
  if (!doc) return null;
  return (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "baseline", flexWrap: "wrap", gap: "2px 8px", minWidth: 0 }}>
      <Box component="span" sx={{ fontSize: 11, fontWeight: 650, letterSpacing: "0.06em", textTransform: "uppercase", color: "text.disabled" }}>
        {PART_KINDS[part.kind as keyof typeof PART_KINDS]}
      </Box>
      {href ? (
        <Box component="a" href={href} sx={{ fontWeight: 600 }}>
          {doc.name}
        </Box>
      ) : (
        <strong>{doc.name}</strong>
      )}
      <Faint>{part.capability?.stability ? STABILITY[part.capability.stability].name : plural(part.capabilities.length, "capability", "capabilities")}</Faint>
    </Box>
  );
}

/*
 * One part: what it is, where its next step would land and its potential,
 * the bar, then its next step, or, for a step, what it would change.
 */
function PartRow({ part, readiness, here }: { part: Part; readiness: Readiness; here?: Here }) {
  const now = readiness.percent ?? 0;
  const { next } = part;
  const step = isStep(part);
  const label = step
    ? `Readiness ${pct(now)}, ${next ? `to ${pct(next.readiness)} with this step` : ""}`
    : `Readiness ${pct(now)}${next ? `, ${pct(next.readiness)} after its next step` : ""}, up to ${pct(part.potential)} with all of it settled`;
  return (
    <Box component="li" sx={partRowSx}>
      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "4px 12px" }}>
        <PartHead part={part} here={here} />
        <PartFigures part={part} next={next} />
      </Box>
      <RiseBar now={now} next={next?.readiness ?? null} potential={part.potential} label={label} />
      <Box component="span" sx={{ fontSize: 12.5, color: "text.secondary" }}>
        {step && next ? (
          improvementWhy(next, readiness)
        ) : next ? (
          <Box component="span" sx={[whatSx, { display: "inline-flex", flexWrap: "wrap", columnGap: 0.75 }]}>
            <Faint>Next:</Faint>
            <ImprovementWhat improvement={next} here={hereOf(part)} />
          </Box>
        ) : (
          "No one step raises it alone: what's open on it has to be closed together."
        )}
      </Box>
    </Box>
  );
}

/*
 * Where a readiness could rise, by part, most first: each with its bar, its
 * next step and its potential. Past `limit`, the rest are folded. With
 * none, a line saying so, and never that anything is done.
 */
export function PartRows({ readiness, limit = 6, here }: { readiness: Readiness; limit?: number; here?: Here }) {
  const lineSx: SystemStyleObject<Theme> = { fontSize: 13.5, color: "text.secondary" };
  if (readiness.percent === null)
    return (
      <Box component="p" sx={lineSx}>
        Nothing started yet, so there&rsquo;s no readiness to raise.
      </Box>
    );
  if (!readiness.parts.length)
    return (
      <Box component="p" sx={lineSx}>
        Nothing written down would raise its readiness now.
      </Box>
    );
  const shown = readiness.parts.slice(0, limit);
  const rest = readiness.parts.slice(limit);
  return (
    <Box sx={listSx}>
      <Box component="ul" sx={{ display: "flex", flexDirection: "column" }}>
        {shown.map((a, n) => (
          <PartRow key={n} part={a} readiness={readiness} here={here} />
        ))}
      </Box>
      {rest.length ? (
        <details>
          <Box component="summary" sx={{ cursor: "pointer", color: "text.secondary" }}>
            {plural(rest.length, "more part", "more parts")}, each with less potential
          </Box>
          <Box component="ul" sx={{ display: "flex", flexDirection: "column" }}>
            {rest.map((a, n) => (
              <PartRow key={n} part={a} readiness={readiness} here={here} />
            ))}
          </Box>
        </details>
      ) : null}
    </Box>
  );
}

/*
 * Improvements as a figure, in a table's cell or a tile: what the next step
 * that would add most adds, and how many more parts there are, "+14% · 3
 * more"; a quiet dash with none, never "done".
 */
export function ImprovementsFigure({ readiness }: { readiness: Readiness }) {
  const top = bestStep(readiness);
  const more = Math.max(readiness.parts.length - 1, 0);
  if (!top)
    return (
      <Box component="span" sx={{ color: "text.disabled" }} aria-label="No improvements">
        —
      </Box>
    );
  return (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "baseline", gap: 0.75, whiteSpace: "nowrap" }} title={`Most from ${improvementWords(top)}`}>
      <Box component="strong" sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums", color: "text.primary" }}>
        {gainText(top.gain)}
      </Box>
      {more ? (
        <Box component="span" sx={{ fontSize: "0.9em", color: "text.secondary" }}>
          · {more} more
        </Box>
      ) : null}
    </Box>
  );
}

/* Improvements as a figure in a page's header: the most one step would add, and what it is. It links to the tab that lists them all. */
export function ImprovementsStat({ readiness }: { readiness: Readiness }) {
  const top = bestStep(readiness);
  return (
    <Stat
      label="Improvements"
      term="improvement"
      value={top ? <ImprovementsFigure readiness={readiness} /> : readiness.percent === null ? "Not started" : "None now"}
      note={
        top
          ? `Most from ${improvementWords(top)}`
          : readiness.percent === null
            ? "Nothing started to make more ready"
            : "Nothing written down would raise readiness now"
      }
      href={top ? tabHref(IMPROVEMENTS_TAB) : undefined}
    />
  );
}

/* What a list of parts shows: parts with their potential, or, at a capability, its steps. */
export function partsNote(readiness: Readiness): string {
  return readiness.parts.length && readiness.parts.every(isStep)
    ? "Each step by where it would take readiness, most first. The bar shows readiness now and where the step would take it. What's worth doing is yours to judge."
    : "Where it could become more ready, by potential: how ready it could be with all of each settled. The bar shows readiness now, where the next step would take it, and the potential. Open one to see what's in it. What's worth doing is yours to judge.";
}

/* On a first tab, the few parts with most potential, with a way to all of them. */
export function ImprovementsSection({ readiness, here, limit = 3 }: { readiness: Readiness; here?: Here; limit?: number }) {
  const n = readiness.parts.length;
  return (
    <Section
      id="improvements"
      title="Improvements"
      term="improvement"
      note={partsNote(readiness)}
      aside={n > limit ? <a href={tabHref(IMPROVEMENTS_TAB)}>See all {n}</a> : null}
    >
      <PartRows readiness={readiness} limit={limit} here={here} />
    </Section>
  );
}

/* The Improvements tab: every part, most first. */
export function ImprovementsList({ readiness, here }: { readiness: Readiness; here?: Here }) {
  return (
    <Section title="Improvements" term="improvement" count={readiness.parts.length || undefined} note={partsNote(readiness)}>
      <PartRows readiness={readiness} limit={50} here={here} />
    </Section>
  );
}
