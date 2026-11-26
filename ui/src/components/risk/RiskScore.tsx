import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import { VERDICTS, exposureText, riskScore, verdictOf, type Gap, type Risk, type RiskAcross, type Exposure, type RiskOn, type Verdict } from "../../state";
import { DetailsPopover } from "../popovers/DetailsPopover";
import { RISK_BAND_COLORS, RiskRing } from "./RiskRing";
import { RiskDetails } from "../popovers/RiskDetails";
import { ExposureDetails } from "../popovers/ExposureDetails";
import { GapRiskDetails } from "../popovers/GapRiskDetails";
import { SpreadCount, spreadBarSx, spreadCountsSx, spreadMarkSx, spreadSx } from "../stability/StabilitySpread";

/*
 * Risk: what's at stake in leaving a gap open, from 0 to 100, and the
 * verdict the third of the scale it falls in gives, as bars rising like a signal, one lit for each
 * step of the verdict, in its color (VERDICT_COLORS).
 */

export const VERDICT_NAMES: Record<Verdict, { name: string; means: string }> = {
  unacceptable: { name: "Unacceptable", means: "Not OK to leave open at the level it's at." },
  tolerable: { name: "Tolerable", means: "OK to leave for now, but worth closing." },
  acceptable: { name: "Acceptable", means: "Fine to leave open." },
};

/*
 * A verdict's color: unacceptable is the alarm color, tolerable the soft
 * yellow, and acceptable neutral, since it may rightly stay open for good.
 * None, for a gap on nothing with a level, is neutral too.
 */
export const VERDICT_COLORS: Record<Verdict | "none", string> = {
  unacceptable: "error.main",
  tolerable: "impact.inconvenient",
  acceptable: "text.disabled",
  none: "text.disabled",
};

/* The same, as a value for color-mix and the like. */
export const verdictTone = (verdict: Verdict) => (theme: Theme) =>
  ({ unacceptable: theme.vars.palette.error.main, tolerable: theme.vars.palette.impact.inconvenient, acceptable: theme.vars.palette.text.disabled })[verdict];

/* "2 unacceptable · 5 tolerable · 31 acceptable", leaving out any with none. */
export const verdictCounts = (risk: RiskAcross<unknown>) =>
  VERDICTS.map((v) => [risk.counts[v], VERDICT_NAMES[v].name.toLowerCase()] as const)
    .filter(([n]) => n)
    .map(([n, name]) => `${n} ${name}`)
    .join(" · ");

/* The verdicts from least to most, as the bars rise. */
const RISING: Verdict[] = [...VERDICTS].reverse();

/* Each bar's height, small in px and wide as a share, rising like a signal. */
const SMALL_HEIGHTS = [5, 8, 12];
const WIDE_HEIGHTS = ["33%", "66%", "100%"];

/* The bars, lit up to the verdict: small beside the score, or wide across a popover, with each verdict named under it. */
export function RiskBars({ verdict, size }: { verdict: Verdict | null; size: "small" | "wide" }) {
  const step = verdict ? RISING.indexOf(verdict) + 1 : 0;
  const wide = size === "wide";
  return (
    <>
      <Box
        component="span"
        aria-hidden
        sx={{
          display: wide ? "flex" : "inline-flex",
          alignItems: "flex-end",
          gap: wide ? 0.5 : "2px",
          width: wide ? "100%" : undefined,
          height: wide ? 30 : 12,
        }}
      >
        {RISING.map((v, n) => (
          <Box
            key={v}
            component="span"
            sx={{
              flex: wide ? 1 : undefined,
              width: wide ? undefined : 4,
              height: wide ? WIDE_HEIGHTS[n] : SMALL_HEIGHTS[n],
              borderRadius: wide ? "3px" : "1.5px",
              bgcolor: n < step && verdict ? VERDICT_COLORS[verdict] : (t) => `color-mix(in srgb, ${t.vars.palette.text.primary} 16%, transparent)`,
            }}
          />
        ))}
      </Box>
      {wide ? (
        <Box
          component="span"
          aria-hidden
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            mt: 0.5,
            fontSize: "0.86em",
            color: "text.disabled",
            "& > span": { textAlign: "center" },
          }}
        >
          {RISING.map((v) => (
            <Box key={v} component="span" sx={v === verdict ? { fontWeight: 650, color: VERDICT_COLORS[v] } : undefined}>
              {VERDICT_NAMES[v].name}
            </Box>
          ))}
        </Box>
      ) : null}
    </>
  );
}

