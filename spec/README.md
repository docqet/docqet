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
  computes the derived parts: maturity, readiness, evidence, reverse links and
  problems. Readers work out what depends on other projects, such as which
  outcomes a capability meets with evidence. Nobody edits derived state by
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
    ├── personas/<slug>.md               who the software serves, across every domain
    └── domains/
        └── <domain>/                    one folder per domain the project works in
            ├── domain.md                the domain's name and summary
            ├── features/<slug>.md       the product's jobs, each grouping capabilities
            ├── capabilities/<slug>.md   the only docs with a stability level
            ├── rules/<topic>/<slug>.md  one rule per file, grouped by topic
            └── concepts/<slug>.md
└── technical/
    ├── mechanisms/<slug>.md             how something works across the project
    └── components/<slug>.md             how one area of the code is built
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
  team, not the docs. A tradeoff is a list of its own,
  with its benefits and drawbacks. A feature can have tradeoffs and open decisions, and a
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
- A gap has no `Until`. A tradeoff's `Costs` is `drawbacks`, a list beside its
  `benefits`, and it has no `Revisit when`.
- A mechanism or component can say which checklist outcomes it meets.
- Providers and runbooks aren't read. A repository can keep them anywhere.

In the examples, `.docket/state.json` is checked in so you can read it. In a
real repository it's gitignored.

## IDs

A doc's ID is its path under its type's folder, without `.md`: in its domain
for those written in one, or under `personas/` for a persona. A domain's ID is
its folder's name:

| Type       | Folder                                        | Example ID                  |
| ---------- | --------------------------------------------- | --------------------------- |
| domain     | `docs/product/domains/`                       | `guest-stays`               |
| feature    | `docs/product/domains/<domain>/features/`     | `reservations`              |
| capability | `docs/product/domains/<domain>/capabilities/` | `room-booking`              |
| rule       | `docs/product/domains/<domain>/rules/`        | `booking/no-double-booking` |
| concept    | `docs/product/domains/<domain>/concepts/`     | `booking`                   |
| persona    | `docs/product/personas/`                      | `front-desk-clerk`          |
| mechanism     | `docs/technical/mechanisms/`                     | `deployment`                |
| component  | `docs/technical/components/`                  | `bookings`                  |

- **IDs, links and values are kebab case**: lowercase words joined by
  hyphens, such as `room-booking`, `not-decided` or `ga`.
  Tools show values with their own labels, such as GA for `ga`.
- **No `id:` field.** The path is the ID, so there's nothing to drift. Renaming
  a file renames the doc, and the indexer reports every link and annotation the
  rename left dangling.
- **Where the type isn't obvious, the ID carries it**, as `<type>:<id>`, such
  as `rule:booking/no-double-booking` in an annotation or a problem's
  `subject` in `state.json`. In frontmatter the field name gives the
  type, so links there are bare: `rules: [booking/no-double-booking]`.
- **A gap's or tradeoff's ID** is its doc's ID plus its key:
  `capability:room-booking#calendar-needs-a-mouse`,
  `feature:reservations#front-desk-bookings-only` or
  `component:ledger#balance-worked-out-on-read`.
