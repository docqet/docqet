import { useState, type ReactNode } from "react";
import CheckBoxOutlineBlankRoundedIcon from "@mui/icons-material/CheckBoxOutlineBlankRounded";
import CheckBoxRoundedIcon from "@mui/icons-material/CheckBoxRounded";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import RadioButtonCheckedRoundedIcon from "@mui/icons-material/RadioButtonCheckedRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import UnfoldMoreRoundedIcon from "@mui/icons-material/UnfoldMoreRounded";
import Menu from "@mui/material/Menu";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import type { Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import type { Product, Project } from "../../state";

/* A project's mark, wherever one is named. */
export function ProjectIcon({ size = 14 }: { size?: number }) {
  return <FolderOutlinedIcon sx={{ fontSize: size, flex: "none", color: "text.secondary" }} />;
}

/* What a filter in the header is: its name, as a button opening its menu, over a quieter line saying more, both cut short if the bar is narrow. */
export const filterSx: SystemStyleObject<Theme> = {
  display: "grid",
  minWidth: 0,
  "& strong": { fontWeight: 600, fontSize: 15, letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
};

/* The quieter line under a filter's name, or an option's. */
export const hintSx: SystemStyleObject<Theme> = { fontSize: 12, color: "text.disabled", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };

/* A filter's name, as the button that opens its menu. */
export const switchSx: SystemStyleObject<Theme> = {
  display: "inline-flex",
  alignItems: "center",
  gap: 0.5,
  justifySelf: "start",
  maxWidth: "calc(100% + 12px)",
  mx: "-6px",
  my: "-2px",
  px: 0.75,
  py: "2px",
  border: 0,
  borderRadius: "5px",
  bgcolor: "transparent",
  color: "inherit",
  font: "inherit",
  cursor: "pointer",
  "&:hover, &[aria-expanded=true]": { bgcolor: "surface.accentSoft" },
  "&:focus-visible": { outline: 2, outlineColor: "primary.main", outlineOffset: 1 },
  "& svg": { color: "text.disabled" },
};

/* Where a filter's menu hangs: just under the filter, at least as wide. */
export const menuSlots = (anchor: HTMLElement | null) => ({ paper: { sx: { mt: 0.75, minWidth: anchor?.offsetWidth } } });

/* A heading over a group of a menu's options. */
export function MenuGroup({ children }: { children: ReactNode }) {
  return (
    <Box component="li" role="presentation" sx={{ px: 1.25, pt: 1.25, pb: 0.5, typography: "overline", color: "text.disabled" }}>
      {children}
    </Box>
  );
}

/* An option in a filter's menu: its name over a line saying more. */
export function Option({ name, hint }: { name: ReactNode; hint: ReactNode }) {
  return (
    <Box component="span" sx={{ display: "grid", flex: 1, minWidth: 0, mr: 1.5 }}>
      <Box component="span" sx={{ fontSize: 13.5, fontWeight: 550, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {name}
      </Box>
      <Box component="span" sx={hintSx}>
        {hint}
      </Box>
    </Box>
  );
}

/* A product to choose in the header. */
export type ProductChoice = Product;

const indexed = (p: Project) => new Date(p.indexedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

/* The commit a project's repository was indexed at, and when. */
function Indexed({ project }: { project: Project }) {
  return (
    <>
      <code>{project.commit}</code> · {indexed(project)}
    </>
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
      <Box sx={filterSx}>
        <strong>{all[0].name}</strong>
        <Box component="span" sx={hintSx}>
          <Indexed project={all[0]} />
        </Box>
      </Box>
    );
  }

  const everything = showing.length === all.length;
  const toggle = (id: string) => onProjects(ids.includes(id) ? ids.filter((x) => x !== id) : all.map((p) => p.id).filter((x) => x === id || ids.includes(x)));

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
        <strong>{product.name}</strong>
        <UnfoldMoreRoundedIcon aria-hidden sx={{ fontSize: 16 }} />
      </Box>
      <Box component="span" sx={hintSx}>
        {all.length === 1 ? (
          <Indexed project={all[0]} />
        ) : everything ? (
          count(all.length)
        ) : showing.length === 1 ? (
          `${showing[0].name} · 1 of ${all.length}`
        ) : (
          `${showing.length} of ${count(all.length)}`
        )}
      </Box>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        slotProps={menuSlots(anchor)}
      >
        {products.length > 1 ? <MenuGroup>Products</MenuGroup> : null}
        {products.length > 1
          ? products.map((p) => {
              const on = p.id === product.id;
              return (
                <MenuItem
                  key={p.id}

                  role="menuitemradio"
                  aria-checked={on}
                  selected={on}
                  onClick={() => (on ? null : onProduct(p.id))}
                >
                  {on ? (
                    <RadioButtonCheckedRoundedIcon aria-hidden sx={{ fontSize: 18, flex: "none", color: "primary.main" }} />
                  ) : (
                    <RadioButtonUncheckedRoundedIcon aria-hidden sx={{ fontSize: 18, flex: "none", color: "text.disabled" }} />
                  )}
                  <Option name={p.name} hint={count(p.projects.length)} />
                </MenuItem>
              );
            })
          : null}
        <MenuGroup>{products.length > 1 ? `Projects in ${product.name}` : "Projects"}</MenuGroup>
        {all.length > 1 ? (
          <MenuItem onClick={() => onProjects(all.map((p) => p.id))}>
            <Check on={everything} />
            <Option name="All projects" hint={count(all.length)} />
          </MenuItem>
        ) : null}
        {all.map((p) => {
          const on = ids.includes(p.id);
          return (
            <MenuItem
              key={p.id}

              role="menuitemcheckbox"
              aria-checked={on}
              disabled={on && showing.length === 1}
              /* The last project showing can't be unticked, but it still reads as a project. */
              sx={{ "&.Mui-disabled": { opacity: 1 } }}
              onClick={() => toggle(p.id)}
            >
              <Check on={on} />
              <Option name={p.name} hint={<Indexed project={p} />} />
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );
}

function Check({ on }: { on: boolean }) {
  return on ? (
    <CheckBoxRoundedIcon aria-hidden sx={{ fontSize: 18, flex: "none", color: "primary.main" }} />
  ) : (
    <CheckBoxOutlineBlankRoundedIcon aria-hidden sx={{ fontSize: 18, flex: "none", color: "text.disabled" }} />
  );
}
