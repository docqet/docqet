import { type ReactNode } from "react";
import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import { InlineMarkdown, Markdown, inlineCodeSx, linkButtonSx, plainText, type Go } from "./markdown/Markdown";
import { LeftItem, LeftList, LeftMark } from "./left/LeftMark";
import { GapRiskMark } from "./risk/RiskScore";
import { STABILITY } from "./stability/stability";
import { docHref, type DocKind } from "../routes";
import {
  affectedBy,
  conceptLinked,
  subjectOf,
  type Affected,
  type Contribution,
  type Decision,
  type DocqetState,
  type HeldDecision,
  type Tradeoff,
} from "../state";

/*
 * What a doc says, as the spec splits it: its frontmatter fields, which have a
 * set meaning and so a set place, here; and its body, free Markdown that's
 * shown apart from them, as more about it (see design/markdown).
 */

export type { Go } from "./markdown/Markdown";

/* A small outlined pill naming what something is, such as "Rule" or a quality and level. */
export const tagSx: SystemStyleObject<Theme> = {
  px: "7px",
  fontSize: 11,
  fontWeight: 600,
  lineHeight: "18px",
  color: "text.secondary",
  border: 1,
  borderColor: "surface.borderStrong",
  borderRadius: 999,
};

/* A name standing out in a list, such as a decision's topic or what a concept isn't to be confused with. */
const nameSx: SystemStyleObject<Theme> = { fontWeight: 650, color: "text.primary", overflowWrap: "anywhere" };

/* A text value from frontmatter, as Markdown, with links resolved from the doc it's in, with no space around it. */
export function Text({ from, text, go }: { from: Contribution; text: string; go: Go }) {
  return <Markdown text={text} from={from} go={go} sx={{ mt: 0 }} />;
}

/*
 * Open decisions, each its question under its topic, then what waits on its
 * answer. A decision has no risk: a question doesn't happen to anyone. Where
 * it affects gaps, the stakes are the riskiest of them: what's waiting on it,
 * not a risk of its own.
 */
export function DecisionList({ from, decisions, go }: { from: Contribution; decisions: Decision[]; go: Go }) {
  return (
    <LeftList>
      {decisions.map((d, i) => (
        <LeftItem key={i} kind="decision">
          {d.topic ? (
            <Box component="span" sx={nameSx}>
              {d.topic}
            </Box>
          ) : null}
          <Text from={from} text={d.question} go={go} />
          <DecisionAffects state={go.state} decision={d} />
        </LeftItem>
      ))}
    </LeftList>
  );
}

/* What something affects, labelled, in small quiet type, each item side by side, wrapping. */
const affectsSx: SystemStyleObject<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "baseline",
  gap: "4px 14px",
  fontSize: 12.5,
  color: "text.secondary",
};
const affectsLabelSx: SystemStyleObject<Theme> = {
  fontSize: 10.5,
  fontWeight: 650,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "text.disabled",
};
const affectSx: SystemStyleObject<Theme> = { display: "inline-flex", alignItems: "baseline", gap: 0.75, "& code": inlineCodeSx };

/* What waits on a decision's answer, and, where that's gaps, the riskiest of their risks. */
function DecisionAffects({ state, decision }: { state: DocqetState; decision: Decision }) {
  const affected = affectedBy(state, decision);
  if (!affected.length) return null;
  const riskiest = affected.flatMap((a) => (a.kind === "gap" ? [a.gap.risk] : [])).sort((a, b) => b.score - a.score)[0];
  return (
    <Box sx={[affectsSx, { mt: 0.5 }]}>
      <Box component="span" sx={affectsLabelSx}>
        Affects
      </Box>
      {affected.map((a, i) => (
        <AffectedItem key={i} item={a} />
      ))}
      {riskiest ? (
        <Box component="span" sx={[affectSx, { alignItems: "center" }]}>
          <Box component="span" sx={affectsLabelSx}>
            Stakes
          </Box>
          <GapRiskMark risk={riskiest} on={riskiest.on[0] ?? null} />
        </Box>
      ) : null}
    </Box>
  );
}

/* Where a tradeoff is shown: with what's decided, on the page of what it's on. */
export const tradeoffHref = (t: Tradeoff) => {
  const { type, id } = subjectOf(t);
  return docHref(type as DocKind, id, "decided");
};

/* One affected item: its tag, then what it is. */
function Affect({ tag, children }: { tag: ReactNode; children: ReactNode }) {
  return (
    <Box component="span" sx={affectSx}>
      <Box component="span" sx={[tagSx, { flexShrink: 0 }]}>
        {tag}
      </Box>
      {children}
    </Box>
  );
}

/*
 * One thing a gap, tradeoff or decision affects, as a tag and what it is: a
 * expected outcome, with its quality and level; a rule; or a gap or
 * tradeoff, by name, linked.
 */
