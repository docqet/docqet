// docqet:implements capability:constraints
import Box from "@mui/material/Box";
import { InlineMarkdown, MORE_ABOUT } from "../../components/markdown/Markdown";
import { StabilitySpread } from "../../components/stability/StabilitySpread";
import { Term } from "../../components/term/Term";
import { NAMES, plural } from "../../components/names";
import { TechnicalRows } from "../../components/Technical";
import { byFeature, capabilitiesById, docDomains, find, respecting, type Constraint, type DocqetState } from "../../state";
import { ExposureStat, MaturityStat } from "../../components/indexParts";
import { docHref, type Route } from "../../routes";
import { Empty, Section, Stat, Tabs, currentTab, type TabDef } from "../../components/shell/layout";
import { cardSx, docGo, Crumb, DocHeader, DocView, DomainTrail, levelsSx, lineSx, tabHref, type DocPageProps } from "../../components/doc/DocPage";
import { openAcross, OpenTab, TopGaps } from "../../components/doc/Open";
import { ImprovementsList, ImprovementsSection, ImprovementsStat, IMPROVEMENTS_TAB } from "../../components/improvements/Improvements";
import { Bodies, hasBody, Sources } from "../../components/doc/About";
import { ReadinessFor, ReadinessStat } from "../../components/doc/ReadinessParts";
import { CapabilityTable } from "../../components/doc/CapabilityTable";
import { RuleTable } from "../../components/doc/RuleTable";
import { Missing } from "../../components/doc/Missing";

/* A constraint's page, or what shows when it isn't in the projects showing. */
export default function ConstraintView({ state, id, route }: { state: DocqetState; id: string; route: Route }) {
  const constraint = find(state.constraints, id);
  if (!constraint) return <Missing kind="constraint" id={id} />;
  return <ConstraintPage constraint={constraint} route={route} {...docGo(state)} />;
}

/*
 * A constraint: where it comes from, and how ready what keeps to it is, by
 * feature, then the rules and mechanisms that respect it, with the
 * capabilities they bear on, their improvements and what's open in them
 * (only what someone using it would notice), and its body. Everything on it
 * counts only the capabilities it bears on: those following its rules, and
 * those its mechanisms apply to. One nothing respects says so.
 */
