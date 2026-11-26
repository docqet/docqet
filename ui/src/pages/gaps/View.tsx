import { Fragment, useState } from "react";
import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import { TECHNICAL_NAMES } from "../../components/names";
import { CapabilityStability } from "../../components/CapabilityLabel";
import { LEFT_KINDS, LeftLabel, gapKind } from "../../components/left/LeftMark";
import { InlineMarkdown } from "../../components/markdown/Markdown";
import { RiskBars, VERDICT_NAMES } from "../../components/risk/RiskScore";
import { RiskWorkings } from "../../components/popovers/RiskWorkings";
import { STABILITY } from "../../components/stability/stability";
import { docHref, sectionHref, type Route } from "../../routes";
import { View } from "../../components/shell/layout";
import { HeldDecisions } from "../../components/Fields";
import { appliesAt, find, riskScore, subjectOf, technicalDoc, verdictOf, type DocketState, type Gap, type Risk, type Verdict } from "../../state";
import { EvidenceList } from "../../components/doc/EvidenceList";
import { Missing } from "../../components/doc/Missing";
/* EvidenceList's rules, until it's styled in place. */
import "../doc.css";
import { InitiativeTags, initiativesOf } from "../../components/Initiatives";

/*
 * One gap's page. Its name comes first, as the heading, with what it's in
 * above it and what it says in full under it. Then its risk profile, its own
 * section: its risk, how it's worked out, which claims it breaks, and its
 * score on each capability it's on. Then only the links it has: the rules and
 * expected outcomes it falls short of, the open decisions it waits on, and
 * where the code marks it.
 */
export default function GapPage({ state, id }: { state: DocketState; id: string; route: Route }) {
  const gap = state.gaps.find((g) => g.id === id);
  if (!gap) return <Missing kind="gap" id={id} />;
  return <GapView state={state} gap={gap} />;
}

/* The rubric reference's place for an outcome's quality, on the glossary. */
const qualityHref = (quality: string) => `${sectionHref("glossary", { tab: "rubric" })}#${quality}`;

function GapView({ state, gap }: { state: DocketState; gap: Gap }) {
  const kind = gapKind(gap);
  const risk = gap.risk;
  const affected = gap.affected;
  const waits = gap.decisions;

  return (
    <View title={plainTitle(gap.name)}>
      <Box component="header" sx={{ display: "flex", flexDirection: "column", gap: 1.5, maxWidth: 820, mb: 3.5 }}>
        {/* Its kind, then what it's in. */}
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 8px", fontSize: 13 }}>
          <LeftLabel kind={kind}>{LEFT_KINDS[kind].one}</LeftLabel>
          <Box component="span" sx={{ color: "text.disabled" }}>
            in
          </Box>
          <Subject state={state} gap={gap} />
          <InitiativeTags
            state={state}
            ids={initiativesOf(
              state,
              risk.on.map((o) => o.capability),
            )}
          />
        </Box>
        <Box component="h1" sx={{ fontSize: 26, lineHeight: 1.25, letterSpacing: "-0.02em" }}>
          {gap.name}
        </Box>
        <Clamped text={gap.description} />
      </Box>

      <RiskProfile gap={gap} risk={risk} />

      {/* The links it has, a label column and what each is. */}
      <Box
        component="dl"
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "130px minmax(0, 1fr)" },
          gap: { xs: 0.5, sm: "16px 20px" },
          maxWidth: 820,
          m: 0,
          pt: 2.5,
          borderTop: 1,
          borderColor: "divider",
          "& > dt": { fontSize: 12.5, fontWeight: 600, color: "text.secondary" },
        }}
      >
        {affected.map((a) =>
          a.kind === "rule" ? (
            <Fragment key={a.rule.id}>
              <dt>Doesn&rsquo;t hold to</dt>
              <Box component="dd" sx={linksSx}>
                <a href={docHref("rule", a.rule.id)}>{a.rule.name}</a>
              </Box>
            </Fragment>
          ) : a.kind === "outcome" ? (
            <Fragment key={a.outcome.id}>
              <dt>Falls short of</dt>
              <Box component="dd" sx={{ ...ddSx, flexDirection: "column", alignItems: "flex-start", gap: 0.5 }}>
                <span>&ldquo;{a.outcome.text}&rdquo;</span>
                <Box
                  component="a"
                  href={qualityHref(a.quality.id)}
                  sx={{ fontSize: 12.5, fontWeight: 500, color: "text.secondary", textDecoration: "none", "&:hover": { color: "primary.main" } }}
                >
                  {a.quality.name} &middot; {STABILITY[a.outcome.level].name}
                </Box>
              </Box>
            </Fragment>
          ) : null,
        )}

        {waits.length ? (
          <>
            <dt>Waits on</dt>
            <Box component="dd" sx={linksSx}>
              <HeldDecisions held={waits} />
            </Box>
          </>
        ) : null}

        <dt>In the code</dt>
        <Box component="dd" sx={linksSx}>
          {gap.places.length ? (
            <EvidenceList state={state} places={gap.places} icon={<CodeRoundedIcon sx={{ fontSize: 15 }} />} />
          ) : (
            <Box component="span" sx={{ color: "text.disabled" }}>
              Not marked yet
            </Box>
          )}
        </Box>
      </Box>
    </View>
  );
}

