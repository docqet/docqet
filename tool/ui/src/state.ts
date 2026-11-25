import { MATURITY_LEVELS, featureMaturity, maturityBand, projectMaturity } from "./design/maturity/maturity";
import { STABILITY_LEVEL_IDS, type StabilityLevelId } from "./design/stability/stability";

/*
 * The shape of `state.json`, as the spec's "Index output" section describes
 * it, and of the view the page builds from one or more of them (DocketState).
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
    else if (Array.isArray(value)) for (const v of value) parts.push(typeof v === "string" ? v : Object.values(v).filter(Boolean).join(" "));
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
  /* 0 to 100, worked out from its parts of features, or null with none. Readers work it out; state.json doesn't say. */
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
  /* 0 to 100, from its capabilities, each once at its level in short, or null with none. */
  maturity: number | null;
  band: Level | null;
  /* Its tradeoffs: capabilities we've decided never to build, as it declares them. */
  tradeoffs: string[];
};

export type Capability = Doc & {
  /* The personas it serves: who does it, or who it's done for. */
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
  /* The initiatives it's part of: whose work they're for. In none, it shows only when everything does. */
  initiatives: string[];
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
/* How likely it is to bite within a year, most first. Left out, it's certain. */
export const LIKELIHOODS = ["certain", "expected", "possible", "unlikely"] as const;
export type Likelihood = (typeof LIKELIHOODS)[number];
/* What share of the people the software serves it would reach if it bit, most first. Left out, it's all. */
export const REACHES = ["all", "most", "some", "few"] as const;
export type Reach = (typeof REACHES)[number];

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
  /* What it does to those it reaches when it bites, or null where nobody has said. */
  impact: Impact | null;
  /* How likely it is to bite, and how many it would reach, or null where left out: certain, and all. */
  likelihood: Likelihood | null;
  reach: Reach | null;
  /* What falls short, in a few words, and in a sentence or two. */
  name: string;
  description: string;
  /* Where it shows in the code, from `docket:gap` annotations. */
  places: EvidencePlace[];
};

