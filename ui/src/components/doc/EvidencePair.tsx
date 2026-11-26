import Box from "@mui/material/Box";
import { Places } from "./Places";
import { type Capability, type DocketState } from "../../state";
import { cardSx, faintSx } from "./DocPage";

/* Where the code says it implements or verifies something, from its annotations: what implements it beside what verifies it. */
export function EvidencePair({ state, doc }: { state: DocketState; doc: { evidence: Capability["evidence"] } }) {
  const side = (label: string, places: Capability["evidence"]["implements"]) => (
    <div>
      <Box component="span" sx={{ display: "block", mb: 0.5, typography: "overline", color: "text.disabled" }}>
        {label}
      </Box>
      {places.length ? (
        <Places state={state} places={places} label="" detailed />
      ) : (
        <Box component="span" sx={faintSx}>
          None
        </Box>
      )}
    </div>
  );
  return (
    <Box sx={cardSx}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 1.5,
          mt: 1.75,
          pt: 1.5,
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        {side("Implemented by", doc.evidence.implements)}
        {side("Verified by", doc.evidence.verifies)}
      </Box>
    </Box>
  );
}
