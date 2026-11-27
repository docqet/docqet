import { CapabilityStability } from "./CapabilityLabel";
import type { ChangeEvent, ReactNode } from "react";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import ExtensionOutlinedIcon from "@mui/icons-material/ExtensionOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import { ConceptIcon } from "./Concepts";
import { ConstraintIcon, AreaIcon, ProblemIcon } from "./names";
import { PersonaAvatar, PersonaIcon } from "./Personas";
import { InitiativeIcon } from "./shell/ScopeFilter";
import { GapIcon, LEFT_KINDS, LeftMark, type LeftKind } from "./left/LeftMark";
import Tooltip from "@mui/material/Tooltip";
import { docHref, type DocKind } from "../routes";
import { type CapabilityLevel, type Exposure, type Gap, type Level, type Persona, type RiskAcross } from "../state";
import { ExposureMark, RiskScore } from "./risk/RiskScore";
import { Stat } from "./shell/layout";
import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import { MaturityRing } from "./maturity/MaturityRing";
import { fromCapabilities, type MaturitySubject } from "./popovers/MaturityDetails";
import { MATURITY_BANDS } from "./maturity/maturity";
import { levelColor } from "./stability/stability";

/* The pieces the index pages share: each kind's mark, counts of what's open, a level, personas, and a filter box. */

/* What's faint: none of something, or nothing yet. */
export const faintSx: SystemStyleObject<Theme> = { color: "text.disabled" };

/* Text on one line, cut short with an ellipsis when there isn't room. */
export const ellipsisSx: SystemStyleObject<Theme> = { minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };

/* A note beside or under a name, such as where something is: smaller, muted, and not bold even in a bold row. */
export const whereSx: SystemStyleObject<Theme> = { color: "text.secondary", fontSize: 12.5, fontWeight: 400 };

/* A number's cell, and its heading, which right-align (align="right") and never wrap. */
export const numSx: SystemStyleObject<Theme> = { whiteSpace: "nowrap" };

/* A table column a phone has no room for: its heading and cells show from sm up. */
export const wideOnlySx: SystemStyleObject<Theme> = { display: { xs: "none", sm: "table-cell" } };

