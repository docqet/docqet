import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { ConceptIcon } from "../../components/Concepts";
import { RULE_STANDING_LABELS, plural } from "../../Explore";
import { Facets, facets, type Go } from "../../components/Fields";
import { CapabilityStability } from "../../components/CapabilityLabel";
import { Body, Excerpt } from "../../components/markdown/Markdown";
import { StandingMark } from "../../components/standing/StandingMark";
import { Term } from "../../components/term/Term";
import { docHref, navigate, type Route } from "../../routes";
import { Empty, PageHeader, Section, Stat, Tabs, View, currentTab, type TabDef } from "../../components/shell/layout";
import { byFeature, contradictionsOf, domainName, find, gapsById, projectName, type Capability, type DocketState, type Rule } from "../../state";
import "../doc.css";
import { EvidenceList } from "../../components/doc/EvidenceList";
import { Missing } from "../../components/doc/Missing";
import { InitiativeTags, initiativesOf } from "../../components/Initiatives";

/*
 * One rule's page: what must always hold, and does it? Its header says what
 * it is and, in figures, how many capabilities follow it and how many hold
 * to it. Its tabs say where it applies, the evidence that it holds, the
 * concepts it's in the words of, and more about it.
 */
export default function RulePage({ state, id, route }: { state: DocketState; id: string; route: Route }) {
  const rule = find(state.rules, id);
  if (!rule) return <Missing kind="rule" id={id} />;
  return <RuleView state={state} rule={rule} route={route} />;
}

/* Where links in Markdown go from a doc page: to the page of what they name. */
export const pageGo = (state: DocketState): Go => ({
  state,
  onConcept: (id) => navigate(docHref("concept", id)),
  onPick: (pick) => navigate(docHref(pick.kind, pick.id)),
});

function RuleView({ state, rule, route }: { state: DocketState; rule: Rule; route: Route }) {
  const go = pageGo(state);
  const following = rule.capabilities.flatMap((id) => find(state.capabilities, id) ?? []);
  const notHeld = following.filter((c) => rule.standings[c.id] === "gap");
  const held = following.length - notHeld.length;
  const withEvidence = following.filter((c) => rule.standings[c.id] === "evidence").length;
  const concepts = rule.concepts.flatMap((cid) => find(state.concepts, cid) ?? []);
  const places = rule.evidence.verifies.length + rule.evidence.implements.length;
  const written = rule.from.filter((f) => f.body.trim());
  const several = rule.from.length > 1;
  const problems = contradictionsOf(state, "rule", rule.id);
  const description = rule.from.find((f) => f.description?.trim())?.description;

  const tabs: TabDef[] = [
    { id: "applies", label: "Applies to", count: following.length },
    { id: "evidence", label: <Term id="evidence" />, count: places },
    ...(concepts.length ? [{ id: "concepts", label: <Term id="concept">Concepts</Term>, count: concepts.length }] : []),
    ...(written.length ? [{ id: "about", label: "About" }] : []),
  ];
  const tab = currentTab(route, tabs);
  const fielded = rule.from.filter((f) => facets("rule", f, go).length);

  return (
    <View title={rule.name}>
      <PageHeader
        trail={
          <>
            <a href={docHref("domain", rule.domain)}>{domainName(state, rule.domain)}</a>
            <InitiativeTags state={state} ids={initiativesOf(state, following)} />
          </>
        }
        kind={
          <>
            <RuleRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            <Term id="rule" />
          </>
        }
        title={rule.name}
        lede={description ?? (written.length ? <Excerpt text={written[0].body} lines={3} /> : undefined)}
        stats={
          <>
            <Stat
              label="Followed by"
              value={plural(following.length, "capability", "capabilities")}
              note={following.length ? `In ${plural(byFeature(state, rule.capabilities).length, "feature", "features")}` : "Nothing follows it yet"}
              href={docHref("rule", rule.id)}
            />
            <Stat
              label="Held"
              value={following.length ? `${held} of ${following.length}` : "—"}
              note={
                !following.length
                  ? "Nothing follows it yet"
                  : !held
                    ? "None of them holds to it yet"
                    : withEvidence
                      ? "With evidence"
                      : "On trust: nothing points at it as evidence"
              }
              tone={following.length && !notHeld.length ? "ok" : undefined}
              href={docHref("rule", rule.id)}
            />
            <Stat
              label="Not held"
              value={notHeld.length}
              note={notHeld.length ? `A gap says so in ${plural(notHeld.length, "capability", "capabilities")}` : "No gap names it"}
              tone={notHeld.length ? "warn" : undefined}
              href={docHref("rule", rule.id)}
            />
            <Stat
              label="Evidence"
              term="evidence"
              value={plural(places, "place", "places")}
              note={places ? `${rule.evidence.verifies.length} verify · ${rule.evidence.implements.length} implement` : "Optional: it holds on trust"}
              href={docHref("rule", rule.id, "evidence")}
            />
          </>
        }
      />

      {problems.map((p) => (
        <p key={p.message} className="dp-warning">
          <WarningAmberRoundedIcon sx={{ fontSize: 17, flex: "none" }} />
          {p.message}
        </p>
      ))}

      {fielded.length ? (
        <div className="dp-fields">
          {fielded.map((f, i) => (
            <div key={i}>
              {several ? <span className="dp-source">{projectName(state, f.project)}</span> : null}
              <Facets items={facets("rule", f, go)} />
            </div>
          ))}
        </div>
      ) : null}

      <Tabs tabs={tabs} current={tab} />

      {tab === "applies" ? (
        <AppliesTo state={state} rule={rule} />
      ) : tab === "evidence" ? (
        <RuleEvidence state={state} rule={rule} />
      ) : tab === "concepts" ? (
        <ul className="dp-list">
          {concepts.map((c) => (
            <li key={c.id} className="dp-row">
              <ConceptIcon size={16} />
              <span className="dp-row-main">
                <a className="dp-name" href={docHref("concept", c.id)}>
                  {c.name}
                </a>
                {c.description ? <span className="dp-row-note">{c.description}</span> : null}
              </span>
              {c.domain !== rule.domain ? <span className="dp-row-aside">{domainName(state, c.domain)}</span> : null}
            </li>
          ))}
        </ul>
      ) : (
        <div className="dp-about">
          {written.map((f, i) => (
            <div key={i}>
              {several ? <span className="dp-source">{projectName(state, f.project)}</span> : null}
              <Body from={f} go={go} limit={2000} />
            </div>
          ))}
        </div>
      )}
    </View>
  );
}

