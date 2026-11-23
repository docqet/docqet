import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import { useMemo } from "react";
import { Maturity, NAMES, TECHNICAL_NAMES, plural } from "../Explore";
import { Tip } from "../design/Tip";
import { GapsCell } from "./indexParts";
import { LeftFigure } from "../GapRows";
import { PersonaAvatar, personaReadiness } from "../Personas";
import { ReadinessMark, StillNeeds, readinessLabel } from "../Readiness";
import { InlineMarkdown } from "../design/markdown/Markdown";
import { MaturityRing } from "../design/maturity/MaturityRing";
import { RingGlyph } from "../design/maturity/RingGlyph";
import { MATURITY_BANDS, maturityBand } from "../design/maturity/maturity";
import { ImpactBadge } from "../design/risk/ImpactBadge";
import { STABILITY, STABILITY_LEVEL_IDS, levelColor } from "../design/stability/stability";
import { Term } from "../design/term/Term";
import { docHref, sectionHref, type Route } from "../routes";
import { Empty, PageHeader, Section, Stat, View } from "../shell/layout";
import {
  domainCapabilities,
  find,
  isReady,
  readinessOf,
  readyShare,
  startedOf,
  gapsById,
  inRiskOrder,
  riskAcross,
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

/*
 * How the platform is doing, at a glance, with no panning: its maturity, how
 * far along the work is, its readiness, whether people can use it, who it's
 * least ready for, what's left and what's wrong in the docs, as tiles that
 * each link to where they're explained; then what it still needs to be
 * ready, how stable each domain is, how ready it is for each persona, and
 * the few riskiest gaps. Summary only: every count links on rather than
 * listing.
 */
export default function OverviewPage({ state }: { state: DocketState; route: Route }) {
  const several = state.projects.length > 1;
  const name = several ? (state.projects[0]?.platform.name ?? "Platform") : (state.projects[0]?.name ?? "Project");
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
        kind={several ? <Term id="platform">Platform</Term> : <Term id="project">Project</Term>}
        title={name}
        lede={<Lede state={state} />}
        marks={maturity !== null ? <MaturityMark state={state} maturity={maturity} /> : null}
        stats={
          <>
            <Stat
              label="Maturity"
              href={sectionHref("features")}
              value={
                maturity === null ? (
                  <span className="ov-faint">None yet</span>
                ) : (
                  <Box component="span" sx={levelColor(maturityBand(maturity))}>
                    {MATURITY_BANDS[maturityBand(maturity)]} · {maturity}%
                  </Box>
                )
              }
              note={maturity === null ? "No capability has a level yet" : several ? "Across projects, from their features" : "From its features' capabilities"}
            />
            <Stat
              label="Readiness"
              term="readiness"
              href="#still-needs"
              tone={isReady(readiness) ? "ok" : undefined}
              value={readinessLabel(readiness) ?? <span className="ov-faint">Nothing started</span>}
              note={
                startedOf(readiness)
                  ? `Of ${plural(startedOf(readiness), "started capability", "started capabilities")}${readiness.notStarted.length ? `, ${readiness.notStarted.length} not started` : ""}`
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
                note={readinessLabel(leastReady.readiness)}
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

      <Section title={<>Where each <Term id="domain">domain</Term> stands</>} count={state.domains.length} note="Its capabilities' stability, beside what's left on them, least mature first.">
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

/* The overall maturity beside the name: its ring, whose popover breaks it down by project or by part of a feature, and its band. */
function MaturityMark({ state, maturity }: { state: DocketState; maturity: number }) {
  const several = state.projects.length > 1;
  const parts = state.features.flatMap((f) => f.parts.filter((p) => p.maturity !== null).map((p) => ({ key: `${f.id}@${p.domain}`, name: f.name, maturity: p.maturity! })));
  const breakdown = several
    ? state.projects.filter((p) => p.maturity !== null).map((p) => ({ key: p.id, name: p.name, maturity: p.maturity! }))
    : parts;
  const band = maturityBand(maturity);
  return (
    <span className="ov-maturity">
      <MaturityRing
        progress={maturity}
        subject="project"
        count={parts.length}
        label={several ? "Maturity across projects" : undefined}
        size={40}
        breakdown={
          <ul className="ov-breakdown">
            {[...breakdown]
              .sort((a, b) => b.maturity - a.maturity)
              .map((x) => (
                <li key={x.key}>
                  <span>{x.name}</span>
                  <RingGlyph progress={x.maturity} size={20} />
                </li>
              ))}
          </ul>
        }
      />
      <Box component="span" className="ov-band" sx={levelColor(band)}>
        {MATURITY_BANDS[band]}
      </Box>
    </span>
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
      const gaps = capabilities.flatMap((c) => gapsById(state, c.gaps));
      const decisions = capabilities.reduce((n, c) => n + openDecisions(c).length, openDecisions(domain).length);
      return { domain, levels, gaps, decisions, risk: riskAcross(state, gaps, capabilities) };
    })
    .sort((a, b) => (a.domain.maturity ?? -1) - (b.domain.maturity ?? -1));
  return (
    <>
      <ul className="ov-domains">
        {rows.map(({ domain, levels, gaps, decisions, risk }) => {
          const counts = BAR_ORDER.map((level) => ({ level, n: levels.filter((l) => l === level).length })).filter((c) => c.n);
          return (
            <li key={domain.id}>
              <a className="ov-link ov-ellipsis" href={docHref("domain", domain.id)}>
                {domain.name}
              </a>
              <Maturity value={domain.maturity} subject="domain" count={domain.features.length} of="none of its capabilities has a level yet" />
              <span className="ov-bar-cell">
                <span className="ov-bar" role="img" aria-label={counts.map((c) => `${c.n} ${levelLabel(c.level)}`).join(", ") || "No capabilities"}>
                  {counts.map(({ level, n }) => (
                    <Tip key={level ?? "draft"} title={`${n} ${levelLabel(level)}`}>
                      {level ? (
                        <Box component="span" className="ov-seg" sx={levelVar(level)} style={{ flex: n }} />
                      ) : (
                        <span className="ov-seg ov-seg-draft" style={{ flex: n }} />
                      )}
                    </Tip>
                  ))}
                </span>
                <span className="ov-count">{levels.length}</span>
              </span>
              <span className="ov-left">
                <GapsCell gaps={gaps} risk={risk} kind="product-gap" decisions={decisions} of={domain.name} href={docHref("domain", domain.id, "left")} />
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

/* One of the riskiest gaps: its impact, what it says, linking to its page, and what it's on. */
function GapRow({ state, gap }: { state: DocketState; gap: Gap }) {
  return (
    <li>
      <span className="ov-gap-impact">
        <ImpactBadge impact={gap.impact} eyebrow="Gap" />
      </span>
      <a className="ov-gap-summary" href={docHref("gap", gap.id)}>
        <InlineMarkdown text={gap.name} />
      </a>
      <GapOn state={state} gap={gap} />
    </li>
  );
}
