import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import { GapIcon, LEFT_KINDS } from "../left/LeftMark";
import Tooltip from "@mui/material/Tooltip";

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

export function StandingMark({ standing, label }: { standing: Standing; label: string }) {
  return (
    <Tooltip title={label}>
      <span className="sc-standing" data-standing={standing} role="img" aria-label={label}>
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
      </span>
    </Tooltip>
  );
}
