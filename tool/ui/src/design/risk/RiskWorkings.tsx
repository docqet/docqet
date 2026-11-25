import type { CSSProperties } from "react";
import { IMPACTS, LIKELIHOODS, REACHES, verdictOf, type Risk, type RiskOn } from "../../state";
import { STABILITY_LEVEL_IDS } from "../stability/stability";
import { ImpactBadge, JudgementBadge, PartTag, RiskPartIcon } from "./ImpactBadge";
import { StabilityMark } from "../stability/StabilityMark";

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

/* A part's place in its range: a stop for each value, filled up to the current one. `at` is -1 for none, such as a draft's level. */
function Slider({ stops, at, label }: { stops: number; at: number; label: string }) {
  return (
    <span className="risk-slider" role="img" aria-label={label} style={{ "--at": Math.max(at, 0) / (stops - 1) } as CSSProperties} data-none={at < 0 || undefined}>
      <span className="risk-slider-fill" />
      {Array.from({ length: stops }, (_, n) => (
        <span key={n} className="risk-slider-stop" data-on={n <= at || undefined} data-current={n === at || undefined} />
      ))}
    </span>
  );
}

/* Where a value sits among its values, least risk first: the lists run most first, so they're read from the end. */
const placeOf = (values: readonly string[], value: string | null) => (value === null ? -1 : values.length - 1 - values.indexOf(value));

/* The overall score on the 0 to 100 scale, with the thirds the verdicts start at marked, filled in the verdict's color. */
function ScoreSlider({ score, verdict }: { score: number; verdict: string }) {
  return (
    <span className="risk-score-slider" data-verdict={verdict} role="img" aria-label={`${score} of 100`} style={{ "--at": score / 100 } as CSSProperties}>
      <span className="risk-slider-fill" />
      <span className="risk-score-slider-third" style={{ left: "33%" }} />
      <span className="risk-score-slider-third" style={{ left: "67%" }} />
      <span className="risk-score-slider-thumb" />
    </span>
  );
}

/* The verdict a score falls in, for its color. */
const verdictOfScore = (score: number) => verdictOf(score) ?? "none";

/* A factor as written: ¾, ½ and ¼ as fractions, the rest as numbers. */
const factor = (n: number) => ({ 0.75: "¾", 0.5: "½", 0.25: "¼" })[n] ?? String(Math.round(n * 100) / 100);

/*
 * Impact, likelihood and reach are their tags, in their colors. Where
 * there's room for them to open what they mean, as on a gap's page,
 * `interactive` makes them badges with their popovers; inside a popover
 * they stay plain tags.
 */
export function RiskWorkings({ risk, on, interactive = false }: { risk: Risk; on: RiskOn; interactive?: boolean }) {
  const rated = risk.impact !== null;
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
  return (
    <div className="risk-workings">
      <span className="risk-workings-group">What it could do</span>
      <span className="risk-workings-label">
        <RiskPartIcon part="impact" size={13} />
        Impact
      </span>
      <span className="risk-workings-value">{tag("impact")}</span>
      <Slider stops={4} at={placeOf(IMPACTS, risk.impact)} label="Negligible, inconvenient, blocking, damaging" />
      <span className="risk-workings-factor">{rated ? factor(on.impact) : "–"}</span>
      <span className="risk-workings-label">
        <RiskPartIcon part="likelihood" size={13} />
        Likelihood
      </span>
      <span className="risk-workings-value">{tag("likelihood")}</span>
      <Slider stops={4} at={placeOf(LIKELIHOODS, risk.likelihood)} label="Unlikely, possible, expected, certain" />
      <span className="risk-workings-factor">× {factor(on.likelihood)}</span>
      <span className="risk-workings-label">
        <RiskPartIcon part="reach" size={13} />
        Reach
      </span>
      <span className="risk-workings-value">{tag("reach")}</span>
      <Slider stops={4} at={placeOf(REACHES, risk.reach)} label="Few, some, most, all" />
      <span className="risk-workings-factor">× {factor(on.reach)}</span>

      <span className="risk-workings-group">How much people rely on {on.capability.name}</span>
      <span className="risk-workings-label">Stability</span>
      <span className="risk-workings-value risk-workings-level">
        {on.capability.stability ? <StabilityMark level={on.capability.stability} feature={on.capability.name} focusable={interactive} size="long" /> : "Draft"}
      </span>
      <Slider
        stops={4}
        at={on.capability.stability ? STABILITY_LEVEL_IDS.indexOf(on.capability.stability) : -1}
        label="Prototype, Alpha, Beta, GA"
      />
      <span className="risk-workings-factor">× {factor(on.weight)}</span>
      <span className="risk-workings-label">Claims</span>
      <span className="risk-workings-value">{on.claim ? "Breaks one" : "Keeps them"}</span>
      <Slider stops={2} at={on.claim ? 1 : 0} label="Keeps them, breaks one" />
      <span className="risk-workings-factor">× {String(on.claimFactor)}</span>

      {rated ? (
        <span className="risk-workings-total">
          <span className="risk-workings-total-line">
            <span className="risk-workings-sum">
              {[...[on.impact, on.likelihood, on.reach, on.weight].map(factor), String(on.claimFactor)].join(" × ")} = {factor(on.raw)}
            </span>
            <span className="risk-on-score" data-verdict={verdictOfScore(on.score)}>
              {on.score} of 100
            </span>
          </span>
          <ScoreSlider score={on.score} verdict={verdictOfScore(on.score)} />
          <span className="risk-workings-scale" aria-hidden>
            <span>Acceptable</span>
            <span>Tolerable</span>
            <span>Unacceptable</span>
          </span>
        </span>
      ) : (
        <span className="risk-workings-total">With no impact rated, it has no risk.</span>
      )}
    </div>
  );
}
