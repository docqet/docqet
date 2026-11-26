import { DecisionList } from "../Fields";
import { LeftLabel } from "../left/LeftMark";
import { NAMES } from "../names";
import { TechnicalLink } from "../Technical";
import { DomainIcon } from "../names";
import {
  inRiskOrder,
  openDecisions,
  type Readiness,
  type Capability,
  type Doc,
  type DocketState,
  type Gap,
  type RiskAcross,
  type TechnicalDoc,
} from "../../state";
import { someOf } from "../../model";
import { GapRows, LeftFigure } from "../risk/GapRows";
import { docHref } from "../../routes";
import { Section, Stat } from "../shell/layout";
import Box from "@mui/material/Box";
import { type DocGo } from "./DocPage";
import { tabHref } from "./DocPage";
import { CapabilityLink, Crumb, cardSx } from "./DocPage";

/* Something that holds open decisions, with what it is. */
export type Holder = { kind: "domain" | "feature" | "capability" | "mechanism" | "component"; doc: Doc };

/* A gap, and for a technical one under a capability, the mechanism or component it's on. */
export type LeftGap = { gap: Gap; on?: TechnicalDoc };

/* What's left about something: what holds open decisions, how many, and its gaps, each once, riskiest first. */
export type LeftHere = { holders: Holder[]; decisions: number; gaps: LeftGap[]; risk: RiskAcross<Gap> };

/*
 * What's left across some capabilities, with the open decisions of `own`,
 * the feature or domain they're under, first. A technical gap on what several
 * of them are built on is one gap, so it counts once. With `technical` false,
 * as for a persona, only what someone using the product would notice. Its
 * risk is from `readiness`, theirs, whose gaps are every gap on them, each
 * scored on them.
 */
export function leftAcross(capabilities: Capability[], readiness: Readiness, own?: Holder, technical = true): LeftHere {
  const holders = [...(own ? [own] : []), ...capabilities.map((doc): Holder => ({ kind: "capability", doc }))].filter((h) => openDecisions(h.doc).length);
  const gaps = new Map<string, LeftGap>();
  for (const c of capabilities) {
    for (const gap of c.left.gaps) gaps.set(gap.id, { gap });
    if (technical) for (const { gap, on } of c.left.technical) gaps.set(gap.id, { gap, on });
  }
  return {
    holders,
    decisions: holders.reduce((n, h) => n + openDecisions(h.doc).length, 0),
    gaps: inRiskOrder([...gaps.values()], (g) => g.gap),
    risk: someOf(readiness.gaps, (g) => gaps.has(g.id)),
  };
}

export const leftTotal = (left: LeftHere) => left.decisions + left.gaps.length;

/* What's left, as a figure in the header: the gap and decision marks with their counts, and the highest risk. It links to the tab that lists them. */
export function LeftStat({ left, of }: { left: LeftHere; of: string }) {
  const n = leftTotal(left);
  return (
    <Stat
      label="What's left"
      term="gap"
      value={<LeftFigure gaps={left.gaps.map((g) => g.gap)} decisions={left.decisions} risk={left.risk} of={of} />}
      tone={n ? undefined : "ok"}
      href={tabHref("left")}
    />
  );
}

/* What a decision is on, as a link to its page. */
export function HolderLink({ holder }: { holder: Holder }) {
  const { kind, doc } = holder;
  if (kind === "mechanism" || kind === "component") return <TechnicalLink doc={doc as TechnicalDoc} />;
  if (kind === "capability") return <CapabilityLink capability={doc as Capability} tab="left" />;
  return (
    <Crumb href={docHref(kind, doc.id)} icon={kind === "domain" ? <DomainIcon size={14} /> : NAMES[kind].icon}>
      {doc.name}
    </Crumb>
  );
}

/* A doc's open decisions, from each of its sources. */
export function OpenDecisions({ doc, ...go }: DocGo & { doc: Doc }) {
  return (
    <>
      {doc.from.map((f, i) => {
        const open = f.decisions ?? [];
        return open.length ? <DecisionList key={i} from={f} decisions={open} go={go} /> : null;
      })}
    </>
  );
}

/*
 * The What's left tab: open decisions, under what each is on, then gaps,
 * riskiest first. `here` is the page's own doc, which needn't be named. With
 * nothing left, it says so in a line: that's good news.
 */
export function LeftTab({ left, here, nothing, ...go }: DocGo & { left: LeftHere; here?: Doc; nothing?: string }) {
  const { state } = go;
  if (!leftTotal(left))
    return (
      <Box
        component="p"
        sx={{
          px: 2.5,
          py: 2.25,
          fontSize: 14,
          color: "success.main",
          bgcolor: (t) => `color-mix(in srgb, ${t.vars.palette.success.main} 7%, transparent)`,
          border: 1,
          borderColor: (t) => `color-mix(in srgb, ${t.vars.palette.success.main} 22%, transparent)`,
          borderRadius: "10px",
        }}
      >
        {nothing ?? "Nothing left: no open decisions or gaps are written down."}
      </Box>
    );
  return (
    <>
      {left.decisions ? (
        <Section title={<LeftLabel kind="decision" size={16} />} count={left.decisions} note="Questions not settled yet: each answer changes what's intended.">
          <Box sx={cardSx}>
            {/* Each one's open decisions under what they're on, a group apiece. */}
            {left.holders.map((h) => (
              <Box key={`${h.kind}:${h.doc.id}`} sx={{ "& + &": { mt: 1.75, pt: 1.5, borderTop: 1, borderColor: "divider" } }}>
                {h.doc !== here ? (
                  <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 8px", mb: 0.5, fontSize: 13, fontWeight: 550 }}>
                    <HolderLink holder={h} />
                  </Box>
                ) : null}
                <OpenDecisions {...go} doc={h.doc} />
              </Box>
            ))}
          </Box>
        </Section>
      ) : null}
      {left.gaps.length ? (
        <Section
          title={
            <LeftLabel kind="product-gap" term="gap" size={16}>
              Gaps
            </LeftLabel>
          }
          count={left.gaps.length}
          note="By risk, worst first. The acceptable are folded; open a score to see how it's worked out."
        >
          <GapRows state={state} rows={left.gaps} here={here} />
        </Section>
      ) : null}
    </>
  );
}

/* On a first tab, the few riskiest gaps, with a way to all of them. */
export function TopGaps({ state, left, here }: { state: DocketState; left: LeftHere; here?: Doc }) {
  if (!left.gaps.length) return null;
  const shown = left.gaps.slice(0, 3);
  return (
    <Section
      title="Riskiest gaps"
      aside={<a href={tabHref("left")}>{leftTotal(left) > shown.length ? `See all ${leftTotal(left)} open items` : "See what's left"}</a>}
    >
      <GapRows state={state} rows={shown} here={here} grouped={false} />
    </Section>
  );
}
