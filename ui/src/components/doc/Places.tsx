import Box from "@mui/material/Box";
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
    <Box component="ul" sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {places.map((e) => (
        <Box component="li" key={`${e.project}:${e.file}:${e.line}`} sx={{ display: "flex", gap: 1, minWidth: 0 }}>
          <Box component="span" sx={{ display: "inline-flex", mt: "2px", color: "text.disabled" }}>
            <CodeRoundedIcon sx={{ fontSize: 14 }} />
          </Box>
          <Box component="span" sx={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
            <Tooltip title={e.text}>
              <Box component="code" sx={{ fontSize: 12, overflowWrap: "anywhere" }}>
                {e.text}
              </Box>
            </Tooltip>
            <Box component="span" sx={{ fontSize: 11.5, overflowWrap: "anywhere", color: "text.disabled" }}>
              {e.file}:{e.line}
              {several && e.project ? ` · ${projectName(state, e.project)}` : ""}
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
