import type { Showing } from "./services/docqet/client";
import { STABILITY_LEVEL_IDS, type StabilityLevelId } from "./components/stability/stability";

/*
 * What the pages hold about the product showing (DocqetState): each doc, put
 * together across its projects, with the figures the server works out for
 * it, as model.ts builds them from the server's resources.
 */

/* A stability level, as state.json and the design components both name it: "ga". */
export type Level = StabilityLevelId;

/* A capability's level: one of the four, or null while it's a draft, declared and not started, as the design components take it. */
export type CapabilityLevel = Level | null;

/*
 * An open decision: a question nobody has answered yet, and a few words on
 * what it's about. Answering one deletes it, so every decision is open.
 */
export type Decision = {
  topic: string | null;
  question: string;
  /*
   * What waits on its answer: expected outcomes, as `outcome:<quality>/<level>/<id>`,
   * and gaps and tradeoffs, by ID, which combining makes its project's, as
   * the docs' lists of them are. Missing from state written before it. It
   * never gives the decision risk.
   */
  affects: string[];
  /*
   * What its answer could change for the people relying on what's there
   * now, rated on a gap's scales but read about the change: all three, or
   * all null when it isn't rated.
   */
  impact: Impact | null;
  likelihood: Likelihood | null;
  reach: Reach | null;
  /* What's at stake in its answer changing what people rely on, as the server scores it: null when it isn't rated. */
  risk: Risk | null;
};

/* What a concept is easily mistaken for: another concept, as linked, or a word that isn't one, and how they differ. */
export type Confusion = { concept: string | null; term: string | null; summary: string };

/*
 * The frontmatter fields that say something rather than link, so each is its
 * contribution's own, as its body is. Each type has some: open decisions on a
 * domain, feature, capability, mechanism or component; a rule's why; what a
 * concept is confused with. A persona has none: what it needs is in its body.
 * Text values are Markdown.
 */
export type Fields = {
  decisions?: Decision[];
  why?: string | null;
  confusedWith?: Confusion[];
};

const FIELD_KEYS = ["decisions", "why", "confusedWith"] as const;

/* Every text a contribution's fields hold, for search. */
export function fieldsText(f: Fields): string {
  const parts: string[] = [];
  for (const key of FIELD_KEYS) {
    const value = f[key];
    if (typeof value === "string") parts.push(value);
    else if (Array.isArray(value))
      for (const v of value)
        parts.push(
          typeof v === "string"
            ? v
            : Object.values(v)
                .filter((x) => typeof x === "string")
                .join(" "),
        );
  }
  return parts.join(" ");
}

/* What one project says about a doc, in one domain: each doc has one from every project and domain that declares it. */
export type Contribution = Fields & {
  /* Where it's defined, and its file, from that project's folder. */
  project: string;
  /* The domain it's written in, which says what its rule and concept links mean. */
  domain: string;
  file: string;
  name: string;
  description?: string;
  /* A persona's role and title, which contributions should agree on as they do on its name. */
  role?: string | null;
  title?: string | null;
  /* Its body: free Markdown, exactly as written, with no structure to rely on. */
  body: string;
};

/*
 * A doc, put together from every contribution to it (see combine). Its ID
 * depends on its type, as the spec's Domains section says: a domain, feature
 * or capability keeps its own ID, one across everything; a rule or concept is
 * `<id>@<domain>`. Its name, description, body and file are its first
 * contribution's.
 */
export type Doc = Fields & {
  id: string;
  /* The project and domain its first contribution is from. */
  project: string;
  domain: string;
  file: string;
  name: string;
  description?: string;
  body: string;
  from: Contribution[];
};

/* A part of the business, with a language of its own. Features and capabilities span domains; each has a part in it. */
export type Domain = Doc & {
  /* The features it has a part in, in the order they come up. */
  features: string[];
  /* The capabilities in no feature that it builds part of. */
  capabilities: string[];
  /* 0 to 100, from its parts of features, or null with none, as the server works it out. */
  maturity: number | null;
  band: Level | null;
  /* Every capability with a part in it: how ready, and how exposed. */
  readiness: Readiness;
  exposure: Exposure;
};

/* One domain's part of a feature: the capabilities that domain builds or lists, and its maturity from their levels there. */
export type Part = { domain: string; capabilities: string[]; maturity: number | null; band: Level | null };

/* A part of what the product offers, grouping the capabilities in it, in every domain that does part of it. */
export type Feature = Doc & {
  capabilities: string[];
  /* Its part in each domain, in the order they come up. */
  parts: Part[];
  /* 0 to 100, from its capabilities, each once at its level in short, or null with none. */
  maturity: number | null;
  band: Level | null;
  /* Its tradeoffs: capabilities we've decided never to build, as it declares them. */
  tradeoffs: string[];
  readiness: Readiness;
  exposure: Exposure;
};

