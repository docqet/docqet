// docqet:implements capability:overview
import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import { MORE_ABOUT } from "../../components/markdown/Markdown";
import { MaturityRing } from "../../components/maturity/MaturityRing";
import { StabilitySpread } from "../../components/stability/StabilitySpread";
import { Term } from "../../components/term/Term";
import { CapabilityStability } from "../../components/CapabilityLabel";
import { NAMES } from "../../components/names";
import { initiativesOf } from "../../components/Initiatives";
import { areaCapabilities, find, type Area, type DocqetState } from "../../state";
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
import { StandingSummary } from "../../components/doc/RuleTable";
import { Missing } from "../../components/doc/Missing";
import { docGo, lineSx } from "../../components/doc/DocPage";

/* A feature in an area, as a card that's a link to its page, lit in the accent on hover. */
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

/* An area's page, or what shows when it isn't in the projects showing. */
export default function AreaView({ state, id, route }: { state: DocqetState; id: string; route: Route }) {
  const area = find(state.areas, id);
  if (!area) return <Missing kind="area" id={id} />;
  return <AreaPage area={area} route={route} {...docGo(state)} />;
}

/*
 * An area: what it is, how mature and how ready, with what it still needs
 * to be ready, then its features, each with its capabilities, by name, its
 * improvements and what's open across it, and its body.
 */
export function AreaPage({ area, route, ...go }: DocPageProps & { area: Area }) {
  const { state } = go;
  const features = area.features.flatMap((id) => find(state.features, id) ?? []);
  const capabilities = areaCapabilities(state, area);
  const readiness = area.readiness;
  const open = openAcross(capabilities, readiness, { kind: "area", doc: area });
  const tabs: TabDef[] = [
    { id: "overview", label: "Overview" },
    { id: "features", label: "Features", term: "feature" as const, count: features.length },
    { id: IMPROVEMENTS_TAB, label: "Improvements", term: "improvement" as const, count: readiness.parts.length || undefined },
    ...(hasBody(area) ? [{ id: "about", label: "About" }] : []),
  ];
  const tab = currentTab(route, tabs);
  return (
    <DocView title={area.name} route={route}>
      <DocHeader
        state={state}
        kind="area"
        doc={area}
        initiatives={initiativesOf(state, capabilities)}
        stats={
          <>
            <Stat label="Features" term="feature" value={features.length || "None"} note="that name it" href={tabHref("features")} />
            <Stat
              label="Capabilities"
              term="capability"
              value={capabilities.length || "None"}
              note={<StabilitySpread levels={capabilities.map((c) => c.stability)} of={area.name} inButton />}
              href={tabHref("features")}
            />
            <MaturityStat
              maturity={area.maturity}
              band={area.band}
              subject="area"
              count={features.filter((f) => f.maturity !== null).length}
              spread={features.map((f) => f.band)}
              of={area.name}
            />
            <ExposureStat exposure={area.exposure} risk={area.readiness.gaps} of={area.name} />
            <ReadinessStat readiness={readiness} tab="overview" of={`Readiness of ${area.name}`} />
            <ImprovementsStat readiness={readiness} />
          </>
        }
      />
      <Tabs tabs={tabs} current={tab} />
      {tab === "overview" ? (
        <>
          <Sources {...go} kind="area" doc={area} title="What it is" />
          <Section title="Where it stands">
            {capabilities.length ? (
              <StandingSummary state={state} capabilities={capabilities} all={tabHref("features")} />
            ) : (
              <Box component="p" sx={lineSx}>
                No capabilities in its features yet.
              </Box>
            )}
          </Section>
          <ImprovementsSection readiness={readiness} here={area} />
          <TopGaps state={state} open={open} />
        </>
      ) : tab === "features" ? (
        <Section title={<Term id="feature">Features</Term>} count={features.length}>
          {features.length ? (
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(260px, 100%), 1fr))", gap: 1.5 }}>
              {features.map((f) => {
                const caps = f.capabilities.flatMap((id) => find(state.capabilities, id) ?? []);
                return (
                  <Box component="a" key={f.id} href={docHref("feature", f.id)} sx={featureCardSx}>
                    <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: 14.5 }}>
                      {NAMES.feature.icon}
                      <Box component="strong" sx={{ flex: 1 }}>
                        {f.name}
                      </Box>
                      {f.maturity !== null ? (
                        <MaturityRing progress={f.maturity} subject="feature" size={22} focusable={false} spread={caps.map((c) => c.stability)} />
                      ) : null}
                    </Box>
                    {f.description ? (
                      <Box component="span" sx={{ fontSize: 13, color: "text.secondary" }}>
                        {f.description}
                      </Box>
                    ) : null}
                    <Box component="ul" sx={{ display: "flex", flexDirection: "column", gap: 0.5, fontSize: 13 }}>
                      {caps.map((c) => (
                        <Box component="li" key={c.id} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <CapabilityStability level={c.stability} name={c.name} focusable={false} />
                          {c.name}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          ) : (
            <Empty>No feature names it yet.</Empty>
          )}
        </Section>
      ) : tab === IMPROVEMENTS_TAB ? (
        <>
          <ImprovementsList readiness={readiness} here={area} />
          <OpenTab {...go} open={open} here={area} />
        </>
      ) : (
        <Section title={MORE_ABOUT}>
          <Bodies {...go} doc={area} />
        </Section>
      )}
    </DocView>
  );
}
