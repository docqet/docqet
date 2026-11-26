import { type ReactNode } from "react";
import { Excerpt } from "../markdown/Markdown";

/* Rows that each open a doc's page: its icon, name and description. */
export function DocRows({ rows }: { rows: { key: string; href: string; icon: ReactNode; name: string; summary?: string; mark?: ReactNode }[] }) {
  return (
    <ul className="page-rows">
      {rows.map((r) => (
        <li key={r.key}>
          <a className="concept-row" href={r.href}>
            <span className="page-row-icon">{r.icon}</span>
            <span className="concept-row-text">
              <span className="concept-row-name">{r.name}</span>
              {r.summary ? <Excerpt text={r.summary} lines={2} className="concept-row-summary" /> : null}
            </span>
            {r.mark}
          </a>
        </li>
      ))}
    </ul>
  );
}
