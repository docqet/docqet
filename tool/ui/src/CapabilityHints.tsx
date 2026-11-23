import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { LeftMark } from "./design/left/LeftMark";
import { VERDICT_NAMES, verdictCounts } from "./design/risk/RiskScore";
import { StandingMark } from "./design/standing/StandingMark";
import { Tip } from "./design/Tip";
import { riskScore, type Gap, type RiskAcross, type RuleStanding } from "./state";

/*
 * A warning after a name, for something with a contradiction; what it is shows
 * on hover. `tip={false}` where what it's in already shows it on hover.
 */
export function ContradictionHint({ messages, tip = true }: { messages: string[]; tip?: boolean }) {
  if (!messages.length) return null;
  return (
    <Tip title={tip ? messages.join("\n") : undefined}>
      <WarningAmberRoundedIcon aria-label={messages.join(" ")} sx={{ flex: "none", fontSize: 15, color: "var(--warning)" }} />
    </Tip>
  );
}

/* After a name, how many open decisions it has. */
export function DecisionsHint({ count }: { count: number }) {
  return (
    <CountHint
      count={count}
      label={count === 1 ? "1 open decision" : `${count} open decisions`}
      icon={<LeftMark kind="decision" size={13} decorative />}
    />
  );
}

/*
 * After a capability's name on the map, its risk: the highest score among
 * its gaps on it, after a small dot in its verdict's color, or a faint dot
 * alone where none of them is rated. Nothing with no gaps.
 */
export function RiskDot({ risk }: { risk: RiskAcross<Gap> }) {
  const n = risk.items.length;
  if (!n) return null;
  const label = risk.score === null ? `${n === 1 ? "1 gap" : `${n} gaps`}, none rated` : `Risk ${riskScore(risk.score)} · ${VERDICT_NAMES[risk.verdict!].name} · ${verdictCounts(risk)}`;
  return (
    <Tip title={label}>
      <span className="risk-pin" data-verdict={risk.verdict ?? "none"} role="img" aria-label={label}>
        <span className="risk-dot" />
        {risk.score !== null ? riskScore(risk.score) : null}
      </span>
    </Tip>
  );
}

/*
 * After a capability's name on the map, while it's colored by evidence: how
 * its rules hold together, as one standing mark, with the counts on hover.
 * Shown only in that lens, by map.css, so the cards don't rebuild.
 */
export function EvidenceHint({ standing, label }: { standing: RuleStanding | null; label: string }) {
  if (!standing) return null;
  return (
    <span className="lens-evidence">
      <StandingMark standing={standing} label={label} />
    </span>
  );
}

function CountHint({ count, label, icon }: { count: number; label: string; icon: ReactNode }) {
  if (!count) return null;
  return (
    <Tip title={label}>
    <Box
      component="span"
      aria-label={label}
      sx={{
        flex: "none",
        display: "inline-flex",
        alignItems: "center",
        gap: 0.25,
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1,
        color: "text.secondary",
      }}
    >
      {icon}
      {count}
    </Box>
    </Tip>
  );
}
