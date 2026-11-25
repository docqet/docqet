import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import { useMemo } from "react";
import { Maturity, NAMES, TECHNICAL_NAMES, plural } from "../Explore";
import { StabilitySpread } from "../design/stability/StabilitySpread";
import { ExposureStat, GapsCell, MaturityStat } from "./indexParts";
import { LeftFigure } from "../GapRows";
import { PersonaAvatar, personaReadiness } from "../Personas";
import { ReadinessMark, StillNeeds } from "../Readiness";
import { InlineMarkdown } from "../design/markdown/Markdown";
import { MaturityRing } from "../design/maturity/MaturityRing";
import { MATURITY_BANDS, maturityBand } from "../design/maturity/maturity";
import { GapRiskMark } from "../design/risk/RiskScore";
import { STABILITY, STABILITY_LEVEL_IDS, levelColor } from "../design/stability/stability";
import { Term } from "../design/term/Term";
import { docHref, sectionHref, type Route } from "../routes";
import { Empty, PageHeader, Section, Stat, View } from "../shell/layout";
import {
  domainCapabilities,
  find,
  partOf,
  isReady,
  readinessOf,
  readyShare,
  startedOf,
  gapsOn,
  inRiskOrder,
  riskAcross,
  riskOf,
  maturityOf,
  openDecisions,
  subjectOf,
  technicalDoc,
  type CapabilityLevel,
  type DocketState,
  type Domain,
  type Gap,
  type Level,
  
} from "../state";
import "./overview.css";
import { GapInitiatives } from "../GapRows";

/*
 * How the product is doing, at a glance, with no panning: its maturity, how
 * far along the work is, its readiness, whether people can use it, who it's
 * least ready for, what's left and what's wrong in the docs, as tiles that
 * each link to where they're explained; then what it still needs to be
 * ready, how stable each domain is, how ready it is for each persona, and
 * the few riskiest gaps. Summary only: every count links on rather than
 * listing.
 */
