import Box from "@mui/material/Box";
import { ConceptChips } from "../../components/Concepts";
import { MORE_ABOUT } from "../../components/markdown/Markdown";
import { StabilitySpread } from "../../components/stability/StabilitySpread";
import { Term } from "../../components/term/Term";
import { plural } from "../../components/names";
import { PersonaRows } from "../../components/Personas";
import { Maturity } from "../../components/maturity/Maturity";
import { initiativesOf } from "../../components/Initiatives";
import { domainName, featureConcepts, find, type DocqetState, type Feature, levelInDomain } from "../../state";
import { ExposureStat, MaturityStat } from "../../components/indexParts";
import { type Route } from "../../routes";
import { Empty, Section, Stat, Tabs, currentTab, type TabDef } from "../../components/shell/layout";
import { type DocPageProps } from "../../components/doc/DocPage";
import { tabHref } from "../../components/doc/DocPage";
import { openAcross, OpenTab, TopGaps } from "../../components/doc/Open";
import { ImprovementsList, ImprovementsSection, ImprovementsStat, IMPROVEMENTS_TAB } from "../../components/improvements/Improvements";
import { DocView } from "../../components/doc/DocPage";
import { DocHeader } from "../../components/doc/DocPage";
import { DomainCrumb } from "../../components/doc/DocPage";
import { DomainTrail } from "../../components/doc/DocPage";
import { Avatars } from "../../components/doc/DocPage";
import { Sources } from "../../components/doc/About";
import { hasBody } from "../../components/doc/About";
import { Bodies } from "../../components/doc/About";
import { ReadinessStat } from "../../components/doc/ReadinessParts";
import { DecidedTab } from "../../components/doc/DecidedTab";
import { CapabilityTable } from "../../components/doc/CapabilityTable";
import { StandingSummary } from "../../components/doc/RuleTable";
import { Missing } from "../../components/doc/Missing";
import { docGo, faintSx, levelsSx, lineSx } from "../../components/doc/DocPage";

/* A feature's page, or what shows when it isn't in the projects showing. */
export default function FeatureView({ state, id, route }: { state: DocqetState; id: string; route: Route }) {
  const feature = find(state.features, id);
  if (!feature) return <Missing kind="feature" id={id} />;
  return <FeaturePage feature={feature} route={route} {...docGo(state)} />;
}

/*
 * A feature: what it is, how mature and how ready, with what would make it
 * more ready, then its capabilities, its improvements and what's open across them, who it
 * serves, what it's decided, and its body.
 */
