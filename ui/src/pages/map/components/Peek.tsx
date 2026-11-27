import { useEffect, type ReactNode, type Ref } from "react";
import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import { ConceptIcon } from "../../../components/Concepts";
import { Maturity } from "../../../components/maturity/Maturity";
import { AreaIcon } from "../../../components/names";
import { PersonaAvatar, PersonaIcon, personaNameAndRole } from "../../../components/Personas";
import { ReadinessMark } from "../../../components/Readiness";
import { docHref, type DocKind } from "../../../routes";
import { InlineMarkdown } from "../../../components/markdown/Markdown";
import { GapRiskMark, RiskScore } from "../../../components/risk/RiskScore";
import { StabilityMark } from "../../../components/stability/StabilityMark";
import { Term } from "../../../components/term/Term";
import { areaCapabilities, find, pickList, type Capability, type DocqetState, type Exposure, type Gap, type Pick, type RiskAcross } from "../../../state";
import { gapsAcross, someOf } from "../../../model";
import { InitiativeTags, initiativesOf } from "../../../components/Initiatives";
import { panelSx } from "./Canvas";

/* Each kind's icon and name, as the peek and the map's filter bar say them. */
export const PICK_KINDS: Record<Pick["kind"], { one: string; icon: (size: number) => ReactNode }> = {
  area: { one: "Area", icon: (size) => <AreaIcon size={size} /> },
  feature: { one: "Feature", icon: (size) => <WidgetsOutlinedIcon sx={{ fontSize: size, color: "secondary.main" }} /> },
  capability: { one: "Capability", icon: (size) => <BoltOutlinedIcon sx={{ fontSize: size, color: "primary.main" }} /> },
  concept: { one: "Concept", icon: (size) => <ConceptIcon size={size} /> },
  persona: { one: "Persona", icon: (size) => <PersonaIcon size={size} /> },
};

/* A figure in the peek: what it counts, how many, and the tab of its page that lists them. */
type Figure = { label: string; value: ReactNode; tab: string };

/*
 * What the peek says about one thing: its mark, three figures, and its gaps,
 * riskiest first, as the server scores them: `risk`, null while it's read.
 * `exposure`: that of its capabilities, shown instead of the spread, where it
 * has one. `within`: its capabilities, for the initiatives they're part of.
 * `of`: what its exposure is of, as a phrase, where that isn't its name, as
 * for a persona.
 */
/* `initiatives`: those it says it's part of; left out, those its capabilities (`within`) are part of. */
type Summary = {
  name: string;
  of?: string;
  picture?: ReactNode;
  role?: string | null;
  where?: string;
  mark: ReactNode;
  figures: Figure[];
  risk: RiskAcross<Gap> | null;
  exposure?: Exposure;
  within?: Capability[];
  initiatives?: string[];
};

const capabilitiesOf = (state: DocqetState, ids: string[]) => ids.flatMap((id) => find(state.capabilities, id) ?? []);