export type Capability = Doc & {
  /* The problems it solves. */
  solves: string[];
  /* The personas it serves: those of the problems it solves. */
  personas: string[];
  /* The initiatives it's part of. In none, it shows only when everything does. */
  initiatives: string[];
  /* Its level in short: the lowest of `levels`, a draft lowest of all. */
  stability: CapabilityLevel;
  /* Its level in each domain that builds part of it, and the project that says so. */
  levels: { project: string; domain: string; level: CapabilityLevel }[];
  /* The feature it's in, or null. */
  feature: string | null;
  rules: string[];
  concepts: string[];
  /* Its product gaps and tradeoffs, as it declares them. */
  gaps: string[];
  tradeoffs: string[];
  /* The mechanisms that apply to it and the components that list it, as `mechanism:<id>` or `component:<id>`, worked out from their `capabilities`. */
  builtBy: string[];
  evidence: Evidence;
  readiness: Readiness;
  exposure: Exposure;
  /* Every gap on it, its own and those of what it's built on, scored on it. */
  risk: RiskAcross<Gap>;
  open: Open;
  /* How it stands on each rule it follows, by the rule's ID, and on each of the rubric's outcomes, by the outcome's. */
  ruleStandings: Record<string, RuleStanding>;
  outcomes: Record<string, OutcomeStanding>;
};

/*
 * How part of the software is built, in the code's words: a mechanism, how
 * something works across a whole project, or a component, one area as the code
 * names it. Neither has a level or a domain; each holds the technical gaps,
 * tradeoffs and open decisions about it. A component lists the capabilities
 * that rely on it; a mechanism applies to every capability its project serves,
 * which the indexer writes as its `capabilities`, or, applying to its
 * product, to every capability any project in the product serves, which
 * combining adds. Projects that declare the same one contribute to it, as with
 * features.
 */
export type TechnicalKind = "mechanism" | "component";
export type TechnicalDoc = Doc & {
  kind: TechnicalKind;
  /* What a mechanism applies to: its project's capabilities, or its product's. A component's is always "project", and means nothing. */
  applies: "project" | "product";
  capabilities: string[];
  /* The expected outcomes it meets for the capabilities it serves, as `outcome:<quality>/<level>/<id>`. */
  meets: string[];
  gaps: string[];
  tradeoffs: string[];
  evidence: Evidence;
  /* What's at stake in its gaps, anywhere they show. */
  risk: RiskAcross<Gap>;
};

/*
 * A place an annotation points at a rule or capability from: the file, the
 * annotation's line, and the first line below it, as written, so it reads the
 * same in any language, test or not. `project` is the repository the file is
 * in, filled in when projects are put together.
 */
export type EvidencePlace = { project?: string; file: string; line: number; text: string };

/* What a rule or capability has as evidence, if anyone gave it any: the places annotated as implementing it, and as verifying it. */
export type Evidence = { implements: EvidencePlace[]; verifies: EvidencePlace[] };

/*
 * A rule belongs to a domain, not to a capability or feature. Capabilities
 * refer to the rules they follow, so `capabilities` can name several, in
 * different features and domains. A feature's rules are its capabilities'.
 */
export type Rule = Doc & {
  /* Every capability that follows it, worked out from their `rules`. */
  capabilities: string[];
  concepts: string[];
  evidence: Evidence;
  /* The gaps that say a capability doesn't hold to it yet, worked out from what they affect. */
  gaps: string[];
  /* How each capability that follows it stands on it, by the capability's ID. */
  standings: Record<string, RuleStanding>;
};

export type Concept = Doc & { capabilities: string[]; rules: string[] };

/*
 * A type of person the software serves, one across every domain. What it
 * relates to is worked out from the problems that name it, and the
 * capabilities that solve those.
 */
export type Persona = Doc & {
  /* How they use the software, such as the role it gives them, and the job title they hold. Either can be null. */
  role: string | null;
  title: string | null;
  /* Its picture's URL. */
  image: string | null;
  /* The problems they have. */
  problems: string[];
  /* Every capability that serves them, and the features those are in. */
  capabilities: string[];
  features: string[];
  /* The initiatives it's part of: whose work they're for. In none, it shows only when everything does. */
  initiatives: string[];
  /* What serves them: how mature, ready and exposed it is. */
  maturity: number | null;
  band: Level | null;
  readiness: Readiness;
  exposure: Exposure;
};

/*
 * A pain point one or more personas share, in their words, never naming the
 * software: why it exists. One across every domain. Capabilities say which
 * problems they solve; nothing solving it is shown as such.
 */
export type Problem = Doc & {
  /* What it costs them or the business, or null when it isn't written down. */
  cost: string | null;
  /* The personas who have it. */
  personas: string[];
  /* Every capability that solves it, drafts among them. */
  capabilities: string[];
  /* What solves it: how mature, ready and exposed it is. */
  maturity: number | null;
  band: Level | null;
  readiness: Readiness;
  exposure: Exposure;
};

/*
 * A body of work, such as the MVP or what comes after it, one across every
 * domain and project. What it relates to is worked out from the capabilities
 * and personas that list it.
 */
export type Initiative = Doc & {
  /* Every capability that lists it, and the features those are in. */
  capabilities: string[];
  features: string[];
  /* Every persona that lists it: who its work is for. */
  personas: string[];
  maturity: number | null;
  band: Level | null;
  readiness: Readiness;
  exposure: Exposure;
};

/*
 * A known gap: something we intend to close, when and how we choose. On a
 * capability, it's what someone using the product would notice; on a mechanism
 * or component, what only someone working on the code would. Its ID is `<type>:<id>#<key>`, and the
 * part before `#` is what it's on.
 */
/*
 * What a gap does to those it reaches when it bites, worst first: how severe it is, whoever it reaches.
 */
export const IMPACTS = ["damaging", "blocking", "inconvenient", "negligible"] as const;
export type Impact = (typeof IMPACTS)[number];
/* How likely it is to bite within a year, most first. */
export const LIKELIHOODS = ["certain", "expected", "possible", "unlikely"] as const;
export type Likelihood = (typeof LIKELIHOODS)[number];
/* What share of the people the software serves it would reach if it bit, most first. */
export const REACHES = ["all", "most", "some", "few"] as const;
export type Reach = (typeof REACHES)[number];

