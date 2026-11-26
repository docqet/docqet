import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import { projectName, type DocketState, type EvidencePlace } from "../../state";

/* Places in the code: the line below each annotation, as written, on one line cut short, and its file and line. */
export function EvidenceList({ state, places, icon }: { state: DocketState; places: EvidencePlace[]; icon: ReactNode }) {
  const several = state.projects.length > 1;
  return (
    <Box component="ul" sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {places.map((e) => (
        <Box component="li" key={`${e.project}:${e.file}:${e.line}`} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
          <Box component="span" sx={{ display: "inline-flex", flex: "none", mt: "3px", color: "text.disabled" }}>
            {icon}
          </Box>
          <Box component="span" sx={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
            <Tooltip title={e.text}>
              <Box component="code" sx={{ overflow: "hidden", fontSize: 12.5, whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                {e.text}
              </Box>
            </Tooltip>
            <Box component="span" sx={{ fontFamily: "fontFamilyMono", fontSize: 11.5, color: "text.disabled" }}>
              {e.file}:{e.line}
              {several && e.project ? ` · ${projectName(state, e.project)}` : ""}
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
