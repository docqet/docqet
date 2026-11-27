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
import {
  domainName,
  levelInDomain,
  find,
  gapsOn,
  partOf,
  RISK_BANDS,
  type Capability,
  type CapabilityLevel,
  type DocqetState,
  type Domain,
  type Feature,
} from "../../state";
import { ImprovementsFigure, IMPROVEMENTS_TAB } from "../../components/improvements/Improvements";
import type { Readiness } from "../../state";
import { DocLink, LevelMark, PersonaFaces, ExposureStat, ellipsisSx, whereSx } from "../../components/indexParts";
import { InitiativeTags, initiativesOf } from "../../components/Initiatives";
import { useStatusFor } from "../../model";
import Skeleton from "@mui/material/Skeleton";
import { ReadFallback } from "../../components/ReadFallback";

type Group = "domain" | "stability" | "exposure";
const GROUPS: Group[] = ["domain", "stability", "exposure"];

/*
 * Every domain, feature and capability, and how far along each is. By
 * default a tree: each domain, the features it has a part in, and the
 * capabilities of that part, each with its level in that domain, the risk it
 * is exposed to, its improvements and who it serves. Domains and features show
 * their maturity and exposure in the same columns, as rings, as the map does;
 * what either is worked out from is in its popover. Grouped by stability
 * instead, every capability under its level, least stable first; grouped by
 * exposure, under the band of its exposure, most exposed first. Which grouping
 * is in `&group=`. Above it, cards for the maturity and risk of every feature
 * showing, and how many capabilities there are.
 */
export default function FeaturesPage({ state }: { state: DocqetState; route: Route }) {
  const asked = new URLSearchParams(window.location.search).get("group") as Group | null;
  const group: Group = asked && GROUPS.includes(asked) ? asked : "domain";
  const overall = state.status.maturity;
  /* On a phone the header has no room beside the title, so the grouping goes under it. */
  const phone = useMediaQuery(useTheme().breakpoints.down("sm"), { noSsr: true });
  return (
    <View title="Features" wide>
      <PageHeader
        title="Features"
        lede="What can it do? Every domain, the features it has a part in, and their capabilities, with how far along each is."
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
              note={`${plural(state.features.length, "feature", "features")} · ${plural(state.domains.length, "domain", "domains")}`}
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
      {!state.capabilities.length && !state.domains.length ? (
        <Empty>No domains, features or capabilities are written down yet.</Empty>
      ) : group === "domain" ? (
        <DomainTree state={state} />
      ) : group === "stability" ? (
        <ByStability state={state} />
      ) : (
        <ByExposure state={state} />
      )}
    </View>
  );
}

const GROUP_NAMES: Record<Group, string> = { domain: "Domain", stability: "Stability", exposure: "Exposure" };

/* Group by domain, stability or risk, as links that change `&group=`. */
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
          href={withParam("group", g === "domain" ? null : g)}
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

const levelIn = (c: Capability, domain?: string): CapabilityLevel => (domain && c.levels.find((l) => l.domain === domain)?.level) || c.stability;

/*
 * A capability's row: its name, linking to its page, and `where` it is when
 * that isn't plain from where the row sits; its level, in `domain` when
 * that's given; its exposure; its improvements, what would make it more
 * ready; and the personas it serves.
 */