export type Gap = {
  id: string;
  /* The project that declares it. */
  project?: string;
  /* A product gap's domain; a technical gap has none. */
  domain?: string;
  /*
   * What it falls short of: expected outcomes, as
   * `outcome:<quality>/<level>/<id>`, and rules it doesn't hold to yet, as
   * `rule:<id>`, which combining resolves to `rule:<id>@<domain>`.
   */
  affects: string[];
  /* What it does to those it reaches when it bites, how likely it is to bite, and how many it would reach. */
  impact: Impact;
  likelihood: Likelihood;
  reach: Reach;
  /* What falls short, in a few words, and in a sentence or two. */
  name: string;
  description: string;
  /* Where it shows in the code, from `docqet:gap` annotations. */
  places: EvidencePlace[];
  /* What's at stake in leaving it open, what it affects, and the open decisions that affect it. */
  risk: Risk;
  affected: Affected[];
  decisions: HeldDecision[];
};

/* A tradeoff: what we chose, its benefit, and its drawback. On a capability, feature, mechanism or component; its ID is as a gap's. */
export type Tradeoff = {
  id: string;
  project?: string;
  domain?: string;
  /* The expected outcomes it falls short of on purpose, as `outcome:<quality>/<level>/<id>`. */
  affects: string[];
  /* What we chose, in a few words, and in a sentence or two. */
  name: string;
  description: string;
  /* What we hope to get by choosing it, or null when it isn't written down. */
  benefit: string | null;
  /* What we give up or risk in return. */
  drawback: string;
  /* The code it explains, from `docqet:tradeoff` annotations. */
  places: EvidencePlace[];
  affected: Affected[];
  decisions: HeldDecision[];
};

/* The expected outcomes a gap, tradeoff or decision affects, as `outcome:<quality>/<level>/<id>`. */
export const outcomesAffected = (item: { affects: string[] }) => item.affects.filter((ref) => ref.startsWith("outcome:"));

/* The rules a gap affects, as `<id>@<domain>`, once combining has resolved them. */
export const rulesAffected = (gap: Gap) => gap.affects.filter((ref) => ref.startsWith("rule:")).map((ref) => ref.slice("rule:".length));

/* What a gap or tradeoff is on: `capability:room-booking`, from `capability:room-booking#no-waitlist@hotel-bookings`. */
export const subjectOf = (item: { id: string }) => {
  const colon = item.id.indexOf(":");
  return { type: item.id.slice(0, colon), id: item.id.slice(colon + 1, item.id.indexOf("#")) };
};

/*
 * The stability rubric: what each level generally means and expects, by
 * quality, with an entry for every level. An outcome applies from its level
 * up, through `until` where a higher level replaces it. An entry without
 * outcomes expects nothing new at its level, and only guides. It's a
 * guideline, not a gate: implementation and overengineering are examples to
 * judge by.
 */
export type RubricExample = { text: string; kinds: string[] };
export type ExpectedOutcome = {
  /* Its reference, as what affects or meets it names it: `outcome:<quality>/<level>/<id>`. */
  id: string;
  level: Level;
  text: string;
  until: Level | null;
  /* How meeting it might look ("How it might look"), each with the kinds of software it may suit, or none where it isn't tagged. */
  implementation: RubricExample[];
  /* Work that may be more than its level needs, tagged the same way. */
  overengineering: RubricExample[];
};
export type RubricLevel = {
  level: Level;
  /* How much the level asks of the quality, in a sentence, or null where it expects nothing. */
  summary: string | null;
  outcomes: ExpectedOutcome[];
  /* Only where it has no outcomes: how work on the quality might look at this level. */
  implementation: RubricExample[];
  overengineering: RubricExample[];
};
export type RubricQuality = { id: string; name: string; question: string; why: string; levels: RubricLevel[] };
export type RubricKind = { id: string; name: string };
export type Rubric = { kinds: RubricKind[]; qualities: RubricQuality[] };

/* What the indexer found wrong. `domain` is that of the doc it's about, if it's about one. An advisory one is shown, but never fails a check. */
export type Finding = { type: string; subject: string; capabilities: string[]; message: string; domain?: string; advisory: boolean };

/* The findings that fail a check: those that aren't advisory. */
export const failingFindings = (state: DocqetState) => state.findings.filter((f) => !f.advisory);

/* What the page shows at once: the projects it's showing, and everything they define, together. */
export type DocqetState = {
  projects: Project[];
  domains: Domain[];
  features: Feature[];
  capabilities: Capability[];
  rules: Rule[];
  concepts: Concept[];
  personas: Persona[];
  problems: Problem[];
  initiatives: Initiative[];
  mechanisms: TechnicalDoc[];
  components: TechnicalDoc[];
  gaps: Gap[];
  tradeoffs: Tradeoff[];
  findings: Finding[];
  /* The rubric, the same for every project: the first project's, or null if none has one. */
  rubric: Rubric | null;
  /* Everything showing at a glance: its maturity, readiness and exposure, and what's at stake in every gap. */
  status: Status;
  /* What's showing, as the server was asked for it, to ask it more. */
  showing: Showing;
};

/* What's showing at a glance, as the server works it out. */
export type Status = { maturity: number | null; band: Level | null; readiness: Readiness; exposure: Exposure; risk: RiskAcross<Gap> };