export function AffectedItem({ item }: { item: Affected }) {
  const link = (href: string, name: string) => (
    <Box component="a" href={href} sx={linkButtonSx}>
      {name}
    </Box>
  );
  switch (item.kind) {
    case "outcome":
      return (
        <Affect
          tag={
            <>
              {item.quality.name} · {STABILITY[item.outcome.level].name}
            </>
          }
        >
          {item.outcome.text}
        </Affect>
      );
    case "rule":
      return <Affect tag="Rule">{link(docHref("rule", item.rule.id), item.rule.name)}</Affect>;
    case "gap":
      return <Affect tag="Gap">{link(docHref("gap", item.gap.id), plainText(item.gap.name))}</Affect>;
    case "tradeoff":
      return <Affect tag="Tradeoff">{link(tradeoffHref(item.tradeoff), plainText(item.tradeoff.name))}</Affect>;
  }
}

/* Open decisions, as what a gap waits on or what reopened a tradeoff, one to a line. */
export function HeldDecisions({ held }: { held: HeldDecision[] }) {
  return (
    <Box component="ul" sx={{ display: "grid", gap: 0.75, minWidth: 0 }}>
      {held.map((h, i) => (
        <li key={i}>
          <HeldDecisionLine held={h} />
        </li>
      ))}
    </Box>
  );
}

/* An open decision, as what a gap waits on or what reopened a tradeoff: its mark, its question, and the doc it's held on, linked. */
export function HeldDecisionLine({ held }: { held: HeldDecision }) {
  return (
    <Box
      component="span"
      sx={{ display: "inline-flex", flexWrap: "wrap", alignItems: "baseline", gap: "2px 8px", minWidth: 0, "& > :first-of-type": { alignSelf: "center" } }}
    >
      <LeftMark kind="decision" size={14} decorative />
      <Box component="span" sx={{ minWidth: 0, color: "text.primary", fontWeight: 400 }}>
        <InlineMarkdown text={held.decision.question} />
      </Box>
      <Box
        component="span"
        sx={{
          fontSize: 12.5,
          color: "text.secondary",
          "& :where(a)": { color: "text.secondary", textDecoration: "none", "&:hover": { color: "primary.main" } },
        }}
      >
        on <a href={docHref(held.on.kind, held.on.doc.id, "left")}>{held.on.doc.name}</a>
      </Box>
    </Box>
  );
}

/* A labelled field: what it is, then what it says. `wide` takes a whole row where fields sit side by side. */
export type Facet = { label: string; node: ReactNode; wide?: boolean };

/*
 * The fields a contribution has, by its type, labelled, in the spec's order:
 * part of what it is, so they show with its name and description, never with its
 * body. Open decisions aren't among them: they're shown with what's left.
 */
export function facets(kind: string, f: Contribution, go: Go): Facet[] {
  const out: Facet[] = [];
  const text = (label: string, value: string | null | undefined, wide = false) => {
    if (value?.trim()) out.push({ label, node: <Text from={f} text={value} go={go} />, wide });
  };
  if (kind === "rule") {
    text("Why", f.why);
  } else if (kind === "concept") {
    if (f.confusedWith?.length)
      out.push({
        label: "Not to be confused with",
        wide: true,
        node: (
          <Box component="ul" sx={{ display: "grid", gap: 1, minWidth: 0 }}>
            {f.confusedWith.map((c, i) => {
              const to = c.concept ? conceptLinked(go.state, c.concept, f.domain) : undefined;
              return (
                <Box component="li" key={i} sx={{ display: "grid", gap: "2px", minWidth: 0 }}>
                  {to ? (
                    <Box
                      component="button"
                      type="button"
                      onClick={() => go.onConcept(to.id)}
                      sx={[linkButtonSx, nameSx, { justifySelf: "start", textAlign: "left" }]}
                    >
                      {to.name}
                    </Box>
                  ) : (
                    <Box component="strong" sx={nameSx}>
                      {c.term ?? c.concept}
                    </Box>
                  )}
                  <Text from={f} text={c.summary} go={go} />
                </Box>
              );
            })}
          </Box>
        ),
      });
  }
  return out;
}

/*
 * Fields as cards side by side, each as wide as it needs, a wide one taking a
 * whole row; or, with `stacked`, as in the side panel, one under another,
 * with no cards.
 */
export function Facets({ items, stacked = false }: { items: Facet[]; stacked?: boolean }) {
  if (!items.length) return null;
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: stacked ? "minmax(0, 1fr)" : "repeat(auto-fill, minmax(min(260px, 100%), 1fr))",
        gap: stacked ? 1.75 : 1.5,
        mt: stacked ? 1.75 : undefined,
        minWidth: 0,
      }}
    >
      {items.map((item) => (
        <Box
          key={item.label}
          sx={[
            { minWidth: 0, "& .markdown": { fontSize: stacked ? 13.5 : 14 } },
            !stacked && {
              px: 2,
              py: 1.75,
              bgcolor: (t) => `color-mix(in srgb, ${t.vars.palette.text.primary} 2%, transparent)`,
              border: 1,
              borderColor: "divider",
              borderRadius: "10px",
            },
            !stacked && item.wide === true && { gridColumn: "1 / -1" },
          ]}
        >
          <Box component="span" sx={{ display: "block", mb: stacked ? 0.75 : 1, typography: "overline", color: "text.disabled" }}>
            {item.label}
          </Box>
          {item.node}
        </Box>
      ))}
    </Box>
  );
}
