/*
 * What each of Docket's own words means, for the popover a Term opens. Taken
 * from Docket's concept docs (docs/domain/concepts), shortened to what someone
 * looking at the page needs. Stability and maturity have popovers of their
 * own, so they aren't here.
 */
export type TermId =
  | "project"
  | "platform"
  | "domain"
  | "feature"
  | "capability"
  | "rule"
  | "concept"
  | "persona"
  | "mechanism"
  | "component"
  | "gap"
  | "product-gap"
  | "technical-gap"
  | "tradeoff"
  | "open-decision"
  | "risk"
  | "exposure"
  | "evidence"
  | "readiness"
  | "stability-checklist"
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
      "A place where software is defined, and usually built: one repository, marked by a docket.yaml at its root. Its docs say what the software can do and the rules it follows; its code and tests do it and prove it.",
    more: "A hotel's booking app is one project; its billing service, in a repository of its own, is another.",
  },
  platform: {
    name: "Platform",
    means:
      "The projects that make up one product together, such as a web and mobile app for the same service, or the services behind it. Docket shows a platform's projects together, as one picture.",
  },
  domain: {
    name: "Domain",
    means:
      "A part of the business the software serves, with a language of its own: within a domain, each word means one thing.",
    more: "Guest stays and Billing are both domains. A booking is a guest's hold on a room in one, and what they're charged for a stay in the other.",
  },
  feature: {
    name: "Feature",
    means:
      "A job the software does for its users or the business: an outcome of value someone comes to the software for. It's made of capabilities, and its maturity comes from theirs.",
    more: "Reservations is a feature: taking bookings and handling changes to them, before the guest arrives.",
  },
  capability: {
    name: "Capability",
    means:
      "The software's ability to produce one particular result of value, by itself or by letting someone produce it, as part of a feature's job. Each has its own stability level.",
    more: "Room booking is a capability of Reservations: its result is a guest with a room held for their stay.",
  },
  rule: {
    name: "Rule",
    means:
      "A business rule: something that must always be true, or must never happen, in the domain's words. It says what and why, never how the code enforces it.",
    more: "“A room can't be double-booked” is a rule. So is “cancelling 48 hours ahead is free”.",
  },
  concept: {
    name: "Concept",
    means:
      "What a term in the domain means: what it is, what it's made of, how it relates to other concepts and what states it moves through.",
    more: "A booking: “a guest's hold on one room for a stay”.",
  },
  persona: {
    name: "Persona",
    means:
      "A type of person the software serves, written as one invented person so it's easy to picture: who they are, what they need, and what they care about.",
    more: "Maria, front desk clerk, who takes bookings and checks guests in and out.",
  },
  mechanism: {
    name: "Mechanism",
    means:
      "How something works across a whole project, such as deployment, authentication or tenant isolation, so you need the whole picture to change it safely. It applies to every capability its project serves.",
    more: "A component is one area of the code; a mechanism is built once and relied on everywhere. Expect a handful per repository.",
  },
  component: {
    name: "Component",
    means:
      "One area of the code, and what to know before changing it, named the way the code names it. One component can serve several capabilities.",
    more: "A booking app's bookings component is where a room is held and double-booking is prevented. Something that works across the whole project is a mechanism instead.",
  },
  gap: {
    name: "Gap",
    means:
      "Something the software doesn't do yet, or doesn't do as intended, written down rather than hidden. We mean to close it, and when and how is up to us.",
    more: "A product gap is one someone using the software would notice; a technical gap, one only someone working on the code would. A gap we'll never close is a tradeoff instead.",
  },
  "product-gap": {
    name: "Product gap",
    means:
      "Something the software doesn't do yet, or doesn't do as intended, that someone using it would notice. It's written down rather than hidden, and we mean to close it.",
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
      "A question about what's intended that hasn't been settled yet, recorded so it isn't lost or quietly decided in code. Once settled, it closes, saying what it became.",
    more: "Does an early arrival's stay start that day?",
  },
  risk: {
    name: "Risk",
    means:
      "What's at stake in leaving a gap open, from 0 to 100: its impact, weighed by the stability of each capability it's on, and higher where it breaks the promise that level makes. Its verdict says whether that's acceptable (under 33), tolerable (33 to 66) or unacceptable (67 and up).",
    more: "A damaging gap that breaks a promise on a GA capability is 100, unacceptable; the same gap on a Prototype is 48, tolerable.",
  },
  exposure: {
    name: "Exposure",
    means: "How a gap's risk spreads across the capabilities it's on: its score on each. Of two gaps with the same risk, the one on more capabilities at that score comes first.",
  },
  evidence: {
    name: "Evidence",
    means:
      "Places in the repository that say they verify or implement a rule, capability, mechanism or component, found from annotations in the code. It's optional: without any, a rule holds on trust.",
  },
  readiness: {
    name: "Readiness",
    means:
      "How ready the software is for a persona: a percentage worked out from the maturity of everything they need, which is every capability that serves them.",
  },
  "stability-checklist": {
    name: "Stability checklist",
    means:
      "What each stability level generally expects, grouped by quality such as usability, reliability and security, so the people depending on a capability and the people building it share the same picture of its level.",
    more: "“A bad release can be undone” is one of Beta's outcomes.",
  },
  contradiction: {
    name: "Contradiction",
    means:
      "Two projects that should agree and don't, such as describing the same thing differently. Docket shows it, naming the projects, instead of choosing one.",
  },
};
