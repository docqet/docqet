// docqet:implements capability:overview
import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import { useMemo } from "react";
import { Maturity } from "../../components/maturity/Maturity";
import { NAMES, TECHNICAL_NAMES, plural } from "../../components/names";
import { StabilitySpread } from "../../components/stability/StabilitySpread";
import { ExposureStat, MaturityStat } from "../../components/indexParts";
import { ExposureMark } from "../../components/risk/RiskScore";
import { PersonaAvatar } from "../../components/Personas";
import { ReadinessMark } from "../../components/Readiness";
import { AreaRows, ImprovementsFigure, bestStep, improvementWords } from "../../components/improvements/Improvements";
import { InlineMarkdown } from "../../components/markdown/Markdown";
import { MaturityRing } from "../../components/maturity/MaturityRing";
import { MATURITY_BANDS } from "../../components/maturity/maturity";
import { GapRiskMark } from "../../components/risk/RiskScore";
import { STABILITY, STABILITY_LEVEL_IDS, levelColor } from "../../components/stability/stability";
import { Term } from "../../components/term/Term";
import { docHref, sectionHref, type Route } from "../../routes";
import { Empty, PageHeader, Section, Stat, View } from "../../components/shell/layout";
import {
  domainCapabilities,
  find,
  partOf,
  isReady,
  readyShare,
  startedOf,
  gapsOn,
  inRiskOrder,
  openDecisions,
  subjectOf,
  technicalDoc,
  type CapabilityLevel,
  type DocqetState,
  type Domain,
  type Gap,
  type Level,
} from "../../state";
import { GapInitiatives } from "../../components/risk/GapRows";

/* What isn't there yet, said quietly: "Nothing started", "No capabilities". */
const faintSx: SystemStyleObject<Theme> = { color: "text.disabled", fontWeight: 500, fontSize: 13 };