/*
 * A risk: bars rising to its verdict, and its score out of 100, in the
 * verdict's color. Every one that opens a popover shows it, as other marks
 * do, inside a link or a row too.
 */
export const riskScoreSx = (verdict: Verdict | "none", opens: boolean): SystemStyleObject<Theme> => ({
  flex: "none",
  display: "inline-flex",
  alignItems: "center",
  gap: 0.75,
  fontSize: 12,
  fontWeight: verdict === "none" ? 500 : 650,
  lineHeight: "16px",
  whiteSpace: "nowrap",
  fontVariantNumeric: "tabular-nums",
  color: VERDICT_COLORS[verdict],
  borderRadius: "4px",
  cursor: opens ? "help" : undefined,
  "&:focus-visible": { outline: "2px solid currentColor", outlineOffset: 2 },
});

/* A capability's score, at the end of its row, in its verdict's color: the same width each, so they line up. */
export const riskOnScoreSx = (verdict: Verdict): SystemStyleObject<Theme> => ({
  minWidth: "2.5em",
  textAlign: "right",
  fontWeight: 600,
  fontVariantNumeric: "tabular-nums",
  color: VERDICT_COLORS[verdict],
});

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
  if (!risk.items.length || risk.score === null || risk.verdict === null) return null;
  const name = VERDICT_NAMES[risk.verdict].name;
  if (exposure && exposure.percent !== null && exposure.band) {
    const text = exposureText(exposure.percent);
    return (
      <DetailsPopover hoverOnly={inButton} title={<ExposureDetails risk={risk} exposure={exposure} of={of} />}>
        <Box
          component="span"
          role="img"
          aria-label={`Exposure ${text}, ${exposure.band.name.toLowerCase()}`}
          tabIndex={inButton ? undefined : 0}
          sx={{
            flex: "none",
            display: "inline-flex",
            alignItems: "center",
            verticalAlign: "middle",
            borderRadius: 999,
            cursor: "help",
            "&[tabindex]:focus-visible": { outline: "2px solid currentColor", outlineOffset: 2 },
          }}
        >
          <RiskRing percent={exposure.percent} size={size} band={exposure.band.id} />
        </Box>
      </DetailsPopover>
    );
  }
  if (risk.items.length > 1)
    return (
      <DetailsPopover hoverOnly={inButton} title={<RiskDetails risk={risk} of={of} />}>
        <Box
          component="span"
          role="img"
          aria-label={`Risk spread: ${verdictCounts(risk)}`}
          tabIndex={inButton ? undefined : 0}
          sx={[spreadMarkSx(wide), wide && { "& > span": { flex: 1 } }]}
        >
          <RiskSpreadBar risk={risk} wide={wide} />
        </Box>
      </DetailsPopover>
    );
  return (
    <DetailsPopover hoverOnly={inButton} title={<RiskDetails risk={risk} of={of} />}>
      <Box
        component="span"
        role="img"
        aria-label={`Risk ${risk.score}, ${name.toLowerCase()}`}
        tabIndex={inButton ? undefined : 0}
        sx={riskScoreSx(risk.verdict, true)}
      >
        <RiskBars verdict={risk.verdict} size="small" />
        <span>
          {`Risk ${riskScore(risk.score)}`}
          {verdict ? ` · ${name}` : null}
        </span>
      </Box>
    </DetailsPopover>
  );
}

