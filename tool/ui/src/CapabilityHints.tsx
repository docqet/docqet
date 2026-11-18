import Box from "@mui/material/Box";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

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
  if (!count) return null;
  return (
    <Box
      component="span"
      aria-label={count === 1 ? "1 rule" : `${count} rules`}
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
      <RuleRoundedIcon sx={{ fontSize: 14 }} />
      {count}
    </Box>
  );
}