/* A place where software is defined, with its maturity from its features alone, as the server works it out. */
export type Project = {
  id: string;
  name: string;
  /* The product it's part of: the one its docqet.yaml declares, or else a product of its own, named for it. */
  product: { id: string; name: string };
  commit: string;
  indexedAt: string;
  maturity: number | null;
  band: Level | null;
};

/* Projects that are shown together, as one product: those that declare the same product. */
export type Product = { id: string; name: string; projects: Project[] };

const LEVEL_ORDER: readonly Level[] = STABILITY_LEVEL_IDS;

/* A level's place in order, a draft before Prototype. */
const rank = (level: CapabilityLevel) => (level === null ? -1 : LEVEL_ORDER.indexOf(level));

/* A rule's or concept's ID without its domain: `booking@billing` is `booking`. */
export const bareId = (id: string) => (id.includes("@") ? id.slice(0, id.lastIndexOf("@")) : id);

/* The rule or concept a link from a doc in `domain` means, keyed as combining keys them: the domain it names, else its own. */
const inDomain = (link: string, domain: string) => (link.includes("@") ? link : `${link}@${domain}`);

/* The projects that contribute to a doc, each once, in order. */
export const docProjects = (doc: Doc) => [...new Set(doc.from.map((f) => f.project))];
/* The domains a doc is written in, each once, in order. */
export const docDomains = (doc: Doc) => [...new Set(doc.from.map((f) => f.domain))];
export const domainName = (state: DocqetState, id: string) => find(state.domains, id)?.name ?? id;
export const projectName = (state: DocqetState, id: string) => find(state.projects, id)?.name ?? id;

/* A feature's part in a domain, if it has one. */
export const partOf = (feature: Feature | undefined, domain: string) => feature?.parts.find((p) => p.domain === domain);

/* Capabilities by ID, in the order given, leaving out any not showing. */
export const capabilitiesById = (state: DocqetState, ids: string[]) => ids.flatMap((id) => find(state.capabilities, id) ?? []);

/* Every capability with a part in a domain: those in its parts of features, and those in no feature. */
export function domainCapabilities(state: DocqetState, domain: Domain): Capability[] {
  const ids = [...domain.features.flatMap((id) => partOf(find(state.features, id), domain.id)?.capabilities ?? []), ...domain.capabilities];
  return capabilitiesById(state, [...new Set(ids)]);
}

/* The contradictions a doc has, and gap or tradeoff IDs its projects both declare, as combining found them. */
export const contradictionsOf = (state: DocqetState, type: string, id: string) =>
  state.findings.filter((p) => (p.type === "contradiction" || p.type === "duplicate-id" || p.type === "in-two-features") && p.subject === `${type}:${id}`);

export function find<T extends { id: string }>(list: T[], id: string): T | undefined {
  return list.find((item) => item.id === id);
}

/* Where a rule applies: each capability that follows it, with the feature it's in, if any. */
export function ruleAppliesTo(state: DocqetState, rule: Rule): { capability: Capability; feature: Feature | null }[] {
  return rule.capabilities.flatMap((id) => {
    const capability = find(state.capabilities, id);
    if (!capability) return [];
    return [{ capability, feature: capability.feature ? (find(state.features, capability.feature) ?? null) : null }];
  });
}

/* Where something is on the canvas: its cards or regions, and the rows in them, if any. */
export type Target = { items: string[]; row?: string };

/* Something the side panel can show and the map can be filtered to. */
export type Pick = { kind: "domain" | "feature" | "capability" | "concept" | "persona"; id: string };

/* A card on the map: a feature's part in a domain, or a capability in no feature, in a domain. */
export const featureCard = (feature: string, domain: string) => `feature:${feature}@${domain}`;
export const capabilityCard = (capability: string, domain: string) => `capability:${capability}@${domain}`;
export const domainGroup = (domain: string) => `domain:${domain}`;
/* A persona's card, above the domains. */
export const personaCard = (persona: string) => `persona:${persona}`;

/* Every card a capability is on: each part of its feature that has it, or its own card in each domain. */
export function cardsOf(state: DocqetState, capabilityId: string): string[] {
  const c = find(state.capabilities, capabilityId);
  if (!c) return [];
  const feature = c.feature ? find(state.features, c.feature) : undefined;
  if (feature) return feature.parts.filter((p) => p.capabilities.includes(c.id)).map((p) => featureCard(feature.id, p.domain));
  return [...new Set(c.levels.map((l) => l.domain))].map((d) => capabilityCard(c.id, d));
}

const rowsOf = (capabilityIds: string[]) => capabilityIds.map((id) => `li[data-capability="${CSS.escape(id)}"]`).join(",");

/* Where a capability is on the canvas: its row in every card it's on. */
export function capabilityTarget(state: DocqetState, capabilityId: string): Target {
  return { items: cardsOf(state, capabilityId), row: rowsOf([capabilityId]) };
}

/* Where a feature is on the canvas: its card in every domain it spans. */
export function featureTarget(state: DocqetState, featureId: string): Target {
  const f = find(state.features, featureId);
  return { items: (f?.parts ?? []).map((p) => featureCard(featureId, p.domain)) };
}

/* The capabilities a concept or persona relates to: those that use the concept, or serve the persona. */
const capabilitiesOf = (state: DocqetState, pick: Pick) =>
  (pick.kind === "persona" ? find(state.personas, pick.id) : find(state.concepts, pick.id))?.capabilities ?? [];