/* What each link is, beside its label. */
const ddSx: SystemStyleObject<Theme> = { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 10px", m: 0, mb: { xs: 1.5, sm: 0 }, minWidth: 0 };

/* One whose links read as names, lit in the accent under the pointer. */
const linksSx: SystemStyleObject<Theme> = {
  ...ddSx,
  "& a": { color: "text.primary", fontWeight: 600, textDecoration: "none", "&:hover": { color: "primary.main" } },
};

/* Risk's verdict as a color: unacceptable the alarm color, tolerable the soft yellow, and acceptable neutral, since it may rightly stay open for good. */
const VERDICT_COLOR: Record<Verdict, string> = { unacceptable: "error.main", tolerable: "impact.inconvenient", acceptable: "text.disabled" };

/*
 * A gap's risk profile, its own section: its risk and verdict, and what that
 * means; how it's worked out on the capability it scores highest on, each
 * part as its tag, opening what it means, with where it sits in its range
 * and what it contributes; which claims it breaks, and why, or why it breaks
 * none; and, on more than one capability, its score on each, highest first.
 */
function RiskProfile({ gap, risk }: { gap: Gap; risk: Risk }) {
  const top = risk.on[0];
  const claims = claimsOf(gap, risk);
  return (
    /* data-verdict sets --risk, the color the risk bars and workings inside take. */
    <Box component="section" data-verdict={risk.verdict} sx={{ maxWidth: 820, mb: 3 }}>
      <Box component="h2" sx={{ mb: 1.25, fontSize: 15, fontWeight: 700 }}>
        Risk
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "minmax(0, 1fr) minmax(0, 1.4fr)" },
          gap: "16px 28px",
          px: 2.5,
          py: 2.25,
          bgcolor: "background.paper",
          border: 1,
          borderColor: "divider",
          borderRadius: "10px",
        }}
      >
        {/* Its risk, large, in its verdict's color, and what the verdict means. */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
          <Box
            component="span"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              fontSize: 28,
              fontWeight: 750,
              lineHeight: 1.1,
              whiteSpace: "nowrap",
              fontVariantNumeric: "tabular-nums",
              color: VERDICT_COLOR[risk.verdict],
            }}
          >
            <RiskBars verdict={risk.verdict} size="small" />
            {riskScore(risk.score)}
            <Box component="span" sx={{ fontSize: 15, fontWeight: 700 }}>
              {VERDICT_NAMES[risk.verdict].name}
            </Box>
          </Box>
          <Box component="span" sx={{ fontSize: 13.5, color: "text.secondary" }}>
            {VERDICT_NAMES[risk.verdict].means}
          </Box>
        </Box>
        {top ? (
          <Box sx={{ gridRow: { sm: "span 2" }, minWidth: 0 }}>
            <RiskWorkings risk={risk} on={top} interactive />
          </Box>
        ) : (
          <Box component="p" sx={{ color: "text.disabled" }}>
            It isn't on any capability showing.
          </Box>
        )}
        <Box sx={{ display: "grid", gap: 0.5 }}>
          {claims.map((c, i) => (
            <Box component="p" key={i} sx={{ fontSize: 13.5, lineHeight: 1.5, color: c.breaks ? "warning.main" : "text.secondary" }}>
              {c.text}
            </Box>
          ))}
        </Box>
      </Box>
      {/* Its score on each capability it's on, highest first. */}
      {risk.on.length > 1 ? (
        <Box sx={{ mt: 2 }}>
          <Box component="h3" sx={{ mb: 0.75, typography: "overline", color: "text.disabled" }}>
            On each of its {risk.on.length} capabilities
          </Box>
          <Box
            component="ul"
            sx={{
              bgcolor: "background.paper",
              border: 1,
              borderColor: "divider",
              borderRadius: "10px",
              "& > li + li": { borderTop: 1, borderColor: "divider" },
            }}
          >
            {risk.on.map((o) => (
              <Box
                component="li"
                key={o.capability.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) auto auto 3em",
                  alignItems: "center",
                  gap: 1.5,
                  px: 1.75,
                  py: 0.875,
                  fontSize: 13.5,
                }}
              >
                <Box
                  component="a"
                  href={docHref("capability", o.capability.id)}
                  sx={{ color: "text.primary", textDecoration: "none", "&:hover": { color: "primary.main" } }}
                >
                  {o.capability.name}
                </Box>
                {o.claim ? (
                  <Box component="span" sx={{ fontSize: 12, fontWeight: 600, color: "warning.main" }}>
                    Breaks a claim
                  </Box>
                ) : (
                  /* Holding its column, so its stability lines up with the others'. */
                  <span />
                )}
                <CapabilityStability level={o.capability.stability} name={o.capability.name} />
                <Box
                  component="span"
                  sx={{ minWidth: "2.5em", textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: VERDICT_COLOR[verdictOf(o.score)] }}
                >
                  {riskScore(o.score)}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}

/*
 * For each rule and expected outcome a gap affects, whether it breaks a
 * claim, and why: a rule, where a capability it's on with a level follows
 * it; an outcome, where a capability it's on is at a level that expects it.
 * Affecting neither, it breaks none.
 */
function claimsOf(gap: Gap, risk: Risk): { breaks: boolean; text: string }[] {
  const started = risk.on.filter((o) => o.weight > 0).map((o) => o.capability);
  const claims = gap.affected.flatMap((a) => {
    if (a.kind === "rule") {
      const by = started.filter((c) => c.rules.includes(a.rule.id));
      return [
        by.length
          ? { breaks: true, text: `It breaks a claim: ${names(by)} ${by.length === 1 ? "follows" : "follow"} “${a.rule.name}”, and it doesn't hold to it yet.` }
          : { breaks: false, text: `It doesn't hold to “${a.rule.name}”, but no capability it's on with a level follows it, so it breaks no claim there.` },
      ];
    }
    if (a.kind === "outcome") {
      const level = STABILITY[a.outcome.level].name;
      const by = started.filter((c) => appliesAt(a.outcome, c.stability));
      return [
        by.length
          ? {
              breaks: true,
              text: `It breaks a claim: ${level} expects “${a.outcome.text}”, and ${names(by)} ${by.length === 1 ? "is" : "are"} at a level that does.`,
            }
          : {
              breaks: false,
              text: `It falls short of “${a.outcome.text}”, which ${level} expects, but no capability it's on is at a level that does, so it breaks no claim there.`,
            },
      ];
    }
    return [];
  });
  return claims.length ? claims : [{ breaks: false, text: "It affects no rule or expected outcome, so it breaks no claim." }];
}

/* Capabilities by name: "A", "A and B", or, past three, how many. */
const names = (capabilities: { name: string }[]) =>
  capabilities.length > 3
    ? `${capabilities.length} capabilities it's on`
    : capabilities.length > 1
      ? `${capabilities
          .slice(0, -1)
          .map((c) => c.name)
          .join(", ")} and ${capabilities[capabilities.length - 1].name}`
      : capabilities[0].name;

/* How long a description can be before it's cut to three lines, with a way to read all of it. */
const CLAMP_FROM = 280;

/* What a gap says in full, at reading size: cut to three lines when it's long, with "Read all" to open the rest. */
function Clamped({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > CLAMP_FROM;
  return (
    <Box sx={{ fontSize: 16, lineHeight: 1.55, color: "text.secondary" }}>
      <Box
        component="p"
        sx={[{ maxWidth: 780 }, long && !open && { display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 3, overflow: "hidden" }]}
      >
        <InlineMarkdown text={text} />
      </Box>
      {long ? (
        <Box
          component="button"
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          sx={{ mt: 0.5, p: 0, font: "inherit", fontSize: 13, fontWeight: 600, color: "primary.main", bgcolor: "transparent", border: 0, cursor: "pointer" }}
        >
          {open ? "Show less" : "Read all"}
        </Box>
      ) : null}
    </Box>
  );
}

/* What a gap is on, as a link with its kind's icon: a capability, with its stability, or a mechanism or component. */
function Subject({ state, gap }: { state: DocketState; gap: Gap }) {
  const { type, id } = subjectOf(gap);
  if (type === "capability") {
    const capability = find(state.capabilities, id);
    return (
      <Box component="span" sx={subjectSx}>
        <Box component="a" href={docHref("capability", id)} sx={subjectLinkSx}>
          <BoltOutlinedIcon sx={{ fontSize: 15, color: "primary.main" }} />
          {capability?.name ?? id}
        </Box>
        {capability ? <CapabilityStability level={capability.stability} name={capability.name} /> : null}
      </Box>
    );
  }
  const doc = technicalDoc(state, `${type}:${id}`);
  if (!doc) return <span>{id}</span>;
  return (
    <Box component="span" sx={subjectSx}>
      <Box component="a" href={docHref(doc.kind, doc.id)} sx={subjectLinkSx}>
        {TECHNICAL_NAMES[doc.kind].icon}
        {doc.name}
      </Box>
    </Box>
  );
}

const subjectSx: SystemStyleObject<Theme> = { display: "inline-flex", alignItems: "center", gap: 1 };

const subjectLinkSx: SystemStyleObject<Theme> = {
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
  fontWeight: 600,
  color: "text.primary",
  textDecoration: "none",
  "&:hover": { color: "primary.main" },
};

/* A gap's summary, short enough for the tab's title. */
const plainTitle = (summary: string) => (summary.length > 60 ? `${summary.slice(0, 60).trimEnd()}…` : summary);