function summarize(state: DocqetState, at: Pick): Summary | null {
  if (at.kind === "capability") {
    const c = find(state.capabilities, at.id);
    if (!c) return null;
    const rules = c.rules.flatMap((id) => find(state.rules, id) ?? []);
    const held = rules.filter((r) => c.ruleStandings[r.id] !== "gap").length;
    return {
      name: c.name,
      initiatives: c.initiatives,
      mark: c.stability ? (
        <StabilityMark level={c.stability} feature={c.name} size="extra-long" />
      ) : (
        <Box component="span" sx={{ color: "text.disabled" }}>
          Draft
        </Box>
      ),
      figures: [
        { label: "Improvements", value: c.readiness.parts.length, tab: "improvements" },
        { label: "Rules held", value: rules.length ? `${held} / ${rules.length}` : 0, tab: "rules" },
        { label: "Personas served", value: c.personas.filter((id) => find(state.personas, id)).length, tab: "overview" },
      ],
      risk: c.risk,
      exposure: c.exposure,
      within: [c],
    };
  }
  if (at.kind === "feature") {
    const f = find(state.features, at.id);
    if (!f) return null;
    const capabilities = capabilitiesOf(state, f.capabilities);
    return {
      name: f.name,
      mark: <Maturity value={f.maturity} of="none of its capabilities has a level" spread={capabilities.map((c) => c.stability)} />,
      figures: [
        { label: "Capabilities", value: capabilities.length, tab: "capabilities" },
        { label: "Improvements", value: f.readiness.parts.length, tab: "improvements" },
        { label: "Personas served", value: new Set(capabilities.flatMap((c) => c.personas)).size, tab: "personas" },
      ],
      risk: f.readiness.gaps,
      exposure: f.exposure,
      within: capabilities,
    };
  }
  if (at.kind === "area") {
    const d = find(state.areas, at.id);
    if (!d) return null;
    const capabilities = areaCapabilities(state, d);
    return {
      name: d.name,
      mark: (
        <Maturity
          value={d.maturity}
          subject="area"
          of="none of its features has a level"
          count={d.features.length}
          spread={d.features.map((id) => find(state.features, id)?.band ?? null)}
        />
      ),
      figures: [
        { label: "Features", value: d.features.length, tab: "features" },
        { label: "Capabilities", value: capabilities.length, tab: "features" },
        { label: "Improvements", value: d.readiness.parts.length, tab: "improvements" },
      ],
      risk: d.readiness.gaps,
      exposure: d.exposure,
      within: capabilities,
    };
  }
  if (at.kind === "concept") {
    const c = find(state.concepts, at.id);
    if (!c) return null;
    const rules = c.rules.flatMap((id) => find(state.rules, id) ?? []);
    return {
      name: c.name,
      mark: null,
      figures: [
        { label: "Capabilities", value: c.capabilities.filter((id) => find(state.capabilities, id)).length, tab: "used" },
        { label: "Rules", value: rules.length, tab: "rules" },
        { label: "Rules not held", value: rules.filter((r) => r.gaps.length).length, tab: "rules" },
      ],
      /* A concept has no gaps of its own: those it shows say a rule about it doesn't hold yet, each scored anywhere. */
      risk: gapsAcross([...new Map(rules.flatMap((r) => r.gaps.flatMap((id) => find(state.gaps, id) ?? [])).map((g) => [g.id, g])).values()]),
    };
  }
  const p = find(state.personas, at.id);
  if (!p) return null;
  const capabilities = capabilitiesOf(state, p.capabilities);
  const { name, role } = personaNameAndRole(p);
  return {
    name,
    of: `what serves ${name}`,
    role,
    picture: <PersonaAvatar persona={p} size={40} />,
    initiatives: p.initiatives,
    mark: <ReadinessMark readiness={p.readiness} of={`Readiness for ${name}`} />,
    figures: [
      { label: "Capabilities", value: capabilities.length, tab: "serves" },
      { label: "Features", value: p.features.length, tab: "readiness" },
      { label: "Improvements", value: p.readiness.parts.length, tab: "improvements" },
    ],
    /* Only what someone using the product would notice: their capabilities' own gaps, each scored on what serves them. */
    risk: someOf(p.readiness.gaps, (g) => capabilities.some((c) => c.open.gaps.includes(g))),
    exposure: p.exposure,
    within: capabilities,
  };
}

/*
 * A slim panel at the right of the map, for whatever was clicked on it: a
 * glance at what it is, not all of it. The same for every kind: its kind,
 * name and level, maturity or readiness, its one sentence, three figures,
 * each linking to where its page lists them, its three riskiest gaps, and the
 * way to its page, where the rest is. It can filter the map to itself. Esc or
 * its close button closes it. On a phone, it's a sheet across the bottom of
 * the map instead, which `ref` lets the map keep what it shows above.
 */
