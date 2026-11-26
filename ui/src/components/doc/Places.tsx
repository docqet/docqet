import CodeRoundedIcon from "@mui/icons-material/CodeRounded";
import { projectName, type EvidencePlace, type DocketState } from "../../state";
import Tooltip from "@mui/material/Tooltip";
import { plural } from "../names";

/*
 * Places in the code a gap or tradeoff names, with `docket:gap` or
 * `docket:tradeoff`: each line as written, and its file. In short, how many.
 */
export function Places({ state, places, label, detailed = false }: { state: DocketState; places: EvidencePlace[]; label: string; detailed?: boolean }) {
  if (!places.length) return null;
  if (!detailed) return <span>{plural(places.length, `${label} in 1 place`, `${label} in ${places.length} places`).replace(/^\d+ /, "")}</span>;
  const several = state.projects.length > 1;
  return (
    <ul className="page-places explore-places">
      {places.map((e) => (
        <li key={`${e.project}:${e.file}:${e.line}`}>
          <span className="page-place-icon">
            <CodeRoundedIcon sx={{ fontSize: 14 }} />
          </span>
          <span className="page-place">
            <Tooltip title={e.text}>
              <code>{e.text}</code>
            </Tooltip>
            <span className="page-place-where">
              {e.file}:{e.line}
              {several && e.project ? ` · ${projectName(state, e.project)}` : ""}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