/* Each capability that follows the rule, by feature, with whether it holds to it, and where it doesn't, the gap that says so. */
function AppliesTo({ state, rule }: { state: DocketState; rule: Rule }) {
  const groups = byFeature(state, rule.capabilities);
  if (!groups.length) return <Empty>No capability showing follows this rule yet.</Empty>;
  return (
    <>
      {groups.map(({ feature, capabilities }) => (
        <Section
          key={feature?.id ?? ""}
          title={feature ? <a href={docHref("feature", feature.id)}>{feature.name}</a> : "In no feature"}
          count={capabilities.length}
        >
          <ul className="dp-list">
            {capabilities.map((c) => (
              <Follower key={c.id} state={state} rule={rule} capability={c} />
            ))}
          </ul>
        </Section>
      ))}
    </>
  );
}

function Follower({ state, rule, capability }: { state: DocketState; rule: Rule; capability: Capability }) {
  const standing = rule.standings[capability.id];
  const gaps = gapsById(
    state,
    rule.gaps.filter((g) => capability.gaps.includes(g)),
  );
  return (
    <li className="dp-row">
      <StandingMark standing={standing} label={RULE_STANDING_LABELS[standing]} />
      <span className="dp-row-main">
        <span className="dp-row-head">
          <a className="dp-name" href={docHref("capability", capability.id)}>
            {capability.name}
          </a>
          <CapabilityStability level={capability.stability} name={capability.name} />
          <InitiativeTags state={state} ids={capability.initiatives} />
        </span>
        <span className="dp-row-note">{RULE_STANDING_LABELS[standing]}</span>
        {gaps.map((g) => (
          <a key={g.id} className="dp-gap-link" href={docHref("gap", g.id)}>
            <Excerpt text={g.name} lines={2} />
          </a>
        ))}
      </span>
    </li>
  );
}

const VERBS = [
  { verb: "verifies", title: "Verified by", icon: <FactCheckOutlinedIcon sx={{ fontSize: 15 }} /> },
  { verb: "implements", title: "Implemented by", icon: <CodeRoundedIcon sx={{ fontSize: 15 }} /> },
] as const;

/* The places that verify or implement the rule. It's the rule's, wherever it applies. */
function RuleEvidence({ state, rule }: { state: DocketState; rule: Rule }) {
  return (
    <>
      <p className="dp-note">
        Places in the repository annotated as verifying or implementing this rule. Evidence is optional: where there's none, the rule holds on trust, unless a
        gap says otherwise. It's the rule's evidence, so it counts for every capability that follows it.
      </p>
      {VERBS.map(({ verb, title, icon }) => (
        <Section key={verb} title={title} count={rule.evidence[verb].length}>
          {rule.evidence[verb].length ? <EvidenceList state={state} places={rule.evidence[verb]} icon={icon} /> : <Empty>None.</Empty>}
        </Section>
      ))}
    </>
  );
}
