import { useState } from "react";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import SettingsBrightnessOutlinedIcon from "@mui/icons-material/SettingsBrightnessOutlined";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import { useColorScheme } from "@mui/material/styles";
import { barIconSx } from "./barIcon";

const MODES = [
  { mode: "system", name: "System", Icon: SettingsBrightnessOutlinedIcon },
  { mode: "light", name: "Light", Icon: LightModeOutlinedIcon },
  { mode: "dark", name: "Dark", Icon: DarkModeOutlinedIcon },
] as const;

/* Light, dark, or whatever the system is set to: a button showing which, opening the three to choose from. */
export function ColorSchemeToggle() {
  const { mode, setMode } = useColorScheme();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const current = MODES.find((m) => m.mode === mode) ?? MODES[0];
  return (
    <>
      <Tooltip title={`Appearance: ${current.name}`}>
        <IconButton
          size="small"
          aria-label="Appearance"
          aria-haspopup="menu"
          aria-expanded={anchor ? "true" : undefined}
          onClick={(e) => setAnchor(e.currentTarget)}
          sx={barIconSx}
        >
          <current.Icon sx={{ fontSize: 20 }} />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        {MODES.map(({ mode: m, name, Icon }) => (
          <MenuItem
            key={m}
            selected={m === current.mode}
            onClick={() => {
              setMode(m);
              setAnchor(null);
            }}
          >
            <Icon fontSize="small" sx={{ color: "text.secondary" }} />
            {name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
