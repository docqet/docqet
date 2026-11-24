import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { LeftMark } from "./design/left/LeftMark";
import { RiskSpreadBar, VERDICT_NAMES, verdictCounts } from "./design/risk/RiskScore";
import { Tip } from "./design/Tip";
import { riskScore, type Gap, type RiskAcross } from "./state";

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
 * After a capability's name on the map, its risk: with several gaps on it, a
 * short bar split by how many fall in each verdict; with one, its score after
 * a small dot in its verdict's color, or a faint dot alone where it isn't
 * rated. Nothing with no gaps.
 */
export function RiskDot({ risk }: { risk: RiskAcross<Gap> }) {
  const n = risk.items.length;
  if (!n) return null;
  if (n > 1)
    return (
      <Tip title={`${n} gaps: ${verdictCounts(risk)}`}>
        <span className="risk-pin" role="img" aria-label={`${n} gaps: ${verdictCounts(risk)}`}>
          <RiskSpreadBar risk={risk} />
        </span>
      </Tip>
    );
  const label = risk.score === null ? "1 gap, not rated" : `Risk ${riskScore(risk.score)} · ${VERDICT_NAMES[risk.verdict!].name}`;
  return (
    <Tip title={label}>
      <span className="risk-pin" data-verdict={risk.verdict ?? "none"} role="img" aria-label={label}>
        <span className="risk-dot" />
        {risk.score !== null ? riskScore(risk.score) : null}
      </span>
    </Tip>
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
