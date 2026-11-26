import Box from "@mui/material/Box";
import { type ReactNode } from "react";
import { DetailsCard, DetailsEyebrow } from "./DetailsPopover";

/* A pill's popover: its title and what it means, then the list, labelled. */
export function PillCard({ label, info, listLabel, children }: { label: string; info: string; listLabel: string; children: ReactNode }) {
  return (
    <DetailsCard card width={440}>
      <DetailsEyebrow>{label}</DetailsEyebrow>
      <Box component="p" sx={{ mt: 0.5, color: "text.secondary" }}>
        {info}
      </Box>
      <Box component="p" sx={{ mt: 1.25, mb: 0.5, pt: 1, fontSize: 11, fontWeight: 650, color: "text.disabled", borderTop: 1, borderColor: "divider" }}>
        {listLabel}
      </Box>
      {children}
    </DetailsCard>
  );
}
