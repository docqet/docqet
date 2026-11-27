# Writing Docqet docs

## Every doc

- **Frontmatter is the doc.** Everything tools read is a YAML field. The body
  is optional free Markdown for anything more worth saying, in any shape. No
  heading in a body means anything, and nothing reads it. A doc with no body is
  complete.
- **No fact in both.** The body says more than the fields. It doesn't repeat
  them.
- **Every doc starts with `docqet`**, its type, which is what makes the file a
  Docqet doc, **then `id`**. Then comes a `name`, and for every doc but a rule
  a `description`. The ID is how everything else names it, so it stays the same
  when the file is renamed or moved, or the name changes.
- **Where a file is means nothing.** Put a new doc where the project keeps
  others of its type, named after its ID. In a new project, use the
  recommended layout: a folder per type in `docqet/`: `areas/`, `features/`,
  `capabilities/`, `rules/`, `concepts/`, `personas/`, `problems/`,
  `constraints/`, `initiatives/`, `mechanisms/` and `components/`. Subfolders
  inside any of them are yours to use, and mean nothing to tools. The name is what it's called.
  The description says what it is, usually in a sentence, and for a concept a
  definition in as many sentences as that takes.
- **Fields go in the order below.** Leave out any that aren't required and
  have nothing to say. `docqet check` reports a missing required field, an
  unknown one, or a value the format doesn't allow.
