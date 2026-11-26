import Box from "@mui/material/Box";
import { DetailsCard, DetailsEyebrow } from "./DetailsPopover";
import { TERMS, type TermId } from "../term/terms";

/* What one of Docket's words means: its name, what it is, and an example. The content of Term's popover. */
export function TermDetails({ id }: { id: TermId }) {
  const { name, means, more } = TERMS[id];
  return (
    <DetailsCard card>
      <DetailsEyebrow>What&rsquo;s this?</DetailsEyebrow>
      <Box sx={{ mt: 0.5, fontSize: "1.12em", fontWeight: 700, lineHeight: 1.3 }}>{name}</Box>
      <Box sx={{ mt: 1 }}>{means}</Box>
      {more ? <Box sx={{ mt: 1.5, pt: 1.5, borderTop: 1, borderColor: "divider", fontSize: "0.92em", color: "text.secondary" }}>{more}</Box> : null}
    </DetailsCard>
  );
}
