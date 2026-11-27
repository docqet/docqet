// docqet:implements capability:overview
import type { ReactNode } from "react";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme, type Theme } from "@mui/material/styles";
import type { SystemStyleObject } from "@mui/system";
import { Maturity } from "../../components/maturity/Maturity";
import { plural } from "../../components/names";
import { MaturityRing } from "../../components/maturity/MaturityRing";
import { ExposureMark } from "../../components/risk/RiskScore";
import { STABILITY, STABILITY_LEVEL_IDS } from "../../components/stability/stability";
import { Term } from "../../components/term/Term";
import { docHref, withParam, type Route } from "../../routes";
import { Empty, PageHeader, Section, Stat, View } from "../../components/shell/layout";
import { areaName, find, gapsOn, RISK_BANDS, type Area, type Capability, type CapabilityLevel, type DocqetState, type Feature } from "../../state";
import { ImprovementsFigure, IMPROVEMENTS_TAB } from "../../components/improvements/Improvements";
import type { Readiness } from "../../state";
import { DocLink, LevelMark, PersonaFaces, ExposureStat, ellipsisSx, whereSx } from "../../components/indexParts";
import { InitiativeTags, initiativesOf } from "../../components/Initiatives";

type Group = "area" | "stability" | "exposure";
const GROUPS: Group[] = ["area", "stability", "exposure"];

/*
 * Every area, feature and capability, and how far along each is. By
 * default a tree: each area, its features, by name, and their capabilities,
 * by name, each with its level, the risk it is exposed to, its improvements
 * and who it serves; then the features in no area, and the capabilities in no
 * feature. Areas and features show
 * their maturity and exposure in the same columns, as rings, as the map does;
 * what either is worked out from is in its popover. Grouped by stability
 * instead, every capability under its level, least stable first; grouped by
 * exposure, under the band of its exposure, most exposed first. Which grouping
 * is in `&group=`. Above it, cards for the maturity and risk of every feature
 * showing, and how many capabilities there are.
 */
export default function FeaturesPage({ state }: { state: DocqetState; route: Route }) {
  const asked = new URLSearchParams(window.location.search).get("group") as Group | null;
  const group: Group = asked && GROUPS.includes(asked) ? asked : "area";
  const overall = state.status.maturity;
  /* On a phone the header has no room beside the title, so the grouping goes under it. */
  const phone = useMediaQuery(useTheme().breakpoints.down("sm"), { noSsr: true });
  return (
    <View title="Features" wide>
      <PageHeader
        title="Features"
        lede="What can it do? Every area, its features and their capabilities, with how far along each is."
        stats={
          <>
            <Stat
              label="Maturity"
              term="maturity"
              value={
                <Maturity
                  value={overall}
                  subject="project"
                  count={state.features.length}
                  of="nothing showing has a capability in a feature yet"
                  spread={state.features.map((f) => f.band)}
                />
              }
              note={`Across ${plural(state.features.length, "feature", "features")}`}
            />
            <ExposureStat exposure={state.status.exposure} risk={state.status.risk} of="every capability showing" />
            <Stat
              label="Capabilities"
              term="capability"
              value={state.capabilities.length || "None"}
              note={`${plural(state.features.length, "feature", "features")} · ${plural(state.areas.length, "area", "areas")}`}
            />
          </>
        }
        actions={phone ? undefined : <GroupToggle group={group} />}
      />
      {phone ? (
        <Box sx={{ mb: 2 }}>
          <GroupToggle group={group} />
        </Box>
      ) : null}
      {!state.capabilities.length && !state.features.length && !state.areas.length ? (
        <Empty>No areas, features or capabilities are written down yet.</Empty>
      ) : group === "area" ? (
        <AreaTree state={state} />
      ) : group === "stability" ? (
        <ByStability state={state} />
      ) : (
        <ByExposure state={state} />
      )}
    </View>
  );
}

const GROUP_NAMES: Record<Group, string> = { area: "Area", stability: "Stability", exposure: "Exposure" };

/* Group by area, stability or risk, as links that change `&group=`. */
function GroupToggle({ group }: { group: Group }) {
  return (
    <Box role="group" aria-label="Group by" sx={{ display: "inline-flex", alignItems: "center", gap: "2px", fontSize: 13 }}>
      <Box component="span" sx={{ mr: 0.75, color: "text.secondary" }}>
        Group by
      </Box>
      {GROUPS.map((g) => (
        <Box
          component="a"
          key={g}
          href={withParam("group", g === "area" ? null : g)}
          aria-current={group === g ? "true" : undefined}
          sx={{
            py: 0.5,
            px: 1.25,
            border: 1,
            borderColor: "divider",
            borderRadius: "6px",
            color: "text.secondary",
            textDecoration: "none",
            "&:hover": { color: "text.primary" },
            "&[aria-current]": { borderColor: "primary.main", bgcolor: "surface.accentSoft", color: "primary.main", fontWeight: 600 },
          }}
        >
          {GROUP_NAMES[g]}
        </Box>
      ))}
    </Box>
  );
}

