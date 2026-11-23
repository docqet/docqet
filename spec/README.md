# Spec

The Docket format: how a repository records the state of its software so that
people, agents and tools can all read it. The spec belongs to no particular
tool. Anyone can adopt the format or write their own indexer for it.

**Status: draft for review.** Nothing implements it yet. Each example in
[`examples/`](examples/) is laid out as its own repository root, with the
`state.json` an indexer would produce from it:

- **[`hotel-bookings`](examples/hotel-bookings/)** is a small hotel-booking app
  that uses every part of the spec, code and tests included. The examples
  below come from it.
- **[`hotel-billing`](examples/hotel-billing/)** is the same hotel's billing
  service, in a repository of its own: guest bills, payments, company accounts
  and closing the day. It's a second project to show beside the first. It works
  in the Billing and Finance domains, and contributes Billing's part of Front
  desk, a feature that's mostly Guest stays'. Both are part of the Hotel
  platform.
- **[`exalynt-api`](examples/exalynt-api/)** and
  **[`exalynt-ui`](examples/exalynt-ui/)** are a real product, Exalynt, at
  full size, translated from forge's docs: six domains, 36 capabilities and
  368 rules. The API's repository holds the product docs for both, so
  `exalynt-ui` contributes technical docs only, for its four apps, and links
  them to the API's capabilities. The examples carry the docs and the API's
  acceptance tests, annotated with `docket:verifies`, but not the code. Both
  are part of the Exalynt platform.

## Principles

- **The repo is the source of truth.** Everything is declared in the
  repository or derived from it.
- **Declared vs. derived.** People and agents write the declared parts:
  stability, rules, decisions, gaps, tradeoffs and links. The indexer
  computes the derived parts: evidence, reverse links and problems. Readers
  work out what depends on other projects, such as maturity, readiness, risk,
  and which outcomes a capability meets with evidence. Nobody edits derived state by
  hand.
- **Intention about the product, and about how it's built.** Product docs say
  what the software does, in the domain's words, and never name its
  implementation. Technical docs say how it's meant to be built, in the
  code's words, and link to the product, never the other way.
- **Evidence is optional.** Code and tests can point at the rules they're
  about, so readers can see them beside the rule. Docket doesn't run tests or
  read their results, and nothing requires evidence at any level.
