import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import type { ReactNode } from "react";
import type { StabilityLevelId, StabilityMarkLevel } from "../stability/stability";
import { StabilityMark } from "../stability/StabilityMark";
import { DetailsPopover } from "../DetailsPopover";
import { Grip } from "../Grip";

/*
 * A Capability's stability: its short mark, with none of it lit for Planned, or
 * "Draft" for one not yet agreed, which has no mark.
 */
export function CapabilityStability({
  name,
  level,
  focusable = true,
}: {
  name: string;
  level: StabilityMarkLevel | null;
  focusable?: boolean;
}) {
  return level ? (
    <StabilityMark level={level} feature={name} focusable={focusable} size="short" />
  ) : (
    <Box component="span" sx={{ fontSize: 12.5, color: "text.secondary" }}>
      Draft
    </Box>
  );
}

const nameStyle = {
  flex: "0 1 auto",
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  fontSize: 14,
  lineHeight: "22px",
} as const;

/*
 * A Capability's line, as CapabilityCard and each row of a FeatureCard show
 * it: an optional grip, its bolt, its name, cut short on one line, then at
 * the right an optional `hint`, such as its risk, its stability, and the
 * app's actions, such as its menu. Whatever the map shows about it sits at
 * the right, together.
 *
 * With `details`, the name opens a popover of them on hover, focus, or tap,
 * as a stability mark does; without, the name's tooltip shows it in full.
 */
export function CapabilityLabel({
  name,
  level,
  grip = false,
  actions,
  details,
  hint,
}: {
  name: string;
  level: StabilityLevelId | null;
  grip?: boolean;
  actions?: ReactNode;
  /** What the name opens on hover: a DetailsCard. */
  details?: ReactNode;
  /** Something small after the name, such as how many rules it has. */
  hint?: ReactNode;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
      {grip ? <Grip /> : null}
      <BoltOutlinedIcon sx={{ flex: "none", fontSize: 16, color: "primary.main" }} />
      {details ? (
        <DetailsPopover title={details}>
          <Box
            component="span"
            tabIndex={0}
            sx={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              borderRadius: "3px",
              cursor: "help",
              "&:focus-visible": { outline: 2, outlineColor: "primary.main", outlineOffset: 2 },
            }}
          >
            <Box component="span" sx={nameStyle}>
              {name}
            </Box>
          </Box>
        </DetailsPopover>
      ) : (
        <>
          <Tooltip title={name}>
            <Box component="span" sx={nameStyle}>
              {name}
            </Box>
          </Tooltip>
          <Box sx={{ flex: 1 }} />
        </>
      )}
      <Box sx={{ flex: "none", display: "flex", alignItems: "center", gap: 0.75 }}>
        {hint}
        <span className="lens-stability">
          <CapabilityStability name={name} level={level} />
        </span>
        {actions}
      </Box>
    </Box>
  );
}