/*
 * The tree's rows, its headings, folds and capabilities alike: a name, then
 * the same columns at the right. On a phone the columns go on a line of
 * their own under the name, still at the right, so they line up down the
 * tree, and who it serves is left out.
 */
const rowSx: SystemStyleObject<Theme> = {
  display: "flex",
  flexWrap: { xs: "wrap", sm: "nowrap" },
  alignItems: "center",
  columnGap: 1.5,
  rowGap: 0.25,
  borderBottom: 1,
  borderColor: "divider",
};

const capabilityRowSx: SystemStyleObject<Theme> = { ...rowSx, minHeight: 36, py: "3px", px: 1 };

/* A row lit faintly under the pointer. */
const hoverSx: SystemStyleObject<Theme> = {
  "&:hover": { bgcolor: (t) => `color-mix(in srgb, ${t.vars.palette.text.primary} 2.5%, transparent)` },
};

/* On a phone, wide enough to fill the line beside a fold's chevron, so the columns go onto the next one. */
const nameSx: SystemStyleObject<Theme> = {
  flex: { xs: "1 1 calc(100% - 30px)", sm: 1 },
  minWidth: 0,
  display: "flex",
  alignItems: "baseline",
  gap: 1.25,
  overflow: "hidden",
};
const markColumnSx: SystemStyleObject<Theme> = { flex: "none", display: "inline-flex", alignItems: "center" };
const levelSx: SystemStyleObject<Theme> = { ...markColumnSx, width: { xs: 72, sm: 110 }, ml: { xs: "auto", sm: 0 } };
const riskSx: SystemStyleObject<Theme> = { ...markColumnSx, width: { xs: 64, sm: 80 } };
const leftSx: SystemStyleObject<Theme> = { flex: "none", width: { xs: 84, sm: 230 } };
const whoSx: SystemStyleObject<Theme> = { flex: "none", width: 120, display: { xs: "none", sm: "block" } };

/* A capability's or a fold's name, centered on the row, where the rest of the name's line sits on its baseline. */
const nameLinkSx: SystemStyleObject<Theme> = { alignSelf: "center" };

/* The names of the columns every capability row has, once, at the top. */
function ColumnHeads({ first }: { first: ReactNode }) {
  return (
    <Box
      sx={{
        ...capabilityRowSx,
        minHeight: 0,
        py: 1,
        fontSize: 11,
        fontWeight: 650,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        color: "text.disabled",
      }}
    >
      <Box component="span" sx={nameSx}>
        {first}
      </Box>
      <Box component="span" sx={levelSx}>
        <Term id="stability" />
      </Box>
      <Box component="span" sx={riskSx}>
        <Term id="exposure" />
      </Box>
      <Box component="span" sx={leftSx}>
        <Term id="improvement">Improvements</Term>
      </Box>
      <Box component="span" sx={whoSx}>
        Serves
      </Box>
    </Box>
  );
}

/*
 * A capability's row: its name, linking to its page, and `where` it is when
 * that isn't plain from where the row sits; its level; its exposure; its improvements, what would make it more
 * ready; and the personas it serves.
 */
function CapabilityRow({ state, capability, where }: { state: DocqetState; capability: Capability; where?: ReactNode }) {
  const personas = capability.personas.flatMap((id) => find(state.personas, id) ?? []);
  return (
    <Box component="li" sx={{ ...capabilityRowSx, ...hoverSx }}>
      <Box component="span" sx={nameSx}>
        <DocLink kind="capability" id={capability.id} name={capability.name} sx={nameLinkSx} />
        <InitiativeTags state={state} ids={capability.initiatives} />
        {where ? (
          <Box component="span" sx={{ ...whereSx, ...ellipsisSx }}>
            {where}
          </Box>
        ) : null}
      </Box>
      <Box component="span" sx={levelSx}>
        <LevelMark name={capability.name} level={capability.stability} />
      </Box>
      <Box component="span" sx={riskSx}>
        <ExposureMark exposure={capability.exposure} risk={capability.risk} of={capability.name} />
      </Box>
      <Box component="span" sx={leftSx}>
        <ImprovementsLink readiness={capability.readiness} href={docHref("capability", capability.id, IMPROVEMENTS_TAB)} />
      </Box>
      <Box component="span" sx={whoSx}>
        <PersonaFaces personas={personas} />
      </Box>
    </Box>
  );
}

