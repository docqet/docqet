import { useState, type ReactNode } from "react";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import Switch from "@mui/material/Switch";
import { DetailsCard, DetailsEyebrow, DetailsPopover } from "./design/DetailsPopover";
import { STABILITY, STABILITY_LEVEL_IDS } from "./design/stability/stability";
import { StabilityMark } from "./design/stability/StabilityMark";
import { LEFT_KINDS, LeftLabel, gapKind } from "./design/left/LeftMark";
import { StandingMark, type Standing } from "./design/standing/StandingMark";
import { TechnicalLink, levelName, plural } from "./Explore";
import {
  appliesAt,
  outcomeStanding,
  outcomesOf,
  type Capability,
  type Checklist,
  type ChecklistExample,
  type ChecklistOutcome,
  type ChecklistQuality,
  type DocketState,
  type Level,
} from "./state";

/*
 * The stability checklist, laid out as Exalynt's stability checklist page lays
 * it out, in Docket's look: pick a level to see what it expects, by quality,
 * each outcome with how meeting it might look and what may be overengineering
 * at that level. It's a guideline, not a gate, so the guidance is there to
 * judge by, never to follow step by step.
 *
 * On a capability's page it opens at the capability's level. Each outcome
 * that level expects is not met where a gap names it, on the capability or on
 * what it's built on; met with evidence where a mechanism or component it's
 * built on says it meets it; and otherwise met on the level's word. Other
 * levels show what came before and what's next. A draft claims none.
 */

const IMPLEMENTATION_INFO =
  "Examples of ways this outcome might be met, to help judge how to meet it at this level, or whether to at all. None is required, and other ways may fit better. Tags indicate the kinds of software each may suit.";

const OVERENGINEERING_INFO =
  "Examples of work that may be overengineering at this level. It may be in scope at another level, or never needed for the project at all. Use them to judge where this level's work stops.";

const BUILDS_ON_INFO = "Outcomes expected at lower levels. They still apply at this one, so this level adds to them rather than replacing them.";

/*
 * A quality's outcomes at `level`: those expected at it, and those from lower
 * levels it builds on. Baseline outcomes, and those a later level replaces
 * (`until`), are listed as expected while they apply, with their guidance,
 * since they're easy to miss otherwise.
 */
function outcomesAt(quality: ChecklistQuality, level: Level) {
  const included = outcomesOf(quality).filter((o) => appliesAt(o, level));
  return {
    expected: included.filter((o) => o.level === level || o.baseline || o.until),
    buildsOn: included.filter((o) => o.level !== level && !o.baseline && !o.until),
  };
}

const checklistAt = (checklist: Checklist, level: Level) => checklist.qualities.map((quality) => ({ quality, ...outcomesAt(quality, level) }));

/* How many qualities expect something at a level, and how many outcomes they expect. */
function countsAt(checklist: Checklist, level: Level) {
  const sections = checklistAt(checklist, level);
  return {
    qualities: sections.filter((s) => s.expected.length).length,
    outcomes: sections.reduce((n, s) => n + s.expected.length, 0),
  };
}

const isMet = (s: Standing) => s === "evidence" || s === "trust";

