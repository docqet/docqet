import { useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import Box from "@mui/material/Box";
import Popover from "@mui/material/Popover";
import type { Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import { NAMES } from "../../../components/names";
import { DomainIcon } from "../../../components/names";
import { InitiativeIcon } from "../../../components/shell/ScopeFilter";
import { withParam } from "../../../routes";
import type { DocqetState } from "../../../state";
import { scopeChoices, type Scope, type ScopeChoice, type ScopeKind } from "./leftScope";

/*
 * What the page is for, chosen at the top right: a button naming it, opening
 * a picker with a search box, a tab for each kind with how many there are,
 * and the list, each with its icon, name and what says which one it is, such
 * as a persona's role. Searching looks across every kind. Choosing one keeps
 * the filters and order.
 */

const KINDS: { kind: ScopeKind | "any"; name: string }[] = [
  { kind: "any", name: "All" },
  { kind: "project", name: "Projects" },
  { kind: "persona", name: "Personas" },
  { kind: "initiative", name: "Initiatives" },
  { kind: "domain", name: "Domains" },
  { kind: "feature", name: "Features" },
  { kind: "capability", name: "Capabilities" },
];

const ONE: Record<ScopeKind, string> = {
  all: "",
  project: "Project",
  persona: "Persona",
  initiative: "Initiative",
  domain: "Domain",
  feature: "Feature",
  capability: "Capability",
};

/* With no search and every kind, each kind shows its first few, with how many more under the kind's tab. */
const FEW = 4;

function KindIcon({ kind }: { kind: ScopeKind }) {
  if (kind === "all") return <LayersOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />;
  if (kind === "project") return <FolderOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />;
  if (kind === "domain") return <DomainIcon size={18} />;
  if (kind === "initiative") return <InitiativeIcon size={18} />;
  return <>{NAMES[kind].icon}</>;
}

export function ScopePicker({ state, scope }: { state: DocqetState; scope: Scope }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<ScopeKind | "any">("any");
  const list = useRef<HTMLUListElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const choices = useMemo(() => scopeChoices(state), [state]);
  const counts = (k: ScopeKind | "any") => (k === "any" ? choices.length - 1 : choices.filter((c) => c.kind === k).length);
  const q = query.trim().toLowerCase();
  const matching = choices.filter(
    (c) => (kind === "any" || c.kind === kind || c.kind === "all") && (!q || `${c.name} ${c.note ?? ""}`.toLowerCase().includes(q)),
  );
  const close = () => {
    setAnchor(null);
    setQuery("");
  };
  /* Enter goes to the first match; the arrows move into the list. */
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      const first = list.current?.querySelector<HTMLAnchorElement>("a");
      if (first) window.location.href = first.href;
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      list.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    }
  };
  const onListKey = (e: KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const links = [...(list.current?.querySelectorAll<HTMLAnchorElement>("a") ?? [])];
    const at = links.indexOf(document.activeElement as HTMLAnchorElement);
    links[Math.min(Math.max(at + (e.key === "ArrowDown" ? 1 : -1), 0), links.length - 1)]?.focus();
  };

  /* With no search under All, each kind's first few under its name, with the rest a tab away; otherwise every match. */
  const groups: { kind: ScopeKind; items: ScopeChoice[]; more: number }[] = [];
  for (const c of matching) {
    const last = groups[groups.length - 1];
    if (last?.kind === c.kind) {
      if (!q && kind === "any" && last.items.length >= FEW) last.more++;
      else last.items.push(c);
    } else groups.push({ kind: c.kind, items: [c], more: 0 });
  }

  return (
    <>
      <Box
        component="button"
        type="button"
        onClick={(e) => setAnchor(e.currentTarget)}
        aria-haspopup="dialog"
        aria-expanded={anchor ? true : undefined}
        sx={triggerSx}
      >
        <Box component="span" sx={{ typography: "overline", color: "text.disabled" }}>
          For
        </Box>
        <KindIcon kind={scope.kind} />
        <Box
          component="span"
          sx={{
            flex: { xs: 1, sm: "none" },
            minWidth: 0,
            overflow: "hidden",
            fontWeight: 650,
            textAlign: "left",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {scope.name}
        </Box>
        <ExpandMoreRoundedIcon aria-hidden sx={{ fontSize: 18 }} />
      </Box>
      <Popover
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        /* The search box takes focus, not the picker around it, so typing searches straight away. */
        disableAutoFocus
        slotProps={{ paper: { sx: panelSx }, transition: { onEntering: () => input.current?.focus() } }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 1.5, py: 1.25, borderBottom: 1, borderColor: "divider" }}>
          <SearchRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
          <Box
            component="input"
            ref={input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
            placeholder="Find a project, persona, domain, feature or capability"
            aria-label="Find what it's for"
            sx={{
              flex: 1,
              minWidth: 0,
              font: "inherit",
              fontSize: 14,
              color: "text.primary",
              bgcolor: "transparent",
              border: 0,
              outline: "none",
              "&::placeholder": { color: "text.disabled", opacity: 1 },
            }}
          />
        </Box>
        <Box role="tablist" sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, px: 1.25, py: 1, borderBottom: 1, borderColor: "divider" }}>
          {KINDS.map((k) => (
            <Box component="button" key={k.kind} type="button" role="tab" aria-selected={kind === k.kind} onClick={() => setKind(k.kind)} sx={kindSx}>
              {k.name}
              <span>{counts(k.kind)}</span>
            </Box>
          ))}
        </Box>
        {/* How many match, said aloud as the search changes. */}
        <Box component="span" aria-live="polite" sx={visuallyHidden}>
          {q ? (matching.length ? `${matching.length} ${matching.length === 1 ? "match" : "matches"}` : "Nothing matches") : ""}
        </Box>
        <Box component="ul" ref={list} onKeyDown={onListKey} sx={{ maxHeight: "min(420px, 60vh)", p: 0.75, overflowY: "auto" }}>
          {groups.map((g) => (
            <Box component="li" key={g.kind} sx={{ "& + &": { mt: 0.5 } }}>
              {g.kind !== "all" && kind === "any" ? (
                <Box sx={{ px: 1, pt: 1, pb: 0.5, typography: "overline", color: "text.disabled" }}>{KINDS.find((k) => k.kind === g.kind)?.name}</Box>
              ) : null}
              <ul>
                {g.items.map((c) => (
                  <li key={c.key}>
                    <Choice choice={c} current={c.key === scope.key} showKind={!!q && kind === "any"} />
                  </li>
                ))}
              </ul>
              {g.more ? (
                <Box
                  component="button"
                  type="button"
                  onClick={() => setKind(g.kind)}
                  sx={{
                    mt: "2px",
                    ml: "36px",
                    py: "2px",
                    px: 0,
                    font: "inherit",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "primary.main",
                    bgcolor: "transparent",
                    border: 0,
                    cursor: "pointer",
                  }}
                >
                  {g.more} more
                </Box>
              ) : null}
            </Box>
          ))}
          {!matching.length ? (
            <Box component="li" sx={{ px: 1, py: 2, fontSize: 13, color: "text.disabled" }}>
              Nothing matches.
            </Box>
          ) : null}
        </Box>
      </Popover>
    </>
  );
}

