import Box from "@mui/material/Box";
import { DetailsCard, DetailsEyebrow } from "./DetailsPopover";
import { type Concept } from "../../state";

export function ConceptSummary({ concept }: { concept: Concept }) {
  return (
    <DetailsCard card>
      <DetailsEyebrow>Concept</DetailsEyebrow>
      <Box sx={{ mt: 0.5, fontSize: "1.12em", fontWeight: 700, lineHeight: 1.3 }}>{concept.name}</Box>
      {concept.description ? <Box sx={{ mt: 0.75 }}>{concept.description}</Box> : null}
      <Box sx={{ mt: 1, fontSize: 12, color: "text.secondary" }}>Click to see everything it's related to.</Box>
    </DetailsCard>
  );
}