/* Improvements in a row: the most one would add, and how many more, linking to the tab that lists them. */
function ImprovementsLink({ readiness, href }: { readiness: Readiness; href: string }) {
  if (!readiness.parts.length) return <ImprovementsFigure readiness={readiness} />;
  return (
    <Box component="a" href={href} sx={{ textDecoration: "none", "&&": { color: "inherit", fontWeight: "inherit", "&:hover": { color: "primary.main" } } }}>
      <ImprovementsFigure readiness={readiness} />
    </Box>
  );
}

/* A line under a fold when there's nothing in it. */
function FoldEmpty({ children }: { children: ReactNode }) {
  return (
    <Box component="p" sx={{ m: 0, py: 1.25, px: 1, color: "text.secondary", fontSize: 13, borderBottom: 1, borderColor: "divider" }}>
      {children}
    </Box>
  );
}

/*
 * A row that folds what's under it, open to begin with: its `head`, then its
 * maturity, exposure and improvements under the capability rows' Stability,
 * Exposure and Improvements columns. An area's row is a little larger, with more room above it, and
 * what's under each is indented by about its chevron.
 */
function FoldRow({
  area = false,
  head,
  maturity,
  exposure,
  improvements,
  children,
}: {
  area?: boolean;
  head: ReactNode;
  maturity: ReactNode;
  exposure: ReactNode;
  improvements?: ReactNode;
  children: ReactNode;
}) {
  return (
    <details open>
      <Box
        component="summary"
        sx={{
          ...rowSx,
          ...hoverSx,
          pt: area ? "14px" : 1,
          pr: 1,
          pb: 1,
          pl: 0,
          fontSize: area ? 15 : undefined,
          listStyle: "none",
          cursor: "pointer",
          "&::-webkit-details-marker": { display: "none" },
        }}
      >
        <ExpandMoreRoundedIcon
          sx={{
            flex: "none",
            fontSize: 18,
            color: "text.disabled",
            transform: "rotate(-90deg)",
            transition: "transform 0.12s",
            "details[open] > summary > &": { transform: "none" },
          }}
        />
        <Box component="span" sx={nameSx}>
          {head}
        </Box>
        <Box component="span" sx={levelSx}>
          {maturity}
        </Box>
        <Box component="span" sx={riskSx}>
          {exposure}
        </Box>
        <Box component="span" sx={leftSx}>
          {improvements}
        </Box>
        <Box component="span" sx={whoSx} />
      </Box>
      <Box sx={{ pl: area ? 2.75 : 3.25 }}>{children}</Box>
    </details>
  );
}

/*
 * Each area, with its features and their capabilities, by name; then the
 * features in no area, and any capabilities in no feature.
 */
function AreaTree({ state }: { state: DocqetState }) {
  const unplaced = state.features.filter((f) => !f.area || !find(state.areas, f.area));
  const loose = state.capabilities.filter((c) => !c.feature || !find(state.features, c.feature));
  return (
    <Box sx={{ fontSize: 13.5 }}>
      <ColumnHeads first="Area, feature and capability" />
      {state.areas.map((a) => (
        <AreaBranch key={a.id} state={state} area={a} />
      ))}
      {unplaced.length ? (
        <FoldRow
          area
          maturity={null}
          exposure={null}
          head={
            <Box component="span" sx={{ ...nameLinkSx, fontWeight: 700, color: "text.secondary" }}>
              No area
            </Box>
          }
        >
          {unplaced.map((f) => (
            <FeatureBranch key={f.id} state={state} feature={f} />
          ))}
        </FoldRow>
      ) : null}
      {loose.length ? (
        <div>
          <Box sx={{ pt: 1.75, pr: 1, pb: 0.75, pl: 0, fontSize: 12.5, color: "text.secondary", borderBottom: 1, borderColor: "divider" }}>
            In no <Term id="feature">feature</Term>
          </Box>
          <ul>
            {loose.map((c) => (
              <CapabilityRow key={c.id} state={state} capability={c} />
            ))}
          </ul>
        </div>
      ) : null}
    </Box>
  );
}

function AreaBranch({ state, area }: { state: DocqetState; area: Area }) {
  const features = area.features.flatMap((id) => find(state.features, id) ?? []);
  return (
    <FoldRow
      area
      maturity={
        area.maturity === null ? null : (
          <MaturityRing
            progress={area.maturity}
            subject="area"
            count={features.filter((f) => f.maturity !== null).length}
            label={`${area.name} maturity`}
            size={22}
            spread={features.map((f) => f.band)}
          />
        )
      }
      exposure={<ExposureMark exposure={area.exposure} risk={area.readiness.gaps} of={area.name} />}
      improvements={<ImprovementsLink readiness={area.readiness} href={docHref("area", area.id, IMPROVEMENTS_TAB)} />}
      head={<DocLink kind="area" id={area.id} name={area.name} sx={{ ...nameLinkSx, fontWeight: 700 }} />}
    >
      {!features.length ? <FoldEmpty>No feature names it yet.</FoldEmpty> : null}
      {features.map((f) => (
        <FeatureBranch key={f.id} state={state} feature={f} />
      ))}
    </FoldRow>
  );
}