/* Where something the panel shows is on the canvas: a domain's region, a feature's or capability's cards, a concept's capabilities' rows, or a persona's card and those of the capabilities that serve them. */
export function targetOf(state: DocqetState, pick: Pick): Target {
  if (pick.kind === "domain") return { items: [domainGroup(pick.id)] };
  if (pick.kind === "feature") return featureTarget(state, pick.id);
  if (pick.kind === "capability") return capabilityTarget(state, pick.id);
  const users = capabilitiesOf(state, pick);
  const own = pick.kind === "persona" ? [personaCard(pick.id)] : [];
  return { items: [...own, ...new Set(users.flatMap((id) => cardsOf(state, id)))], row: rowsOf(users) };
}

/* Every doc of a pick's kind. */
export const pickList = (state: DocqetState, kind: Pick["kind"]): Doc[] =>
  ({ domain: state.domains, feature: state.features, capability: state.capabilities, concept: state.concepts, persona: state.personas })[kind];

/* A pick's name, as the filter bar and back button say it. */
export function pickName(state: DocqetState, pick: Pick): string {
  return find<Doc>(pickList(state, pick.kind), pick.id)?.name ?? pick.id;
}

/*
 * Capabilities grouped by the feature they're in, features in the order
 * the server lists them, then those in no feature under null.
 */
export function byFeature(state: DocqetState, capabilityIds: string[]): { feature: Feature | null; capabilities: Capability[] }[] {
  const capabilities = capabilityIds.flatMap((id) => find(state.capabilities, id) ?? []);
  const groups = state.features
    .map((feature) => ({ feature: feature as Feature | null, capabilities: capabilities.filter((c) => c.feature === feature.id) }))
    .filter((g) => g.capabilities.length);
  const loose = capabilities.filter((c) => !c.feature);
  return loose.length ? [...groups, { feature: null, capabilities: loose }] : groups;
}

/* The concepts some capabilities use, each once, in the order they first come up. */
export function conceptsOf(state: DocqetState, capabilityIds: string[]): Concept[] {
  const ids = new Set(capabilityIds.flatMap((id) => find(state.capabilities, id)?.concepts ?? []));
  return [...ids].flatMap((id) => find(state.concepts, id) ?? []);
}

/* The concepts a feature's capabilities use. */
export const featureConcepts = (state: DocqetState, feature: Feature) => conceptsOf(state, feature.capabilities);

/*
 * What filtering leaves on the map: everything any of the picks covers. A
 * domain covers its cards and every capability on them, a feature its cards
 * in every domain, a capability the cards it's on, a concept every capability
 * that uses it, and a persona every capability that serves them. Capabilities
 * on those cards that none covers are faded. Null when there's no filter.
 */
export type MapFilter = { capabilities: Set<string>; cards: Set<string> };

export function filterBy(state: DocqetState, picks: Pick[]): MapFilter | null {
  if (!picks.length) return null;
  const capabilities = new Set<string>();
  const cards = new Set<string>();
  const addCapability = (id: string) => {
    capabilities.add(id);
    for (const card of cardsOf(state, id)) cards.add(card);
  };
  for (const pick of picks) {
    if (pick.kind === "domain") {
      const domain = find(state.domains, pick.id);
      for (const id of domain?.capabilities ?? []) {
        capabilities.add(id);
        cards.add(capabilityCard(id, pick.id));
      }
      for (const id of domain?.features ?? []) {
        cards.add(featureCard(id, pick.id));
        for (const c of partOf(find(state.features, id), pick.id)?.capabilities ?? []) capabilities.add(c);
      }
    } else if (pick.kind === "feature") {
      const feature = find(state.features, pick.id);
      for (const p of feature?.parts ?? []) cards.add(featureCard(pick.id, p.domain));
      for (const id of feature?.capabilities ?? []) capabilities.add(id);
    } else if (pick.kind === "capability") {
      addCapability(pick.id);
    } else {
      for (const id of capabilitiesOf(state, pick)) addCapability(id);
      if (pick.kind === "persona") cards.add(personaCard(pick.id));
    }
  }
  /* The people anything left on the map serves stay on it too. */
  for (const p of state.personas) if (p.capabilities.some((id) => capabilities.has(id))) cards.add(personaCard(p.id));
  return { capabilities, cards };
}

const levelIndex = (level: Level) => LEVEL_ORDER.indexOf(level);

/* Whether an expected outcome applies at a level: from its own level up, through `until` where it has one. A draft claims none. */
export const appliesAt = (outcome: ExpectedOutcome, level: CapabilityLevel) =>
  level !== null && levelIndex(outcome.level) <= levelIndex(level) && (!outcome.until || levelIndex(outcome.until) >= levelIndex(level));

/* The level after this one: Prototype after a draft, or null after GA. */
/* A capability's level in a domain: its own there, as it can differ by domain, or else its level in short. */
export const levelInDomain = (c: Capability, domain: string): CapabilityLevel => c.levels.find((l) => l.domain === domain)?.level ?? c.stability;

export const nextLevel = (level: CapabilityLevel): Level | null => LEVEL_ORDER[rank(level) + 1] ?? null;

/* Every outcome of a quality, in level order. */
export const outcomesOf = (quality: RubricQuality) => quality.levels.flatMap((l) => l.outcomes);

/* An expected outcome, with its quality, by its reference: `outcome:<quality>/<level>/<id>`. */
export function expectedOutcome(rubric: Rubric | null, id: string): { outcome: ExpectedOutcome; quality: RubricQuality } | undefined {
  for (const quality of rubric?.qualities ?? []) {
    const outcome = outcomesOf(quality).find((o) => o.id === id);
    if (outcome) return { outcome, quality };
  }
}

