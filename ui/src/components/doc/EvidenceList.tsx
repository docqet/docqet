import type { ReactNode } from "react";
import Tooltip from "@mui/material/Tooltip";
import { projectName, type DocketState, type EvidencePlace } from "../../state";

/* Places in the code: the line below each annotation, as written, and its file and line. */
export function EvidenceList({ state, places, icon }: { state: DocketState; places: EvidencePlace[]; icon: ReactNode }) {
  const several = state.projects.length > 1;
  return (
    <ul className="dp-places">
      {places.map((e) => (
        <li key={`${e.project}:${e.file}:${e.line}`}>
          <span className="dp-place-icon">{icon}</span>
          <span className="dp-place">
            <Tooltip title={e.text}>
              <code>{e.text}</code>
            </Tooltip>
            <span className="dp-place-where">
              {e.file}:{e.line}
              {several && e.project ? ` · ${projectName(state, e.project)}` : ""}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
