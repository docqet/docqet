import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import { DetailsCard, DetailsEyebrow, DetailsPopover, usePopoversOff } from "../DetailsPopover";
import { TERMS, type TermId } from "./terms";

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

/*
 * One of Docket's words where it labels something, such as a heading or a
 * kind, underlined with dots, opening what it means on hover, focus or tap.
 * By default it reads as the word's own name. `focusable={false}` inside a
 * button or link, which already takes focus; `hoverOnly` where a tap does
 * something else, such as a fold's heading.
 */
export function Term({ id, children, focusable = true, hoverOnly = false }: { id: TermId; children?: ReactNode; focusable?: boolean; hoverOnly?: boolean }) {
  /* Where popovers are off, as in tabs, the word reads plainly, with no dots. */
  if (usePopoversOff()) return <>{children ?? TERMS[id].name}</>;
  return (
    <DetailsPopover hoverOnly={hoverOnly} title={<TermDetails id={id} />}>
      <span className="term" tabIndex={focusable && !hoverOnly ? 0 : undefined}>
        {children ?? TERMS[id].name}
      </span>
    </DetailsPopover>
  );
}