/* A name that cuts off with an ellipsis rather than wrapping. */
const ellipsisSx: SystemStyleObject<Theme> = { minWidth: 0, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" };

/* A row's name, linking to its page: the row's text until hovered. */
const nameLinkSx: SystemStyleObject<Theme> = {
  ...ellipsisSx,
  color: "inherit",
  fontWeight: 600,
  textDecoration: "none",
  "&:hover": { color: "primary.main" },
};

/* A line in one of the overview's lists, ruled off from the next. All plain rows, no folds. */
const rowSx: SystemStyleObject<Theme> = { py: 1, fontSize: 13.5, borderBottom: 1, borderColor: "divider" };

/* A persona's or a project's line: the name filling the space, with its marks after it. */
const nameRowSx: SystemStyleObject<Theme> = { ...rowSx, display: "flex", alignItems: "center", gap: 1.25, "& > a": { flex: 1 } };

/*
 * How the product is doing, at a glance, with no panning: its maturity, how
 * far along the work is, its readiness, whether people can use it, who it's
 * least ready for, its improvements and what's wrong in the docs, as tiles
 * that each link to where they're explained; then what would make it more
 * ready, how stable each domain is, how ready it is for each persona, and
 * the few riskiest gaps. Summary only: every count links on rather than
 * listing.
 */
export default function OverviewPage({ state }: { state: DocqetState; route: Route }) {
  const several = state.projects.length > 1;
  const name = several ? (state.projects[0]?.product.name ?? "Product") : (state.projects[0]?.name ?? "Project");
  const { maturity, readiness } = state.status;
  /* Each persona with their readiness, least ready first, those with nothing started last. */
  const personas = useMemo(
    () =>
      state.personas
        .map((persona) => ({ persona, readiness: persona.readiness }))
        .sort((a, b) => (readyShare(a.readiness) ?? Infinity) - (readyShare(b.readiness) ?? Infinity) || a.persona.name.localeCompare(b.persona.name)),
    [state],
  );
  const leastReady = personas.find((p) => isReady(p.readiness) === false);
  const riskiest = useMemo(() => inRiskOrder(state.gaps, (g) => g).slice(0, 5), [state]);
  const decisions = [...state.domains, ...state.features, ...state.capabilities, ...state.mechanisms, ...state.components].reduce(
    (n, doc) => n + openDecisions(doc).length,
    0,
  );

  return (
    <View title={name}>
      <PageHeader
        kind={several ? <Term id="product">Product</Term> : <Term id="project">Project</Term>}
        title={name}
        lede={<Lede state={state} />}
        stats={
          <>
            <MaturityStat
              maturity={maturity}
              band={state.status.band}
              subject="project"
              count={state.features.filter((f) => f.maturity !== null).length}
              spread={state.features.map((f) => f.band)}
              of={several ? "every project showing" : "this project"}
            />
            <ExposureStat exposure={state.status.exposure} risk={state.status.risk} of={several ? "every project showing" : "this project"} />
            <Stat
              label="Readiness"
              term="readiness"
              href="#improvements"
              value={
                readiness.percent === null ? (
                  <Box component="span" sx={faintSx}>
                    Nothing started
                  </Box>
                ) : (
                  <ReadinessMark readiness={readiness} of="Readiness" inButton />
                )
              }
              note={
                startedOf(readiness)
                  ? `A recommendation, from ${plural(startedOf(readiness), "started capability", "started capabilities")}${readiness.notStarted.length ? `, ${readiness.notStarted.length} not started` : ""}`
                  : "Drafts don't count"
              }
            />
            {leastReady ? (
              <Stat
                label="Least ready for"
                href={docHref("persona", leastReady.persona.id)}
                value={
                  <>
                    <PersonaAvatar persona={leastReady.persona} size={26} />
                    <Box component="span" sx={ellipsisSx}>
                      {leastReady.persona.name}
                    </Box>
                  </>
                }
                note={<ReadinessMark readiness={leastReady.readiness} of={`Readiness for ${leastReady.persona.name}`} inButton />}
              />
            ) : null}
            <Stat
              label="Improvements"
              term="improvement"
              href={sectionHref("improvements")}
              value={readiness.areas.length ? <ImprovementsFigure readiness={readiness} /> : "None now"}
              note={
                bestStep(readiness)
                  ? `Most from ${improvementWords(bestStep(readiness)!)}`
                  : `${plural(state.gaps.length, "gap", "gaps")} and ${plural(decisions, "open decision", "open decisions")} written down`
              }
            />
            {state.problems.length ? (
              <Stat label="Doc problems" href={sectionHref("problems")} tone="warn" value={state.problems.length} note="Contradictions and mistakes to fix" />
            ) : null}
          </>
        }
      />

      <Section
        id="improvements"
        title="Improvements"
        term="improvement"
        note="Where it could become more ready, by potential: how ready it could be with all of each settled, and where the next step would take it. They're what could be done, not a finish line: what's worth doing is yours to judge."
        aside={readiness.areas.length > 5 ? <a href={sectionHref("improvements")}>See all {readiness.areas.length}</a> : null}
      >
        <AreaRows readiness={readiness} limit={5} />
      </Section>

      <Section
        title={
          <>
            Where each <Term id="domain">domain</Term> stands
          </>
        }
        count={state.domains.length}
        note="Its maturity and its capabilities' stability, beside their exposure and its improvements, least mature first."
      >
        {state.domains.length ? <DomainStability state={state} /> : <Empty>No domains yet.</Empty>}
      </Section>

      {personas.length ? (
        <Section
          title={
            <>
              <Term id="readiness">Readiness</Term> by persona
            </>
          }
          count={personas.length}
          note="How ready the software is for each of them, least ready first."
        >
          {/* Side by side where there's room, each column at least 320px, or the whole width on a phone. */}
          <Box component="ul" sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(320px, 100%), 1fr))", columnGap: 4 }}>
            {personas.map(({ persona: p, readiness: r }) => (
              <Box component="li" key={p.id} sx={nameRowSx}>
                <PersonaAvatar persona={p} size={32} />
                <Box component="a" href={docHref("persona", p.id)} sx={nameLinkSx}>
                  {p.name}
                </Box>
                <ReadinessMark readiness={r} of={`Readiness for ${p.name}`} />
              </Box>
            ))}
          </Box>
        </Section>
      ) : null}

      <Section
        title="Riskiest gaps"
        count={state.gaps.length}
        aside={state.gaps.length > riskiest.length ? <a href={sectionHref("improvements", { tab: "gaps" })}>See all →</a> : null}
      >
        {riskiest.length ? (
          <ul>
            {riskiest.map((g) => (
              <GapRow key={g.id} state={state} gap={g} />
            ))}
          </ul>
        ) : (
          <Empty>No known gaps.</Empty>
        )}
      </Section>

      {several ? (
        <Section title={<Term id="project">Projects</Term>} count={state.projects.length}>
          <ul>
            {state.projects.map((p) => (
              <Box component="li" key={p.id} sx={nameRowSx}>
                <Box component="a" href={sectionHref("overview", { project: p.id })} sx={nameLinkSx}>
                  {p.name}
                </Box>
                {p.maturity !== null ? (
                  <>
                    <MaturityRing progress={p.maturity} subject="project" size={24} label={`${p.name} maturity`} />
                    {p.band ? (
                      <Box component="span" sx={[{ fontSize: 14, fontWeight: 650 }, levelColor(p.band)]}>
                        {MATURITY_BANDS[p.band]}
                      </Box>
                    ) : null}
                  </>
                ) : (
                  <Box component="span" sx={faintSx}>
                    No maturity yet
                  </Box>
                )}
              </Box>
            ))}
          </ul>
        </Section>
      ) : null}
    </View>
  );
}

