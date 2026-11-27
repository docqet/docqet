// docqet:implements capability:overview
import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import { ConceptIcon } from "../../components/Concepts";
import { MORE_ABOUT } from "../../components/markdown/Markdown";
import { MaturityRing } from "../../components/maturity/MaturityRing";
import { StabilitySpread } from "../../components/stability/StabilitySpread";
import { Term } from "../../components/term/Term";
import { CapabilityStability } from "../../components/CapabilityLabel";
import { NAMES, plural } from "../../components/names";
import { initiativesOf } from "../../components/Initiatives";
import { domainName, domainCapabilities, find, partOf, type DocqetState, type Domain, levelInDomain } from "../../state";
import { ExposureStat, MaturityStat } from "../../components/indexParts";
import { docHref, type Route } from "../../routes";
import { Empty, Section, Stat, Tabs, currentTab, type TabDef } from "../../components/shell/layout";
import { type DocPageProps } from "../../components/doc/DocPage";
import { tabHref } from "../../components/doc/DocPage";
import { openAcross, OpenTab, TopGaps } from "../../components/doc/Open";
import { ImprovementsList, ImprovementsSection, ImprovementsStat, IMPROVEMENTS_TAB } from "../../components/improvements/Improvements";
import { DocView } from "../../components/doc/DocPage";
import { DocHeader } from "../../components/doc/DocPage";
import { Sources } from "../../components/doc/About";
import { hasBody } from "../../components/doc/About";
import { Bodies } from "../../components/doc/About";
import { ReadinessStat } from "../../components/doc/ReadinessParts";
import { CapabilityTable } from "../../components/doc/CapabilityTable";
import { StandingSummary } from "../../components/doc/RuleTable";
import { RuleTable } from "../../components/doc/RuleTable";
import { DocRows } from "../../components/doc/DocRows";
import { Missing } from "../../components/doc/Missing";
import { docGo, cardSx, lineSx } from "../../components/doc/DocPage";

/* A feature in a domain, as a card that's a link to its page, lit in the accent on hover. */
const featureCardSx: SystemStyleObject<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 1,
  px: 2,
  py: 1.75,
  color: "inherit",
  textDecoration: "none",
  bgcolor: (t) => `color-mix(in srgb, ${t.vars.palette.text.primary} 2%, transparent)`,
  border: 1,
  borderColor: "divider",
  borderRadius: "10px",
  "&:hover": { bgcolor: "surface.accentSoft", borderColor: "primary.main" },
};

/* A domain's page, or what shows when it isn't in the projects showing. */
export default function DomainView({ state, id, route }: { state: DocqetState; id: string; route: Route }) {
  const domain = find(state.domains, id);
  if (!domain) return <Missing kind="domain" id={id} />;
  return <DomainPage domain={domain} route={route} {...docGo(state)} />;
}

/*
 * A domain: what it is, how mature and how ready, with what it still needs
 * to be ready, then its features, its language (the concepts and rules it
 * defines), its improvements and what's open across it, and its body.
 */
