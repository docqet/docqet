import Box from "@mui/material/Box";
import {
  VERDICTS,
  exposureOf,
  exposureText,
  gapsOn,
  riskAcross,
  riskScore,
  verdictOf,
  type Capability,
  type DocketState,
  type Gap,
  type Risk,
  type RiskAcross,
  type Exposure,
  type RiskOn,
  type Verdict,
} from "../../state";
import { DetailsCard, DetailsEyebrow, DetailsPopover, DetailsWorkings } from "../DetailsPopover";
import { plainText } from "../markdown/Markdown";
import { RiskRing } from "./RiskRing";
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
 * shows the spread with counts and names the riskiest few. Given what
 * they're on `exposure`, as for a feature, domain or persona, it shows their
 * exposure instead, as a ring filling up to its percentage in the color
 * of its band, drawn and sized as maturity is, whose popover names the band and shows the spread and how
 * it's worked out. Inside
 * something clickable, `inButton` opens it on hover only.
 */
export function RiskScore<T extends Gap>({
  risk,
  of,
  verdict = false,
  inButton = false,
  wide = false,
  exposure,
  size = 24,
}: {
  risk: RiskAcross<T>;
  /* What they're in, for the popover: "Risk in Scheduling". */
  of: string;
  verdict?: boolean;
  inButton?: boolean;
  /* Several, as a wider bar, where there's room. */
  wide?: boolean;
  /* The exposure of the capabilities they're on, to show instead. */
  exposure?: Exposure;
  /* The exposure ring's diameter: 24, as maturity's on a card, by default. */
  size?: number;
}) {
  if (!risk.items.length) return null;
  const name = risk.verdict ? VERDICT_NAMES[risk.verdict].name : "Not rated";
  if (exposure && exposure.percent !== null && exposure.band) {
    const text = exposureText(exposure.percent);
    return (
      <DetailsPopover hoverOnly={inButton} title={<ExposureDetails risk={risk} exposure={exposure} of={of} />}>
        <span
          className="exposure-mark"
          data-risk-band={exposure.band.id}
          role="img"
          aria-label={`Exposure ${text}, ${exposure.band.name.toLowerCase()}`}
          tabIndex={inButton ? undefined : 0}
        >
          <RiskRing percent={exposure.percent} size={size} />
        </span>
      </DetailsPopover>
    );
  }
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

/*
 * The exposure of some capabilities, as the map shows it: its ring, from every
 * gap on them, their own and those of what they're built on, each scored on
 * them, whose popover has the spread. Nothing when there are no gaps or none
 * of them is started, since drafts aren't exposed to anything. `named` adds the band's
 * name after it, in its color, as maturity's band follows its ring.
 */
export function ExposureMark({
  state,
  capabilities,
  of,
  size = 22,
  inButton = false,
  named = false,
}: {
  state: DocketState;
  capabilities: Capability[];
  of: string;
  size?: number;
  inButton?: boolean;
  named?: boolean;
}) {
  const gaps = [...new Set(capabilities.flatMap((c) => gapsOn(state, c)))];
  const exposure = exposureOf(state, capabilities);
  if (!gaps.length || exposure.percent === null || !exposure.band) return null;
  const ring = <RiskScore risk={riskAcross(state, gaps, capabilities)} exposure={exposure} of={of} size={size} inButton={inButton} />;
  if (!named) return ring;
  return (
    <span className="exposure-named" data-risk-band={exposure.band.id}>
      {ring}
      <strong>{exposure.band.name}</strong>
    </span>
  );
}

/*
 * The exposure of some capabilities, for its popover: its band and what that
 * puts at stake, the share, how the gaps on them spread across the
 * verdicts, how it's worked out, and that it isn't their stability. `of`
 * names what it's of, as a phrase: "Scheduling", "what serves Mira".
 */
function ExposureDetails<T extends Gap>({ risk, exposure, of }: { risk: RiskAcross<T>; exposure: Exposure; of: string }) {
  const band = exposure.band!;
  const n = exposure.capabilities;
  return (
    <DetailsCard card width={320}>
      <div className="exposure-details" data-risk-band={band.id}>
        <DetailsEyebrow>Exposure of {of}</DetailsEyebrow>
        <Box sx={{ mt: 1.25, display: "flex", alignItems: "center", gap: 1.5 }}>
          <RiskRing percent={exposure.percent!} size={56} />
          <div>
            <div className="exposure-band">{band.name}</div>
            <Box sx={{ color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>{exposureText(exposure.percent!)} of the most it could be exposed to</Box>
          </div>
        </Box>
        <Box sx={{ mt: 1.25 }}>{band.says}</Box>
        {exposure.unacceptable ? (
          <Box sx={{ mt: 1 }}>
            {risk.counts.unacceptable === 1 ? "A gap here is" : "Gaps here are"} unacceptable, so it&rsquo;s at least moderate, whatever the share.
          </Box>
        ) : null}
        <div className="risk-details-head">
          {risk.items.length} {risk.items.length === 1 ? "gap" : "gaps"} by risk
        </div>
        <VerdictSpread risk={risk} />
        <Box sx={{ mt: 1.25, color: "text.secondary", fontSize: "0.92em" }}>
          Exposure is to risk what maturity is to stability: one figure for the whole. It isn&rsquo;t stability. Each capability&rsquo;s level is declared,
          and says how much people can depend on it; this is what the gaps still open against those levels put at stake.
        </Box>
        <DetailsWorkings>
          <div>
            Each capability is exposed to its riskiest gap&rsquo;s share of the most it could be: a certain, damaging gap reaching everyone that breaks
            its level&rsquo;s promise.
          </div>
          <div>
            Its {n} {n === 1 ? "capability" : "capabilities"} then count by their level, GA most, as in maturity. Drafts don&rsquo;t count
            {risk.unrated ? ", and gaps not rated add nothing" : ""}. Each quarter is a band: low, minor, moderate and high.
          </div>
        </DetailsWorkings>
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
export function VerdictSpread({ risk }: { risk: RiskAcross<unknown> }) {
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