/* Under the name: which projects, with several, and how much there is. */
function Lede({ state }: { state: DocqetState }) {
  const sizes = [
    plural(state.domains.length, "domain", "domains"),
    plural(state.features.length, "feature", "features"),
    plural(state.capabilities.length, "capability", "capabilities"),
  ].join(", ");
  if (state.projects.length <= 1) return <>{sizes}.</>;
  const names = state.projects.map((p) => p.name);
  const listed = names.length <= 3 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : plural(names.length, "project", "projects");
  return (
    <>
      {listed}: {sizes}.
    </>
  );
}

/* A key's square in a level's color, in the shade for the color scheme. */
const levelSwatchSx = (level: Level) => (theme: Theme) => ({ bgcolor: theme.vars.palette.stability[level] });

/* A draft has no level, so no color: a faint hatch, there but not started, as the bar draws it. */
const draftSwatchSx = (theme: Theme) => ({
  backgroundImage: `repeating-linear-gradient(135deg, color-mix(in srgb, ${theme.vars.palette.text.disabled} 45%, transparent) 0 2px, transparent 2px 4px)`,
});

/* Draft first, then the levels from Prototype to GA, as the bars run left to right. */
const BAR_ORDER: CapabilityLevel[] = [null, ...STABILITY_LEVEL_IDS];

/* A capability's level in a domain: its own there, as it can differ by domain, or else its overall one. */
function levelIn(state: DocqetState, domain: Domain) {
  return domainCapabilities(state, domain).map((c) => c.levels.find((l) => l.domain === domain.id)?.level ?? c.stability);
}

const levelLabel = (level: CapabilityLevel) => (level ? STABILITY[level].name : "Draft");

/*
 * Where each domain stands, a line each: its maturity, its capabilities as a
 * bar split by stability level, and its exposure and improvements. One key
 * under the list says which color is which level. Least mature first. Below
 * md, the name and maturity share a line, and the bar and the figures each
 * take one of their own.
 */
function DomainStability({ state }: { state: DocqetState }) {
  const rows = [...state.domains]
    .map((domain) => {
      const capabilities = domainCapabilities(state, domain);
      const levels = levelIn(state, domain);
      const gaps = [...new Set(capabilities.flatMap((c) => gapsOn(state, c)))];
      const decisions = capabilities.reduce((n, c) => n + openDecisions(c).length, openDecisions(domain).length);
      return { domain, capabilities, levels, gaps, decisions };
    })
    .sort((a, b) => (a.domain.maturity ?? -1) - (b.domain.maturity ?? -1));
  return (
    <>
      <ul>
        {rows.map(({ domain, levels }) => {
          return (
            <Box
              component="li"
              key={domain.id}
              sx={{
                ...rowSx,
                display: "grid",
                gridTemplateColumns: { xs: "minmax(0, 1fr) auto", md: "minmax(120px, 220px) 150px minmax(120px, 1fr) 210px" },
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box component="a" href={docHref("domain", domain.id)} sx={nameLinkSx}>
                {domain.name}
              </Box>
              <Maturity
                value={domain.maturity}
                subject="domain"
                count={domain.features.length}
                of="none of its capabilities has a level yet"
                spread={domain.features.map((id) => partOf(find(state.features, id), domain.id)?.band ?? null)}
              />
              {/* Its capabilities as a bar split by level, with how many there are. */}
              <Box
                component="span"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  minWidth: 0,
                  gridColumn: { xs: "1 / -1", md: "auto" },
                  "& > .stability-spread-mark": { flex: 1 },
                }}
              >
                {levels.length ? (
                  <StabilitySpread levels={levels} of={domain.name} wide />
                ) : (
                  <Box component="span" sx={faintSx}>
                    No capabilities
                  </Box>
                )}
                <Box component="span" sx={{ fontSize: 12.5, fontVariantNumeric: "tabular-nums", textAlign: "right", color: "text.secondary" }}>
                  {levels.length}
                </Box>
              </Box>
              {/* Its exposure and improvements, linking to its Improvements tab. */}
              <Box
                component="span"
                sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" }, gridColumn: { xs: "1 / -1", md: "auto" }, whiteSpace: "nowrap" }}
              >
                <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1.5 }}>
                  <ExposureMark exposure={domain.exposure} risk={domain.readiness.gaps} of={domain.name} />
                  <Box
                    component="a"
                    href={docHref("domain", domain.id, "improvements")}
                    sx={{ textDecoration: "none", color: "inherit", "&:hover": { color: "primary.main" } }}
                  >
                    <ImprovementsFigure readiness={domain.readiness} />
                  </Box>
                </Box>
              </Box>
            </Box>
          );
        })}
      </ul>
      <Box aria-hidden sx={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", mt: 1.5, fontSize: 12, color: "text.secondary" }}>
        {BAR_ORDER.map((level) => (
          <Box component="span" key={level ?? "draft"} sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
            <Box component="span" sx={[{ width: 10, height: 10, borderRadius: "3px" }, level ? levelSwatchSx(level) : draftSwatchSx]} />
            {levelLabel(level)}
          </Box>
        ))}
      </Box>
    </>
  );
}

