import Box from "@mui/material/Box";
import { ProblemIcon } from "./names";
import { ReadinessMark } from "./Readiness";
import { Crumb, levelsSx } from "./doc/DocPage";
import { docHref } from "../routes";
import type { Problem } from "../state";

/* Problems as a line apiece: each one's name, linking to its page, then how ready what solves it is, or that nothing does yet. */
export function ProblemRows({ problems }: { problems: Problem[] }) {
  return (
    <Box component="ul" sx={levelsSx}>
      {problems.map((p) => (
        <li key={p.id}>
          <Crumb href={docHref("problem", p.id)} icon={<ProblemIcon />}>
            {p.name}
          </Crumb>
          {p.capabilities.length ? (
            <ReadinessMark readiness={p.readiness} of={`Readiness of what solves “${p.name}”`} />
          ) : (
            <Box component="span" sx={{ color: "text.secondary", fontWeight: 500 }}>
              Nothing solves it yet
            </Box>
          )}
        </li>
      ))}
    </Box>
  );
}
