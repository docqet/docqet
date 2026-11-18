import { featureMaturity, maturityBand, projectMaturity } from "./design/maturity/maturity";
import { STABILITY_LEVEL_IDS, type StabilityLevelId } from "./design/stability/stability";

/*
 * The shape of `state.json`, as the spec's "Index output" section describes
 * it, and of the view the page builds from one or more of them (DocketState).
 */

/* A stability level, as state.json and the design components both name it: "ga". */
export type Level = StabilityLevelId;

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
};

export type Capability = Doc & {
  /* The personas it serves: who does it, or who it's done for. */
  personas: string[];
  /* Its level in short: the lowest of `levels`. */
  stability: Level;
  /* Its level in each domain that builds part of it, and the project that says so. */
  levels: { project: string; domain: string; level: Level }[];
  /* The feature it's in, or null. */
  feature: string | null;
  rules: string[];
  concepts: string[];
  code: CodeGlob[];
  gaps: string[];
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

/* A known gap in a capability: what someone using the product would notice. */
export type Gap = {
  id: string;
  /* Combining adds it: state.json doesn't say, since the file is the project's. */
  project?: string;
  domain: string;
  kind: "to-close-later" | "accepted-tradeoff";
  /* The stability checklist item it falls short of, as `<area>/<item>`, or null. */
  item: string | null;
  text: string;
};

/*
 * The stability checklist: what each level generally includes, by area. An
 * item applies from its level up, through `until` where a higher level
 * replaces it. Baseline items hold at every level and are never a gap.
 */
export type ChecklistItem = { id: string; level: Level; until: Level | null; baseline: boolean; text: string };
export type ChecklistArea = { id: string; name: string; why: string; items: ChecklistItem[] };
export type Checklist = { groups: { id: string; name: string; areas: ChecklistArea[] }[] };

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
  gaps: Gap[];
  problems: Problem[];
  /* The stability checklist, the same for every project: the first project's, or null if none has one. */
  checklist: Checklist | null;
};

/* A place where software is defined, as its state.json's header and summary have it. */
export type Project = {
  id: string;
  name: string;
  commit: string;
  indexedAt: string;
  maturity: number | null;
  band: Level | null;
};

/* A doc as one project's state.json has it: its contribution in one domain, with links as declared. */
type Raw<T extends Doc> = Omit<T, "from" | "levels" | "parts" | "project">;

/* One project's state.json, as the indexer writes it. */
export type StateFile = {
  docket: string;
  project: { id: string; name: string };
  commit: string;
  indexedAt: string;
  summary: { maturity: number | null; band: Level | null };
  /* Each of its domain.md files. A domain is its own domain, so these have no `domain`. */
  domains: Omit<Raw<Domain>, "domain" | "features" | "capabilities">[];
  features: Raw<Feature>[];
  capabilities: Raw<Capability>[];
  rules: Raw<Rule>[];
  concepts: Raw<Concept>[];
  /* Personas aren't in a domain, so these have no `domain`. Missing from state written before personas. */
  personas?: Omit<Raw<Persona>, "domain">[];
  gaps: Gap[];
  problems: Problem[];
  /* Missing from state written before the checklist. */
  checklist?: Checklist;
};

/* A project's header and summary, from its state.json. */
export const projectOf = (file: StateFile): Project => ({
  ...file.project,
  commit: file.commit,
  indexedAt: file.indexedAt,
  maturity: file.summary.maturity,
  band: file.summary.band,
});

const LEVEL_ORDER: readonly Level[] = STABILITY_LEVEL_IDS;

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
    gaps: [],
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
    for (const f of file.features) {
      const feature = contribute(state.features, f.id, project, f, (base) => ({ ...base, capabilities: [], parts: [], maturity: null, band: null }));
      union(feature.capabilities, f.capabilities);
      for (const c of f.capabilities) listed(`capability:${c}`, f.id, project);
      featureLists.set(f.id, [...(featureLists.get(f.id) ?? []), { domain: f.domain, capabilities: f.capabilities }]);
    }
    for (const c of file.capabilities) {
      const capability = contribute(state.capabilities, c.id, project, c, (base) => ({
        ...base,
        personas: [],
        stability: c.stability,
        levels: [],
        feature: null,
        rules: [],
        concepts: [],
        code: [],
        gaps: [],
        evidence: { implements: [], verifies: [] },
      }));
      addEvidence(capability.evidence, c.evidence, project);
      capability.levels.push({ project, domain: c.domain, level: c.stability });
      union(capability.personas, c.personas ?? []);
      capability.code.push(...c.code.filter((g) => !capability.code.some((x) => x.glob === g.glob)));
      union(capability.gaps, c.gaps.map((g) => `${g}@${project}`));
      pending.push({ from: capability, domain: c.domain, rules: c.rules, concepts: c.concepts });
    }
    for (const r of file.rules) {
      const rule = contribute(state.rules, `${r.id}@${r.domain}`, project, r, (base) => ({
        ...base,
        capabilities: [],
        concepts: [],
        evidence: { implements: [], verifies: [] },
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
    /* A gap's ID is its project's, as capabilities' `gaps` above name them. */
    state.gaps.push(...file.gaps.map((g) => ({ ...g, project, id: `${g.id}@${project}` })));
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
    c.stability = c.levels.reduce((low, l) => (LEVEL_ORDER.indexOf(l.level) < LEVEL_ORDER.indexOf(low) ? l.level : low), c.levels[0].level);
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

/* Whether a checklist item applies at a level: from its own level up, through `until` where it has one. */
export const appliesAt = (item: ChecklistItem, level: Level) =>
  levelIndex(item.level) <= levelIndex(level) && (!item.until || levelIndex(item.until) >= levelIndex(level));

/* The level after this one, or null after GA. */
export const nextLevel = (level: Level): Level | null => LEVEL_ORDER[levelIndex(level) + 1] ?? null;

/* A checklist item, with its area, by its full ID. */
export function checklistItem(checklist: Checklist | null, id: string): { item: ChecklistItem; area: ChecklistArea } | undefined {
  for (const area of checklist?.groups.flatMap((g) => g.areas) ?? []) {
    const item = area.items.find((i) => i.id === id);
    if (item) return { item, area };
  }
}
