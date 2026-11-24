import Box from "@mui/material/Box";
import { VERDICTS, riskScore, verdictOf, type Gap, type Risk, type RiskAcross, type RiskOn, type Verdict } from "../../state";
import { DetailsCard, DetailsEyebrow, DetailsPopover } from "../DetailsPopover";
import { plainText } from "../markdown/Markdown";
import { RiskWorkings } from "./RiskWorkings";

/*
 * Risk: what's at stake in leaving a gap open, from 0 to 100, and the
 * verdict the third of the scale it falls in gives, as bars rising like a signal, one lit for each
 * step of the verdict, in its color (--risk, from data-verdict).
 */

export const VERDICT_NAMES: Record<Verdict, { name: string; means: string }> = {
  unacceptable: { name: "Unacceptable", means: "Not OK to leave open at the level it's at." },
  tolerable: { name: "Tolerable", means: "OK to leave for now, but worth closing." },
  acceptable: { name: "Acceptable", means: "Fine to leave open." },
};

/* "2 unacceptable · 5 tolerable · 31 acceptable · 1 not rated", leaving out any with none. */
export const verdictCounts = (risk: RiskAcross<unknown>) =>
  [...VERDICTS.map((v) => [risk.counts[v], VERDICT_NAMES[v].name.toLowerCase()] as const), [risk.unrated, "not rated"] as const]
    .filter(([n]) => n)
    .map(([n, name]) => `${n} ${name}`)
    .join(" · ");

/* The verdicts from least to most, as the bars rise. */
const RISING: Verdict[] = [...VERDICTS].reverse();

/* The bars, lit up to the verdict: small beside the score, or wide across a popover, with each verdict named under it. */
export function RiskBars({ verdict, size }: { verdict: Verdict | null; size: "small" | "wide" }) {
  const step = verdict ? RISING.indexOf(verdict) + 1 : 0;
  return (
    <>
      <span className={`risk-track ${size}`} aria-hidden>
        {RISING.map((v, n) => (
          <span key={v} className="risk-step" data-on={n < step || undefined} />
        ))}
      </span>
      {size === "wide" ? (
        <span className="risk-scale" aria-hidden>
          {RISING.map((v) => (
            <span key={v} data-current={v === verdict || undefined}>
              {VERDICT_NAMES[v].name}
            </span>
          ))}
        </span>
      ) : null}
    </>
  );
}

/*
 * The risk across several gaps, as in a capability, feature,
 * domain, persona or component: a short bar split by how many fall in each
 * verdict, with no number, since no one score stands for them all. One alone
 * shows its own score, with its verdict when `verdict` is set. Its popover
 * shows the spread with counts and names the riskiest few. Inside something
 * clickable, `inButton` opens it on hover only.
 */
export function RiskScore<T extends Gap>({
  risk,
  of,
  verdict = false,
  inButton = false,
  wide = false,
}: {
  risk: RiskAcross<T>;
  /* What they're in, for the popover: "Risk in Scheduling". */
  of: string;
  verdict?: boolean;
  inButton?: boolean;
  /* Several, as a wider bar, where there's room. */
  wide?: boolean;
}) {
  if (!risk.items.length) return null;
  const name = risk.verdict ? VERDICT_NAMES[risk.verdict].name : "Not rated";
  if (risk.items.length > 1)
    return (
      <DetailsPopover hoverOnly={inButton} title={<RiskDetails risk={risk} of={of} />}>
        <span className={`risk-spread-mark${wide ? " wide" : ""}`} role="img" aria-label={`Risk spread: ${verdictCounts(risk)}`} tabIndex={inButton ? undefined : 0}>
          <RiskSpreadBar risk={risk} wide={wide} />
        </span>
      </DetailsPopover>
    );
  return (
    <DetailsPopover hoverOnly={inButton} title={<RiskDetails risk={risk} of={of} />}>
      <span
        className="risk-score"
        data-verdict={risk.verdict ?? "none"}
        role="img"
        aria-label={risk.score === null ? "Risk not rated" : `Risk ${risk.score}, ${name.toLowerCase()}`}
        tabIndex={inButton ? undefined : 0}
      >
        <RiskBars verdict={risk.verdict} size="small" />
        <span>
          {risk.score === null ? "Not rated" : `Risk ${riskScore(risk.score)}`}
          {verdict && risk.verdict ? ` · ${name}` : null}
        </span>
      </span>
    </DetailsPopover>
  );
}

/*
 * The risk across several, for its popover. One alone is shown as it would
 * be on its own: how its risk is worked out. Several show their highest
 * risk, how they spread across the verdicts, as a bar split by how many fall
 * in each, and the riskiest few with their scores, out of how many. How each
 * is worked out is on the gap itself.
 */
