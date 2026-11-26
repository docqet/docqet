import { ConceptIcon } from "../../components/Concepts";
import { MORE_ABOUT } from "../../components/markdown/Markdown";
import { MaturityRing } from "../../components/maturity/MaturityRing";
import { StabilitySpread } from "../../components/stability/StabilitySpread";
import { Term } from "../../components/term/Term";
import { CapabilityStability } from "../../components/CapabilityLabel";
import { NAMES, plural } from "../../components/names";
import { initiativesOf } from "../../components/Initiatives";
import { domainName, domainCapabilities, find, partOf, type DocketState, type Domain, levelInDomain } from "../../state";
import { ExposureStat, MaturityStat } from "../../components/indexParts";
import { docHref, type Route } from "../../routes";
import { Empty, Section, Stat, Tabs, currentTab, type TabDef } from "../../components/shell/layout";
import { type DocPageProps } from "../../components/doc/DocPage";
import { tabHref } from "../../components/doc/DocPage";
import { DocView } from "../../components/doc/DocPage";
import { DocHeader } from "../../components/doc/DocPage";
import { Sources } from "../../components/doc/About";
import { hasBody } from "../../components/doc/About";
import { Bodies } from "../../components/doc/About";
import { ReadinessStat } from "../../components/doc/ReadinessParts";
import { StillNeedsSection } from "../../components/doc/ReadinessParts";
import { leftAcross } from "../../components/doc/Left";
import { leftTotal } from "../../components/doc/Left";
import { LeftStat } from "../../components/doc/Left";
import { LeftTab } from "../../components/doc/Left";
import { TopGaps } from "../../components/doc/Left";
import { CapabilityTable } from "../../components/doc/CapabilityTable";
import { StandingSummary } from "../../components/doc/RuleTable";
import { RuleTable } from "../../components/doc/RuleTable";
import { DocRows } from "../../components/doc/DocRows";
import { Missing } from "../../components/doc/Missing";
import { docGo } from "../../components/doc/DocPage";

/* A domain's page, or what shows when it isn't in the projects showing. */
export default function DomainView({ state, id, route }: { state: DocketState; id: string; route: Route }) {
  const domain = find(state.domains, id);
  if (!domain) return <Missing kind="domain" id={id} />;
  return <DomainPage domain={domain} route={route} {...docGo(state)} />;
}

/*
 * A domain: what it is, how mature and how ready, with what it still needs
 * to be ready, then its features, its language (the concepts and rules it
 * defines), what's left across it, and its body.
 */
export function DomainPage({ domain, route, ...go }: DocPageProps & { domain: Domain }) {
  const { state } = go;
  const features = domain.features.flatMap((id) => find(state.features, id) ?? []);
  const loose = domain.capabilities.flatMap((id) => find(state.capabilities, id) ?? []);
  const capabilities = domainCapabilities(state, domain);
  const concepts = state.concepts.filter((c) => c.domain === domain.id).sort((a, b) => a.name.localeCompare(b.name));
  const rules = state.rules.filter((r) => r.domain === domain.id);
  const readiness = domain.readiness;
  const left = leftAcross(capabilities, readiness, { kind: "domain", doc: domain });
  const tabs: TabDef[] = [
    { id: "overview", label: "Overview" },
    { id: "features", label: "Features", term: "feature" as const, count: features.length },
    ...(concepts.length || rules.length ? [{ id: "language", label: "Language", term: "concept" as const, count: concepts.length + rules.length }] : []),
    { id: "left", label: "What's left", term: "gap" as const, count: leftTotal(left) || undefined },
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
            <LeftStat left={left} of={domain.name} />
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
              <p className="page-line">A part of the business the software doesn't serve yet.</p>
            )}
          </Section>
          <StillNeedsSection
            readiness={readiness}
            readyText="Ready: every started capability with a part in it is at Beta or above, with no unacceptable gap."
          />
          <TopGaps state={state} left={left} />
        </>
      ) : tab === "features" ? (
        <>
          <Section title={<Term id="feature">Features</Term>} count={features.length}>
            {features.length ? (
              <div className="page-feature-grid">
                {features.map((f) => {
                  const part = partOf(f, domain.id);
                  const caps = (part?.capabilities ?? []).flatMap((id) => find(state.capabilities, id) ?? []);
                  const elsewhere = f.parts.filter((p) => p.domain !== domain.id).map((p) => domainName(state, p.domain));
                  return (
                    <a key={f.id} className="page-feature" href={docHref("feature", f.id)}>
                      <span className="page-feature-head">
                        {NAMES.feature.icon}
                        <strong>{f.name}</strong>
                        {part?.maturity != null ? (
                          <MaturityRing
                            progress={part.maturity}
                            subject="feature"
                            size={22}
                            focusable={false}
                            spread={caps.map((c) => c.levels.find((l) => l.domain === domain.id)?.level ?? c.stability)}
                          />
                        ) : null}
                      </span>
                      {f.description ? <span className="page-feature-summary">{f.description}</span> : null}
                      <ul>
                        {caps.map((c) => {
                          const level = c.levels.find((l) => l.domain === domain.id)?.level ?? c.stability;
                          return (
                            <li key={c.id}>
                              <CapabilityStability level={level} name={c.name} focusable={false} />
                              {c.name}
                            </li>
                          );
                        })}
                      </ul>
                      {elsewhere.length ? <span className="faint">Also in {elsewhere.join(", ")}</span> : null}
                    </a>
                  );
                })}
              </div>
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
              <div className="page-card">
                <DocRows
                  rows={concepts.map((c) => ({
                    key: c.id,
                    href: docHref("concept", c.id),
                    icon: <ConceptIcon size={15} />,
                    name: c.name,
                    summary: c.description,
                  }))}
                />
              </div>
            </Section>
          ) : null}
          {rules.length ? (
            <Section title={<Term id="rule">Rules</Term>} count={rules.length} note="What must always be true, or must never happen, here.">
              <RuleTable rules={rules} />
            </Section>
          ) : null}
        </>
      ) : tab === "left" ? (
        <LeftTab {...go} left={left} here={domain} />
      ) : (
        <Section title={MORE_ABOUT}>
          <Bodies {...go} doc={domain} />
        </Section>
      )}
    </DocView>
  );
}
