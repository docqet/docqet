import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { LeftMark } from "./design/left/LeftMark";

/* A warning after a name, for something with a contradiction; what it is shows on hover. */
export function ContradictionHint({ messages }: { messages: string[] }) {
  if (!messages.length) return null;
  return (
    <WarningAmberRoundedIcon
      aria-label={messages.join(" ")}
      sx={{ flex: "none", fontSize: 15, color: "var(--warning)" }}
    />
  );
}

/* After a capability's name, how many rules it has, which the side panel lists. */
export function RulesHint({ count }: { count: number }) {
  return <CountHint count={count} label={count === 1 ? "1 rule" : `${count} rules`} icon={<RuleRoundedIcon sx={{ fontSize: 14 }} />} />;
}

/* After a capability's name, how many product gaps it has, which the side panel lists. */
export function GapsHint({ count }: { count: number }) {
  return (
    <CountHint
      count={count}
      label={count === 1 ? "1 product gap" : `${count} product gaps`}
      icon={<LeftMark kind="product-gap" size={13} decorative />}
    />
  );
}

function CountHint({ count, label, icon }: { count: number; label: string; icon: ReactNode }) {
  if (!count) return null;
  return (
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
  );
}
