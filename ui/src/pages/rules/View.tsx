// docqet:implements capability:language
import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { ConceptIcon } from "../../components/Concepts";
import { RULE_STANDING_LABELS, plural } from "../../components/names";
import { Facets, facets, type Go } from "../../components/Fields";
import { CapabilityStability } from "../../components/CapabilityLabel";
import { Body, Excerpt } from "../../components/markdown/Markdown";
import { StandingMark } from "../../components/standing/StandingMark";
import { Term } from "../../components/term/Term";
import { docHref, navigate, type Route } from "../../routes";
import { Empty, PageHeader, Section, Stat, Tabs, View, currentTab, type TabDef } from "../../components/shell/layout";
import { byFeature, contradictionsOf, domainName, find, gapsById, projectName, type Capability, type DocqetState, type Rule } from "../../state";
/* EvidenceList's rules, until it's styled in place. */
import { EvidenceList } from "../../components/doc/EvidenceList";
import { Missing } from "../../components/doc/Missing";
import { InitiativeTags, initiativesOf } from "../../components/Initiatives";
import { ConstraintRows } from "../../components/Constraints";

/*
 * One rule's page: what must always hold, and does it? Its header says what
 * it is and, in figures, how many capabilities follow it and how many hold
 * to it. Its tabs say where it applies, with the constraints it respects
 * first, if any, the evidence that it holds, the concepts it's in the words
 * of, and more about it.
 */
export default function RulePage({ state, id, route }: { state: DocqetState; id: string; route: Route }) {
  const rule = find(state.rules, id);
  if (!rule) return <Missing kind="rule" id={id} />;
  return <RuleView state={state} rule={rule} route={route} />;
}

/* Where links in Markdown go from a doc page: to the page of what they name. */
export const pageGo = (state: DocqetState): Go => ({
  state,
  onConcept: (id) => navigate(docHref("concept", id)),
  onPick: (pick) => navigate(docHref(pick.kind, pick.id)),
});

function RuleView({ state, rule, route }: { state: DocqetState; rule: Rule; route: Route }) {
  const go = pageGo(state);
  const following = rule.capabilities.flatMap((id) => find(state.capabilities, id) ?? []);
  const notHeld = following.filter((c) => rule.standings[c.id] === "gap");
  const held = following.length - notHeld.length;
  const withEvidence = following.filter((c) => rule.standings[c.id] === "evidence").length;
  const concepts = rule.concepts.flatMap((cid) => find(state.concepts, cid) ?? []);
  const respects = rule.respects.flatMap((cid) => find(state.constraints, cid) ?? []);
  const places = rule.evidence.verifies.length + rule.evidence.implements.length;
  const written = rule.from.filter((f) => f.body.trim());
  const several = rule.from.length > 1;
  const findings = contradictionsOf(state, "rule", rule.id);
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

      {findings.map((p) => (
        <Box
          component="p"
          key={p.message}
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1,
            mt: -1,
            mb: 2,
            px: 1.5,
            py: 1.25,
            fontSize: 13.5,
            color: "warning.main",
            bgcolor: (t) => `color-mix(in srgb, ${t.vars.palette.warning.main} 8%, transparent)`,
            borderRadius: "8px",
          }}
        >
          <WarningAmberRoundedIcon sx={{ fontSize: 17, flex: "none" }} />
          {p.message}
        </Box>
      ))}

      {fielded.length ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 2 }}>
          {fielded.map((f, i) => (
            <div key={i}>
              {several ? <Source>{projectName(state, f.project)}</Source> : null}
              <Facets items={facets("rule", f, go)} />
            </div>
          ))}
        </Box>
      ) : null}

      <Tabs tabs={tabs} current={tab} />

      {tab === "applies" ? (
        <>
          {respects.length ? (
            <Section title="Respects" term="constraint" count={respects.length} note="What it keeps to that nobody here chose.">
              <ConstraintRows constraints={respects} />
            </Section>
          ) : null}
          <AppliesTo state={state} rule={rule} />
        </>
      ) : tab === "evidence" ? (
        <RuleEvidence state={state} rule={rule} />
      ) : tab === "concepts" ? (
        <Box component="ul" sx={listSx}>
          {concepts.map((c) => (
            <Box component="li" key={c.id} sx={rowSx}>
              <ConceptIcon size={16} />
              <Box component="span" sx={rowMainSx}>
                <Box component="a" href={docHref("concept", c.id)} sx={nameSx}>
                  {c.name}
                </Box>
                {c.description ? (
                  <Box component="span" sx={rowNoteSx}>
                    {c.description}
                  </Box>
                ) : null}
              </Box>
              {c.domain !== rule.domain ? (
                <Box component="span" sx={{ flex: "none", fontSize: 12.5, color: "text.disabled" }}>
                  {domainName(state, c.domain)}
                </Box>
              ) : null}
            </Box>
          ))}
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, maxWidth: 760 }}>
          {written.map((f, i) => (
            <div key={i}>
              {several ? <Source>{projectName(state, f.project)}</Source> : null}
              <Body from={f} go={go} limit={2000} />
            </div>
          ))}
        </Box>
      )}
    </View>
  );
}