/* ——— What's open ——— */

/* The open decisions a doc's contributions list, in order: all of them, since answering one deletes it. */
export const openDecisions = (doc: Doc): Decision[] => doc.from.flatMap((f) => f.decisions ?? []);

/* A doc that holds decisions, with its kind, as a decision's way back to where it was made. */
export type DecisionHolder = { kind: "domain" | "feature" | "capability" | "mechanism" | "component"; doc: Doc };

/*
 * What a gap, tradeoff or decision affects, each found: an expected outcome,
 * with its quality; a rule; a gap; or a tradeoff. Anything that isn't there
 * is left out.
 */
export type Affected =
  | { kind: "outcome"; outcome: ExpectedOutcome; quality: RubricQuality }
  | { kind: "rule"; rule: Rule }
  | { kind: "gap"; gap: Gap }
  | { kind: "tradeoff"; tradeoff: Tradeoff };

export function affectedBy(state: DocqetState, item: { affects: string[] }): Affected[] {
  return item.affects.flatMap((ref): Affected[] => {
    if (ref.startsWith("outcome:")) {
      const named = expectedOutcome(state.rubric, ref);
      return named ? [{ kind: "outcome", ...named }] : [];
    }
    if (ref.startsWith("rule:")) {
      const rule = find(state.rules, ref.slice("rule:".length));
      return rule ? [{ kind: "rule", rule }] : [];
    }
    const gap = state.gaps.find((g) => g.id === ref);
    if (gap) return [{ kind: "gap", gap }];
    const tradeoff = state.tradeoffs.find((t) => t.id === ref);
    return tradeoff ? [{ kind: "tradeoff", tradeoff }] : [];
  });
}

/* An open decision, with the doc it's held on. */
export type HeldDecision = { decision: Decision; on: DecisionHolder };

/* The concept a link from a doc in `domain` means: the one in the domain it names with `@<domain>`, else its own domain's. */
export const conceptLinked = (state: DocqetState, link: string, domain: string): Concept | undefined => find(state.concepts, inDomain(link, domain));

/*
 * Whether a capability holds to a rule it follows: not yet, when one of its
 * gaps names the rule; with evidence, when something verifies or implements
 * the rule; or on trust, when nothing says either way. Following a rule
 * claims it holds, so on trust is the usual standing, not a warning. A gap
 * wins over evidence, since a rule's evidence is about every capability that
 * follows it.
 */
export type RuleStanding = "gap" | "evidence" | "trust";

/* A technical gap under a capability: the gap, and the mechanism or component it's on. */
export type TechnicalGap = { gap: Gap; on: TechnicalDoc };

/*
 * What's still open about a capability: decisions nobody has made, its known
 * gaps, and the technical gaps of what it's built on. Evidence isn't among
 * them: what's declared holds unless a gap says otherwise. Tradeoffs aren't
 * open either: they're decided. What would make it more ready is its
 * improvements, on its readiness.
 */
export type Open = { decisions: Decision[]; gaps: Gap[]; technical: TechnicalGap[] };

/* Gaps or tradeoffs by ID, in the order given. */
export const gapsById = (state: DocqetState, ids: string[]) => ids.flatMap((id) => state.gaps.find((g) => g.id === id) ?? []);
export const tradeoffsById = (state: DocqetState, ids: string[]) => ids.flatMap((id) => state.tradeoffs.find((t) => t.id === id) ?? []);

/* A mechanism or component by its `mechanism:<id>` or `component:<id>` reference. */
export function technicalDoc(state: DocqetState, ref: string): TechnicalDoc | undefined {
  const [kind, id] = [ref.slice(0, ref.indexOf(":")), ref.slice(ref.indexOf(":") + 1)];
  return find(kind === "mechanism" ? state.mechanisms : kind === "component" ? state.components : [], id);
}

/* What a capability is built on: the mechanisms and components that list it. */
export const builtOn = (state: DocqetState, capability: Capability) => capability.builtBy.flatMap((ref) => technicalDoc(state, ref) ?? []);

export const openCount = (open: Open) => open.decisions.length + open.gaps.length + open.technical.length;

/*
 * Where an expected outcome stands for a capability:
 *
 * - gap: a gap on it, or on what it's built on, affects the outcome
 * - tradeoff: a tradeoff on it, or on what it's built on, affects it: not met, by choice
 * - open: an open decision on it, or on what it's built on, affects it: whether to meet it isn't settled
 * - evidence: a mechanism or component it's built on says it meets it
 * - trust: nothing names it, so it counts as met on its level's word
 * - not-expected: its level doesn't expect it
 */
export type OutcomeStanding = {
  standing: "gap" | "tradeoff" | "open" | "evidence" | "trust" | "not-expected";
  gaps: Gap[];
  tradeoffs: Tradeoff[];
  decisions: Decision[];
  by: TechnicalDoc[];
};

/* Whether leaving it open is acceptable, by the third of the scale its risk falls in, worst first. */
export const VERDICTS = ["unacceptable", "tolerable", "acceptable"] as const;
export type Verdict = (typeof VERDICTS)[number];
/* In thirds. */
export const VERDICT_FROM: Record<Verdict, number> = { unacceptable: 67, tolerable: 33, acceptable: 0 };
export const verdictOf = (score: number): Verdict =>
  score >= VERDICT_FROM.unacceptable ? "unacceptable" : score >= VERDICT_FROM.tolerable ? "tolerable" : "acceptable";

