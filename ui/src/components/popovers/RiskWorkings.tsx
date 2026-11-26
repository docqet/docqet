import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import type { ReactNode } from "react";
import { IMPACTS, LIKELIHOODS, REACHES, verdictOf, type Risk, type RiskOn, type Verdict } from "../../state";
import { STABILITY_LEVEL_IDS } from "../stability/stability";
import { ImpactBadge, JudgementBadge, PartTag, RiskPartIcon } from "../risk/ImpactBadge";
import { StabilityMark } from "../stability/StabilityMark";
import { VERDICT_COLORS, riskOnScoreSx } from "../risk/RiskScore";
import { detailsHeadSx } from "./DetailsPopover";

/*
 * How a risk is worked out, on one capability: each part, what it is and
 * the factor it contributes, in two groups, what the gap could do (impact,
 * likelihood, reach) and how much people rely on what it's in (level, and
 * whether it breaks a claim that level makes, which weighs more the higher
 * the level), then what they multiply to and
 * where that falls on the 0 to 100 scale. Each part has a slider showing
 * where it sits in its range, from what adds least to risk on the left to
 * what adds most on the right.
 */

/* The faint text color at `percent`, for a slider's track and fill. */
const faded = (percent: number) => (t: Theme) => `color-mix(in srgb, ${t.vars.palette.text.primary} ${percent}%, transparent)`;

/* A line across a slider, centred on it: its track, or its fill up to where it's at. */
const line = (height: number): SystemStyleObject<Theme> => ({
  content: '""',
  position: "absolute",
  top: "50%",
  height,
  transform: "translateY(-50%)",
  borderRadius: `${height / 2}px`,
});

/* A part's place in its range: a stop for each value, filled up to the current one. `at` is -1 for none, such as a draft's level. */
function Slider({ stops, at, label }: { stops: number; at: number; label: string }) {
  return (
    <Box
      component="span"
      role="img"
      aria-label={label}
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        height: 10,
        "&::before": { ...line(2), left: 3, right: 3, bgcolor: faded(12) },
      }}
    >
      {at < 0 ? null : <Box component="span" sx={{ ...line(2), left: 3, width: `calc((100% - 6px) * ${at / (stops - 1)})`, bgcolor: faded(45) }} />}
      {Array.from({ length: stops }, (_, n) => (
        <Box
          key={n}
          component="span"
          sx={[
            { position: "relative", width: 6, height: 6, borderRadius: "50%", bgcolor: n <= at ? "transparent" : faded(12) },
            n === at && { width: 10, height: 10, mx: "-2px", bgcolor: "text.primary", boxShadow: (t) => `0 0 0 2px ${t.vars.palette.background.paper}` },
          ]}
        />
      ))}
    </Box>
  );
}

/* Where a value sits among its values, least risk first: the lists run most first, so they're read from the end. */
const placeOf = (values: readonly string[], value: string | null) => (value === null ? -1 : values.length - 1 - values.indexOf(value));

/* The overall score on the 0 to 100 scale, with the thirds the verdicts start at marked, filled in the verdict's color. */
function ScoreSlider({ score, verdict }: { score: number; verdict: Verdict }) {
  const at = `${score}%`;
  const centred: SystemStyleObject<Theme> = { position: "absolute", top: "50%", transform: "translate(-50%, -50%)" };
  const third = (left: string) => <Box component="span" sx={{ ...centred, left, width: 3, height: 8, bgcolor: "background.paper" }} />;
  return (
    <Box
      component="span"
      role="img"
      aria-label={`${score} of 100`}
      sx={{ position: "relative", display: "block", height: 12, "&::before": { ...line(4), left: 0, right: 0, bgcolor: faded(10) } }}
    >
      <Box component="span" sx={{ ...line(4), left: 0, width: at, bgcolor: VERDICT_COLORS[verdict] }} />
      {third("33%")}
      {third("67%")}
      <Box
        component="span"
        sx={{
          ...centred,
          left: at,
          width: 12,
          height: 12,
          borderRadius: "50%",
          bgcolor: VERDICT_COLORS[verdict],
          boxShadow: (t) => `0 0 0 2px ${t.vars.palette.background.paper}`,
        }}
      />
    </Box>
  );
}

/* A factor as written: ¾, ½ and ¼ as fractions, the rest as numbers. */
const factor = (n: number) => ({ 0.75: "¾", 0.5: "½", 0.25: "¼" })[n] ?? String(Math.round(n * 100) / 100);