/* A tradeoff: what we chose, its benefit, and its drawback. On a capability, feature, mechanism or component; its ID is as a gap's. */
export type Tradeoff = {
  id: string;
  project?: string;
  domain?: string;
  /* The stability checklist outcome it falls short of on purpose, as `<quality>/<level>/<id>`, or null. */
  outcome: string | null;
  /* What we chose, in a few words, and in a sentence or two. */
  name: string;
  description: string;
  /* What we hope to get by choosing it, or null when it isn't written down. */
  benefit: string | null;
  /* What we give up or risk in return. */
  drawback: string;
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
 * outcomes expects nothing new at its level, and only guides. It's a
 * guideline, not a gate: implementation and overengineering are examples to
 * judge by.
 */
export type ChecklistExample = { text: string; kinds: string[] };
export type ChecklistOutcome = {
  id: string;
  level: Level;
  text: string;
  until: Level | null;
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
  initiatives: Initiative[];
  mechanisms: TechnicalDoc[];
  components: TechnicalDoc[];
  gaps: Gap[];
  tradeoffs: Tradeoff[];
  problems: Problem[];
  /* The stability checklist, the same for every project: the first project's, or null if none has one. */
  checklist: Checklist | null;
};

/* A place where software is defined, as its state.json's header has it, with its maturity, worked out from its features alone. */
export type Project = {
  id: string;
  name: string;
  /* The product it's part of: the one its docket.yaml declares, or else a product of its own, named for it. */
  product: { id: string; name: string };
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
  /* Missing when the project declares no product, and from state written before products. */
  product?: { id: string; name: string };
  commit: string;
  indexedAt: string;
  /* Its counts, such as capabilities at each level. The page works out its own, so it reads none of them. */
  summary?: { capabilities?: Record<Level | "draft", number> };
  /* Each of its domain docs. A domain is its own domain, so these have no `domain`. */
  domains: Omit<Raw<Domain>, "domain" | "features" | "capabilities">[];
  /* `tradeoffs` is missing from state written before tradeoffs. */
  features: (Omit<Raw<Feature>, "tradeoffs"> & { tradeoffs?: string[] })[];
  /* A draft's `stability` is "draft". */
  /* `initiatives` is missing from state written before initiatives. */
  capabilities: (Omit<Raw<Capability>, "stability" | "tradeoffs" | "initiatives"> & { stability: Level | "draft"; tradeoffs?: string[]; initiatives?: string[] })[];
  rules: Omit<Raw<Rule>, "gaps">[];
  concepts: Raw<Concept>[];
  /* Personas aren't in a domain, so these have no `domain`. Missing from state written before personas. */
  /* A persona's `initiatives` is missing from state written before them. */
  personas?: (Omit<Raw<Persona>, "domain" | "initiatives"> & { initiatives?: string[] })[];
  /* Initiatives aren't in a domain either. Missing from state written before initiatives. */
  initiatives?: Omit<Raw<Initiative>, "domain">[];
  /* Technical docs aren't in a domain either. Missing from state written before them, as is `tradeoffs`. */
  /* `applies` is missing from state written before it, meaning "project". */
  mechanisms?: (Omit<Raw<TechnicalDoc>, "domain" | "kind" | "applies"> & { applies?: "project" | "product" })[];
  components?: Omit<Raw<TechnicalDoc>, "domain" | "kind" | "applies">[];
  /* `impact`, `likelihood` and `reach` are missing from state written before them. */
  gaps: (Omit<Gap, "impact" | "likelihood" | "reach"> & Partial<Gap>)[];
  /* State written before a tradeoff had one benefit and one drawback has lists of each instead. */
  tradeoffs?: (Omit<Tradeoff, "benefit" | "drawback"> & Partial<Tradeoff> & { benefits?: string[]; drawbacks?: string[] })[];
  problems: Problem[];
  /* Missing from state written before the checklist. */
  checklist?: Checklist;
};

/* A project's header, from its state.json. Its maturity is worked out once its features are put together (see combine). */
export const projectOf = (file: StateFile): Project => ({
  ...file.project,
  product: file.product ?? file.project,
  commit: file.commit,
  indexedAt: file.indexedAt,
  maturity: null,
  band: null,
});

/* Projects that are shown together, as one product: those that declare the same product. */
export type Product = { id: string; name: string; projects: Project[] };

/* Every product, in the order their first projects are read, each with its projects in order. Its name is its first project's to say. */
export function productsOf(all: Project[]): Product[] {
  const products: Product[] = [];
  for (const p of all) {
    const product = products.find((x) => x.id === p.product.id);
    if (product) product.projects.push(p);
    else products.push({ ...p.product, projects: [p] });
  }
  return products;
}

const LEVEL_ORDER: readonly Level[] = STABILITY_LEVEL_IDS;

/* A level's place in order, a draft before Prototype. */
const rank = (level: CapabilityLevel) => (level === null ? -1 : LEVEL_ORDER.indexOf(level));

/* A rule's or concept's ID without its domain: `booking@billing` is `booking`. */
export const bareId = (id: string) => (id.includes("@") ? id.slice(0, id.lastIndexOf("@")) : id);

/* The rule or concept a link from a doc in `domain` means, keyed as combining keys them: the domain it names, else its own. */
const inDomain = (link: string, domain: string) => (link.includes("@") ? link : `${link}@${domain}`);

/* A reference's ID, keeping any `@<domain>`: `rule:no-double-booking` is `no-double-booking`. */
const idOf = (ref: string) => ref.slice(ref.indexOf(":") + 1);

/*
 * One project's state with its links as IDs. State.json writes every link as
 * a reference, `<type>:<id>`, as the docs do, and the page keys each doc by its
 * ID in its type's list, so it reads the links it resolves by ID alone. A
 * problem's `subject` names several types, so it stays a reference.
 */
function linksById(file: StateFile): StateFile {
  const ids = (refs: string[] | undefined) => (refs ?? []).map(idOf);
  const capabilities = <T extends { capabilities: string[] }>(e: T) => ({ ...e, capabilities: ids(e.capabilities) });
  return {
    ...file,
    features: file.features.map(capabilities),
    capabilities: file.capabilities.map((c) => ({ ...c, personas: ids(c.personas), initiatives: ids(c.initiatives), rules: ids(c.rules), concepts: ids(c.concepts) })),
    rules: file.rules.map((r) => ({ ...r, concepts: ids(r.concepts) })),
    personas: file.personas?.map((p) => ({ ...p, initiatives: ids(p.initiatives) })),
    concepts: file.concepts.map((c) => (c.confusedWith ? { ...c, confusedWith: c.confusedWith.map((w) => ({ ...w, concept: w.concept && idOf(w.concept) })) } : c)),
    mechanisms: file.mechanisms?.map(capabilities),
    components: file.components?.map(capabilities),
    gaps: file.gaps.map((g) => ({ ...g, rule: g.rule && idOf(g.rule) })),
    problems: file.problems.map((p) => ({ ...p, capabilities: ids(p.capabilities) })),
  };
}

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
 *   ID in two domains is two definitions. A link to one means the domain it
 *   names, else its own domain's.
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
    initiatives: [],
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
  /* What each product's projects serve, and the mechanisms that apply across one, to put together once every project is in. */
  const productServes = new Map<string, string[]>();
  const acrossProduct: { doc: TechnicalDoc; product: string }[] = [];

  /* Add one project's contribution to the doc with this ID, making it if it's the first. */
  function contribute<T extends Doc>(list: T[], id: string, project: string, raw: Omit<Raw<Doc>, "domain"> & { domain: string }, make: (base: Doc) => T): T {
    const from: Contribution = { project, domain: raw.domain, file: raw.file, name: raw.name, description: raw.description, body: raw.body ?? "" };
    for (const key of FIELD_KEYS) if (key in raw) Object.assign(from, { [key]: raw[key] });
    /* State written when decisions could close keeps answered ones, which aren't decisions any more. */
    if (from.decisions)
      from.decisions = (from.decisions as (Decision & { status?: string })[]).filter((d) => d.status !== "closed").map((d) => ({ topic: d.topic ?? null, question: d.question }));
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

  for (const file of files.map(linksById)) {
    const project = file.project.id;
    const product = projectOf(file).product.id;
    state.projects.push(projectOf(file));
    /* What a project serves, as a mechanism's `capabilities` are worked out: what it declares, other than drafts, and what its components list. */
    const serves = productServes.get(product) ?? [];
    union(serves, file.capabilities.filter((c) => c.stability !== "draft").map((c) => c.id));
    for (const c of file.components ?? []) union(serves, c.capabilities);
    productServes.set(product, serves);
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
        initiatives: [],
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
      union(capability.initiatives, c.initiatives ?? []);
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
      contribute(state.concepts, `${c.id}@${c.domain}`, project, c, (base) => ({ ...base, capabilities: [], rules: [] }));
    }
    /* A persona is in no domain; its contributions are told apart by project, as a domain's are. */
    for (const p of file.personas ?? []) {
      const persona = contribute(state.personas, p.id, project, { ...p, domain: "" }, (base) => ({
        ...base,
        role: p.role ?? null,
        title: p.title ?? null,
        image: p.image ?? null,
        capabilities: [],
        features: [],
        initiatives: [],
      }));
      union(persona.initiatives, p.initiatives ?? []);
    }
    /* An initiative is in no domain either. */
    for (const i of file.initiatives ?? []) {
      contribute(state.initiatives, i.id, project, { ...i, domain: "" }, (base) => ({ ...base, capabilities: [], features: [], personas: [] }));
    }
    /* Mechanisms and components are in no domain; their contributions are told apart by project, as a persona's are. */
    for (const kind of ["mechanism", "component"] as const) {
      const entries =
        kind === "mechanism"
          ? (file.mechanisms ?? []).map((e) => ({ ...e, applies: e.applies ?? ("project" as const) }))
          : (file.components ?? []).map((e) => ({ ...e, applies: "project" as const }));
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
        if (e.applies === "product") {
          doc.applies = "product";
          acrossProduct.push({ doc, product });
        }
        union(doc.meets, e.meets);
        union(doc.gaps, own(e.gaps));
        union(doc.tradeoffs, own(e.tradeoffs));
        addEvidence(doc.evidence, e.evidence, project);
      }
    }
    /* Each place in the code a gap or tradeoff names says which repository it's in, as evidence does. */
    const placed = (places: EvidencePlace[] | undefined) => (places ?? []).map((p) => ({ ...p, project }));
    state.gaps.push(...file.gaps.map((g) => ({ ...g, impact: g.impact ?? null, likelihood: g.likelihood ?? null, reach: g.reach ?? null, project, id: `${g.id}@${project}`, places: placed(g.places) })));
    state.tradeoffs.push(
      ...(file.tradeoffs ?? []).map(({ benefits, drawbacks, ...t }) => ({
        ...t,
        benefit: t.benefit ?? (benefits?.length ? benefits.join(" ") : null),
        drawback: t.drawback ?? (drawbacks ?? []).join(" "),
        project,
        id: `${t.id}@${project}`,
        places: placed(t.places),
      })),
    );
    /* A rule or concept a problem names is its domain's. */
    const subject = (p: Problem) => {
      const type = p.subject.slice(0, p.subject.indexOf(":"));
      return (type === "rule" || type === "concept") && p.domain ? `${p.subject}@${p.domain}` : p.subject;
    };
    state.problems.push(...file.problems.map((p) => ({ ...p, subject: subject(p) })));
  }

  /* A domain docs are written in, with no domain doc showing, still gets a place, named by its ID. */
  for (const doc of [...state.features, ...state.capabilities, ...state.rules, ...state.concepts]) {
    for (const f of doc.from) {
      if (!find(state.domains, f.domain)) {
        state.domains.push(newDomain({ id: f.domain, project: f.project, domain: f.domain, file: "", name: f.domain, body: "", from: [] }));
      }
    }
  }

  const projectName = (id: string) => find(state.projects, id)?.name ?? id;

  /* Links to rules and concepts: the domain named, else its own. */
  for (const p of pending) {
    const resolve = (list: Doc[], link: string): string[] => {
      const id = inDomain(link, p.domain);
      return find(list, id) ? [id] : [];
    };
    if ("rules" in p.from && p.from.rules) union(p.from.rules, p.rules.flatMap((l) => resolve(state.rules, l)));
    union(p.from.concepts, p.concepts.flatMap((l) => resolve(state.concepts, l)));
  }

  /* A mechanism that applies across its product applies to what every project on it serves, which no one project's indexer can see. */
  for (const { doc, product } of acrossProduct) union(doc.capabilities, productServes.get(product) ?? []);

  /* Reverse links, worked out again across everything. */
  for (const c of state.capabilities) {
    for (const id of c.rules) union(find(state.rules, id)?.capabilities ?? [], [c.id]);
    for (const id of c.concepts) union(find(state.concepts, id)?.capabilities ?? [], [c.id]);
  }
  for (const r of state.rules) for (const id of r.concepts) union(find(state.concepts, id)?.rules ?? [], [r.id]);
  for (const e of [...state.mechanisms, ...state.components]) {
    for (const id of e.capabilities) union(find(state.capabilities, id)?.builtBy ?? [], [`${e.kind}:${e.id}`]);
  }
  /* A gap's rule means the domain it names, else its own, as a capability's link to one does. */
  for (const g of state.gaps) {
    if (!g.rule) continue;
    const rule = find(state.rules, inDomain(g.rule, g.domain ?? ""));
    g.rule = rule?.id ?? null;
    if (rule) union(rule.gaps, [g.id]);
  }

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
   * levels in that domain alone. The feature's own maturity spans its
   * domains, so it counts each capability once, at its level in short.
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
    f.maturity = featureMaturity(f.capabilities.flatMap((id) => find(state.capabilities, id)?.stability ?? []));
    f.band = band(f.maturity);
  }
  for (const c of state.capabilities) {
    if (!c.feature) for (const l of c.levels) union(find(state.domains, l.domain)?.capabilities ?? [], [c.id]);
  }
  /* Each persona's capabilities, and the features those are in. */
  for (const c of state.capabilities) for (const id of c.personas) union(find(state.personas, id)?.capabilities ?? [], [c.id]);
  for (const p of state.personas) {
    union(p.features, state.features.filter((f) => p.capabilities.some((id) => f.capabilities.includes(id))).map((f) => f.id));
  }
  /* Each initiative's capabilities, and the features those are in. */
  for (const c of state.capabilities) for (const id of c.initiatives) union(find(state.initiatives, id)?.capabilities ?? [], [c.id]);
  for (const p of state.personas) for (const id of p.initiatives) union(find(state.initiatives, id)?.personas ?? [], [p.id]);
  for (const i of state.initiatives) {
    union(i.features, state.features.filter((f) => i.capabilities.some((id) => f.capabilities.includes(id))).map((f) => f.id));
  }
  for (const d of state.domains) {
    d.maturity = projectMaturity(d.features.map((id) => partOf(find(state.features, id), d.id)?.maturity ?? null));
    d.band = band(d.maturity);
  }
  /* Each project's maturity, from its features alone: with several, each project is put together again on its own. */
  for (const p of state.projects) {
    p.maturity = files.length === 1 ? maturityOf(state) : maturityOf(combine(files.filter((f) => f.project.id === p.id)));
    p.band = band(p.maturity);
  }

  /* Contradictions: a product doc whose name or description differs between contributions, or a rule or concept within one domain, where a rule is its name and body. */
  const differing = (type: string, docs: Doc[]) => {
    for (const doc of docs) {
      const said = new Set(doc.from.map((f) => [f.name, f.role ?? "", f.title ?? "", f.description ?? "", type === "rule" ? f.body : ""].join("\n")));
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
  differing("initiative", state.initiatives);
  differing("mechanism", state.mechanisms);
  differing("component", state.components);

  /* A gap's or tradeoff's ID means one, so two projects declaring the same one is a duplicate. Within a project, its indexer reports it. */
  const declaredBy = new Map<string, string[]>();
  for (const g of [...state.gaps, ...state.tradeoffs]) {
    const ref = g.id.slice(0, g.id.lastIndexOf("@"));
    declaredBy.set(ref, [...(declaredBy.get(ref) ?? []), g.project ?? ""]);
  }
  for (const [ref, projects] of declaredBy) {
    const by = [...new Set(projects)];
    if (by.length < 2) continue;
    const doc = ref.slice(0, ref.indexOf("#"));
    state.problems.push({
      type: "duplicate-id",
      subject: doc,
      capabilities: doc.startsWith("capability:") ? [doc.slice(doc.indexOf(":") + 1)] : [],
      message: `${list_(by.map(projectName))} each declare ${ref}. Give one of them another key.`,
    });
  }
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

/*
 * The maturity of everything showing, one project or several: from its
 * features' maturities, each weighted as a capability in its band would be,
 * so a capability that spans domains counts once.
 */
export const maturityOf = (state: DocketState): number | null => projectMaturity(state.features.map((f) => f.maturity));

/* A feature's part in a domain, if it has one. */
export const partOf = (feature: Feature | undefined, domain: string) => feature?.parts.find((p) => p.domain === domain);

/* Capabilities by ID, in the order given, leaving out any not showing. */
export const capabilitiesById = (state: DocketState, ids: string[]) => ids.flatMap((id) => find(state.capabilities, id) ?? []);

/* Every capability with a part in a domain: those in its parts of features, and those in no feature. */
export function domainCapabilities(state: DocketState, domain: Domain): Capability[] {
  const ids = [...domain.features.flatMap((id) => partOf(find(state.features, id), domain.id)?.capabilities ?? []), ...domain.capabilities];
  return capabilitiesById(state, [...new Set(ids)]);
}

/* The capabilities in a feature that serve a persona. */
export const personaCapabilitiesIn = (state: DocketState, persona: Persona, feature: Feature) =>
  capabilitiesById(state, feature.capabilities.filter((id) => persona.capabilities.includes(id)));

/* The capabilities a project contributes to, each judged as a whole. */
export const projectCapabilities = (state: DocketState, project: string) => state.capabilities.filter((c) => c.from.some((f) => f.project === project));

/* The contradictions a doc has, and gap or tradeoff IDs its projects both declare, as combining found them. */
export const contradictionsOf = (state: DocketState, type: string, id: string) =>
  state.problems.filter(
    (p) =>
      (p.type === "contradiction" || p.type === "duplicate-id" || p.type === "in-two-features") &&
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
/* A capability's level in a domain: its own there, as it can differ by domain, or else its level in short. */
export const levelInDomain = (c: Capability, domain: string): CapabilityLevel => c.levels.find((l) => l.domain === domain)?.level ?? c.stability;

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

/* The open decisions a doc's contributions list, in order: all of them, since answering one deletes it. */
export const openDecisions = (doc: Doc): Decision[] => doc.from.flatMap((f) => f.decisions ?? []);

/* A doc that holds decisions, with its kind, as a decision's way back to where it was made. */
export type DecisionHolder = { kind: "domain" | "feature" | "capability" | "mechanism" | "component"; doc: Doc };

/* The concept a link from a doc in `domain` means: the one in the domain it names with `@<domain>`, else its own domain's. */
export const conceptLinked = (state: DocketState, link: string, domain: string): Concept | undefined => find(state.concepts, inDomain(link, domain));

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
 * - tradeoff: a tradeoff on it, or on what it's built on, names it: not met, by choice
 * - evidence: a mechanism or component it's built on says it meets it
 * - trust: nothing names it, so it counts as met on its level's word
 * - not-expected: its level doesn't expect it
 */
export type OutcomeStanding = { standing: "gap" | "tradeoff" | "evidence" | "trust" | "not-expected"; gaps: Gap[]; tradeoffs: Tradeoff[]; by: TechnicalDoc[] };

export function outcomeStanding(state: DocketState, capability: Capability, outcome: ChecklistOutcome): OutcomeStanding {
  const on = builtOn(state, capability);
  const gaps = [...gapsById(state, capability.gaps), ...on.flatMap((e) => gapsById(state, e.gaps))].filter((g) => g.outcome === outcome.id);
  const tradeoffs = [...tradeoffsById(state, capability.tradeoffs), ...on.flatMap((e) => tradeoffsById(state, e.tradeoffs))].filter((t) => t.outcome === outcome.id);
  const by = on.filter((e) => e.meets.includes(outcome.id));
  const standing = !appliesAt(outcome, capability.stability)
    ? "not-expected"
    : gaps.length
      ? "gap"
      : tradeoffs.length
        ? "tradeoff"
        : by.length
          ? "evidence"
          : "trust";
  return { standing, gaps, tradeoffs, by };
}

/* ——— Risk ——— */

/*
 * The capabilities a gap or tradeoff shows on: its capability's own, or
 * every capability its mechanism or component serves, or a feature's
 * capabilities for a feature's tradeoff.
 */
export function showsOn(state: DocketState, item: { id: string }): Capability[] {
  const { type, id } = subjectOf(item);
  if (type === "capability") return find(state.capabilities, id) ? [find(state.capabilities, id)!] : [];
  const ids = type === "feature" ? find(state.features, id)?.capabilities : technicalDoc(state, `${type}:${id}`)?.capabilities;
  return (ids ?? []).flatMap((c) => find(state.capabilities, c) ?? []);
}

/*
 * What's at stake in leaving a gap open, as the spec's Risk
 * section works it out, on each capability it shows on: what the gap could
 * do, its impact's step times its likelihood times its reach, times how much
 * people rely on what it's in, that capability's level's weight in risk,
 * times 1.5 where it breaks a promise that level makes, naming a rule the
 * capability follows or an outcome its level expects. That's put on 0 to 100
 * by a log scale, so each step adds a steady amount: 0 is a certain
 * negligible gap reaching all on a Prototype, and 100 a certain damaging gap
 * reaching all and breaking a promise on GA. Less likely or reaching fewer,
 * it scores lower, and never below 0. A draft weighs nothing, and scores 0.
 * Its risk is the highest of those, or null with no impact rated; its
 * verdict, the third of the scale that falls in; its spread, how its
 * scores spread across the capabilities, highest first. A tradeoff has none:
 * it's chosen.
 */
export const IMPACT_STEPS: Record<Impact, number> = { negligible: 1, inconvenient: 2, blocking: 3, damaging: 4 };
/* Each step down takes off a quarter. */
export const LIKELIHOOD_FACTORS: Record<Likelihood, number> = { certain: 1, expected: 0.75, possible: 0.5, unlikely: 0.25 };
export const REACH_FACTORS: Record<Reach, number> = { all: 1, most: 0.75, some: 0.5, few: 0.25 };
export const PROMISE_FACTOR = 1.5;
/* How much people are entitled to rely on each level, and how exposed they are to its gaps. A draft weighs nothing. Risk's own, apart from maturity's. */
export const RISK_WEIGHTS: Record<Level, number> = { prototype: 2, alpha: 3, beta: 4, ga: 6 };
/* The raw scores that are 0 and 100: a certain negligible gap reaching all on a Prototype, and a certain damaging gap reaching all and breaking a promise on GA. */
const RAW_MIN = IMPACT_STEPS.negligible * RISK_WEIGHTS.prototype;
const RAW_MAX = IMPACT_STEPS.damaging * RISK_WEIGHTS.ga * PROMISE_FACTOR;
const onScale = (raw: number) => (raw > 0 ? Math.max(0, Math.round((Math.log(raw / RAW_MIN) / Math.log(RAW_MAX / RAW_MIN)) * 100)) : 0);

/* Whether leaving it open is acceptable, by the third of the scale its risk falls in, worst first. */
export const VERDICTS = ["unacceptable", "tolerable", "acceptable"] as const;
export type Verdict = (typeof VERDICTS)[number];
/* In thirds. */
export const VERDICT_FROM: Record<Verdict, number> = { unacceptable: 67, tolerable: 33, acceptable: 0 };
export const verdictOf = (score: number | null): Verdict | null =>
  score === null ? null : score >= VERDICT_FROM.unacceptable ? "unacceptable" : score >= VERDICT_FROM.tolerable ? "tolerable" : "acceptable";

/* How it scores on one capability: each part's factor, what they multiply to, and that on the scale. */
export type RiskOn = {
  capability: Capability;
  impact: number;
  likelihood: number;
  reach: number;
  weight: number;
  promise: boolean;
  raw: number;
  score: number;
};
export type Risk = {
  impact: Impact | null;
  likelihood: Likelihood;
  reach: Reach;
  score: number | null;
  verdict: Verdict | null;
  /* Whether it breaks a promise on any capability it shows on. */
  promise: boolean;
  /* Each capability it shows on, highest score first, then most stable. */
  on: RiskOn[];
  capabilities: number;
  /* How many capabilities have each score, highest first: "36 on 2 · 12 on 1". */
  spread: { score: number; capabilities: number }[];
};

/* How a gap scores on one capability, as riskOf works it out. */
function riskOn(state: DocketState, item: Gap): (capability: Capability) => RiskOn {
  const outcome = item.outcome ? checklistOutcome(state.checklist, item.outcome)?.outcome : undefined;
  const rule = item.rule;
  const impact = item.impact ? IMPACT_STEPS[item.impact] : 0;
  const likelihood = LIKELIHOOD_FACTORS[item.likelihood ?? "certain"];
  const reach = REACH_FACTORS[item.reach ?? "all"];
  return (capability) => {
    const weight = capability.stability ? RISK_WEIGHTS[capability.stability] : 0;
    const promise = weight > 0 && ((!!rule && capability.rules.includes(rule)) || (!!outcome && appliesAt(outcome, capability.stability)));
    const raw = impact * likelihood * reach * weight * (promise ? PROMISE_FACTOR : 1);
    return { capability, impact, likelihood, reach, weight, promise, raw, score: onScale(raw) };
  };
}

export function riskOf(state: DocketState, item: Gap): Risk {
  const on = showsOn(state, item)
    .map(riskOn(state, item))
    .sort((a, b) => b.score - a.score || b.weight - a.weight);
  const rated = item.impact !== null;
  const spread: Risk["spread"] = [];
  for (const o of on) {
    const last = spread[spread.length - 1];
    if (last?.score === o.score) last.capabilities++;
    else spread.push({ score: o.score, capabilities: 1 });
  }
  return {
    impact: item.impact,
    likelihood: item.likelihood ?? "certain",
    reach: item.reach ?? "all",
    score: rated ? (on[0]?.score ?? 0) : null,
    verdict: verdictOf(rated ? (on[0]?.score ?? 0) : null),
    promise: on.some((o) => o.promise),
    on,
    capabilities: on.length,
    spread: rated ? spread : [],
  };
}

/* ——— Readiness ——— */

/*
 * How ready people can rely on it being: a recommendation, not a verdict.
 * A capability has nothing left when its level in short is Beta or GA,
 * settled enough for real use, and no gap scores unacceptable on it, its own
 * or one on what it's built on. Only gaps count, not tradeoffs. One that's
 * started with something left still needs to reach Beta, where it's below,
 * and to close each of those gaps. A draft is not started, and never counts.
 */
/* With what it needs, its open decisions, which don't count toward readiness, but are left to settle there too. */
export type NotReady = { capability: Capability; belowBeta: boolean; gaps: Gap[]; decisions: Decision[] };

/* The gaps that show on a capability: its own, and those of the mechanisms and components it's built on. */
export const gapsOn = (state: DocketState, capability: Capability) => [
  ...gapsById(state, capability.gaps),
  ...builtOn(state, capability).flatMap((on) => gapsById(state, on.gaps)),
];

/* What a started capability still needs to be ready: nothing, once it's ready. */
export function needsOf(state: DocketState, capability: Capability): NotReady {
  const gaps = gapsOn(state, capability).filter((g) => verdictOf(riskOn(state, g)(capability).score) === "unacceptable");
  return { capability, belowBeta: rank(capability.stability) < rank("beta"), gaps, decisions: openDecisions(capability) };
}

/*
 * The readiness of some capabilities, as of a feature, domain, persona or
 * project: a recommendation, 0 to 100, for people to judge by. It's their
 * maturity, each at its level in short, less their exposure:
 * maturity × (1 − exposure). With it, the two it's worked out from,
 * those with nothing left, those that still need something and what, and the
 * drafts, not started, which never count. Nothing started, it's null.
 */
export type Readiness = {
  percent: number | null;
  maturity: number | null;
  exposure: Exposure;
  /* Each capability's level, null for a draft: what its maturity is worked out from. */
  levels: CapabilityLevel[];
  /* Every gap on them, their own and those of what they're built on, each scored on them: what the exposure is worked out from. */
  gaps: RiskAcross<Gap>;
  ready: Capability[];
  notReady: NotReady[];
  notStarted: Capability[];
};

export function readinessOf(state: DocketState, capabilities: Capability[]): Readiness {
  const exposure = exposureOf(state, capabilities);
  const gaps = riskAcross(state, [...new Set(capabilities.flatMap((c) => gapsOn(state, c)))], capabilities);
  const levels = capabilities.map((c) => c.stability);
  const readiness: Readiness = { percent: null, maturity: null, exposure, levels, gaps, ready: [], notReady: [], notStarted: [] };
  let total = 0;
  let weights = 0;
  for (const c of capabilities) {
    if (c.stability === null) {
      readiness.notStarted.push(c);
      continue;
    }
    const needs = needsOf(state, c);
    const { score, weight } = MATURITY_LEVELS[c.stability];
    total += score * weight;
    weights += weight;
    if (!needs.belowBeta && !needs.gaps.length) readiness.ready.push(c);
    else readiness.notReady.push(needs);
  }
  if (weights) {
    readiness.maturity = total / weights;
    readiness.percent = Math.round(readiness.maturity * (1 - (exposure.percent ?? 0) / 100));
  }
  return readiness;
}

/* How many it's worked out from: the started ones. */
export const startedOf = (r: Readiness) => r.ready.length + r.notReady.length;

/* Readiness's quarters, named for what they recommend, from the lowest. */
export const READINESS_BANDS = [
  { from: 0, name: "Unready", says: "Most of what they need is still being explored, or its gaps put a lot at stake." },
  { from: 25, name: "Partial", says: "Some of it can be used, but much of what they need is still taking shape." },
  { from: 50, name: "Viable", says: "Enough is settled for them to rely on day to day." },
  { from: 75, name: "Ready", says: "What they need is mostly stable, with nothing unacceptable left open." },
] as const;

/* The quarter a readiness falls in, or null with nothing started. */
export const readinessBand = (r: Readiness) => (r.percent === null ? null : [...READINESS_BANDS].reverse().find((b) => r.percent! >= b.from)!);

/* In the Ready quarter, below it, or null with nothing started. */
export const isReady = (r: Readiness): boolean | null => (r.percent === null ? null : r.percent >= 75);

/* Readiness from 0 to 1, for putting the least ready first; null with nothing started. */
export const readyShare = (r: Readiness) => (r.percent === null ? null : r.percent / 100);

/*
 * What's at stake across some gaps, as in a capability, feature,
 * domain, persona or component: each one's risk and verdict there, its
 * highest score on the capabilities `within` where given, or its risk
 * anywhere, riskiest first; the highest of those, and its verdict; and how many fall in each
 * verdict. Its score is null with none rated.
 */
export type RiskAcross<T> = {
  score: number | null;
  verdict: Verdict | null;
  /* Each with where it scores highest among those capabilities, null with none. */
  items: { item: T; risk: Risk; on: RiskOn | null; score: number | null; verdict: Verdict | null }[];
  /* How many fall in each verdict. */
  counts: Record<Verdict, number>;
  unrated: number;
};

export function riskAcross<T extends Gap>(state: DocketState, items: T[], within?: Capability[]): RiskAcross<T> {
  const ids = within ? new Set(within.map((c) => c.id)) : null;
  const scored = items
    .map((item) => {
      const risk = riskOf(state, item);
      const on = (ids ? risk.on.filter((o) => ids.has(o.capability.id)) : risk.on)[0] ?? null;
      const score = risk.score === null || !ids ? risk.score : (on?.score ?? 0);
      return { item, risk, on, score, verdict: verdictOf(score) };
    })
    .sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
  const score = scored[0]?.score ?? null;
  return {
    score,
    verdict: verdictOf(score),
    items: scored,
    counts: Object.fromEntries(VERDICTS.map((v) => [v, scored.filter((s) => s.verdict === v).length])) as Record<Verdict, number>,
    unrated: scored.filter((s) => s.score === null).length,
  };
}

/*
 * The exposure of some capabilities, as of a feature, domain, project or
 * persona: what the gaps still open on them put at stake together, as how
 * much of the most they could be exposed to their riskiest gaps are, 0 to
 * 100. It's to risk what maturity is to stability. The most a capability
 * could be exposed to is a certain damaging gap reaching all that breaks its
 * level's promise. Its exposure is its riskiest gap's raw score's share of
 * that, its own or one on what it's built on, and it counts with its level's
 * weight in risk. Gaps with no impact rated add nothing, and drafts don't
 * count. Nothing started, it's null. Its band, the quarter it falls in,
 * says how much the gaps still open on them put at stake, and is at least
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

export function exposureOf(state: DocketState, capabilities: Capability[]): Exposure {
  let exposed = 0;
  let weights = 0;
  let started = 0;
  let unacceptable = false;
  for (const c of capabilities) {
    if (!c.stability) continue;
    const weight = RISK_WEIGHTS[c.stability];
    const most = IMPACT_STEPS.damaging * weight * PROMISE_FACTOR;
    const riskiest = gapsOn(state, c).reduce<RiskOn | null>((top, g) => {
      const on = riskOn(state, g)(c);
      return !top || on.raw > top.raw ? on : top;
    }, null);
    if (riskiest && verdictOf(riskiest.score) === "unacceptable" && riskiest.raw > 0) unacceptable = true;
    exposed += weight * ((riskiest?.raw ?? 0) / most);
    weights += weight;
    started++;
  }
  const percent = weights ? (exposed / weights) * 100 : null;
  const byShare = percent === null ? null : [...RISK_BANDS].reverse().find((b) => percent >= b.from)!;
  const band = byShare && unacceptable && byShare.from < RISK_BANDS[2].from ? RISK_BANDS[2] : byShare;
  return { percent, capabilities: started, band, unacceptable };
}

/* An exposure as written: whole percents, and "<1%" for a little that rounds to none. */
export const exposureText = (percent: number) => (percent > 0 && percent < 0.5 ? "<1%" : `${Math.round(percent)}%`);

/* A risk score as written. */
export const riskScore = (score: number) => String(score);

/* An impact's place, worst first, with none after every one. */
export const impactRank = (impact: Impact | null) => (impact ? IMPACTS.indexOf(impact) : IMPACTS.length);

/* Riskiest first: by score, none rated last, then by spread, comparing each capability's score in turn, highest first. */
export function byRisk(a: Risk, b: Risk): number {
  if (a.score === null || b.score === null) return Number(a.score === null) - Number(b.score === null);
  for (let i = 0; i < Math.max(a.on.length, b.on.length); i++) {
    const d = (b.on[i]?.score ?? -1) - (a.on[i]?.score ?? -1);
    if (d) return d;
  }
  return 0;
}

/* Items in order of their risk, riskiest first, keeping the given order among equals. `of` says which gap each is. */
export function inRiskOrder<T>(state: DocketState, items: T[], of: (item: T) => Gap): T[] {
  const risks = new Map(items.map((i) => [i, riskOf(state, of(i))]));
  return [...items].sort((a, b) => byRisk(risks.get(a)!, risks.get(b)!));
}

/* The worst of some impacts, or null with none rated. */
export const worstImpact = (impacts: (Impact | null)[]): Impact | null =>
  impacts.reduce<Impact | null>((worst, i) => (impactRank(i) < impactRank(worst) ? i : worst), null);

/* ——— Detail pages ——— */

/* What a detail page can show: a doc of the product, a mechanism or component, or every gap and tradeoff at once. */
export type PageAt = Pick | { kind: TechnicalKind | "initiative"; id: string } | { kind: "gaps"; id: "" };

const PAGE_KINDS: Exclude<PageAt["kind"], "gaps">[] = ["domain", "feature", "capability", "concept", "persona", "initiative", "mechanism", "component"];

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
  if (pick.kind === "gaps") params.set("view", "left");
  else params.set(pick.kind, pick.id);
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