export function FeaturePage({ feature, route, ...go }: DocPageProps & { feature: Feature }) {
  const { state, onOpen, onConcept } = go;
  const capabilities = feature.capabilities.flatMap((id) => find(state.capabilities, id) ?? []);
  const concepts = featureConcepts(state, feature);
  const personas = state.personas.filter((p) => p.features.includes(feature.id));
  const readiness = feature.readiness;
  const open = openAcross(capabilities, readiness, { kind: "feature", doc: feature });
  const decided = feature.tradeoffs.length;
  const tabs: TabDef[] = [
    { id: "overview", label: "Overview" },
    { id: "capabilities", label: "Capabilities", term: "capability" as const, count: capabilities.length },
    { id: IMPROVEMENTS_TAB, label: "Improvements", term: "improvement" as const, count: readiness.improvements.length || undefined },
    ...(personas.length ? [{ id: "personas", label: "Personas", term: "persona" as const, count: personas.length }] : []),
    ...(decided ? [{ id: "decided", label: "Decided", count: decided }] : []),
    ...(hasBody(feature) ? [{ id: "about", label: "About" }] : []),
  ];
  const tab = currentTab(route, tabs);
  return (
    <DocView title={feature.name} route={route}>
      <DocHeader
        state={state}
        kind="feature"
        doc={feature}
        initiatives={initiativesOf(state, capabilities)}
        trail={<DomainTrail state={state} domains={feature.parts.map((p) => p.domain)} />}
        stats={
          <>
            <Stat
              label="Capabilities"
              term="capability"
              value={capabilities.length || "None"}
              note={<StabilitySpread levels={capabilities.map((c) => c.stability)} of={feature.name} inButton />}
              href={tabHref("capabilities")}
            />
            <MaturityStat
              maturity={feature.maturity}
              band={feature.band}
              subject="feature"
              count={capabilities.filter((c) => c.stability).length}
              spread={capabilities.map((c) => c.stability)}
              of={feature.name}
            />
            <ExposureStat exposure={feature.exposure} risk={feature.readiness.gaps} of={feature.name} />
            <ReadinessStat readiness={readiness} tab="overview" of={`Readiness of ${feature.name}`} />
            <ImprovementsStat readiness={readiness} />
            <Stat
              label="Serves"
              value={personas.length ? <Avatars personas={personas} /> : "Nobody yet"}
              note={personas.length ? plural(personas.length, "persona", "personas") : "No capability names a persona"}
              href={personas.length ? tabHref("personas") : undefined}
            />
            {feature.tradeoffs.length ? (
              <Stat label="Decided not to build" term="tradeoff" value={feature.tradeoffs.length} note="Left out on purpose" href={tabHref("decided")} />
            ) : null}
          </>
        }
      />
      <Tabs tabs={tabs} current={tab} />
      {tab === "overview" ? (
        <>
          <Sources {...go} kind="feature" doc={feature} title="What it is" />
          <Section title="Where it stands">
            {feature.parts.length > 1 ? (
              <Box component="ul" sx={levelsSx}>
                {feature.parts.map((p) => (
                  <li key={p.domain}>
                    <DomainCrumb state={state} id={p.domain} />
                    <Maturity
                      value={p.maturity}
                      subject="feature"
                      of="none of its capabilities here has a level yet"
                      spread={partLevels(state, p.capabilities, p.domain)}
                    />
                    <Box component="span" sx={faintSx}>
                      {plural(p.capabilities.length, "capability", "capabilities")}
                    </Box>
                  </li>
                ))}
              </Box>
            ) : null}
            {capabilities.length ? (
              <StandingSummary state={state} capabilities={capabilities} all={tabHref("capabilities")} />
            ) : (
              <Box component="p" sx={lineSx}>
                No capabilities yet.
              </Box>
            )}
          </Section>
          <ImprovementsSection readiness={readiness} />
          <TopGaps state={state} open={open} />
          {concepts.length ? (
            <Section
              title={
                <>
                  <Term id="concept">Concepts</Term> its capabilities use
                </>
              }
              count={concepts.length}
            >
              <ConceptChips concepts={concepts} onOpen={onConcept} scopeOf={(c) => domainName(state, c.domain)} />
            </Section>
          ) : null}
        </>
      ) : tab === "capabilities" ? (
        feature.parts.length ? (
          feature.parts.map((part) => (
            <Section
              key={part.domain}
              title={feature.parts.length > 1 ? `In ${domainName(state, part.domain)}` : <Term id="capability">Capabilities</Term>}
              count={part.capabilities.length}
              aside={
                feature.parts.length > 1 ? (
                  <Maturity
                    value={part.maturity}
                    subject="feature"
                    of="none of its capabilities here has a level yet"
                    spread={partLevels(state, part.capabilities, part.domain)}
                  />
                ) : undefined
              }
            >
              <CapabilityTable state={state} capabilities={part.capabilities.flatMap((id) => find(state.capabilities, id) ?? [])} domain={part.domain} />
            </Section>
          ))
        ) : (
          <Empty>A job the software doesn't do yet.</Empty>
        )
      ) : tab === IMPROVEMENTS_TAB ? (
        <>
          <ImprovementsList readiness={readiness} />
          <OpenTab {...go} open={open} here={feature} />
        </>
      ) : tab === "personas" ? (
        <Section
          title="Who it serves"
          term="persona"
          count={personas.length}
          note="How ready it is for each, from the levels of its capabilities that serve them."
        >
          <PersonaRows state={state} personas={personas} feature={feature} onOpen={onOpen} />
        </Section>
      ) : tab === "decided" ? (
        <DecidedTab
          {...go}
          doc={feature}
          tradeoffs={feature.tradeoffs}
          tradeoffTitle="Decided not to build"
          tradeoffNote="Left out on purpose, each with the benefit and drawback of leaving it out."
        />
      ) : (
        <Section title={MORE_ABOUT}>
          <Bodies {...go} doc={feature} />
        </Section>
      )}
    </DocView>
  );
}

/* The levels of a feature's capabilities in one domain, at their levels there. */
export const partLevels = (state: DocqetState, ids: string[], domain: string) =>
  ids.flatMap((id) => find(state.capabilities, id) ?? []).map((c) => levelInDomain(c, domain));
