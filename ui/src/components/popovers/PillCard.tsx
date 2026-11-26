import { type ReactNode } from "react";
import { DetailsCard, DetailsEyebrow } from "./DetailsPopover";

/* A pill's popover: its title and what it means, then the list, labelled. */
export function PillCard({ label, info, listLabel, children }: { label: string; info: string; listLabel: string; children: ReactNode }) {
  return (
    <DetailsCard card width={440}>
      <DetailsEyebrow>{label}</DetailsEyebrow>
      <p className="sc-pill-info">{info}</p>
      <p className="sc-list-label">{listLabel}</p>
      {children}
    </DetailsCard>
  );
}