/* A feature: its maturity, exposure and improvements, and its capabilities, by name. */
function FeatureBranch({ state, feature }: { state: DocqetState; feature: Feature }) {
  const capabilities = feature.capabilities.flatMap((id) => find(state.capabilities, id) ?? []);
  const levels = capabilities.map((c) => c.stability);
  return (
    <FoldRow
      maturity={
        feature.maturity === null ? null : (
          <MaturityRing
            progress={feature.maturity}
            subject="feature"
            count={levels.filter(Boolean).length}
            label={`${feature.name} maturity`}
            size={22}
            spread={levels}
          />
        )
      }
      exposure={<ExposureMark exposure={feature.exposure} risk={feature.readiness.gaps} of={feature.name} />}
      improvements={<ImprovementsLink readiness={feature.readiness} href={docHref("feature", feature.id, IMPROVEMENTS_TAB)} />}
      head={
        <>
          <DocLink kind="feature" id={feature.id} name={feature.name} sx={nameLinkSx} />
          <InitiativeTags state={state} ids={initiativesOf(state, capabilities)} />
        </>
      }
    >
      {capabilities.length ? (
        <ul>
          {capabilities.map((c) => (
            <CapabilityRow key={c.id} state={state} capability={c} />
          ))}
        </ul>
      ) : (
        <FoldEmpty>No capabilities yet.</FoldEmpty>
      )}
    </FoldRow>
  );
}

/*
 * Every capability under its level, least stable first: drafts, then
 * Prototype up to GA. A capability at different levels in different
 * projects is under the lowest. Each says which feature it's in, and the
 * feature's area.
 */
function ByStability({ state }: { state: DocqetState }) {
  const levels: CapabilityLevel[] = [null, ...STABILITY_LEVEL_IDS];
  return (
    <>
      {levels.map((level) => {
        const capabilities = state.capabilities.filter((c) => c.stability === level);
        if (!capabilities.length) return null;
        return (
          <Section key={level ?? "draft"} title={level ? STABILITY[level].name : "Draft"} count={capabilities.length}>
            <CapabilityList state={state} capabilities={capabilities} />
          </Section>
        );
      })}
    </>
  );
}

/*
 * Every capability under the band of its exposure, most exposed first,
 * and riskiest first within each; then those with no gaps, then drafts,
 * which aren't exposed to anything. Each says where it is, as grouped by stability.
 */
function ByExposure({ state }: { state: DocqetState }) {
  const scored = state.capabilities.map((c) => ({ c, exposure: c.exposure, gaps: gapsOn(state, c).length }));
  const groups = [
    ...[...RISK_BANDS].reverse().map((band) => ({
      key: band.id,
      title: band.name,
      rows: scored.filter((s) => s.gaps && s.exposure.band?.id === band.id).sort((a, b) => (b.exposure.percent ?? 0) - (a.exposure.percent ?? 0)),
    })),
    { key: "none", title: "No gaps", rows: scored.filter((s) => !s.gaps && s.c.stability) },
    { key: "draft", title: "Draft", rows: scored.filter((s) => !s.c.stability) },
  ];
  return (
    <>
      {groups.map(({ key, title, rows }) =>
        rows.length ? (
          <Section key={key} title={title} count={rows.length}>
            <CapabilityList state={state} capabilities={rows.map(({ c }) => c)} />
          </Section>
        ) : null,
      )}
    </>
  );
}

/* A group's capabilities, under the column headings, each saying where it is. */
function CapabilityList({ state, capabilities }: { state: DocqetState; capabilities: Capability[] }) {
  return (
    <Box sx={{ fontSize: 13.5 }}>
      <ColumnHeads first="Capability" />
      <ul>
        {capabilities.map((c) => (
          <CapabilityRow key={c.id} state={state} capability={c} where={whereIs(state, c)} />
        ))}
      </ul>
    </Box>
  );
}

/* Where a capability is: its feature, in its area, if any. */
function whereIs(state: DocqetState, c: Capability): string {
  const feature = c.feature ? find(state.features, c.feature) : undefined;
  if (!feature) return "Not in a feature";
  return feature.area ? `${feature.name} · ${areaName(state, feature.area)}` : feature.name;
}
