import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import { GapIcon } from "../left/LeftMark";
import { Tip } from "../Tip";

/*
 * Whether something declared holds, the same wherever it shows: a checklist
 * outcome or a rule a capability follows. Not held, when a gap names it;
 * held with evidence, when something points at it; held on trust, when
 * nothing says either way, which is a lighter check, not a warning. An
 * outcome can also be not expected at a capability's level.
 */
export type Standing = "gap" | "evidence" | "trust" | "not-expected";

export function StandingMark({ standing, label }: { standing: Standing; label: string }) {
  return (
    <Tip title={label}>
    <span className="sc-standing" data-standing={standing} role="img" aria-label={label}>
      {standing === "evidence" ? (
        <TaskAltRoundedIcon sx={{ fontSize: 16 }} />
      ) : standing === "trust" ? (
        <CheckRoundedIcon sx={{ fontSize: 16 }} />
      ) : standing === "gap" ? (
        <GapIcon sx={{ fontSize: 15 }} />
      ) : (
        <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 14 }} />
      )}
    </span>
    </Tip>
  );
}