- **What an ID names depends on the type** (see [Domains](#domains)). A
  domain, feature, capability, persona, mechanism or component ID names one
  thing across every project. A rule or concept ID names one definition
  within a domain.
- **A link to another domain's rule or concept** adds `@<domain>`:
  `concepts: [booking@guest-stays]`, or
  `docket:verifies rule:bills/closed-bills-dont-change@billing`.

## Frontmatter and body

Every doc is a Markdown file in two parts: YAML frontmatter, then a body.

```markdown
---
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

Every doc has a `name`, and every doc but a rule has a `description`, both
required:

- **`name`** is what it's called, such as `Room booking`. A persona's is the
  invented person's, such as `Maria`, and a rule's is the rule in a few words.
- **`description`** says what it is: for most docs a sentence, and for a
  concept a definition in the domain's words, in as many sentences as that
  takes. Readers show the name and description wherever the doc appears. A
  rule has none: its body says anything its name leaves out.

What has no name, such as a gap, a tradeoff or what a concept is confused
with, is said in its `summary` instead: the sentence or two that is the thing
itself.

| Type | Frontmatter, in order | Its body, if it has one | Example |
| --- | --- | --- | --- |
| domain | `name`, `description`, `decisions` | Anything more about the part of the business | [guest-stays](examples/hotel-bookings/docs/product/domains/guest-stays/domain.md) |
| feature | `name`, `description`, `capabilities` (required), `tradeoffs`, `decisions` | Anything more about the job | [reservations](examples/hotel-bookings/docs/product/domains/guest-stays/features/reservations.md) |
| capability | `name`, `description`, `stability` (required), `personas`, `rules`, `concepts`, `gaps`, `tradeoffs`, `decisions` | Anything more about what it does, such as what else it includes, or how we'll know it's working | [room-booking](examples/hotel-bookings/docs/product/domains/guest-stays/capabilities/room-booking.md) |
| rule | `name`, `concepts`, `why` | The rule in full, where its name doesn't say it all, and examples or how it plays out | [same-day-turnover](examples/hotel-bookings/docs/product/domains/guest-stays/rules/booking/same-day-turnover.md) |
| concept | `name`, `description`, `confused-with` | Its details: what it's made of, how it relates to other concepts, and the states it moves through | [booking](examples/hotel-bookings/docs/product/domains/guest-stays/concepts/booking.md) |
| persona | `name`, `description`, `role`, `title`, `image` | Anything more about who they are, such as what they need, what they know, their context, what they expect, and what they care about | [front-desk-clerk](examples/hotel-bookings/docs/product/personas/front-desk-clerk.md) |
| mechanism | `name`, `description`, `applies`, `meets`, `gaps`, `tradeoffs`, `decisions` | How it works | [deployment](examples/hotel-bookings/docs/technical/mechanisms/deployment.md) |
| component | `name`, `description`, `capabilities`, `meets`, `gaps`, `tradeoffs`, `decisions` | How it works | [bookings](examples/hotel-bookings/docs/technical/components/bookings.md) |

The body column is a suggestion of what's worth writing, not a structure.

- **`stability`** is `draft`, `prototype`, `alpha`, `beta` or `ga`, which
  tools show as Draft, Prototype, Alpha, Beta and GA. Only capabilities have
  one. A feature's maturity is worked out from its capabilities' levels, and a
  domain's from its parts of features (see
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
    `rule:booking/same-day-turnover` or `capability:group-bookings`, or a
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
name: Room booking
description: Clerks book a free room for a guest's stay.
stability: beta
personas: [front-desk-clerk]
rules: [booking/no-double-booking, booking/minimum-stay]
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
name: Deployment
description: >-
  How a change gets from the main branch to the hotel's server, and back off
  it again.
meets:
  - reliability/beta/undo-release
  - observability/alpha/see-errors
gaps:
  - id: migrations-only-go-forward
    outcome: reliability/ga/recovery
    summary: >-
      Migrations have no down step, so undoing a release that changed the
      schema means restoring the database from the night before.
tradeoffs:
  - id: migrations-before-start
    summary: >-
      Migrations run before the new image starts, while the old one is still
      serving, rather than stopping the app for each release.
    benefits:
      - Releases don't take the front desk offline.
    drawbacks:
      - >-
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
  example, `booking/no-double-booking` applies to room booking and group
  bookings in Reservations, and to check-in in Front desk.
- **A feature has no rules of its own.** Its rules are the ones its
  capabilities follow. Features don't list rules, and `state.json` doesn't
  either: a reader works them out from the feature's capabilities.
- **A rule's `<topic>` is a part of its domain**, such as `booking`, never a
  capability or a feature. A rule keeps its ID as capabilities start or stop following it.
- **Following a rule claims it holds.** For each capability that follows it,
  a rule has a standing: not held, when one of the capability's gaps names it
  in `rule`; held with evidence, when anything verifies or implements it; or
  held on trust, when nothing names it. A gap wins over evidence.

Links in Markdown, in the body or in a frontmatter text value, are ordinary
relative links, for readers. The indexer reports any that are broken, but only
frontmatter link fields and annotations count as relationships.

## Gaps and tradeoffs

Gaps and tradeoffs live in frontmatter, so the UI can count and group them.
Each has a key that's unique within its doc, and is recorded in exactly one
place: the doc it's about.

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

A **gap** is something we intend to close. It has an `id`, a `summary` of a
sentence or two, and optionally the `outcome` or `rule` it falls short of. It doesn't
say when or how it'll be closed: Docket lists it so people know about it, and
deciding that is up to them.

```yaml
gaps:
  - id: calendar-needs-a-mouse
    outcome: usability/beta/everyone
    summary: >-
      The room calendar can't be used from the keyboard, so clerks need a
      mouse to pick dates.
```

- **`outcome`** names the [stability checklist](#stability-checklist) outcome
  it falls short of, as `<quality>/<level>/<id>`. Most gaps are limits on what
  the capability does and match none. A gap can't name a baseline outcome,
  since the security and privacy baseline is never a known gap.
- **`rule`** names a rule the capability follows but doesn't hold to yet.
  Readers show it on the rule too. A rule written before it's built is
  followed with one of these on each capability that doesn't hold to it yet,
  since following a rule otherwise claims it holds:

```yaml
gaps:
  - id: children-corrected-by-hand
    rule: tax/children-pay-no-city-tax
    summary: >-
      Guests' ages aren't recorded, so city tax is added for every guest on a
      stay, and clerks correct it by hand for children.
```

### Tradeoffs

A **tradeoff** is something we chose over an alternative and decided to live
with. It has an `id`, a `summary` saying what we chose and not what, its
`benefits`, what we hope to get by choosing it, and its `drawbacks`, what we
give up or risk in return. Both are lists, one point apiece, and both are
what came with the choice. Readers show a tradeoff with no `benefits` as
missing them, since a choice whose reason isn't written down can't be weighed
against its drawbacks. Optionally, its `outcome` names the
[stability checklist](#stability-checklist) outcome it falls short of on
purpose, as a gap's does, so the checklist shows it as not met by choice
rather than met. It can't name a baseline outcome, since nothing excuses the
security and privacy baseline:

```yaml
tradeoffs:
  - id: front-desk-bookings-only
    summary: >-
      Bookings are taken at the front desk, not from online travel agencies.
    benefits:
      - >-
        No agency integrations to build or keep working, while most bookings
        come straight to the desk.
    drawbacks:
      - Clerks enter each agency booking by hand, as it arrives by email.
```

A gap we decide never to close becomes a tradeoff, with its drawbacks. Neither a
gap nor a tradeoff can excuse the security and privacy baseline.

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

The one exception is the security and privacy baseline, which holds at every
level and is never a known gap.

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
- **`baseline` outcomes,** Security's at Prototype, are the security and
  privacy baseline. They hold at every level, and are never a known gap.

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
  - room-booking
  - cancellations
  - group-bookings
---
```

- **A capability is in at most one feature.** One in none is allowed, and
  shows on its own.
- **A feature has no stability level.** It has a maturity instead, which the
  indexer works out from its capabilities' levels. Nobody writes it down.

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
  Before depending on something, check the stability level of the capability
  you need.

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
rounded to a whole percentage. Each score sits inside its level's band (below),
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
weighs 3, and Front desk (84%, Established), which weighs 6, so it's (42 × 3 +
84 × 6) ÷ (3 + 6) = 630 ÷ 9 = 70%, Promising. Property has only Housekeeping,
so it's 15%, Experimental. A feature's maturity counts every domain's part:
shown with Hotel Billing, Front desk has check-out at GA in Guest stays and at
Alpha in Billing.

A **project's maturity** is worked out the same way from its parts of
features: each feature's part in each domain the project works in, as the
project declares it. Hotel Bookings has Reservations (42%), Front desk (84%)
and Housekeeping (15%), so it's (42 × 3 + 84 × 6 + 15 × 2) ÷ (3 + 6 + 2) =
660 ÷ 11 = 60%, Promising. Several projects shown together have a maturity
too, worked out from all their parts the same way, as if they were one
project. Showing only some projects works out each feature's and domain's
maturity from the capabilities those projects declare.

Maturity isn't a finish line, and 100% isn't the goal. It means everything
under way is GA. Software that keeps growing usually has newer parts settling
in, and stays Established as it does.

### Readiness

A persona has a **readiness** instead of a maturity: how ready the software is
for them, from the maturity of what they need. What they need is every
capability that lists them, so their readiness is worked out as a feature's
maturity is, from those capabilities' levels in each domain that builds part of
them, drafts left out. In Hotel Bookings, the front desk clerk has room booking
and check-in at Beta, cancellations at Alpha, check-out at GA, group bookings
and room status at Prototype, and the waitlist as a draft, so they're (60 × 4 × 2 + 35 × 3 + 100 × 6 + 15 × 2 × 2) ÷
(4 × 2 + 3 + 6 + 2 × 2) = 1245 ÷ 21 ≈ 59% ready.

- **A feature's readiness for a persona** is worked out the same way, from just
  the capabilities in it that serve them. Front desk is 84% mature, and 84%
  ready for the front desk clerk, since both its capabilities serve them.
- **A persona no capability lists has no readiness.**
- **Readiness counts toward nothing else.** A domain's or project's maturity
  comes from its features, never from personas.

Readiness has its own scale, so it's never mistaken for maturity, though it's
worked out from it. It's a quarter of the scale each, as maturity's bands are,
with names of its own, and readers show it as a straight bar, not as a ring in
a level's color:

| Readiness     | From | What it tells you                                                       |
| ------------- | ---- | ----------------------------------------------------------------------- |
| Not ready yet | 0%   | Most of what they need is still being explored.                         |
| Partly ready  | 25%  | Some of it works, but much of what they need is still taking shape.     |
| Mostly ready  | 50%  | Enough is settled or stable for them to rely on day to day.             |
| Ready         | 75%  | What they need is mostly stable and supported.                          |

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
  `tradeoff`. An annotation can name several, of any of its types:
  `docket:implements capability:room-booking component:bookings`.

```ts
// docket:verifies rule:booking/minimum-stay
it("rejects a stay that ends the day it starts", () => {
```

```gherkin
  # docket:verifies rule:booking/no-double-booking
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

A doc's domain is the folder under `docs/product/domains/` it's in, so
nothing in a doc says it. Moving a doc to another folder moves it. Both hotel examples work
in two domains each.

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

A capability's, rule's or concept's link to a rule or concept means, in order:

1. The one named, when the link says `@<domain>`.
2. Its own domain's.
3. The only one with that ID, when just one domain has it.

Otherwise the link is ambiguous: two or more domains have that ID, and neither
is the link's own. That's a problem, and the link names its domain to fix it.

In the examples, Billing's check-out uses `booking`, and gets Billing's
definition, since that's its own domain's. Were Billing to have no `booking`,
it would get Guest stays', the only one. An annotation in code resolves the
same way, from the domains of the repository it's in.

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
2. Resolve links to rules and concepts across every domain showing.
3. Give each mechanism that applies to its platform every capability the
   platform's projects serve: each project's declared capabilities, other
   than drafts, and the ones its components list.
4. Work out the reverse links, maturity and bands again across everything.
   A capability counts once per domain that builds part of it, at that
   domain's level, since each part is work under way.
5. Add the problems combining finds: contradictions and ambiguous links. Drop
   an `unknown-id` problem when the link resolves to another project's doc.

## Index output

`docket index` writes `.docket/state.json` ([example](examples/hotel-bookings/.docket/state.json)).
It holds everything the UI shows, so the UI never reads the repository itself,
and showing several projects together means reading each one's state.json.

- **Header**: the `project` (its ID and name), its `platform` (ID and name)
  when `docket.yaml` declares one, and the commit indexed.
- **`summary`**: the project's maturity and band, how many domains and
  features there are, capabilities per level with `draft` among them, how
  many rules, gaps, tradeoffs, mechanisms, components and problems. This is the
  at-a-glance view.
- **`domains`**: each of the project's `domain.md` files, with the domain's
  maturity worked out from what this project declares in it.
- **`features`**: each with its capabilities, its `tradeoffs` and its
  maturity worked out. Each capability names the feature it's in, or `null`,
  and lists its `gaps` and `tradeoffs`, by ID. Its `stability` can be
  `"draft"`.
- **`personas`**: each with its `name`, `role` and `title`, `role` and
  `title` as `null` where it has none, the capabilities that list them, the features
  those are in, and their `readiness` worked out. Personas aren't in a domain, so
  these have no `domain`.
- **One list per doc type**: each entry has its ID, its `domain`, file, name,
  description, and links, in both directions, its type's other frontmatter fields,
  and its `body` as Markdown, exactly as written, or `""` with none. A doc
  declared in two of the project's domains has an entry for each. Links are
  written as declared, with `@<domain>` where the doc named one.
- **Fields are named in camel case**, as the rest of `state.json` is:
  `confused-with` is `confusedWith`. A field the doc leaves out is there
  anyway, as `[]` for a list and `null` otherwise, such as a rule's `why`
  or a persona's `image`. Each decision is its `topic`, or `null`, `question`, `status`, `answer`, or `null`, and `became` as written. Each `confusedWith` is its
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
  `summary`, and `places`: where `docket:gap` annotations mark it, in the same
  shape as evidence.
- **`tradeoffs`**: every tradeoff from every doc, each with its ID, its
  `domain` when it's a feature's or capability's, the `outcome` it names or
  `null`, `summary`, `benefits` and `drawbacks` as lists, `benefits` empty
  where it has none, and `places`, from `docket:tradeoff` annotations.
- **`problems`**: everything the indexer found wrong, each about a doc with
  that doc's `domain`.
- **`checklist`**: the stability checklist the project was indexed against, so
  the UI can show it beside each capability. It's the YAML's `kinds`, and its
  `qualities`, each with its `levels` as a list in level order. Each level has
  its `level`, `summary` as `null` where it has none, and its `outcomes`,
  `implementation` and `overengineering`, each a list, empty where it has
  none. Each outcome has its full `<quality>/<level>/<id>` ID, its `level`,
  `text`, `until` as `null` where it has none, `baseline` as `true` or
  `false`, and its own `implementation` and `overengineering`. Every example
  in either is its `text` and `kinds`, with `kinds` empty where it isn't
  tagged.

### Problems

| Type                  | Raised when                                                                                                      |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `unknown-id`          | A link, annotation, `rule` or `became` names a doc, gap or tradeoff that doesn't exist.                          |
| `invalid-frontmatter` | A required field is missing, or a value isn't allowed.                                                           |
| `broken-link`         | A relative link in a doc's body or a text value doesn't resolve.                                                 |
| `unlinked-rule`       | No capability follows a rule.                                                                                    |
| `in-two-features`     | More than one feature lists the same capability.                                                                 |
| `contradiction`       | Contributions that should agree don't, as Domains describes.                                                     |
| `ambiguous-link`      | A link could mean the rule or concept of two or more domains.                                                    |
| `unknown-outcome`     | A gap's or tradeoff's `outcome`, or an entry in `meets`, isn't a checklist outcome.                              |
| `baseline-outcome`    | A gap's or tradeoff's `outcome` is a baseline outcome, which nothing excuses.                                    |
| `became-other-side`   | A decision's `became` names a technical doc, or its gap or tradeoff, from a product doc, or the other way round. |

`in-two-features` is a contradiction too, when the listings
are in different projects. Combining raises `contradiction` and
`ambiguous-link`, and those.

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
