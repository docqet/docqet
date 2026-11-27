/*
 * What each of Docqet's own words means, for the popover a Term opens. Taken
 * from Docqet's concept docs, in docqet/concepts/,
 * shortened to what someone looking at the page needs. Stability and maturity also have popovers of
 * their own, on their marks; these are for where they label something.
 */
export type TermId =
  | "project"
  | "product"
  | "area"
  | "feature"
  | "capability"
  | "rule"
  | "concept"
  | "persona"
  | "problem"
  | "constraint"
  | "initiative"
  | "mechanism"
  | "component"
  | "gap"
  | "product-gap"
  | "technical-gap"
  | "tradeoff"
  | "open-decision"
  | "risk"
  | "spread"
  | "exposure"
  | "evidence"
  | "readiness"
  | "improvement"
  | "part"
  | "stability"
  | "maturity"
  | "rubric"
  | "contradiction";

export type TermEntry = {
  name: string;
  /** What it is, in a sentence or two. */
  means: string;
  /** An example, or how it differs from what it's easily mistaken for. */
  more?: string;
};

export const TERMS: Record<TermId, TermEntry> = {
  project: {
    name: "Project",
    means:
      "One piece of software that describes itself to Docqet: a folder marked by a docqet.yaml, often a repository, or one package in a repository with several. Its docs say what the software can do and the rules it follows; its code and tests do it and prove it.",
    more: "A hotel's booking app is one project; its billing service is another. Each is indexed on its own, then shown together as their product.",
  },
  product: {
    name: "Software product",
    means:
      "The end result of one or more pieces of software working together to accomplish a high-level goal, such as a web app, a mobile app and the API behind them. Each piece is a project, and Docqet shows a product's projects together, as one picture.",
    more: "A hotel's booking app and its billing service make one product, Hotel.",
  },
  area: {
    name: "Area",
    means:
      "A part of the product that groups the features belonging together, so a large product can be seen a part at a time. It's a plain grouping: features name it, and it has no language of its own.",
    more: "Guest stays is an area, with Reservations and Front desk in it; Billing is another, with Guest bills and Payments. A feature in no area is allowed, and shows on its own.",
  },
  feature: {
    name: "Feature",
    means:
      "A part of what the product offers its users or the business, with an identity that lasts: the part of the software someone comes to, and would name. Capabilities name it, and its maturity comes from theirs. It can be in an area.",
    more: "Reservations is a feature: taking bookings and handling changes to them, before the guest arrives.",
  },
  capability: {
    name: "Capability",
    means:
      "The software's ability to produce one particular result of value, by itself or by letting someone produce it, as part of a feature, solving part of one or more problems. Each has its own stability level.",
    more: "Room booking is a capability of Reservations: its result is a guest with a room held for their stay. It serves the personas of the problems it solves.",
  },
  rule: {
    name: "Rule",
    means:
      "A business rule: a promise the software keeps, often one the business chose. It's something that must always be true, or must never happen, in the product's words, and says what and why, never how the code enforces it.",
    more: "“A room can't be double-booked” is a rule. So is “cancelling 48 hours ahead is free”. A rule can respect a constraint, but the constraint would hold whatever the rules said.",
  },
  concept: {
    name: "Concept",
    means:
      "What one of the product's words means: what it is, what it's made of, how it relates to other concepts and what states it moves through. A word that means two things is two concepts.",
    more: "A booking: “a guest's hold on one room for a stay”.",
  },
  persona: {
    name: "Persona",
    means:
      "A type of person the software serves, written as one invented person so it's easy to picture: who they are, the context they work in, and what they care about. What they need is in the problems they have.",
    more: "Maria, front desk clerk, who takes bookings and checks guests in and out.",
  },
  problem: {
    name: "Problem",
    means:
      "A pain point one or more personas share, said in their words without naming the software: why the software exists. Capabilities say which problems they solve.",
    more: "“A guest's room is given to someone else” is a problem the front desk clerk has; room booking solves it. A problem would still be true if the software didn't exist, and one nothing solves yet is shown as such.",
  },
  constraint: {
    name: "Constraint",
    means:
      "Something imposed from outside that any solution must respect, and nobody on the team can change: a law, a contract, a policy set elsewhere, or a fact of the world. Rules and mechanisms say which constraints they respect.",
    more: "The tax office requires invoice numbers to run in sequence; the rule “invoice numbers run in sequence” respects it. Capabilities solve problems; rules and mechanisms respect constraints. One nothing respects yet is shown as such.",
  },
  initiative: {
    name: "Initiative",
    means:
      "A named body of work, such as the MVP or what comes after it. It names the personas its work is for, and capabilities say which initiatives they're part of. Choosing a scope shows everything, or one initiative, and every number counts only what's showing.",
    more: "Busy season, in Hotel Bookings: group bookings, the waitlist and room status, across two features. Unlike a feature, it's a stretch of work, not a lasting part of the product.",
  },
  mechanism: {
    name: "Mechanism",
    means:
      "How something works across a whole project, such as deployment, authentication or tenant isolation, so you need the whole picture to change it safely. It applies to every capability its project serves.",
    more: "A component is one part of the code; a mechanism is built once and relied on everywhere. Expect a handful per repository.",
  },
  component: {
    name: "Component",
    means: "One part of the code, and what to know before changing it, named the way the code names it. One component can serve several capabilities.",
    more: "A booking app's bookings component is where a room is held and double-booking is prevented. Something that works across the whole project is a mechanism instead.",
  },
  gap: {
    name: "Gap",
    means:
      "A known shortfall that needs work nobody has done yet, such as building, deciding, designing or testing, written down so people see it before they depend on it. We mean to close it, and when and how is up to us.",
    more: "A bug isn't one: fixing the code closes it, so it goes in the issue tracker. Nor is what a capability's level already says, or relying on something less stable. A product gap is one someone using the software would notice; a technical gap, one only someone working on the code would. One we'll never close is a tradeoff instead.",
  },
  "product-gap": {
    name: "Product gap",
    means:
      "A gap someone using the software would notice: something it doesn't do yet, or does short of what's intended, that needs work nobody has done yet. It's written down rather than hidden, and we mean to close it.",
    more: "Such as a room calendar that can't be used from the keyboard. Something only someone working on the code would notice is a technical gap.",
  },
  "technical-gap": {
    name: "Technical gap",
    means:
      "A shortfall only someone working on the code would notice, written down on its mechanism or component. It shows on every capability that relies on it. Technical debt is a technical gap.",
    more: "Such as nothing testing a correction of a correction in a ledger.",
  },
  tradeoff: {
    name: "Tradeoff",
    means:
      "Something chosen over an alternative on purpose, with its benefit and drawback, that we've decided to live with. It's a decision, not something left to do.",
    more: "A booking holds one room, so a family that needs two makes two bookings. On a feature, a tradeoff is something decided never to build.",
  },
  "open-decision": {
    name: "Open decision",
    means:
      "A question about what's intended that hasn't been settled yet, recorded so it isn't lost or quietly decided in code. Once it's answered, it's deleted, and the answer is written as whatever it became.",
    more: "Does an early arrival's stay start that day? One whose answer could change what people rely on is rated as a gap is, with impact, likelihood and reach, read about the change its answer could bring, and has a risk that counts in exposure.",
  },
  risk: {
    name: "Risk",
    means:
      "What's at stake in leaving a gap, or a rated open decision, open, from 0 to 100: what it could do, its impact times how likely it is and how many it reaches, weighed by how much people rely on each capability it's on, from its stability, and higher where it breaks a claim that level makes, the more so the higher the level. Its verdict says whether that's acceptable (under 33), tolerable (33 to 66) or unacceptable (67 and up).",
    more: "A certain damaging gap reaching everyone that breaks a claim on a GA capability is 100. Only possible, it's 76, still unacceptable; on a Beta capability, where it breaks no claim, 48, tolerable.",
  },
  spread: {
    name: "Spread",
    means:
      "How one gap's risk spreads across the capabilities it's on: how many have each score, highest first, such as “76 on 1 · 48 on 2”. Of two gaps with the same risk, the one on more capabilities at that score comes first.",
    more: "A gap in something many capabilities rely on, such as a product mechanism, spreads further than one on a single capability. It orders gaps; it isn't a total. What the gaps on some capabilities put at stake together is their exposure.",
  },
  exposure: {
    name: "Exposure",
    means:
      "What the gaps and rated decisions still open on a feature, area, project or what serves a persona put at stake together: how close its capabilities are to the worst their levels allow, as a percentage, in one of four bands: low, minor, moderate or high. It's to risk what maturity is to stability.",
    more: "Each capability is exposed to its riskiest gap's or decision's share of the most it could be, a certain damaging gap reaching everyone that breaks a claim its level makes, and each counts by its level, GA most, as in maturity. Drafts don't count. Readiness is maturity less exposure.",
  },
  evidence: {
    name: "Evidence",
    means:
      "Places in the repository that say they verify or implement a rule, capability, mechanism or component, found from annotations in the code. It's optional: without any, a rule holds on trust.",
  },
  readiness: {
    name: "Readiness",
    means:
      "Our view of how ready the software is to serve people in production, from the engineering judgement written down beside it: each capability's stability level, and its gaps, rated open decisions and their risk. It's a recommendation, and you're the judge.",
    more: "It's maturity less the exposure: maturity × (1 − exposure), and it always comes with its improvements: what would raise it. A persona at 70% is Viable: most of what they need can be relied on day to day.",
  },
  improvement: {
    name: "Improvement",
    means:
      "Something that would make it more ready, and by how much: promoting a capability, or every capability in a feature or area, to its next level, which raises maturity, or closing a gap or answering a rated open decision, which lowers exposure. They're shown by part, one level down, each with its potential and its next step.",
    more: "They're what could be done, not a finish line: software that keeps growing is never done, and whether any of it is worth doing, and when to stop, is yours to judge. A gap that isn't the riskiest on any capability raises nothing yet, so it isn't one until it is.",
  },
  part: {
    name: "Part",
    means:
      "Where readiness could rise, one level below what's being looked at: a product's parts are its areas, an area's its features, a feature's its capabilities, and a capability's its steps. A gap or decision that's the riskiest in more than one part is a part of its own.",
    more: "A part's potential is how ready what's being looked at could be with all of the part settled, every capability in it at GA with nothing open; its next step is the one thing in it that would raise readiness most. Potentials overlap, so they don't add up. Open a part to see its own parts.",
  },
  stability: {
    name: "Stability",
    means:
      "How much people can depend on a capability right now: Prototype, Alpha, Beta or GA. It's declared by the people building it, and only changes when someone promotes or demotes it. A capability not started yet is a draft, with no level.",
    more: "Beta is the bar for real use: settled enough to rely on. A level is about dependability, not quality. Only capabilities have one; features, areas and projects have a maturity instead.",
  },
  maturity: {
    name: "Maturity",
    means:
      "How far along a feature, area or project is: how much of the work under way is stable and supported, as a percentage worked out from its capabilities' stability. Stable capabilities count for more, and drafts don't count. It falls in one of four bands.",
    more: "It's about the whole, not each part, and starting new work lowers it without anything getting worse. It doesn't say whether people can rely on it: that's readiness.",
  },
  rubric: {
    name: "Stability rubric",
    means:
      "What each stability level generally expects, grouped by quality such as usability, reliability and security, so the people depending on a capability and the people building it share the same picture of its level.",
    more: "“A bad release can be undone” is one of Beta's outcomes.",
  },
  contradiction: {
    name: "Contradiction",
    means:
      "Two projects that should agree and don't, such as describing the same thing differently. Docqet shows it, naming the projects, instead of choosing one.",
  },
};
