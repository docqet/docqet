import { featureMaturity, maturityBand, projectMaturity } from "./design/maturity/maturity";
import { STABILITY_LEVEL_IDS, type StabilityLevelId } from "./design/stability/stability";

/*
 * The shape of `state.json`, as the spec's "Index output" section describes
 * it, and of the view the page builds from one or more of them (DocketState).
 */

/* A stability level, as state.json and the design components both name it: "ga". */
export type Level = StabilityLevelId;

/* A capability's level: one of the four, or null while it's a draft, declared and not started, as the design components take it. */
export type CapabilityLevel = Level | null;

/* What a closed decision became, as named, and the doc, gap or tradeoff it means here, or null where nothing showing has it. */
export type Became = { ref: string; kind: BecameKind; id: string | null };
export type BecameKind = "domain" | "feature" | "capability" | "rule" | "concept" | "persona" | "mechanism" | "component" | "gap" | "tradeoff";

/*
 * A decision: a question, and a few words on what it's about. While it's
 * open, nobody has answered it. Once it's closed, its answer says what was
 * decided, and `became` names what it was written as: a rule, a capability, a
 * gap, a tradeoff or any other doc, as `<type>:<id>`, or a gap's or
 * tradeoff's own ID. Combining resolves those as `resolved`.
 */
export type Decision = {
  topic: string | null;
  question: string;
  status: "open" | "closed";
  answer: string | null;
  became: string[];
  resolved?: Became[];
};

/* What a concept is easily mistaken for: another concept, as linked, or a word that isn't one, and how they differ. */
export type Confusion = { concept: string | null; term: string | null; text: string };

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
    else if (Array.isArray(value)) for (const v of value) parts.push(typeof v === "string" ? v : Object.values(v).filter(Boolean).join(" "));
  }
  return parts.join(" ");
}

