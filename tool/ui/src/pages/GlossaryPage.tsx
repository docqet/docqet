import { useEffect } from "react";
import { Term } from "../design/term/Term";
import Box from "@mui/material/Box";
import { RingGlyph } from "../design/maturity/RingGlyph";
import { MATURITY_BANDS, MATURITY_LEVELS } from "../design/maturity/maturity";
import { STABILITY, STABILITY_LEVEL_IDS, levelColor, type StabilityLevelId } from "../design/stability/stability";
import { StabilityMark } from "../design/stability/StabilityMark";
import { TERMS, type TermId } from "../design/term/terms";
import { readinessName } from "../Personas";
import { sectionHref, type Route } from "../routes";
import { Empty, PageHeader, Section, Tabs, View, currentTab, type TabDef } from "../shell/layout";
import type { ChecklistExample, ChecklistKind, ChecklistLevel, DocketState } from "../state";
import "./doc.css";

/*
 * What Docket's own words mean, in one place, so a Term's popover isn't the
 * only way to find out: every term, grouped as the domain overview groups
 * them; the stability levels, with maturity and readiness, which are worked
 * out from them; and the stability checklist as a plain reference. Each term
 * is anchored by its ID, as `?view=glossary#gap`, so anything can link to it.
 */
export default function GlossaryPage({ state, route }: { state: DocketState; route: Route }) {
  const tabs: TabDef[] = [
    { id: "terms", label: "Terms", count: Object.keys(TERMS).length },
    { id: "levels", label: "Stability levels" },
    { id: "checklist", label: "Stability checklist", term: "stability-checklist" as const, count: state.checklist?.qualities.length },
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
      {tab === "terms" ? <Terms /> : tab === "levels" ? <Levels /> : <ChecklistReference state={state} />}
    </View>
  );
}

/* ——— Terms ——— */

/* The terms in groups, as the domain overview's "Every concept" has them. Any not named here go last. */
const GROUPS: { title: string; ids: TermId[] }[] = [
  { title: "The product", ids: ["platform", "project", "contradiction", "domain", "feature", "capability", "rule", "concept", "persona"] },
  { title: "How it's built", ids: ["mechanism", "component"] },
  { title: "Where intention and reality differ", ids: ["open-decision", "gap", "product-gap", "technical-gap", "tradeoff", "risk", "exposure"] },
  { title: "Stability and readiness", ids: ["stability-checklist", "readiness"] },
  { title: "Evidence", ids: ["evidence"] },
];

const levelsHref = (hash: string) => `${sectionHref("glossary", { tab: "levels" })}#${hash}`;

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
              </article>
            ))}
            {g.title === "Stability and readiness" ? (
              <>
                <article id="stability-level" className="dp-term">
                  <h3>Stability level</h3>
                  <p>How much people can depend on a capability right now: Prototype, Alpha, Beta or GA, or a draft, not started, with none.</p>
                  <p className="dp-term-more">
                    <a href={levelsHref("levels")}>Each level, and what to expect from it</a>
                  </p>
                </article>
                <article id="maturity" className="dp-term">
                  <h3>Maturity</h3>
                  <p>How far along a feature, domain or project is, as a percentage worked out from its capabilities' levels, in one of four bands.</p>
                  <p className="dp-term-more">
                    <a href={levelsHref("maturity")}>How it's worked out, and its bands</a>
                  </p>
                </article>
              </>
            ) : null}
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

/* What each step of readiness tells whoever is looking, as the persona's readiness says it. */
const READINESS_SUMMARIES = [
  "Most of what they need is still being explored, and could change completely or be dropped.",
  "Some of what they need works, but much of it is still taking shape, so expect changes and bugs.",
  "Enough of what they need is settled or stable for them to rely on day to day.",
  "What they need is mostly stable and supported, while any newer parts settle in.",
];

function Levels() {
  return (
    <>
      <Section
        id="levels"
        title="Stability levels"
        note="How much people can depend on a capability right now. Its builders declare it, and it moves up from Prototype through Alpha and Beta to General Availability as it's proven in real use. A level is about dependability, not quality: a GA capability can still have bugs and gaps."
      >
        <div className="dp-levels">
          <article id="draft" className="dp-level">
            <h3 className="dp-level-draft">Draft</h3>
            <p>Declared and not started. It has no level, so it promises nothing, claims nothing on the checklist, and counts toward no maturity or readiness.</p>
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
        note="How far along a feature, domain or project is: how much of the work under way is stable and supported. It's an indication about the whole, not a verdict on each part; before depending on something, check the level of the capability you need."
      >
        <p className="dp-note">
          A feature's maturity is the average of its capabilities' scores, each weighted by its level, drafts left out. A domain's comes from its parts of
          features, and a project's from all of its. Starting new work lowers it without anything getting worse, and 100% isn't the goal.
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

      <Section id="readiness" title="Readiness" term="readiness" note={TERMS.readiness.means}>
        <p className="dp-note">
          It's worked out as a feature's maturity is, from the levels of the capabilities that serve them. It has a scale of its own, so it's never mistaken for
          maturity.
        </p>
        <table className="view-table">
          <thead>
            <tr>
              <th><Term id="readiness" hoverOnly>Readiness</Term></th>
              <th className="num">From</th>
              <th>What it tells you</th>
            </tr>
          </thead>
          <tbody>
            {[0, 25, 50, 75].map((from, i) => (
              <tr key={from}>
                <td>
                  <strong>{readinessName(from)}</strong>
                </td>
                <td className="num">{from}%</td>
                <td>{READINESS_SUMMARIES[i]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </>
  );
}

/* ——— The stability checklist ——— */

/* The checklist as a plain reference: each quality, then what each level asks of it and the outcomes it expects. A capability's page shows it for that capability. */
function ChecklistReference({ state }: { state: DocketState }) {
  const checklist = state.checklist;
  if (!checklist) return <Empty>None of the projects showing has a stability checklist.</Empty>;
  return (
    <>
      <p className="dp-note">
        <strong>A guideline, not a gate.</strong> It gives each level the same meaning for everyone, and doesn't replace engineering judgment. An outcome
        applies from its level up, and one that applies is met, not applicable, or written down as a gap or tradeoff. The security and privacy baseline is the
        exception: it holds at every level, and is never a gap. Each capability's page shows where it stands against its own level.
      </p>
      <nav className="dp-index" aria-label="Qualities">
        {checklist.qualities.map((q) => (
          <a key={q.id} href={`#${q.id}`}>
            {q.name}
          </a>
        ))}
      </nav>
      {checklist.qualities.map((q) => (
        <section key={q.id} id={q.id} className="dp-quality">
          <h2>{q.name}</h2>
          <p className="dp-quality-question">{q.question}</p>
          <p className="dp-note">{q.why}</p>
          <ol className="dp-quality-levels">
            {q.levels.map((l) => (
              <QualityLevel key={l.level} level={l} kinds={checklist.kinds} />
            ))}
          </ol>
        </section>
      ))}
    </>
  );
}

function QualityLevel({ level, kinds }: { level: ChecklistLevel; kinds: ChecklistKind[] }) {
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
              {o.baseline ? (
                <span className="dp-outcome-label">Required at every level</span>
              ) : o.until && o.until !== o.level ? (
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
function Guidance({ implementation, overengineering, kinds }: { implementation: ChecklistExample[]; overengineering: ChecklistExample[]; kinds: ChecklistKind[] }) {
  if (!implementation.length && !overengineering.length) return null;
  const fold = (title: string, list: ChecklistExample[]) =>
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
