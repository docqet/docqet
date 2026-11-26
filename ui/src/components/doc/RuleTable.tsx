import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import { Excerpt } from "../markdown/Markdown";
import { Term } from "../term/Term";
import { StandingMark } from "../standing/StandingMark";
import { RULE_STANDING_LABELS, plural } from "../names";
import { type Capability, type DocketState, type Rule } from "../../state";
import { docHref } from "../../routes";
import { Empty } from "../shell/layout";
import { CapabilityTable, cellSubSx, tableCardSx, wideOnly } from "./CapabilityTable";
import { faintSx, lineSx } from "./DocPage";

/* Where something stands: each of its capabilities, with its stability beside what's left on it. Past `limit`, a link to them all. */
export function StandingSummary({
  state,
  capabilities,
  domain,
  limit = 8,
  all,
}: {
  state: DocketState;
  capabilities: Capability[];
  domain?: string;
  limit?: number;
  all: string;
}) {
  const shown = capabilities.slice(0, limit);
  return (
    <>
      <CapabilityTable state={state} capabilities={shown} domain={domain} technical={false} compact />
      {capabilities.length > shown.length ? (
        <Box component="p" sx={lineSx}>
          <a href={all}>See all {capabilities.length} capabilities</a>
        </Box>
      ) : null}
    </>
  );
}

/* How a rule stands for a capability, in a few words. */
export const STANDING_SHORT = { gap: "Not held yet", evidence: "Held, with evidence", trust: "Held, on trust" } as const;

export const placesOf = (r: Rule) => r.evidence.verifies.length + r.evidence.implements.length;

/*
 * Rules as a table: each one's name, opening its page, with why it exists
 * under it. With `capability`, whether that capability holds to it, the ones
 * a gap says it doesn't first; otherwise how many capabilities follow it and
 * how many places are its evidence. Evidence is optional, so none is no
 * warning. On a phone, the evidence is left out: each rule's page has it.
 */
export function RuleTable({ rules, capability }: { rules: Rule[]; capability?: Capability }) {
  if (!rules.length) return <Empty>None written down yet.</Empty>;
  const sorted = capability
    ? [...rules].sort((a, b) => Number(capability.ruleStandings[b.id] === "gap") - Number(capability.ruleStandings[a.id] === "gap"))
    : rules;
  return (
    <TableContainer sx={tableCardSx}>
      <Table sx={{ "& .MuiTableBody-root .MuiTableCell-root": { verticalAlign: "top" } }}>
        <TableHead>
          <TableRow>
            <TableCell>
              <Term id="rule" hoverOnly>
                Rule
              </Term>
            </TableCell>
            {capability ? <TableCell>Standing</TableCell> : <TableCell align="right">Followed by</TableCell>}
            <TableCell align="right" sx={wideOnly}>
              <Term id="evidence" hoverOnly>
                Evidence
              </Term>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sorted.map((r) => {
            const standing = capability ? capability.ruleStandings[r.id] : null;
            const places = placesOf(r);
            return (
              <TableRow key={r.id}>
                <TableCell sx={{ minWidth: { xs: 160, sm: 280 } }}>
                  <Box component="span" sx={{ display: "flex", gap: 1 }}>
                    {standing ? (
                      <StandingMark standing={standing} label={RULE_STANDING_LABELS[standing]} />
                    ) : (
                      <RuleRoundedIcon sx={{ fontSize: 15, color: "text.secondary", flex: "none", mt: "2px" }} />
                    )}
                    <span>
                      <a href={docHref("rule", r.id)}>{r.name}</a>
                      <Box component="span" sx={cellSubSx}>
                        <Excerpt text={r.why} lines={2} />
                      </Box>
                    </span>
                  </Box>
                </TableCell>
                {standing ? (
                  <TableCell
                    sx={{
                      whiteSpace: { sm: "nowrap" },
                      color: standing === "gap" ? "warning.main" : "text.secondary",
                      fontWeight: standing === "gap" ? 600 : undefined,
                    }}
                  >
                    {STANDING_SHORT[standing]}
                  </TableCell>
                ) : (
                  <TableCell align="right">
                    {r.capabilities.length || (
                      <Box component="span" sx={faintSx}>
                        None
                      </Box>
                    )}
                  </TableCell>
                )}
                <TableCell align="right" sx={wideOnly}>
                  {places ? (
                    plural(places, "place", "places")
                  ) : (
                    <Box component="span" sx={faintSx}>
                      None
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
