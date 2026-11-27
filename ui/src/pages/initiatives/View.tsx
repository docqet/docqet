// docqet:implements capability:initiative-scope
import Box from "@mui/material/Box";
import { MORE_ABOUT } from "../../components/markdown/Markdown";
import { StabilitySpread } from "../../components/stability/StabilitySpread";
import { Term } from "../../components/term/Term";
import { NAMES } from "../../components/names";
import { PersonaAvatar } from "../../components/Personas";
import { docDomains, find, type DocqetState, type Initiative, capabilitiesById } from "../../state";
import { ExposureStat, MaturityStat } from "../../components/indexParts";
import { docHref, type Route } from "../../routes";
import { Empty, Section, Stat, Tabs, currentTab, type TabDef } from "../../components/shell/layout";
import { type DocPageProps } from "../../components/doc/DocPage";
import { tabHref } from "../../components/doc/DocPage";
import { openAcross, OpenTab, TopGaps } from "../../components/doc/Open";
import { ImprovementsList, ImprovementsSection, ImprovementsStat, IMPROVEMENTS_TAB } from "../../components/improvements/Improvements";
import { DocView } from "../../components/doc/DocPage";
import { DocHeader } from "../../components/doc/DocPage";
import { DomainTrail } from "../../components/doc/DocPage";
import { hasBody } from "../../components/doc/About";
import { Bodies } from "../../components/doc/About";
import { ReadinessStat } from "../../components/doc/ReadinessParts";
import { ReadinessFor } from "../../components/doc/ReadinessParts";
import { CapabilityTable } from "../../components/doc/CapabilityTable";
import { Missing } from "../../components/doc/Missing";
import { docGo, Crumb, levelsSx, lineSx } from "../../components/doc/DocPage";

/* A initiative's page, or what shows when it isn't in the projects showing. */
export default function InitiativeView({ state, id, route }: { state: DocqetState; id: string; route: Route }) {
  const initiative = find(state.initiatives, id);
  if (!initiative) return <Missing kind="initiative" id={id} />;
  return <InitiativePage initiative={initiative} route={route} {...docGo(state)} />;
}

/*
 * An initiative: how ready its work is, and what it still needs, then its
 * capabilities, by feature, its improvements and what's open in them, and its body. Like a
 * persona's page, everything on it counts only its capabilities.
 */
export function InitiativePage({ initiative, route, ...go }: DocPageProps & { initiative: Initiative }) {
  const { state } = go;
  const capabilities = capabilitiesById(state, initiative.capabilities);
  const features = initiative.features.flatMap((id) => find(state.features, id) ?? []);
  const loose = capabilities.filter((c) => !c.feature);
  const domains = [...new Set(capabilities.flatMap((c) => docDomains(c)))];
  const readiness = initiative.readiness;
  const open = openAcross(capabilities, readiness, undefined, false);
  const personas = initiative.personas.flatMap((id) => find(state.personas, id) ?? []);
  const name = initiative.name;
  const tabs: TabDef[] = [
    { id: "readiness", label: "Readiness", term: "readiness" as const },
    { id: "capabilities", label: "Capabilities", term: "capability" as const, count: capabilities.length },
    { id: IMPROVEMENTS_TAB, label: "Improvements", term: "improvement" as const, count: readiness.improvements.length || undefined },
    ...(hasBody(initiative) ? [{ id: "about", label: "About" }] : []),
  ];
  const tab = currentTab(route, tabs);
  return (
    <DocView title={name} route={route}>
      <DocHeader
        state={state}
        kind="initiative"
        doc={initiative}
        trail={domains.length ? <DomainTrail state={state} domains={domains} /> : undefined}
        stats={
          <>
            <Stat
              label="Capabilities"
              term="capability"
              value={capabilities.length || "None"}
              note={capabilities.length ? <StabilitySpread levels={capabilities.map((c) => c.stability)} of={name} inButton /> : "in it, in this scope"}
              href={tabHref("capabilities")}
            />
            <MaturityStat
              maturity={initiative.maturity}
              band={initiative.band}
              subject="initiative"
              count={capabilities.filter((c) => c.stability).length}
              spread={capabilities.map((c) => c.stability)}
              of={name}
            />
            <ExposureStat exposure={initiative.exposure} risk={initiative.readiness.gaps} of={name} />
            <ReadinessStat readiness={readiness} tab="readiness" of={`Readiness of ${name}`} />
            <ImprovementsStat readiness={readiness} />
          </>
        }
      />
      <Tabs tabs={tabs} current={tab} />
      {tab === "readiness" ? (
        <>
          <ImprovementsSection readiness={readiness} />
          <Section title="Who it's for" term="persona" count={personas.length} note="How ready it is for each, from its capabilities that serve them.">
            {personas.length ? (
              <Box component="ul" sx={levelsSx}>
                {personas.map((p) => (
                  <li key={p.id}>
                    <Crumb href={docHref("persona", p.id)} icon={<PersonaAvatar persona={p} size={22} />}>
                      {p.name}
                    </Crumb>
                    <ReadinessFor state={state} forRef={`persona:${p.id}`} initiative={initiative.id} of={`${name}'s readiness for ${p.name}`} />
                  </li>
                ))}
              </Box>
            ) : (
              <Box component="p" sx={lineSx}>
                No persona says it's part of {name}.
              </Box>
            )}
          </Section>
          <Section title="By feature" count={features.length} note="How ready each feature's part of it is, from its capabilities in it.">
            {features.length ? (
              <Box component="ul" sx={levelsSx}>
                {features.map((f) => (
                  <li key={f.id}>
                    <Crumb href={docHref("feature", f.id)} icon={NAMES.feature.icon}>
                      {f.name}
                    </Crumb>
                    <ReadinessFor state={state} forRef={`feature:${f.id}`} initiative={initiative.id} of={`${f.name}'s readiness in ${name}`} />
                  </li>
                ))}
              </Box>
            ) : (
              <Box component="p" sx={lineSx}>
                None of its capabilities is in a feature.
              </Box>
            )}
          </Section>
          <TopGaps state={state} open={open} />
        </>
      ) : tab === "capabilities" ? (
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
                aside={<ReadinessFor state={state} forRef={`feature:${f.id}`} initiative={initiative.id} of={`${f.name}'s readiness in ${name}`} started />}
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
          {!capabilities.length ? <Empty>None of its capabilities is in the scope showing.</Empty> : null}
        </>
      ) : tab === IMPROVEMENTS_TAB ? (
        <>
          <ImprovementsList readiness={readiness} />
          <OpenTab {...go} open={open} nothing="Nothing open in it: no open decisions or product gaps are written down on its capabilities." />
        </>
      ) : (
        <Section title={MORE_ABOUT}>
          <Bodies {...go} doc={initiative} />
        </Section>
      )}
    </DocView>
  );
}
