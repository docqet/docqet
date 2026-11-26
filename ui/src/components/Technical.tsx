import { type ReactNode } from "react";
import { LeftCounts } from "./left/LeftMark";
import { openDecisions, pageHref, type TechnicalDoc, type DocketState } from "../state";
import { TECHNICAL_NAMES } from "./names";

/* A link to a mechanism's or component's page: in this tab on a detail page, or a new one from the side panel. */
export function TechnicalLink({ doc, newTab = false, children }: { doc: TechnicalDoc; newTab?: boolean; children?: ReactNode }) {
  return (
    <a className="link explore-crumb" href={pageHref({ kind: doc.kind, id: doc.id })} {...(newTab ? { target: "_blank", rel: "noopener" } : {})}>
      {children ?? (
        <>
          {TECHNICAL_NAMES[doc.kind].icon}
          {doc.name}
        </>
      )}
    </a>
  );
}

/* Mechanisms and components as rows: each one's name, kind, and how many technical gaps it has. */
export function TechnicalRows({ docs, newTab = false }: { state: DocketState; docs: TechnicalDoc[]; newTab?: boolean }) {
  return (
    <ul>
      {docs.map((e) => (
        <li key={`${e.kind}:${e.id}`}>
          <a className="concept-row" href={pageHref({ kind: e.kind, id: e.id })} {...(newTab ? { target: "_blank", rel: "noopener" } : {})}>
            <span style={{ alignSelf: "flex-start", marginTop: 2, display: "inline-flex" }}>{TECHNICAL_NAMES[e.kind].icon}</span>
            <span className="concept-row-text">
              <span className="concept-row-name">{e.name}</span>
              <span className="concept-row-summary">
                <LeftCounts
                  lead={TECHNICAL_NAMES[e.kind].one}
                  counts={[
                    ["decision", openDecisions(e).length],
                    ["technical-gap", e.gaps.length],
                    ["tradeoff", e.tradeoffs.length],
                  ]}
                />
              </span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
