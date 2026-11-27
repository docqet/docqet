import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import Tooltip from "@mui/material/Tooltip";
import { docHref } from "../routes";
import { InitiativeIcon } from "./shell/ScopeFilter";
import { find, type Capability, type DocqetState } from "../state";

/*
 * The initiatives some capabilities are part of, each once, in the order
 * state lists them: what a feature, area, rule, concept or gap is part of,
 * worked out from its capabilities.
 */
export const initiativesOf = (state: DocqetState, capabilities: Capability[]): string[] => {
  const ids = new Set(capabilities.flatMap((c) => c.initiatives));
  return state.initiatives.filter((i) => ids.has(i.id)).map((i) => i.id);
};

/* A small tag: the initiative's icon and name, on the accent's soft fill. */
const tagSx: SystemStyleObject<Theme> = {
  display: "inline-flex",
  alignItems: "center",
  gap: "3px",
  px: 0.75,
  fontSize: 11,
  fontWeight: 500,
  lineHeight: "16px",
  color: "text.secondary",
  bgcolor: "surface.accentSoft",
  border: 1,
  borderColor: "divider",
  borderRadius: 999,
  whiteSpace: "nowrap",
  textDecoration: "none",
};

/*
 * The initiatives something is part of, as small tags beside its name, each
 * linking to the initiative's page. `plain` leaves out the links, for inside
 * a button or link, `block` puts them on a line of their own, under a
 * name, and `end` lines them up at the right, as under what a gap is on.
 * Nothing when it's in none.
 */
export function InitiativeTags({
  state,
  ids,
  plain = false,
  block = false,
  end = false,
}: {
  state: DocqetState;
  ids: string[];
  plain?: boolean;
  block?: boolean;
  end?: boolean;
}) {
  const initiatives = ids.flatMap((id) => find(state.initiatives, id) ?? []);
  if (!initiatives.length) return null;
  return (
    /* initiative-tags: a hook for the lists that line them up at the right of a row. */
    <Box
      component="span"
      className="initiative-tags"
      aria-label={`Part of ${initiatives.map((i) => i.name).join(", ")}`}
      sx={{
        display: block ? "flex" : "inline-flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: end ? "flex-end" : undefined,
        gap: 0.5,
        m: block ? "4px 0 0" : undefined,
        ml: block ? undefined : 0.75,
        verticalAlign: "middle",
      }}
    >
      {initiatives.map((i) =>
        plain ? (
          <Box component="span" key={i.id} sx={tagSx}>
            <InitiativeIcon size={11} />
            {i.name}
          </Box>
        ) : (
          <Tooltip key={i.id} title={i.description}>
            <Box component="a" href={docHref("initiative", i.id)} sx={[tagSx, { "&:hover": { color: "text.primary", borderColor: "surface.borderStrong" } }]}>
              <InitiativeIcon size={11} />
              {i.name}
            </Box>
          </Tooltip>
        ),
      )}
    </Box>
  );
}