export function DomainPage({ domain, route, ...go }: DocPageProps & { domain: Domain }) {
  const { state } = go;
  const features = domain.features.flatMap((id) => find(state.features, id) ?? []);
  const loose = domain.capabilities.flatMap((id) => find(state.capabilities, id) ?? []);
  const capabilities = domainCapabilities(state, domain);
  const concepts = state.concepts.filter((c) => c.domain === domain.id).sort((a, b) => a.name.localeCompare(b.name));
  const rules = state.rules.filter((r) => r.domain === domain.id);
  const readiness = domain.readiness;
  const open = openAcross(capabilities, readiness, { kind: "domain", doc: domain });
  const tabs: TabDef[] = [
    { id: "overview", label: "Overview" },
    { id: "features", label: "Features", term: "feature" as const, count: features.length },
    ...(concepts.length || rules.length ? [{ id: "language", label: "Language", term: "concept" as const, count: concepts.length + rules.length }] : []),
    { id: IMPROVEMENTS_TAB, label: "Improvements", term: "improvement" as const, count: readiness.areas.length || undefined },
    ...(hasBody(domain) ? [{ id: "about", label: "About" }] : []),
  ];
  const tab = currentTab(route, tabs);
  return (
    <DocView title={domain.name} route={route}>
      <DocHeader
        state={state}
        kind="domain"
        doc={domain}
        initiatives={initiativesOf(state, capabilities)}
        stats={
          <>
            <Stat
              label="Features"
              term="feature"
              value={features.length || "None"}
              note={loose.length ? `and ${plural(loose.length, "capability", "capabilities")} in none` : "that it has a part in"}
              href={tabHref("features")}
            />
            <Stat
              label="Capabilities"
              term="capability"
              value={capabilities.length || "None"}
              note={<StabilitySpread levels={capabilities.map((c) => levelInDomain(c, domain.id))} of={domain.name} inButton />}
              href={tabHref("features")}
            />
            <MaturityStat
              maturity={domain.maturity}
              band={domain.band}
              subject="domain"
              count={domain.features.filter((id) => partOf(find(state.features, id), domain.id)?.maturity != null).length}
              spread={domain.features.map((id) => partOf(find(state.features, id), domain.id)?.band ?? null)}
              of={domain.name}
            />
            <ExposureStat exposure={domain.exposure} risk={domain.readiness.gaps} of={domain.name} />
            <ReadinessStat readiness={readiness} tab="overview" of={`Readiness of ${domain.name}`} />
            <Stat
              label="Language"
              term="concept"
              value={plural(concepts.length, "concept", "concepts")}
              note={plural(rules.length, "rule", "rules")}
              href={concepts.length || rules.length ? tabHref("language") : undefined}
            />
            <ImprovementsStat readiness={readiness} />
          </>
        }
      />
      <Tabs tabs={tabs} current={tab} />
      {tab === "overview" ? (
        <>
          <Sources {...go} kind="domain" doc={domain} title="What it is" />
          <Section title="Where it stands">
            {capabilities.length ? (
              <StandingSummary state={state} capabilities={capabilities} domain={domain.id} all={tabHref("features")} />
            ) : (
              <Box component="p" sx={lineSx}>
                A part of the business the software doesn't serve yet.
              </Box>
            )}
          </Section>
          <ImprovementsSection readiness={readiness} here={domain} />
          <TopGaps state={state} open={open} />
        </>
      ) : tab === "features" ? (
        <>
          <Section title={<Term id="feature">Features</Term>} count={features.length}>
            {features.length ? (
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))", gap: 1.5 }}>
                {features.map((f) => {
                  const part = partOf(f, domain.id);
                  const caps = (part?.capabilities ?? []).flatMap((id) => find(state.capabilities, id) ?? []);
                  const elsewhere = f.parts.filter((p) => p.domain !== domain.id).map((p) => domainName(state, p.domain));
                  return (
                    <Box component="a" key={f.id} href={docHref("feature", f.id)} sx={featureCardSx}>
                      <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: 14.5 }}>
                        {NAMES.feature.icon}
                        <Box component="strong" sx={{ flex: 1 }}>
                          {f.name}
                        </Box>
                        {part?.maturity != null ? (
                          <MaturityRing
                            progress={part.maturity}
                            subject="feature"
                            size={22}
                            focusable={false}
                            spread={caps.map((c) => c.levels.find((l) => l.domain === domain.id)?.level ?? c.stability)}
                          />
                        ) : null}
                      </Box>
                      {f.description ? (
                        <Box component="span" sx={{ fontSize: 13, color: "text.secondary" }}>
                          {f.description}
                        </Box>
                      ) : null}
                      <Box component="ul" sx={{ display: "flex", flexDirection: "column", gap: 0.5, fontSize: 13 }}>
                        {caps.map((c) => {
                          const level = c.levels.find((l) => l.domain === domain.id)?.level ?? c.stability;
                          return (
                            <Box component="li" key={c.id} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <CapabilityStability level={level} name={c.name} focusable={false} />
                              {c.name}
                            </Box>
                          );
                        })}
                      </Box>
                      {elsewhere.length ? (
                        <Box component="span" sx={{ fontSize: 12, color: "text.disabled" }}>
                          Also in {elsewhere.join(", ")}
                        </Box>
                      ) : null}
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Empty>A part of the business the software doesn't serve yet.</Empty>
            )}
          </Section>
          {loose.length ? (
            <Section
              title={
                <>
                  <Term id="capability">Capabilities</Term> in no <Term id="feature">feature</Term>
                </>
              }
              count={loose.length}
            >
              <CapabilityTable state={state} capabilities={loose} domain={domain.id} />
            </Section>
          ) : null}
        </>
      ) : tab === "language" ? (
        <>
          {concepts.length ? (
            <Section title={<Term id="concept">Concepts</Term>} count={concepts.length} note="What its words mean here.">
              <Box sx={cardSx}>
                <DocRows
                  rows={concepts.map((c) => ({
                    key: c.id,
                    href: docHref("concept", c.id),
                    icon: <ConceptIcon size={15} />,
                    name: c.name,
                    summary: c.description,
                  }))}
                />
              </Box>
            </Section>
          ) : null}
          {rules.length ? (
            <Section title={<Term id="rule">Rules</Term>} count={rules.length} note="What must always be true, or must never happen, here.">
              <RuleTable rules={rules} />
            </Section>
          ) : null}
        </>
      ) : tab === IMPROVEMENTS_TAB ? (
        <>
          <ImprovementsList readiness={readiness} here={domain} />
          <OpenTab {...go} open={open} here={domain} />
        </>
      ) : (
        <Section title={MORE_ABOUT}>
          <Bodies {...go} doc={domain} />
        </Section>
      )}
    </DocView>
  );
}
