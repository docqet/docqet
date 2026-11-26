import Box from "@mui/material/Box";
import { MORE_ABOUT } from "../../components/markdown/Markdown";
import { StabilitySpread } from "../../components/stability/StabilitySpread";
import { Term } from "../../components/term/Term";
import { NAMES } from "../../components/names";
import { PersonaAvatar, personaNameAndRole } from "../../components/Personas";
import { docDomains, find, type DocqetState, type Persona } from "../../state";
import { ExposureStat, MaturityStat } from "../../components/indexParts";
import { docHref, type Route } from "../../routes";
import { Empty, Section, Stat, Tabs, currentTab, type TabDef } from "../../components/shell/layout";
import { type DocPageProps } from "../../components/doc/DocPage";
import { tabHref } from "../../components/doc/DocPage";
import { DocView } from "../../components/doc/DocPage";
import { DocHeader } from "../../components/doc/DocPage";
import { DomainTrail } from "../../components/doc/DocPage";
import { Sources } from "../../components/doc/About";
import { hasBody } from "../../components/doc/About";
import { Bodies } from "../../components/doc/About";
import { ReadinessStat } from "../../components/doc/ReadinessParts";
import { StillNeedsSection } from "../../components/doc/ReadinessParts";
import { ReadinessFor } from "../../components/doc/ReadinessParts";
import { leftAcross } from "../../components/doc/Left";
import { leftTotal } from "../../components/doc/Left";
import { LeftStat } from "../../components/doc/Left";
import { LeftTab } from "../../components/doc/Left";
import { TopGaps } from "../../components/doc/Left";
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
 * be, then what serves them, by feature, what's left for them (only what
 * someone using it would notice), and their body.
 */
export function PersonaPage({ persona, route, ...go }: DocPageProps & { persona: Persona }) {
  const { state } = go;
  const capabilities = persona.capabilities.flatMap((id) => find(state.capabilities, id) ?? []);
  const features = persona.features.flatMap((id) => find(state.features, id) ?? []);
  const loose = capabilities.filter((c) => !c.feature);
  const domains = [...new Set(capabilities.flatMap((c) => docDomains(c)))];
  const readiness = persona.readiness;
  const left = leftAcross(capabilities, readiness, undefined, false);
  const { name, role } = personaNameAndRole(persona);
  const tabs: TabDef[] = [
    { id: "readiness", label: "Readiness", term: "readiness" as const },
    { id: "serves", label: "What serves them", term: "capability" as const, count: capabilities.length },
    { id: "left", label: "What's left for them", term: "gap" as const, count: leftTotal(left) || undefined },
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
        trail={domains.length ? <DomainTrail state={state} domains={domains} /> : undefined}
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
            <LeftStat left={left} of={`what serves ${persona.name}`} />
          </>
        }
      />
      <Tabs tabs={tabs} current={tab} />
      {tab === "readiness" ? (
        <>
          <Sources {...go} kind="persona" doc={persona} title="Who they are" />
          <StillNeedsSection
            readiness={readiness}
            readyText={`Ready for ${name}: everything started that serves them is at Beta or above, with no unacceptable gap.`}
          />
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
          <TopGaps state={state} left={left} />
        </>
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
                <CapabilityTable state={state} capabilities={capabilities.filter((c) => c.feature === f.id)} technical={false} />
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
              <CapabilityTable state={state} capabilities={loose} technical={false} />
            </Section>
          ) : null}
          {!capabilities.length ? <Empty>Nothing serves them yet.</Empty> : null}
        </>
      ) : tab === "left" ? (
        <LeftTab {...go} left={left} nothing="Nothing left for them: no open decisions or product gaps are written down in what serves them." />
      ) : (
        <Section title={MORE_ABOUT}>
          <Bodies {...go} doc={persona} />
        </Section>
      )}
    </DocView>
  );
}
