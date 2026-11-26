import { StabilityRubric } from "./components/Rubric";
import { ConceptChips } from "../../components/Concepts";
import { MORE_ABOUT } from "../../components/markdown/Markdown";
import { STABILITY } from "../../components/stability/stability";
import { StabilityMark } from "../../components/stability/StabilityMark";
import { Term } from "../../components/term/Term";
import { NAMES, plural } from "../../components/names";
import { TechnicalRows } from "../../components/Technical";
import { PersonaRows } from "../../components/Personas";
import { levelName } from "../../components/stability/stability";
import { ReadinessMark, needsLine } from "../../components/Readiness";
import { outcomesOf, builtOn, docDomains, domainName, find, nextLevel, projectName, type Capability, type DocketState } from "../../state";
import { ExposureStat } from "../../components/indexParts";
import { docHref, type Route } from "../../routes";
import { Section, Stat, Tabs, currentTab, type TabDef } from "../../components/shell/layout";
import { type DocPageProps } from "../../components/doc/DocPage";
import { tabHref } from "../../components/doc/DocPage";
import { DocView } from "../../components/doc/DocPage";
import { DocHeader } from "../../components/doc/DocPage";
import { DomainCrumb } from "../../components/doc/DocPage";
import { DomainTrail } from "../../components/doc/DocPage";
import { LevelName } from "../../components/doc/DocPage";
import { Sources } from "../../components/doc/About";
import { hasBody } from "../../components/doc/About";
import { Bodies } from "../../components/doc/About";
import { leftAcross } from "../../components/doc/Left";
import { leftTotal } from "../../components/doc/Left";
import { LeftStat } from "../../components/doc/Left";
import { LeftTab } from "../../components/doc/Left";
import { TopGaps } from "../../components/doc/Left";
import { DecidedTab } from "../../components/doc/DecidedTab";
import { RuleTable } from "../../components/doc/RuleTable";
import { EvidencePair } from "../../components/doc/EvidencePair";
import { Missing } from "../../components/doc/Missing";
import { docGo } from "../../components/doc/DocPage";

/* A capability's page, or what shows when it isn't in the projects showing. */
export default function CapabilityView({ state, id, route }: { state: DocketState; id: string; route: Route }) {
  const capability = find(state.capabilities, id);
  if (!capability) return <Missing kind="capability" id={id} />;
  return <CapabilityPage capability={capability} route={route} {...docGo(state)} />;
}

/*
 * A capability: what it does and where it stands, then what's left, the
 * rules it follows, what its level expects, how it's built,
 * what's been decided, and its body.
 */