/* Read out but not shown, such as how many a filter leaves. */
export const visuallyHiddenSx: SystemStyleObject<Theme> = {
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

/* A row's name as a link to its page: a picture or mark, then the name over a line saying more, such as a persona's role. A long name, such as a problem's, can `wrap` rather than be cut short. */
export function NameLink({ href, mark, name, note, wrap = false }: { href: string; mark: ReactNode; name: ReactNode; note?: ReactNode; wrap?: boolean }) {
  return (
    <Box component="a" href={href} sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
      {mark}
      <Box component="span" sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Box component="span" sx={wrap ? { minWidth: 0 } : ellipsisSx}>
          {name}
        </Box>
        {note ? (
          <Box component="span" sx={whereSx}>
            {note}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}

/* Each kind's mark, small, the same as everywhere else it's named. */
export function KindIcon({ kind, size = 15 }: { kind: DocKind; size?: number }) {
  switch (kind) {
    case "area":
      return <AreaIcon size={size} />;
    case "feature":
      return <WidgetsOutlinedIcon sx={{ fontSize: size, flex: "none", color: "secondary.main" }} />;
    case "capability":
      return <BoltOutlinedIcon sx={{ fontSize: size, flex: "none", color: "primary.main" }} />;
    case "concept":
      return <ConceptIcon size={size} />;
    case "persona":
      return <PersonaIcon size={size} />;
    case "problem":
      return <ProblemIcon size={size} />;
    case "constraint":
      return <ConstraintIcon size={size} />;
    case "initiative":
      return <InitiativeIcon size={size} />;
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

/* A doc's name as a link to its page, with its kind's mark before it. `sx` adds to its look where it sits. */
export function DocLink({ kind, id, name, icon = true, sx }: { kind: DocKind; id: string; name: ReactNode; icon?: boolean; sx?: SystemStyleObject<Theme> }) {
  return (
    <Box
      component="a"
      href={docHref(kind, id)}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        minWidth: 0,
        color: "text.primary",
        fontWeight: 600,
        textDecoration: "none",
        "&:hover": { color: "primary.main" },
        ...sx,
      }}
    >
      {icon ? <KindIcon kind={kind} /> : null}
      <Box component="span" sx={ellipsisSx}>
        {name}
      </Box>
    </Box>
  );
}

/*
 * How many of one kind of what's open, as its mark and the number, naming it
 * on hover. "gap" is gaps of both kinds, product and technical, which share a
 * mark. Nothing with none.
 */
export function MiniCount({ kind, n }: { kind: LeftKind | "gap"; n: number }) {
  if (!n) return null;
  const name = kind === "gap" ? (n === 1 ? "gap" : "gaps") : (n === 1 ? LEFT_KINDS[kind].one : LEFT_KINDS[kind].many).toLowerCase();
  return (
    <Tooltip title={`${n} ${name}`}>
      <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontVariantNumeric: "tabular-nums", color: "text.secondary" }}>
        <LeftMark kind={kind === "gap" ? "product-gap" : kind} size={13} decorative />
        {n}
      </Box>
    </Tooltip>
  );
}

/*
 * Gaps in short: how many, with the highest risk among them when `risk` is
 * given, worked out by whoever passes it, whose popover says how the rest
 * spread. `of` names what they're in, for the popover. "None" when there are
 * none. Open decisions, when given, count beside them.
 */
export function GapsCell({
  gaps,
  risk,
  exposure,
  kind,
  of,
  decisions = 0,
  href,
}: {
  gaps: Gap[];
  /* How the gaps spread across the verdicts, for gaps on no capabilities, such as a component's. */
  risk?: RiskAcross<Gap>;
  /* The capabilities they're on, to show their exposure instead, as aggregated risk is everywhere, with the server's figures for them when they're a doc's. */
  exposure?: { exposure: Exposure; risk: RiskAcross<Gap> };
  /* Which gaps they are: product, technical, or "gap" for both. */
  kind: "product-gap" | "technical-gap" | "gap";
  of?: string;
  decisions?: number;
  href?: string;
}) {
  if (!gaps.length && !decisions)
    return (
      <Box component="span" sx={faintSx}>
        None
      </Box>
    );
  const counts = (
    <>
      <MiniCount kind={kind} n={gaps.length} />
      <MiniCount kind="decision" n={decisions} />
    </>
  );
  return (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1.25, whiteSpace: "nowrap" }}>
      {href ? (
        /* The counts link to where the page lists them. */
        <Box
          component="a"
          href={href}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: "inherit",
            textDecoration: "none",
            /* Doubled, so it reads as the counts it holds even in a table cell, whose links are bold. */
            "&&": { color: "inherit", fontWeight: "inherit", "&:hover": { color: "primary.main" } },
          }}
        >
          {counts}
        </Box>
      ) : (
        counts
      )}
      {gaps.length && exposure ? (
        <ExposureMark exposure={exposure.exposure} risk={exposure.risk} of={of ?? "these"} />
      ) : gaps.length && risk ? (
        <RiskScore risk={risk} of={of ?? "these"} />
      ) : null}
    </Box>
  );
}

/* A capability's level in a list: just its mark, whose popover says what the level means; a draft is the word Draft. */
export function LevelMark({ name, level }: { name: string; level: CapabilityLevel }) {
  return <CapabilityStability level={level} name={name} />;
}

/* The personas something serves, as a row of small, overlapping pictures, each linking to their page; past `max`, how many more. */
export function PersonaFaces({ personas, max = 4 }: { personas: Persona[]; max?: number }) {
  if (!personas.length)
    return (
      <Box component="span" sx={faintSx}>
        No one yet
      </Box>
    );
  const shown = personas.slice(0, max);
  return (
    <Box component="span" sx={{ display: "inline-flex", alignItems: "center" }}>
      {shown.map((p, i) => (
        <Tooltip key={p.id} title={p.name}>
          <Box
            component="a"
            href={docHref("persona", p.id)}
            aria-label={p.name}
            sx={{
              display: "inline-flex",
              ml: i ? "-5px" : 0,
              borderRadius: "50%",
              /* A ring in the page's color, so overlapping pictures stay apart; in the accent under the pointer. */
              boxShadow: (t) => `0 0 0 2px ${t.vars.palette.background.default}`,
              "&:hover": { position: "relative", boxShadow: (t) => `0 0 0 2px ${t.vars.palette.primary.main}` },
            }}
          >
            <PersonaAvatar persona={p} size={22} />
          </Box>
        </Tooltip>
      ))}
      {personas.length > max ? (
        <Box component="span" sx={{ ml: 0.75, fontSize: 12, color: "text.secondary" }}>
          +{personas.length - max}
        </Box>
      ) : null}
    </Box>
  );
}

