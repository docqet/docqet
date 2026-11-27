// docqet:implements capability:problems
import Box from "@mui/material/Box";
import { InlineMarkdown, MORE_ABOUT } from "../../components/markdown/Markdown";
import { StabilitySpread } from "../../components/stability/StabilitySpread";
import { Term } from "../../components/term/Term";
import { NAMES } from "../../components/names";
import { PersonaRows } from "../../components/Personas";
import { ConstraintIcon } from "../../components/names";
import { areasOf, byFeature, capabilitiesById, find, type DocqetState, type Problem } from "../../state";
import { ExposureStat, MaturityStat } from "../../components/indexParts";
import { docHref, type Route } from "../../routes";
import { Empty, Section, Stat, Tabs, currentTab, type TabDef } from "../../components/shell/layout";
import { Avatars, docGo, Crumb, DocHeader, DocView, AreaTrail, levelsSx, lineSx, tabHref, type DocPageProps } from "../../components/doc/DocPage";
import { openAcross, OpenTab, TopGaps } from "../../components/doc/Open";
import { ImprovementsList, ImprovementsSection, ImprovementsStat, IMPROVEMENTS_TAB } from "../../components/improvements/Improvements";
import { Bodies, hasBody, Sources } from "../../components/doc/About";
import { ReadinessFor, ReadinessStat } from "../../components/doc/ReadinessParts";
import { CapabilityTable } from "../../components/doc/CapabilityTable";
import { Missing } from "../../components/doc/Missing";

/* A problem's page, or what shows when it isn't in the projects showing. */
export default function ProblemView({ state, id, route }: { state: DocqetState; id: string; route: Route }) {
  const problem = find(state.problems, id);
  if (!problem) return <Missing kind="problem" id={id} />;
  return <ProblemPage problem={problem} route={route} {...docGo(state)} />;
}

/*
 * A problem: what it costs, who has it, and how ready what solves it is, by
 * feature, then the capabilities that solve it, by feature, their
 * improvements and what's open in them (only what someone using it would
 * notice), and its body. Like a persona's page, everything on it counts only
 * the capabilities that solve it. One nothing solves says so.
 */
