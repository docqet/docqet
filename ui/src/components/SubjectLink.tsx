import Box from "@mui/material/Box";
import { NAMES, TECHNICAL_NAMES } from "./names";
import { DomainIcon } from "./names";
import { CapabilityStability } from "./CapabilityLabel";
import { docHref, type DocKind } from "../routes";
import { find, technicalDoc, type Capability, type Doc, type DocqetState } from "../state";

const KIND_NAMES = { ...NAMES, ...TECHNICAL_NAMES };

/* Its icon and name, bold, in the text around it, lit in the accent on hover. */
const subjectSx = {
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
  minWidth: 0,
  fontWeight: 600,
  color: "inherit",
  textDecoration: "none",
  "& svg": { flex: "none", width: 15, height: 15, fontSize: 15 },
} as const;

/* Quieter, where it's beside what matters more, as in a gap's "On" cell on What's left. */
const quietSx = { fontWeight: 500, color: "text.secondary" } as const;

/* What a gap, tradeoff or decision is on, as a link to its page, with its icon, and with `withLevel`, a capability's stability. `quiet` sets it in the muted color, at a normal weight. */
export function SubjectLink({
  state,
  type,
  id,
  withLevel = false,
  quiet = false,
}: {
  state: DocqetState;
  type: string;
  id: string;
  withLevel?: boolean;
  quiet?: boolean;
}) {
  const technical = type === "mechanism" || type === "component";
  const doc: Doc | undefined = technical
    ? technicalDoc(state, `${type}:${id}`)
    : find<Doc>(type === "domain" ? state.domains : type === "feature" ? state.features : state.capabilities, id);
  if (!doc)
    return (
      <Box component="span" sx={[subjectSx, quiet && quietSx]}>
        {id}
      </Box>
    );
  const icon = type === "domain" ? <DomainIcon size={15} /> : KIND_NAMES[type as keyof typeof KIND_NAMES]?.icon;
  return (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1, minWidth: 0 }}>
      <Box component="a" href={docHref(type as DocKind, id)} sx={[subjectSx, quiet && quietSx, { "&:hover": { color: "primary.main" } }]}>
        {icon}
        {doc.name}
      </Box>
      {withLevel && type === "capability" ? <CapabilityStability level={(doc as Capability).stability} name={doc.name} focusable={false} /> : null}
    </Box>
  );
}