- **Field names, IDs and values are kebab case**: `room-booking`,
  `confused-with`, `ga`. A link is a reference, `<type>:<id>`:
  `rule:no-double-booking`. A link is written in the more concrete doc and
  names the more general one: see [links](#links).
- **Text values are Markdown.** A short one can be plain. A longer one uses
  `>-` to fold its lines into one paragraph. One with paragraphs or a list
  uses `|`. A list of sentences is a YAML list, one string per item, never a
  Markdown list in one string.
- **Relative links** in text resolve from the doc's file, so moving a file
  can break them. Only frontmatter link fields and annotations are
  relationships. Links in text are for readers.
- **Nothing private.** Docs are checked in, so they never hold secrets,
  accounts, a real person's details, or real client data.

## Two spaces

Docs are in two spaces. **Problem docs**, personas, problems and
constraints, are the problem space: why the software exists, and what any
solution must keep to, never naming the software. The solution space holds **product docs**: what
the software does, seen from outside, in the business's words, never naming the
implementation. And **technical docs**: how it's built, seen from inside, in
the code's words. Links only point toward why: technical docs link to
capabilities, capabilities to the problems they solve, and rules and
mechanisms to the constraints they respect, never the other way. The spaces say what a doc describes, not who decides it.

## Problem docs

### Persona: `docqet: persona`

A type of person the software serves, written as one invented person, for the
whole project.

```yaml
---
docqet: persona
id: front-desk-clerk
name: Maria                        # the invented person's name
description: Runs the front desk: takes bookings, and checks guests in and out.
role: Front desk                   # how they use the software; null if none
title: Front desk clerk            # their job title; null if none
image: https://randomuser.me/api/portraits/women/68.jpg   # optional
---
```

The body says what they know, their context, and what makes them trust the
software or give up on it. What they need goes in their problems. Never base
a persona on a real person's details.

### Problem: `docqet: problem`

A pain point one or more personas share, for the whole project. It's why
capabilities exist.

```yaml
---
docqet: problem
id: room-given-to-two-guests
name: A guest's room is given to someone else   # the problem in a few words
description: >-
  I take bookings at the desk and on the phone, interrupted all the time, and
  I can promise a room for a night it's already taken. I find out when the
  second guest is standing in front of me.
cost: >-                          # optional: what it costs them or the business
  The worst conversation the front desk has.
personas: [persona:front-desk-clerk]   # required: who has it
---
```

- **It never names the software**, its screens or its capabilities. Ask
  whether it would still be true if the software didn't exist. "Can't book
  online" is a capability with "can't" in front, not a problem.
- **Its description is the situation**, as the people who have it would say
  it, and its cost is what that costs.
- **Personas share one only when it's the same pain**: the same situation,
  and the same cost. Otherwise it's two problems.

A problem is a person's call, like any intention: propose it, and write it
once they confirm it. Its capabilities, those whose `solves` names it, are
worked out.

### Constraint: `docqet: constraint`

Something imposed from outside that any solution must respect, and nobody on
the team can change: a law, a contract, a policy set elsewhere, or a fact.
For the whole project.

```yaml
---
docqet: constraint
id: invoice-numbers-in-sequence
name: Invoice numbers run in sequence for the tax office
description: >-
  The tax office requires the hotel's invoices to be numbered in one
  sequence, with no number missing or used twice.
source: Tax law                   # optional: where it comes from
---
```

Ask whether it would still apply if the software were rebuilt from scratch,
any way the team liked. A budget, a deadline or a technology the team chose
isn't one. Rules and mechanisms that keep to it list it in `respects`; one
nothing respects is an advisory finding. Like a problem, it's a person's
call.

## Product docs

Written in the business's words, for anyone with a stake in the software.
They never name the implementation.

### Area: `docqet: area`

A grouping of features, so a large product can be seen a part at a time. It
has no language of its own: rules and concepts are the product's, whatever
area uses them. Features name their area; small projects can have none.

```yaml
---
docqet: area
id: guest-stays
name: Guest stays
description: Looking after guests from their booking to their check-out.
decisions: []        # optional, see gaps-and-decisions.md
---
```

### Feature: `docqet: feature`

A part of what the product offers, such as Reservations: what someone comes
to the software for, and would name. It keeps its identity as capabilities
come and go. If work produces a new result in a part the product already has,
it's a capability of that feature. If it gives the product a new part, it's a
new feature. Work that only changes how something is built is neither.

```yaml
---
docqet: feature
id: reservations
name: Reservations
description: Taking bookings and handling changes to them, before the guest arrives.
area: area:guest-stays   # optional: the area it's in
tradeoffs: []        # non-goals: capabilities we've decided never to build
decisions: []
---
```

A feature has no level, rules, gaps or problems. Its maturity and readiness
come from its capabilities, its rules and problems are theirs, and a
capability it lacks is a draft capability. Its capabilities name it; it lists
none, and readers show them by name.

### Capability: `docqet: capability`

One result the product produces, solving part of one or more problems, and
the only doc with a stability level. Its description is one sentence saying
who or what does what: "Clerks book a free room for a guest's stay", or "The
software closes each business day overnight".

```yaml
---
docqet: capability
id: room-booking
name: Room booking
description: Clerks book a free room for a guest's stay.
stability: beta      # required: draft, prototype, alpha, beta or ga
feature: feature:reservations   # optional: the feature it's in, at most one
solves: [problem:room-given-to-two-guests]   # why it exists; its personas are its problems'
initiatives: []
rules: [rule:no-double-booking, rule:minimum-stay]
concepts: [concept:booking]
gaps: []
tradeoffs: []
decisions: []
---

## Includes

- Clerks move a booking to new dates.
```

What a capability doesn't do goes elsewhere: what must always or never happen
is a rule, what's missing for now is a gap, what's limited by choice is a
tradeoff, and a whole result it doesn't produce yet is another capability, as
a draft. Following a rule claims the capability holds to it, unless one of its
gaps names that rule.

A capability that solves no problem yet is an advisory finding: shown, but
never failing `docqet check`, and it serves nobody until it solves one. A
capability never lists `personas`: they're its problems', and the field fails
the check. Moving an older project over, write the problems its `personas`
stood for, link them with `solves`, and remove `personas`.

### Rule: `docqet: rule`

What must always or never happen, one rule per file. Rules can be kept in
folders of their own, such as one per part of the business, like `rules/booking/`,
never one per capability or feature. The folders mean nothing to tools. A
rule's ID doesn't change as capabilities start or stop following it. Its name
is the rule in a few words. It has no description. Its body says the rule in
full when its name doesn't, with examples.

```yaml
---
docqet: rule
id: same-day-turnover
name: A stay can start on the day another ends
concepts: [concept:booking, concept:room]
respects: [constraint:rooms-cleaned-between-stays]   # optional: constraints it keeps to
why: >-
  Guests check out by 11:00 and check in from 15:00, which leaves time to
  clean the room.
---
```

`why` lets whoever meets a case the rule didn't foresee judge it. Every rule
needs at least one capability that follows it.

### Concept: `docqet: concept`

What a word means in the product. Each word means one thing: where the business
uses one word for two things, they're two concepts with their own IDs, each
naming the other in `confused-with`, such as a booking and a billed stay.

```yaml
---
docqet: concept
id: bill
name: Bill
description: >-
  Everything a guest owes for one stay, and everything they've paid towards
  it.
confused-with:
  - term: Invoice                 # a word that isn't a concept in the docs
    summary: what a company is sent for a month of its staff's bills.
  - concept: concept:payment      # or a link to a concept
    summary: one amount paid towards a bill, not the bill itself.
---
```

The body holds its details: what it's made of, how it relates to other
concepts, and the states it moves through.

### Initiative: `docqet: initiative`

A body of work, so it can be seen on its own, such as the MVP or what comes
after it. It's for the whole project, and cuts across features.

```yaml
---
docqet: initiative
id: busy-season
name: Busy season
description: >-
  Handling full nights: groups, a waitlist, and turning rooms over faster.
personas: [persona:front-desk-clerk]   # the personas its work is for
---
```

The body is optional, and can say more, such as what the work is and why.
Capabilities link to it in `initiatives`, and it names the personas its work
is for. It has no level, gaps, tradeoffs or decisions, and no
dates or order. A capability or persona in no initiative shows only when
everything does.

An initiative is a person's call: ask before creating one or adding a
capability or persona to one. Once the work no longer needs seeing on its
own, remove the link from its capabilities and delete the doc.

## Technical docs

Written in the code's words, for the engineer or agent about to change it.
They hold only what the code can't say. Leave out what a competent reader
learns from the code in a few minutes, such as lists of endpoints, tables or
functions. Most code has no doc. Neither type has a level, and
neither lists paths: the code points at the doc with `docqet:implements`.

### Mechanism: `docqet: mechanism`

How something works across the whole project, such as deployment or
authentication. It describes how something works, not a convention to follow.
It applies to every capability the project serves, so it lists none.

```yaml
---
docqet: mechanism
id: deployment
name: Deployment
description: >-
  How a change gets from the main branch to the hotel's server, and back off
  it again.
applies: project     # or product: every capability any project in the product serves
respects: []         # constraints how it's built keeps to
meets:               # expected outcomes it meets for those capabilities
  - outcome:reliability/beta/undo-release
gaps: []
tradeoffs: []
decisions: []
---
```

### Component: `docqet: component`

One area of the code, named as the code names it.

```yaml
---
docqet: component
id: bookings
name: Bookings
description: >-
  Where a room is held for a stay, and where no double-booking is enforced.
capabilities: [capability:room-booking, capability:group-bookings, capability:check-in]   # those relying on it
meets: []
gaps: []
tradeoffs: []
decisions: []
---
```

A component's `capabilities` is the only link from technical docs to the
product. Product docs never link to technical docs.

The body of either is how it works, including what's correct but would
surprise whoever changes it.

## Links

Every link points one way, and is written once, in the more concrete doc,
naming the more general one. Across spaces that's toward why: code →
technical → product → problem, skipping a space when there's nothing between.
Within a space it's up: a capability names its feature, and a feature its
area. Docqet works out every reverse link, so each page shows both
directions.

```text
feature    → area
capability → feature, problems (solves), initiatives, rules, concepts
initiative → personas
problem    → personas
rule       → concepts, constraints (respects)
concept    → concepts                      (confused-with)
component  → capabilities, outcomes        (meets)
mechanism  → outcomes (meets), constraints (respects)
gap        → an outcome, a rule            (outcome, rule)
tradeoff   → an outcome                    (outcome)
```

Every link is a reference, `<type>:<id>`, the same in frontmatter as in an
annotation: `rules: [rule:no-double-booking]`. Every ID names one thing across
the whole product, rules and concepts included.

To go the other way, such as finding which capabilities follow a rule, use
`docqet show rule:no-double-booking`: it lists the docs that link to it and
the code that points at it.

## Several projects

Projects in the same product, named in `docqet.yaml`, contribute to one
picture of the product. Any doc with the same ID in two projects is one
thing: its name and description must match, its links are combined, and a
capability's level is per project. Before creating one, check whether another project in the
product already has it, with `docqet list <type> --product`. Reuse its ID,
name and description rather than writing a second. `docqet check --product`
reports where two projects disagree.