export default function Peek({
  state,
  at,
  onClose,
  filtering,
  onFilter,
  ref,
}: {
  state: DocqetState;
  at: Pick;
  onClose: () => void;
  /* Whether the map is filtered to it, and filtering to it or not. */
  filtering: boolean;
  onFilter: () => void;
  ref?: Ref<HTMLElement>;
}) {
  /* Esc closes it, unless it's closing a popover or clearing the search. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || (e.target as HTMLElement).closest?.(".search, .MuiPopover-root, .MuiDialog-root")) return;
      if (e.target instanceof HTMLInputElement && e.target.value) return;
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const s = summarize(state, at);
  if (!s) return null;
  const doc = find(pickList(state, at.kind), at.id);
  const kind = PICK_KINDS[at.kind];
  const page = (tab?: string) => docHref(at.kind as DocKind, at.id, tab);
  const risk = s.risk;
  const riskiest = risk?.items.slice(0, 3) ?? [];

  return (
    <Box component="aside" ref={ref} sx={[panelSx, peekSx]} data-no-pan aria-label={`${kind.one}: ${s.name}`}>
      <Box component="header" sx={{ display: "flex", alignItems: "center", gap: 0.75, fontSize: 12.5, fontWeight: 600, color: "text.secondary" }}>
        {kind.icon(15)}
        <Term id={at.kind}>{kind.one}</Term>
        {s.where ? (
          <Box component="span" sx={{ color: "text.disabled" }}>
            in {s.where}
          </Box>
        ) : null}
        <Box component="button" type="button" sx={closeSx} onClick={onClose} aria-label="Close">
          <CloseRoundedIcon sx={{ fontSize: 18 }} />
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: "-4px" }}>
        {s.picture}
        <div>
          <Box component="h2" sx={{ fontSize: 19, fontWeight: 700, lineHeight: 1.25, letterSpacing: "-0.01em", overflowWrap: "anywhere" }}>
            {s.name}
          </Box>
          {s.role ? <Box sx={{ mt: "2px", fontSize: 13, color: "text.secondary" }}>{s.role}</Box> : null}
        </div>
      </Box>
      <InitiativeTags state={state} ids={s.initiatives ?? initiativesOf(state, s.within ?? [])} block />
      {s.mark ? <Box sx={{ display: "flex", alignItems: "center", fontSize: 14 }}>{s.mark}</Box> : null}
      {doc?.description ? (
        <Box component="p" sx={{ color: "text.secondary", lineHeight: 1.5 }}>
          <InlineMarkdown text={doc.description} />
        </Box>
      ) : null}

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0.75 }}>
        {s.figures.map((f) => (
          <Box key={f.label} component="a" sx={figureSx} href={page(f.tab)}>
            <Box component="span" sx={{ fontSize: 18, fontWeight: 700, fontVariantNumeric: "tabular-nums", lineHeight: 1.2 }}>
              {f.value}
            </Box>
            <Box component="span" sx={{ fontSize: 11.5, lineHeight: 1.3, color: "text.secondary" }}>
              {f.label}
            </Box>
          </Box>
        ))}
      </Box>

      {risk && riskiest.length ? (
        <section>
          <Box component="h3" sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.75, typography: "overline", color: "text.disabled" }}>
            Riskiest <Term id="gap">gaps</Term>
            <Box component="span" sx={{ display: "inline-flex", letterSpacing: 0, textTransform: "none" }}>
              <RiskScore risk={risk} exposure={s.exposure} of={s.of ?? s.name} />
            </Box>
          </Box>
          <Box component="ul" sx={{ display: "flex", flexDirection: "column" }}>
            {riskiest.map(({ item: g, risk: r, on }) => (
              <li key={g.id}>
                <Box component="a" sx={gapSx} href={docHref("gap", g.id)}>
                  {/* Each gap's risk the same width, so the names line up. */}
                  <Box component="span" sx={{ flex: "none", display: "flex", alignItems: "center", minWidth: 46, height: 19 }}>
                    <GapRiskMark risk={r} on={on} inButton />
                  </Box>
                  <Box
                    component="span"
                    sx={{ fontSize: 13, lineHeight: 1.45, display: "-webkit-box", WebkitBoxOrient: "vertical", WebkitLineClamp: 2, overflow: "hidden" }}
                  >
                    <InlineMarkdown text={g.name} />
                  </Box>
                </Box>
              </li>
            ))}
          </Box>
          {risk.items.length > riskiest.length ? (
            <Box component="a" sx={[linkSx, { display: "inline-block", mt: 0.5, fontSize: 12.5 }]} href={page("improvements")}>
              All {risk.items.length} gaps
            </Box>
          ) : null}
        </section>
      ) : null}

      <Box component="footer" sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 1, pt: 0.5 }}>
        <Box component="a" sx={openSx} href={page()}>
          Open page
          <ArrowForwardRoundedIcon sx={{ fontSize: 17 }} />
        </Box>
        <Box component="button" type="button" sx={filterButtonSx} aria-pressed={filtering} onClick={onFilter}>
          <FilterListRoundedIcon sx={{ fontSize: 15 }} />
          {filtering ? "Stop filtering to this" : "Filter the map to this"}
        </Box>
      </Box>
    </Box>
  );
}

