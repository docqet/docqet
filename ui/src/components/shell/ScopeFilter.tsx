// docqet:implements capability:initiative-scope
import { useState } from "react";
import RadioButtonCheckedRoundedIcon from "@mui/icons-material/RadioButtonCheckedRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import UnfoldMoreRoundedIcon from "@mui/icons-material/UnfoldMoreRounded";
import Menu from "@mui/material/Menu";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import { MenuGroup, Option, filterSx, hintSx, menuSlots, switchSx } from "./ProductFilter";
import { navigate, withParam } from "../../routes";
import { scopeParam, type Scope } from "../../scope";
import type { Initiative } from "../../state";

/* An initiative's mark, wherever one is named. */
export function InitiativeIcon({ size = 16 }: { size?: number }) {
  return <RocketLaunchOutlinedIcon sx={{ fontSize: size, flex: "none", color: "text.secondary" }} />;
}

/* What a scope is called. */
export const scopeName = (scope: Scope, initiatives: Initiative[]) =>
  scope.kind === "all" ? "Everything" : (initiatives.find((i) => i.id === scope.id)?.name ?? scope.id);

/*
 * Which initiative the page shows, in the header beside the product, named
 * "Initiative":
 * everything, or one initiative's capabilities and personas. Every page and
 * number follows it. With no initiatives there's nothing to choose,
 * so it's left out.
 */
export default function ScopeFilter({ scope, initiatives }: { scope: Scope; initiatives: Initiative[] }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  if (!initiatives.length && scope.kind === "all") return null;

  const choices: { scope: Scope; name: string; hint: string }[] = [
    { scope: { kind: "all" }, name: "Everything", hint: "Every initiative, and what's in none" },
    ...initiatives.map((i) => ({ scope: { kind: "initiative", id: i.id } as Scope, name: i.name, hint: "Initiative" })),
  ];
  const current = scopeParam(scope);
  const choose = (s: Scope) => {
    setAnchor(null);
    navigate(withParam("scope", scopeParam(s)));
  };

  return (
    <Box sx={filterSx}>
      <Box
        component="button"
        type="button"
        sx={switchSx}
        aria-haspopup="menu"
        aria-expanded={anchor ? true : undefined}
        onClick={(e) => setAnchor(e.currentTarget.parentElement)}
      >
        <InitiativeIcon />
        <strong>{scopeName(scope, initiatives)}</strong>
        <UnfoldMoreRoundedIcon aria-hidden sx={{ fontSize: 16 }} />
      </Box>
      <Box component="span" sx={hintSx}>
        Initiative
      </Box>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        slotProps={menuSlots(anchor)}
      >
        <MenuGroup>Initiative</MenuGroup>
        {choices.map((c) => {
          const on = scopeParam(c.scope) === current;
          return (
            <MenuItem
              key={scopeParam(c.scope) ?? "all"}

              role="menuitemradio"
              aria-checked={on}
              selected={on}
              onClick={() => choose(c.scope)}
            >
              {on ? (
                <RadioButtonCheckedRoundedIcon aria-hidden sx={{ fontSize: 18, flex: "none", color: "primary.main" }} />
              ) : (
                <RadioButtonUncheckedRoundedIcon aria-hidden sx={{ fontSize: 18, flex: "none", color: "text.disabled" }} />
              )}
              <Option name={c.name} hint={c.hint} />
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );
}
