import Box from "@mui/material/Box";
import { VERDICTS, riskScore, type Gap, type RiskAcross, type Tradeoff, type Verdict } from "../../state";
import { DetailsCard, DetailsEyebrow, DetailsPopover } from "../DetailsPopover";
import { plainText } from "../markdown/Markdown";

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
 * The risk across several gaps or tradeoffs, as in a capability, feature,
 * domain, persona or component: the highest among them, with its verdict
 * when `verdict` is set. Its popover counts each verdict and names the
 * riskiest few. Inside something clickable, `inButton` opens it on hover only.
 */
export function RiskScore<T extends Gap | Tradeoff>({
  risk,
  of,
  verdict = false,
  inButton = false,
}: {
  risk: RiskAcross<T>;
  /* What they're in, for the popover: "Risk in Scheduling". */
  of: string;
  verdict?: boolean;
  inButton?: boolean;
}) {
  if (!risk.items.length) return null;
  const name = risk.verdict ? VERDICT_NAMES[risk.verdict].name : "Not rated";
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

function RiskDetails<T extends Gap | Tradeoff>({ risk, of }: { risk: RiskAcross<T>; of: string }) {
  const riskiest = risk.items.filter((i) => i.score !== null).slice(0, 3);
  return (
    <DetailsCard card width={320}>
      <div className="risk-details" data-verdict={risk.verdict ?? "none"}>
        <DetailsEyebrow>Risk in {of}</DetailsEyebrow>
        <Box sx={{ mt: 1, display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1 }}>
          <Box className="risk-details-verdict" sx={{ fontSize: "1.12em", fontWeight: 700 }}>
            {risk.verdict ? VERDICT_NAMES[risk.verdict].name : "Not rated"}
          </Box>
          {risk.score !== null ? <Box sx={{ color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>{risk.score} of 100</Box> : null}
        </Box>
        <Box sx={{ mt: 1 }}>
          <RiskBars verdict={risk.verdict} size="wide" />
        </Box>
        <Box sx={{ mt: 1, color: "text.secondary" }}>{verdictCounts(risk)}</Box>
        {riskiest.length ? (
          <ul className="risk-on risk-riskiest">
            {riskiest.map(({ item, score, verdict }) => (
              <li key={item.id}>
                <span>{plainText(item.name)}</span>
                <span className="risk-on-score" data-verdict={verdict ?? "none"}>
                  {score}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </DetailsCard>
  );
}
