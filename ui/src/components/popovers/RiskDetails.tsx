import Box from "@mui/material/Box";
import { type Gap, type RiskAcross } from "../../state";
import { DetailsCard, DetailsEyebrow, DetailsHead } from "./DetailsPopover";
import { plainText } from "../markdown/Markdown";
import { RiskWorkings } from "./RiskWorkings";
import { VERDICT_COLORS, VERDICT_NAMES, VerdictSpread, riskOnScoreSx } from "../risk/RiskScore";

/*
 * The risk across several, for its popover. One alone is shown as it would
 * be on its own: how its risk is worked out. Several show their highest
 * risk, how they spread across the verdicts, as a bar split by how many fall
 * in each, and the riskiest few with their scores, out of how many. How each
 * is worked out is on the gap itself.
 */
export function RiskDetails<T extends Gap>({ risk, of }: { risk: RiskAcross<T>; of: string }) {
  const riskiest = risk.items.slice(0, 3);
  const alone = risk.items.length === 1 ? risk.items[0] : null;
  return (
    <DetailsCard card width={320}>
      <DetailsEyebrow>{alone ? `Risk in ${of}` : `Risk spread in ${of}`}</DetailsEyebrow>
      {alone ? (
        <>
          <Box sx={{ mt: 1, display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1 }}>
            <Box sx={{ fontSize: "1.12em", fontWeight: 700, color: VERDICT_COLORS[risk.verdict ?? "none"] }}>{VERDICT_NAMES[alone.verdict].name}</Box>
            <Box sx={{ color: "text.secondary", fontVariantNumeric: "tabular-nums" }}>{alone.score} of 100</Box>
          </Box>
          <Box sx={{ mt: 1, fontWeight: 600 }}>{plainText(alone.item.name)}</Box>
          {alone.on ? (
            <Box sx={{ mt: 1.25 }}>
              <RiskWorkings risk={alone.risk} on={alone.on} />
            </Box>
          ) : null}
        </>
      ) : (
        <>
          <VerdictSpread risk={risk} />
          {riskiest.length ? (
            <>
              <DetailsHead>Riskiest</DetailsHead>
              <Box component="ul" sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 0.5 }}>
                {riskiest.map(({ item, score, verdict }) => (
                  <Box component="li" key={item.id} sx={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", columnGap: 1.5, rowGap: "1px" }}>
                    <Box component="span" sx={{ fontWeight: 600 }}>
                      {plainText(item.name)}
                    </Box>
                    <Box component="span" sx={riskOnScoreSx(verdict)}>
                      {score}
                    </Box>
                  </Box>
                ))}
              </Box>
              {risk.items.length > riskiest.length ? (
                <Box sx={{ mt: 0.75, fontSize: "0.92em", color: "text.secondary" }}>
                  The {riskiest.length} riskiest of {risk.items.length} gaps.
                </Box>
              ) : null}
            </>
          ) : null}
        </>
      )}
    </DetailsCard>
  );
}
