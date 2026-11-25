# Spec

The Docket format: how a repository records the state of its software so that
people, agents and tools can all read it. The spec belongs to no particular
tool. Anyone can adopt the format or write their own indexer for it.

This README is most of it. Two parts have their own:

- **[Annotations](annotations/)**: the comments in code, tests and config
  that say what a place is about.
- **[Trailers](trailers/)**: git trailers on commits that say what
  something a commit removed became, so history can follow it.

**Status: draft for review.** Nothing implements it yet. Each example in
[`examples/`](../examples/) is laid out as its own repository root, with the
`state.json` an indexer would produce for each project in it:

- **[`hotel-bookings`](../examples/hotel-bookings/)** is a small hotel-booking app
  that uses every part of the spec, code and tests included. The examples
  below come from it.
- **[`hotel-billing`](../examples/hotel-billing/)** is the same hotel's billing
  service, in a repository of its own: guest bills, payments, company accounts
  and closing the day. It's a second project to show beside the first. It works
  in the Billing and Finance domains, and contributes Billing's part of Front
  desk, a feature that's mostly Guest stays'. Both are part of the Hotel
  product.
- **[`exalynt`](../examples/exalynt/)** is a real product, Exalynt, at full
  size, translated from forge's docs: six domains, 36 capabilities and 368
  rules. It's one repository holding two projects, each in a folder with a
  `docket.yaml` of its own: [`api/`](../examples/exalynt/api/), Exalynt API, and
  [`ui/`](../examples/exalynt/ui/), Exalynt UI. The API holds the product docs
  for both, so the UI contributes technical docs only, for its four apps, and
  links them to the API's capabilities. The example carries the docs and the
  API's acceptance tests, annotated with `docket:verifies`, but not the code.
  Both projects are part of the Exalynt product.

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
- **Contradictions are shown, not resolved.** Each project contributes what
  it knows to one picture of the product. Where two contributions disagree,
  readers see both and a problem, not a winner.

## What's in a repository

```text
docket.yaml                              config: the project's ID and name
docket/                                  the docs, laid out as you like; this layout is recommended
├── personas/                            who the software serves, across every domain
├── initiatives/                         bodies of work, across every domain
├── domains/
│   └── <domain>/                        a folder per domain the project works in
│       ├── domain.md                    the domain's ID, name and summary
│       ├── features/                    the product's jobs, each grouping capabilities
│       ├── capabilities/                the only docs with a stability level
│       ├── rules/                       one rule per file, in folders of your own, such as by topic
│       └── concepts/
├── mechanisms/                          how something works across the project
└── components/                          how one area of the code is built
<code and tests, anywhere>               docket:implements, verifies, gap and tradeoff comments
.docket/state.json                       written by `docket index`, gitignored
```