/* How it scores on one capability: each part's factor, whether it breaks a claim and that claim's factor (1 where it breaks none), what they multiply to, and that on the scale. */
export type RiskOn = {
  capability: Capability;
  impact: number;
  likelihood: number;
  reach: number;
  weight: number;
  claim: boolean;
  claimFactor: number;
  raw: number;
  score: number;
};
export type Risk = {
  impact: Impact;
  likelihood: Likelihood;
  reach: Reach;
  /* Its highest score on the capabilities it shows on, 0 on none. */
  score: number;
  verdict: Verdict;
  /* Whether it breaks a claim on any capability it shows on. */
  claim: boolean;
  /* Each capability it shows on, highest score first, then most stable. */
  on: RiskOn[];
  capabilities: number;
  /* How many capabilities have each score, highest first: "36 on 2 · 12 on 1". */
  spread: { score: number; capabilities: number }[];
};

/* ——— Readiness ——— */

/*
 * Something that would raise a readiness, and by how much, as the server
 * works it out: promoting a capability to its next level, or every
 * capability in a feature (`feature`) or a domain (`domain`) to its own next
 * level, which raises maturity, or closing a gap or answering a rated
 * decision, which lowers exposure. `capabilities` is where it changes
 * something among those counted: for a promotion of several, those promoted. Readiness, maturity and exposure are what they'd be after it,
 * unrounded, and `gain` how much readiness it adds. `band` is the quarter
 * readiness would move into, or null when it stays in the same one. It's
 * what could be done, not what has to be.
 */
export type Improvement = {
  kind: "promote" | "promote-feature" | "promote-domain" | "close" | "answer";
  capability: Capability | null;
  from: Level | null;
  to: Level | null;
  feature: Feature | null;
  domain: Domain | null;
  gap: Gap | null;
  decision: HeldDecision | null;
  capabilities: Capability[];
  readiness: number;
  maturity: number;
  exposure: number;
  gain: number;
  band: (typeof READINESS_BANDS)[number] | null;
};

/*
 * Somewhere a readiness could rise, as the server works it out, one level
 * below what the readiness is of: a domain, feature or capability among
 * those counted, a gap or decision spanning more than one of them, or, for
 * a capability, one step. `potential` is what readiness would be with all
 * of it settled, every capability in it at GA with nothing open, or its
 * step taken, unrounded; `next` the step in it that would raise readiness
 * most, null when no one step does. Potentials overlap, so they don't add
 * up.
 */
export type Area = {
  kind: "domain" | "feature" | "capability" | "gap" | "decision" | "promotion";
  domain: Domain | null;
  feature: Feature | null;
  capability: Capability | null;
  capabilities: Capability[];
  potential: number;
  next: Improvement | null;
};

/* The gaps that show on a capability: its own, and those of the mechanisms and components it's built on. */
export const gapsOn = (state: DocqetState, capability: Capability) => [
  ...gapsById(state, capability.gaps),
  ...builtOn(state, capability).flatMap((on) => gapsById(state, on.gaps)),
];

/*
 * The readiness of some capabilities, as of a feature, domain, persona or
 * project: a recommendation, 0 to 100, for people to judge by. It's their
 * maturity, each at its level in short, less their exposure:
 * maturity × (1 − exposure). With it, the two it's worked out from, how
 * many are started, the drafts, not started, which never count, and its
 * improvements, what would raise it, most first. Nothing started, it's null.
 */
export type Readiness = {
  percent: number | null;
  /* The quarter it falls in, as the server says, or null with nothing started. */
  band: (typeof READINESS_BANDS)[number] | null;
  maturity: number | null;
  exposure: Exposure;
  /* Each capability's level, null for a draft: what its maturity is worked out from. */
  levels: CapabilityLevel[];
  /* Every gap on them, their own and those of what they're built on, each scored on them: what the exposure is worked out from. */
  gaps: RiskAcross<Gap>;
  started: number;
  notStarted: Capability[];
  improvements: Improvement[];
  /* Where it could rise, one level below what it's of, by how far, most first. */
  areas: Area[];
};

/* How many it's worked out from: the started ones. */
export const startedOf = (r: Readiness) => r.started;

/* Readiness's quarters, named for what they recommend, from the lowest. */
export const READINESS_BANDS = [
  { from: 0, name: "Unready", says: "Most of what they need is still being explored, or what's open on it puts a lot at stake." },
  { from: 25, name: "Partial", says: "Some of it can be used, but much of what they need is still taking shape." },
  { from: 50, name: "Viable", says: "Enough is settled for them to rely on day to day." },
  { from: 75, name: "Ready", says: "What they need is mostly stable, and little is at stake in what's still open." },
] as const;

/* The quarter a readiness falls in, or null with nothing started. */
export const readinessBand = (r: Readiness) => r.band;

/* In the Ready quarter, below it, or null with nothing started. */
export const isReady = (r: Readiness): boolean | null => (r.band === null ? null : r.band.name === "Ready");

/* Readiness from 0 to 1, for putting the least ready first; null with nothing started. */
export const readyShare = (r: Readiness) => (r.percent === null ? null : r.percent / 100);

/*
 * What's at stake across some gaps, as in a capability, feature,
 * domain, persona or component: each one's risk and verdict there, its
 * highest score on the capabilities `within` where given, or its risk
 * anywhere, riskiest first; the highest of those, and its verdict; and how many fall in each
 * verdict. Its score is null with no gaps.
 */