export function ConstraintPage({ constraint, route, ...go }: DocPageProps & { constraint: Constraint }) {
  const { state } = go;
  const rules = constraint.rules.flatMap((id) => find(state.rules, id) ?? []);
  const mechanisms = constraint.mechanisms.flatMap((id) => find(state.mechanisms, id) ?? []);
  const capabilities = capabilitiesById(state, constraint.capabilities);
  const features = byFeature(state, constraint.capabilities).flatMap((g) => g.feature ?? []);
  const domains = [...new Set([...rules.map((r) => r.domain), ...capabilities.flatMap((c) => docDomains(c))])];
  const readiness = constraint.readiness;
  const open = openAcross(capabilities, readiness, undefined, false);
  const name = constraint.name;
  const of = `what keeps to “${name}”`;
  const count = respecting(constraint);
  const tabs: TabDef[] = [
    { id: "readiness", label: "Readiness", term: "readiness" as const },
    { id: "respects", label: "What respects it", term: "rule" as const, count },
    { id: IMPROVEMENTS_TAB, label: "Improvements", term: "improvement" as const, count: readiness.areas.length || undefined },
    ...(hasBody(constraint) ? [{ id: "about", label: "About" }] : []),
  ];
  const tab = currentTab(route, tabs);
  return (
    <DocView title={name} route={route}>
      <DocHeader
        state={state}
        kind="constraint"
        doc={constraint}
        trail={domains.length ? <DomainTrail state={state} domains={domains} /> : undefined}
        stats={
          <>
            <Stat
              label="Respected by"
              term="rule"
              value={count || "Nothing yet"}
              note={
                count
                  ? [rules.length ? plural(rules.length, "rule", "rules") : "", mechanisms.length ? plural(mechanisms.length, "mechanism", "mechanisms") : ""]
                      .filter(Boolean)
                      .join(" · ")
                  : "No rule or mechanism respects it"
              }
              href={tabHref("respects")}
            />
            <Stat
              label="Bears on"
              term="capability"
              value={capabilities.length || "Nothing yet"}
              note={capabilities.length ? <StabilitySpread levels={capabilities.map((c) => c.stability)} of={of} inButton /> : "No capability keeps to it yet"}
              href={tabHref("respects")}
            />
            <MaturityStat
              maturity={constraint.maturity}
              band={constraint.band}
              subject="constraint"
              count={capabilities.filter((c) => c.stability).length}
              spread={capabilities.map((c) => c.stability)}
              of={of}
            />
            <ExposureStat exposure={constraint.exposure} risk={readiness.gaps} of={of} />
            <ReadinessStat readiness={readiness} tab="readiness" of={`Readiness of ${of}`} />
            <ImprovementsStat readiness={readiness} />
          </>
        }
        under={
          constraint.source ? (
            <Box
              sx={{
                maxWidth: 760,
                mt: -1,
                mb: 3,
                px: 1.75,
                py: 1.25,
                fontSize: 14,
                lineHeight: 1.5,
                bgcolor: "constraint.soft",
                borderLeft: 3,
                borderColor: "constraint.main",
                borderRadius: "4px",
              }}
            >
              <Box component="span" sx={{ display: "block", typography: "overline", color: "text.secondary" }}>
                Where it comes from
              </Box>
              <InlineMarkdown text={constraint.source} />
            </Box>
          ) : undefined
        }
      />
      <Tabs tabs={tabs} current={tab} />
      {tab === "readiness" ? (
        <>
          <Sources {...go} kind="constraint" doc={constraint} title="What it is" />
          {capabilities.length ? (
            <>
              <ImprovementsSection readiness={readiness} />
              <Section title="By feature" count={features.length} note="How ready each feature is, from its capabilities that keep to it.">
                {features.length ? (
                  <Box component="ul" sx={levelsSx}>
                    {features.map((f) => (
                      <li key={f.id}>
                        <Crumb href={docHref("feature", f.id)} icon={NAMES.feature.icon}>
                          {f.name}
                        </Crumb>
                        <ReadinessFor state={state} forRef={`constraint:${constraint.id},feature:${f.id}`} of={`${f.name}'s readiness for “${name}”`} />
                      </li>
                    ))}
                  </Box>
                ) : (
                  <Box component="p" sx={lineSx}>
                    What keeps to it is in no feature.
                  </Box>
                )}
              </Section>
              <TopGaps state={state} open={open} />
            </>
          ) : (
            <Section title="What keeps to it" term="capability">
              <Box component="p" sx={lineSx}>
                {count
                  ? "No capability follows the rules that respect it, and no mechanism that respects it applies to one yet."
                  : "Nothing respects it yet, so nothing says the software keeps to it."}
              </Box>
            </Section>
          )}
        </>
      ) : tab === "respects" ? (
        <>
          {rules.length ? (
            <Section title={<Term id="rule">Rules</Term>} count={rules.length} note="The software's promises that keep to it.">
              <RuleTable rules={rules} />
            </Section>
          ) : null}
          {mechanisms.length ? (
            <Section title={<Term id="mechanism">Mechanisms</Term>} count={mechanisms.length} note="How it's built to keep to it.">
              <Box sx={cardSx}>
                <TechnicalRows state={state} docs={mechanisms} />
              </Box>
            </Section>
          ) : null}
          {capabilities.length ? (
            <Section
              title="What it bears on"
              term="capability"
              count={capabilities.length}
              note="The capabilities following its rules, and those its mechanisms apply to."
            >
              <CapabilityTable state={state} capabilities={capabilities} />
            </Section>
          ) : null}
          {!count ? <Empty>Nothing respects it yet: no rule or mechanism says it keeps to it.</Empty> : null}
        </>
      ) : tab === IMPROVEMENTS_TAB ? (
        <>
          <ImprovementsList readiness={readiness} />
          <OpenTab {...go} open={open} nothing="Nothing open: no open decisions or product gaps are written down in what keeps to it." />
        </>
      ) : (
        <Section title={MORE_ABOUT}>
          <Bodies {...go} doc={constraint} />
        </Section>
      )}
    </DocView>
  );
}
