import { useState, type ReactNode } from "react";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import type { Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import { DetailsPopover, NoPopovers } from "../../../components/popovers/DetailsPopover";
import { STABILITY, STABILITY_LEVEL_IDS } from "../../../components/stability/stability";
import { StabilityMark } from "../../../components/stability/StabilityMark";
import { LEFT_KINDS, LeftLabel, gapKind } from "../../../components/left/LeftMark";
import { InlineMarkdown } from "../../../components/markdown/Markdown";
import { StandingMark, type Standing } from "../../../components/standing/StandingMark";
import { TechnicalLink } from "../../../components/Technical";
import { levelName } from "../../../components/stability/stability";
import { plural } from "../../../components/names";
import {
  appliesAt,
  outcomesOf,
  type Capability,
  type Rubric,
  type RubricExample,
  type ExpectedOutcome,
  type RubricQuality,
  type Level,
  type TechnicalDoc,
} from "../../../state";
import { tagSx } from "../../../components/doc/DocPage";
import { PillCard } from "../../../components/popovers/PillCard";
import { QualityDetails } from "../../../components/popovers/QualityDetails";

/*
 * The stability rubric, as a checklist: pick a level to see what it expects, by quality,
 * each outcome with how meeting it might look and what may be overengineering
 * at that level. It's a guideline, not a gate, so the guidance is there to
 * judge by, never to follow step by step.
 *
 * On a capability's page it opens at the capability's level. Each outcome
 * that level expects is not met where a gap affects it, on the capability or
 * on what it's built on; not met by choice where a tradeoff does; open where
 * an open decision there is on whether to meet it; met with evidence where a
 * mechanism or component it's built on says it meets it; and otherwise met
 * on the level's word. Other
 * levels show what came before and what's next. A draft claims none.
 */

const IMPLEMENTATION_INFO =
  "Examples of ways this outcome might be met, to help judge how to meet it at this level, or whether to at all. None is required, and other ways may fit better. Tags indicate the kinds of software each may suit.";

const OVERENGINEERING_INFO =
  "Examples of work that may be overengineering at this level. It may be in scope at another level, or never needed for the project at all. Use them to judge where this level's work stops.";

const BUILDS_ON_INFO = "Outcomes expected at lower levels. They still apply at this one, so this level adds to them rather than replacing them.";

/*
 * A quality's outcomes at `level`: those expected at it, and those from lower
 * levels it builds on. Those a later level replaces (`until`) are listed as
 * expected while they apply, with their guidance, since they're easy to miss
 * otherwise.
 */
function outcomesAt(quality: RubricQuality, level: Level) {
  const included = outcomesOf(quality).filter((o) => appliesAt(o, level));
  return {
    expected: included.filter((o) => o.level === level || o.until),
    buildsOn: included.filter((o) => o.level !== level && !o.until),
  };
}

const rubricAt = (rubric: Rubric, level: Level) => rubric.qualities.map((quality) => ({ quality, ...outcomesAt(quality, level) }));

/* How many qualities expect something at a level, and how many outcomes they expect. */
function countsAt(rubric: Rubric, level: Level) {
  const sections = rubricAt(rubric, level);
  return {
    qualities: sections.filter((s) => s.expected.length).length,
    outcomes: sections.reduce((n, s) => n + s.expected.length, 0),
  };
}

const isMet = (s: Standing) => s === "evidence" || s === "trust";

export function StabilityRubric({ rubric, capability }: { rubric: Rubric; capability: Capability }) {
  const own = capability.stability;
  const [level, setLevel] = useState<Level>(own ?? "prototype");
  const [showAll, setShowAll] = useState(false);
  const of = (outcome: ExpectedOutcome) => capability.outcomes[outcome.id];
  const standing = (outcome: ExpectedOutcome): Standing => of(outcome).standing;
  const kindName = (id: string) => rubric.kinds.find((k) => k.id === id)?.name ?? id;

  const sections = rubricAt(rubric, level);
  const empty = sections.filter((s) => !s.expected.length).length;
  const shown = showAll ? sections : sections.filter((s) => s.expected.length);
  const expected = sections.flatMap((s) => s.expected);
  const unmet = sections.filter((s) => s.expected.some((o) => standing(o) === "gap")).map((s) => s.quality.name);
  const byChoice = expected.filter((o) => standing(o) === "tradeoff").length;
  const open = expected.filter((o) => standing(o) === "open").length;
  const name = STABILITY[level].name;

  return (
    <div>
      <Box
        component="aside"
        sx={{
          mb: 2.25,
          px: 1.75,
          py: 1.25,
          fontSize: 13,
          lineHeight: 1.55,
          color: "text.secondary",
          bgcolor: "surface.accentSoft",
          borderLeft: 2,
          borderColor: "primary.main",
          borderRadius: "0 8px 8px 0",
          "& strong": { color: "text.primary" },
        }}
      >
        <strong>A guideline, not a gate.</strong> It gives a level the same meaning for everyone, and doesn't replace engineering judgment: what an outcome
        takes, and whether it applies at all, depends on the software, who uses it and the circumstances. An outcome that applies is met, not applicable, or
        written down as a gap, GA included.
      </Box>

      <Box component="p" id="sc-level" sx={{ mb: 1, typography: "overline", color: "text.disabled" }}>
        Pick a stability level
      </Box>
      <Box
        role="radiogroup"
        aria-labelledby="sc-level"
        sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(4, minmax(0, 1fr))" }, gap: 1 }}
      >
        {STABILITY_LEVEL_IDS.map((id) => {
          const counts = countsAt(rubric, id);
          return (
            <Box component="button" key={id} type="button" role="radio" aria-checked={id === level} onClick={() => setLevel(id)} sx={levelSx}>
              <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {/* A choice, so its level opens no popover over it. */}
                <NoPopovers>
                  <StabilityMark level={id} focusable={false} />
                </NoPopovers>
                {id === own ? (
                  <Box component="span" sx={{ ml: "auto", fontSize: 10.5, fontWeight: 650, color: "primary.main" }}>
                    Its level
                  </Box>
                ) : null}
              </Box>
              <Box component="span" sx={{ fontSize: 12, lineHeight: 1.45, color: "text.secondary" }}>
                {plural(counts.qualities, "quality", "qualities")}
                <br />
                {plural(counts.outcomes, "expected outcome", "expected outcomes")}
              </Box>
            </Box>
          );
        })}
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "6px 16px", mt: 2, mb: 0.75 }}>
        <Box
          component="p"
          sx={{
            flex: "1 1 320px",
            fontSize: 13.5,
            color: "text.secondary",
            "& strong": { color: "success.main" },
            "& strong[data-met=no]": { color: "warning.main" },
          }}
        >
          {own === null ? (
            <>
              What {name} would expect of {capability.name}. It's a draft, declared and not started, so none of it is claimed yet.
            </>
          ) : level === own ? (
            <>
              <strong data-met={unmet.length ? "no" : "yes"}>
                {expected.filter((o) => isMet(standing(o))).length} of {expected.length} {name} outcomes met
              </strong>
              {unmet.length ? ` · Not met in ${unmet.join(", ")}` : null}
              {byChoice ? ` · ${byChoice} not met by choice` : null}
              {open ? ` · ${open} open` : null}. {expected.filter((o) => standing(o) === "evidence").length} with evidence from what it's built on; anything a
              gap, tradeoff or open decision doesn't name counts as met.
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
        </Box>
        {empty ? (
          <Box component="label" sx={{ display: "inline-flex", alignItems: "center", gap: "2px", fontSize: 12.5, color: "text.secondary", cursor: "pointer" }}>
            <Switch size="small" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
            Show {plural(empty, "quality", "qualities")} with nothing expected
          </Box>
        ) : null}
      </Box>

      <div>
        {shown.map(({ quality, expected, buildsOn }) => {
          const entry = quality.levels.find((l) => l.level === level)!;
          return (
            <Box component="section" key={quality.id} sx={{ pt: 2, pb: 1.75, borderTop: 1, borderColor: "divider", "&:last-of-type": { pb: 0 } }}>
              <Box component="header" sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1.5, mb: 1.25 }}>
                <div>
                  <Box component="h3" sx={{ fontSize: 14.5, fontWeight: 700 }}>
                    <QualityName quality={quality} />
                  </Box>
                  <Box component="p" sx={{ mt: "2px", fontSize: 12.5, color: "text.secondary" }}>
                    {quality.question}
                  </Box>
                </div>
                {buildsOn.length ? (
                  <Pill kind="builds-on" icon={<LayersOutlinedIcon sx={{ fontSize: 15 }} />} label="Builds on" count={buildsOn.length}>
                    <PillCard label="Builds on" info={BUILDS_ON_INFO} listLabel="Still expected">
                      <ul>
                        {buildsOn.map((o) => (
                          <Box
                            component="li"
                            key={o.id}
                            sx={{
                              display: "grid",
                              gridTemplateColumns: "auto 16px minmax(0, 1fr)",
                              alignItems: "start",
                              gap: 1,
                              "& + &": { mt: "7px" },
                              /* The standing mark sits a pixel lower than it does beside an outcome. */
                              "& .sc-standing": { mt: "1px" },
                            }}
                          >
                            <StabilityMark level={o.level} statement={false} focusable={false} />
                            <StandingIcon standing={standing(o)} />
                            <span>{o.text}</span>
                          </Box>
                        ))}
                      </ul>
                    </PillCard>
                  </Pill>
                ) : null}
              </Box>
              {expected.length ? (
                <ul>
                  {expected.map((o) => (
                    <Box
                      component="li"
                      key={o.id}
                      sx={{ display: "grid", gridTemplateColumns: "18px minmax(0, 1fr)", gap: 1, fontSize: 13.5, lineHeight: 1.5, "& + &": { mt: 1.5 } }}
                    >
                      <StandingIcon standing={standing(o)} />
                      <div>
                        {o.until && o.until !== o.level ? (
                          <Box
                            component="p"
                            sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "primary.main" }}
                          >
                            From {STABILITY[o.level].name} through {STABILITY[o.until].name}
                          </Box>
                        ) : null}
                        <Box component="p" sx={{ color: standing(o) === "not-expected" ? "text.secondary" : "text.primary" }}>
                          {o.text}
                        </Box>
                        <Guidance implementation={o.implementation} overengineering={o.overengineering} kindName={kindName} />
                        {of(o).gaps.map((g) => (
                          <OutcomeNote
                            key={g.id}
                            label={
                              <LeftLabel kind={gapKind(g)} size={13}>
                                {LEFT_KINDS[gapKind(g)].one}
                              </LeftLabel>
                            }
                          >
                            {g.name}
                          </OutcomeNote>
                        ))}
                        {of(o).tradeoffs.map((t) => (
                          <OutcomeNote
                            key={t.id}
                            label={
                              <LeftLabel kind="tradeoff" size={13}>
                                Not met, by choice
                              </LeftLabel>
                            }
                          >
                            {t.name}
                          </OutcomeNote>
                        ))}
                        {of(o).decisions.map((d, i) => (
                          <OutcomeNote
                            key={i}
                            decision
                            label={
                              <LeftLabel kind="decision" size={13}>
                                Open
                              </LeftLabel>
                            }
                          >
                            <InlineMarkdown text={d.question} />
                          </OutcomeNote>
                        ))}
                        {appliesAt(o, own) && !of(o).gaps.length && !of(o).tradeoffs.length && !of(o).decisions.length && of(o).by.length ? (
                          <MetBy by={of(o).by} />
                        ) : null}
                      </div>
                    </Box>
                  ))}
                </ul>
              ) : (
                <>
                  <Box component="p" sx={{ fontSize: 13, color: "text.disabled" }}>
                    {buildsOn.length ? "Nothing new expected" : "Nothing expected"} at {name}.
                  </Box>
                  <Guidance implementation={entry.implementation} overengineering={entry.overengineering} kindName={kindName} />
                </>
              )}
            </Box>
          );
        })}
      </div>
    </div>
  );
}