/* What one project says about a doc, in one domain: each doc has one from every project and domain that declares it. */
export type Contribution = Fields & {
  /* Where it's defined, and its file in that project's repository. */
  project: string;
  /* The domain it's written in, which says what its rule and concept links mean. */
  domain: string;
  file: string;
  name: string;
  summary?: string;
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
 * `<id>@<domain>`. Its name, summary, body and file are its first
 * contribution's.
 */
export type Doc = Fields & {
  id: string;
  /* The project and domain its first contribution is from. */
  project: string;
  domain: string;
  file: string;
  name: string;
  summary?: string;
  body: string;
  from: Contribution[];
};

/* A part of the business, with a language of its own. Features and capabilities span domains; each has a part in it. */
export type Domain = Doc & {
  /* The features it has a part in, in the order they come up. */
  features: string[];
  /* The capabilities in no feature that it builds part of. */
  capabilities: string[];
  /* 0 to 100, worked out from its parts of features, or null with none. */
  maturity: number | null;
  band: Level | null;
};

/* One domain's part of a feature: the capabilities that domain builds or lists, and its maturity from their levels there. */
export type Part = { domain: string; capabilities: string[]; maturity: number | null; band: Level | null };

/* A job the product does, grouping the capabilities that do it, in every domain that does part of it. */
export type Feature = Doc & {
  capabilities: string[];
  /* Its part in each domain, in the order they come up. */
  parts: Part[];
  /* 0 to 100, from every part of its capabilities, or null with none. */
  maturity: number | null;
  band: Level | null;
  /* Its tradeoffs: capabilities we've decided never to build, as it declares them. */
  tradeoffs: string[];
};

export type Capability = Doc & {
  /* The personas it serves: who does it, or who it's done for. */
  personas: string[];
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
};

/*
 * How part of the software is built, in the code's words: a mechanism, how
 * something works across a whole project, or a component, one area as the code
 * names it. Neither has a level or a domain; each holds the technical gaps,
 * tradeoffs and open decisions about it. A component lists the capabilities
 * that rely on it; a mechanism applies to every capability its project serves,
 * which the indexer writes as its `capabilities`, or, applying to its
 * platform, to every capability any project on the platform serves, which
 * combining adds. Projects that declare the same one contribute to it, as with
 * features.
 */
export type TechnicalKind = "mechanism" | "component";
export type TechnicalDoc = Doc & {
  kind: TechnicalKind;
  /* What a mechanism applies to: its project's capabilities, or its platform's. A component's is always "project", and means nothing. */
  applies: "project" | "platform";
  capabilities: string[];
  /* The checklist outcomes it meets for the capabilities it serves, as `<quality>/<level>/<id>`. */
  meets: string[];
  gaps: string[];
  tradeoffs: string[];
  evidence: Evidence;
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
  /* The gaps that say a capability doesn't hold to it yet, worked out from their `rule`. */
  gaps: string[];
};

export type Concept = Doc & { capabilities: string[]; rules: string[] };
/* A concept as state.json has it: its `description` is what readers show under its name, as other docs' `summary` is. */
type RawConcept = Omit<Raw<Concept>, "summary"> & { description?: string };

/*
 * A type of person the software serves, one across every domain. What it
 * relates to is worked out from the capabilities that list it.
 */
export type Persona = Doc & {
  /* How they use the software, such as the role it gives them, and the job title they hold. Either can be null. */
  role: string | null;
  title: string | null;
  /* Its picture's URL. */
  image: string | null;
  /* Every capability that lists it, and the features those are in. */
  capabilities: string[];
  features: string[];
  /* How ready the software is for them, 0 to 100: the maturity of every capability that serves them, or null with none. */
  readiness: number | null;
};

/*
 * A known gap: something we intend to close, when and how we choose. On a
 * capability, it's what someone using the product would notice; on a mechanism
 * or component, what only someone working on the code would. Its ID is `<type>:<id>#<key>`, and the
 * part before `#` is what it's on.
 */
export type Gap = {
  id: string;
  /* Combining adds it: state.json doesn't say, since the file is the project's. */
  project?: string;
  /* A product gap's domain; a technical gap has none. */
  domain?: string;
  /* The stability checklist outcome it falls short of, as `<quality>/<level>/<id>`, or null. */
  outcome: string | null;
  /* The rule it doesn't hold to yet, as written; combining resolves it to `<id>@<domain>`. */
  rule: string | null;
  text: string;
  /* Where it shows in the code, from `docket:gap` annotations. */
  places: EvidencePlace[];
};

/* A tradeoff: what we chose, what it gains us, and what it costs. On a capability, feature, mechanism or component; its ID is as a gap's. */
export type Tradeoff = {
  id: string;
  project?: string;
  domain?: string;
  text: string;
  /* What we hope to get by choosing it. Missing from state written before it, and optional in the docs. */
  gain?: string | null;
  cost: string;
  /* The code it explains, from `docket:tradeoff` annotations. */
  places: EvidencePlace[];
};

/* What a gap or tradeoff is on: `capability:room-booking`, from `capability:room-booking#no-waitlist@hotel-bookings`. */
export const subjectOf = (item: { id: string }) => {
  const colon = item.id.indexOf(":");
  return { type: item.id.slice(0, colon), id: item.id.slice(colon + 1, item.id.indexOf("#")) };
};

/*
 * The stability checklist: what each level generally means and expects, by
 * quality, with an entry for every level. An outcome applies from its level
 * up, through `until` where a higher level replaces it. An entry without
 * outcomes expects nothing new at its level, and only guides. Baseline
 * outcomes hold at every level and are never a gap. It's a guideline, not a
 * gate: implementation and overengineering are examples to judge by.
 */
export type ChecklistExample = { text: string; kinds: string[] };
export type ChecklistOutcome = {
  id: string;
  level: Level;
  text: string;
  until: Level | null;
  baseline: boolean;
  /* How meeting it might look ("How it might look"), each with the kinds of software it may suit, or none where it isn't tagged. */
  implementation: ChecklistExample[];
  /* Work that may be more than its level needs, tagged the same way. */
  overengineering: ChecklistExample[];
};
export type ChecklistLevel = {
  level: Level;
  /* How much the level asks of the quality, in a sentence, or null where it expects nothing. */
  summary: string | null;
  outcomes: ChecklistOutcome[];
  /* Only where it has no outcomes: how work on the quality might look at this level. */
  implementation: ChecklistExample[];
  overengineering: ChecklistExample[];
};
export type ChecklistQuality = { id: string; name: string; question: string; why: string; levels: ChecklistLevel[] };
export type ChecklistKind = { id: string; name: string };
export type Checklist = { kinds: ChecklistKind[]; qualities: ChecklistQuality[] };

/* What the indexer found wrong. `domain` is that of the doc it's about, if it's about one. */
export type Problem = { type: string; subject: string; capabilities: string[]; message: string; domain?: string };

/* What the page shows at once: the projects it's showing, and everything they define, together. */
export type DocketState = {
  projects: Project[];
  domains: Domain[];
  features: Feature[];
  capabilities: Capability[];
  rules: Rule[];
  concepts: Concept[];
  personas: Persona[];
  mechanisms: TechnicalDoc[];
  components: TechnicalDoc[];
  gaps: Gap[];
  tradeoffs: Tradeoff[];
  problems: Problem[];
  /* The stability checklist, the same for every project: the first project's, or null if none has one. */
  checklist: Checklist | null;
};

/* A place where software is defined, as its state.json's header and summary have it. */
export type Project = {
  id: string;
  name: string;
  /* The platform it's part of: the one its docket.yaml declares, or else a platform of its own, named for it. */
  platform: { id: string; name: string };
  commit: string;
  indexedAt: string;
  maturity: number | null;
  band: Level | null;
};

/* A doc as one project's state.json has it: its contribution in one domain, with links as declared. */
type Raw<T extends Doc> = Omit<T, "from" | "levels" | "parts" | "project" | "builtBy">;

/* One project's state.json, as the indexer writes it. */
export type StateFile = {
  docket: string;
  project: { id: string; name: string };
  /* Missing when the project declares no platform, and from state written before platforms. */
  platform?: { id: string; name: string };
  commit: string;
  indexedAt: string;
  summary: { maturity: number | null; band: Level | null };
  /* Each of its domain.md files. A domain is its own domain, so these have no `domain`. */
  domains: Omit<Raw<Domain>, "domain" | "features" | "capabilities">[];
  /* `tradeoffs` is missing from state written before tradeoffs. */
  features: (Omit<Raw<Feature>, "tradeoffs"> & { tradeoffs?: string[] })[];
  /* A draft's `stability` is "draft". */
  capabilities: (Omit<Raw<Capability>, "stability" | "tradeoffs"> & { stability: Level | "draft"; tradeoffs?: string[] })[];
  rules: Omit<Raw<Rule>, "gaps">[];
  concepts: RawConcept[];
  /* Personas aren't in a domain, so these have no `domain`. Missing from state written before personas. */
  personas?: Omit<Raw<Persona>, "domain">[];
  /* Technical docs aren't in a domain either. Missing from state written before them, as is `tradeoffs`. */
  /* `applies` is missing from state written before it, meaning "project". */
  mechanisms?: (Omit<Raw<TechnicalDoc>, "domain" | "kind" | "applies"> & { applies?: "project" | "platform" })[];
  /* A component's `description` is what readers show under its name, as a mechanism's `summary` is. */
  components?: (Omit<Raw<TechnicalDoc>, "domain" | "kind" | "summary" | "applies"> & { description?: string })[];
  gaps: Gap[];
  tradeoffs?: Tradeoff[];
  problems: Problem[];
  /* Missing from state written before the checklist. */
  checklist?: Checklist;
};

/* A project's header and summary, from its state.json. */
export const projectOf = (file: StateFile): Project => ({
  ...file.project,
  platform: file.platform ?? file.project,
  commit: file.commit,
  indexedAt: file.indexedAt,
  maturity: file.summary.maturity,
  band: file.summary.band,
});

/* Projects that are shown together, as one product: those that declare the same platform. */
export type Platform = { id: string; name: string; projects: Project[] };

/* Every platform, in the order their first projects are read, each with its projects in order. Its name is its first project's to say. */
export function platformsOf(all: Project[]): Platform[] {
  const platforms: Platform[] = [];
  for (const p of all) {
    const platform = platforms.find((x) => x.id === p.platform.id);
    if (platform) platform.projects.push(p);
    else platforms.push({ ...p.platform, projects: [p] });
  }
  return platforms;
}

const LEVEL_ORDER: readonly Level[] = STABILITY_LEVEL_IDS;

/* A level's place in order, a draft before Prototype. */
const rank = (level: CapabilityLevel) => (level === null ? -1 : LEVEL_ORDER.indexOf(level));

/* A rule's or concept's ID without its domain: `booking@billing` is `booking`. */
export const bareId = (id: string) => (id.includes("@") ? id.slice(0, id.lastIndexOf("@")) : id);

/* Add one project's evidence, missing from state written before evidence, without repeating a place a doc's other entry already added. */
const addEvidence = (into: Evidence, from: Evidence | undefined, project: string) => {
  for (const verb of ["implements", "verifies"] as const)
    for (const e of from?.[verb] ?? [])
      if (!into[verb].some((x) => x.project === project && x.file === e.file && x.line === e.line)) into[verb].push({ ...e, project });
};

/* Add what isn't there yet, keeping the order. */
const union = (into: string[], ids: string[]) => {
  for (const id of ids) if (!into.includes(id)) into.push(id);
};

const band = (m: number | null) => (m === null ? null : maturityBand(m));

/*
 * What the chosen projects define, from each one's state, as one, the
 * way the spec's "Combining" says, so the map, search and panels show one
 * picture of the product:
 *
 * - Domains, features and capabilities are one across everything, so
 *   contributions with the same ID are put together, their links combined.
 *   Features and capabilities span domains: each domain that writes one has
 *   a part in it, and a capability keeps its level in each.
 * - Rules and concepts are their domain's, keyed `<id>@<domain>`, so the same
 *   ID in two domains is two definitions. A link to one means its own
 *   domain's, else the only one, else it's ambiguous.
 *
 * Then reverse links, parts and maturity are worked out again across
 * everything, and the contradictions between contributions become problems.
 */
export function combine(files: StateFile[]): DocketState {
  const state: DocketState = {
    projects: [],
    domains: [],
    features: [],
    capabilities: [],
    rules: [],
    concepts: [],
    personas: [],
    mechanisms: [],
    components: [],
    gaps: [],
    tradeoffs: [],
    problems: [],
    checklist: files.find((f) => f.checklist)?.checklist ?? null,
  };
  /* Rule and concept links as declared, to resolve once every domain is in. */
  const pending: { from: Doc & { rules?: string[]; concepts: string[] }; domain: string; rules: string[]; concepts: string[] }[] = [];
  /* Who lists what, to find a capability in two features. */
  const listings = new Map<string, { parent: string; project: string }[]>();
  const listed = (child: string, parent: string, project: string) =>
    listings.set(child, [...(listings.get(child) ?? []), { parent, project }]);
  /* Which capabilities each domain lists in each feature. */
  const featureLists = new Map<string, { domain: string; capabilities: string[] }[]>();
  /* What each platform's projects serve, and the mechanisms that apply across one, to put together once every project is in. */
  const platformServes = new Map<string, string[]>();
  const acrossPlatform: { doc: TechnicalDoc; platform: string }[] = [];

  /* Add one project's contribution to the doc with this ID, making it if it's the first. */
  function contribute<T extends Doc>(list: T[], id: string, project: string, raw: Omit<Raw<Doc>, "domain"> & { domain: string }, make: (base: Doc) => T): T {
    const from: Contribution = { project, domain: raw.domain, file: raw.file, name: raw.name, summary: raw.summary, body: raw.body ?? "" };
    for (const key of FIELD_KEYS) if (key in raw) Object.assign(from, { [key]: raw[key] });
    /* Decisions from state written before they could close are open. */
    if (from.decisions)
      from.decisions = from.decisions.map((d) => ({ topic: d.topic ?? null, question: d.question, status: d.status ?? "open", answer: d.answer ?? null, became: d.became ?? [] }));
    if ("role" in raw || "title" in raw) {
      const who = raw as { role?: string | null; title?: string | null };
      from.role = who.role ?? null;
      from.title = who.title ?? null;
    }
    let doc = find(list, id);
    if (!doc) {
      doc = make({ ...from, id, from: [] });
      list.push(doc);
    }
    doc.from.push(from);
    return doc;
  }
  const newDomain = (base: Doc): Domain => ({ ...base, features: [], capabilities: [], maturity: null, band: null });

  for (const file of files) {
    const project = file.project.id;
    const platform = projectOf(file).platform.id;
    state.projects.push(projectOf(file));
    /* What a project serves, as a mechanism's `capabilities` are worked out: what it declares, other than drafts, and what its components list. */
    const serves = platformServes.get(platform) ?? [];
    union(serves, file.capabilities.filter((c) => c.stability !== "draft").map((c) => c.id));
    for (const c of file.components ?? []) union(serves, c.capabilities);
    platformServes.set(platform, serves);
    for (const d of file.domains) contribute(state.domains, d.id, project, { ...d, domain: d.id }, newDomain);
    /* A gap's or tradeoff's ID is its project's, as the docs' lists below name them. */
    const own = (ids: string[] | undefined) => (ids ?? []).map((id) => `${id}@${project}`);
    for (const f of file.features) {
      const feature = contribute(state.features, f.id, project, f, (base) => ({ ...base, capabilities: [], parts: [], maturity: null, band: null, tradeoffs: [] }));
      union(feature.capabilities, f.capabilities);
      union(feature.tradeoffs, own(f.tradeoffs));
      for (const c of f.capabilities) listed(`capability:${c}`, f.id, project);
      featureLists.set(f.id, [...(featureLists.get(f.id) ?? []), { domain: f.domain, capabilities: f.capabilities }]);
    }
    for (const c of file.capabilities) {
      const level = c.stability === "draft" ? null : c.stability;
      const capability = contribute(state.capabilities, c.id, project, c, (base) => ({
        ...base,
        personas: [],
        stability: level,
        levels: [],
        feature: null,
        rules: [],
        concepts: [],
        gaps: [],
        tradeoffs: [],
        builtBy: [],
        evidence: { implements: [], verifies: [] },
      }));
      addEvidence(capability.evidence, c.evidence, project);
      capability.levels.push({ project, domain: c.domain, level });
      union(capability.personas, c.personas ?? []);
      union(capability.gaps, own(c.gaps));
      union(capability.tradeoffs, own(c.tradeoffs));
      pending.push({ from: capability, domain: c.domain, rules: c.rules, concepts: c.concepts });
    }
    for (const r of file.rules) {
      const rule = contribute(state.rules, `${r.id}@${r.domain}`, project, r, (base) => ({
        ...base,
        capabilities: [],
        concepts: [],
        evidence: { implements: [], verifies: [] },
        gaps: [],
      }));
      addEvidence(rule.evidence, r.evidence, project);
      pending.push({ from: rule, domain: r.domain, rules: [], concepts: r.concepts });
    }
    for (const c of file.concepts) {
      contribute(state.concepts, `${c.id}@${c.domain}`, project, { ...c, summary: c.description }, (base) => ({ ...base, capabilities: [], rules: [] }));
    }
    /* A persona is in no domain; its contributions are told apart by project, as a domain's are. */
    for (const p of file.personas ?? []) {
      contribute(state.personas, p.id, project, { ...p, domain: "" }, (base) => ({
        ...base,
        role: p.role ?? null,
        title: p.title ?? null,
        image: p.image ?? null,
        capabilities: [],
        features: [],
        readiness: null,
      }));
    }
    /* Mechanisms and components are in no domain; their contributions are told apart by project, as a persona's are. */
    for (const kind of ["mechanism", "component"] as const) {
      const entries =
        kind === "mechanism"
          ? (file.mechanisms ?? []).map((e) => ({ ...e, applies: e.applies ?? ("project" as const) }))
          : (file.components ?? []).map(({ description, ...e }) => ({ ...e, summary: description, applies: "project" as const }));
      for (const e of entries) {
        const doc = contribute(kind === "mechanism" ? state.mechanisms : state.components, e.id, project, { ...e, domain: "" }, (base) => ({
          ...base,
          kind,
          applies: "project" as const,
          capabilities: [],
          meets: [],
          gaps: [],
          tradeoffs: [],
          evidence: { implements: [], verifies: [] },
        }));
        union(doc.capabilities, e.capabilities);
        if (e.applies === "platform") {
          doc.applies = "platform";
          acrossPlatform.push({ doc, platform });
        }
        union(doc.meets, e.meets);
        union(doc.gaps, own(e.gaps));
        union(doc.tradeoffs, own(e.tradeoffs));
        addEvidence(doc.evidence, e.evidence, project);
      }
    }
    /* Each place in the code a gap or tradeoff names says which repository it's in, as evidence does. */
    const placed = (places: EvidencePlace[] | undefined) => (places ?? []).map((p) => ({ ...p, project }));
    state.gaps.push(...file.gaps.map((g) => ({ ...g, project, id: `${g.id}@${project}`, places: placed(g.places) })));
    state.tradeoffs.push(...(file.tradeoffs ?? []).map((t) => ({ ...t, project, id: `${t.id}@${project}`, places: placed(t.places) })));
    /* A rule or concept a problem names is its domain's. */
    const subject = (p: Problem) => {
      const type = p.subject.slice(0, p.subject.indexOf(":"));
      return (type === "rule" || type === "concept") && p.domain ? `${p.subject}@${p.domain}` : p.subject;
    };
    state.problems.push(...file.problems.map((p) => ({ ...p, subject: subject(p) })));
  }

  /* A domain docs are written in, with no domain.md showing, still gets a place, named by its ID. */
  for (const doc of [...state.features, ...state.capabilities, ...state.rules, ...state.concepts]) {
    for (const f of doc.from) {
      if (!find(state.domains, f.domain)) {
        state.domains.push(newDomain({ id: f.domain, project: f.project, domain: f.domain, file: "", name: f.domain, body: "", from: [] }));
      }
    }
  }

  const domainName = (id: string) => find(state.domains, id)?.name ?? id;
  const projectName = (id: string) => find(state.projects, id)?.name ?? id;

  /* Links to rules and concepts: the one named, its own domain's, else the only one. */
  for (const p of pending) {
    const resolve = (list: Doc[], link: string): string[] => {
      if (link.includes("@")) return find(list, link) ? [link] : [];
      if (find(list, `${link}@${p.domain}`)) return [`${link}@${p.domain}`];
      const matches = list.filter((d) => bareId(d.id) === link);
      if (matches.length > 1) {
        const capability = state.capabilities.includes(p.from as Capability);
        state.problems.push({
          type: "ambiguous-link",
          subject: capability ? `capability:${p.from.id}` : `rule:${p.from.id}`,
          capabilities: capability ? [p.from.id] : [],
          message: `${p.from.name}, in ${domainName(p.domain)}, names ${link}, which ${list_(matches.map((m) => domainName(m.domain)))} each have. Name the domain, as ${link}@<domain>.`,
        });
      }
      return matches.length === 1 ? [matches[0].id] : [];
    };
    if ("rules" in p.from && p.from.rules) union(p.from.rules, p.rules.flatMap((l) => resolve(state.rules, l)));
    union(p.from.concepts, p.concepts.flatMap((l) => resolve(state.concepts, l)));
  }

  /* A mechanism that applies across its platform applies to what every project on it serves, which no one project's indexer can see. */
  for (const { doc, platform } of acrossPlatform) union(doc.capabilities, platformServes.get(platform) ?? []);

  /* Reverse links, worked out again across everything. */
  for (const c of state.capabilities) {
    for (const id of c.rules) union(find(state.rules, id)?.capabilities ?? [], [c.id]);
    for (const id of c.concepts) union(find(state.concepts, id)?.capabilities ?? [], [c.id]);
  }
  for (const r of state.rules) for (const id of r.concepts) union(find(state.concepts, id)?.rules ?? [], [r.id]);
  for (const e of [...state.mechanisms, ...state.components]) {
    for (const id of e.capabilities) union(find(state.capabilities, id)?.builtBy ?? [], [`${e.kind}:${e.id}`]);
  }
  /* A gap's rule means its own domain's, else the only one with that ID, as a capability's link to one does. */
  for (const g of state.gaps) {
    if (!g.rule) continue;
    const matches = g.rule.includes("@") ? state.rules.filter((r) => r.id === g.rule) : state.rules.filter((r) => bareId(r.id) === g.rule);
    const rule = matches.find((r) => r.domain === g.domain) ?? (matches.length === 1 ? matches[0] : undefined);
    g.rule = rule?.id ?? null;
    if (rule) union(rule.gaps, [g.id]);
  }

  /*
   * What each closed decision became: a gap or tradeoff by its ID, preferring
   * the decision's own project's; a rule or concept as a link to one is
   * resolved from the decision's domain; anything else by its ID.
   */
  const lists: Record<string, { id: string }[]> = {
    domain: state.domains, feature: state.features, capability: state.capabilities, persona: state.personas,
    rule: state.rules, concept: state.concepts, mechanism: state.mechanisms, component: state.components,
  };
  const becameOf = (ref: string, f: Contribution): Became => {
    if (ref.includes("#")) {
      for (const [kind, items] of [["gap", state.gaps], ["tradeoff", state.tradeoffs]] as const) {
        const hit = items.find((i) => i.id === `${ref}@${f.project}`) ?? items.find((i) => i.id.startsWith(`${ref}@`));
        if (hit) return { ref, kind, id: hit.id };
      }
      return { ref, kind: "gap", id: null };
    }
    const kind = ref.slice(0, ref.indexOf(":")) as BecameKind;
    const id = ref.slice(ref.indexOf(":") + 1);
    const list = lists[kind] ?? [];
    if (kind === "rule" || kind === "concept") {
      const docs = list as Doc[];
      if (id.includes("@")) return { ref, kind, id: find(docs, id)?.id ?? null };
      const matches = docs.filter((d) => bareId(d.id) === id);
      const hit = matches.find((d) => d.domain === f.domain) ?? (matches.length === 1 ? matches[0] : undefined);
      return { ref, kind, id: hit?.id ?? null };
    }
    return { ref, kind, id: find(list, id)?.id ?? null };
  };
  for (const doc of [...state.domains, ...state.features, ...state.capabilities, ...state.mechanisms, ...state.components])
    for (const f of doc.from) for (const d of f.decisions ?? []) d.resolved = d.became.map((ref) => becameOf(ref, f));

  /* Which feature each capability is in: the first listing, with a contradiction when projects list it in different ones. */
  for (const c of state.capabilities) {
    const all = listings.get(`capability:${c.id}`) ?? [];
    const parents = [...new Set(all.map((l) => l.parent))];
    if (parents.length > 1 && new Set(all.map((l) => l.project)).size > 1) {
      state.problems.push({
        type: "in-two-features",
        subject: `capability:${c.id}`,
        capabilities: [c.id],
        message: `Listed in ${parents.length} features: ${all.map((l) => `${l.parent} in ${projectName(l.project)}`).join(", ")}.`,
      });
    }
    c.feature = parents[0] ?? null;
    c.stability = c.levels.reduce((low, l) => (rank(l.level) < rank(low) ? l.level : low), c.levels[0].level);
  }

  /*
   * Each feature's part in each domain: the capabilities that domain builds,
   * or lists in its own doc of the feature, with its maturity from their
   * levels in that domain alone. The feature's maturity counts every part.
   */
  const levelsIn = (id: string, domain?: string) =>
    (find(state.capabilities, id)?.levels ?? []).filter((l) => !domain || l.domain === domain).map((l) => l.level);
  for (const f of state.features) {
    const domains: string[] = [];
    for (const l of featureLists.get(f.id) ?? []) union(domains, [l.domain]);
    for (const id of f.capabilities) union(domains, (find(state.capabilities, id)?.levels ?? []).map((l) => l.domain));
    for (const domain of domains) {
      const listedThere = (featureLists.get(f.id) ?? []).filter((l) => l.domain === domain).flatMap((l) => l.capabilities);
      const capabilities = f.capabilities.filter((id) => listedThere.includes(id) || levelsIn(id, domain).length);
      const maturity = featureMaturity(capabilities.flatMap((id) => levelsIn(id, domain)));
      f.parts.push({ domain, capabilities, maturity, band: band(maturity) });
      union(find(state.domains, domain)?.features ?? [], [f.id]);
    }
    f.maturity = featureMaturity(f.capabilities.flatMap((id) => levelsIn(id)));
    f.band = band(f.maturity);
  }
  for (const c of state.capabilities) {
    if (!c.feature) for (const l of c.levels) union(find(state.domains, l.domain)?.capabilities ?? [], [c.id]);
  }
  /* Each persona's capabilities, their features, and their readiness: those capabilities' maturity, from their levels in every domain, as a feature's is. */
  for (const c of state.capabilities) for (const id of c.personas) union(find(state.personas, id)?.capabilities ?? [], [c.id]);
  for (const p of state.personas) {
    union(p.features, state.features.filter((f) => p.capabilities.some((id) => f.capabilities.includes(id))).map((f) => f.id));
    p.readiness = featureMaturity(p.capabilities.flatMap((id) => levelsIn(id)));
  }
  for (const d of state.domains) {
    d.maturity = projectMaturity(d.features.map((id) => partOf(find(state.features, id), d.id)?.maturity ?? null));
    d.band = band(d.maturity);
  }

  /* Contradictions: a product doc whose name or summary differs between contributions, or a rule or concept within one domain, where a rule is its name and body. */
  const differing = (type: string, docs: Doc[]) => {
    for (const doc of docs) {
      const said = new Set(doc.from.map((f) => [f.name, f.role ?? "", f.title ?? "", f.summary ?? "", type === "rule" ? f.body : ""].join("\n")));
      if (said.size < 2) continue;
      const who = list_(docProjects(doc).map(projectName));
      state.problems.push({
        type: "contradiction",
        subject: `${type}:${doc.id}`,
        capabilities: type === "capability" ? [doc.id] : [],
        message: `${who} describe ${doc.name} differently.`,
      });
    }
  };
  differing("domain", state.domains);
  differing("feature", state.features);
  differing("capability", state.capabilities);
  differing("rule", state.rules);
  differing("concept", state.concepts);
  differing("persona", state.personas);
  differing("mechanism", state.mechanisms);
  differing("component", state.components);
  return state;
}

/* "A", "A and B", "A, B and C". */
const list_ = (names: string[]) =>
  names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : (names[0] ?? "");

/* The projects that contribute to a doc, each once, in order. */
export const docProjects = (doc: Doc) => [...new Set(doc.from.map((f) => f.project))];
/* The domains a doc is written in, each once, in order. */
export const docDomains = (doc: Doc) => [...new Set(doc.from.map((f) => f.domain))];
export const domainName = (state: DocketState, id: string) => find(state.domains, id)?.name ?? id;
export const projectName = (state: DocketState, id: string) => find(state.projects, id)?.name ?? id;

/* The maturity of everything showing: one project's, or several's worked out from all their parts of features the same way. */
export const maturityOf = (state: DocketState): number | null =>
  state.projects.length === 1
    ? state.projects[0].maturity
    : projectMaturity(state.features.flatMap((f) => f.parts.map((p) => p.maturity)));

/* How ready a feature is for a persona: the maturity of just the capabilities in it that serve them. */
export function personaReadinessIn(state: DocketState, persona: Persona, feature: Feature): number | null {
  const ids = feature.capabilities.filter((id) => persona.capabilities.includes(id));
  return featureMaturity(ids.flatMap((id) => (find(state.capabilities, id)?.levels ?? []).map((l) => l.level)));
}

/* A feature's part in a domain, if it has one. */
export const partOf = (feature: Feature | undefined, domain: string) => feature?.parts.find((p) => p.domain === domain);

/* The contradictions and ambiguous links a doc has, as combining found them. */
export const contradictionsOf = (state: DocketState, type: string, id: string) =>
  state.problems.filter(
    (p) =>
      (p.type === "contradiction" || p.type === "ambiguous-link" || p.type === "in-two-features") &&
      p.subject === `${type}:${id}`,
  );

const isJson = (response: Response) => response.headers.get("content-type")?.includes("json") ?? false;

/*
 * Where each project's state.json is, relative to the page, as
 * `projects.json` beside it lists them. With no such file, the page shows the
 * one `state.json` beside it, so the list is empty.
 */
export async function loadProjects(): Promise<string[]> {
  const response = await fetch("./projects.json", { cache: "no-store" });
  /* Some servers answer a missing file with the page itself. */
  if (response.status === 404 || (response.ok && !isJson(response))) return [];
  if (!response.ok) throw new Error(`projects.json: ${response.status} ${response.statusText}`);
  return ((await response.json()) as { projects: { state: string }[] }).projects.map((p) => p.state);
}

export async function loadState(path = "./state.json"): Promise<StateFile> {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw new Error(`${path}: ${response.status} ${response.statusText}`);
  return (await response.json()) as StateFile;
}

export function find<T extends { id: string }>(list: T[], id: string): T | undefined {
  return list.find((item) => item.id === id);
}

/* Where a rule applies: each capability that follows it, with the feature it's in, if any. */
export function ruleAppliesTo(state: DocketState, rule: Rule): { capability: Capability; feature: Feature | null }[] {
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
export function cardsOf(state: DocketState, capabilityId: string): string[] {
  const c = find(state.capabilities, capabilityId);
  if (!c) return [];
  const feature = c.feature ? find(state.features, c.feature) : undefined;
  if (feature) return feature.parts.filter((p) => p.capabilities.includes(c.id)).map((p) => featureCard(feature.id, p.domain));
  return [...new Set(c.levels.map((l) => l.domain))].map((d) => capabilityCard(c.id, d));
}

const rowsOf = (capabilityIds: string[]) => capabilityIds.map((id) => `li[data-capability="${CSS.escape(id)}"]`).join(",");

/* Where a capability is on the canvas: its row in every card it's on. */
export function capabilityTarget(state: DocketState, capabilityId: string): Target {
  return { items: cardsOf(state, capabilityId), row: rowsOf([capabilityId]) };
}

/* Where a feature is on the canvas: its card in every domain it spans. */
export function featureTarget(state: DocketState, featureId: string): Target {
  const f = find(state.features, featureId);
  return { items: (f?.parts ?? []).map((p) => featureCard(featureId, p.domain)) };
}

/* The capabilities a concept or persona relates to: those that use the concept, or serve the persona. */
const capabilitiesOf = (state: DocketState, pick: Pick) =>
  (pick.kind === "persona" ? find(state.personas, pick.id) : find(state.concepts, pick.id))?.capabilities ?? [];

/* Where something the panel shows is on the canvas: a domain's region, a feature's or capability's cards, a concept's capabilities' rows, or a persona's card and those of the capabilities that serve them. */
export function targetOf(state: DocketState, pick: Pick): Target {
  if (pick.kind === "domain") return { items: [domainGroup(pick.id)] };
  if (pick.kind === "feature") return featureTarget(state, pick.id);
  if (pick.kind === "capability") return capabilityTarget(state, pick.id);
  const users = capabilitiesOf(state, pick);
  const own = pick.kind === "persona" ? [personaCard(pick.id)] : [];
  return { items: [...own, ...new Set(users.flatMap((id) => cardsOf(state, id)))], row: rowsOf(users) };
}

/* Every doc of a pick's kind. */
export const pickList = (state: DocketState, kind: Pick["kind"]): Doc[] =>
  ({ domain: state.domains, feature: state.features, capability: state.capabilities, concept: state.concepts, persona: state.personas })[kind];

/* A pick's name, as the filter bar and back button say it. */
export function pickName(state: DocketState, pick: Pick): string {
  return find<Doc>(pickList(state, pick.kind), pick.id)?.name ?? pick.id;
}

/*
 * Capabilities grouped by the feature they're in, features in the order
 * state.json lists them, then those in no feature under null.
 */
export function byFeature(state: DocketState, capabilityIds: string[]): { feature: Feature | null; capabilities: Capability[] }[] {
  const capabilities = capabilityIds.flatMap((id) => find(state.capabilities, id) ?? []);
  const groups = state.features
    .map((feature) => ({ feature: feature as Feature | null, capabilities: capabilities.filter((c) => c.feature === feature.id) }))
    .filter((g) => g.capabilities.length);
  const loose = capabilities.filter((c) => !c.feature);
  return loose.length ? [...groups, { feature: null, capabilities: loose }] : groups;
}

/* The concepts some capabilities use, each once, in the order they first come up. */
export function conceptsOf(state: DocketState, capabilityIds: string[]): Concept[] {
  const ids = new Set(capabilityIds.flatMap((id) => find(state.capabilities, id)?.concepts ?? []));
  return [...ids].flatMap((id) => find(state.concepts, id) ?? []);
}

/* The concepts a feature's capabilities use. */
export const featureConcepts = (state: DocketState, feature: Feature) => conceptsOf(state, feature.capabilities);

/*
 * What filtering leaves on the map: everything any of the picks covers. A
 * domain covers its cards and every capability on them, a feature its cards
 * in every domain, a capability the cards it's on, a concept every capability
 * that uses it, and a persona every capability that serves them. Capabilities
 * on those cards that none covers are faded. Null when there's no filter.
 */
export type MapFilter = { capabilities: Set<string>; cards: Set<string> };

export function filterBy(state: DocketState, picks: Pick[]): MapFilter | null {
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

/* Whether a checklist outcome applies at a level: from its own level up, through `until` where it has one. A draft claims none. */
export const appliesAt = (outcome: ChecklistOutcome, level: CapabilityLevel) =>
  level !== null && levelIndex(outcome.level) <= levelIndex(level) && (!outcome.until || levelIndex(outcome.until) >= levelIndex(level));

/* The level after this one: Prototype after a draft, or null after GA. */
export const nextLevel = (level: CapabilityLevel): Level | null => LEVEL_ORDER[rank(level) + 1] ?? null;

/* Every outcome of a quality, in level order. */
export const outcomesOf = (quality: ChecklistQuality) => quality.levels.flatMap((l) => l.outcomes);

/* A checklist outcome, with its quality, by its full ID. */
export function checklistOutcome(checklist: Checklist | null, id: string): { outcome: ChecklistOutcome; quality: ChecklistQuality } | undefined {
  for (const quality of checklist?.qualities ?? []) {
    const outcome = outcomesOf(quality).find((o) => o.id === id);
    if (outcome) return { outcome, quality };
  }
}

/* ——— What's left ——— */

/* The open decisions a doc's contributions list, in order. */
export const openDecisions = (doc: Doc): Decision[] => doc.from.flatMap((f) => (f.decisions ?? []).filter((d) => d.status !== "closed"));

/* The closed decisions a doc's contributions list, in order. */
export const closedDecisions = (doc: Doc): Decision[] => doc.from.flatMap((f) => (f.decisions ?? []).filter((d) => d.status === "closed"));

/* A doc that holds decisions, with its kind, as a decision's way back to where it was made. */
export type DecisionHolder = { kind: "domain" | "feature" | "capability" | "mechanism" | "component"; doc: Doc };

/* The closed decisions that became this doc, gap or tradeoff, by its ID here, with where each was made. */
export function decidedBy(state: DocketState, kind: BecameKind, id: string): { on: DecisionHolder; from: Contribution; decision: Decision }[] {
  const holders: DecisionHolder[] = [
    ...state.domains.map((doc) => ({ kind: "domain" as const, doc })),
    ...state.features.map((doc) => ({ kind: "feature" as const, doc })),
    ...state.capabilities.map((doc) => ({ kind: "capability" as const, doc })),
    ...state.mechanisms.map((doc) => ({ kind: "mechanism" as const, doc })),
    ...state.components.map((doc) => ({ kind: "component" as const, doc })),
  ];
  return holders.flatMap((on) =>
    on.doc.from.flatMap((from) =>
      (from.decisions ?? []).filter((d) => d.status === "closed" && d.resolved?.some((b) => b.kind === kind && b.id === id)).map((decision) => ({ on, from, decision })),
    ),
  );
}

/*
 * The concept a link from a doc in `domain` means: the one named with
 * `@<domain>`, else its own domain's, else the only one with that ID.
 */
export function conceptLinked(state: DocketState, link: string, domain: string): Concept | undefined {
  if (link.includes("@")) return find(state.concepts, link);
  const same = state.concepts.filter((c) => bareId(c.id) === link);
  return same.find((c) => c.domain === domain) ?? (same.length === 1 ? same[0] : undefined);
}

/*
 * Whether a capability holds to a rule it follows: not yet, when one of its
 * gaps names the rule; with evidence, when something verifies or implements
 * the rule; or on trust, when nothing says either way. Following a rule
 * claims it holds, so on trust is the usual standing, not a warning. A gap
 * wins over evidence, since a rule's evidence is about every capability that
 * follows it.
 */
export type RuleStanding = "gap" | "evidence" | "trust";
export const ruleStanding = (capability: Capability, rule: Rule): RuleStanding =>
  rule.gaps.some((id) => capability.gaps.includes(id)) ? "gap" : hasEvidence(rule.evidence) ? "evidence" : "trust";

export const hasEvidence = (evidence: Evidence) => evidence.verifies.length > 0 || evidence.implements.length > 0;

/* A technical gap under a capability: the gap, and the mechanism or component it's on. */
export type TechnicalGap = { gap: Gap; on: TechnicalDoc };

/*
 * What's still open about a capability: decisions nobody has made, its known
 * gaps, and the technical gaps of what it's built on. Evidence isn't among
 * them: what's declared holds unless a gap says otherwise. Tradeoffs aren't
 * open either: they're decided.
 */
export type Left = { decisions: Decision[]; gaps: Gap[]; technical: TechnicalGap[] };

/* Gaps or tradeoffs by ID, in the order given. */
export const gapsById = (state: DocketState, ids: string[]) => ids.flatMap((id) => state.gaps.find((g) => g.id === id) ?? []);
export const tradeoffsById = (state: DocketState, ids: string[]) => ids.flatMap((id) => state.tradeoffs.find((t) => t.id === id) ?? []);

/* A mechanism or component by its `mechanism:<id>` or `component:<id>` reference. */
export function technicalDoc(state: DocketState, ref: string): TechnicalDoc | undefined {
  const [kind, id] = [ref.slice(0, ref.indexOf(":")), ref.slice(ref.indexOf(":") + 1)];
  return find(kind === "mechanism" ? state.mechanisms : kind === "component" ? state.components : [], id);
}

/* What a capability is built on: the mechanisms and components that list it. */
export const builtOn = (state: DocketState, capability: Capability) => capability.builtBy.flatMap((ref) => technicalDoc(state, ref) ?? []);

/* With `technical` false, as for a persona, only what someone using the product would notice. */
export function leftIn(state: DocketState, capability: Capability, technical = true): Left {
  return {
    decisions: openDecisions(capability),
    gaps: gapsById(state, capability.gaps),
    technical: technical ? builtOn(state, capability).flatMap((on) => gapsById(state, on.gaps).map((gap) => ({ gap, on }))) : [],
  };
}

export const leftCount = (left: Left) => left.decisions.length + left.gaps.length + left.technical.length;

/*
 * Where a checklist outcome stands for a capability:
 *
 * - gap: a gap on it, or on what it's built on, names the outcome
 * - evidence: a mechanism or component it's built on says it meets it
 * - trust: nothing names it, so it counts as met on its level's word
 * - not-expected: its level doesn't expect it
 */
export type OutcomeStanding = { standing: "gap" | "evidence" | "trust" | "not-expected"; gaps: Gap[]; by: TechnicalDoc[] };

export function outcomeStanding(state: DocketState, capability: Capability, outcome: ChecklistOutcome): OutcomeStanding {
  const on = builtOn(state, capability);
  const gaps = [...gapsById(state, capability.gaps), ...on.flatMap((e) => gapsById(state, e.gaps))].filter((g) => g.outcome === outcome.id);
  const by = on.filter((e) => e.meets.includes(outcome.id));
  const standing = !appliesAt(outcome, capability.stability) ? "not-expected" : gaps.length ? "gap" : by.length ? "evidence" : "trust";
  return { standing, gaps, by };
}

/* ——— Detail pages ——— */

/* What a detail page can show: a doc of the product, a mechanism or component, or every gap and tradeoff at once. */
export type PageAt = Pick | { kind: TechnicalKind; id: string } | { kind: "gaps"; id: "" };

const PAGE_KINDS: Exclude<PageAt["kind"], "gaps">[] = ["domain", "feature", "capability", "concept", "persona", "mechanism", "component"];

/* The platform and projects showing, as the address has them, carried over to the pages it links to. */
function showingParams(): URLSearchParams {
  const now = new URLSearchParams(window.location.search);
  const params = new URLSearchParams();
  for (const key of ["platform", "project"]) {
    const value = now.get(key);
    if (value) params.set(key, value);
  }
  return params;
}

/* A detail page, as `?capability=deposits` or `?view=gaps`, showing the same platform and projects as this page. */
export function pageHref(pick: PageAt, section?: string): string {
  const params = showingParams();
  if (pick.kind === "gaps") params.set("view", "gaps");
  else params.set(pick.kind, pick.id);
  return `?${params}${section ? `#${section}` : ""}`;
}

/*
 * The map, showing the same platform and projects as this page. Given
 * something on the map, it opens with that in the side panel and in view, as
 * `?show=<kind>:<id>`.
 */
export function mapHref(at?: Pick): string {
  const params = showingParams();
  if (at) params.set("show", `${at.kind}:${at.id}`);
  return params.size ? `?${params}` : window.location.pathname;
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