/* A link, or a button that looks like one, for what acts inside the page, in the concepts' teal. */
export const linkSx: SystemStyleObject<Theme> = {
  font: "inherit",
  color: "concept.main",
  bgcolor: "transparent",
  border: 0,
  p: 0,
  cursor: "pointer",
  textDecoration: "underline",
  textDecorationColor: (t) => `color-mix(in srgb, ${t.vars.palette.concept.main} 40%, transparent)`,
  textUnderlineOffset: "2px",
  "&:hover": { textDecorationColor: "currentColor" },
};

/*
 * At the right of the map, above the zoom controls, its height its content's.
 * On a phone, a sheet across the map's bottom, over the zoom controls, as
 * tall as its content up to a little over half the map.
 */
const peekSx: SystemStyleObject<Theme> = {
  position: "absolute",
  zIndex: 5,
  display: "flex",
  flexDirection: "column",
  gap: 1.5,
  p: "12px 16px 16px",
  overflowY: "auto",
  bgcolor: "background.paper",
  top: { xs: "auto", sm: 12 },
  right: { xs: 0, sm: 12 },
  bottom: { xs: 0, sm: "auto" },
  left: { xs: 0, sm: "auto" },
  width: { xs: "auto", sm: 340 },
  maxWidth: { sm: "calc(100% - 24px)" },
  maxHeight: { xs: "55%", sm: "calc(100% - 80px)" },
  borderRadius: { xs: "14px 14px 0 0", sm: "8px" },
  borderWidth: { xs: "1px 0 0", sm: "1px" },
};

const closeSx: SystemStyleObject<Theme> = {
  display: "inline-grid",
  placeItems: "center",
  width: 28,
  height: 28,
  ml: "auto",
  mr: -1,
  p: 0,
  color: "text.secondary",
  bgcolor: "transparent",
  border: 0,
  borderRadius: "5px",
  cursor: "pointer",
  "&:hover": { color: "text.primary", bgcolor: "surface.accentSoft" },
};

/* One of the three figures, linking to where its page lists them. */
const figureSx: SystemStyleObject<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: "2px",
  p: "8px 10px",
  border: 1,
  borderColor: "divider",
  borderRadius: "7px",
  color: "inherit",
  textDecoration: "none",
  "&:hover": { borderColor: "primary.main", bgcolor: "surface.accentSoft" },
};

/* A gap's row, lit while hovered, reaching into the panel's padding. */
const gapSx: SystemStyleObject<Theme> = {
  display: "flex",
  alignItems: "flex-start",
  gap: 1.25,
  p: "7px 8px",
  mx: -1,
  borderRadius: "6px",
  color: "inherit",
  textDecoration: "none",
  "&:hover": { bgcolor: (t) => `color-mix(in srgb, ${t.vars.palette.text.primary} 4%, transparent)` },
};

/* The way to its page, the panel's one filled button. */
const openSx: SystemStyleObject<Theme> = {
  display: "inline-flex",
  alignItems: "center",
  gap: 0.75,
  height: 34,
  px: 1.75,
  fontWeight: 600,
  color: "background.paper",
  bgcolor: "primary.main",
  borderRadius: "7px",
  textDecoration: "none",
  "&:hover": { bgcolor: (t) => `color-mix(in srgb, ${t.vars.palette.primary.main} 86%, ${t.vars.palette.text.primary})` },
};

const filterButtonSx: SystemStyleObject<Theme> = {
  display: "inline-flex",
  alignItems: "center",
  gap: "5px",
  p: "4px 6px",
  font: "inherit",
  fontSize: 12.5,
  color: "text.secondary",
  bgcolor: "transparent",
  border: 0,
  borderRadius: "5px",
  cursor: "pointer",
  "&:hover": { color: "text.primary", bgcolor: "surface.accentSoft" },
  "&[aria-pressed=true]": { color: "primary.main" },
};
