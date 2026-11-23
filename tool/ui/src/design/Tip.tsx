import Tooltip from "@mui/material/Tooltip";
import type { ReactElement, ReactNode } from "react";

/*
 * A short tooltip: a few words on hover or focus about what something is or
 * does. Every plain tooltip in the UI is one of these, never a native
 * `title`, so they all look and behave the same. (A card that opens on hover
 * is a DetailsPopover.)
 *
 * It describes what it's on rather than naming it, so a button keeps the
 * name its words or `aria-label` give it. Text with line breaks keeps them.
 * With no title, it's just what it's on.
 */
export function Tip({ title, children }: { title: ReactNode; children: ReactElement }) {
  if (title === null || title === undefined || title === "" || title === false) return children;
  return (
    <Tooltip title={title} describeChild disableInteractive enterDelay={300} enterNextDelay={150} slotProps={{ tooltip: { sx: { whiteSpace: "pre-line" } } }}>
      {children}
    </Tooltip>
  );
}