/*
 * The exposure of some capabilities, as the map shows it: its ring, from every
 * gap on them, their own and those of what they're built on, each scored on
 * them, whose popover has the spread. Nothing when there are no gaps or none
 * of them is started, since drafts aren't exposed to anything. `named` adds the band's
 * name after it, in its color, as maturity's band follows its ring. Its
 * figures are the server's: `exposure` and `risk` when given, as a doc's, or
 * else a lone capability's own.
 */
export function ExposureMark({
  of,
  size = 22,
  inButton = false,
  named = false,
  exposure,
  risk,
}: {
  of: string;
  size?: number;
  inButton?: boolean;
  named?: boolean;
  /* Some capabilities' exposure and the risk across their gaps, as the server works them out. */
  exposure: Exposure;
  risk: RiskAcross<Gap>;
}) {
  if (!risk.items.length || exposure.percent === null || !exposure.band) return null;
  const ring = <RiskScore risk={risk} exposure={exposure} of={of} size={size} inButton={inButton} />;
  if (!named) return ring;
  return (
    /* exposure-named: a hook for a header's stat, which lays it out as maturity's and readiness's. */
    <Box
      component="span"
      className="exposure-named"
      sx={{ display: "inline-flex", alignItems: "center", gap: 1, fontSize: 13.5, color: RISK_BAND_COLORS[exposure.band.id] }}
    >
      {ring}
      <strong>{exposure.band.name}</strong>
    </Box>
  );
}

/* How many fall in each verdict, worst first, leaving out any with none. */
const spreadOf = (risk: RiskAcross<unknown>) =>
  VERDICTS.map((v) => ({ key: v, n: risk.counts[v], name: VERDICT_NAMES[v].name.toLowerCase() })).filter((p) => p.n);

/* A bar split by how many fall in each verdict, worst first, unlabeled: small beside a name, or `wide` across a popover. */
export function RiskSpreadBar({ risk, wide = false }: { risk: RiskAcross<unknown>; wide?: boolean }) {
  return (
    <Box
      component="span"
      aria-hidden
      sx={[spreadBarSx(wide), wide && { width: "auto", borderRadius: "2px", overflow: "visible", "& > span": { minWidth: 4, borderRadius: "2px" } }]}
    >
      {spreadOf(risk).map((p) => (
        <Box key={p.key} component="span" sx={{ bgcolor: VERDICT_COLORS[p.key] }} style={{ flexGrow: p.n }} />
      ))}
    </Box>
  );
}

/* How several spread across the verdicts: the bar, with the counts under it in its order, each with its part's swatch and its number in that color. */
export function VerdictSpread({ risk }: { risk: RiskAcross<unknown> }) {
  return (
    <Box sx={spreadSx}>
      <RiskSpreadBar risk={risk} wide />
      <Box component="span" sx={spreadCountsSx}>
        {spreadOf(risk).map((p) => (
          <SpreadCount key={p.key} color={verdictTone(p.key)} n={p.n}>
            {p.name}
          </SpreadCount>
        ))}
      </Box>
    </Box>
  );
}

/*
 * One gap's risk where it's shown: its bars and score, in its verdict's
 * color, opening how it's worked out on `on`, the capability it scores
 * highest on there. On none with a level, a faint dash. Inside something clickable,
 * `inButton` opens it on hover only.
 */
export function GapRiskMark({ risk, on, inButton = false }: { risk: Risk; on: RiskOn | null; inButton?: boolean }) {
  if (!on)
    return (
      <Box component="span" sx={riskScoreSx("none", false)}>
        –
      </Box>
    );
  const verdict = verdictOf(on.score);
  return (
    <DetailsPopover hoverOnly={inButton} title={<GapRiskDetails risk={risk} on={on} />}>
      <Box
        component="span"

        tabIndex={inButton ? undefined : 0}
        role="img"
        aria-label={`Risk ${on.score}, ${VERDICT_NAMES[verdict].name.toLowerCase()}`}
        sx={riskScoreSx(verdict, true)}
      >
        <RiskBars verdict={verdict} size="small" />
        {riskScore(on.score)}
      </Box>
    </DetailsPopover>
  );
}