function Choice({ choice: c, current, showKind }: { choice: ScopeChoice; current: boolean; showKind: boolean }): ReactNode {
  return (
    <Box component="a" href={withParam("for", c.kind === "all" ? null : c.key)} aria-current={current || undefined} sx={itemSx}>
      <KindIcon kind={c.kind} />
      <Box component="span" sx={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
        <Box component="span" sx={{ fontSize: 13.5, fontWeight: 600, ...clip }}>
          {c.name}
        </Box>
        {c.note ? (
          <Box component="span" sx={{ fontSize: 12, color: "text.secondary", ...clip }}>
            {c.note}
          </Box>
        ) : null}
      </Box>
      {showKind && c.kind !== "all" ? (
        <Box component="span" sx={{ flex: "none", fontSize: 11, color: "text.disabled" }}>
          {ONE[c.kind]}
        </Box>
      ) : null}
    </Box>
  );
}

/* What's only for screen readers, such as a count said aloud. The page's gap count uses it too. */
export const visuallyHidden: SystemStyleObject<Theme> = {
  position: "absolute",
  width: "1px",
  height: "1px",
  p: 0,
  m: "-1px",
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
};

/* One line, cut short. */
const clip: SystemStyleObject<Theme> = { overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" };

/* The button naming what it's for; on a phone, the width of the page. */
const triggerSx: SystemStyleObject<Theme> = {
  display: "inline-flex",
  alignItems: "center",
  gap: 1,
  width: { xs: "100%", sm: "auto" },
  maxWidth: { sm: 320 },
  py: "6px",
  pr: 1.25,
  pl: 1.5,
  font: "inherit",
  fontSize: 13.5,
  color: "text.primary",
  bgcolor: "transparent",
  border: 1,
  borderColor: "surface.borderStrong",
  borderRadius: "8px",
  cursor: "pointer",
  "&:hover": { borderColor: "text.disabled" },
};

/* The picker: 440px across, or the width of a phone's screen less its margins. */
const panelSx: SystemStyleObject<Theme> = {
  width: 440,
  maxWidth: "calc(100vw - 32px)",
  mt: 0.75,
  color: "text.primary",
  bgcolor: "background.paper",
  backgroundImage: "none",
  border: 1,
  borderColor: "surface.borderStrong",
  borderRadius: "10px",
  boxShadow: 8,
};

/* A kind's tab, with how many there are, lit in the accent while chosen. */
const kindSx: SystemStyleObject<Theme> = {
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
  py: "3px",
  px: 1,
  font: "inherit",
  fontSize: 12,
  fontWeight: 600,
  color: "text.secondary",
  bgcolor: "transparent",
  border: "1px solid transparent",
  borderRadius: "6px",
  cursor: "pointer",
  "&:hover": { color: "text.primary" },
  "& > span": { fontSize: 11, fontVariantNumeric: "tabular-nums", color: "text.disabled" },
  "&[aria-selected=true]": {
    color: "primary.main",
    bgcolor: "surface.accentSoft",
    borderColor: (t) => `color-mix(in srgb, ${t.vars.palette.primary.main} 45%, transparent)`,
  },
};

/* A choice: its icon, its name over what says which one it is, lit under the pointer or focus, and in the accent's soft fill when it's the current one. */
const itemSx: SystemStyleObject<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.25,
  px: 1,
  py: 0.75,
  color: "text.primary",
  textDecoration: "none",
  borderRadius: "6px",
  outline: "none",
  "&:hover, &:focus-visible": { bgcolor: (t) => `color-mix(in srgb, ${t.vars.palette.text.primary} 6%, transparent)` },
  "&[aria-current]": { bgcolor: "surface.accentSoft" },
};
