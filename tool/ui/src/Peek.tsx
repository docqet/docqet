import { useEffect, type ReactNode } from "react";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import WidgetsOutlinedIcon from "@mui/icons-material/WidgetsOutlined";
import { ConceptIcon } from "./Concepts";
import { Maturity } from "./Explore";
import { DomainIcon } from "./FeatureMap";
import { PersonaAvatar, PersonaIcon, personaNameAndRole, personaReadiness } from "./Personas";
import { ReadinessMark } from "./Readiness";
import { docHref, type DocKind } from "./routes";
import { InlineMarkdown } from "./design/markdown/Markdown";
import { GapRiskMark, RiskScore } from "./design/risk/RiskScore";
import { StabilityMark } from "./design/stability/StabilityMark";
import { Term } from "./design/term/Term";
import {
  domainCapabilities,
  levelInDomain,
  domainName,
  find,
  gapsById,
  riskAcross,
  leftCount,
  leftIn,
  openDecisions,
  pickList,
  ruleStanding,
  type Capability,
  type DocketState,
  type Gap,
  type Pick,
} from "./state";

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

/* What the peek says about one thing: its mark, three figures, and the gaps it has, riskiest first. */
/* `within`: the capabilities its gaps are scored on, for its risk; none for a concept, whose gaps keep their risk anywhere. */
type Summary = { name: string; picture?: ReactNode; role?: string | null; where?: string; mark: ReactNode; figures: Figure[]; gaps: Gap[]; within?: Capability[] };

/* Each gap once, as several capabilities can share one through what they're built on. */
const unique = (gaps: Gap[]) => [...new Map(gaps.map((g) => [g.id, g])).values()];

/* The gaps some capabilities have, and how much is left across them, as a feature's or domain's page counts it. */
function across(state: DocketState, capabilities: Capability[], technical = true) {
  const lefts = capabilities.map((c) => leftIn(state, c, technical));
  return {
    left: lefts.reduce((n, l) => n + leftCount(l), 0),
    gaps: unique(lefts.flatMap((l) => [...l.gaps, ...l.technical.map((t) => t.gap)])),
  };
}

const capabilitiesOf = (state: DocketState, ids: string[]) => ids.flatMap((id) => find(state.capabilities, id) ?? []);

function summarize(state: DocketState, at: Pick): Summary | null {
  if (at.kind === "capability") {
    const c = find(state.capabilities, at.id);
    if (!c) return null;
    const left = leftIn(state, c);
    const rules = c.rules.flatMap((id) => find(state.rules, id) ?? []);
    const held = rules.filter((r) => ruleStanding(c, r) !== "gap").length;
    return {
      name: c.name,
      mark: c.stability ? <StabilityMark level={c.stability} feature={c.name} size="extra-long" /> : <span className="faint">Draft</span>,
      figures: [
        { label: "What's left", value: leftCount(left), tab: "left" },
        { label: "Rules held", value: rules.length ? `${held} / ${rules.length}` : 0, tab: "rules" },
        { label: "Personas served", value: c.personas.filter((id) => find(state.personas, id)).length, tab: "overview" },
      ],
      gaps: unique([...left.gaps, ...left.technical.map((t) => t.gap)]),
      within: [c],
    };
  }
  if (at.kind === "feature") {
    const f = find(state.features, at.id);
    if (!f) return null;
    const capabilities = capabilitiesOf(state, f.capabilities);
    const { left, gaps } = across(state, capabilities);
    return {
      name: f.name,
      mark: <Maturity value={f.maturity} of="none of its capabilities has a level" levels={capabilities.map((c) => c.stability)} spreadOf={f.name} />,
      figures: [
        { label: "Capabilities", value: capabilities.length, tab: "capabilities" },
        { label: "What's left", value: openDecisions(f).length + left, tab: "left" },
        { label: "Personas served", value: new Set(capabilities.flatMap((c) => c.personas)).size, tab: "personas" },
      ],
      gaps,
      within: capabilities,
    };
  }
  if (at.kind === "domain") {
    const d = find(state.domains, at.id);
    if (!d) return null;
    const capabilities = domainCapabilities(state, d);
    const { left, gaps } = across(state, capabilities);
    return {
      name: d.name,
      mark: (
        <Maturity
          value={d.maturity}
          subject="domain"
          of="none of its features has a level"
          levels={capabilities.map((c) => levelInDomain(c, d.id))}
          spreadOf={d.name}
        />
      ),
      figures: [
        { label: "Features", value: d.features.length, tab: "features" },
        { label: "Capabilities", value: capabilities.length, tab: "features" },
        { label: "What's left", value: openDecisions(d).length + left, tab: "left" },
      ],
      gaps,
      within: capabilities,
    };
  }
  if (at.kind === "concept") {
    const concept = find(state.concepts, at.id);
    if (!concept) return null;
    const rules = concept.rules.flatMap((id) => find(state.rules, id) ?? []);
    /* A concept has no gaps of its own: those it shows are the ones saying a rule about it doesn't hold yet. */
    const gaps = unique(rules.flatMap((r) => gapsById(state, r.gaps)));
    return {
      name: concept.name,
      where: domainName(state, concept.domain),
      mark: null,
      figures: [
        { label: "Capabilities", value: concept.capabilities.filter((id) => find(state.capabilities, id)).length, tab: "used" },
        { label: "Rules", value: rules.length, tab: "rules" },
        { label: "Rules not held", value: rules.filter((r) => r.gaps.length).length, tab: "rules" },
      ],
      gaps,
    };
  }
  const p = find(state.personas, at.id);
  if (!p) return null;
  const capabilities = capabilitiesOf(state, p.capabilities);
  /* Only what someone using the product would notice. */
  const { left, gaps } = across(state, capabilities, false);
  const { name, role } = personaNameAndRole(p);
  return {
    name,
    role,
    picture: <PersonaAvatar persona={p} size={40} />,
    mark: <ReadinessMark readiness={personaReadiness(state, p)} of={`Readiness for ${name}`} large />,
    figures: [
      { label: "Capabilities", value: capabilities.length, tab: "serves" },
      { label: "Features", value: p.features.length, tab: "readiness" },
      { label: "What's left", value: left, tab: "left" },
    ],
    gaps,
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
  const risk = riskAcross(state, s.gaps, s.within);
  const riskiest = risk.items.slice(0, 3);

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

      {riskiest.length ? (
        <section className="peek-gaps">
          <h3>
            Riskiest <Term id="gap">gaps</Term>
            <RiskScore risk={risk} of={s.name} />
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
          {s.gaps.length > riskiest.length ? (
            <a className="link peek-more" href={page("left")}>
              All {s.gaps.length} gaps
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
