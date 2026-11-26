import type { ReactNode } from "react";
import { DetailsPopover, usePopoversOff } from "../popovers/DetailsPopover";
import { TERMS, type TermId } from "./terms";
import { TermDetails } from "../popovers/TermDetails";

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
