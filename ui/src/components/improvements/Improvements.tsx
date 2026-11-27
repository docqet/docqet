// docqet:implements capability:improvements
import NorthRoundedIcon from "@mui/icons-material/NorthRounded";
import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import type { ReactNode } from "react";
import { docHref } from "../../routes";
import type { Capability, Improvement, Readiness } from "../../state";
import { tabHref } from "../doc/DocPage";
import { LeftMark, gapKind } from "../left/LeftMark";
import { InlineMarkdown, plainText } from "../markdown/Markdown";
import { Section, Stat } from "../shell/layout";
import { STABILITY } from "../stability/stability";

/*
 * Improvements: what would make something more ready, and by how much, as
 * the server works them out with its readiness. Promoting a capability to
 * its next level raises maturity; closing a gap or answering a rated
 * decision lowers exposure. They're ordered by how much each would raise
 * readiness, most first.
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

/* What an improvement does, as a line: its mark, then, conditionally, what would happen. `here` is the capability the page is about, which needn't be named. */
function ImprovementWhat({ improvement: i, here }: { improvement: Improvement; here?: Capability }) {
  if (i.kind === "promote" && i.capability && i.to)
    return (
      <>
        {/* Promoting: an arrow up, in the text's color, apart from gaps' amber and decisions' violet. */}
        <Box component="span" aria-hidden sx={{ display: "inline-flex", flex: "none", color: "text.primary" }}>
          <NorthRoundedIcon sx={{ fontSize: 14 }} />
        </Box>
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
  if (i.kind === "promote") {
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

function ImprovementRow({ improvement, readiness, here }: { improvement: Improvement; readiness: Readiness; here?: Capability }) {
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
 * A readiness's improvements, most first: each with how much readiness it
 * would add, what it would take, and which figure it would move. Past
 * `limit`, the rest are folded. With none, a line saying so, and never that
 * anything is done.
 */
export function ImprovementRows({ readiness, limit = 8, here }: { readiness: Readiness; limit?: number; here?: Capability }) {
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
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, fontSize: 13.5, "& a": { color: "text.primary" }, "& a:hover": { color: "primary.main" } }}>
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

/*
 * Improvements as a figure, in a table's cell or a tile: what the one that
 * would add most adds, and how many more there are, "+14% · 7 more"; a
 * quiet dash with none, never "done".
 */
export function ImprovementsFigure({ readiness }: { readiness: Readiness }) {
  const [top, ...rest] = readiness.improvements;
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
      {rest.length ? (
        <Box component="span" sx={{ fontSize: "0.9em", color: "text.secondary" }}>
          · {rest.length} more
        </Box>
      ) : null}
    </Box>
  );
}

/* Improvements as a figure in a page's header: the most one would add, and what it is. It links to the tab that lists them all. */
export function ImprovementsStat({ readiness }: { readiness: Readiness }) {
  const [top] = readiness.improvements;
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

/* On a first tab, the few improvements that would add most, with a way to all of them. */
export function ImprovementsSection({ readiness, here, limit = 3 }: { readiness: Readiness; here?: Capability; limit?: number }) {
  const n = readiness.improvements.length;
  return (
    <Section
      id="improvements"
      title="Improvements"
      term="improvement"
      note="What would make it more ready, most first. What's worth doing is yours to judge."
      aside={n > limit ? <a href={tabHref(IMPROVEMENTS_TAB)}>See all {n}</a> : null}
    >
      <ImprovementRows readiness={readiness} limit={limit} here={here} />
    </Section>
  );
}

/* The Improvements tab: every improvement, most first. */
export function ImprovementsList({ readiness, here }: { readiness: Readiness; here?: Capability }) {
  return (
    <Section
      title="Improvements"
      term="improvement"
      count={readiness.improvements.length || undefined}
      note="What would raise readiness, by how much each would add, most first. They're what could be done, not a finish line."
    >
      <ImprovementRows readiness={readiness} limit={50} here={here} />
    </Section>
  );
}