export function StabilityChecklist({ state, checklist, capability }: { state: DocketState; checklist: Checklist; capability: Capability }) {
  const own = capability.stability;
  const [level, setLevel] = useState<Level>(own ?? "prototype");
  const [showAll, setShowAll] = useState(false);
  const of = (outcome: ChecklistOutcome) => outcomeStanding(state, capability, outcome);
  const standing = (outcome: ChecklistOutcome): Standing => of(outcome).standing;
  const kindName = (id: string) => checklist.kinds.find((k) => k.id === id)?.name ?? id;

  const sections = checklistAt(checklist, level);
  const empty = sections.filter((s) => !s.expected.length).length;
  const shown = showAll ? sections : sections.filter((s) => s.expected.length);
  const expected = sections.flatMap((s) => s.expected);
  const unmet = sections.filter((s) => s.expected.some((o) => standing(o) === "gap")).map((s) => s.quality.name);
  const name = STABILITY[level].name;

  return (
    <div className="sc">
      <aside className="sc-note">
        <strong>A guideline, not a gate.</strong> It gives a level the same meaning for everyone, and doesn't replace engineering judgment: what an outcome takes,
        and whether it applies at all, depends on the software, who uses it and the circumstances. An outcome that applies is met, not applicable, or written
        down as a gap, GA included. The security and privacy baseline is the exception: it holds at every level, and is never a gap.
      </aside>

      <p className="sc-pick-label" id="sc-level">
        Pick a stability level
      </p>
      <div className="sc-levels" role="radiogroup" aria-labelledby="sc-level">
        {STABILITY_LEVEL_IDS.map((id) => {
          const counts = countsAt(checklist, id);
          return (
            <button key={id} type="button" role="radio" aria-checked={id === level} className="sc-level" onClick={() => setLevel(id)}>
              <span className="sc-level-top">
                <StabilityMark level={id} focusable={false} />
                {id === own ? <span className="sc-level-own">Its level</span> : null}
              </span>
              <span className="sc-level-counts">
                {plural(counts.qualities, "quality", "qualities")}
                <br />
                {plural(counts.outcomes, "expected outcome", "expected outcomes")}
              </span>
            </button>
          );
        })}
      </div>

      <div className="sc-bar">
        <p className="sc-status">
          {own === null ? (
            <>
              What {name} would expect of {capability.name}. It's a draft, declared and not started, so none of it is claimed yet.
            </>
          ) : level === own ? (
            <>
              <strong data-met={unmet.length ? "no" : "yes"}>
                {expected.filter((o) => isMet(standing(o))).length} of {expected.length} {name} outcomes met
              </strong>
              {unmet.length ? ` · Not met in ${unmet.join(", ")}` : null}. {expected.filter((o) => standing(o) === "evidence").length} with evidence from what
              it's built on; anything a gap doesn't name counts as met.
            </>
          ) : STABILITY_LEVEL_IDS.indexOf(level) > STABILITY_LEVEL_IDS.indexOf(own) ? (
            <>
              What {name} would expect of {capability.name}. It's at {levelName(own)}, so none of what's new here is claimed yet.
            </>
          ) : (
            <>
              What {name} expects. {capability.name} is at {levelName(own)}, which builds on it.
            </>
          )}
        </p>
        {empty ? (
          <label className="sc-show-all">
            <Switch size="small" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
            Show {plural(empty, "quality", "qualities")} with nothing expected
          </label>
        ) : null}
      </div>

      <div className="sc-qualities">
        {shown.map(({ quality, expected, buildsOn }) => {
          const entry = quality.levels.find((l) => l.level === level)!;
          return (
            <section key={quality.id} className="sc-quality">
              <header className="sc-quality-head">
                <div>
                  <h3>
                    <QualityName quality={quality} />
                  </h3>
                  <p className="sc-question">{quality.question}</p>
                </div>
                {buildsOn.length ? (
                  <Pill kind="builds-on" icon={<LayersOutlinedIcon sx={{ fontSize: 15 }} />} label="Builds on" count={buildsOn.length}>
                    <PillCard label="Builds on" info={BUILDS_ON_INFO} listLabel="Still expected">
                      <ul className="sc-builds-on">
                        {buildsOn.map((o) => (
                          <li key={o.id}>
                            <StabilityMark level={o.level} statement={false} focusable={false} />
                            <StandingIcon standing={standing(o)} />
                            <span>{o.text}</span>
                          </li>
                        ))}
                      </ul>
                    </PillCard>
                  </Pill>
                ) : null}
              </header>
              {expected.length ? (
                <ul className="sc-outcomes">
                  {expected.map((o) => (
                    <li key={o.id} className="sc-outcome" data-standing={standing(o)}>
                      <StandingIcon standing={standing(o)} />
                      <div>
                        {o.baseline ? (
                          <p className="sc-outcome-label">Required at every level</p>
                        ) : o.until && o.until !== o.level ? (
                          <p className="sc-outcome-label">
                            From {STABILITY[o.level].name} through {STABILITY[o.until].name}
                          </p>
                        ) : null}
                        <p className="sc-outcome-text">{o.text}</p>
                        <Guidance implementation={o.implementation} overengineering={o.overengineering} kindName={kindName} />
                        {of(o).gaps.map((g) => (
                          <p key={g.id} className="sc-gap">
                            <span className="explore-gap-kind">
                              <LeftLabel kind={gapKind(g)} size={13}>
                                {LEFT_KINDS[gapKind(g)].one}
                              </LeftLabel>
                            </span>
                            {g.text}
                          </p>
                        ))}
                        {appliesAt(o, own) && !of(o).gaps.length && of(o).by.length ? (
                          <p className="sc-met-by">
                            Met by{" "}
                            {of(o).by.map((e, i) => (
                              <span key={e.id}>
                                {i ? ", " : ""}
                                <TechnicalLink doc={e} />
                              </span>
                            ))}
                            {(() => {
                              const n = of(o).by.reduce((sum, e) => sum + e.evidence.implements.length + e.evidence.verifies.length, 0);
                              return n ? `, with evidence in ${plural(n, "place", "places")}` : ", which nothing points at yet";
                            })()}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <>
                  <p className="sc-nothing">
                    {buildsOn.length ? "Nothing new expected" : "Nothing expected"} at {name}.
                  </p>
                  <Guidance implementation={entry.implementation} overengineering={entry.overengineering} kindName={kindName} />
                </>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

const STANDING_LABELS: Record<Standing, string> = {
  evidence: "Met, with evidence",
  trust: "Met, on its level's word",
  gap: "Not met",
  "not-expected": "Not expected at its level",
};

/* Whether an outcome is met for this capability, with evidence or on trust, named by a gap, or not expected at its level. */
function StandingIcon({ standing }: { standing: Standing }) {
  return <StandingMark standing={standing} label={STANDING_LABELS[standing]} />;
}

/* A quality's name, which opens what it's about and how much each level asks of it, so the levels mean the same to everyone. */
function QualityName({ quality }: { quality: ChecklistQuality }) {
  return (
    <DetailsPopover
      title={
        <DetailsCard card width={380}>
          <DetailsEyebrow>Quality</DetailsEyebrow>
          <strong>{quality.question}</strong>
          <p className="sc-why">{quality.why}</p>
          <ul className="sc-summaries">
            {quality.levels.map((l) => (
              <li key={l.level} data-empty={!l.summary || undefined}>
                <StabilityMark level={l.level} statement={false} focusable={false} />
                <span>{l.summary ?? "Nothing expected."}</span>
              </li>
            ))}
          </ul>
        </DetailsCard>
      }
    >
      <span className="sc-quality-name" tabIndex={0}>
        {quality.name}
      </span>
    </DetailsPopover>
  );
}

/* Implementation, shown as how meeting it might look, and what may be overengineering: a pill for each, whose popover holds the list. Empty lists are left out. */
function Guidance({ implementation, overengineering, kindName }: { implementation: ChecklistExample[]; overengineering: ChecklistExample[]; kindName: (id: string) => string }) {
  if (!implementation.length && !overengineering.length) return null;
  return (
    <div className="sc-guidance">
      {implementation.length ? (
        <Pill kind="implementation" icon={<LightbulbOutlinedIcon sx={{ fontSize: 15 }} />} label="How it might look" count={implementation.length}>
          <PillCard label="How it might look" info={IMPLEMENTATION_INFO} listLabel="Examples">
            <Examples list={implementation} kindName={kindName} />
          </PillCard>
        </Pill>
      ) : null}
      {overengineering.length ? (
        <Pill kind="overengineering" icon={<WarningAmberRoundedIcon sx={{ fontSize: 15 }} />} label="Overengineering" count={overengineering.length}>
          <PillCard label="Overengineering" info={OVERENGINEERING_INFO} listLabel="Examples">
            <Examples list={overengineering} kindName={kindName} />
          </PillCard>
        </Pill>
      ) : null}
    </div>
  );
}

/* A list of examples, each with a tag for each kind of software it may suit. Without tags, it may suit any kind. */
function Examples({ list, kindName }: { list: ChecklistExample[]; kindName: (id: string) => string }) {
  return (
    <ul className="sc-examples">
      {list.map((e) => (
        <li key={e.text}>
          {e.text}
          {e.kinds.length ? (
            <span className="sc-kinds">
              {e.kinds.map((k) => (
                <span key={k} className="explore-tag">
                  {kindName(k)}
                </span>
              ))}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/* A link-like trigger, with an icon in its kind's tone, a label and a count, that opens its popover on hover, focus or tap. */
function Pill({ kind, icon, label, count, children }: { kind: string; icon: ReactNode; label: string; count: number; children: ReactNode }) {
  return (
    <DetailsPopover title={children}>
      <button type="button" className="sc-pill" data-kind={kind}>
        {icon}
        <span className="sc-pill-label">{label}</span>
        <span className="sc-pill-count">{count}</span>
      </button>
    </DetailsPopover>
  );
}

/* A pill's popover: its title and what it means, then the list, labelled. */
function PillCard({ label, info, listLabel, children }: { label: string; info: string; listLabel: string; children: ReactNode }) {
  return (
    <DetailsCard card width={440}>
      <DetailsEyebrow>{label}</DetailsEyebrow>
      <p className="sc-pill-info">{info}</p>
      <p className="sc-list-label">{listLabel}</p>
      {children}
    </DetailsCard>
  );
}
