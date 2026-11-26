import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import { GapIcon, LEFT_KINDS } from "../left/LeftMark";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import type { Theme } from "@mui/material/styles";

/*
 * Whether something declared holds, the same wherever it shows: an expected
 * outcome or a rule a capability follows. Not held, when a gap names it;
 * held with evidence, when something points at it; held on trust, when
 * nothing says either way, which is a lighter check, not a warning. An
 * outcome can also be not met by choice, when a tradeoff names it; open,
 * when an open decision is on whether to meet it; or not expected at a
 * capability's level.
 */
export type Standing = "gap" | "tradeoff" | "open" | "evidence" | "trust" | "not-expected";

const TradeoffIcon = LEFT_KINDS.tradeoff.Icon;
const DecisionIcon = LEFT_KINDS.decision.Icon;

/*
 * Each standing's color: held, in the success color; held on trust, a
 * lighter check, between it and faint; not held, a gap's amber; not met by
 * choice, a tradeoff's muted, since it's decided, not left to do; open, a
 * decision's violet, since whether to meet it isn't settled; and not
 * expected, faint.
 */
const COLORS: Record<Standing, string | ((theme: Theme) => string)> = {
  evidence: "success.main",
  trust: (t) => `color-mix(in srgb, ${t.vars.palette.success.main} 50%, ${t.vars.palette.text.disabled})`,
  gap: "warning.main",
  tradeoff: "text.secondary",
  open: "primary.main",
  "not-expected": "text.disabled",
};

export function StandingMark({ standing, label }: { standing: Standing; label: string }) {
  return (
    <Tooltip title={label}>
      {/* sc-standing: a hook for the lists and legends that line it up with their text. */}
      <Box component="span" className="sc-standing" role="img" aria-label={label} sx={{ display: "inline-flex", mt: "2px", color: COLORS[standing] }}>
        {standing === "evidence" ? (
          <TaskAltRoundedIcon sx={{ fontSize: 16 }} />
        ) : standing === "trust" ? (
          <CheckRoundedIcon sx={{ fontSize: 16 }} />
        ) : standing === "gap" ? (
          <GapIcon sx={{ fontSize: 15 }} />
        ) : standing === "tradeoff" ? (
          <TradeoffIcon sx={{ fontSize: 15 }} />
        ) : standing === "open" ? (
          <DecisionIcon sx={{ fontSize: 15 }} />
        ) : (
          <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 14 }} />
        )}
      </Box>
    </Tooltip>
  );
}
