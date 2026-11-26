import { type ReactNode } from "react";
import Box from "@mui/material/Box";
import { LeftCounts } from "./left/LeftMark";
import { linkButtonSx } from "./markdown/Markdown";
import { RowBody, rowSx } from "./Personas";
import { openDecisions, pageHref, type TechnicalDoc, type DocketState } from "../state";
import { TECHNICAL_NAMES } from "./names";

/*
 * A link to a mechanism's or component's page: in this tab on a detail page,
 * or a new one from the side panel: its icon, then its name, as a link.
 */
export function TechnicalLink({ doc, newTab = false, children }: { doc: TechnicalDoc; newTab?: boolean; children?: ReactNode }) {
  return (
    <Box
      component="a"
      href={pageHref({ kind: doc.kind, id: doc.id })}
      {...(newTab ? { target: "_blank", rel: "noopener" } : {})}
      sx={[linkButtonSx, { display: "inline-flex", alignItems: "center", gap: 0.5 }]}
    >
      {children ?? (
        <>
          {TECHNICAL_NAMES[doc.kind].icon}
          {doc.name}
        </>
      )}
    </Box>
  );
}

/* Mechanisms and components as rows: each one's name, kind, and how many technical gaps it has. */
export function TechnicalRows({ docs, newTab = false }: { state: DocketState; docs: TechnicalDoc[]; newTab?: boolean }) {
  return (
    <ul>
      {docs.map((e) => (
        <li key={`${e.kind}:${e.id}`}>
          <Box component="a" href={pageHref({ kind: e.kind, id: e.id })} {...(newTab ? { target: "_blank", rel: "noopener" } : {})} sx={rowSx}>
            <RowBody
              icon={TECHNICAL_NAMES[e.kind].icon}
              name={e.name}
              summary={
                <LeftCounts
                  lead={TECHNICAL_NAMES[e.kind].one}
                  counts={[
                    ["decision", openDecisions(e).length],
                    ["technical-gap", e.gaps.length],
                    ["tradeoff", e.tradeoffs.length],
                  ]}
                />
              }
            />
          </Box>
        </li>
      ))}
    </ul>
  );
}
