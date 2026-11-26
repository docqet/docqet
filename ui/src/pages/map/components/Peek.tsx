import { useEffect, type ReactNode } from "react";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import { ConceptIcon } from "../../../components/Concepts";
import { Maturity } from "../../../Explore";
import { DomainIcon } from "../../../FeatureMap";
import { PersonaAvatar, PersonaIcon, personaNameAndRole } from "../../../components/Personas";
import { ReadinessMark } from "../../../components/Readiness";
import { docHref, type DocKind } from "../../../routes";
import { InlineMarkdown } from "../../../components/markdown/Markdown";
import { GapRiskMark, RiskScore } from "../../../components/risk/RiskScore";
import { StabilityMark } from "../../../components/stability/StabilityMark";
import { Term } from "../../../components/term/Term";
import {
  domainCapabilities,
  partOf,
  domainName,
  find,
  leftCount,
  openDecisions,
  pickList,
  type Capability,
  type DocketState,
  type Exposure,
  type Gap,
  type Pick,
  type RiskAcross,
} from "../../../state";
import { gapsAcross, someOf } from "../../../model";
import { InitiativeTags, initiativesOf } from "../../../components/Initiatives";

/* Each kind's icon and name, as the peek and the map's filter bar say them. */
export const PICK_KINDS: Record<Pick["kind"], { one: string; icon: (size: number) => ReactNode }> = {
  domain: { one: "Domain", icon: (size) => <DomainIcon size={size} /> },
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

/* How much is left across some capabilities, as a feature's or domain's page counts it; with `technical` false, none of what they're built on. */
const leftAcross = (capabilities: Capability[], technical = true) =>
  capabilities.reduce((n, c) => n + (technical ? leftCount(c.left) : c.left.decisions.length + c.left.gaps.length), 0);

const capabilitiesOf = (state: DocketState, ids: string[]) => ids.flatMap((id) => find(state.capabilities, id) ?? []);

function summarize(state: DocketState, at: Pick): Summary | null {
  if (at.kind === "capability") {
    const c = find(state.capabilities, at.id);
    if (!c) return null;
    const rules = c.rules.flatMap((id) => find(state.rules, id) ?? []);
    const held = rules.filter((r) => c.ruleStandings[r.id] !== "gap").length;
    return {
      name: c.name,
      initiatives: c.initiatives,
      mark: c.stability ? <StabilityMark level={c.stability} feature={c.name} size="extra-long" /> : <span className="faint">Draft</span>,
      figures: [
        { label: "What's left", value: leftCount(c.left), tab: "left" },
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
        { label: "What's left", value: openDecisions(f).length + leftAcross(capabilities), tab: "left" },
        { label: "Personas served", value: new Set(capabilities.flatMap((c) => c.personas)).size, tab: "personas" },
      ],
      risk: f.readiness.gaps,
      exposure: f.exposure,
      within: capabilities,
    };
  }
  if (at.kind === "domain") {
    const d = find(state.domains, at.id);
    if (!d) return null;
    const capabilities = domainCapabilities(state, d);
    return {
      name: d.name,
      mark: (
        <Maturity
          value={d.maturity}
          subject="domain"
          of="none of its features has a level"
          count={d.features.length}
          spread={d.features.map((id) => partOf(find(state.features, id), d.id)?.band ?? null)}
        />
      ),
      figures: [
        { label: "Features", value: d.features.length, tab: "features" },
        { label: "Capabilities", value: capabilities.length, tab: "features" },
        { label: "What's left", value: openDecisions(d).length + leftAcross(capabilities), tab: "left" },
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
      where: domainName(state, c.domain),
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
      /* Only what someone using the product would notice. */
      { label: "What's left", value: leftAcross(capabilities, false), tab: "left" },
    ],
    /* Only what someone using the product would notice: their capabilities' own gaps, each scored on what serves them. */
    risk: someOf(p.readiness.gaps, (g) => capabilities.some((c) => c.left.gaps.includes(g))),
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
 * its close button closes it.
 */
export default function Peek({
  state,
  at,
  onClose,
  filtering,
  onFilter,
}: {
  state: DocketState;
  at: Pick;
  onClose: () => void;
  /* Whether the map is filtered to it, and filtering to it or not. */
  filtering: boolean;
  onFilter: () => void;
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
    <aside className="panel peek" data-no-pan aria-label={`${kind.one}: ${s.name}`}>
      <header className="peek-kind">
        {kind.icon(15)}
        <Term id={at.kind}>{kind.one}</Term>
        {s.where ? <span className="faint">in {s.where}</span> : null}
        <button type="button" className="icon-button peek-close" onClick={onClose} aria-label="Close">
          <CloseRoundedIcon sx={{ fontSize: 18 }} />
        </button>
      </header>

      <div className="peek-title">
        {s.picture}
        <div>
          <h2 className="peek-name">{s.name}</h2>
          {s.role ? <div className="peek-role">{s.role}</div> : null}
        </div>
      </div>
      <InitiativeTags state={state} ids={s.initiatives ?? initiativesOf(state, s.within ?? [])} block />
      {s.mark ? <div className="peek-mark">{s.mark}</div> : null}
      {doc?.description ? (
        <p className="peek-description">
          <InlineMarkdown text={doc.description} />
        </p>
      ) : null}

      <div className="peek-figures">
        {s.figures.map((f) => (
          <a key={f.label} className="peek-figure" href={page(f.tab)}>
            <span className="peek-figure-value">{f.value}</span>
            <span className="peek-figure-label">{f.label}</span>
          </a>
        ))}
      </div>

      {risk && riskiest.length ? (
        <section className="peek-gaps">
          <h3>
            Riskiest <Term id="gap">gaps</Term>
            <RiskScore risk={risk} exposure={s.exposure} of={s.of ?? s.name} />
          </h3>
          <ul>
            {riskiest.map(({ item: g, risk: r, on }) => (
              <li key={g.id}>
                <a href={docHref("gap", g.id)}>
                  <GapRiskMark risk={r} on={on} inButton />
                  <span className="peek-gap-summary">
                    <InlineMarkdown text={g.name} />
                  </span>
                </a>
              </li>
            ))}
          </ul>
          {risk.items.length > riskiest.length ? (
            <a className="link peek-more" href={page("left")}>
              All {risk.items.length} gaps
            </a>
          ) : null}
        </section>
      ) : null}

      <footer className="peek-actions">
        <a className="peek-open" href={page()}>
          Open page
          <ArrowForwardRoundedIcon sx={{ fontSize: 17 }} />
        </a>
        <button type="button" className="peek-filter" aria-pressed={filtering} onClick={onFilter}>
          <FilterListRoundedIcon sx={{ fontSize: 15 }} />
          {filtering ? "Stop filtering to this" : "Filter the map to this"}
        </button>
      </footer>
    </aside>
  );
}
