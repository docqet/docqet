import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import type { Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import { Excerpt } from "../markdown/Markdown";
import { Term } from "../term/Term";
import { LeftSummary, leftOf } from "../left/LeftSummary";
import { InitiativeTags } from "../Initiatives";
import { find, leftCount, type Capability, type DocketState } from "../../state";
import { docHref } from "../../routes";
import { Empty } from "../shell/layout";
import { LevelName, faintSx } from "./DocPage";
import { Avatars } from "./DocPage";

/* A table on a doc page, in a card of its own that scrolls sideways inside itself when it's wider than the page. Its last row is unruled, as the card closes it. */
export const tableCardSx: SystemStyleObject<Theme> = {
  overflowX: "auto",
  bgcolor: "background.paper",
  border: 1,
  borderColor: "divider",
  borderRadius: "10px",
  "& .MuiTableBody-root > .MuiTableRow-root:last-of-type > .MuiTableCell-root": { borderBottom: 0 },
};

/* A line under a cell's name, such as what a capability does. */
export const cellSubSx: SystemStyleObject<Theme> = { display: "block", mt: "2px", fontSize: 12.5, fontWeight: 400, color: "text.secondary" };

/* A secondary column, left out on a phone. */
export const wideOnly: SystemStyleObject<Theme> = { display: { xs: "none", sm: "table-cell" } };

/*
 * Capabilities as a table: each one's name, opening its page, its level (in
 * `domain`, when given), what's left about it, opening that tab of its page,
 * and who it serves. With `technical` false, as for a persona, what's left is
 * only what someone using the product would notice. On a phone, who it
 * serves is left out.
 */
export function CapabilityTable({
  state,
  capabilities,
  domain,
  technical = true,
  compact = false,
}: {
  state: DocketState;
  capabilities: Capability[];
  domain?: string;
  technical?: boolean;
  /* Just each one's level, name and what's left, for where it stands. */
  compact?: boolean;
}) {
  if (!capabilities.length) return <Empty>None yet.</Empty>;
  /* Past its name, a row keeps each figure on one line. */
  const rest: SystemStyleObject<Theme> = { whiteSpace: "nowrap" };
  return (
    <TableContainer sx={tableCardSx}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <Term id="capability" hoverOnly>
                Capability
              </Term>
            </TableCell>
            <TableCell>Level</TableCell>
            <TableCell>
              <Term id="gap" hoverOnly>
                What's left
              </Term>
            </TableCell>
            {compact ? null : (
              <TableCell sx={wideOnly}>
                <Term id="persona" hoverOnly>
                  Serves
                </Term>
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {capabilities.map((c) => {
            const level = (domain && c.levels.find((l) => l.domain === domain)?.level) || c.stability;
            const left = leftOf(c, technical);
            return (
              <TableRow key={c.id}>
                <TableCell sx={{ minWidth: { xs: 120, sm: 240 } }}>
                  <a href={docHref("capability", c.id)}>{c.name}</a>
                  <InitiativeTags state={state} ids={c.initiatives} />
                  {compact ? null : (
                    <Box component="span" sx={cellSubSx}>
                      <Excerpt text={c.description} lines={1} />
                    </Box>
                  )}
                </TableCell>
                <TableCell sx={rest}>
                  <LevelName level={level} name={c.name} />
                </TableCell>
                {/* What's left reads as the row's text, not as its name. */}
                <TableCell sx={{ ...rest, "& a": { fontWeight: 400 } }}>
                  {leftCount(left) ? (
                    <a href={docHref("capability", c.id, "left")}>
                      <LeftSummary left={left} />
                    </a>
                  ) : (
                    <Box component="span" sx={faintSx}>
                      Nothing open
                    </Box>
                  )}
                </TableCell>
                {compact ? null : (
                  <TableCell sx={[rest, wideOnly]}>
                    <Avatars personas={c.personas.flatMap((id) => find(state.personas, id) ?? [])} />
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