/* One part's row: what it is, its value, where that sits in its range, and the factor it contributes. */
function Part({ label, value, slider, factor }: { label: ReactNode; value: ReactNode; slider: ReactNode; factor: string }) {
  return (
    <>
      <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: "5px", color: "text.secondary" }}>
        {label}
      </Box>
      <Box component="span" sx={{ fontWeight: 600 }}>
        {value}
      </Box>
      {slider}
      <Box component="span" sx={{ textAlign: "right", color: "text.disabled" }}>
        {factor}
      </Box>
    </>
  );
}

/*
 * Impact, likelihood and reach are their tags, in their colors. Where
 * there's room for them to open what they mean, as on a gap's page,
 * `interactive` makes them badges with their popovers; inside a popover
 * they stay plain tags.
 */
export function RiskWorkings({ risk, on, interactive = false }: { risk: Risk; on: RiskOn; interactive?: boolean }) {
  const tag = (part: "impact" | "likelihood" | "reach") =>
    interactive ? (
      part === "impact" ? (
        <ImpactBadge impact={risk.impact} eyebrow="How bad it is" />
      ) : (
        <JudgementBadge part={part} value={part === "likelihood" ? risk.likelihood : risk.reach} />
      )
    ) : (
      <PartTag part={part} value={part === "impact" ? risk.impact : part === "likelihood" ? risk.likelihood : risk.reach} />
    );
  const verdict = verdictOf(on.score);
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "auto minmax(0, 1fr) 52px 34px",
        alignItems: "center",
        columnGap: 1.25,
        rowGap: "5px",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <Box component="span" sx={[detailsHeadSx, { mt: 0 }]}>
        What it could do
      </Box>
      <Part
        label={
          <>
            <RiskPartIcon part="impact" size={13} />
            Impact
          </>
        }
        value={tag("impact")}
        slider={<Slider stops={4} at={placeOf(IMPACTS, risk.impact)} label="Negligible, inconvenient, blocking, damaging" />}
        factor={factor(on.impact)}
      />
      <Part
        label={
          <>
            <RiskPartIcon part="likelihood" size={13} />
            Likelihood
          </>
        }
        value={tag("likelihood")}
        slider={<Slider stops={4} at={placeOf(LIKELIHOODS, risk.likelihood)} label="Unlikely, possible, expected, certain" />}
        factor={`× ${factor(on.likelihood)}`}
      />
      <Part
        label={
          <>
            <RiskPartIcon part="reach" size={13} />
            Reach
          </>
        }
        value={tag("reach")}
        slider={<Slider stops={4} at={placeOf(REACHES, risk.reach)} label="Few, some, most, all" />}
        factor={`× ${factor(on.reach)}`}
      />

      <Box component="span" sx={detailsHeadSx}>
        How much people rely on {on.capability.name}
      </Box>
      <Part
        label="Stability"
        value={
          on.capability.stability ? <StabilityMark level={on.capability.stability} feature={on.capability.name} focusable={interactive} size="long" /> : "Draft"
        }
        slider={
          <Slider stops={4} at={on.capability.stability ? STABILITY_LEVEL_IDS.indexOf(on.capability.stability) : -1} label="Prototype, Alpha, Beta, GA" />
        }
        factor={`× ${factor(on.weight)}`}
      />
      <Part
        label="Claims"
        value={on.claim ? "Breaks one" : "Keeps them"}
        slider={<Slider stops={2} at={on.claim ? 1 : 0} label="Keeps them, breaks one" />}
        factor={`× ${String(on.claimFactor)}`}
      />

      <Box
        component="span"
        sx={{
          gridColumn: "1 / -1",
          display: "flex",
          flexDirection: "column",
          gap: 0.75,
          mt: 0.75,
          pt: 1,
          borderTop: 1,
          borderColor: "divider",
          color: "text.secondary",
        }}
      >
        <Box component="span" sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1.5 }}>
          <Box component="span" sx={{ fontSize: "0.92em", color: "text.disabled" }}>
            {[...[on.impact, on.likelihood, on.reach, on.weight].map(factor), String(on.claimFactor)].join(" × ")} = {factor(on.raw)}
          </Box>
          <Box component="span" sx={riskOnScoreSx(verdict)}>
            {on.score} of 100
          </Box>
        </Box>
        <ScoreSlider score={on.score} verdict={verdict} />
        <Box
          component="span"
          aria-hidden
          sx={{ display: "grid", gridTemplateColumns: "33fr 34fr 33fr", fontSize: "0.78em", color: "text.disabled", textAlign: "center" }}
        >
          <span>Acceptable</span>
          <span>Tolerable</span>
          <span>Unacceptable</span>
        </Box>
      </Box>
    </Box>
  );
}