- **Structure in frontmatter, never in the body.** Each doc is Markdown.
  Everything the spec defines is a field in its YAML frontmatter. Its body is
  free Markdown for anything more worth saying, with no structure anyone can
  rely on. No fact is in both (see
  [Frontmatter and body](#frontmatter-and-body)).
- **Contradictions are shown, not resolved.** Each repository contributes what
  it knows to one picture of the product. Where two contributions disagree,
  readers see both and a problem, not a winner.

## What's in a repository

```text
docket.yaml                              config: the project's ID and name
docs/
└── product/
    ├── personas/                        who the software serves, across every domain
    └── domains/
        └── <domain>/                    one folder per domain the project works in
            ├── domain.md                the domain's ID, name and summary
            ├── features/                the product's jobs, each grouping capabilities
            ├── capabilities/            the only docs with a stability level
            ├── rules/                   one rule per file, in folders of your own, such as by topic
            └── concepts/
└── technical/
    ├── mechanisms/                      how something works across the project
    └── components/                      how one area of the code is built
<code and tests, anywhere>               docket:implements, verifies, gap and tradeoff comments
.docket/state.json                       written by `docket index`, gitignored
```

This is the product docs layout forge's `docs` skill uses today, with
these changes:

- Features are new. A feature is a job the product does, and it groups the
  capabilities that do it.
- Domains are new. A domain is a part of the business with a language of its
  own, and a project's docs are in a folder per domain it works in, under
  `domains/`. Forge's single `domain/` folder of rules and concepts becomes
  one of these per domain.
- Each folder directly under `docs/product/` holds one kind of thing:
  `personas/`, which span domains, and `domains/`.
- What tools depend on is a frontmatter field: its name and description,
  bold-label lines such as `**Stability:** Alpha`, Why and Open decisions.
  Everything else, such as a persona's needs, what a capability includes and
  a concept's lifecycle, is free Markdown in the body.
- Each doc says its own ID in an `id` field, so its file can be renamed or
  moved without breaking anything that links to it.
- Rules are one per file instead of one file per topic.
- A capability is its one-sentence description, saying who or what does what.
  "What people can do", with a heading per role, is gone: the people it
  serves are links to personas, and anything more it does can go in the body.
- Personas have a name, role, title and an optional image, and no Based on.
  What they need is in the body, with anything else about them. Capabilities link to them, so each persona's capabilities, features and
  readiness can be worked out.
- A rule no longer links to its acceptance test. Whatever verifies or
  implements it, a test or not, points at it instead, and can point at a
  capability too.
- Rules have no kind: core and edge case are gone.
- A capability can be a draft: declared, with no work started.
- A gap has no kind and no `until`: when and how it's closed is up to the
  team, not the docs. Each says its impact, so readers can order gaps by
  risk. A tradeoff is a list of its own, with its benefit and drawback. A feature can have tradeoffs and open decisions, and a
  domain open decisions.

Technical docs are forge's `engineering-docs` layout, with these changes:

- `docs/engineering/` is `docs/technical/`, to say what the docs hold, how
  the software is meant to be built, rather than who writes them.
- `architecture/systems/` is `mechanisms/`, since "system" usually means the
  whole software, and `architecture/features/` is `components/`, since a
  feature is a job the product does in Docket.
- Links, gaps, tradeoffs and open decisions are frontmatter, not sections.
  How it works is the body.
- The `**Code:**` line is gone. The code points at the doc instead, with
  `docket:implements` (see [Evidence](#evidence)).
- Forge's Gotchas section is gone. A gotcha that's a choice with a drawback is a
  tradeoff, one we mean to fix is a gap, and the rest is in the body.
- A gap has no `Until`, and gains an `impact` and a `when`. A tradeoff's
  `Costs` is its `drawback`, beside its `benefit`, and its `Revisit when` is
  its `when`, rated by its drawback's `impact`.
- A mechanism or component can say which checklist outcomes it meets.
- Providers and runbooks aren't read. A repository can keep them anywhere.

In the examples, `.docket/state.json` is checked in so you can read it. In a
real repository it's gitignored.

## IDs

Every doc says its ID in its `id` field, the first in its frontmatter. Where
the file is says only two things: its type, from the type's folder it's
under, and its domain, from the domain's folder it's in. Its file name, and
any folders it's in below its type's, are the author's to choose and change,
and renaming or moving a file within its type's folder breaks nothing.

| Type       | Under                                         | Example ID          |
| ---------- | --------------------------------------------- | ------------------- |
| domain     | `docs/product/domains/<domain>/domain.md`     | `guest-stays`       |
| feature    | `docs/product/domains/<domain>/features/`     | `reservations`      |
| capability | `docs/product/domains/<domain>/capabilities/` | `room-booking`      |
| rule       | `docs/product/domains/<domain>/rules/`        | `no-double-booking` |
| concept    | `docs/product/domains/<domain>/concepts/`     | `booking`           |
| persona    | `docs/product/personas/`                      | `front-desk-clerk`  |
| mechanism  | `docs/technical/mechanisms/`                  | `deployment`        |
| component  | `docs/technical/components/`                  | `bookings`          |

- **IDs and values are kebab case**: lowercase words joined by hyphens, such
  as `room-booking`, `not-decided` or `ga`. Tools show values with their own
  labels, such as GA for `ga`.
- **A project has one doc of each type with a given ID in each domain**, and
  one domain, persona, mechanism or component with a given ID in all. A
  second is a `duplicate-id` problem. The same ID in another domain, or in
  another project, is a contribution or another definition, as
  [Domains](#domains) describes.
- **Name the file after its ID**, as the examples do, so it's easy to find.
  That's a convention: nothing reads a file's name.
- **Changing an ID is a breaking change.** Everything that names it, in its
  project and in others on its platform, has to change with it, and the
  indexer reports each one left dangling. Readers show the `name`, so a doc
  can be renamed for people without changing its ID.
- **A reference names its type**, as `<type>:<id>`, such as
  `rule:no-double-booking`, everywhere one is written: frontmatter links,
  annotations, a decision's `became`, and `state.json`. A reference reads
  the same in a doc as in code, so searching for one finds everything that
  names that doc. A link of the wrong type for its field, such as a concept
  in `rules`, is `invalid-frontmatter`.

  ```yaml
  rules: [rule:no-double-booking, rule:minimum-stay]
  ```

- **A gap's or tradeoff's ID** is its doc's reference plus its key:
  `capability:room-booking#calendar-needs-a-mouse`,
  `feature:reservations#front-desk-bookings-only` or
  `component:ledger#balance-worked-out-on-read`.
- **What an ID names depends on the type** (see [Domains](#domains)). A
  domain, feature, capability, persona, mechanism or component ID names one
  thing across every project. A rule or concept ID names one definition
  within a domain.
- **A reference to a rule or concept names its domain** as `@<domain>`,
  unless it's from a doc in the same domain: `concepts:
  [concept:booking@guest-stays]`. An annotation has no domain of its own, so
  it always names one: `docket:verifies rule:closed-bills-dont-change@billing`
  (see [Which rule or concept a link means](#which-rule-or-concept-a-link-means)).

## Frontmatter and body

Every doc is a Markdown file in two parts: YAML frontmatter, then a body.

```markdown
---
id: bill
name: Bill
description: >-
  Everything a guest owes for one stay, and everything they've paid towards
  it.
confused-with:
  - term: Invoice
    summary: what a company is sent for a month of its staff's bills.
---

A bill is made of [charges](charge.md) and [payments](payment.md). Its balance
is what's been charged less what's been paid.

## Lifecycle

1. Open
2. Closed

A bill closes when its balance is zero, or when it moves to a company's
account.
```

- **Frontmatter is the doc's structure.** Its name and description, its
  level, its links, its gaps, tradeoffs and
  decisions, and the fields its type has, such as a persona's role or a
  rule's why. Tools read it, check it,
  count it, follow its links and lay it out.
- **The body is free Markdown**, for anything more worth saying, in whatever
  shape suits it: prose, lists, tables, code, images, and headings of the
  author's own. It's optional. No tool reads anything out of it, and readers
  show it as written.

### Which is which

Something is a frontmatter field when either of these is true:

- **The spec defines it.** It has a name and a meaning that every Docket
  repository shares, such as a persona's `role` or a concept's
  `confused-with`.
- **Something depends on finding it.** A tool or reader computes with it,
  counts it, links to it, checks it or shows it in a set place, such as a
  capability's `stability` or a domain's `decisions`.

Everything else is the body. That means:

- **The spec never gives the body a structure.** No heading in a body means
  anything to the spec or to any tool, and the spec never asks for one. When
  part of the body turns out to need a shared meaning, or a tool needs to find
  it, the spec adds a field and that part moves into frontmatter. It never
  becomes a heading that tools recognize.
- **Required means frontmatter.** What a doc must say is a required field.
  Only frontmatter is checked, and a doc with no body is complete.
- **No fact is in both.** The body says more than the fields do. It doesn't
  repeat them.
- **Readers don't assume a body's shape or size.** A body can be missing, a
  line or pages long, and hold anything Markdown can. Readers show it whole,
  rendered as Markdown, in a layout that suits any body.
- **Readers show the body as more about the doc.** Its frontmatter comes
  first, as what the doc is, and its body apart from it, as more about it, in
  the same way for every type. The two are never mixed, and a doc with no
  body shows nothing in its place.

### Writing frontmatter

- **Field names are kebab case**, like IDs: `confused-with`.
- **Text values are Markdown**, for inline formatting such as code, emphasis
  and links. A relative link resolves from the doc's file, as it does in the
  body. A short value can be plain. A longer one uses `>-`, which folds its
  lines into one paragraph. One with paragraphs or a list uses `|`, which keeps
  its line breaks.
- **A list of sentences is a YAML list**, one string per item, never a
  Markdown list in one string, so each item can be counted and shown alone.

## Doc types

Every doc has an `id` (see [IDs](#ids)) and a `name`, and every doc but a
rule has a `description`, all required:

- **`name`** is what it's called, such as `Room booking`. A persona's is the
  invented person's, such as `Maria`, and a rule's is the rule in a few words.
- **`description`** says what it is: for most docs a sentence, and for a
  concept a definition in the domain's words, in as many sentences as that
  takes. Readers show the name and description wherever the doc appears. A
  rule has none: its body says anything its name leaves out.

A gap and a tradeoff have a `name` and a `description` too, though they're
entries in a doc rather than docs of their own. What has no name, such as what
a concept is confused with, is said in its `summary` instead: the sentence or
two that is the thing itself.

| Type | Frontmatter, in order | Its body, if it has one | Example |
| --- | --- | --- | --- |
| domain | `id`, `name`, `description`, `decisions` | Anything more about the part of the business | [guest-stays](examples/hotel-bookings/docs/product/domains/guest-stays/domain.md) |
| feature | `id`, `name`, `description`, `capabilities` (required), `tradeoffs`, `decisions` | Anything more about the job | [reservations](examples/hotel-bookings/docs/product/domains/guest-stays/features/reservations.md) |
| capability | `id`, `name`, `description`, `stability` (required), `personas`, `rules`, `concepts`, `gaps`, `tradeoffs`, `decisions` | Anything more about what it does, such as what else it includes, or how we'll know it's working | [room-booking](examples/hotel-bookings/docs/product/domains/guest-stays/capabilities/room-booking.md) |
| rule | `id`, `name`, `concepts`, `why` | The rule in full, where its name doesn't say it all, and examples or how it plays out | [same-day-turnover](examples/hotel-bookings/docs/product/domains/guest-stays/rules/booking/same-day-turnover.md) |
| concept | `id`, `name`, `description`, `confused-with` | Its details: what it's made of, how it relates to other concepts, and the states it moves through | [booking](examples/hotel-bookings/docs/product/domains/guest-stays/concepts/booking.md) |
| persona | `id`, `name`, `description`, `role`, `title`, `image` | Anything more about who they are, such as what they need, what they know, their context, what they expect, and what they care about | [front-desk-clerk](examples/hotel-bookings/docs/product/personas/front-desk-clerk.md) |
| mechanism | `id`, `name`, `description`, `applies`, `meets`, `gaps`, `tradeoffs`, `decisions` | How it works | [deployment](examples/hotel-bookings/docs/technical/mechanisms/deployment.md) |
| component | `id`, `name`, `description`, `capabilities`, `meets`, `gaps`, `tradeoffs`, `decisions` | How it works | [bookings](examples/hotel-bookings/docs/technical/components/bookings.md) |

The body column is a suggestion of what's worth writing, not a structure.

- **`stability`** is `draft`, `prototype`, `alpha`, `beta` or `ga`, which
  tools show as Draft, Prototype, Alpha, Beta and GA. Only capabilities have
  one. A feature's, domain's and project's maturity, and their and personas'
  [readiness](#readiness), are worked out from their capabilities' (see
  [Features and maturity](#features-and-maturity)).
- **`personas`** lists the personas a capability serves: who does it, or who
  it's done for when the software does it.
- **`capabilities`** on a component lists the capabilities that rely on it.
  It's the only link between the technical docs and the product. A mechanism
  has none: it applies to every capability its project serves (see
  [Mechanisms and components](#mechanisms-and-components)).
- **No doc names its code.** A mechanism or component is found in the code by
  its `docket:implements` annotations (see [Evidence](#evidence)), and a
  capability through the mechanisms that apply to it and the components that
  list it, since product docs never name their implementation.
- **`applies`** says what a mechanism applies to: `project`, every capability
  its project serves, or `platform`, every capability any project on its
  [platform](#config) serves. It's `project` when left out.
- **`meets`** lists the [stability checklist](#stability-checklist) outcomes a
  mechanism or component meets for the capabilities it applies to, as
  `<quality>/<level>/<id>`. Its evidence is the proof.
- **`decisions`** lists the decisions on a domain, feature, capability,
  mechanism or component: questions about what's intended, including those that
  building it is meant to answer. A question goes on the doc it's about. Each
  has its `question` and, optionally, a `topic` of a few words, and is open
  until it's answered:
  - **`status`** is `open` or `closed`, and `open` when left out. Only open
    decisions count as what's left.
  - **`answer`**, once it's closed, says in a sentence or two what was
    decided.
  - **`became`**, once it's closed, lists what the answer was written as, one
    item or several: a doc as `<type>:<id>`, such as
    `rule:same-day-turnover` or `capability:group-bookings`, or a
    gap's or tradeoff's own ID, such as
    `capability:room-booking#calendar-needs-a-mouse`. Each stays on the
    decision's side: a decision on a domain, feature or capability becomes
    product docs, or their gaps or tradeoffs, and one on a mechanism or
    component becomes mechanisms or components, or their gaps or tradeoffs.
    A link to a rule or
    concept resolves as any other does, from the decision's domain. Readers
    show each, and show the decision on what it became, so either side leads
    to the other. A decision closed with nothing to write down, such as one
    answered "no", has an `answer` and no `became`.
  - **`gaps`**, while it's open, lists the gaps riding on it: those whose
    cost depends on how it's answered. Each is a gap's key on the same doc,
    or a gap's own ID, on the decision's side as `became` is. A decision has
    no impact of its own; readers show the highest risk among its gaps.

```yaml
decisions:
  - topic: Where the money goes
    question: >-
      Always back to the card it came from, or to whichever card the guest
      has with them?
  - topic: Groups
    question: Should a group be able to book several rooms under one name?
    status: closed
    answer: Yes, as a capability of its own, explored as a prototype first.
    became: [capability:group-bookings]
```

- **`why`** says why a rule holds, so whoever meets a case it didn't foresee
  can judge it.
- **`confused-with`** lists what a concept is easily mistaken for, each with a
  `summary` saying how they differ, and either `concept`, a link to that concept
  written as any concept link is, or `term`, for a word that isn't a concept
  in the docs.
- **`role`**, **`title`** and **`image`** describe a persona (see
  [Personas](#personas)).

### Capabilities

A capability is its name and its description: one sentence saying who or what does
what, such as "Clerks book a free room for a guest's stay" or "The software
closes each business day overnight". The sentence names the people it's about
the way the business does, and `personas` links them, so it reads on its own
and the links carry the exact list.

What a capability doesn't do is said elsewhere:

- **What must always or never happen**, every time, is a rule it follows:
  "a room can't be double-booked".
- **What's missing for now** is a gap: "the room calendar can't be used from
  the keyboard".
- **What's limited by choice** is a tradeoff: "a booking holds one room, not
  several".
- **A whole result it doesn't produce yet** is another capability, as a draft
  until work starts on it: the waitlist, beside room booking.

The questions building it is meant to answer, most often while it's a
prototype, are open decisions: "Do groups want one booking with many rooms, or
many bookings linked together?" Anything more about what it does can go in
the body, such as what else it includes when the description alone doesn't show
it ("Clerks move a booking to new dates"), or how we'll know it does its job.

```yaml
---
id: room-booking
name: Room booking
description: Clerks book a free room for a guest's stay.
stability: beta
personas: [persona:front-desk-clerk]
rules: [rule:no-double-booking, rule:minimum-stay]
---

## Includes

- Clerks see which rooms are free for a stay.
- Clerks move a booking to new dates.

## Success

- The front desk stops keeping the paper diary alongside the app.
```

### Personas

A persona is a type of person the software serves, written as one invented
person. Personas are written once for the whole project, not per domain,
since the same people work across domains.

```markdown
---
id: front-desk-clerk
name: Maria
description: Runs the front desk: takes bookings, and checks guests in and out.
role: Front desk
title: Front desk clerk
image: https://randomuser.me/api/portraits/women/68.jpg
---

## Needs

- To tell a guest at once whether a room is free for their dates, and hold it
  for them, without ever giving the same room to two guests.
- To check guests in and out quickly, so nobody waits at the desk.

## Knows

Every room in the hotel, the regulars, and the cancellation policy by heart.

## Context

At the desk all shift, on a shared desktop, with a guest or the phone waiting
most of the time.
```

- **`name`** is the invented person's name, and **`description`** a sentence
  on who they are.
- **`role`** is how they use the software: the role it gives them, as it
  relates to what they may do, or the part they play in it, such as
  `Front desk` or `Client Admin`. **`title`** is the job title they hold, such
  as `Front desk clerk` or `Controller`. Either can be left out, or `null`,
  when there's none: a hotel guest has no title.
- **`image`**, optional, is the URL of their picture. Any image a browser can
  show works. The examples use randomuser.me's free placeholder portraits.
  Readers show their initials without one.
- **Its body** is where to say more about who they are, such as what they
  need the software to do for them and why it matters to them, their domain
  knowledge and technical skill, their device and how often and under what
  pressure they do the work, the words and tools they already know, and what
  makes them trust the software or give up on it. The examples use headings of
  their own for these; nothing reads them.

### Mechanisms and components

A mechanism or component says how part of the software is built, in the code's
words, for the engineer or agent about to change it. A **mechanism** is how
something works across the whole project, such as Hotel Bookings'
[deployment](examples/hotel-bookings/docs/technical/mechanisms/deployment.md)
or Exalynt's authentication. It says how something works, not a convention
or standard to follow. A **component** is one area of the code, named as the
code names it, such as Hotel Bookings'
[bookings](examples/hotel-bookings/docs/technical/components/bookings.md) or
Hotel Billing's [ledger](examples/hotel-billing/docs/technical/components/ledger.md),
however many capabilities rely on it.

```markdown
---
id: deployment
name: Deployment
description: >-
  How a change gets from the main branch to the hotel's server, and back off
  it again.
meets:
  - reliability/beta/undo-release
  - observability/alpha/see-errors
gaps:
  - id: migrations-only-go-forward
    name: Migrations have no down step
    outcome: reliability/ga/recovery
    impact: damaging
    description: >-
      Migrations have no down step, so undoing a release that changed the
      schema means restoring the database from the night before.
    when: A release that changed the schema has to be undone.
tradeoffs:
  - id: migrations-before-start
    name: Migrations run while the old release serves
    impact: inconvenient
    description: >-
      Migrations run before the new image starts, while the old one is still
      serving, rather than stopping the app for each release.
    benefit: Releases don't take the front desk offline.
    drawback: >-
      The running code has to work with the new schema for a minute, so a
      column is added a release before it's used, and removed a release after
      the code stops reading it.
---

Every merge to `main` builds one container image, tagged with the commit, and
deploys it. Rolling back deploys the previous tag. Migrations run before the
new image starts, from `db/migrations/`, in filename order.
```

- **A mechanism applies to every capability its project serves**: the ones
  the project declares, other than drafts, and the ones its components list.
  It lists none, so a new capability is covered as soon as it's declared, and
  its gaps and the outcomes it meets show on each. A component lists the
  capabilities that rely on it, in `capabilities`.
- **Or to every capability its platform serves**, with `applies: platform`:
  what every project on the platform serves, worked out the same way. It's
  for something one repository runs for all of them, such as authentication
  in an API gateway that every service sits behind. Exalynt's
  [authentication](examples/exalynt-api/docs/technical/mechanisms/authentication.md)
  applies to its platform, since every app's requests go through it.
- **Only what the code can't say.** Leave out what a competent reader learns
  from the code in a few minutes, such as lists of endpoints, tables or
  functions. Most code has no doc.
- **No stability level, and no domain.** One doc can serve capabilities at
  different levels, and it's written in the code's words. The same ID in
  several projects is contributions to one, as for a feature.
- **Its body** is usually how it works, including what's correct but would
  surprise whoever changes it, in whatever shape explains it best.

## Links

Every link points one way and is written once:

```text
feature                    → capabilities
capability                 → personas, rules, concepts
rule                       → concepts
concept                    → concepts                  (confused-with)
gap                        → an outcome, a rule        (outcome, rule)
tradeoff                   → an outcome                (outcome)
decision                   → a doc, gap or tradeoff on its side  (became)
component                  → capabilities, outcomes    (meets)
mechanism                  → outcomes                  (meets)
annotation                 → rules, capabilities, mechanisms, components    (docket:verifies, docket:implements)
                           → gaps, tradeoffs           (docket:gap, docket:tradeoff)
```

The indexer computes the other direction, such as which capabilities a rule
applies to, which feature a capability is in, which domains a feature spans,
or which mechanisms a capability relies on, so the UI can show both sides.
Product docs never link to technical docs.

### Rules belong to a domain

Rules and concepts belong to a domain, not to any capability or feature. A
capability refers to the rules it follows, and that's the only link between a
rule and the product:

- **A rule can apply to many capabilities**, in one feature or several. In the
  example, `rule:no-double-booking` applies to room booking and group
  bookings in Reservations, and to check-in in Front desk.
- **A feature has no rules of its own.** Its rules are the ones its
  capabilities follow. Features don't list rules, and `state.json` doesn't
  either: a reader works them out from the feature's capabilities.
- **A rule keeps its ID as capabilities start or stop following it.** Rules
  can be kept in folders under `rules/`, such as one for each part of the
  domain, like `booking/`, but never one for a capability or a feature. The
  folders are for people and mean nothing to tools.
- **Following a rule claims it holds.** For each capability that follows it,
  a rule has a standing: not held, when one of the capability's gaps names it
  in `rule`; held with evidence, when anything verifies or implements it; or
  held on trust, when nothing names it. A gap wins over evidence.

Links in Markdown, in the body or in a frontmatter text value, are ordinary
relative links, for readers. They're paths, so moving a file can break them,
and the indexer reports any that are broken. Only frontmatter link fields and
annotations count as relationships, and they use IDs, so moving a file never
breaks those.

## Gaps and tradeoffs

Gaps and tradeoffs live in frontmatter, so the UI can count and group them.
Each has a key, and is recorded in exactly one place: the doc it's about. Its
key is unique among the gaps and tradeoffs of that doc across every project
and domain that writes it, so its ID means one gap or tradeoff: a capability
written in two domains can't have a gap with the same key in each. A second is
a `duplicate-id` problem.

| Declared on | Gaps | Tradeoffs |
| --- | --- | --- |
| Capability | What someone using the product would notice | Limits it has by choice |
| Feature | None: a capability it lacks is a draft capability | Non-goals: capabilities we've decided never to build |
| Mechanism or component | What only someone working on the code would notice | Technical choices |

Domains, rules, concepts and personas have neither. A limit across a whole
domain is a rule, or a tradeoff on the mechanism that causes it. When a gap has a
visible effect and a technical cause, the effect is the capability's gap, and
the technical doc explains the cause in How it works.

### Gaps

A **gap** is something we intend to close. It has an `id`, a `name` saying in
a few words what falls short, such as `Calendar needs a mouse`, a
`description` of a sentence or two, and optionally the `outcome` or `rule` it
falls short of, its `impact`, and `when` it bites. It doesn't say when or how it'll be closed:
Docket lists it so people know about it, and deciding that is up to them.

```yaml
gaps:
  - id: calendar-needs-a-mouse
    name: Calendar needs a mouse
    outcome: usability/beta/everyone
    impact: blocking
    description: >-
      The room calendar can't be used from the keyboard, so clerks need a
      mouse to pick dates.
```

- **`impact`** is what happens to whoever relies on what the gap is in when
  it bites: the people who use the software, run it, build on it, or depend on
  what it produces. It's rated by the consequence, never by how likely it is
  or by what kind of software it's in. Readers order gaps by [risk](#risk)
  from it, and show a gap without one as not rated, after the rest. It's one
  of four, from least to most, each taking more than the one before:

  | Impact         | What's lost                   | The test                                                                                                                                                                                                              |
  | -------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `negligible`   | Nothing                       | Nothing anyone relies on changes. At most, someone notices it.                                                                                                                                                        |
  | `inconvenient` | Time                          | What people rely on still comes out right, but it takes them extra time, a step by hand, or a workaround.                                                                                                            |
  | `blocking`     | The outcome                   | Someone, or some group of people, can't get done what they rely on it for, by any route available, until it's closed. They know it, and it waits.                                                                     |
  | `damaging`     | Something they can't get back | It leaves something wrong that can't be fully put right, or that someone acts on without knowing, at a cost: data lost or kept wrong, money moved wrongly, legal or financial exposure, someone able to do what they shouldn't. |

  Ask in order, and stop at the first yes: could it leave something wrong
  that can't be put right, or that someone acts on unknowing, at a cost
  (`damaging`)? Could it stop someone, with no way around it (`blocking`)?
  Does it cost time, a step by hand or a workaround (`inconvenient`)?
  Otherwise it's `negligible`. A wrong result someone notices and puts right
  is `inconvenient`; blocking some people is `blocking`; a gap that changes
  nothing for anyone yet is `negligible`, however untidy. When torn between
  two, pick the lower unless the higher one's test is plainly met. A gap that
  only bites in certain conditions, such as untested code, is rated by what
  would happen if it bit.
- **`when`** says, in a sentence, what makes it bite, when it isn't already
  happening: "Someone changes how corrections work." It describes the design,
  never how the running system is used, and it's context for people only:
  it's never part of risk, since Docket can't know whether it holds.

- **`outcome`** names the [stability checklist](#stability-checklist) outcome
  it falls short of, as `<quality>/<level>/<id>`. Most gaps are limits on what
  the capability does and match none.
- **`rule`** names a rule the capability follows but doesn't hold to yet.
  Readers show it on the rule too. A rule written before it's built is
  followed with one of these on each capability that doesn't hold to it yet,
  since following a rule otherwise claims it holds:

```yaml
gaps:
  - id: children-corrected-by-hand
    name: City tax charged for children
    rule: rule:children-pay-no-city-tax
    impact: inconvenient
    description: >-
      Guests' ages aren't recorded, so city tax is added for every guest on a
      stay, and clerks correct it by hand for children.
```

### Tradeoffs

A **tradeoff** is something we chose over an alternative and decided to live
with. It has an `id`, a `name` saying in a few words what we chose, such as
`Front desk bookings only`, a `description` saying what we chose and not what,
its `benefit`, what we hope to get by choosing it, and its `drawback`, what we
give up or risk in return, each a sentence or two, and both what came with
the choice. One tradeoff is one choice: when it has two drawbacks, its
`drawback` says both. Readers show a tradeoff with no `benefit` as missing
it, since a choice whose reason isn't written down can't be weighed against
its drawback. Its `impact` and `when` rate its drawback, as a gap's do. Optionally, its `outcome` names the
[stability checklist](#stability-checklist) outcome it falls short of on
purpose, as a gap's does, so the checklist shows it as not met by choice
rather than met:

```yaml
tradeoffs:
  - id: front-desk-bookings-only
    name: Front desk bookings only
    impact: inconvenient
    description: >-
      Bookings are taken at the front desk, not from online travel agencies.
    benefit: >-
      No agency integrations to build or keep working, while most bookings
      come straight to the desk.
    drawback: Clerks enter each agency booking by hand, as it arrives by email.
```

A gap we decide never to close becomes a tradeoff, with its drawback.

## Stability levels

Every capability that's been started is at one of four stability levels. The
level says how stable the work is right now, so people know what they can rely
on before they rely on it.

A capability declared but not started is a **draft**, `stability: draft`, such
as the [waitlist](examples/hotel-bookings/docs/product/domains/guest-stays/capabilities/waitlist.md)
or [refunds](examples/hotel-billing/docs/product/domains/billing/capabilities/refunds.md).
It isn't a level: it promises nothing, claims nothing on the checklist, and
counts toward no maturity or readiness. Readers show it as the word Draft,
with no level's mark.

| Level     | How stable | What it means                                                                                                                                           |
| --------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Prototype | Exploring  | Explores an idea so we can choose a direction. Its data may be fake, and it may change completely or be thrown away.                                    |
| Alpha     | Developing | Works, but is still taking shape. Expect frequent breaking changes and bugs.                                                                            |
| Beta      | Refining   | Settled enough for real use. Breaking changes and bugs are occasional. We aim to announce breaking changes ahead of time, but can't always.             |
| GA        | Stable     | Generally available and stable. It keeps working as it does today. Breaking changes are rare, announced ahead of time, and come with time to move over. |

- **A level describes how much you can depend on the work, not how good it
  is.** A prototype that answers its question quickly is good work.
- **Stability isn't perfection.** GA software still has bugs, and it can still
  have known gaps.

### Stability checklist

A stability level says in one word how stable something is.
[`stability/checklist.yml`](stability/checklist.yml) describes what each level
generally means and expects, so the people depending on a capability and the
people and agents building it share the same picture of it. It's part of the
spec, so it's the same for every project and every tool that reads Docket: a
project doesn't copy it, change it or configure it.

It's a guideline, not a gate:

- **Not every box needs checking.** Work can be called a level, GA included,
  with outcomes unmet. What's unmet is written down as a known gap, so
  everyone can see it.
- **It doesn't replace engineering judgment.** The engineer decides what fits
  the work, and judgment about the work wins over the wording of any outcome.
- **It applies differently to every project.** What an outcome takes, and
  whether it applies at all, depends on the software, who uses it, and the
  circumstances.

It has ten qualities, each a question someone asks before depending on the
work. Lower levels ask for little, enough to learn whether the work is worth
doing, and each level adds to the ones below it as more people come to rely on
the work:

| Quality         | The question it answers                                       |
| --------------- | ------------------------------------------------------------- |
| Utility         | Is it worth building, and is this the right way to build it?  |
| Usability       | Can its users learn and use it on their own?                  |
| Functionality   | Does it do what it should, and keep doing it?                 |
| Reliability     | Does it keep working when something goes wrong?               |
| Efficiency      | Is it fast enough, at a cost that makes sense?                |
| Security        | Is it protected, and does it follow the rules?                |
| Compatibility   | Does it fit with what's around it?                            |
| Observability   | When something goes wrong, does someone find out and see why? |
| Maintainability | Is it easy to understand and change?                          |
| Supportability  | Who's responsible, and where do people turn?                  |

They draw on ISO/IEC 25010, Kubernetes' feature graduation and production
readiness review, Google's SRE practice, AWS Well-Architected and FURPS+.
Practices and artifacts, such as tests, docs, logs and CI, aren't qualities:
they're ways a quality might be met, so they appear in `implementation`.

Each quality has a `question`, `why` it matters, and an entry for every level:

- **`summary`** says in a sentence how much that level asks of the quality. An
  entry without one expects nothing at that level. Efficiency, for example,
  expects nothing before Beta.
- **`outcomes`** are what should be true of the work at that level, each
  something someone can call met or not, worded to fit any kind of software,
  from a web app to a CLI, an HTTP API, a background job or a library.

Each outcome has two lists of examples, to help judge how to meet it at that
level, or whether to at all. They're illustrations, not instructions,
requirements or complete lists:

- **`implementation`** is how meeting it might look, which tools show as "How
  it might look". There are other ways to meet it.
- **`overengineering`** is work that may be overengineering at that level. It
  may be in scope at another level, or never needed for the project at all,
  so it isn't a to-do list for the next level. It's there to help judge where
  a level's work stops.

An example is its text alone, or its `text` and `kinds`: the kinds of software
it may suit, from the file's `kinds` list: web app, mobile app, desktop app,
HTTP API, CLI, background job and library. Kinds are indications, not rules: a
project can be several kinds, an untagged example may not suit it, and one
tagged for another kind may suit it well.

An entry without outcomes can still have `implementation` and
`overengineering`, for what work on the quality might look like at that level.

How outcomes combine:

- **An outcome that applies is met unless a gap or tradeoff names it.**
  Declaring a level claims what that level expects, except the gaps and
  tradeoffs written down, so only what isn't met is recorded. An outcome that doesn't apply, such as accessibility
  for an API with no screens, counts as met too.
- **Each outcome a capability's level expects has a standing:** not met, when
  a gap on the capability, or on a mechanism or component it relies on, names it;
  not met by choice, when a tradeoff there names it; met with evidence, when a
  mechanism or component it relies on `meets` it; or met on trust, when
  nothing names it. A gap wins over a tradeoff, and both win over `meets`.
- **An outcome's ID** is its quality, level and own ID, as
  `<quality>/<level>/<id>`: `reliability/beta/data-kept`.
- **A level includes every outcome the levels below it expect,** unless
  `until` names the last level an outcome applies to.
  `compatibility/prototype/opt-in`, which keeps it to those who chose to try
  it, applies through Alpha, and Beta's normal release replaces it.

## Features and maturity

A **feature** is a named product function that fulfills a distinct user or
business job, such as Reservations. It keeps its identity as its capabilities
and implementation change. A **capability** is something a feature can do as
part of its job, such as cancelling a booking. Features gain and lose
capabilities over time without becoming new features, and each capability has
its own stability level.

To tell them apart, ask whether the work helps an existing feature do its job,
or gives the product a new job. The first is a capability of that feature, and
the second is a new feature. Work that only changes how something is built is
neither.

A feature's doc lists its capabilities, in the order to show them:

```yaml
---
name: Reservations
description: Taking bookings and handling changes to them, before the guest arrives.
capabilities:
  - capability:room-booking
  - capability:cancellations
  - capability:group-bookings
---
id: reservations
```

- **A capability is in at most one feature.** One in none is allowed, and
  shows on its own.
- **A feature has no stability level.** It has a maturity, how far along it
  is, and a [readiness](#readiness), whether people can use it yet, which
  readers work out from its capabilities. Nobody writes them down.

A feature can span domains: each domain a project writes a feature doc in
contributes that domain's part of the job. Front desk is in Guest stays, with
check-in and check-out, and in Billing, with settling the bill at check-out.

### What maturity is

A feature's, a domain's or a project's **maturity** says how far along it is:
how close the work under way is to being stable and supported. It's a
percentage.

- **Higher means more of it is stable and supported.** 75% or more,
  Established, is healthy for most businesses.
- **New work shows on its feature.** Starting a new capability lowers that
  feature's maturity. An established domain moves only a little, because what's
  already stable counts most.
- **It's about the whole, not each part.** It's an indication, not a verdict.
  Whether people can use it yet is its [readiness](#readiness), which doesn't
  depend on it.

### How maturity is worked out

Each capability has a score for how far along it is, and a weight for how much
it counts. The more stable it is, the more it counts: one GA capability counts
as much as 1.5 Betas, 2 Alphas or 3 Prototypes. That's enough that dependable
work lifts a feature, but not so much that a little of it carries a feature
that's mostly early work.

| Level     | Score | Weight |
| --------- | ----- | ------ |
| Prototype | 15%   | 2      |
| Alpha     | 35%   | 3      |
| Beta      | 60%   | 4      |
| GA        | 100%  | 6      |

A **feature's maturity** is the weighted average of its capabilities' scores,
rounded to a whole percentage. Each capability counts once, at its level in
short: the lowest across the domains that build it. Each score sits inside its level's band (below),
so a feature whose capabilities are all at Alpha is 35%, in Alpha's band, and
never shows as more mature than it is. Drafts are left out, since no work has
started on them. A feature with no capabilities but drafts has no maturity.

For example, Reservations has room booking at Beta, cancellations at Alpha,
group bookings at Prototype, and the waitlist as a draft, so its maturity is
(60 × 4 + 35 × 3 + 15 × 2) ÷ (4 + 3 + 2) = 375 ÷ 9 ≈ 42%. Without group bookings it would be 345 ÷ 7 ≈ 49%.
Starting group bookings lowered it, but nothing got worse: something new
started.

A maturity sits in one of four **bands**, a quarter of the scale each, named
for a level and shown in its color. Each band says how far along the feature,
domain or project is as a whole, and what to expect from it:

| Band         | From | Level     | What it tells you                                                                                      |
| ------------ | ---- | --------- | ------------------------------------------------------------------------------------------------------ |
| Experimental | 0%   | Prototype | Early days. Much of it is still being explored, and could change completely or be dropped.             |
| Emerging     | 25%  | Alpha     | Taking shape. Some of it works, but much is still changing often, so expect bugs and breaking changes. |
| Promising    | 50%  | Beta      | Firming up. Enough of it is settled or stable for real use, while other parts are still changing.      |
| Established  | 75%  | GA        | Well established. Most of it is stable and supported, while any newer parts settle in.                 |

A band is about the whole, so it never says what every part is: a few
established capabilities can carry a feature into a higher band.

A **domain's maturity** is the weighted average of its parts of features'
maturities, worked out the same way:

- **Its part of a feature** is the capabilities in that feature that the domain
  builds, at their levels in that domain. Its maturity is worked out as a
  feature's is, from those levels alone, so a capability that spans domains
  counts once in each, at that domain's level.
- **Each part counts as a capability in its band would,** so an Established
  part counts for a lot and an Experimental one for little, however many
  capabilities it has.
- **Parts with no maturity don't count.**
- **A domain with no part that has a maturity has none.**

In the hotel example, Guest stays has Reservations (42%, Emerging), which
weighs 3, and its part of Front desk (84%, Established), which weighs 6, so
it's (42 × 3 + 84 × 6) ÷ (3 + 6) = 630 ÷ 9 = 70%, Promising. Property has only
Housekeeping, so it's 15%, Experimental. Front desk's own maturity counts
check-out once, at its level in short: shown with Hotel Billing, check-out is
GA in Guest stays and Alpha in Billing, so Front desk is (60 × 4 + 35 × 3) ÷
(4 + 3) = 345 ÷ 7 ≈ 49%, Emerging.

A **project's maturity** is worked out the same way from its features, so a
capability that spans domains still counts once. Hotel Bookings has
Reservations (42%), Front desk (84%) and Housekeeping (15%), so it's (42 × 3 + 84 × 6 + 15 × 2) ÷ (3 + 6 + 2) =
660 ÷ 11 = 60%, Promising. Several projects shown together have a maturity
too, worked out from all their features the same way, as if they were one
project. Showing only some projects works out each feature's and domain's
maturity from the capabilities those projects declare.

Maturity isn't a finish line, and 100% isn't the goal. It means everything
under way is GA. Software that keeps growing usually has newer parts settling
in, and stays Established as it does.

Readers work out maturity and bands, and they aren't in `state.json`, since a
capability's level in short needs every project that builds part of it.

## Readiness

Readers work out whether the software is **ready**: ready enough for people to
use it, and if not, what it still needs. It answers that well enough to act
on, not precisely. Nothing is written for it, and it isn't in `state.json`:
it depends on [risk](#risk) and on a capability's level in short, and both
need projects put together.

A **capability is ready** when:

1. **Its level in short is Beta or GA.** Beta is the first level settled
   enough for real use, and the lowest level across the domains that build
   it is the one people can count on everywhere.
2. **No gap is `unacceptable` on it**: no gap's risk, scored on that
   capability, falls in the `unacceptable` third.

A capability that's started but not ready is **not ready yet**, and **what it
needs** is to reach Beta, when it's below, and to close each gap that's
unacceptable on it. A draft is **not started**: it's neither.

Everything else's readiness is how many of its started capabilities are
ready, such as `2 of 4 ready`. It's **Ready** when all of them are, and **Not
ready yet** otherwise, with what each capability that isn't still needs.
Drafts are listed as not started and never count, so writing one down never
makes anything less ready. Something with no started capabilities has no
readiness.

| Readiness of                | Counts                                                          |
| --------------------------- | --------------------------------------------------------------- |
| A feature                   | Its capabilities                                                |
| A domain                    | Every capability with a part in it                              |
| A project, or several shown | Every capability showing                                        |
| A persona                   | Every capability that lists them                                |
| A feature, for a persona    | The capabilities in it that serve them                          |

A capability always counts whole, at its level in short, even where only
part of it is in the domain or project counted, since people use the whole
of it.

In Hotel Billing, the manager has city tax at Alpha, deposits at Beta, and
daily takings at Beta and night audit at GA, with no gaps. Deposits relies on
the ledger, whose untested corrections are `damaging` and score 72 there,
`unacceptable`. So the manager is `2 of 4 ready`, and what's left is:

```text
city tax   reach Beta, now Alpha
deposits   close component:ledger#corrections-of-corrections-untested (72)
```

The night auditor has only night audit, so they're Ready.

In Hotel Bookings, the front desk clerk is `0 of 6 ready`. Room booking,
check-in and check-out are at Beta or GA, but every one of them waits on the
deployment's migrations only going forward, `damaging`, which scores 72 on
Beta and 100 on GA. Room booking also waits on its calendar needing a mouse.
Cancellations, group bookings and room status need to reach Beta first, and
the waitlist isn't started.

A count says how much of it is ready, not whether what's missing matters to
someone. That's for people to judge: a persona who can do without the one
capability that isn't ready can start using the rest.

## Risk

Readers score each gap's **risk**: what's at stake in it, so the ones that
matter are read first. Nothing is written for it, and it isn't in
`state.json`: readers work it out once projects are put together, since a
mechanism that applies across a platform shows on every project's
capabilities. A product gap shows on its capability; a technical gap on
every capability its mechanism or component serves. On each capability it
shows on, a gap scores:

```text
impact step × level weight × 1.5 if it breaks that level's promise
```

1. **Its impact step**: `negligible` 1, `inconvenient` 2, `blocking` 3,
   `damaging` 4.
2. **The capability's level weight**, as in
   [maturity](#how-maturity-is-worked-out): Prototype 2, Alpha 3, Beta 4,
   GA 6. A draft weighs 0.
3. **Whether it breaks that level's promise**: it names a rule that
   capability follows, or a checklist outcome that capability's level
   expects, so that outcome shows as not met there. A draft makes no promise.

Each score is put on 0 to 100 by a log scale, from 2, the least there is (a
negligible gap on a Prototype), to 36, the most (a damaging gap breaking a
promise on GA), and rounded: `100 × ln(raw ÷ 2) ÷ ln(18)`. A draft scores
0. A gap's risk is its highest score. A gap with no `impact` has no risk. Its **verdict** is
the third its risk falls in: `acceptable` below 33, `tolerable` from 33, and
`unacceptable` from 67. Its **exposure** is how its scores spread: how many
capabilities carry each score, highest first. Readers order gaps by risk, highest first, then by
exposure, comparing the number of capabilities at each score from the
highest down, then gaps with no impact.

The ledger's `corrections-of-corrections-untested` is `damaging`, and names
`maintainability/ga/others-can-change`, which only GA expects. The ledger
serves extra charges at GA, where it breaks that promise: 4 × 6 × 1.5 = 36,
or 100. It serves deposits at Beta (72), check-out and direct billing at
Alpha (62 each), and split bills at Prototype (48). Its risk is 100,
`unacceptable`, and its exposure `100 on 1 · 72 on 1 · 62 on 2 · 48 on 1`.

Where several gaps are shown together, as for a capability, feature,
domain, persona or component, each is scored only on the capabilities
there, and readers show the highest risk and how many fall in each
verdict.

`when` is never part of risk. Tradeoffs are scored the same way by their
drawback's impact, without the promise: a tradeoff that names an outcome
falls short on purpose, so it breaks no promise. An open decision has no
risk of its own, and shows the highest risk among the gaps it lists.

## Evidence

A rule, capability, mechanism or component can have **evidence**: places in the
repository that say they verify it, or implement it. Evidence is optional at
every level, and there's no limit to how much there is. Docket doesn't care
what a place is, whether a test, code, a migration, a workflow or anything
else, or what language or framework it's in, and it doesn't run anything. It
shows where the evidence is, so a reader can go from what's intended to
what's about it.

A place gives evidence, or marks a gap or tradeoff, with an annotation,
written in a comment, the same in every language:

```text
docket:<verb> <type>:<id> [<type>:<id> ...]
```

- **`<verb>`** is one of four:
  - **`verifies`** says this place checks that the rule holds, the capability
    works, or the mechanism or component does what it says, such as
    [a unit test](examples/hotel-bookings/src/booking/stay.test.ts),
    [a Gherkin `Rule:`](examples/hotel-bookings/features/booking.feature) or
    [the rollback job](examples/hotel-bookings/.github/workflows/deploy.yml)
    in a deploy workflow.
  - **`implements`** says this place makes it so, such as
    [`assertRoomFree`](examples/hotel-bookings/src/booking/availability.ts), or
    the [constraint](examples/hotel-bookings/db/migrations/001_bookings.sql)
    in a database migration.
  - **`gap`** says this is where a gap shows in the code: tracked technical
    debt, in place of a bare TODO.
  - **`tradeoff`** says this code is deliberate, though it may look wrong, so
    nobody "fixes" it.
- **`<type>:<id>`** is a `rule`, `capability`, `mechanism` or `component` for
  `verifies` and `implements`, and a gap's or tradeoff's ID for `gap` and
  `tradeoff`. A rule always names its domain, as `rule:<id>@<domain>`. An
  annotation can name several, of any of its types:
  `docket:implements capability:room-booking component:bookings`.

```ts
// docket:verifies rule:minimum-stay@guest-stays
it("rejects a stay that ends the day it starts", () => {
```

```gherkin
  # docket:verifies rule:no-double-booking@guest-stays
  Rule: A room can't be double-booked
```

```ts
// docket:tradeoff component:ledger#balance-worked-out-on-read
export function balance(bill: Bill): number {
```

- **The indexer doesn't parse anything.** It looks for the four verbs in every
  file in the repository outside `docs/`, in whatever comment syntax the file
  uses.
- **An annotation is on the first line below it** that isn't blank or another
  annotation. The indexer records the file, the annotation's line, and that
  line's text as written, every time it runs. Nobody writes a line number
  down, and readers can tell what it's on without knowing the language.
- **None isn't a warning.** A rule or capability with nothing verifying or
  implementing it holds on trust, unless a gap says it doesn't. It's neither a
  problem nor something left to do, and readers say so plainly, without a
  warning. A gap or tradeoff with no annotation is fine.
- **A mechanism's or component's `implements` places are where it is in the
  code.** Its doc lists no paths. Annotate its entry points, where someone
  changing it should start reading, and whatever else is part of it, such as
  [`assertRoomFree`](examples/hotel-bookings/src/booking/availability.ts) and
  `saveBooking` for bookings. One at the top of a file stands for the whole
  file. Where only part of a file is its, such as one function in a file
  that's mostly another component's, only that part is annotated.
- **A mechanism's or component's evidence** is also the evidence for the
  checklist outcomes it `meets`.

Annotations are claims. The indexer catches one that names something that
doesn't exist, such as a gap left behind after it closed. It can't catch a
missing annotation, or one left behind on something that's no longer about
what it names.

## Config

[`docket.yaml`](examples/hotel-bookings/docket.yaml) at the repository root
marks the repository as a Docket **project**: a place where software is
defined, and usually implemented.

```yaml
project:
  id: hotel-bookings
  name: Hotel Bookings
platform:
  id: hotel
  name: Hotel
```

- **`project`** is metadata, not a boundary: it says where each doc comes
  from, so readers can see who said what and show only what some projects
  define.
  - **`id`** names the project wherever several are shown together, so it's
    unique among them. It's lowercase, with hyphens, like a doc's ID.
  - **`name`** is what people see, named for the software: Hotel Bookings,
    not Guest stays.
- **`platform`**, optional, says which **platform** the project is part of:
  the projects that make up one product together, such as its web, mobile and
  desktop apps, or the services behind it. Projects with the same platform
  `id` are shown together and their docs combined; projects on different
  platforms never are. A project that names no platform is a platform of its
  own.
  - **`id`** is lowercase, with hyphens, and the same in every project on the
    platform.
  - **`name`** is what people see, named for the product: Hotel, not Hotel
    Bookings. Every project on the platform should give the same one; readers
    use the first project's.

A doc's domain is the one whose `domain.md` is in the folder under
`docs/product/domains/` that the doc is in, so nothing in a doc says it, and
the folder's own name means nothing. Moving a doc to another domain's folder
moves it to that domain. Both hotel examples work in two domains each.

## Domains

A **domain** is a part of the business with a language of its own: a business
area and a bounded context, in domain-driven design's terms, as one. Every doc
but a persona is written in exactly one domain, the one whose folder it's in.
A project works in as many domains as it has folders under
`docs/product/domains/`, and projects
that work in the same part of the business use the same domain ID.

A domain's `domain.md` gives its name and description, any open decisions, and
anything more worth saying about it in its body:

```yaml
---
name: Guest stays
description: Looking after guests from their booking to their check-out.
id: guest-stays
---
```

Booking is "a guest's hold on one room for a stay" in Guest stays, and "what a
guest is charged for a stay" in Billing, and both are right.

Every project contributes what it knows to one picture of the product. How a doc
is put together with others of the same ID depends on its type:

| Type | Is one across | The same ID elsewhere |
| --- | --- | --- |
| domain, feature, capability, persona, mechanism, component | everything | A contribution to the same one. Its links are put together, and its name and description should match. |
| rule, concept | its domain | Another definition, shown beside this one. Within the same domain, it's a contribution, as above. |

Putting contributions together:

- **Features and capabilities span domains.** A feature or capability written
  in several domains is in each of them. Each domain's part is the
  capabilities that domain builds.
- **Links are combined**: a feature's capabilities and tradeoffs, a
  capability's personas, rules, concepts, gaps and tradeoffs, a mechanism's
  or component's capabilities, outcomes, gaps and tradeoffs, and
  everything's evidence. Each
  contribution's order is kept, in the order the projects are read.
- **What a contribution says is its own**: its body, and its frontmatter
  fields that aren't links, such as `decisions` or a rule's `why`. Readers show each, labelled with its project and domain.
  Its name and description, and a persona's role and title, should match the
  others'.
- **A capability's `stability` is per domain.** Each contribution declares the
  level of its own part. Where they differ, the capability's level in short is
  the lowest, and readers show each.

### Which rule or concept a link means

A link to a rule or concept means the one in the domain it names with
`@<domain>`, or, naming none, the one in its own domain: the domain of the
doc it's in. Nothing else is looked at, so what a link means never changes
because a doc was added or removed in another domain. A link that names no
domain and has nothing with that ID in its own is an `unknown-id` problem,
fixed by naming the domain it means.

An annotation in code is in no domain, so a rule it names always names its
domain too. One that doesn't is `invalid-annotation`.

In the examples, Billing's check-out uses `concept:booking`, and gets
Billing's definition, since that's its own domain's. Room status, in
Property, uses Guest stays' room as `concept:room@guest-stays`, since Property
has no `room` of its own.

### Contradictions

Two contributions that should agree and don't are a **contradiction**, shown
as a problem naming the projects involved:

- **A domain's, feature's, capability's, persona's, mechanism's or component's
  name or description differs** between projects, or a persona's role or title.
- **A capability is in two features**, whichever projects list them.
- **A rule or concept differs within one domain**, when more than one project
  declares it there.

A feature or capability in several domains isn't a contradiction, and neither
are different levels for a capability, or different definitions of a concept
in different domains.

In the examples, Hotel Billing writes check-out in Billing, the settling of the
bill, and its description isn't Hotel Bookings': that's a contradiction. It puts
check-out in Front desk, as Hotel Bookings does, so Front desk is one feature
in two domains, Guest stays and Billing, with check-out in both. Check-out is
GA in Guest stays and Alpha in Billing, so it's Alpha in short.

### Combining

Each project's `state.json` is indexed from its own repository, so it only
knows its own contributions. Showing several projects of one platform
together **combines** their states. Projects on different platforms are never
combined, since they're different products and the same ID can mean
different things in each:

1. Put each doc's contributions together by type and ID, as above.
2. Resolve links to rules and concepts named in other projects' domains.
3. Give each mechanism that applies to its platform every capability the
   platform's projects serve: each project's declared capabilities, other
   than drafts, and the ones its components list.
4. Work out the reverse links again across everything, and each
   capability's level in short, the lowest across the domains that build it.
   Readers then work out maturity, readiness and risk from all of it.
5. Add the problems combining finds: contradictions, and gap or tradeoff IDs
   declared in more than one project. Drop an `unknown-id` problem when the
   link resolves to another project's doc.

## Index output

`docket index` writes `.docket/state.json` ([example](examples/hotel-bookings/.docket/state.json)).
It holds everything the UI needs, so the UI never reads the repository itself,
and showing several projects together means reading each one's state.json.

- **Header**: the `project` (its ID and name), its `platform` (ID and name)
  when `docket.yaml` declares one, and the commit indexed.
- **`summary`**: how many domains and features there are, capabilities per
  level with `draft` among them, how many rules, gaps, tradeoffs, mechanisms,
  components and problems. This is the at-a-glance view.
- **`domains`**: each of the project's `domain.md` files.
- **`features`**: each with its capabilities and its `tradeoffs`. Each
  capability names the feature it's in, as a reference, or `null`,
  and lists its `gaps` and `tradeoffs`, by ID. Its `stability` can be
  `"draft"`.
- **`personas`**: each with its `name`, `role` and `title`, `role` and
  `title` as `null` where it has none, the capabilities that list them, the features
  those are in. Personas aren't in a domain, so
  these have no `domain`.
- **One list per doc type**: each entry has its ID, its `domain`, file, name,
  description, and links, in both directions, its type's other frontmatter fields,
  and its `body` as Markdown, exactly as written, or `""` with none. A doc
  declared in two of the project's domains has an entry for each. Its own
  `id` is bare, as its frontmatter has it. Its links, in both directions, are
  references, `<type>:<id>`, as declared, with `@<domain>` where the doc
  named one.
- **Fields are named in camel case**, as the rest of `state.json` is:
  `confused-with` is `confusedWith`. A field the doc leaves out is there
  anyway, as `[]` for a list and `null` otherwise, such as a rule's `why`
  or a persona's `image`. Each decision is its `topic`, or `null`, `question`, `status`, `answer`, or `null`, `became` as written, and `gaps` as written, or `[]`. Each `confusedWith` is its
  `concept` or `term`, the other `null`, and `summary`.
- **`mechanisms`** and **`components`**: each with its ID, file, name,
  `description`, `capabilities`, `meets`, its `gaps` and
  `tradeoffs` by ID, its `decisions`, its `evidence`, and its body. A
  component's `capabilities` are as it lists them. A mechanism also has
  `applies`, and its `capabilities` are worked out: every capability the
  project declares, other than drafts, then every one its components list
  that isn't already there. For one that applies to its platform, that's
  only this project's part, since the indexer can't see the others: combining
  adds the rest. They're in no domain, so they have no `domain`.
- **Evidence**: each rule's, capability's, mechanism's and component's entry also
  has `evidence`, with `verifies` and `implements` lists of each place's
  `file`, `line` and `text`, as [Evidence](#evidence) describes. Both are
  empty when it has none.
- **`gaps`**: every gap from every doc, each with its ID, its `domain` when
  it's a capability's, the `outcome` and `rule` it names or `null`, its
  `impact` and `when` or `null`, its `name` and `description`, and `places`: where `docket:gap` annotations mark it, in the same
  shape as evidence.
- **`tradeoffs`**: every tradeoff from every doc, each with its ID, its
  `domain` when it's a feature's or capability's, the `outcome` it names or
  `null`, `name`, `description`, `benefit`, or `null` where it has none, `drawback`, its
  `impact` and `when` or `null`, and `places`, from `docket:tradeoff` annotations.
- **`problems`**: everything the indexer found wrong, each about a doc with
  that doc's `domain`.
- **`checklist`**: the stability checklist the project was indexed against, so
  the UI can show it beside each capability. It's the YAML's `kinds`, and its
  `qualities`, each with its `levels` as a list in level order. Each level has
  its `level`, `summary` as `null` where it has none, and its `outcomes`,
  `implementation` and `overengineering`, each a list, empty where it has
  none. Each outcome has its full `<quality>/<level>/<id>` ID, its `level`,
  `text`, `until` as `null` where it has none, and its own `implementation`
  and `overengineering`. Every example
  in either is its `text` and `kinds`, with `kinds` empty where it isn't
  tagged.

### Problems

| Type                  | Raised when                                                                                                      |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `unknown-id`          | A link, annotation, `rule`, `became` or a decision's `gaps` names a doc, gap or tradeoff that doesn't exist.     |
| `invalid-frontmatter` | A required field is missing, or a value isn't allowed, such as a link of the wrong type for its field, or a domain folder has no `domain.md` to give its ID. |
| `duplicate-id`        | A project has two docs of one type with the same ID in one domain, or two domains, personas, mechanisms or components with the same ID, or a doc has two gaps or tradeoffs with the same key across the projects and domains that write it. |
| `broken-link`         | A relative link in a doc's body or a text value doesn't resolve.                                                 |
| `unlinked-rule`       | No capability follows a rule.                                                                                    |
| `in-two-features`     | More than one feature lists the same capability.                                                                 |
| `contradiction`       | Contributions that should agree don't, as Domains describes.                                                     |
| `invalid-annotation`  | An annotation names a rule without its domain.                                                                   |
| `unknown-outcome`     | A gap's or tradeoff's `outcome`, or an entry in `meets`, isn't a checklist outcome.                              |
| `became-other-side`   | A decision's `became` or `gaps` names a technical doc, or its gap or tradeoff, from a product doc, or the other way round. |

`in-two-features` is a contradiction too, when the listings
are in different projects. Combining raises `contradiction` and
`duplicate-id`, and those.

## Open decisions

- **The stability checklist is fixed.** It becomes configurable once someone
  adopting Docket needs different outcomes.
- **Met is mostly assumed.** An outcome counts as met unless a gap or tradeoff
  names it.
  A mechanism or component that `meets` it adds evidence, but everything else is
  met on trust, so nothing says which outcomes someone actually looked at, and
  an outcome added to the checklist counts as met everywhere at once. A record
  of when someone last went through the list, and against which version of
  it, would show both. Outcomes not applicable, with why, and outcomes Docket
  can work out itself, such as `functionality/alpha/main-path` from its rules'
  evidence, would also make met mean more.