/* A level to pick: a card that lights in the accent's soft fill on hover, and is ringed in the accent when picked. */
const levelSx: SystemStyleObject<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 1,
  px: 1.5,
  py: 1.25,
  font: "inherit",
  textAlign: "left",
  color: "text.primary",
  bgcolor: "transparent",
  border: 1,
  borderColor: "divider",
  borderRadius: "8px",
  cursor: "pointer",
  "&:hover": { borderColor: "surface.borderStrong", bgcolor: "surface.accentSoft" },
  "&[aria-checked=true]": { borderColor: "primary.main", boxShadow: (t) => t.vars.palette.lit.ring },
  "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: "2px" },
};

/* What says an outcome isn't met, by a gap or by choice, or that whether to meet it is open: its kind over its name, in a gap's color or a decision's. */
function OutcomeNote({ label, decision = false, children }: { label: ReactNode; decision?: boolean; children: ReactNode }) {
  return (
    <Box
      component="p"
      sx={{
        mt: 0.75,
        px: 1,
        py: 0.75,
        fontSize: 12.5,
        color: "text.primary",
        bgcolor: (t) => `color-mix(in srgb, ${decision ? t.vars.palette.primary.main : t.vars.palette.warning.main} ${decision ? 7 : 9}%, transparent)`,
        borderLeft: 2,
        borderColor: decision ? "primary.main" : "warning.main",
        borderRadius: "0 6px 6px 0",
      }}
    >
      <Box
        component="span"
        sx={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "text.disabled" }}
      >
        {label}
      </Box>
      {children}
    </Box>
  );
}