/* A box to narrow a long list by typing. */
export function FilterBox({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <Box
      component="label"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        width: "min(360px, 100%)",
        py: 0.75,
        px: 1.25,
        border: 1,
        borderColor: "surface.borderStrong",
        borderRadius: "8px",
        bgcolor: "background.paper",
        /* The box's border is the input's focus ring. */
        "&:focus-within": { borderColor: "primary.main" },
      }}
    >
      <SearchRoundedIcon sx={{ fontSize: 17, color: "text.secondary" }} />
      <Box
        component="input"
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        sx={{ flex: 1, minWidth: 0, border: 0, outline: 0, bgcolor: "transparent", color: "text.primary", font: "inherit", fontSize: 13.5 }}
      />
    </Box>
  );
}

/* Whether a doc matches what's typed: its name, its ID, or `more`, such as its description. */
export const matches = (query: string, doc: { id: string; name: string }, more = "") => {
  const q = query.trim().toLowerCase();
  return !q || `${doc.name} ${doc.id} ${more}`.toLowerCase().includes(q);
};

/* A plain number, faint at zero. */
export function Num({ n, children }: { n: number; children?: ReactNode }) {
  return (
    <Box component="span" sx={n ? undefined : faintSx}>
      {children ?? n}
    </Box>
  );
}

/* By name, A to Z. */
export const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);

/*
 * A maturity as a figure in a page's header: its ring and band, opening how
 * what it's worked out from spreads across the levels (or bands) and how
 * it's worked out. It's how aggregated stability shows on every page, as
 * ExposureStat is for aggregated risk and ReadinessMark for readiness: in a
 * card, never beside the page's title. `count` is how many capabilities (or,
 * for an area or project, features) it's from; `of` names what it's of.
 */
export function MaturityStat({
  maturity,
  subject,
  count,
  spread,
  of,
  href,
  band,
}: {
  maturity: number | null;
  /* Its band, as the server gives it with the maturity. */
  band: Level | null;
  subject: MaturitySubject;
  count: number;
  spread: CapabilityLevel[];
  of: string;
  href?: string;
}) {
  const across = fromCapabilities(subject) ? (count === 1 ? "1 capability" : `${count} capabilities`) : count === 1 ? "1 feature" : `${count} features`;
  if (maturity === null || band === null)
    return (
      <Stat
        label="Maturity"
        term="maturity"
        value={
          <Box component="span" sx={faintSx}>
            None yet
          </Box>
        }
        note="Nothing has a level yet"
        href={href}
      />
    );
  return (
    <Stat
      label="Maturity"
      term="maturity"
      value={
        /* Stat lays out .stat-maturity as it does the other figures: ring, percentage, then the band. */
        <Box component="span" className="stat-maturity" sx={levelColor(band)}>
          <MaturityRing progress={maturity} subject={subject} count={count} size={22} focusable={!href} label={`Maturity of ${of}`} spread={spread} />
          <strong>{MATURITY_BANDS[band]}</strong>
        </Box>
      }
      note={`Across ${across}`}
      href={href}
    />
  );
}

/*
 * The exposure of some capabilities, as a figure in a page's header: its
 * ring and band, opening the spread of their gaps by risk and how it's
 * worked out. It's how aggregated risk shows in every header, as maturity is
 * how aggregated stability does. `of` names what it's of, as a phrase.
 */
export function ExposureStat({
  of,
  exposure,
  risk,
}: {
  of: string;
  /* Some capabilities' exposure and the risk across their gaps, as the server works them out. */
  exposure: Exposure;
  risk: RiskAcross<Gap>;
}) {
  const atRisk = exposure.percent !== null && risk.items.length > 0;
  return (
    <Stat
      label="Exposure"
      term="exposure"
      value={atRisk ? <ExposureMark exposure={exposure} risk={risk} of={of} named /> : "None"}
      tone={atRisk ? undefined : "ok"}
      note={
        exposure.percent === null
          ? "Nothing started yet"
          : atRisk
            ? `Across ${exposure.capabilities === 1 ? "1 capability" : `${exposure.capabilities} capabilities`}`
            : "No gaps on its capabilities"
      }
    />
  );
}