export function CapabilityPage({ capability, route, ...go }: DocPageProps & { capability: Capability }) {
  const { state, onOpen, onConcept } = go;
  const concepts = capability.concepts.flatMap((id) => find(state.concepts, id) ?? []);
  const rules = capability.rules.flatMap((id) => find(state.rules, id) ?? []);
  const personas = capability.personas.flatMap((id) => find(state.personas, id) ?? []);
  const level = capability.stability;
  const next = nextLevel(level);
  const counts = rubricCounts(state, capability);
  const adds = next
    ? (state.rubric?.qualities ?? [])
        .flatMap((q) => q.levels)
        .filter((l) => l.level === next)
        .reduce((n, l) => n + l.outcomes.length, 0)
    : 0;
  const feature = capability.feature ? find(state.features, capability.feature) : undefined;
  const on = builtOn(state, capability);
  const places = capability.evidence.implements.length + capability.evidence.verifies.length;
  const readiness = capability.readiness;
  const left = leftAcross([capability], readiness);
  const decided = capability.tradeoffs.length;
  const ruleCount = (s: "gap" | "evidence" | "trust") => rules.filter((r) => capability.ruleStandings[r.id] === s).length;
  /* What it still needs to be ready: nothing, once it is, and nothing asked of a draft. */
  const needs = level ? (readiness.notReady.find((n) => n.capability.id === capability.id) ?? null) : null;

  const tabs: TabDef[] = [
    { id: "overview", label: "Overview" },
    { id: "left", label: "What's left", term: "gap" as const, count: leftTotal(left) || undefined },
    ...(rules.length ? [{ id: "rules", label: "Rules", term: "rule" as const, count: rules.length }] : []),
    ...(state.rubric ? [{ id: "stability", label: "Stability", term: "rubric" as const }] : []),
    ...(on.length || places ? [{ id: "built", label: "How it's built", count: on.length || undefined }] : []),
    ...(decided ? [{ id: "decided", label: "Decided", count: decided }] : []),
    ...(hasBody(capability) ? [{ id: "about", label: "About" }] : []),
  ];
  /* Links to the rubric can name it as a section, #rubric, or as older ones did, #expectations or #checklist. */
  const tab = currentTab(
    !route.tab && ["#checklist", "#expectations", "#rubric"].includes(window.location.hash) ? { ...route, tab: "stability" } : route,
    tabs,
  );
  const met = counts ? counts.count - counts.notMet - counts.byChoice - counts.open : 0;

  return (
    <DocView title={capability.name} route={route}>
      <DocHeader
        state={state}
        kind="capability"
        doc={capability}
        initiatives={capability.initiatives}
        trail={
          <>
            <DomainTrail state={state} domains={docDomains(capability)} />
            <span className="faint">›</span>
            {feature ? (
              <a className="page-crumb" href={docHref("feature", feature.id)}>
                {NAMES.feature.icon}
                {feature.name}
              </a>
            ) : (
              <span>Not in a feature</span>
            )}
          </>
        }
        marks={level ? <StabilityMark level={level} feature={capability.name} size="extra-long" /> : <span className="page-draft">Draft</span>}
        stats={
          <>
            <Stat
              label="Readiness"
              term="readiness"
              value={readiness.percent === null ? "Not started" : <ReadinessMark readiness={readiness} of={`Readiness of ${capability.name}`} inButton />}
              note={!level ? "A draft doesn't count" : !needs ? "Nothing left: at Beta or above, with no unacceptable gap" : needsLine(needs)}
              href={needs?.gaps.length ? tabHref("left") : undefined}
            />
            <ExposureStat exposure={capability.exposure} risk={capability.risk} of={capability.name} />
            <LeftStat left={left} of={capability.name} />
            <Stat
              label="Rules"
              term="rule"
              value={rules.length || "None"}
              note={
                rules.length
                  ? [
                      ...(ruleCount("gap") ? [`${ruleCount("gap")} not held yet`] : []),
                      ...(ruleCount("evidence") ? [`${ruleCount("evidence")} with evidence`] : []),
                      ...(ruleCount("trust") ? [`${ruleCount("trust")} on trust`] : []),
                    ].join(" · ")
                  : "None written down yet"
              }
              tone={ruleCount("gap") ? "warn" : undefined}
              href={rules.length ? tabHref("rules") : undefined}
            />
            {counts ? (
              <Stat
                label="Rubric"
                term="rubric"
                value={`${met} of ${counts.count}`}
                note={`${levelName(level)} outcomes met${counts.byChoice ? `, ${counts.byChoice} not by choice` : ""}${counts.open ? `, ${counts.open} open` : ""}`}
                tone={counts.notMet ? "warn" : "ok"}
                href={tabHref("stability")}
              />
            ) : (
              <Stat
                label="Rubric"
                term="rubric"
                value="Not started"
                note="A draft claims nothing on it yet"
                href={state.rubric ? tabHref("stability") : undefined}
              />
            )}
            <Stat
              label="Built on"
              term="component"
              value={on.length || "Nothing listed"}
              note={
                places
                  ? `Evidence in ${plural(places, "place", "places")}`
                  : on.length
                    ? plural(on.length, "mechanism or component", "mechanisms and components")
                    : "No mechanism or component lists it"
              }
              href={on.length || places ? tabHref("built") : undefined}
            />
          </>
        }
      />
      <Tabs tabs={tabs} current={tab} />
      {tab === "overview" ? (
        <>
          <Sources {...go} kind="capability" doc={capability} title="What it does" />
          <Section title="Its level">
            {capability.levels.length > 1 ? (
              <ul className="page-levels">
                {capability.levels.map((l) => (
                  <li key={`${l.project}:${l.domain}`}>
                    <DomainCrumb state={state} id={l.domain} />
                    <LevelName level={l.level} name={capability.name} named />
                    {state.projects.length > 1 ? <span className="faint">{projectName(state, l.project)}</span> : null}
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="page-line">
              {level ? `${STABILITY[level].name}: ${STABILITY[level].stability}.` : "A draft: declared, and not started."}{" "}
              {next ? (
                <>
                  Next is {STABILITY[next].name}, which adds {plural(adds, "outcome", "outcomes")} to meet.{" "}
                  {state.rubric ? <a href={tabHref("stability")}>See the rubric</a> : null}
                </>
              ) : (
                "GA is the top level."
              )}
            </p>
          </Section>
          <TopGaps state={state} left={left} here={capability} />
          {!left.gaps.length ? (
            <Section title="What's left" term="gap">
              <p className="page-line">
                {left.decisions ? (
                  <a href={tabHref("left")}>{plural(left.decisions, "open decision", "open decisions")}</a>
                ) : (
                  "Nothing left: no open decisions or gaps are written down."
                )}
              </p>
            </Section>
          ) : null}
          {personas.length ? (
            <Section title="Who it serves" term="persona" count={personas.length}>
              <PersonaRows state={state} personas={personas} onOpen={onOpen} />
            </Section>
          ) : null}
          {concepts.length ? (
            <Section
              title={
                <>
                  <Term id="concept">Concepts</Term> it uses
                </>
              }
              count={concepts.length}
            >
              <ConceptChips concepts={concepts} onOpen={onConcept} scopeOf={(c) => domainName(state, c.domain)} />
            </Section>
          ) : null}
        </>
      ) : tab === "left" ? (
        <LeftTab {...go} left={left} here={capability} />
      ) : tab === "rules" ? (
        <Section
          title={<Term id="rule">Rules</Term>}
          count={rules.length}
          note="Following a rule claims it holds. Evidence is optional: a rule with none holds on trust, unless a gap says it isn't held yet. Each rule's page has its evidence."
        >
          <RuleTable rules={rules} capability={capability} />
        </Section>
      ) : tab === "stability" && state.rubric ? (
        <Section title={<Term id="rubric">Stability rubric</Term>} id="rubric">
          <StabilityRubric key={capability.id} rubric={state.rubric} capability={capability} />
        </Section>
      ) : tab === "built" ? (
        <>
          {on.length ? (
            <Section title="Built on" term="component" count={on.length} note="The mechanisms that apply to it and the components that list it.">
              <div className="page-card">
                <TechnicalRows state={state} docs={on} />
              </div>
            </Section>
          ) : null}
          <Section
            title={<Term id="evidence">Evidence</Term>}
            count={places || undefined}
            note="Places in the code that name the capability itself, not one of its rules."
          >
            <EvidencePair state={state} doc={capability} />
          </Section>
        </>
      ) : tab === "decided" ? (
        <DecidedTab
          {...go}
          doc={capability}
          tradeoffs={capability.tradeoffs}
          tradeoffNote="Limits it has by choice, each with the benefit and drawback that came with it."
        />
      ) : (
        <Section title={MORE_ABOUT}>
          <Bodies {...go} doc={capability} />
        </Section>
      )}
    </DocView>
  );
}

/*
 * How many outcomes a capability's level expects, how many of those a gap
 * says aren't met, how many a tradeoff says aren't met by choice, how many an
 * open decision leaves open, and how many
 * a mechanism or component it's built on says it meets; or null with no
 * rubric, or for a draft, which claims none. An outcome nothing names counts
 * as met on its level's word.
 */
export function rubricCounts(state: DocketState, capability: Capability) {
  if (!state.rubric || capability.stability === null) return null;
  const standings = state.rubric.qualities
    .flatMap(outcomesOf)
    .map((o) => capability.outcomes[o.id]?.standing ?? "not-expected")
    .filter((s) => s !== "not-expected");
  const n = (standing: string) => standings.filter((s) => s === standing).length;
  return { count: standings.length, notMet: n("gap"), byChoice: n("tradeoff"), open: n("open"), evidence: n("evidence") };
}