function CapabilityRow({ state, capability, domain, where }: { state: DocqetState; capability: Capability; domain?: string; where?: ReactNode }) {
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
        <LevelMark name={capability.name} level={levelIn(capability, domain)} />
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
  if (!readiness.improvements.length) return <ImprovementsFigure readiness={readiness} />;
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
 * Exposure and Improvements columns. A domain's row is a little larger, with more room above it, and
 * what's under each is indented by about its chevron.
 */
function FoldRow({
  domain = false,
  head,
  maturity,
  exposure,
  improvements,
  children,
}: {
  domain?: boolean;
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
          pt: domain ? "14px" : 1,
          pr: 1,
          pb: 1,
          pl: 0,
          fontSize: domain ? 15 : undefined,
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
      <Box sx={{ pl: domain ? 2.75 : 3.25 }}>{children}</Box>
    </details>
  );
}

/* Each domain, with its parts of features and their capabilities, then any capabilities in no feature. */
function DomainTree({ state }: { state: DocqetState }) {
  return (
    <Box sx={{ fontSize: 13.5 }}>
      <ColumnHeads first="Domain, feature and capability" />
      {state.domains.map((d) => (
        <DomainBranch key={d.id} state={state} domain={d} />
      ))}
    </Box>
  );
}

function DomainBranch({ state, domain }: { state: DocqetState; domain: Domain }) {
  const features = domain.features.flatMap((id) => find(state.features, id) ?? []);
  const loose = domain.capabilities.flatMap((id) => find(state.capabilities, id) ?? []);
  const parts = features.map((f) => partOf(f, domain.id));
  return (
    <FoldRow
      domain
      maturity={
        domain.maturity === null ? null : (
          <MaturityRing
            progress={domain.maturity}
            subject="domain"
            count={parts.filter((p) => p?.maturity != null).length}
            label={`${domain.name} maturity`}
            size={22}
            spread={parts.map((p) => p?.band ?? null)}
          />
        )
      }
      exposure={<ExposureMark exposure={domain.exposure} risk={domain.readiness.gaps} of={domain.name} />}
      improvements={<ImprovementsLink readiness={domain.readiness} href={docHref("domain", domain.id, IMPROVEMENTS_TAB)} />}
      head={<DocLink kind="domain" id={domain.id} name={domain.name} sx={{ ...nameLinkSx, fontWeight: 700 }} />}
    >
      {!features.length && !loose.length ? <FoldEmpty>A part of the business the software doesn't serve yet.</FoldEmpty> : null}
      {features.map((f) => (
        <FeatureBranch key={f.id} state={state} feature={f} domain={domain.id} />
      ))}
      {loose.length ? (
        <div>
          <Box sx={{ pt: 1.25, pr: 1, pb: 0.75, pl: 0, fontSize: 12.5, color: "text.secondary", borderBottom: 1, borderColor: "divider" }}>
            In no <Term id="feature">feature</Term>
          </Box>
          <ul>
            {loose.map((c) => (
              <CapabilityRow key={c.id} state={state} capability={c} domain={domain.id} />
            ))}
          </ul>
        </div>
      ) : null}
    </FoldRow>
  );
}

/* A feature's part in one domain: its maturity and risk there, where else it is, and those capabilities. */
function FeatureBranch({ state, feature, domain }: { state: DocqetState; feature: Feature; domain: string }) {
  const part = partOf(feature, domain);
  const capabilities = (part?.capabilities ?? []).flatMap((id) => find(state.capabilities, id) ?? []);
  const elsewhere = feature.parts.filter((p) => p.domain !== domain);
  const levels = capabilities.map((c) => levelInDomain(c, domain));
  /* Its figures in this domain: the feature's own when it's in no other, or else the server's for its part here. */
  const inPart = useStatusFor(state, elsewhere.length ? `feature:${feature.id},domain:${domain}` : null);
  const figures = elsewhere.length
    ? inPart.data && { exposure: inPart.data.exposure, risk: inPart.data.risk }
    : { exposure: feature.exposure, risk: feature.readiness.gaps };
  return (
    <FoldRow
      maturity={
        part?.maturity == null ? null : (
          <MaturityRing
            progress={part.maturity}
            subject="feature"
            count={levels.filter(Boolean).length}
            label={`${feature.name} maturity`}
            size={22}
            spread={levels}
          />
        )
      }
      exposure={
        figures ? (
          <ExposureMark exposure={figures.exposure} risk={figures.risk} of={feature.name} />
        ) : (
          <ReadFallback read={inPart} what="its exposure here" inline skeleton={<Skeleton variant="circular" width={22} height={22} />} />
        )
      }
      improvements={<ImprovementsLink readiness={feature.readiness} href={docHref("feature", feature.id, IMPROVEMENTS_TAB)} />}
      head={
        <>
          <DocLink kind="feature" id={feature.id} name={feature.name} sx={nameLinkSx} />
          <InitiativeTags state={state} ids={initiativesOf(state, capabilities)} />
          {elsewhere.length ? (
            <Box
              component="span"
              sx={(t) => ({
                ...whereSx,
                "& a": {
                  color: "inherit",
                  textDecoration: "underline",
                  textDecorationColor: t.vars.palette.surface.borderStrong,
                  textUnderlineOffset: "2px",
                  "&:hover": { color: t.vars.palette.primary.main },
                },
              })}
            >
              {"Also in "}
              {elsewhere.map((p, i) => (
                <span key={p.domain}>
                  {i ? ", " : null}
                  <a href={docHref("domain", p.domain)}>{domainName(state, p.domain)}</a>
                </span>
              ))}
            </Box>
          ) : null}
        </>
      }
    >
      {capabilities.length ? (
        <ul>
          {capabilities.map((c) => (
            <CapabilityRow key={c.id} state={state} capability={c} domain={domain} />
          ))}
        </ul>
      ) : (
        <FoldEmpty>No capabilities here yet.</FoldEmpty>
      )}
    </FoldRow>
  );
}

/*
 * Every capability under its level, least stable first: drafts, then
 * Prototype up to GA. A capability built at different levels in different
 * domains is under the lowest. Each says which feature it's in, or which
 * domains when it's in none.
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

/* Where a capability is: its feature, or else its domains. */
function whereIs(state: DocqetState, c: Capability): string {
  const feature = c.feature ? find(state.features, c.feature) : undefined;
  if (feature) return feature.name;
  return [...new Set(c.levels.map((l) => domainName(state, l.domain)))].join(", ");
}