export function ProblemPage({ problem, route, ...go }: DocPageProps & { problem: Problem }) {
  const { state, onOpen } = go;
  const capabilities = capabilitiesById(state, problem.capabilities);
  const groups = byFeature(state, problem.capabilities);
  const features = groups.flatMap((g) => g.feature ?? []);
  const loose = groups.find((g) => !g.feature)?.capabilities ?? [];
  const personas = problem.personas.flatMap((id) => find(state.personas, id) ?? []);
  const areas = areasOf(state, capabilities);
  const readiness = problem.readiness;
  const open = openAcross(capabilities, readiness, undefined, false);
  const name = problem.name;
  const of = `what solves “${name}”`;
  const tabs: TabDef[] = [
    { id: "readiness", label: "Readiness", term: "readiness" as const },
    { id: "solves", label: "What solves it", term: "capability" as const, count: capabilities.length },
    { id: IMPROVEMENTS_TAB, label: "Improvements", term: "improvement" as const, count: readiness.parts.length || undefined },
    ...(hasBody(problem) ? [{ id: "about", label: "About" }] : []),
  ];
  const tab = currentTab(route, tabs);
  return (
    <DocView title={name} route={route}>
      <DocHeader
        state={state}
        kind="problem"
        doc={problem}
        trail={areas.length ? <AreaTrail state={state} areas={areas} /> : undefined}
        stats={
          <>
            <Stat
              label="Who has it"
              term="persona"
              value={personas.length ? <Avatars personas={personas} /> : "No one"}
              note={personas.length === 1 ? personas[0].name : personas.length ? `${personas.length} personas` : "No persona is named"}
              href={tabHref("readiness")}
            />
            <Stat
              label="Solving it"
              term="capability"
              value={capabilities.length || "Nothing yet"}
              note={capabilities.length ? <StabilitySpread levels={capabilities.map((c) => c.stability)} of={of} inButton /> : "No capability solves it"}
              href={tabHref("solves")}
            />
            <MaturityStat
              maturity={problem.maturity}
              band={problem.band}
              subject="problem"
              count={capabilities.filter((c) => c.stability).length}
              spread={capabilities.map((c) => c.stability)}
              of={of}
            />
            <ExposureStat exposure={problem.exposure} risk={readiness.gaps} of={of} />
            <ReadinessStat readiness={readiness} tab="readiness" of={`Readiness of ${of}`} />
            <ImprovementsStat readiness={readiness} />
          </>
        }
        under={
          problem.cost ? (
            <Box
              sx={{
                maxWidth: 760,
                mt: -1,
                mb: 3,
                px: 1.75,
                py: 1.25,
                fontSize: 14,
                lineHeight: 1.5,
                bgcolor: "problem.soft",
                borderLeft: 3,
                borderColor: "problem.main",
                borderRadius: "4px",
              }}
            >
              <Box component="span" sx={{ display: "block", typography: "overline", color: "text.secondary" }}>
                What it costs
              </Box>
              <InlineMarkdown text={problem.cost} />
            </Box>
          ) : undefined
        }
      />
      <Tabs tabs={tabs} current={tab} />
      {tab === "readiness" ? (
        <>
          <Sources {...go} kind="problem" doc={problem} title="What it is" />
          <Section title="Who has it" term="persona" count={personas.length}>
            {personas.length ? (
              <PersonaRows state={state} personas={personas} onOpen={onOpen} />
            ) : (
              <Box component="p" sx={lineSx}>
                No persona is named.
              </Box>
            )}
          </Section>
          {problem.constraints.length ? <SubjectTo state={state} problem={problem} /> : null}
          {capabilities.length ? (
            <>
              <ImprovementsSection readiness={readiness} />
              <Section title="By feature" count={features.length} note="How ready each feature is, from its capabilities that solve it.">
                {features.length ? (
                  <Box component="ul" sx={levelsSx}>
                    {features.map((f) => (
                      <li key={f.id}>
                        <Crumb href={docHref("feature", f.id)} icon={NAMES.feature.icon}>
                          {f.name}
                        </Crumb>
                        <ReadinessFor state={state} forRef={`problem:${problem.id},feature:${f.id}`} of={`${f.name}'s readiness for “${name}”`} />
                      </li>
                    ))}
                  </Box>
                ) : (
                  <Box component="p" sx={lineSx}>
                    What solves it is in no feature.
                  </Box>
                )}
              </Section>
              <TopGaps state={state} open={open} />
            </>
          ) : (
            <Section title="What solves it" term="capability">
              <Box component="p" sx={lineSx}>
                Nothing solves it yet. It&rsquo;s a problem the software doesn&rsquo;t answer yet.
              </Box>
            </Section>
          )}
        </>
      ) : tab === "solves" ? (
        <>
          {features.map((f) => (
            <Section
              key={f.id}
              title={
                <Crumb href={docHref("feature", f.id)} icon={NAMES.feature.icon}>
                  {f.name}
                </Crumb>
              }
              aside={<ReadinessFor state={state} forRef={`problem:${problem.id},feature:${f.id}`} of={`${f.name}'s readiness for “${name}”`} started />}
            >
              <CapabilityTable state={state} capabilities={capabilities.filter((c) => c.feature === f.id)} />
            </Section>
          ))}
          {loose.length ? (
            <Section
              title={
                <>
                  <Term id="capability">Capabilities</Term> in no <Term id="feature">feature</Term>
                </>
              }
              count={loose.length}
            >
              <CapabilityTable state={state} capabilities={loose} />
            </Section>
          ) : null}
          {!capabilities.length ? <Empty>Nothing solves it yet.</Empty> : null}
        </>
      ) : tab === IMPROVEMENTS_TAB ? (
        <>
          <ImprovementsList readiness={readiness} />
          <OpenTab {...go} open={open} nothing="Nothing open: no open decisions or product gaps are written down in what solves it." />
        </>
      ) : (
        <Section title={MORE_ABOUT}>
          <Bodies {...go} doc={problem} />
        </Section>
      )}
    </DocView>
  );
}

/*
 * The constraints a problem is subject to, its own and those that apply to
 * its whole project or product, each with whether anything solving it says it
 * keeps to it. One nothing solving it respects is shown as such: the
 * solution may break it without anyone having said otherwise.
 */
function SubjectTo({ state, problem }: { state: DocqetState; problem: Problem }) {
  const unaddressed = problem.constraints.filter((c) => c.unaddressed).length;
  return (
    <Section
      title="What any solution must keep to"
      term="constraint"
      count={problem.constraints.length}
      note={unaddressed ? `${unaddressed} that nothing says its solution keeps to.` : "Something says its solution keeps to each."}
    >
      <Box component="ul" sx={[levelsSx, { "& > li": { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 0.25 } }]}>
        {problem.constraints.map(({ constraint, broad, respectedBy, unaddressed }) => {
          const c = find(state.constraints, constraint);
          return (
            <li key={constraint}>
              <Crumb href={docHref("constraint", constraint)} icon={<ConstraintIcon />}>
                {c?.name ?? constraint}
              </Crumb>
              <Box component="span" sx={{ fontSize: 12.5, color: unaddressed ? "warning.main" : "text.secondary" }}>
                {unaddressed
                  ? broad
                    ? "Applies to everything, and nothing respects it yet"
                    : "Nothing solving it respects it yet"
                  : respectedBy.length
                    ? `Respected by ${respectedBy.length === 1 ? respectedBy[0] : `${respectedBy.length} parts of its solution`}`
                    : "Applies to everything, and is respected elsewhere"}
              </Box>
            </li>
          );
        })}
      </Box>
    </Section>
  );
}
