import { CapabilityStability } from "../design/catalog/CapabilityLabel";
import type { ReactNode } from "react";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import ExtensionOutlinedIcon from "@mui/icons-material/ExtensionOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import { ConceptIcon } from "../Concepts";
import { DomainIcon } from "../FeatureMap";
import { PersonaAvatar, PersonaIcon } from "../Personas";
import { GapIcon, LEFT_KINDS, LeftMark, type LeftKind } from "../design/left/LeftMark";
import { Tip } from "../design/Tip";
import { docHref, type DocKind } from "../routes";
import { bareId, type CapabilityLevel, type Gap, type Persona, type RiskAcross } from "../state";
import { RiskScore } from "../design/risk/RiskScore";
import "./index.css";

/* The pieces the index pages share: each kind's mark, counts of what's left, a level, personas, and a filter box. */

/* Each kind's mark, small, the same as everywhere else it's named. */
export function KindIcon({ kind, size = 15 }: { kind: DocKind; size?: number }) {
  switch (kind) {
    case "domain":
      return <DomainIcon size={size} />;
    case "feature":
      return <WidgetsOutlinedIcon sx={{ fontSize: size, flex: "none", color: "secondary.main" }} />;
    case "capability":
      return <BoltOutlinedIcon sx={{ fontSize: size, flex: "none", color: "primary.main" }} />;
    case "concept":
      return <ConceptIcon size={size} />;
    case "persona":
      return <PersonaIcon size={size} />;
    case "rule":
      return <RuleRoundedIcon sx={{ fontSize: size, flex: "none", color: "text.secondary" }} />;
    case "mechanism":
      return <HubOutlinedIcon sx={{ fontSize: size, flex: "none", color: "text.secondary" }} />;
    case "component":
      return <ExtensionOutlinedIcon sx={{ fontSize: size, flex: "none", color: "text.secondary" }} />;
    case "gap":
      return <GapIcon sx={{ fontSize: size, flex: "none", color: "text.secondary" }} />;
  }
}

/* A doc's name as a link to its page, with its kind's mark before it. */
export function DocLink({ kind, id, name, icon = true }: { kind: DocKind; id: string; name: ReactNode; icon?: boolean }) {
  return (
    <a className="ix-doc" href={docHref(kind, id)}>
      {icon ? <KindIcon kind={kind} /> : null}
      <span className="ix-doc-name">{name}</span>
    </a>
  );
}

/* How many of one kind of what's left, as its mark and the number, naming it on hover. Nothing with none. */
export function MiniCount({ kind, n }: { kind: LeftKind; n: number }) {
  if (!n) return null;
  return (
    <Tip title={`${n} ${(n === 1 ? LEFT_KINDS[kind].one : LEFT_KINDS[kind].many).toLowerCase()}`}>
      <span className="ix-mini">
        <LeftMark kind={kind} size={13} decorative />
        {n}
      </span>
    </Tip>
  );
}

/*
 * Gaps in short: how many, with the highest risk among them, worked out by
 * whoever passes it, whose popover says how the rest spread. `of` names what
 * they're in, for the popover. "None" when there are none. Open decisions,
 * when given, count beside them.
 */
export function GapsCell({
  gaps,
  risk,
  kind,
  of,
  decisions = 0,
  href,
}: {
  gaps: Gap[];
  risk: RiskAcross<Gap>;
  kind: "product-gap" | "technical-gap";
  of: string;
  decisions?: number;
  href?: string;
}) {
  if (!gaps.length && !decisions) return <span className="ix-none">None</span>;
  const counts = (
    <>
      <MiniCount kind={kind} n={gaps.length} />
      <MiniCount kind="decision" n={decisions} />
    </>
  );
  return (
    <span className="ix-gaps">
      {href ? <a className="ix-gaps-link" href={href}>{counts}</a> : counts}
      {gaps.length ? <RiskScore risk={risk} of={of} /> : null}
    </span>
  );
}

/* A capability's level in a list: just its mark, whose popover says what the level means; a draft is the word Draft. */
export function LevelMark({ name, level }: { name: string; level: CapabilityLevel }) {
  return <CapabilityStability level={level} name={name} />;
}

/* The personas something serves, as a row of small pictures, each linking to their page; past `max`, how many more. */
export function PersonaFaces({ personas, max = 4 }: { personas: Persona[]; max?: number }) {
  if (!personas.length) return <span className="ix-none">No one yet</span>;
  const shown = personas.slice(0, max);
  return (
    <span className="ix-faces">
      {shown.map((p) => (
        <Tip key={p.id} title={p.name}>
          <a href={docHref("persona", p.id)} aria-label={p.name}>
            <PersonaAvatar persona={p} size={22} />
          </a>
        </Tip>
      ))}
      {personas.length > max ? <span className="ix-faces-more">+{personas.length - max}</span> : null}
    </span>
  );
}

/* A box to narrow a long list by typing. */
export function FilterBox({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="ix-filter">
      <SearchRoundedIcon sx={{ fontSize: 17, color: "text.secondary" }} />
      <input type="search" value={value} placeholder={placeholder} aria-label={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

/* Whether a doc matches what's typed: its name, its ID without its domain, or `more`, such as its description. */
export const matches = (query: string, doc: { id: string; name: string }, more = "") => {
  const q = query.trim().toLowerCase();
  return !q || `${doc.name} ${bareId(doc.id)} ${more}`.toLowerCase().includes(q);
};

/* A plain number, faint at zero. */
export function Num({ n, children }: { n: number; children?: ReactNode }) {
  return <span className={n ? undefined : "ix-none"}>{children ?? n}</span>;
}

/* By name, A to Z. */
export const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);
