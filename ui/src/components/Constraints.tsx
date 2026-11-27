import Box from "@mui/material/Box";
import { ConstraintIcon } from "./names";
import { InlineMarkdown } from "./markdown/Markdown";
import { Crumb, levelsSx } from "./doc/DocPage";
import { docHref } from "../routes";
import type { Constraint } from "../state";

/* Constraints as a line apiece: each one's name, linking to its page, with where it comes from under it. */
export function ConstraintRows({ constraints }: { constraints: Constraint[] }) {
  return (
    <Box component="ul" sx={[levelsSx, { "& > li": { display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 0.25 } }]}>
      {constraints.map((c) => (
        <li key={c.id}>
          <Crumb href={docHref("constraint", c.id)} icon={<ConstraintIcon />}>
            {c.name}
          </Crumb>
          {c.source ? (
            <Box component="span" sx={{ fontSize: 12.5, color: "text.secondary" }}>
              <InlineMarkdown text={c.source} />
            </Box>
          ) : null}
        </li>
      ))}
    </Box>
  );
}
