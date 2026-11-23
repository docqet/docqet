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

/* What one project says about a doc, in one domain: each doc has one from every project and domain that declares it. */
export type Contribution = {
  /* Where it's defined, and its file in that project's repository. */
  project: string;
  /* The domain it's written in, which says what its rule and concept links mean. */
  domain: string;
  file: string;
  name: string;
  summary?: string;
  /* Everything after the title and summary, as Markdown. */
  body: string;
};

/*
 * A doc, put together from every contribution to it (see combine). Its ID
 * depends on its type, as the spec's Domains section says: a domain, feature
 * or capability keeps its own ID, one across everything; a rule or concept is
 * `<id>@<domain>`. Its name, summary, body and file are its first
 * contribution's.
 */
export type Doc = {
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

export type CodeGlob = { glob: string; files: number };

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
  code: CodeGlob[];
  /* Its product gaps and tradeoffs, as it declares them. */
  gaps: string[];
  tradeoffs: string[];
  /* The systems and components that list it, as `system:<id>` or `component:<id>`, worked out from their `capabilities`. */
  builtBy: string[];
  evidence: Evidence;
};

/*
 * How part of the software is built, in the code's words: a system several
 * features rely on, or a component, one area as the code names it. Neither has
 * a level or a domain; each lists the capabilities that rely on it, and holds
 * the technical gaps, tradeoffs and open decisions about it. Projects that
 * declare the same one contribute to it, as with features.
 */
export type TechnicalKind = "system" | "component";
export type TechnicalDoc = Doc & {
  kind: TechnicalKind;
  capabilities: string[];
  code: CodeGlob[];
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
  /* Its picture's URL. */
  image: string;
  /* Every capability that lists it, and the features those are in. */
  capabilities: string[];
  features: string[];
  /* How ready the software is for them, 0 to 100: the maturity of every capability that serves them, or null with none. */
  readiness: number | null;
};

/*
 * A known gap: something we intend to close. On a capability, it's what
 * someone using the product would notice; on a system or component, what only
 * someone working on the code would. Its ID is `<type>:<id>#<key>`, and the
 * part before `#` is what it's on.
 */
export type Gap = {
  id: string;
  /* Combining adds it: state.json doesn't say, since the file is the project's. */
  project?: string;
  /* A product gap's domain; a technical gap has none. */
  domain?: string;
  /* When it's to close by: a level, `<capability>@<level>`, `not-decided`, or an event in words. */
  until: string;
  /* The stability checklist outcome it falls short of, as `<quality>/<level>/<id>`, or null. */
  outcome: string | null;
  /* The rule it doesn't hold to yet, as written; combining resolves it to `<id>@<domain>`. */
  rule: string | null;
  text: string;
  /* Where it shows in the code, from `docket:gap` annotations. */
  places: EvidencePlace[];
};