/*
 * What meets an outcome, under it: a small label, the mechanisms and
 * components that say so as chips, and how much evidence there is.
 */
function MetBy({ by }: { by: TechnicalDoc[] }) {
  const n = by.reduce((sum, e) => sum + e.evidence.implements.length + e.evidence.verifies.length, 0);
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "4px 6px",
        mt: 1,
        fontSize: 12,
        color: "text.secondary",
        "& a": {
          gap: 0.5,
          py: "1px",
          pr: 1,
          pl: 0.75,
          lineHeight: "18px",
          color: "concept.main",
          textDecoration: "none",
          bgcolor: "concept.soft",
          border: 1,
          borderColor: (t) => `color-mix(in srgb, ${t.vars.palette.concept.main} 22%, transparent)`,
          borderRadius: 999,
          "&:hover": { borderColor: (t) => `color-mix(in srgb, ${t.vars.palette.concept.main} 55%, transparent)` },
          "& svg": { fontSize: 14, color: "currentColor", opacity: 0.8 },
        },
      }}
    >
      <Box component="span" sx={{ mr: "2px", fontSize: 10.5, fontWeight: 650, letterSpacing: "0.06em", textTransform: "uppercase", color: "text.disabled" }}>
        Met by
      </Box>
      {by.map((e) => (
        <TechnicalLink key={e.id} doc={e} />
      ))}
      <Box component="span" sx={{ ml: "2px", color: "text.disabled" }}>
        {n ? `evidence in ${plural(n, "place", "places")}` : "nothing in the code points at it yet"}
      </Box>
    </Box>
  );
}

