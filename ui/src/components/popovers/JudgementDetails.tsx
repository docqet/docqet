import Box from "@mui/material/Box";
import { PARTS_INFO, PartHead, Scale, type LikelihoodId, type ReachId } from "../risk/ImpactBadge";
import { DetailsCard } from "./DetailsPopover";

/* A gap's likelihood or reach: its value, where it sits on the scale, and what the part means. */
export function JudgementDetails({ part, value }: { part: "likelihood" | "reach"; value: LikelihoodId | ReachId }) {
  return (
    <DetailsCard card width={340}>
      <PartHead part={part} value={value} />
      <Scale part={part} value={value} />
      <Box sx={{ mt: 1.25, color: "text.secondary", fontSize: "0.92em" }}>{PARTS_INFO[part].means}</Box>
    </DetailsCard>
  );
}