**Nothing depends on where a doc is.** Each doc says what it is in its
frontmatter: its type in `docket`, its ID, and its domain, if it's in one (see
[IDs](#ids)). A Markdown file is a Docket doc when its frontmatter has
`docket`, wherever it is in the project, and every other file is left alone.
A project is the folder with its `docket.yaml` (see [Config](#config)), so the
layout above starts there.
Files can be renamed, moved and put in folders of the author's own, and
nothing breaks.

The layout above is what we recommend, and what the examples use. A
`docket/` folder beside `docket.yaml` keeps the docs together, and apart from
any other docs the project has. It has no dot because people write it. `.docket/`,
with a dot, holds only what tools write. Within `docket/`, a folder per type,
and per domain, makes each doc easy to find. Group them differently where that
suits the project better.

The product docs are forge's `docs` skill's, with these changes:

- They're in `docket/`, with the technical docs, not in `docs/product/`, and
  each says its own type and domain.
- Features are new. A feature is a job the product does, and it groups the
  capabilities that do it.
- Domains are new. A domain is a part of the business with a language of its
  own, and each doc written in one names it in its `domain` field. Forge's
  single `domain/` folder of rules and concepts becomes one domain or more.
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
- Initiatives are new. An initiative is a body of work, such as the MVP or
  what comes after it. Capabilities and personas link to the initiatives
  they're part of, so readers can show the whole product, or one initiative
  alone.
- A rule no longer links to its acceptance test. Whatever verifies or
  implements it, a test or not, points at it instead, and can point at a
  capability too.
- Rules have no kind: core and edge case are gone.
- A capability can be a draft: declared, with no work started.
- A gap has no kind and no `until`: when and how it's closed is up to the
  team, not the docs. Each says its impact, likelihood and reach, so readers
  can order gaps by risk. A tradeoff is a list of its own, with its benefit and drawback. A feature can have tradeoffs and open decisions, and a
  domain open decisions.

Technical docs are forge's `engineering-docs` skill's, with these changes:

- They're in `docket/`, with the product docs, not in `docs/engineering/`.
  Their type says they're technical, not their folder.
- An architecture doc for a system is a mechanism, since "system" usually
  means the whole software, and one for a feature is a component, since a
  feature is a job the product does in Docket.
- Links, gaps, tradeoffs and open decisions are frontmatter, not sections.
  How it works is the body.
- The `**Code:**` line is gone. The code points at the doc instead, with
  `docket:implements` (see [Annotations](annotations/)).
- Forge's Gotchas section is gone. A gotcha that's a choice with a drawback is a
  tradeoff, one we mean to fix is a gap, and the rest is in the body.
- A gap has no `Until`, and gains an `impact`, a `likelihood` and a `reach`.
  A tradeoff's `Costs` is its `drawback`, beside its `benefit`, and its
  `Revisit when` goes in its drawback.
- A mechanism or component can say which checklist outcomes it meets.
- Providers and runbooks aren't read. A repository can keep them anywhere.

In the examples, `.docket/state.json` is checked in so you can read it. In a
real repository it's gitignored.

## IDs

Every doc starts its frontmatter by saying what it is: `docket`, its type,
then `id`, its ID, then `domain`, for a doc written in a domain. Where its file
is says nothing, so its file name and the folders it's in are the author's to
choose and change, and renaming or moving it breaks nothing.

```yaml
---
docket: capability
id: room-booking
domain: guest-stays
name: Room booking
---
```

| `docket`   | `domain`                        | Recommended folder                      | Example ID          |
| ---------- | ------------------------------- | --------------------------------------- | ------------------- |
| domain     | none: its `id` is the domain's  | `docket/domains/<domain>/domain.md`     | `guest-stays`       |
| feature    | required                        | `docket/domains/<domain>/features/`     | `reservations`      |
| capability | required                        | `docket/domains/<domain>/capabilities/` | `room-booking`      |
| rule       | required                        | `docket/domains/<domain>/rules/`        | `no-double-booking` |
| concept    | required                        | `docket/domains/<domain>/concepts/`     | `booking`           |
| persona    | none                            | `docket/personas/`                      | `front-desk-clerk`  |
| initiative | none                            | `docket/initiatives/`                   | `busy-season`       |
| mechanism  | none                            | `docket/mechanisms/`                    | `deployment`        |
| component  | none                            | `docket/components/`                    | `bookings`          |

- **`docket` marks a file as a Docket doc** and gives its type, one of those
  above. A Markdown file without it isn't a Docket doc, and nothing reads it.
  A type that isn't one of these is `invalid-frontmatter`.
- **`domain` is the ID of the domain the doc is written in**, and must be one
  the project has a domain doc for. A feature, capability, rule or concept
  without one is `invalid-frontmatter`, and one naming a domain the project
  doesn't have is `unknown-id`.
- **IDs and values are kebab case**: lowercase words joined by hyphens, such
  as `room-booking`, `not-decided` or `ga`. Tools show values with their own
  labels, such as GA for `ga`.
- **A project has one doc of each type with a given ID in each domain**, and
  one domain, persona, initiative, mechanism or component with a given ID in
  all. A second is a `duplicate-id` problem. The same ID in another domain, or in
  another project, is a contribution or another definition, as
  [Domains](#domains) describes.
- **Name the file after its ID**, as the examples do, so it's easy to find.
  That's a convention: nothing reads a file's name.
- **Changing an ID is a breaking change.** Everything that names it, in its
  project and in others in its product, has to change with it, and the
  indexer reports each one left dangling. The commit that changes it says so
  with a [trailer](trailers/), or history sees the old one removed and an
  unrelated one added. Readers show the `name`, so a doc can be renamed for
  people without changing its ID.
- **A reference names its type**, as `<type>:<id>`, such as
  `rule:no-double-booking`, everywhere one is written: frontmatter links,
  annotations, and `state.json`. A reference reads
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
- **A [stability checklist](#stability-checklist) outcome's reference** is
  `outcome:` and its quality, level and own ID: `outcome:usability/beta/everyone`.
  The checklist is part of the spec, so it's the same in every project, and
  it's in no domain.
- **What an ID names depends on the type** (see [Domains](#domains)). A
  domain, feature, capability, persona, initiative, mechanism or component ID
  names one thing across every project. A rule or concept ID names one
  definition within a domain.
- **A reference to a rule or concept names its domain** as `@<domain>`,
  unless it's from a doc in the same domain: `concepts:
  [concept:booking@guest-stays]`. An annotation has no domain of its own, so
  it always names one: `docket:verifies rule:closed-bills-dont-change@billing`
  (see [Which rule or concept a link means](#which-rule-or-concept-a-link-means)).

## Frontmatter and body

Every doc is a Markdown file in two parts: YAML frontmatter, then a body.

```markdown
---
docket: concept
id: bill
domain: billing
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

Every doc has its `docket` type and an `id`, a doc in a domain has its
`domain` (see [IDs](#ids)), and every doc has a `name` and, but for a rule, a
`description`, all required:

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
| domain | `docket`, `id`, `name`, `description`, `decisions` | Anything more about the part of the business | [guest-stays](../examples/hotel-bookings/docket/domains/guest-stays/domain.md) |
| feature | `docket`, `id`, `domain`, `name`, `description`, `capabilities` (required), `tradeoffs`, `decisions` | Anything more about the job | [reservations](../examples/hotel-bookings/docket/domains/guest-stays/features/reservations.md) |
| capability | `docket`, `id`, `domain`, `name`, `description`, `stability` (required), `personas`, `initiatives`, `rules`, `concepts`, `gaps`, `tradeoffs`, `decisions` | Anything more about what it does, such as what else it includes, or how we'll know it's working | [room-booking](../examples/hotel-bookings/docket/domains/guest-stays/capabilities/room-booking.md) |
| rule | `docket`, `id`, `domain`, `name`, `concepts`, `why` | The rule in full, where its name doesn't say it all, and examples or how it plays out | [same-day-turnover](../examples/hotel-bookings/docket/domains/guest-stays/rules/booking/same-day-turnover.md) |
| concept | `docket`, `id`, `domain`, `name`, `description`, `confused-with` | Its details: what it's made of, how it relates to other concepts, and the states it moves through | [booking](../examples/hotel-bookings/docket/domains/guest-stays/concepts/booking.md) |
| persona | `docket`, `id`, `name`, `description`, `role`, `title`, `image`, `initiatives` | Anything more about who they are, such as what they need, what they know, their context, what they expect, and what they care about | [front-desk-clerk](../examples/hotel-bookings/docket/personas/front-desk-clerk.md) |
| initiative | `docket`, `id`, `name`, `description` | Anything more about the work, such as what's in it and why | [busy-season](../examples/hotel-bookings/docket/initiatives/busy-season.md) |
| mechanism | `docket`, `id`, `name`, `description`, `applies`, `meets`, `gaps`, `tradeoffs`, `decisions` | How it works | [deployment](../examples/hotel-bookings/docket/mechanisms/deployment.md) |
| component | `docket`, `id`, `name`, `description`, `capabilities`, `meets`, `gaps`, `tradeoffs`, `decisions` | How it works | [bookings](../examples/hotel-bookings/docket/components/bookings.md) |

The body column is a suggestion of what's worth writing, not a structure.

- **`stability`** is `draft`, `prototype`, `alpha`, `beta` or `ga`, which
  tools show as Draft, Prototype, Alpha, Beta and GA. Only capabilities have
  one. A feature's, domain's, project's, persona's and initiative's maturity,
  and their [readiness](#readiness), are worked out from their capabilities'
  (see [Features and maturity](#features-and-maturity)).
- **`personas`** lists the personas a capability serves: who does it, or who
  it's done for when the software does it.
- **`initiatives`** lists the initiatives a capability is part of, or on a
  persona, the initiatives whose work is for them (see
  [Initiatives](#initiatives)).
- **`capabilities`** on a component lists the capabilities that rely on it.
  It's the only link between the technical docs and the product. A mechanism
  has none: it applies to every capability its project serves (see
  [Mechanisms and components](#mechanisms-and-components)).
- **No doc names its code.** A mechanism or component is found in the code by
  its `docket:implements` annotations (see
  [Annotations](annotations/#mechanisms-and-components)), and a
  capability through the mechanisms that apply to it and the components that
  list it, since product docs never name their implementation.
- **`applies`** says what a mechanism applies to: `project`, every capability
  its project serves, or `product`, every capability any project on its
  [product](#config) serves. It's `project` when left out.
- **`meets`** lists the [stability checklist](#stability-checklist) outcomes a
  mechanism or component meets for the capabilities it applies to, as
  `outcome:<quality>/<level>/<id>`. Its evidence is the proof.
- **`decisions`** lists the decisions on a domain, feature, capability,
  mechanism or component: questions about what's intended, including those that
  building it is meant to answer. A question goes on the doc it's about. Each
  has its `question` and, optionally, a `topic` of a few words. Every
  decision written down is open, and counts as what's left. Answering one
  deletes it: the answer is written where it belongs, as a rule, concept,
  capability, gap, tradeoff or whatever it became, with no link back to the
  question. It stays on the decision's side: a decision on a domain, feature
  or capability becomes product docs, or their gaps or tradeoffs, and one on
  a mechanism or component becomes mechanisms or components, or theirs.
  Optionally, its `affects` lists what's waiting on its answer (see
  [Affects](#affects)).

```yaml
decisions:
  - topic: Where the money goes
    question: >-
      Always back to the card it came from, or to whichever card the guest
      has with them?
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
docket: capability
id: room-booking
domain: guest-stays
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
docket: persona
id: front-desk-clerk
name: Maria
description: Runs the front desk: takes bookings, and checks guests in and out.
role: Front desk
title: Front desk clerk
image: https://randomuser.me/api/portraits/women/68.jpg
initiatives: [initiative:busy-season]
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
- **`initiatives`**, optional, lists the [initiatives](#initiatives) whose
  work is for them.
- **Its body** is where to say more about who they are, such as what they
  need the software to do for them and why it matters to them, their domain
  knowledge and technical skill, their device and how often and under what
  pressure they do the work, the words and tools they already know, and what
  makes them trust the software or give up on it. The examples use headings of
  their own for these; nothing reads them.

### Initiatives

An initiative is a named body of work the product is taking on, so it can be
seen on its own, such as the MVP or what comes after it.
Like personas, initiatives are written once for the whole project, not per
domain, since the work cuts across domains and features.

```markdown
---
docket: initiative
id: busy-season
name: Busy season
description: >-
  Handling full nights: groups, a waitlist, and turning rooms over faster.
---
```

A capability says which initiatives it's part of, and so does each persona
the work is for:

```yaml
initiatives: [initiative:busy-season]
```

- **`name`** and **`description`** say what the work is. Its body, optional,
  can say more, such as what's in it and why.
- **Capabilities and personas link to it**, and it lists neither. Its
  features, domains, rules and gaps are worked out from its capabilities. A
  capability or persona can be part of several initiatives, or none.
- **Readers show everything, or one initiative.** Showing one, only its
  capabilities and personas show, and every number counts only those, the
  way showing only some projects does. A persona's readiness there counts
  only the initiative's capabilities that serve them. A capability or persona
  in no initiative shows only when everything does.
- **No stability level, no gaps, tradeoffs or decisions.** It has a maturity,
  an exposure and a readiness, worked out from its capabilities. It doesn't
  say when the work happens, or in what order.
- **It isn't a flag.** Being behind a flag is what Prototype and Alpha mean.
  An initiative says what body of work a capability belongs to.
- **Once the work no longer needs seeing on its own**, its capabilities and
  personas drop the link and the doc is deleted.

### Mechanisms and components

A mechanism or component says how part of the software is built, in the code's
words, for the engineer or agent about to change it. A **mechanism** is how
something works across the whole project, such as Hotel Bookings'
[deployment](../examples/hotel-bookings/docket/mechanisms/deployment.md)
or Exalynt's authentication. It says how something works, not a convention
or standard to follow. A **component** is one area of the code, named as the
code names it, such as Hotel Bookings'
[bookings](../examples/hotel-bookings/docket/components/bookings.md) or
Hotel Billing's [ledger](../examples/hotel-billing/docket/components/ledger.md),
however many capabilities rely on it.

```markdown
---
docket: mechanism
id: deployment
name: Deployment
description: >-
  How a change gets from the main branch to the hotel's server, and back off
  it again.
meets:
  - outcome:reliability/beta/undo-release
  - outcome:observability/alpha/see-errors
gaps:
  - id: migrations-only-go-forward
    name: Migrations have no down step
    affects:
      - outcome:reliability/ga/recovery
    impact: damaging
    likelihood: possible
    description: >-
      Migrations have no down step, so undoing a release that changed the
      schema means restoring the database from the night before.
tradeoffs:
  - id: migrations-before-start
    name: Migrations run while the old release serves
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
- **Or to every capability its product serves**, with `applies: product`:
  what every project in the product serves, worked out the same way. It's
  for something one project runs for all of them, such as authentication
  in an API gateway that every service sits behind. Exalynt's
  [authentication](../examples/exalynt/api/docket/mechanisms/authentication.md)
  applies to its product, since every app's requests go through it.
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
capability                 → personas, initiatives, rules, concepts
rule                       → concepts
concept                    → concepts                  (confused-with)
gap                        → outcomes, rules           (affects)
tradeoff                   → outcomes                  (affects)
decision                   → outcomes, gaps, tradeoffs (affects)
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
  can be kept in folders of their own, such as one for each part of the
  domain, like `rules/booking/`, but never one for a capability or a feature.
  The folders are for people and mean nothing to tools.
- **Following a rule claims it holds.** For each capability that follows it,
  a rule has a standing: not held, when one of the capability's gaps affects
  it; held with evidence, when anything verifies or implements it; or
  held on trust, when no gap affects it and nothing points at it. A gap wins
  over evidence.

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

Domains, rules, concepts, personas and initiatives have neither. A limit
across a whole domain is a rule, or a tradeoff on the mechanism that causes
it. When a gap has a visible effect and a technical cause, the effect is the
capability's gap, and the technical doc explains the cause in How it works.

### Gaps

A **gap** is something we intend to close. It has an `id`, a `name` saying in
a few words what falls short, such as `Calendar needs a mouse`, a
`description` of a sentence or two, and optionally the outcomes and rules it
`affects`, its `impact`, its `likelihood` and its `reach`. It doesn't say when or how it'll be closed:
Docket lists it so people know about it, and deciding that is up to them.
A gap is what falls short in the thing itself, never what a level already
says: relying on a capability at a lower level isn't one, and nor is being
behind a flag, opt-in, not yet in production or still changing at Prototype
or Alpha. Either becomes a gap only where the level says otherwise. A bug,
where the software is meant to do something and simply doesn't, usually isn't
one either: fixing the code closes it, so it belongs in the issue tracker. A
known bug is a gap only when it won't be fixed soon and changes what people
can rely on.

```yaml
gaps:
  - id: calendar-needs-a-mouse
    name: Calendar needs a mouse
    affects:
      - outcome:usability/beta/everyone
    impact: blocking
    description: >-
      The room calendar can't be used from the keyboard, so clerks need a
      mouse to pick dates.
```

- **`impact`** is how bad the gap is for those it reaches, if it bit. It's
  never lowered for being unlikely or reaching few, since `likelihood` and
  `reach` say that, and never by the capability's level: all three are rated
  as if people relied on the capability, since [risk](#risk) weighs them by
  its level, so they aren't re-rated when the capability is promoted. Readers
  order gaps by [risk](#risk) from them, and show a gap without an impact as
  not rated, after the rest. It's one of four, from least to most, each
  taking more than the one before:

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
  is `inconvenient`; a gap that changes nothing for anyone yet is
  `negligible`, however untidy. When torn between two, pick the lower unless
  the higher one's test is plainly met. A gap that only bites in certain
  conditions, such as untested code, is rated by what would happen if it bit,
  and says what the conditions are in its description.
- **`likelihood`** is how likely the gap is to bite within the next year.
  It's `certain` when left out. When torn between two, pick the higher:

  | Likelihood | The test                                             |
  | ---------- | ---------------------------------------------------- |
  | `certain`  | It's happening, or it definitely will within a year. |
  | `expected` | You'd bet on it happening within a year.             |
  | `possible` | It could happen, but you wouldn't bet on it.         |
  | `unlikely` | It would surprise you.                               |

- **`reach`** is how many of the people the software serves it would reach,
  if it bit: who its capabilities' personas stand for, and whoever runs it,
  builds on it, or depends on what it produces. It's judged for that
  software, by who they are and what they do, not by a count. It's `all` when
  left out. When torn between two, pick the higher. Legal or contractual
  exposure the business has, and anyone able to do what they shouldn't, are
  always `all`:

  | Reach  | The test                                           |
  | ------ | -------------------------------------------------- |
  | `all`  | Everyone the software serves.                      |
  | `most` | Most of them: it's the usual case.                 |
  | `some` | A real share of them, but not the usual case.      |
  | `few`  | A small group with a particular need or situation. |

- **`affects`** lists the claims it's the reason for not being true yet
  (see [Affects](#affects)): a [stability checklist](#stability-checklist)
  outcome it falls short of, or a rule the capability follows but doesn't
  hold to yet. Most gaps are limits on what the capability does and affect
  nothing. A rule written before it's built is followed with a gap affecting
  it on each capability that doesn't hold to it yet, since following a rule
  otherwise claims it holds:

```yaml
gaps:
  - id: children-corrected-by-hand
    name: City tax charged for children
    affects:
      - rule:children-pay-no-city-tax
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
its drawback. A drawback that only bites in certain conditions says what they are. A tradeoff isn't rated and has no risk: someone weighed its drawback and chose to live with it. Optionally, its `affects` lists the
[stability checklist](#stability-checklist) outcomes it falls short of on
purpose, so the checklist shows them as not met by choice rather than met
(see [Affects](#affects)):

```yaml
tradeoffs:
  - id: front-desk-bookings-only
    name: Front desk bookings only
    description: >-
      Bookings are taken at the front desk, not from online travel agencies.
    benefit: >-
      No agency integrations to build or keep working, while most bookings
      come straight to the desk.
    drawback: Clerks enter each agency booking by hand, as it arrives by email.
```

A gap we decide never to close is deleted, and written as a tradeoff, with
its drawback.

### Affects

The docs make claims by being written: declaring a level claims every
outcome the [checklist](#stability-checklist) expects at it, and following a
rule claims the rule holds. A gap, a tradeoff and an open decision are the
three ways of saying "except here", and `affects` is how each says which
claim, or which other item, it's about. What it means comes from what's
doing the affecting:

| `affects` → | An outcome | A rule | A gap | A tradeoff |
| --- | --- | --- | --- | --- |
| **Gap** | Not met yet | Not held yet | | |
| **Tradeoff** | Not met, by choice | | | |
| **Decision** | Open: neither claimed nor short | | Waits on it | Reopened |

```yaml
decisions:
  - topic: Undoing a schema change
    question: >-
      Is restoring the night before's database enough to undo a release that
      changed the schema, or does every migration need a down step?
    affects:
      - outcome:reliability/ga/recovery
      - mechanism:deployment#migrations-only-go-forward
```

- **It's a list of references**: `outcome:<quality>/<level>/<id>`,
  `rule:<id>`, with `@<domain>` for a rule in another domain, or a gap's or
  tradeoff's ID. Any other target, such as a capability, a persona, or a
  gap affecting a gap, is `invalid-frontmatter`: the doc an item is declared
  on is already what it's about, and which gap to close first is for a task
  tracker. A reference to something that doesn't exist is `unknown-id`, or
  `unknown-outcome` for an outcome.
- **A gap affecting a claim breaks it** where that claim is made: on each
  capability it shows on whose level expects the outcome, or that follows the
  rule. That raises its [risk](#risk) there.
- **A tradeoff can't affect a rule.** A rule is a constraint of the business,
  so not holding it can't be a choice: either the rule changes, or it's a gap.
- **A decision has no risk of its own**, since a question doesn't happen to
  anyone. A gap waiting on it keeps its own risk, and readers show a
  decision with the riskiest gap waiting on it, so the questions with most at
  stake can be asked first. A reopened tradeoff stays as it is, the current
  choice, until the decision is answered.
- **It stays on its side.** A product gap, tradeoff or decision affects
  outcomes, rules and product gaps and tradeoffs; a technical one affects
  outcomes and technical gaps and tradeoffs. Product docs never link to
  technical docs.
- **The link is held by what's deleted first.** Closing a gap, reversing a
  tradeoff or answering a decision deletes it with its `affects`, and what it
  affected goes back to how it was: an outcome to met, a gap or tradeoff to
  waiting on nothing. Nothing links back to a question once it's answered.

## Stability levels

Every capability that's been started is at one of four stability levels. The
level says how stable the work is right now, so people know what they can rely
on before they rely on it.

A capability declared but not started is a **draft**, `stability: draft`, such
as the [waitlist](../examples/hotel-bookings/docket/domains/guest-stays/capabilities/waitlist.md)
or [refunds](../examples/hotel-billing/docket/domains/billing/capabilities/refunds.md).
It isn't a level: it claims nothing, on the checklist or anywhere else, and
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

- **An outcome that applies is met unless a gap, tradeoff or decision
  affects it.** Declaring a level claims what that level expects, except the
  gaps, tradeoffs and decisions written down, so only what isn't met is
  recorded. An outcome that doesn't apply, such as accessibility
  for an API with no screens, counts as met too.
- **Each outcome a capability's level expects has a standing:** not met, when
  a gap on the capability, or on a mechanism or component it relies on,
  affects it; not met by choice, when a tradeoff there affects it; open, when
  an open decision there affects it; met with evidence, when a mechanism or
  component it relies on `meets` it; or met on trust, when nothing affects
  it. A gap wins over a tradeoff, a tradeoff over a decision, and all three
  over `meets`.
- **An outcome's reference** is `outcome:` and its quality, level and own ID:
  `outcome:reliability/beta/data-kept`. Its level is in it, so moving an
  outcome to another level changes its reference, and every doc naming it
  shows as `unknown-outcome` until someone looks at it again: what it claims
  has changed.
- **A level includes every outcome the levels below it expect,** unless
  `until` names the last level an outcome applies to.
  `outcome:compatibility/prototype/opt-in`, which keeps it to those who chose to try
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
docket: feature
id: reservations
domain: guest-stays
name: Reservations
description: Taking bookings and handling changes to them, before the guest arrives.
capabilities:
  - capability:room-booking
  - capability:cancellations
  - capability:group-bookings
---
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

A **persona's maturity** is that of what serves them: worked out as a
feature's is, from the capabilities that list them, each once at its level in
short. An **initiative's maturity** is worked out the same way, from the
capabilities that list it.

Showing one initiative works out every maturity from its capabilities alone,
as showing only some projects does.

Maturity isn't a finish line, and 100% isn't the goal. It means everything
under way is GA. Software that keeps growing usually has newer parts settling
in, and stays Established as it does.

Readers work out maturity and bands, and they aren't in `state.json`, since a
capability's level in short needs every project that builds part of it.

## Readiness

Readers work out **readiness**: their view of how ready the software is to
serve people in production, based on the engineering judgement written down
in the docs, each capability's stability level and its gaps' impact and risk.
It's a percentage, with what's still left, and a recommendation: people
judge. Nothing is written for it, and it isn't in `state.json`: it depends on
[risk](#risk) and on each capability's level in short, and both need projects
put together.

Readiness is the [maturity](#how-maturity-is-worked-out) of some
capabilities less their [exposure](#exposure), each counted once, at its
level in short, drafts left out:

```text
readiness = maturity × (1 − exposure)
```

Every gap lowers it, through the riskiest gap on each capability. Promoting
a capability can lower it, where its gaps break a claim the new level
makes.

| Readiness of                | Counts                                 |
| --------------------------- | -------------------------------------- |
| A capability                | Itself                                 |
| A feature                   | Its capabilities                       |
| A domain                    | Every capability with a part in it     |
| A project, or several shown | Every capability showing               |
| A persona                   | Every capability that lists them       |
| A feature, for a persona    | The capabilities in it that serve them |
| An initiative               | Every capability that lists it         |

Showing one initiative narrows every capability showing to its own, as
showing only some projects does, so every readiness counts only those.

Something with no started capabilities has no readiness. It falls in a quarter
of its own, so it's never mistaken for maturity, and readers draw it as a
straight bar in the text's color, never a ring, which is maturity's, nor in a
level's color:

| Readiness     | From | What it recommends                                                                   |
| ------------- | ---- | ------------------------------------------------------------------------------------ |
| Unready       | 0%   | Most of what they need is still being explored, or its gaps put a lot at stake.      |
| Partial       | 25%  | Some of it can be used, but much of what they need is still taking shape.            |
| Viable        | 50%  | Enough is settled for them to rely on day to day.                                    |
| Ready         | 75%  | What they need is mostly stable, with nothing unacceptable left open.                |

Readers show **what it still needs** with it: each started capability below
Beta, the first level settled enough for real use, needs to reach Beta, and
each gap that's unacceptable on one needs closing. A capability at Beta or GA
with neither has nothing left. Lesser gaps lower readiness but aren't left to
do. Drafts are listed as not started.

In Hotel Bookings, the front desk clerk has room booking and check-in at
Beta, cancellations at Alpha, check-out at GA, and group bookings and room
status at Prototype, so (60 × 4 + 60 × 4 + 35 × 3 + 100 × 6 + 15 × 2 + 15 ×
2) ÷ 21 ≈ 59% mature. Room booking's calendar needs a mouse (75% of the most
it could be exposed to), cancellations refund late cancellations in full (100%),
and the rest rely on the deployment, whose migrations have no down step
(50% on check-out at GA, where it breaks a claim, 40% on check-in at Beta,
and 50% on the two at Prototype, where breaking a claim adds nothing).
Their exposure is (75 × 4 + 40 × 4 + 100 × 3 + 50 × 6 + 50 × 2 + 50 × 2) ÷ 21 = 60%,
so readiness is 59% × (1 − 60%) ≈ 24%, Partial. Late cancellations refunded
in full scores 66 at Alpha, tolerable, so it lowers readiness but isn't left
to do. What's left:

```text
room booking    close capability:room-booking#calendar-needs-a-mouse
cancellations   reach Beta, now Alpha
check-out       close mechanism:deployment#migrations-only-go-forward
group bookings  reach Beta, now Prototype
room status     reach Beta, now Prototype
```

In Hotel Billing, the manager has city tax at Alpha, deposits and daily
takings at Beta, and night audit at GA: 1185 ÷ 17 ≈ 70% mature, with 18%
exposure, so they're 57%, Viable. The night auditor has only night audit,
at GA, with no gaps, so they're 100%, Ready.

Starting new work lowers readiness a little, since a Prototype weighs least:
five GA capabilities with no gaps and a new Prototype are 95%. A gap nobody wrote leaves a
capability counting in full, and readiness is as good as what's written down.

## Risk

Readers score each gap's **risk**: what's at stake in it, so the ones that
matter are read first. Nothing is written for it, and it isn't in
`state.json`: readers work it out once projects are put together, since a
mechanism that applies across a product shows on every project's
capabilities. A product gap shows on its capability; a technical gap on
every capability its mechanism or component serves. On each capability it
shows on, a gap scores what it could do, times how much people rely on what
it's in:

```text
impact step × likelihood × reach × level weight × claim factor if it breaks a claim there
```

1. **Its impact step**: `negligible` 1, `inconvenient` 2, `blocking` 3,
   `damaging` 4.
2. **Its likelihood**: `certain` 1, `expected` ¾, `possible` ½,
   `unlikely` ¼. `certain` when left out.
3. **Its reach**: `all` 1, `most` ¾, `some` ½, `few` ¼. `all` when left out.
4. **The capability's level weight**, as in
   [maturity](#how-maturity-is-worked-out): Prototype 2, Alpha 3, Beta 4,
   GA 6. It says how much people are entitled to rely on that capability,
   and how exposed they are to its gaps. A draft weighs 0.
5. **Whether it breaks a claim there**: it [affects](#affects) a rule that
   capability follows, or a checklist outcome that capability's level
   expects, so that outcome shows as not met there. If so, its score is
   multiplied by that level's **claim factor**: Prototype 1, Alpha 1.125,
   Beta 1.25, GA 1.5. A claim matters as much as people rely on it: nobody
   relies on a Prototype's, which is opt-in and whose data may be fake,
   while people have built on what GA says. A draft claims nothing.

Each score is put on 0 to 100 by a log scale, from 2 (a certain negligible
gap reaching all on a Prototype) to 36 (a certain damaging gap reaching all
and breaking a claim on GA), rounded, and never below 0:
`100 × ln(raw ÷ 2) ÷ ln(18)`. A draft scores 0. A gap's risk is its highest score. A gap with no `impact` has no risk. Its **verdict** is
the third its risk falls in: `acceptable` below 33, `tolerable` from 33, and
`unacceptable` from 67. Its **spread** is how its scores spread: how many
capabilities have each score, highest first. Readers order gaps by risk, highest first, then by
spread, comparing the number of capabilities at each score from the
highest down, then gaps with no impact.

Hotel Bookings' deployment has `migrations-only-go-forward`, `damaging` and
`possible`, reaching `all`, which affects `outcome:reliability/ga/recovery`,
an outcome only GA expects. Shown on its own, Hotel Bookings has check-out at
GA, where it breaks that claim: 4 × ½ × 1 × 6 × 1.5 = 18, or 76. Deployment also
serves room booking and check-in at Beta (48 each), cancellations at Alpha
(38), and group bookings, room status, cleaning and the rate calendar at
Prototype (24 each). Its risk is 76, `unacceptable`, and its spread
`76 on 1 · 48 on 2 · 38 on 1 · 24 on 4`. Shown with Hotel Billing, check-out
is Alpha, so its risk there is 48.

The ledger's `corrections-of-corrections-untested` is `damaging`,
`expected` and reaches `few`: 4 × ¾ × ¼ = 0.75 before its level. On extra
charges at GA, where it breaks a claim, that's 6.75, or 42, `tolerable`;
on split bills at Prototype it's 1.5, below the least there is, so 0.

Where several gaps are shown together, as for a capability, feature,
domain, persona, initiative or component, each is scored only on the capabilities
there, and readers show the highest risk and how many fall in each
verdict.

Tradeoffs and open decisions have no risk: a tradeoff is a drawback someone
chose to live with, and a question doesn't happen to anyone. Readers show a
decision with the risk of the riskiest gap waiting on it: deployment's
question about undoing a schema change has 76 waiting on it.

### Exposure

For some capabilities, as of a feature, domain, project, persona or
initiative, readers also work out their **exposure**: what the gaps still
open on them put at stake together, from 0 to 100%. It's to risk what maturity is to stability.
It isn't their stability, which is declared. The most a capability could be
exposed to is a certain damaging gap reaching all that breaks a claim its
level makes, 4 × its level weight × its claim factor, and its exposure is its riskiest
gap's raw score ÷ that, its own or one on what it's built on. The exposure of
several is the average of each started capability's, weighted by its level
weight. Gaps with no `impact` add nothing; drafts don't count. Its band is
the quarter it falls in: `low` below 25%, `minor` from 25%,
`moderate` from 50% and `high` from 75%, and at least
`moderate` while any gap is `unacceptable` on one of them. Readers draw
it as maturity is, a ring, in its band's color.

In Hotel Bookings, room booking at Beta is exposed to 75% of 20,
cancellations at Alpha to 100% of 13.5, and group bookings at Prototype to 50%
of 8, so Reservations' exposure is `(75% × 4 + 100% × 3 + 50% × 2) ÷ 9 ≈ 78%`,
`high`.

## Evidence

A rule, capability, mechanism or component can have **evidence**: places in the
repository that say they verify it, or implement it. Evidence is optional at
every level, and there's no limit to how much there is. Docket doesn't care
what a place is, whether a test, code, a migration, a workflow or anything
else, or what language or framework it's in, and it doesn't run anything. It
shows where the evidence is, so a reader can go from what's intended to
what's about it.

A place gives evidence with an **annotation**: a comment above it naming what
it verifies or implements, the same in every language. Annotations also mark
where a gap or tradeoff shows in the code. [Annotations](annotations/) is the
whole format.

```ts
// docket:verifies rule:minimum-stay@guest-stays
it("rejects a stay that ends the day it starts", () => {
```

- **There are two kinds**: `verifies`, a place that checks that the rule
  holds, the capability works, or the mechanism or component does what it
  says, and `implements`, a place that makes it so.
- **None isn't a warning.** A rule or capability with nothing verifying or
  implementing it holds on trust, unless a gap says it doesn't. It's neither a
  problem nor something left to do, and readers say so plainly, without a
  warning.
- **A rule's evidence is about every capability that follows it.**
- **A mechanism's or component's evidence** is also the evidence for the
  checklist outcomes it `meets`.

## History

How a project's docs changed is worked out by comparing its state at one
commit with its state at the next. A reference names the same thing at every
commit, so a capability promoted, a gap added or closed, or a rule gaining
evidence shows on its own.

What comparing can't show is that something removed became something else: a
doc whose ID changed, a decision answered by a rule, or a gap accepted as a
tradeoff under a new key. The commit says so with a `Docket-Became` trailer in
its message, and nothing is ever guessed. [Trailers](trailers/) is the whole
format.

```text
Docket-Became: capability:early-arrival -> capability:early-check-in
```

## Config

[`docket.yaml`](../examples/hotel-bookings/docket.yaml) marks the folder it's in
as a Docket **project**: a source of state, where software is defined, and
usually implemented. The project is that folder and everything in it, except
folders with a `docket.yaml` of their own, which are projects of their own.

A project isn't a repository. A repository can hold one project, at its root,
as each example does, or several, such as one per package of a monorepo, and
needn't have one at its root. A project's docs and annotations are those in
its folder, and its state is written beside its `docket.yaml`. Every project in a
repository is indexed at the same commits, and is shown, combined and sent to
a server as it would be from a repository of its own.

```yaml
project:
  id: hotel-bookings
  name: Hotel Bookings
product:
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
- **`product`**, optional, says which **software product** the project is
  part of: the end result of one or more pieces of software working together
  to accomplish a high-level goal, such as a web app, a mobile app and the API
  behind them. Each piece is a project. Projects with the same product
  `id` are shown together and their docs combined; projects in different
  products never are. A project that names no product is a product of its
  own.
  - **`id`** is lowercase, with hyphens, and the same in every project in the
    product.
  - **`name`** is what people see, named for the product: Hotel, not Hotel
    Bookings. Every project in the product should give the same one; readers
    use the first project's.

A project works in the domains it has domain docs for, so nothing here says
which. Both hotel examples work in two domains each.

## Domains

A **domain** is a part of the business with a language of its own: a business
area and a bounded context, in domain-driven design's terms, as one. Every
product doc but a persona or an initiative is written in exactly one domain,
the one its `domain` field names. Changing a doc's `domain` moves it to that
domain, wherever its file is. Mechanisms and components are in no domain
either. A project works in as many domains as it has domain docs, and projects
that work in the same part of the business use the same domain ID.

A domain doc gives its name and description, any open decisions, and anything
more worth saying about it in its body:

```yaml
---
docket: domain
id: guest-stays
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
| domain, feature, capability, persona, initiative, mechanism, component | everything | A contribution to the same one. Its links are put together, and its name and description should match. |
| rule, concept | its domain | Another definition, shown beside this one. Within the same domain, it's a contribution, as above. |

Putting contributions together:

- **Features and capabilities span domains.** A feature or capability written
  in several domains is in each of them. Each domain's part is the
  capabilities that domain builds.
- **Links are combined**: a feature's capabilities and tradeoffs, a
  capability's personas, initiatives, rules, concepts, gaps and tradeoffs, a
  mechanism's or component's capabilities, outcomes, gaps and tradeoffs, and
  everything's evidence. Each contribution's order is kept, in the order the
  projects are read.
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

- **A domain's, feature's, capability's, persona's, initiative's, mechanism's
  or component's name or description differs** between projects, or a
  persona's role or title.
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
knows its own contributions. Showing several projects of one product
together **combines** their states. Projects in different products are never
combined, since they're different products and the same ID can mean
different things in each:

1. Put each doc's contributions together by type and ID, as above.
2. Resolve links to rules and concepts named in other projects' domains.
3. Give each mechanism that applies to its product every capability the
   product's projects serve: each project's declared capabilities, other
   than drafts, and the ones its components list.
4. Work out the reverse links again across everything, and each
   capability's level in short, the lowest across the domains that build it.
   Readers then work out maturity, readiness and risk from all of it.
5. Add the problems combining finds: contradictions, and gap or tradeoff IDs
   declared in more than one project. Drop an `unknown-id` problem when the
   link resolves to another project's doc.

## Index output

`docket index` writes `.docket/state.json` ([example](../examples/hotel-bookings/.docket/state.json)).
It holds everything the UI needs, so the UI never reads the repository itself,
and showing several projects together means reading each one's state.json.

- **Header**: the `project` (its ID and name), its `product` (ID and name)
  when `docket.yaml` declares one, and the commit indexed.
- **Every `file` is from the project's folder**, the one with its
  `docket.yaml`, such as `docket/domains/billing/concepts/bill.md`, not from
  the repository's root, so a project reads the same wherever it is.
- **`summary`**: how many domains, features, personas and initiatives there
  are, capabilities per level with `draft` among them, how many rules, gaps,
  tradeoffs, mechanisms, components and problems. This is the at-a-glance view.
- **`domains`**: each of the project's domain docs.
- **`features`**: each with its capabilities and its `tradeoffs`. Each
  capability names the feature it's in, as a reference, or `null`,
  and lists its `gaps` and `tradeoffs`, by ID. Its `stability` can be
  `"draft"`.
- **`personas`**: each with its `name`, `role` and `title`, `role` and
  `title` as `null` where it has none, the capabilities that list them, the features
  those are in, and the `initiatives` it lists, as references. Personas
  aren't in a domain, so these have no `domain`.
- **`initiatives`**: each with its ID, file, `name`, `description`, the
  capabilities that list it, the features those are in, the personas that
  list it, and its body. Like personas, they have no `domain`. Each capability lists its `initiatives`,
  as references.
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
  or a persona's `image`. Each decision is its `topic`, or `null`, its `question`, and its `affects`. Each `confusedWith` is its
  `concept` or `term`, the other `null`, and `summary`.
- **`mechanisms`** and **`components`**: each with its ID, file, name,
  `description`, `capabilities`, `meets`, its `gaps` and
  `tradeoffs` by ID, its `decisions`, its `evidence`, and its body. A
  component's `capabilities` are as it lists them. A mechanism also has
  `applies`, and its `capabilities` are worked out: every capability the
  project declares, other than drafts, then every one its components list
  that isn't already there. For one that applies to its product, that's
  only this project's part, since the indexer can't see the others: combining
  adds the rest. They're in no domain, so they have no `domain`.
- **Evidence**: each rule's, capability's, mechanism's and component's entry also
  has `evidence`, with `verifies` and `implements` lists of each place's
  `file`, `line` and `text`, as
  [Annotations](annotations/#what-the-indexer-records) describes. Both are
  empty when it has none.
- **`gaps`**: every gap from every doc, each with its ID, its `domain` when
  it's a capability's, the references it `affects` as written, its
  `impact`, `likelihood` and `reach` or `null`, its `name` and `description`, and `places`: where `docket:gap` annotations mark it, in the same
  shape as evidence.
- **`tradeoffs`**: every tradeoff from every doc, each with its ID, its
  `domain` when it's a feature's or capability's, the outcomes it `affects`,
  `name`, `description`, `benefit`, or `null` where it has none, `drawback`, and
  `places`, from `docket:tradeoff` annotations.
- **`problems`**: everything the indexer found wrong, each about a doc with
  that doc's `domain`.
- **`checklist`**: the stability checklist the project was indexed against, so
  the UI can show it beside each capability. It's the YAML's `kinds`, and its
  `qualities`, each with its `levels` as a list in level order. Each level has
  its `level`, `summary` as `null` where it has none, and its `outcomes`,
  `implementation` and `overengineering`, each a list, empty where it has
  none. Each outcome has its reference, `outcome:<quality>/<level>/<id>`, as its ID, its `level`,
  `text`, `until` as `null` where it has none, and its own `implementation`
  and `overengineering`. Every example
  in either is its `text` and `kinds`, with `kinds` empty where it isn't
  tagged.

### Problems

| Type                  | Raised when                                                                                                      |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `unknown-id`          | A link, annotation, `affects` or `domain` names a doc, gap or tradeoff that doesn't exist.                       |
| `invalid-frontmatter` | A required field is missing, or a value isn't allowed, such as a link of the wrong type for its field, such as a `docket` that isn't a type, or a feature, capability, rule or concept with no `domain`. |
| `duplicate-id`        | A project has two docs of one type with the same ID in one domain, or two domains, personas, initiatives, mechanisms or components with the same ID, or a doc has two gaps or tradeoffs with the same key across the projects and domains that write it. |
| `broken-link`         | A relative link in a doc's body or a text value doesn't resolve.                                                 |
| `unlinked-rule`       | No capability follows a rule.                                                                                    |
| `in-two-features`     | More than one feature lists the same capability.                                                                 |
| `contradiction`       | Contributions that should agree don't, as Domains describes.                                                     |
| `invalid-annotation`  | An annotation names a rule without its domain.                                                                   |
| `unknown-outcome`     | An outcome in a gap's, tradeoff's or decision's `affects`, or in `meets`, isn't a checklist outcome.             |

`in-two-features` is a contradiction too, when the listings
are in different projects. Combining raises `contradiction` and
`duplicate-id`, and those.

## Open decisions

- **The stability checklist is fixed.** It becomes configurable once someone
  adopting Docket needs different outcomes.
- **Met is mostly assumed.** An outcome counts as met unless a gap, tradeoff
  or decision affects it.
  A mechanism or component that `meets` it adds evidence, but everything else is
  met on trust, so nothing says which outcomes someone actually looked at, and
  an outcome added to the checklist counts as met everywhere at once. A record
  of when someone last went through the list, and against which version of
  it, would show both. Outcomes not applicable, with why, and outcomes Docket
  can work out itself, such as `outcome:functionality/alpha/main-path` from its rules'
  evidence, would also make met mean more.
