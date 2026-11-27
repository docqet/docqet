// docqet:implements capability:personas
import Box from "@mui/material/Box";
import { MORE_ABOUT } from "../../components/markdown/Markdown";
import { StabilitySpread } from "../../components/stability/StabilitySpread";
import { Term } from "../../components/term/Term";
import { NAMES } from "../../components/names";
import { PersonaAvatar, personaNameAndRole } from "../../components/Personas";
import { ProblemRows } from "../../components/Problems";
import { areasOf, find, type DocqetState, type Persona } from "../../state";
import { ExposureStat, MaturityStat } from "../../components/indexParts";
import { docHref, type Route } from "../../routes";
import { Empty, Section, Stat, Tabs, currentTab, type TabDef } from "../../components/shell/layout";
import { type DocPageProps } from "../../components/doc/DocPage";
import { tabHref } from "../../components/doc/DocPage";
import { openAcross, OpenTab, TopGaps } from "../../components/doc/Open";
import { ImprovementsList, ImprovementsSection, ImprovementsStat, IMPROVEMENTS_TAB } from "../../components/improvements/Improvements";
import { DocView } from "../../components/doc/DocPage";
import { DocHeader } from "../../components/doc/DocPage";
import { AreaTrail } from "../../components/doc/DocPage";
import { Sources } from "../../components/doc/About";
import { hasBody } from "../../components/doc/About";
import { Bodies } from "../../components/doc/About";
import { ReadinessStat } from "../../components/doc/ReadinessParts";
import { ReadinessFor } from "../../components/doc/ReadinessParts";
import { CapabilityTable } from "../../components/doc/CapabilityTable";
import { Missing } from "../../components/doc/Missing";
import { docGo, Crumb, levelsSx, lineSx } from "../../components/doc/DocPage";

/* A persona's page, or what shows when it isn't in the projects showing. */
export default function PersonaView({ state, id, route }: { state: DocqetState; id: string; route: Route }) {
  const persona = find(state.personas, id);
  if (!persona) return <Missing kind="persona" id={id} />;
  return <PersonaPage persona={persona} route={route} {...docGo(state)} />;
}

/*
 * A persona: how ready the software is for them, and what it still needs to
 * be, then the problems they have, what serves them, by feature, its improvements, and what's open for them (only what
 * someone using it would notice), and their body.
 */
export function PersonaPage({ persona, route, ...go }: DocPageProps & { persona: Persona }) {
  const { state } = go;
  const capabilities = persona.capabilities.flatMap((id) => find(state.capabilities, id) ?? []);
  const problems = persona.problems.flatMap((id) => find(state.problems, id) ?? []);
  const features = persona.features.flatMap((id) => find(state.features, id) ?? []);
  const loose = capabilities.filter((c) => !c.feature);
  const areas = areasOf(state, capabilities);
  const readiness = persona.readiness;
  const open = openAcross(capabilities, readiness, undefined, false);
  const { name, role } = personaNameAndRole(persona);
  const tabs: TabDef[] = [
    { id: "readiness", label: "Readiness", term: "readiness" as const },
    { id: "problems", label: "Their problems", term: "problem" as const, count: problems.length },
    { id: "serves", label: "What serves them", term: "capability" as const, count: capabilities.length },
    { id: IMPROVEMENTS_TAB, label: "Improvements", term: "improvement" as const, count: readiness.parts.length || undefined },
    ...(hasBody(persona) ? [{ id: "about", label: "About" }] : []),
  ];
  const tab = currentTab(route, tabs);
  return (
    <DocView title={name} route={route}>
      <DocHeader
        state={state}
        kind="persona"
        doc={persona}
        initiatives={persona.initiatives}
        kindNote={role}
        title={
          <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1.75 }}>
            <PersonaAvatar persona={persona} size={44} />
            {name}
          </Box>
        }
        trail={areas.length ? <AreaTrail state={state} areas={areas} /> : undefined}
        stats={
          <>
            <Stat
              label="Capabilities"
              term="capability"
              value={capabilities.length || "None"}
              note={
                capabilities.length ? (
                  <StabilitySpread levels={capabilities.map((c) => c.stability)} of={`what serves ${persona.name}`} inButton />
                ) : (
                  "that serve them"
                )
              }
              href={tabHref("serves")}
            />
            <MaturityStat
              maturity={persona.maturity}
              band={persona.band}
              subject="persona"
              count={capabilities.filter((c) => c.stability).length}
              spread={capabilities.map((c) => c.stability)}
              of={`what serves ${persona.name}`}
            />
            <ExposureStat exposure={persona.exposure} risk={persona.readiness.gaps} of={`what serves ${persona.name}`} />
            <ReadinessStat readiness={readiness} tab="readiness" of={`Readiness for ${name}`} />
            <ImprovementsStat readiness={readiness} />
          </>
        }
      />
      <Tabs tabs={tabs} current={tab} />
      {tab === "readiness" ? (
        <>
          <Sources {...go} kind="persona" doc={persona} title="Who they are" />
          <ImprovementsSection readiness={readiness} />
          <Section title="By feature" count={features.length} note="How ready each feature is for them, from its capabilities that serve them.">
            {features.length ? (
              <Box component="ul" sx={levelsSx}>
                {features.map((f) => (
                  <li key={f.id}>
                    <Crumb href={docHref("feature", f.id)} icon={NAMES.feature.icon}>
                      {f.name}
                    </Crumb>
                    <ReadinessFor state={state} forRef={`persona:${persona.id},feature:${f.id}`} of={`${f.name}'s readiness for ${name}`} />
                  </li>
                ))}
              </Box>
            ) : (
              <Box component="p" sx={lineSx}>
                No feature serves them yet.
              </Box>
            )}
          </Section>
          <TopGaps state={state} open={open} />
        </>
      ) : tab === "problems" ? (
        <Section title="Their problems" term="problem" count={problems.length} note="What goes wrong for them today, and how ready what solves each is.">
          {problems.length ? <ProblemRows problems={problems} /> : <Empty>No problem names them yet.</Empty>}
        </Section>
      ) : tab === "serves" ? (
        <>
          {features.map((f) => {
            return (
              <Section
                key={f.id}
                title={
                  <Crumb href={docHref("feature", f.id)} icon={NAMES.feature.icon}>
                    {f.name}
                  </Crumb>
                }
                aside={<ReadinessFor state={state} forRef={`persona:${persona.id},feature:${f.id}`} of={`${f.name}'s readiness for ${name}`} started />}
              >
                <CapabilityTable state={state} capabilities={capabilities.filter((c) => c.feature === f.id)} />
              </Section>
            );
          })}
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
          {!capabilities.length ? <Empty>Nothing serves them yet.</Empty> : null}
        </>
      ) : tab === IMPROVEMENTS_TAB ? (
        <>
          <ImprovementsList readiness={readiness} />
          <OpenTab {...go} open={open} nothing="Nothing open for them: no open decisions or product gaps are written down in what serves them." />
        </>
      ) : (
        <Section title={MORE_ABOUT}>
          <Bodies {...go} doc={persona} />
        </Section>
      )}
    </DocView>
  );
}
