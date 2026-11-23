import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { LeftMark } from "./design/left/LeftMark";
import { Tip } from "./design/Tip";

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

/* After a capability's name, how many rules it has, which the side panel lists. */
export function RulesHint({ count }: { count: number }) {
  return <CountHint count={count} label={count === 1 ? "1 rule" : `${count} rules`} icon={<RuleRoundedIcon sx={{ fontSize: 14 }} />} />;
}

/* After a name, how many open decisions it has, which the side panel lists under what's left. */
export function DecisionsHint({ count }: { count: number }) {
  return (
    <CountHint
      count={count}
      label={count === 1 ? "1 open decision" : `${count} open decisions`}
      icon={<LeftMark kind="decision" size={13} decorative />}
    />
  );
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