/* What a gap is on, quieter than the gap itself, its icon kept whole as the name cuts off. */
const onSx: SystemStyleObject<Theme> = {
  display: "inline-flex",
  alignItems: "center",
  gap: 0.75,
  minWidth: 0,
  fontSize: 12.5,
  color: "text.secondary",
  textDecoration: "none",
  "& svg": { flex: "none" },
  "&:hover": { color: "primary.main" },
};

/* What a gap is on, with its kind's icon and a link to its page: a capability, feature, mechanism or component. */
function GapOn({ state, gap }: { state: DocqetState; gap: Gap }) {
  const { type, id } = subjectOf(gap);
  if (type === "mechanism" || type === "component") {
    const doc = technicalDoc(state, `${type}:${id}`);
    return (
      <Box component="a" href={docHref(type, id)} sx={onSx}>
        {TECHNICAL_NAMES[type].icon}
        <Box component="span" sx={ellipsisSx}>
          {doc?.name ?? id}
        </Box>
      </Box>
    );
  }
  if (type === "capability" || type === "feature") {
    const doc = type === "capability" ? find(state.capabilities, id) : find(state.features, id);
    return (
      <Box component="a" href={docHref(type, id)} sx={onSx}>
        {NAMES[type].icon}
        <Box component="span" sx={ellipsisSx}>
          {doc?.name ?? id}
        </Box>
      </Box>
    );
  }
  return null;
}

/*
 * One of the riskiest gaps: its risk, opening how it's worked out, what it
 * says, linking to its page, and what it's on, with its initiatives under
 * that. On a phone the three stack rather than squeeze.
 */
function GapRow({ state, gap }: { state: DocqetState; gap: Gap }) {
  const risk = gap.risk;
  return (
    <Box
      component="li"
      sx={{
        ...rowSx,
        py: 1.25,
        display: "grid",
        gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "130px minmax(0, 1fr) minmax(0, 220px)" },
        alignItems: "center",
        gap: { xs: 0.75, sm: 2 },
      }}
    >
      <Box component="span" sx={{ display: "inline-flex" }}>
        <GapRiskMark risk={risk} on={risk.on[0] ?? null} />
      </Box>
      <Box
        component="a"
        href={docHref("gap", gap.id)}
        sx={{
          display: "-webkit-box",
          overflow: "hidden",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 2,
          lineHeight: 1.45,
          color: "inherit",
          textDecoration: "none",
          "&:hover": { color: "primary.main" },
        }}
      >
        <InlineMarkdown text={gap.name} />
      </Box>
      <Box component="span" sx={{ minWidth: 0, textAlign: "right", "& .initiative-tags": { justifyContent: "flex-end" } }}>
        <GapOn state={state} gap={gap} />
        <GapInitiatives state={state} gap={gap} />
      </Box>
    </Box>
  );
}