export type RiskAcross<T> = {
  score: number | null;
  verdict: Verdict | null;
  /* Each with where it scores highest among those capabilities, null with none, where it scores 0. */
  items: { item: T; risk: Risk; on: RiskOn | null; score: number; verdict: Verdict }[];
  /* How many fall in each verdict. */
  counts: Record<Verdict, number>;
};

/*
 * Exposure's quarters, its bands: how much the gaps still open on some
 * capabilities put at stake together, as the server works it out, at least
 * moderate while any gap is unacceptable on one of them. It isn't their
 * stability: that's declared, and says how much people can depend on them.
 */
export const RISK_BANDS = [
  { id: "low", from: 0, name: "Low", says: "Little is at stake in its open gaps." },
  { id: "minor", from: 25, name: "Minor", says: "Its open gaps could cost people a little, or seldom." },
  { id: "moderate", from: 50, name: "Moderate", says: "Some of its open gaps could cost people if they bite." },
  { id: "high", from: 75, name: "High", says: "Its open gaps are likely to cost people, or to cost them a lot." },
] as const;
export type RiskBand = (typeof RISK_BANDS)[number];

export type Exposure = { percent: number | null; capabilities: number; band: RiskBand | null; unacceptable: boolean };

/* An exposure as written: whole percents, and "<1%" for a little that rounds to none. */
export const exposureText = (percent: number) => (percent > 0 && percent < 0.5 ? "<1%" : `${Math.round(percent)}%`);

/* A risk score as written. */
export const riskScore = (score: number) => String(score);

/* An impact's place, worst first. */
export const impactRank = (impact: Impact) => IMPACTS.indexOf(impact);

/* Riskiest first: by score, then by spread, comparing each capability's score in turn, highest first. */
export function byRisk(a: Risk, b: Risk): number {
  for (let i = 0; i < Math.max(a.on.length, b.on.length); i++) {
    const d = (b.on[i]?.score ?? -1) - (a.on[i]?.score ?? -1);
    if (d) return d;
  }
  return 0;
}

/* Items in order of their risk, riskiest first, keeping the given order among equals. `of` says which gap each is. */
export function inRiskOrder<T>(items: T[], of: (item: T) => Gap): T[] {
  return [...items].sort((a, b) => byRisk(of(a).risk, of(b).risk));
}

/* ——— Detail pages ——— */

/* What a detail page can show: a doc of the product, a mechanism or component, or every gap and tradeoff at once. */
export type PageAt = Pick | { kind: TechnicalKind | "problem" | "initiative"; id: string } | { kind: "gaps"; id: "" };

const PAGE_KINDS: Exclude<PageAt["kind"], "gaps">[] = [
  "domain",
  "feature",
  "capability",
  "concept",
  "persona",
  "problem",
  "initiative",
  "mechanism",
  "component",
];

/* The product, projects and scope showing, as the address has them, carried over to the pages it links to. */
function showingParams(): URLSearchParams {
  const now = new URLSearchParams(window.location.search);
  const params = new URLSearchParams();
  for (const key of ["product", "project", "scope"]) {
    const value = now.get(key);
    if (value) params.set(key, value);
  }
  return params;
}

/* A detail page, as `?capability=deposits` or `?view=gaps`, showing the same product and projects as this page. */
export function pageHref(pick: PageAt, section?: string): string {
  const params = showingParams();
  if (pick.kind === "gaps") {
    params.set("view", "improvements");
    params.set("tab", "gaps");
  } else params.set(pick.kind, pick.id);
  return `?${params}${section ? `#${section}` : ""}`;
}

/*
 * The map, showing the same product and projects as this page. Given
 * something on the map, it opens with that in the side panel and in view, as
 * `?show=<kind>:<id>`.
 */
export function mapHref(at?: Pick): string {
  const params = showingParams();
  params.set("view", "map");
  if (at) params.set("show", `${at.kind}:${at.id}`);
  return `?${params}`;
}

const PICK_KINDS: Pick["kind"][] = ["domain", "feature", "capability", "concept", "persona"];

/* What the map's address asks it to open, from a detail page's way back. */
export function shownInUrl(): Pick | null {
  const show = new URLSearchParams(window.location.search).get("show") ?? "";
  const at = show.indexOf(":");
  const kind = show.slice(0, at) as Pick["kind"];
  return at > 0 && PICK_KINDS.includes(kind) ? { kind, id: show.slice(at + 1) } : null;
}

/* The detail page the address names, or null for the map. */
export function pageInUrl(): PageAt | null {
  const params = new URLSearchParams(window.location.search);
  if (params.get("view") === "gaps") return { kind: "gaps", id: "" };
  for (const kind of PAGE_KINDS) {
    const id = params.get(kind);
    if (id) return { kind, id } as PageAt;
  }
  return null;
}

/* Gaps or tradeoffs grouped by what they're on, in the order they come, so a list in risk order gives groups with the riskiest first. */
export function bySubject<T extends { id: string }>(items: T[]): { type: string; id: string; items: T[] }[] {
  const groups = new Map<string, { type: string; id: string; items: T[] }>();
  for (const item of items) {
    const on = subjectOf(item);
    const key = `${on.type}:${on.id}`;
    if (!groups.has(key)) groups.set(key, { ...on, items: [] });
    groups.get(key)!.items.push(item);
  }
  return [...groups.values()];
}
