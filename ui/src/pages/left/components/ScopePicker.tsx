import { useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import Popover from "@mui/material/Popover";
import { NAMES } from "../../../components/names";
import { DomainIcon } from "../../../FeatureMap";
import { InitiativeIcon } from "../../../components/shell/ScopeFilter";
import { withParam } from "../../../routes";
import type { DocketState } from "../../../state";
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

export function ScopePicker({ state, scope }: { state: DocketState; scope: Scope }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<ScopeKind | "any">("any");
  const list = useRef<HTMLUListElement>(null);
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
      <button type="button" className="lf-scope" onClick={(e) => setAnchor(e.currentTarget)} aria-haspopup="dialog">
        <span className="lf-scope-label">For</span>
        <KindIcon kind={scope.kind} />
        <span className="lf-scope-name">{scope.name}</span>
        <ExpandMoreRoundedIcon sx={{ fontSize: 18 }} />
      </button>
      <Popover
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { className: "sp-panel" } }}
      >
        <div className="sp-search">
          <SearchRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKey}
            placeholder="Find a project, persona, domain, feature or capability"
            aria-label="Find what it's for"
          />
        </div>
        <div className="sp-kinds" role="tablist">
          {KINDS.map((k) => (
            <button key={k.kind} type="button" role="tab" aria-selected={kind === k.kind} onClick={() => setKind(k.kind)}>
              {k.name}
              <span>{counts(k.kind)}</span>
            </button>
          ))}
        </div>
        <ul className="sp-list" ref={list} onKeyDown={onListKey}>
          {groups.map((g) => (
            <li key={g.kind} className="sp-group">
              {g.kind !== "all" && kind === "any" ? <div className="sp-group-head">{KINDS.find((k) => k.kind === g.kind)?.name}</div> : null}
              <ul>
                {g.items.map((c) => (
                  <li key={c.key}>
                    <Choice choice={c} current={c.key === scope.key} showKind={!!q && kind === "any"} />
                  </li>
                ))}
              </ul>
              {g.more ? (
                <button type="button" className="sp-more" onClick={() => setKind(g.kind)}>
                  {g.more} more
                </button>
              ) : null}
            </li>
          ))}
          {!matching.length ? <li className="sp-none">Nothing matches.</li> : null}
        </ul>
      </Popover>
    </>
  );
}

function Choice({ choice: c, current, showKind }: { choice: ScopeChoice; current: boolean; showKind: boolean }): ReactNode {
  return (
    <a className="sp-item" href={withParam("for", c.kind === "all" ? null : c.key)} aria-current={current || undefined}>
      <KindIcon kind={c.kind} />
      <span className="sp-item-text">
        <span className="sp-item-name">{c.name}</span>
        {c.note ? <span className="sp-item-note">{c.note}</span> : null}
      </span>
      {showKind && c.kind !== "all" ? <span className="sp-item-kind">{ONE[c.kind]}</span> : null}
    </a>
  );
}