function RiskDetails<T extends Gap>({ risk, of }: { risk: RiskAcross<T>; of: string }) {
  const rated = risk.items.filter((i) => i.score !== null);
  const riskiest = rated.slice(0, 3);
  const alone = risk.items.length === 1 ? risk.items[0] : null;
  return (
    <DetailsCard card width={320}>
      <div className="risk-details" data-verdict={risk.verdict ?? "none"}>
        <DetailsEyebrow>{alone ? `Risk in ${of}` : `Risk spread in ${of}`}</DetailsEyebrow>
        {alone ? (
          <>
            <Box sx={{ mt: 1, display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1 }}>
              <Box className="risk-details-verdict" sx={{ fontSize: "1.12em", fontWeight: 700 }}>
                {risk.verdict ? VERDICT_NAMES[risk.verdict].name : "Not rated"}
              </Box>
              {risk.score !== null ? <Box sx={{ color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>{risk.score} of 100</Box> : null}
            </Box>
            <Box sx={{ mt: 1, fontWeight: 600 }}>{plainText(alone.item.name)}</Box>
            {alone.on ? (
              <Box sx={{ mt: 1.25 }}>
                <RiskWorkings risk={alone.risk} on={alone.on} />
              </Box>
            ) : null}
          </>
        ) : (
          <>
            <VerdictSpread risk={risk} />
            {riskiest.length ? (
              <>
                <div className="risk-details-head">Riskiest</div>
                <ul className="risk-riskiest">
                  {riskiest.map(({ item, score, verdict }) => (
                    <li key={item.id}>
                      <span className="risk-riskiest-name">{plainText(item.name)}</span>
                      <span className="risk-on-score" data-verdict={verdict ?? "none"}>
                        {score}
                      </span>
                    </li>
                  ))}
                </ul>
                {risk.items.length > riskiest.length ? (
                  <div className="risk-note">
                    The {riskiest.length} riskiest of {risk.items.length} gaps.
                  </div>
                ) : null}
              </>
            ) : null}
          </>
        )}
      </div>
    </DetailsCard>
  );
}

/* How many fall in each verdict, worst first, then those not rated, leaving out any with none. */
const spreadOf = (risk: RiskAcross<unknown>) =>
  [...VERDICTS.map((v) => ({ key: v as string, n: risk.counts[v], name: VERDICT_NAMES[v].name.toLowerCase() })), { key: "none", n: risk.unrated, name: "not rated" }].filter((p) => p.n);

/* A bar split by how many fall in each verdict, worst first, unlabeled: small beside a name, or `wide` across a popover. */
export function RiskSpreadBar({ risk, wide = false }: { risk: RiskAcross<unknown>; wide?: boolean }) {
  return (
    <span className={`verdict-spread-bar${wide ? " wide" : ""}`} aria-hidden>
      {spreadOf(risk).map((p) => (
        <span key={p.key} data-verdict={p.key} style={{ flexGrow: p.n }} />
      ))}
    </span>
  );
}

/* How several spread across the verdicts: the bar, with the counts under it. */
function VerdictSpread({ risk }: { risk: RiskAcross<unknown> }) {
  const parts = spreadOf(risk);
  return (
    <div className="verdict-spread">
      <RiskSpreadBar risk={risk} wide />
      <span className="verdict-spread-counts">
        {parts.map((p) => (
          <span key={p.key} data-verdict={p.key}>
            <strong>{p.n}</strong> {p.name}
          </span>
        ))}
      </span>
    </div>
  );
}

/*
 * One gap's risk where it's shown: its bars and score, in its verdict's
 * color, opening how it's worked out on `on`, the capability it scores
 * highest on there. Unrated, a faint dash. Inside something clickable,
 * `inButton` opens it on hover only.
 */
export function GapRiskMark({ risk, on, inButton = false }: { risk: Risk; on: RiskOn | null; inButton?: boolean }) {
  if (risk.impact === null || !on) return <span className="gap-risk-mark risk-score" data-verdict="none">–</span>;
  const verdict = verdictOf(on.score)!;
  return (
    <DetailsPopover
      hoverOnly={inButton}
      title={
        <DetailsCard card width={340}>
          <div className="risk-details" data-verdict={verdict}>
            <DetailsEyebrow>How its risk is worked out</DetailsEyebrow>
            <div className="gap-risk-head">
              <span className="risk-details-verdict">{VERDICT_NAMES[verdict].name}</span>
              <span>{on.score} of 100</span>
            </div>
            <RiskWorkings risk={risk} on={on} />
          </div>
        </DetailsCard>
      }
    >
      <span
        className="gap-risk-mark risk-score"
        data-verdict={verdict}
        tabIndex={inButton ? undefined : 0}
        role="img"
        aria-label={`Risk ${on.score}, ${VERDICT_NAMES[verdict].name.toLowerCase()}`}
      >
        <RiskBars verdict={verdict} size="small" />
        {riskScore(on.score)}
      </span>
    </DetailsPopover>
  );
}
