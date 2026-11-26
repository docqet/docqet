import { useState } from "react";
import CheckBoxOutlineBlankRoundedIcon from "@mui/icons-material/CheckBoxOutlineBlankRounded";
import CheckBoxRoundedIcon from "@mui/icons-material/CheckBoxRounded";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import RadioButtonCheckedRoundedIcon from "@mui/icons-material/RadioButtonCheckedRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import UnfoldMoreRoundedIcon from "@mui/icons-material/UnfoldMoreRounded";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import type { Product, Project } from "../../state";

/* A project's mark, wherever one is named. */
export function ProjectIcon({ size = 14 }: { size?: number }) {
  return <FolderOutlinedIcon sx={{ fontSize: size, flex: "none", color: "text.secondary" }} />;
}

/* A product to choose in the header. */
export type ProductChoice = Product;

const indexed = (p: Project) => new Date(p.indexedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

/* The commit a project's repository was indexed at, and when. */
function Indexed({ project }: { project: Project }) {
  return (
    <span className="faint">
      <code>{project.commit}</code> · {indexed(project)}
    </span>
  );
}

const count = (n: number) => `${n} project${n === 1 ? "" : "s"}`;

/*
 * Which product the page shows, and which of its projects, in the header.
 * With one product of one project there is nothing to choose, so it's just
 * the project's name and the commit it was indexed at. Otherwise it names the
 * product and which of its projects are showing, and opens a list: every
 * product to switch to, when there's more than one, then the product's
 * projects to tick, each with its commit. Switching product
 * shows all its projects and keeps the list open, so some can be unticked
 * straight away. At least one project stays ticked.
 */
export default function ProductFilter({
  showing,
  product,
  products,
  onProduct,
  onProjects,
}: {
  showing: Project[];
  product: Product;
  products: ProductChoice[];
  onProduct: (id: string) => void;
  onProjects: (ids: string[]) => void;
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const all = product.projects;
  const ids = showing.map((p) => p.id);

  if (products.length < 2 && all.length < 2) {
    return (
      <div className="project">
        <strong>{all[0].name}</strong>
        <Indexed project={all[0]} />
      </div>
    );
  }

  const everything = showing.length === all.length;
  const toggle = (id: string) => onProjects(ids.includes(id) ? ids.filter((x) => x !== id) : all.map((p) => p.id).filter((x) => x === id || ids.includes(x)));

  return (
    <div className="project">
      <button
        type="button"
        className="project-switch"
        aria-haspopup="menu"
        aria-expanded={anchor ? true : undefined}
        onClick={(e) => setAnchor(e.currentTarget.closest<HTMLElement>(".project"))}
      >
        <strong>{product.name}</strong>
        <UnfoldMoreRoundedIcon aria-hidden sx={{ fontSize: 16 }} />
      </button>
      {all.length === 1 ? (
        <Indexed project={all[0]} />
      ) : (
        <span className="faint">
          {everything ? count(all.length) : showing.length === 1 ? `${showing[0].name} · 1 of ${all.length}` : `${showing.length} of ${count(all.length)}`}
        </span>
      )}
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        slotProps={{
          paper: { className: "project-menu", sx: { minWidth: anchor?.offsetWidth } },
          list: { className: "project-menu-list" },
        }}
      >
        {products.length > 1 ? (
          <li className="project-menu-group" role="presentation">
            Products
          </li>
        ) : null}
        {products.length > 1
          ? products.map((p) => {
              const on = p.id === product.id;
              return (
                <MenuItem
                  key={p.id}
                  className="project-menu-item"
                  role="menuitemradio"
                  aria-checked={on}
                  selected={on}
                  onClick={() => (on ? null : onProduct(p.id))}
                >
                  {on ? (
                    <RadioButtonCheckedRoundedIcon aria-hidden sx={{ fontSize: 18, flex: "none", color: "var(--accent)" }} />
                  ) : (
                    <RadioButtonUncheckedRoundedIcon aria-hidden sx={{ fontSize: 18, flex: "none", color: "var(--faint)" }} />
                  )}
                  <span className="project-option">
                    <span className="project-option-name">{p.name}</span>
                    <span className="faint">{count(p.projects.length)}</span>
                  </span>
                </MenuItem>
              );
            })
          : null}
        <li className="project-menu-group" role="presentation">
          {products.length > 1 ? `Projects in ${product.name}` : "Projects"}
        </li>
        {all.length > 1 ? (
          <MenuItem className="project-menu-item" onClick={() => onProjects(all.map((p) => p.id))}>
            <Check on={everything} />
            <span className="project-option">
              <span className="project-option-name">All projects</span>
              <span className="faint">{count(all.length)}</span>
            </span>
          </MenuItem>
        ) : null}
        {all.map((p) => {
          const on = ids.includes(p.id);
          return (
            <MenuItem
              key={p.id}
              className="project-menu-item"
              role="menuitemcheckbox"
              aria-checked={on}
              disabled={on && showing.length === 1}
              onClick={() => toggle(p.id)}
            >
              <Check on={on} />
              <span className="project-option">
                <span className="project-option-name">{p.name}</span>
                <Indexed project={p} />
              </span>
            </MenuItem>
          );
        })}
      </Menu>
    </div>
  );
}

function Check({ on }: { on: boolean }) {
  return on ? (
    <CheckBoxRoundedIcon aria-hidden sx={{ fontSize: 18, flex: "none", color: "var(--accent)" }} />
  ) : (
    <CheckBoxOutlineBlankRoundedIcon aria-hidden sx={{ fontSize: 18, flex: "none", color: "var(--faint)" }} />
  );
}
