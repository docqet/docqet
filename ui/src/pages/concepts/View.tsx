// docqet:implements capability:language
import Box from "@mui/material/Box";
import { ConceptChips, related } from "../../components/Concepts";
import { facets } from "../../components/Fields";
import { MORE_ABOUT } from "../../components/markdown/Markdown";
import { Term } from "../../components/term/Term";
import { CapabilityStability } from "../../components/CapabilityLabel";
import { NAMES, plural } from "../../components/names";
import { initiativesOf } from "../../components/Initiatives";
import { byFeature, find, type Concept, type DocqetState, capabilitiesById } from "../../state";
import { docHref, type Route } from "../../routes";
import { Empty, Section, Stat, Tabs, currentTab, type TabDef } from "../../components/shell/layout";
import { type DocPageProps } from "../../components/doc/DocPage";
import { tabHref } from "../../components/doc/DocPage";
import { DocView } from "../../components/doc/DocPage";
import { DocHeader } from "../../components/doc/DocPage";
import { Sources } from "../../components/doc/About";
import { hasBody } from "../../components/doc/About";
import { Bodies } from "../../components/doc/About";
import { RuleTable } from "../../components/doc/RuleTable";
import { DocRows } from "../../components/doc/DocRows";
import { Missing } from "../../components/doc/Missing";
import { docGo, cardSx, Crumb, faintSx } from "../../components/doc/DocPage";

/* A concept's page, or what shows when it isn't in the projects showing. */
export default function ConceptView({ state, id, route }: { state: DocqetState; id: string; route: Route }) {
  const concept = find(state.concepts, id);
  if (!concept) return <Missing kind="concept" id={id} />;
  return <ConceptPage concept={concept} route={route} {...docGo(state)} />;
}

/*
 * A concept: what it means, then the capabilities that use it, the rules
 * that refer to it. A concept is small,
 * so a tab with nothing in it is left out.
 */
export function ConceptPage({ concept, route, ...go }: DocPageProps & { concept: Concept }) {
  const { state, onConcept } = go;
  const groups = byFeature(state, concept.capabilities);
  const rules = concept.rules.flatMap((id) => find(state.rules, id) ?? []);
  const others = related(state, concept);
  const fielded = concept.from.some((f) => facets("concept", f, go).length) || concept.from.length > 1;
  const tabs: TabDef[] = [
    { id: "meaning", label: "Meaning" },
    ...(concept.capabilities.length ? [{ id: "used", label: "Used by", term: "capability" as const, count: concept.capabilities.length }] : []),
    ...(rules.length ? [{ id: "rules", label: "Rules", term: "rule" as const, count: rules.length }] : []),
  ];
  const tab = currentTab(route, tabs);
  const file = (
    <Box component="code" sx={faintSx}>
      {concept.file}
    </Box>
  );
  return (
    <DocView title={concept.name} route={route}>
      <DocHeader
        state={state}
        kind="concept"
        doc={concept}
        initiatives={initiativesOf(state, capabilitiesById(state, concept.capabilities))}
        stats={
          <>
            <Stat
              label="Used by"
              term="capability"
              value={plural(concept.capabilities.length, "capability", "capabilities")}
              note={plural(groups.filter((g) => g.feature).length, "feature", "features")}
              href={concept.capabilities.length ? tabHref("used") : undefined}
            />
            <Stat label="Referred to by" term="rule" value={plural(rules.length, "rule", "rules")} href={rules.length ? tabHref("rules") : undefined} />
          </>
        }
      />
      <Tabs tabs={tabs} current={tab} />
      {tab === "meaning" ? (
        <>
          <Sources {...go} kind="concept" doc={concept} title="What it means" aside={file} />
          {hasBody(concept) ? (
            <Section title={MORE_ABOUT} aside={fielded ? undefined : file}>
              <Bodies {...go} doc={concept} />
            </Section>
          ) : null}
          {others.length ? (
            <Section
              title={
                <>
                  Related <Term id="concept">concepts</Term>
                </>
              }
              count={others.length}
            >
              <ConceptChips concepts={others} onOpen={onConcept} />
            </Section>
          ) : null}
          {!fielded && !hasBody(concept) && !others.length ? <Empty>Nothing more is written about it than what's above.</Empty> : null}
        </>
      ) : tab === "used" ? (
        groups.map(({ feature, capabilities }) => (
          <Section
            key={feature?.id ?? ""}
            title={
              feature ? (
                <Crumb href={docHref("feature", feature.id)} icon={NAMES.feature.icon}>
                  {feature.name}
                </Crumb>
              ) : (
                "Not in a feature"
              )
            }
            count={capabilities.length}
          >
            <Box sx={cardSx}>
              <DocRows
                rows={capabilities.map((c) => ({
                  key: c.id,
                  href: docHref("capability", c.id),
                  icon: NAMES.capability.icon,
                  name: c.name,
                  summary: c.description,
                  mark: <CapabilityStability level={c.stability} name={c.name} focusable={false} />,
                }))}
              />
            </Box>
          </Section>
        ))
      ) : (
        <Section
          title={
            <>
              <Term id="rule">Rules</Term> that refer to it
            </>
          }
          count={rules.length}
        >
          <RuleTable rules={rules} />
        </Section>
      )}
    </DocView>
  );
}