const STANDING_LABELS: Record<Standing, string> = {
  evidence: "Met, with evidence",
  trust: "Met, on its level's word",
  gap: "Not met",
  tradeoff: "Not met, by choice",
  open: "Open: a decision on whether to meet it",
  "not-expected": "Not expected at its level",
};

/* Whether an outcome is met for this capability, with evidence or on trust, named by a gap, a tradeoff or an open decision, or not expected at its level. */
function StandingIcon({ standing }: { standing: Standing }) {
  return <StandingMark standing={standing} label={STANDING_LABELS[standing]} />;
}

/* A quality's name, which opens what it's about and how much each level asks of it, so the levels mean the same to everyone. */
function QualityName({ quality }: { quality: RubricQuality }) {
  return (
    <DetailsPopover title={<QualityDetails quality={quality} />}>
      <Box
        component="span"
        tabIndex={0}
        sx={{
          cursor: "help",
          textDecoration: "underline dotted",
          textDecorationColor: (t) => t.vars.palette.surface.borderStrong,
          textUnderlineOffset: "4px",
          "&:focus-visible": focusSx,
        }}
      >
        {quality.name}
      </Box>
    </DetailsPopover>
  );
}

/* Implementation, shown as how meeting it might look, and what may be overengineering: a pill for each, whose popover holds the list. Empty lists are left out. */
function Guidance({
  implementation,
  overengineering,
  kindName,
}: {
  implementation: RubricExample[];
  overengineering: RubricExample[];
  kindName: (id: string) => string;
}) {
  if (!implementation.length && !overengineering.length) return null;
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", mt: 0.5 }}>
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
    </Box>
  );
}

