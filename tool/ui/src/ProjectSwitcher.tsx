import { useState } from "react";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import UnfoldMoreRoundedIcon from "@mui/icons-material/UnfoldMoreRounded";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import type { ProjectEntry } from "./state";

/*
 * The project's name in the header. With more than one project to show, it
 * opens a menu of them to switch to.
 */
export default function ProjectSwitcher({
  name,
  current,
  projects,
  onSwitch,
}: {
  name: string;
  current: string;
  projects: ProjectEntry[];
  onSwitch: (id: string) => void;
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  if (projects.length < 2) return <strong>{name}</strong>;

  return (
    <>
      <button
        type="button"
        className="project-switch"
        aria-haspopup="menu"
        aria-expanded={anchor ? true : undefined}
        onClick={(e) => setAnchor(e.currentTarget)}
      >
        <strong>{name}</strong>
        <UnfoldMoreRoundedIcon aria-hidden sx={{ fontSize: 16 }} />
      </button>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        slotProps={{ paper: { sx: { mt: 0.75, minWidth: 220 } } }}
      >
        {projects.map((p) => (
          <MenuItem
            key={p.id}
            selected={p.id === current}
            onClick={() => {
              setAnchor(null);
              if (p.id !== current) onSwitch(p.id);
            }}
          >
            <ListItemIcon>{p.id === current ? <CheckRoundedIcon fontSize="small" /> : null}</ListItemIcon>
            {p.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
