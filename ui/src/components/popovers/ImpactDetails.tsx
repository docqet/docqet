import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import { DetailsCard } from "./DetailsPopover";
import { IMPACT_NAMES, PARTS_INFO, PartHead, Scale, type ImpactId } from "../risk/ImpactBadge";

/* What an impact means, for the popover, as likelihood's and reach's do: its name and test, what it takes, its scale, then its sections. */
export function ImpactDetails({ impact, eyebrow, children }: { impact: ImpactId; eyebrow: string; children?: ReactNode }) {
  return (
    <DetailsCard card width={340}>
      <PartHead part="impact" value={impact} eyebrow={eyebrow} />
      <Box sx={{ mt: 0.5, color: "text.secondary" }}>
        What whoever relies on it loses: <strong>{IMPACT_NAMES[impact].lost}</strong>.
      </Box>
      <Scale part="impact" value={impact} />
      <Box sx={{ mt: 1.25, color: "text.secondary", fontSize: "0.92em" }}>{PARTS_INFO.impact.means}</Box>
      {children}
    </DetailsCard>
  );
}