/* A list of examples, each with a tag for each kind of software it may suit. Without tags, it may suit any kind. */
function Examples({ list, kindName }: { list: RubricExample[]; kindName: (id: string) => string }) {
  return (
    <Box component="ul" sx={{ pl: 2, listStyle: "disc", "& > li + li": { mt: 0.75 }, "& > li::marker": { color: "text.disabled" } }}>
      {list.map((e) => (
        <li key={e.text}>
          {e.text}
          {e.kinds.length ? (
            <Box component="span" sx={{ display: "inline-flex", flexWrap: "wrap", gap: "3px", ml: 0.75, verticalAlign: "1px" }}>
              {e.kinds.map((k) => (
                <Box component="span" key={k} sx={[tagSx, { px: 0.75, fontSize: 10.5, lineHeight: "16px" }]}>
                  {kindName(k)}
                </Box>
              ))}
            </Box>
          ) : null}
        </li>
      ))}
    </Box>
  );
}

/* A visible focus ring, in the accent. */
const focusSx: SystemStyleObject<Theme> = { outline: "2px solid", outlineColor: "primary.main", outlineOffset: "2px", borderRadius: "3px" };

/* Each pill's icon in its kind's tone: an idea in the accent, overengineering as a warning, and what it builds on faint. */
const PILL_TONES = { implementation: "primary.main", overengineering: "warning.main", "builds-on": "text.disabled" } as const;

/* A link-like trigger, with an icon in its kind's tone, a label and a count, that opens its popover on hover, focus or tap. */
function Pill({ kind, icon, label, count, children }: { kind: keyof typeof PILL_TONES; icon: ReactNode; label: string; count: number; children: ReactNode }) {
  return (
    <DetailsPopover title={children}>
      <Box
        component="button"
        type="button"
        sx={{
          display: "inline-flex",
          flex: "none",
          alignItems: "center",
          gap: "5px",
          py: "1px",
          px: 0,
          font: "inherit",
          fontSize: 12,
          color: "text.secondary",
          bgcolor: "transparent",
          border: 0,
          cursor: "help",
          "& > svg": { color: PILL_TONES[kind] },
          "&:hover > span:first-of-type, &:focus-visible > span:first-of-type": { color: "text.primary" },
          "&:focus-visible": focusSx,
        }}
      >
        {icon}
        <Box
          component="span"
          sx={{ textDecoration: "underline dotted", textDecorationColor: (t) => t.vars.palette.surface.borderStrong, textUnderlineOffset: "3px" }}
        >
          {label}
        </Box>
        <Box
          component="span"
          sx={{
            minWidth: 16,
            px: 0.5,
            fontSize: 10.5,
            fontWeight: 650,
            lineHeight: "15px",
            textAlign: "center",
            color: "text.secondary",
            bgcolor: "surface.accentSoft",
            borderRadius: 999,
          }}
        >
          {count}
        </Box>
      </Box>
    </DetailsPopover>
  );
}
