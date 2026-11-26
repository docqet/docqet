import { useEffect } from "react";
import Box from "@mui/material/Box";
import { RingGlyph } from "../design/maturity/RingGlyph";
import { RiskRing } from "../design/risk/RiskRing";
import { MATURITY_BANDS, MATURITY_LEVELS } from "../design/maturity/maturity";
import { STABILITY, STABILITY_LEVEL_IDS, levelColor, type StabilityLevelId } from "../design/stability/stability";
import { StabilityMark } from "../design/stability/StabilityMark";
import { TERMS, type TermId } from "../design/term/terms";
import { sectionHref, type Route } from "../routes";
import { Empty, PageHeader, Section, Tabs, View, currentTab, type TabDef } from "../shell/layout";
import { READINESS_BANDS, RISK_BANDS, type RubricExample, type RubricKind, type RubricLevel, type DocketState } from "../state";
import "./doc.css";

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
      <PageHeader
        title="Glossary"
        lede="What Docket's words mean: the terms it labels things with, how stable each level is, and what each level expects."
      />
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

function Terms() {
  const grouped = new Set(GROUPS.flatMap((g) => g.ids));
  const rest = (Object.keys(TERMS) as TermId[]).filter((id) => !grouped.has(id));
  const groups = rest.length ? [...GROUPS, { title: "More", ids: rest }] : GROUPS;
  return (
    <>
      {groups.map((g) => (
        <Section key={g.title} title={g.title} count={g.ids.length}>
          <div className="dp-terms">
            {g.ids.map((id) => (
              <article key={id} id={id} className="dp-term">
                <h3>{TERMS[id].name}</h3>
                <p>{TERMS[id].means}</p>
                {TERMS[id].more ? <p className="dp-term-more">{TERMS[id].more}</p> : null}
                {LEVELS_LINKS[id] ? (
                  <p className="dp-term-more">
                    <a href={levelsHref(LEVELS_LINKS[id].hash)}>{LEVELS_LINKS[id].text}</a>
                  </p>
                ) : null}
              </article>
            ))}
          </div>
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
        <div className="dp-levels">
          <article id="draft" className="dp-level">
            <h3 className="dp-level-draft">Draft</h3>
            <p>Declared and not started. It has no level, so it claims nothing in the rubric, or anything else, and counts toward no maturity or readiness.</p>
          </article>
          {STABILITY_LEVEL_IDS.map((id) => {
            const level = STABILITY[id];
            return (
              <article key={id} id={id} className="dp-level">
                <h3>
                  <StabilityMark level={id} size="extra-long" statement={false} />
                </h3>
                <p>{level.summary}</p>
                <dl className="dp-facts dp-facts-tight">
                  <dt>Changes</dt>
                  <dd>{level.changes}</dd>
                  <dt>Bugs</dt>
                  <dd>{level.bugs}</dd>
                  <dt>Using it</dt>
                  <dd>{level.forUsers}</dd>
                  <dt>Building on it</dt>
                  <dd>{level.forEngineers}</dd>
                </dl>
              </article>
            );
          })}
        </div>
      </Section>

      <Section
        id="maturity"
        title="Maturity"
        note="How far along the work on a feature, domain or project is, for planning: how much of the work under way is stable and supported. It's an indication about the whole, not a verdict on each part, and it doesn't say whether people can use it: that's readiness."
      >
        <p className="dp-note">
          A feature's maturity is the average of its capabilities' scores, each weighted by its level, drafts left out. A capability that spans domains counts
          once, at its lowest level. A domain's comes from its parts of features, each at its levels there, and a project's from its features, each weighted as
          a capability in its band would be. Starting new work lowers it without anything getting worse, and 100% isn't the goal.
        </p>
        <table className="view-table dp-narrow-table">
          <thead>
            <tr>
              <th>Level</th>
              <th className="num">Score</th>
              <th className="num">Weight</th>
            </tr>
          </thead>
          <tbody>
            {STABILITY_LEVEL_IDS.map((id) => (
              <tr key={id}>
                <td>
                  <StabilityMark level={id} statement={false} />
                </td>
                <td className="num">{MATURITY_LEVELS[id].score}</td>
                <td className="num">{MATURITY_LEVELS[id].weight}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3 id="bands" className="dp-subhead">
          Bands
        </h3>
        <p className="dp-note">Each quarter of the scale is a band, named for the level it's closest to. A band says what to expect from the whole, never from every part.</p>
        <div className="dp-bands">
          {STABILITY_LEVEL_IDS.map((id, i) => (
            <article key={id} className="dp-band">
              <RingGlyph progress={i * 25 + 12} size={44} />
              <div>
                <Box component="h3" sx={levelColor(id)}>
                  {MATURITY_BANDS[id]}
                </Box>
                <span className="dp-band-range">
                  {i * 25}–{i === 3 ? 100 : i * 25 + 24}% · named for {STABILITY[id].name}
                </span>
                <p>{BAND_SUMMARIES[id]}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section id="exposure" title="Exposure" note={TERMS.exposure.means}>
        <p className="dp-note">
          Each gap has a risk on each capability it&rsquo;s on, from 0 to 100. A capability is exposed to its riskiest gap&rsquo;s share of the most it could
          be: a certain, damaging gap reaching everyone that breaks a claim its level makes. Several capabilities, as in a feature, domain, project or what
          serves a persona, count by their level, weighted as in maturity, so exposure on GA counts for most. Drafts don&rsquo;t count. Only the riskiest gap on each capability counts, so closing a lesser one doesn&rsquo;t change it.
        </p>
        <p className="dp-note">
          It isn&rsquo;t stability: a level is declared, and exposure never changes it. Promoting a capability can raise its exposure, where its gaps break a
          claim the new level makes.
        </p>
        <h3 id="exposure-bands" className="dp-subhead">
          Bands
        </h3>
        <p className="dp-note">Each quarter of the scale is a band. An unacceptable gap on any of its capabilities makes it at least moderate, whatever the share.</p>
        <div className="dp-bands">
          {RISK_BANDS.map((b, i) => (
            <article key={b.id} className="dp-band" data-risk-band={b.id}>
              <RiskRing percent={i * 25 + 12} size={44} />
              <div>
                <Box component="h3" sx={{ color: "var(--risk-band)" }}>
                  {b.name}
                </Box>
                <span className="dp-band-range">
                  {b.from}–{i === 3 ? 100 : b.from + 24}%
                </span>
                <p>{b.says}</p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section id="readiness" title="Readiness" term="readiness" note={TERMS.readiness.means}>
        <p className="dp-note">{TERMS.readiness.more}</p>
        <p className="dp-note">
          It's a recommendation, and you're the judge. A capability with something left still needs to reach Beta, where it's below, and to
          close each gap whose risk on it is unacceptable; every page lists what's left. A draft is not started, and never counts.
        </p>
        <table className="view-table dp-narrow-table">
          <thead>
            <tr>
              <th>Readiness</th>
              <th className="num">From</th>
              <th>What it recommends</th>
            </tr>
          </thead>
          <tbody>
            {READINESS_BANDS.map((b) => (
              <tr key={b.name}>
                <td>{b.name}</td>
                <td className="num">{b.from}%</td>
                <td>{b.says}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </>
  );
}

/* ——— The rubric ——— */

/* The rubric as a plain reference: each quality, then what each level asks of it and the outcomes it expects. A capability's page shows it for that capability. */
function RubricReference({ state }: { state: DocketState }) {
  const rubric = state.rubric;
  if (!rubric) return <Empty>None of the projects showing has the rubric.</Empty>;
  return (
    <>
      <p className="dp-note">
        <strong>A guideline, not a gate.</strong> It gives each level the same meaning for everyone, and doesn't replace engineering judgment. An outcome
        applies from its level up, and one that applies is met, not applicable, or written down as a gap or tradeoff. Each capability's page shows where it
        stands against its own level.
      </p>
      <nav className="dp-index" aria-label="Qualities">
        {rubric.qualities.map((q) => (
          <a key={q.id} href={`#${q.id}`}>
            {q.name}
          </a>
        ))}
      </nav>
      {rubric.qualities.map((q) => (
        <section key={q.id} id={q.id} className="dp-quality">
          <h2>{q.name}</h2>
          <p className="dp-quality-question">{q.question}</p>
          <p className="dp-note">{q.why}</p>
          <ol className="dp-quality-levels">
            {q.levels.map((l) => (
              <QualityLevel key={l.level} level={l} kinds={rubric.kinds} />
            ))}
          </ol>
        </section>
      ))}
    </>
  );
}

function QualityLevel({ level, kinds }: { level: RubricLevel; kinds: RubricKind[] }) {
  return (
    <li className="dp-quality-level">
      <div className="dp-quality-level-head">
        <StabilityMark level={level.level} statement={false} />
        <span className={level.summary ? undefined : "dp-faint"}>{level.summary ?? "Nothing expected."}</span>
      </div>
      {level.outcomes.length ? (
        <ul className="dp-outcomes">
          {level.outcomes.map((o) => (
            <li key={o.id}>
              {o.until && o.until !== o.level ? (
                <span className="dp-outcome-label">
                  From {STABILITY[o.level].name} through {STABILITY[o.until].name}
                </span>
              ) : null}
              <span>{o.text}</span>
              <Guidance implementation={o.implementation} overengineering={o.overengineering} kinds={kinds} />
            </li>
          ))}
        </ul>
      ) : (
        <Guidance implementation={level.implementation} overengineering={level.overengineering} kinds={kinds} />
      )}
    </li>
  );
}

/* How meeting it might look, and what may be overengineering at its level, each folded. */
function Guidance({ implementation, overengineering, kinds }: { implementation: RubricExample[]; overengineering: RubricExample[]; kinds: RubricKind[] }) {
  if (!implementation.length && !overengineering.length) return null;
  const fold = (title: string, list: RubricExample[]) =>
    list.length ? (
      <details className="dp-guidance">
        <summary>
          {title} <span className="dp-count">{list.length}</span>
        </summary>
        <ul>
          {list.map((e) => (
            <li key={e.text}>
              {e.text}
              {e.kinds.map((k) => (
                <span key={k} className="dp-tag">
                  {kinds.find((x) => x.id === k)?.name ?? k}
                </span>
              ))}
            </li>
          ))}
        </ul>
      </details>
    ) : null;
  return (
    <div className="dp-guidance-row">
      {fold("How it might look", implementation)}
      {fold("May be overengineering", overengineering)}
    </div>
  );
}