/* Which project a part of the rule comes from, where more than one says something about it. */
function Source({ children }: { children: ReactNode }) {
  return (
    <Box component="span" sx={{ display: "block", mb: 0.75, fontSize: 12, fontWeight: 600, color: "text.disabled" }}>
      {children}
    </Box>
  );
}

/* A list of rows in a card, each ruled off from the one before. */
const listSx: SystemStyleObject<Theme> = {
  bgcolor: "background.paper",
  border: 1,
  borderColor: "divider",
  borderRadius: "10px",
  "& > li + li": { borderTop: 1, borderColor: "divider" },
};

/* A row: its mark or icon, then what it is, and anything at its right. */
const rowSx: SystemStyleObject<Theme> = {
  display: "flex",
  alignItems: "flex-start",
  gap: 1.25,
  px: 1.75,
  py: 1.5,
  "& > svg": { flex: "none", mt: "2px" },
};

const rowMainSx: SystemStyleObject<Theme> = { display: "flex", flexDirection: "column", gap: 0.5, flex: 1, minWidth: 0 };

const nameSx: SystemStyleObject<Theme> = { fontWeight: 600, color: "inherit", textDecoration: "none", "&:hover": { color: "primary.main" } };

const rowNoteSx: SystemStyleObject<Theme> = { fontSize: 13, color: "text.secondary" };

/* Each capability that follows the rule, by feature, with whether it holds to it, and where it doesn't, the gap that says so. */
function AppliesTo({ state, rule }: { state: DocqetState; rule: Rule }) {
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
          <Box component="ul" sx={listSx}>
            {capabilities.map((c) => (
              <Follower key={c.id} state={state} rule={rule} capability={c} />
            ))}
          </Box>
        </Section>
      ))}
    </>
  );
}

function Follower({ state, rule, capability }: { state: DocqetState; rule: Rule; capability: Capability }) {
  const standing = rule.standings[capability.id];
  const gaps = gapsById(
    state,
    rule.gaps.filter((g) => capability.gaps.includes(g)),
  );
  return (
    <Box component="li" sx={rowSx}>
      <Box component="span" sx={{ display: "inline-flex", flex: "none" }}>
        <StandingMark standing={standing} label={RULE_STANDING_LABELS[standing]} />
      </Box>
      <Box component="span" sx={rowMainSx}>
        <Box component="span" sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 10px" }}>
          <Box component="a" href={docHref("capability", capability.id)} sx={nameSx}>
            {capability.name}
          </Box>
          <CapabilityStability level={capability.stability} name={capability.name} />
          <InitiativeTags state={state} ids={capability.initiatives} />
        </Box>
        <Box component="span" sx={rowNoteSx}>
          {RULE_STANDING_LABELS[standing]}
        </Box>
        {/* A gap that says it doesn't hold to the rule yet, linking to its page. */}
        {gaps.map((g) => (
          <Box
            component="a"
            key={g.id}
            href={docHref("gap", g.id)}
            sx={{
              display: "block",
              px: 1.25,
              py: 0.75,
              fontSize: 13,
              color: "text.primary",
              textDecoration: "none",
              borderLeft: 2,
              borderColor: "warning.main",
              bgcolor: (t) => `color-mix(in srgb, ${t.vars.palette.warning.main} 6%, transparent)`,
              borderRadius: "0 6px 6px 0",
              "&:hover": { bgcolor: (t) => `color-mix(in srgb, ${t.vars.palette.warning.main} 12%, transparent)` },
            }}
          >
            <Excerpt text={g.name} lines={2} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

const VERBS = [
  { verb: "verifies", title: "Verified by", icon: <FactCheckOutlinedIcon sx={{ fontSize: 15 }} /> },
  { verb: "implements", title: "Implemented by", icon: <CodeRoundedIcon sx={{ fontSize: 15 }} /> },
] as const;

/* The places that verify or implement the rule. It's the rule's, wherever it applies. */
function RuleEvidence({ state, rule }: { state: DocqetState; rule: Rule }) {
  return (
    <>
      <Box component="p" sx={{ maxWidth: 760, mb: 2, fontSize: 13.5, lineHeight: 1.55, color: "text.secondary" }}>
        Places in the repository annotated as verifying or implementing this rule. Evidence is optional: where there's none, the rule holds on trust, unless a
        gap says otherwise. It's the rule's evidence, so it counts for every capability that follows it.
      </Box>
      {VERBS.map(({ verb, title, icon }) => (
        <Section key={verb} title={title} count={rule.evidence[verb].length}>
          {rule.evidence[verb].length ? <EvidenceList state={state} places={rule.evidence[verb]} icon={icon} /> : <Empty>None.</Empty>}
        </Section>
      ))}
    </>
  );
}