export default function OverviewPage({ state }: { state: DocketState; route: Route }) {
  const several = state.projects.length > 1;
  const name = several ? (state.projects[0]?.product.name ?? "Product") : (state.projects[0]?.name ?? "Project");
  const maturity = maturityOf(state);

  const readiness = useMemo(() => readinessOf(state, state.capabilities), [state]);
  /* Each persona with their readiness, least ready first, those with nothing started last. */
  const personas = useMemo(
    () =>
      state.personas
        .map((persona) => ({ persona, readiness: personaReadiness(state, persona) }))
        .sort((a, b) => (readyShare(a.readiness) ?? Infinity) - (readyShare(b.readiness) ?? Infinity) || a.persona.name.localeCompare(b.persona.name)),
    [state],
  );
  const leastReady = personas.find((p) => isReady(p.readiness) === false);
  const riskiest = useMemo(() => inRiskOrder(state, state.gaps, (g) => g).slice(0, 5), [state]);
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
              subject="project"
              count={state.features.filter((f) => f.maturity !== null).length}
              spread={state.features.map((f) => f.band)}
              of={several ? "every project showing" : "this project"}
            />
            <ExposureStat state={state} capabilities={state.capabilities} of={several ? "every project showing" : "this project"} />
            <Stat
              label="Readiness"
              term="readiness"
              href="#still-needs"
              value={readiness.percent === null ? <span className="ov-faint">Nothing started</span> : <ReadinessMark readiness={readiness} of="Readiness" inButton />}
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
                    <span className="ov-ellipsis">{leastReady.persona.name}</span>
                  </>
                }
                note={<ReadinessMark readiness={leastReady.readiness} of={`Readiness for ${leastReady.persona.name}`} inButton />}
              />
            ) : null}
            <Stat label="What's left" term="gap" href={sectionHref("left")} value={<LeftFigure gaps={state.gaps} decisions={decisions} risk={riskAcross(state, state.gaps)} of="everything" />} />
            {state.problems.length ? (
              <Stat
                label="Doc problems"
                href={sectionHref("problems")}
                tone="warn"
                value={state.problems.length}
                note="Contradictions and mistakes to fix"
              />
            ) : null}
          </>
        }
      />

      <Section
        id="still-needs"
        title="What it still needs"
        term="readiness"
        note="Before people can use it: each capability not ready yet, and what would make it ready."
      >
        <StillNeeds readiness={readiness} readyText="Ready: every started capability is at Beta or above, with no unacceptable gap." />
      </Section>

      <Section title={<>Where each <Term id="domain">domain</Term> stands</>} count={state.domains.length} note="Its maturity and its capabilities' stability, beside what's left on them and their exposure, least mature first.">
        {state.domains.length ? <DomainStability state={state} /> : <Empty>No domains yet.</Empty>}
      </Section>

      {personas.length ? (
        <Section title={<><Term id="readiness">Readiness</Term> by persona</>} count={personas.length} note="How ready the software is for each of them, least ready first.">
          <ul className="ov-personas">
            {personas.map(({ persona: p, readiness: r }) => (
              <li key={p.id}>
                <PersonaAvatar persona={p} size={32} />
                <a className="ov-link ov-ellipsis" href={docHref("persona", p.id)}>
                  {p.name}
                </a>
                <ReadinessMark readiness={r} of={`Readiness for ${p.name}`} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section
        title="Riskiest gaps"
        count={state.gaps.length}
        aside={state.gaps.length > riskiest.length ? <a href={sectionHref("left")}>See all →</a> : null}
      >
        {riskiest.length ? (
          <ul className="ov-gaps">
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
          <ul className="ov-projects">
            {state.projects.map((p) => (
              <li key={p.id}>
                <a className="ov-link ov-ellipsis" href={sectionHref("overview", { project: p.id })}>
                  {p.name}
                </a>
                {p.maturity !== null ? (
                  <>
                    <MaturityRing progress={p.maturity} subject="project" size={24} label={`${p.name} maturity`} />
                    <Box component="span" className="ov-band" sx={levelColor(maturityBand(p.maturity))}>
                      {MATURITY_BANDS[maturityBand(p.maturity)]}
                    </Box>
                  </>
                ) : (
                  <span className="ov-faint">No maturity yet</span>
                )}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </View>
  );
}

/* Under the name: which projects, with several, and how much there is. */
function Lede({ state }: { state: DocketState }) {
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

/* A level's color as `--level`, for a bar drawn in it, in the shade for the color scheme. */
const levelVar = (level: Level) => (theme: Theme) => ({
  "--level": STABILITY[level].colors.light,
  ...theme.applyStyles("dark", { "--level": STABILITY[level].colors.dark }),
});

/* Draft first, then the levels from Prototype to GA, as the bars run left to right. */
const BAR_ORDER: CapabilityLevel[] = [null, ...STABILITY_LEVEL_IDS];

/* A capability's level in a domain: its own there, as it can differ by domain, or else its overall one. */
function levelIn(state: DocketState, domain: Domain) {
  return domainCapabilities(state, domain).map((c) => c.levels.find((l) => l.domain === domain.id)?.level ?? c.stability);
}

const levelLabel = (level: CapabilityLevel) => (level ? STABILITY[level].name : "Draft");

/*
 * Where each domain stands, a line each: its maturity, its capabilities as a
 * bar split by stability level, and what's left on them, as the same marks
 * and counts the Features list uses. One key under the list says which color
 * is which level. Least mature first.
 */
function DomainStability({ state }: { state: DocketState }) {
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
      <ul className="ov-domains">
        {rows.map(({ domain, capabilities, levels, gaps, decisions }) => {
          return (
            <li key={domain.id}>
              <a className="ov-link ov-ellipsis" href={docHref("domain", domain.id)}>
                {domain.name}
              </a>
              <Maturity
                value={domain.maturity}
                subject="domain"
                count={domain.features.length}
                of="none of its capabilities has a level yet"
                spread={domain.features.map((id) => partOf(find(state.features, id), domain.id)?.band ?? null)}
              />
              <span className="ov-bar-cell">
                {levels.length ? <StabilitySpread levels={levels} of={domain.name} wide /> : <span className="ov-faint">No capabilities</span>}
                <span className="ov-count">{levels.length}</span>
              </span>
              <span className="ov-left">
                <GapsCell gaps={gaps} exposure={{ state, capabilities }} kind="gap" decisions={decisions} of={domain.name} href={docHref("domain", domain.id, "left")} />
              </span>
            </li>
          );
        })}
      </ul>
      <div className="ov-legend" aria-hidden>
        {BAR_ORDER.map((level) => (
          <span key={level ?? "draft"}>
            {level ? <Box component="span" className="ov-swatch" sx={levelVar(level)} /> : <span className="ov-swatch ov-seg-draft" />}
            {levelLabel(level)}
          </span>
        ))}
      </div>
    </>
  );
}

/* What a gap is on, with its kind's icon and a link to its page: a capability, feature, mechanism or component. */
function GapOn({ state, gap }: { state: DocketState; gap: Gap }) {
  const { type, id } = subjectOf(gap);
  if (type === "mechanism" || type === "component") {
    const doc = technicalDoc(state, `${type}:${id}`);
    return (
      <a className="ov-on" href={docHref(type, id)}>
        {TECHNICAL_NAMES[type].icon}
        <span className="ov-ellipsis">{doc?.name ?? id}</span>
      </a>
    );
  }
  if (type === "capability" || type === "feature") {
    const doc = type === "capability" ? find(state.capabilities, id) : find(state.features, id);
    return (
      <a className="ov-on" href={docHref(type, id)}>
        {NAMES[type].icon}
        <span className="ov-ellipsis">{doc?.name ?? id}</span>
      </a>
    );
  }
  return null;
}

/* One of the riskiest gaps: its risk, opening how it's worked out, what it says, linking to its page, and what it's on. */
function GapRow({ state, gap }: { state: DocketState; gap: Gap }) {
  const risk = riskOf(state, gap);
  return (
    <li>
      <span className="ov-gap-impact">
        <GapRiskMark risk={risk} on={risk.on[0] ?? null} />
      </span>
      <a className="ov-gap-summary" href={docHref("gap", gap.id)}>
        <InlineMarkdown text={gap.name} />
      </a>
      <span className="ov-gap-on">
        <GapOn state={state} gap={gap} />
        <GapInitiatives state={state} gap={gap} />
      </span>
    </li>
  );
}