/* A tradeoff: what we chose, what it costs, and when to look at it again. On a capability, feature, system or component; its ID is as a gap's. */
export type Tradeoff = {
  id: string;
  project?: string;
  domain?: string;
  text: string;
  cost: string;
  revisit: string | null;
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
  systems: TechnicalDoc[];
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
  concepts: Raw<Concept>[];
  /* Personas aren't in a domain, so these have no `domain`. Missing from state written before personas. */
  personas?: Omit<Raw<Persona>, "domain">[];
  /* Technical docs aren't in a domain either. Missing from state written before them, as is `tradeoffs`. */
  systems?: Omit<Raw<TechnicalDoc>, "domain" | "kind">[];
  components?: Omit<Raw<TechnicalDoc>, "domain" | "kind">[];
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
    systems: [],
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

  /* Add one project's contribution to the doc with this ID, making it if it's the first. */
  function contribute<T extends Doc>(list: T[], id: string, project: string, raw: Omit<Raw<Doc>, "domain"> & { domain: string }, make: (base: Doc) => T): T {
    const from: Contribution = { project, domain: raw.domain, file: raw.file, name: raw.name, summary: raw.summary, body: raw.body };
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
    state.projects.push(projectOf(file));
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
        code: [],
        gaps: [],
        tradeoffs: [],
        builtBy: [],
        evidence: { implements: [], verifies: [] },
      }));
      addEvidence(capability.evidence, c.evidence, project);
      capability.levels.push({ project, domain: c.domain, level });
      union(capability.personas, c.personas ?? []);
      capability.code.push(...c.code.filter((g) => !capability.code.some((x) => x.glob === g.glob)));
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
      contribute(state.personas, p.id, project, { ...p, domain: "" }, (base) => ({
        ...base,
        image: p.image,
        capabilities: [],
        features: [],
        readiness: null,
      }));
    }
    /* Systems and components are in no domain; their contributions are told apart by project, as a persona's are. */
    for (const kind of ["system", "component"] as const) {
      for (const e of (kind === "system" ? file.systems : file.components) ?? []) {
        const doc = contribute(kind === "system" ? state.systems : state.components, e.id, project, { ...e, domain: "" }, (base) => ({
          ...base,
          kind,
          capabilities: [],
          code: [],
          meets: [],
          gaps: [],
          tradeoffs: [],
          evidence: { implements: [], verifies: [] },
        }));
        union(doc.capabilities, e.capabilities);
        doc.code.push(...e.code.filter((g) => !doc.code.some((x) => x.glob === g.glob)));
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

  /* Reverse links, worked out again across everything. */
  for (const c of state.capabilities) {
    for (const id of c.rules) union(find(state.rules, id)?.capabilities ?? [], [c.id]);
    for (const id of c.concepts) union(find(state.concepts, id)?.capabilities ?? [], [c.id]);
  }
  for (const r of state.rules) for (const id of r.concepts) union(find(state.concepts, id)?.rules ?? [], [r.id]);
  for (const e of [...state.systems, ...state.components]) {
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

  /* Contradictions: a product doc whose name or summary differs between contributions, or a rule or concept within one domain. */
  const differing = (type: string, docs: Doc[]) => {
    for (const doc of docs) {
      const said = new Set(doc.from.map((f) => `${f.name}\n${f.summary ?? ""}`));
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
  differing("system", state.systems);
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

/* Where a body's `##` section called `name` is: from its heading to the next heading at its level or above. */
function sectionAt(body: string, name: string): { start: number; end: number; heading: number } | null {
  const match = new RegExp(`^(#{1,2})\\s+${name}\\s*$`, "im").exec(body);
  if (!match) return null;
  const start = match.index;
  const heading = start + match[0].length;
  const next = new RegExp(`^#{1,${match[1].length}}\\s`, "m").exec(body.slice(heading));
  return { start, heading, end: next ? heading + next.index : body.length };
}

/* A body without a section, such as a capability's open decisions, which show under what's left instead. */
export function withoutSection(body: string, name: string): string {
  const at = sectionAt(body, name);
  return at ? body.slice(0, at.start) + body.slice(at.end) : body;
}

/* Just one section of a body, its heading included, or nothing. */
export function onlySection(body: string, name: string): string {
  const at = sectionAt(body, name);
  return at ? body.slice(at.start, at.end) : "";
}

/* The open decisions a capability's doc lists, from every contribution, each as Markdown: a list item or a paragraph. */
export function openDecisions(doc: Doc): string[] {
  return doc.from.flatMap((f) => {
    const at = sectionAt(f.body, "open decisions");
    if (!at) return [];
    const text = f.body.slice(at.heading, at.end).trim();
    const items: string[] = [];
    for (const block of text.split(/\n\s*\n/)) {
      const lines = block.split("\n").filter((l) => l.trim());
      if (!lines.length) continue;
      if (!/^\s*([-*]|\d+\.)\s+/.test(lines[0])) {
        items.push(lines.map((l) => l.trim()).join(" "));
        continue;
      }
      for (const l of lines) {
        if (/^\s*([-*]|\d+\.)\s+/.test(l)) items.push(l.replace(/^\s*([-*]|\d+\.)\s+/, ""));
        else items[items.length - 1] += ` ${l.trim()}`;
      }
    }
    return items;
  });
}

/* A rule a capability follows that nothing verifies or implements yet, and which of those it lacks. */
export type RuleWanting = { rule: Rule; missing: ("verifies" | "implements")[] };

/* A technical gap under a capability: the gap, and the system or component it's on. */
export type TechnicalGap = { gap: Gap; on: TechnicalDoc };

/*
 * What's still open about a capability: decisions nobody has made, its known
 * gaps, the technical gaps of what it's built on, and the rules it follows
 * with no evidence of a kind, which the spec calls a prompt, not a problem.
 * Tradeoffs aren't open: they're decided.
 */
export type Left = { decisions: string[]; gaps: Gap[]; technical: TechnicalGap[]; rules: RuleWanting[] };

/* Gaps or tradeoffs by ID, in the order given. */
export const gapsById = (state: DocketState, ids: string[]) => ids.flatMap((id) => state.gaps.find((g) => g.id === id) ?? []);
export const tradeoffsById = (state: DocketState, ids: string[]) => ids.flatMap((id) => state.tradeoffs.find((t) => t.id === id) ?? []);

/* A system or component by its `system:<id>` or `component:<id>` reference. */
export function technicalDoc(state: DocketState, ref: string): TechnicalDoc | undefined {
  const [kind, id] = [ref.slice(0, ref.indexOf(":")), ref.slice(ref.indexOf(":") + 1)];
  return find(kind === "system" ? state.systems : kind === "component" ? state.components : [], id);
}

/* What a capability is built on: the systems and components that list it. */
export const builtOn = (state: DocketState, capability: Capability) => capability.builtBy.flatMap((ref) => technicalDoc(state, ref) ?? []);

/* With `technical` false, as for a persona, only what someone using the product would notice. */
export function leftIn(state: DocketState, capability: Capability, technical = true): Left {
  return {
    decisions: openDecisions(capability),
    gaps: gapsById(state, capability.gaps),
    technical: technical ? builtOn(state, capability).flatMap((on) => gapsById(state, on.gaps).map((gap) => ({ gap, on }))) : [],
    rules: capability.rules.flatMap((id) => {
      const rule = find(state.rules, id);
      if (!rule) return [];
      const missing = (["verifies", "implements"] as const).filter((verb) => !rule.evidence[verb].length);
      return missing.length ? [{ rule, missing }] : [];
    }),
  };
}

export const leftCount = (left: Left) => left.decisions.length + left.gaps.length + left.technical.length + left.rules.length;

/*
 * When a gap is to close, worked out from `until` and the levels of the
 * capabilities it's about, since those can come from other projects:
 *
 * - due: one is already at the level, which expects it closed
 * - next: the level is one's next, so it closes before that promotion
 * - later: a level further on
 * - event: something that has to happen, in words
 * - undecided: nobody has decided
 *
 * A capability's gap is about it, at its level in the gap's domain. A
 * system's or component's is about the capability `until` names, or else
 * every one it serves, the strictest first, each at the level of the part its
 * own project builds, since that's the part it serves.
 */
export type Due = {
  when: "due" | "next" | "later" | "event" | "undecided";
  /* The level it's to close by, and the capability that decides when, at the level of the part it's about. */
  level?: Level;
  capability?: Capability;
  at?: CapabilityLevel;
  event?: string;
};

const DUE_ORDER: Due["when"][] = ["due", "next", "later"];

export function dueOf(state: DocketState, gap: Gap): Due {
  if (gap.until === "not-decided") return { when: "undecided" };
  const m = /^(?:(.+)@)?(prototype|alpha|beta|ga)$/.exec(gap.until);
  if (!m) return { when: "event", event: gap.until };
  const level = m[2] as Level;
  const subject = subjectOf(gap);
  const about =
    subject.type === "capability"
      ? [subject.id]
      : m[1]
        ? [m[1]]
        : (technicalDoc(state, `${subject.type}:${subject.id}`)?.capabilities ?? []);
  let best: Due = { when: "later", level };
  for (const c of about.flatMap((id) => find(state.capabilities, id) ?? [])) {
    /* The part the gap is about: a capability's in the gap's domain, or the part the system's or component's own project builds, the lowest where there are several. */
    const parts = c.levels.filter((l) => (subject.type === "capability" ? l.domain === gap.domain : l.project === gap.project));
    const at = parts.length ? parts.reduce((low, l) => (rank(l.level) < rank(low) ? l.level : low), parts[0].level) : c.stability;
    const when: Due["when"] = rank(at) >= levelIndex(level) ? "due" : nextLevel(at) === level ? "next" : "later";
    if (!best.capability || DUE_ORDER.indexOf(when) < DUE_ORDER.indexOf(best.when)) best = { when, level, capability: c, at };
  }
  return best;
}

/*
 * Where a checklist outcome stands for a capability:
 *
 * - gap: a gap on it, or on what it's built on, names the outcome
 * - evidence: a system or component it's built on says it meets it
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

/* What a detail page can show: a doc of the product, a system or component, or every gap and tradeoff at once. */
export type PageAt = Pick | { kind: TechnicalKind; id: string } | { kind: "gaps"; id: "" };

const PAGE_KINDS: Exclude<PageAt["kind"], "gaps">[] = ["domain", "feature", "capability", "concept", "persona", "system", "component"];

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
