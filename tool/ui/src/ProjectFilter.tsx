import { useState } from "react";
import CheckBoxOutlineBlankRoundedIcon from "@mui/icons-material/CheckBoxOutlineBlankRounded";
import CheckBoxRoundedIcon from "@mui/icons-material/CheckBoxRounded";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import UnfoldMoreRoundedIcon from "@mui/icons-material/UnfoldMoreRounded";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { RingGlyph } from "./design/maturity/RingGlyph";
import type { Project } from "./state";

/* A project's mark, wherever one is named. */
export function ProjectIcon({ size = 14 }: { size?: number }) {
  return <FolderOutlinedIcon sx={{ fontSize: size, flex: "none", color: "text.secondary" }} />;
}

const indexed = (p: Project) =>
  new Date(p.indexedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

/* The commit a project's repository was indexed at, and when. */
function Indexed({ project }: { project: Project }) {
  return (
    <span className="faint">
      <code>{project.commit}</code> · {indexed(project)}
    </span>
  );
}

/*
 * Which projects the page shows, in the header. With only one project there
 * is nothing to choose, so it's just its name and the commit it was indexed
 * at. With several, it says which are showing and opens a list of every
 * project to tick, each with its commit and maturity. At least one stays
 * ticked.
 */
export default function ProjectFilter({
  showing,
  all,
  onChange,
}: {
  showing: Project[];
  all: Project[];
  onChange: (ids: string[]) => void;
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const ids = showing.map((p) => p.id);

  if (all.length < 2) {
    return (
      <div className="project">
        <strong>{all[0].name}</strong>
        <Indexed project={all[0]} />
      </div>
    );
  }

  const everything = showing.length === all.length;
  const toggle = (id: string) =>
    onChange(ids.includes(id) ? ids.filter((x) => x !== id) : all.map((p) => p.id).filter((x) => x === id || ids.includes(x)));

  return (
    <div className="project">
      <button
        type="button"
        className="project-switch"
        aria-haspopup="menu"
        aria-expanded={anchor ? true : undefined}
        onClick={(e) => setAnchor(e.currentTarget)}
      >
        <strong>{everything ? "All projects" : showing.map((p) => p.name).join(", ")}</strong>
        <UnfoldMoreRoundedIcon aria-hidden sx={{ fontSize: 16 }} />
      </button>
      {showing.length === 1 ? (
        <Indexed project={showing[0]} />
      ) : (
        <span className="faint">
          {everything ? `${all.length} projects` : `${showing.length} of ${all.length} projects`}
        </span>
      )}
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        slotProps={{ paper: { sx: { mt: 0.75, minWidth: 280 } } }}
      >
        <MenuItem selected={everything} onClick={() => onChange(all.map((p) => p.id))}>
          <ListItemIcon>
            <Check on={everything} />
          </ListItemIcon>
          All projects
        </MenuItem>
        <Divider />
        {all.map((p) => {
          const on = ids.includes(p.id);
          return (
            <MenuItem
              key={p.id}
              role="menuitemcheckbox"
              aria-checked={on}
              disabled={on && showing.length === 1}
              onClick={() => toggle(p.id)}
            >
              <ListItemIcon>
                <Check on={on} />
              </ListItemIcon>
              <span className="project-option">
                <span>{p.name}</span>
                <Indexed project={p} />
              </span>
              {p.maturity !== null ? <RingGlyph progress={p.maturity} size={20} /> : null}
            </MenuItem>
          );
        })}
      </Menu>
    </div>
  );
}

function Check({ on }: { on: boolean }) {
  return on ? (
    <CheckBoxRoundedIcon sx={{ fontSize: 18, color: "primary.main" }} />
  ) : (
    <CheckBoxOutlineBlankRoundedIcon sx={{ fontSize: 18, color: "text.disabled" }} />
  );
}
