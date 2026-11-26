import { useEffect } from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import type { Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import { RingGlyph } from "../../components/maturity/RingGlyph";
import { RiskRing } from "../../components/risk/RiskRing";
import { MATURITY_BANDS, MATURITY_LEVELS } from "../../components/maturity/maturity";
import { STABILITY, STABILITY_LEVEL_IDS, levelColor, type StabilityLevelId } from "../../components/stability/stability";
import { StabilityMark } from "../../components/stability/StabilityMark";
import { TERMS, type TermId } from "../../components/term/terms";
import { sectionHref, type Route } from "../../routes";
import { Empty, PageHeader, Section, Tabs, View, currentTab, type TabDef } from "../../components/shell/layout";
import { READINESS_BANDS, RISK_BANDS, type RiskBand, type RubricExample, type RubricKind, type RubricLevel, type DocketState } from "../../state";

/*
 * What Docket's own words mean, in one place, so a Term's popover isn't the
 * only way to find out: every term, grouped as the domain overview groups
 * them; the stability levels, with maturity, exposure and readiness, which
 * are worked out from them; and the stability rubric as a plain reference. Each term
 * is anchored by its ID, as `?view=glossary#gap`, so anything can link to it.
 */
export default function GlossaryPage({ state, route }: { state: DocketState; route: Route }) {
  const tabs: TabDef[] = [
    { id: "terms", label: "Terms", count: Object.keys(TERMS).length },
    { id: "levels", label: "Stability levels" },
    { id: "rubric", label: "Rubric", term: "rubric" as const, count: state.rubric?.qualities.length },
  ];
  const tab = currentTab(route, tabs);

  /* Open at the entry the address names, such as #gap. */
  useEffect(() => {
    const at = window.location.hash.slice(1);
    if (at) document.getElementById(decodeURIComponent(at))?.scrollIntoView();
  }, [tab]);

  return (
    <View title="Glossary">
      <PageHeader title="Glossary" lede="What Docket's words mean: the terms it labels things with, how stable each level is, and what each level expects." />
      <Tabs tabs={tabs} current={tab} />
      {tab === "terms" ? <Terms /> : tab === "levels" ? <Levels /> : <RubricReference state={state} />}
    </View>
  );
}

/* ——— Terms ——— */

/* The terms in groups, as the domain overview's "Every concept" has them. Any not named here go last. */
const GROUPS: { title: string; ids: TermId[] }[] = [
  { title: "The product", ids: ["product", "project", "contradiction", "domain", "feature", "capability", "rule", "concept", "persona"] },
  { title: "How it's built", ids: ["mechanism", "component"] },
  { title: "Where intention and reality differ", ids: ["open-decision", "gap", "product-gap", "technical-gap", "tradeoff", "risk", "spread"] },
  { title: "Stability and readiness", ids: ["stability", "maturity", "exposure", "rubric", "readiness"] },
  { title: "Evidence", ids: ["evidence"] },
];

const levelsHref = (hash: string) => `${sectionHref("glossary", { tab: "levels" })}#${hash}`;

/* Terms with more on the Stability levels tab, and where. */
const LEVELS_LINKS: Partial<Record<TermId, { hash: string; text: string }>> = {
  stability: { hash: "levels", text: "Each level, and what to expect from it" },
  maturity: { hash: "maturity", text: "How it's worked out, and its bands" },
  exposure: { hash: "exposure", text: "How it's worked out, and its bands" },
};

/* Cards in as many columns as fit, each at least `min` wide, or the whole width on a phone. */
const cardGridSx = (min = 300): SystemStyleObject<Theme> => ({
  display: "grid",
  gridTemplateColumns: `repeat(auto-fill, minmax(min(${min}px, 100%), 1fr))`,
  gap: 1.5,
});

/* A term, a level or a band, on a card of its own. */
const cardSx: SystemStyleObject<Theme> = {
  px: 2,
  py: 1.75,
  fontSize: 13.5,
  lineHeight: 1.55,
  bgcolor: "background.paper",
  border: 1,
  borderColor: "divider",
  borderRadius: "10px",
  scrollMarginTop: 16,
  "& h3": { mb: 0.75, fontSize: 15 },
};

/* A term's more, ruled off under what it means. */
const termMoreSx: SystemStyleObject<Theme> = { mt: 1, pt: 1, fontSize: 13, color: "text.secondary", borderTop: 1, borderColor: "divider" };

/* A paragraph saying more, at reading width. */
const noteSx: SystemStyleObject<Theme> = { maxWidth: 760, mb: 2, fontSize: 13.5, lineHeight: 1.55, color: "text.secondary" };

/* A heading inside a section. */
const subheadSx: SystemStyleObject<Theme> = { mt: 3, mb: 1, fontSize: 14 };

function Terms() {
  const grouped = new Set(GROUPS.flatMap((g) => g.ids));
  const rest = (Object.keys(TERMS) as TermId[]).filter((id) => !grouped.has(id));
  const groups = rest.length ? [...GROUPS, { title: "More", ids: rest }] : GROUPS;
  return (
    <>
      {groups.map((g) => (
        <Section key={g.title} title={g.title} count={g.ids.length}>
          <Box sx={cardGridSx()}>
            {g.ids.map((id) => (
              <Box
                component="article"
                key={id}
                id={id}
                sx={[cardSx, { "&:target": { borderColor: "primary.main", boxShadow: (t) => t.vars.palette.lit.ring } }]}
              >
                <h3>{TERMS[id].name}</h3>
                <p>{TERMS[id].means}</p>
                {TERMS[id].more ? (
                  <Box component="p" sx={termMoreSx}>
                    {TERMS[id].more}
                  </Box>
                ) : null}
                {LEVELS_LINKS[id] ? (
                  <Box component="p" sx={termMoreSx}>
                    <Box component="a" href={levelsHref(LEVELS_LINKS[id].hash)} sx={{ color: "primary.main", textDecoration: "none" }}>
                      {LEVELS_LINKS[id].text}
                    </Box>
                  </Box>
                ) : null}
              </Box>
            ))}
          </Box>
        </Section>
      ))}
    </>
  );
}

/* ——— Stability levels, maturity and readiness ——— */

/* What each maturity band tells whoever is looking, as MaturityDetails says it. */
const BAND_SUMMARIES: Record<StabilityLevelId, string> = {
  prototype: "Early days. Much of it is still being explored, and could change completely or be dropped.",
  alpha: "Taking shape. Some of it works, but much is still changing often, so expect bugs and breaking changes.",
  beta: "Firming up. Enough of it is settled or stable for real use, while other parts are still changing.",
  ga: "Well established. Most of it is stable and supported, while any newer parts settle in.",
};

function Levels() {
  return (
    <>
      <Section
        id="levels"
        title="Stability levels"
        note="How much people can depend on a capability right now. Its builders declare it, and it moves up from Prototype through Alpha and Beta to General Availability as it's proven in real use. Beta is the bar for real use. A level is about dependability, not quality: a GA capability can still have bugs and gaps."
      >
        <Box sx={cardGridSx()}>
          <Box component="article" id="draft" sx={cardSx}>
            <Box component="h3" sx={{ color: "text.secondary" }}>
              Draft
            </Box>
            <p>Declared and not started. It has no level, so it claims nothing in the rubric, or anything else, and counts toward no maturity or readiness.</p>
          </Box>
          {STABILITY_LEVEL_IDS.map((id) => {
            const level = STABILITY[id];
            return (
              <Box component="article" key={id} id={id} sx={cardSx}>
                <h3>
                  <StabilityMark level={id} size="extra-long" statement={false} />
                </h3>
                <p>{level.summary}</p>
                <Box
                  component="dl"
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "110px minmax(0, 1fr)" },
                    gap: { xs: "2px", sm: "6px 12px" },
                    mt: 1.25,
                    mb: 0,
                    fontSize: 13,
                    lineHeight: 1.55,
                    "& > dt": { pt: "3px", typography: "overline", lineHeight: "inherit", color: "text.disabled" },
                    "& > dd": { m: 0, mb: { xs: 1.25, sm: 0 } },
                  }}
                >
                  <dt>Changes</dt>
                  <dd>{level.changes}</dd>
                  <dt>Bugs</dt>
                  <dd>{level.bugs}</dd>
                  <dt>Using it</dt>
                  <dd>{level.forUsers}</dd>
                  <dt>Building on it</dt>
                  <dd>{level.forEngineers}</dd>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Section>

      <Section
        id="maturity"
        title="Maturity"
        note="How far along the work on a feature, domain or project is, for planning: how much of the work under way is stable and supported. It's an indication about the whole, not a verdict on each part, and it doesn't say whether people can use it: that's readiness."
      >
        <Box component="p" sx={noteSx}>
          A feature's maturity is the average of its capabilities' scores, each weighted by its level, drafts left out. A capability that spans domains counts
          once, at its lowest level. A domain's comes from its parts of features, each at its levels there, and a project's from its features, each weighted as
          a capability in its band would be. Starting new work lowers it without anything getting worse, and 100% isn't the goal.
        </Box>
        <TableContainer sx={narrowTableSx}>
          <Table aria-label="Each level's score and weight">
            <TableHead>
              <TableRow>
                <TableCell>Level</TableCell>
                <TableCell align="right">Score</TableCell>
                <TableCell align="right">Weight</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {STABILITY_LEVEL_IDS.map((id) => (
                <TableRow key={id}>
                  <TableCell>
                    <StabilityMark level={id} statement={false} />
                  </TableCell>
                  <TableCell align="right">{MATURITY_LEVELS[id].score}</TableCell>
                  <TableCell align="right">{MATURITY_LEVELS[id].weight}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box component="h3" id="bands" sx={subheadSx}>
          Bands
        </Box>
        <Box component="p" sx={noteSx}>
          Each quarter of the scale is a band, named for the level it's closest to. A band says what to expect from the whole, never from every part.
        </Box>
        <Box sx={cardGridSx(240)}>
          {STABILITY_LEVEL_IDS.map((id, i) => (
            <Box component="article" key={id} sx={bandSx}>
              <RingGlyph progress={i * 25 + 12} size={44} />
              <div>
                <Box component="h3" sx={levelColor(id)}>
                  {MATURITY_BANDS[id]}
                </Box>
                <Box component="span" sx={bandRangeSx}>
                  {i * 25}–{i === 3 ? 100 : i * 25 + 24}% · named for {STABILITY[id].name}
                </Box>
                <p>{BAND_SUMMARIES[id]}</p>
              </div>
            </Box>
          ))}
        </Box>
      </Section>

      <Section id="exposure" title="Exposure" note={TERMS.exposure.means}>
        <Box component="p" sx={noteSx}>
          Each gap has a risk on each capability it&rsquo;s on, from 0 to 100. A capability is exposed to its riskiest gap&rsquo;s share of the most it could
          be: a certain, damaging gap reaching everyone that breaks a claim its level makes. Several capabilities, as in a feature, domain, project or what
          serves a persona, count by their level, weighted as in maturity, so exposure on GA counts for most. Drafts don&rsquo;t count. Only the riskiest gap on
          each capability counts, so closing a lesser one doesn&rsquo;t change it.
        </Box>
        <Box component="p" sx={noteSx}>
          It isn&rsquo;t stability: a level is declared, and exposure never changes it. Promoting a capability can raise its exposure, where its gaps break a
          claim the new level makes.
        </Box>
        <Box component="h3" id="exposure-bands" sx={subheadSx}>
          Bands
        </Box>
        <Box component="p" sx={noteSx}>
          Each quarter of the scale is a band. An unacceptable gap on any of its capabilities makes it at least moderate, whatever the share.
        </Box>
        <Box sx={cardGridSx(240)}>
          {RISK_BANDS.map((b, i) => (
            <Box component="article" key={b.id} sx={bandSx}>
              <RiskRing percent={i * 25 + 12} size={44} band={b.id} />
              <div>
                <Box component="h3" sx={{ color: RISK_BAND_COLOR[b.id] }}>
                  {b.name}
                </Box>
                <Box component="span" sx={bandRangeSx}>
                  {b.from}–{i === 3 ? 100 : b.from + 24}%
                </Box>
                <p>{b.says}</p>
              </div>
            </Box>
          ))}
        </Box>
      </Section>

      <Section id="readiness" title="Readiness" term="readiness" note={TERMS.readiness.means}>
        <Box component="p" sx={noteSx}>
          {TERMS.readiness.more}
        </Box>
        <Box component="p" sx={noteSx}>
          It's a recommendation, and you're the judge. A capability with something left still needs to reach Beta, where it's below, and to close each gap whose
          risk on it is unacceptable; every page lists what's left. A draft is not started, and never counts.
        </Box>
        <TableContainer sx={narrowTableSx}>
          <Table aria-label="Readiness bands">
            <TableHead>
              <TableRow>
                <TableCell>Readiness</TableCell>
                <TableCell align="right">From</TableCell>
                <TableCell>What it recommends</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {READINESS_BANDS.map((b) => (
                <TableRow key={b.name}>
                  <TableCell>{b.name}</TableCell>
                  <TableCell align="right">{b.from}%</TableCell>
                  <TableCell>{b.says}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Section>
    </>
  );
}

/* Exposure's band as a color, on the same scale as impact: low neutral, minor the soft yellow, moderate orange, and high the alarm color. */
const RISK_BAND_COLOR: Record<RiskBand["id"], string> = {
  low: "text.disabled",
  minor: "impact.inconvenient",
  moderate: "impact.blocking",
  high: "error.main",
};

/* A small reference table, no wider than it needs. */
const narrowTableSx: SystemStyleObject<Theme> = { maxWidth: 420, mb: 1 };

/* A band: its ring, then its name, its range and what it says. */
const bandSx: SystemStyleObject<Theme> = { ...cardSx, display: "flex", alignItems: "flex-start", gap: 1.75, "& h3": { mb: 0, fontSize: 15 } };

const bandRangeSx: SystemStyleObject<Theme> = { display: "block", mb: 0.75, fontSize: 12, color: "text.disabled" };

/* ——— The rubric ——— */

/* The rubric as a plain reference: each quality, then what each level asks of it and the outcomes it expects. A capability's page shows it for that capability. */
function RubricReference({ state }: { state: DocketState }) {
  const rubric = state.rubric;
  if (!rubric) return <Empty>None of the projects showing has the rubric.</Empty>;
  return (
    <>
      <Box component="p" sx={noteSx}>
        <strong>A guideline, not a gate.</strong> It gives each level the same meaning for everyone, and doesn't replace engineering judgment. An outcome
        applies from its level up, and one that applies is met, not applicable, or written down as a gap or tradeoff. Each capability's page shows where it
        stands against its own level.
      </Box>
      <Box component="nav" aria-label="Qualities" sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 3 }}>
        {rubric.qualities.map((q) => (
          <Box
            component="a"
            key={q.id}
            href={`#${q.id}`}
            sx={{
              px: 1.25,
              py: "3px",
              fontSize: 13,
              fontWeight: 550,
              color: "text.secondary",
              textDecoration: "none",
              border: 1,
              borderColor: "divider",
              borderRadius: 999,
              "&:hover": { color: "primary.main", borderColor: "primary.main" },
            }}
          >
            {q.name}
          </Box>
        ))}
      </Box>
      {rubric.qualities.map((q) => (
        <Box component="section" key={q.id} id={q.id} sx={{ mb: 4.5, scrollMarginTop: 16 }}>
          <Box component="h2" sx={{ fontSize: 18, letterSpacing: "-0.01em" }}>
            {q.name}
          </Box>
          <Box component="p" sx={{ mt: "2px", mb: 0.75, fontSize: 15, fontWeight: 550 }}>
            {q.question}
          </Box>
          <Box component="p" sx={noteSx}>
            {q.why}
          </Box>
          <Box
            component="ol"
            sx={{
              listStyle: "none",
              m: 0,
              p: 0,
              bgcolor: "background.paper",
              border: 1,
              borderColor: "divider",
              borderRadius: "10px",
              "& > li + li": { borderTop: 1, borderColor: "divider" },
            }}
          >
            {q.levels.map((l) => (
              <QualityLevel key={l.level} level={l} kinds={rubric.kinds} />
            ))}
          </Box>
        </Box>
      ))}
    </>
  );
}

/* Under a level's head, past its mark's column, on a wide screen. */
const LEVEL_INDENT = { xs: 0, sm: "182px" };

function QualityLevel({ level, kinds }: { level: RubricLevel; kinds: RubricKind[] }) {
  return (
    <Box component="li" sx={{ px: 2, py: 1.5 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "170px minmax(0, 1fr)" },
          gap: { xs: 0.5, sm: 1.5 },
          alignItems: "baseline",
          fontSize: 13.5,
        }}
      >
        <StabilityMark level={level.level} statement={false} />
        <Box component="span" sx={level.summary ? undefined : { color: "text.disabled" }}>
          {level.summary ?? "Nothing expected."}
        </Box>
      </Box>
      {level.outcomes.length ? (
        <Box component="ul" sx={{ display: "flex", flexDirection: "column", gap: 1.25, mt: 1.25, ml: LEVEL_INDENT, pl: 2, fontSize: 14 }}>
          {level.outcomes.map((o) => (
            <Box component="li" key={o.id} sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              {o.until && o.until !== o.level ? (
                <Box component="span" sx={{ typography: "overline", letterSpacing: "0.06em", color: "text.disabled" }}>
                  From {STABILITY[o.level].name} through {STABILITY[o.until].name}
                </Box>
              ) : null}
              <span>{o.text}</span>
              <Guidance implementation={o.implementation} overengineering={o.overengineering} kinds={kinds} />
            </Box>
          ))}
        </Box>
      ) : (
        <Guidance implementation={level.implementation} overengineering={level.overengineering} kinds={kinds} indented />
      )}
    </Box>
  );
}

/* How meeting it might look, and what may be overengineering at its level, each folded. `indented` lines it up under the level's summary. */
function Guidance({
  implementation,
  overengineering,
  kinds,
  indented = false,
}: {
  implementation: RubricExample[];
  overengineering: RubricExample[];
  kinds: RubricKind[];
  indented?: boolean;
}) {
  if (!implementation.length && !overengineering.length) return null;
  const fold = (title: string, list: RubricExample[]) =>
    list.length ? (
      <Box
        component="details"
        sx={{
          fontSize: 13,
          color: "text.secondary",
          "&[open]": { flexBasis: "100%" },
          "& > summary": { cursor: "pointer", fontWeight: 550, "&:hover": { color: "primary.main" } },
        }}
      >
        <summary>
          {title}{" "}
          <Box component="span" sx={{ ml: 0.5, fontSize: 11, fontWeight: 600, color: "text.disabled" }}>
            {list.length}
          </Box>
        </summary>
        <Box component="ul" sx={{ display: "flex", flexDirection: "column", gap: 0.5, mt: 0.75, mb: 0.5, pl: "18px", color: "text.primary" }}>
          {list.map((e) => (
            <li key={e.text}>
              {e.text}
              {e.kinds.map((k) => (
                <Box
                  component="span"
                  key={k}
                  sx={{
                    display: "inline-block",
                    ml: 0.75,
                    px: "7px",
                    fontSize: 11,
                    fontWeight: 600,
                    lineHeight: "18px",
                    color: "text.secondary",
                    border: 1,
                    borderColor: "surface.borderStrong",
                    borderRadius: 999,
                  }}
                >
                  {kinds.find((x) => x.id === k)?.name ?? k}
                </Box>
              ))}
            </li>
          ))}
        </Box>
      </Box>
    ) : null;
  return (
    <Box sx={[{ display: "flex", flexWrap: "wrap", gap: "4px 16px" }, indented && { ml: LEVEL_INDENT, mt: 1 }]}>
      {fold("How it might look", implementation)}
      {fold("May be overengineering", overengineering)}
    </Box>
  );
}
