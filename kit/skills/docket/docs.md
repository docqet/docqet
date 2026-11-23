# Writing Docket docs

## Every doc

- **Frontmatter is the doc.** Everything tools read is a YAML field. The body
  is optional free Markdown for anything more worth saying, in any shape. No
  heading in a body means anything, and nothing reads it. A doc with no body is
  complete.
- **No fact in both.** The body says more than the fields. It doesn't repeat
  them.
- **Every doc has an `id`**, its first field, and a `name`, and every doc but
  a rule has a `description`. The ID is how everything else names it, so it
  stays the same when the file is renamed or moved, or the name changes. Name
  the file after it. The name is what it's called. The description says what it is, usually in a
  sentence, and for a concept a definition in as many sentences as that takes.
- **Fields go in the order below.** Leave out any that aren't required and
  have nothing to say.
- **Field names, IDs and values are kebab case**: `room-booking`,
  `confused-with`, `ga`. A link is a reference, `<type>:<id>`:
  `rule:no-double-booking`.
- **Text values are Markdown.** A short one can be plain. A longer one uses
  `>-` to fold its lines into one paragraph. One with paragraphs or a list
  uses `|`. A list of sentences is a YAML list, one string per item, never a
  Markdown list in one string.
- **Relative links** in text resolve from the doc's file, so moving a file
  can break them. Only frontmatter link fields and annotations are
  relationships. Links in text are for readers.
- **Nothing private.** Docs are checked in, so they never hold secrets,
  accounts, a real person's details, or real client data.

## Product docs

Written in the domain's words, for anyone with a stake in the software. They
never name the implementation.

### Domain: `docs/product/domains/<domain>/domain.md`

A part of the business with a language of its own. Every product doc but a
persona is in one: the one whose `domain.md` is in its folder. The folder's
name means nothing. Projects working in the same part of the business use the
same domain ID.

```yaml
---
id: guest-stays
name: Guest stays
description: Looking after guests from their booking to their check-out.
decisions: []        # optional, see gaps-and-decisions.md
---
```

### Feature: `features/`

A job the product does, such as Reservations. It keeps its identity as
capabilities come and go. If work helps an existing feature do its job, it's a
capability of that feature. If it gives the product a new job, it's a new
feature. Work that only changes how something is built is neither.

```yaml
---
id: reservations
name: Reservations
description: Taking bookings and handling changes to them, before the guest arrives.
capabilities:        # required, in the order to show them
  - capability:room-booking
  - capability:cancellations
tradeoffs: []        # non-goals: capabilities we've decided never to build
decisions: []
---
```

A feature has no level, rules or gaps. Its maturity and readiness come from its
capabilities, its rules are theirs, and a capability it lacks is a draft
capability. A capability is in at most one feature.

### Capability: `capabilities/`

One result of value, and the only doc with a stability level. Its description
is one sentence saying who or what does what: "Clerks book a free room for a
guest's stay", or "The software closes each business day overnight".

```yaml
---
id: room-booking
name: Room booking
description: Clerks book a free room for a guest's stay.
stability: beta      # required: draft, prototype, alpha, beta or ga
personas: [persona:front-desk-clerk]
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

### Rule: `rules/`

What must always or never happen, one rule per file. Rules can be kept in
folders under `rules/`, such as one per part of the domain, like `booking/`,
never one per capability or feature. The folders mean nothing to tools. A
rule's ID doesn't change as capabilities start or stop following it. Its name
is the rule in a few words. It has no description. Its body says the rule in
full when its name doesn't, with examples.

```yaml
---
id: same-day-turnover
name: A stay can start on the day another ends
concepts: [concept:booking, concept:room]
why: >-
  Guests check out by 11:00 and check in from 15:00, which leaves time to
  clean the room.
---
```

`why` lets whoever meets a case the rule didn't foresee judge it. Every rule
needs at least one capability that follows it.

### Concept: `concepts/`

What a word means in this domain. The same word can mean different things in
different domains, and both are right.

```yaml
---
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

### Persona: `docs/product/personas/`

A type of person the software serves, written as one invented person, for the
whole project rather than per domain.

```yaml
---
id: front-desk-clerk
name: Maria                        # the invented person's name
description: Runs the front desk: takes bookings, and checks guests in and out.
role: Front desk                   # how they use the software; null if none
title: Front desk clerk            # their job title; null if none
image: https://randomuser.me/api/portraits/women/68.jpg   # optional
---
```

The body says what they need and why, what they know, their context, and what
makes them trust the software or give up on it. Never base a persona on a real
person's details.

## Technical docs

Written in the code's words, for the engineer or agent about to change it.
They hold only what the code can't say. Leave out what a competent reader
learns from the code in a few minutes, such as lists of endpoints, tables or
functions. Most code has no doc. Neither type has a level or a domain, and
neither lists paths: the code points at the doc with `docket:implements`.

### Mechanism: `docs/technical/mechanisms/`

How something works across the whole project, such as deployment or
authentication. It describes how something works, not a convention to follow.
It applies to every capability the project serves, so it lists none.

```yaml
---
id: deployment
name: Deployment
description: >-
  How a change gets from the main branch to the hotel's server, and back off
  it again.
applies: project     # or platform: every capability any project on the platform serves
meets:               # checklist outcomes it meets for those capabilities
  - reliability/beta/undo-release
gaps: []
tradeoffs: []
decisions: []
---
```

### Component: `docs/technical/components/`

One area of the code, named as the code names it.

```yaml
---
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

Every link points one way, and is written once:

```text
feature    → capabilities
capability → personas, rules, concepts
rule       → concepts
concept    → concepts                      (confused-with)
component  → capabilities, outcomes        (meets)
mechanism  → outcomes                      (meets)
gap        → an outcome, a rule            (outcome, rule)
tradeoff   → an outcome                    (outcome)
decision   → a doc, gap or tradeoff        (became)
```

Every link is a reference, `<type>:<id>`, the same in frontmatter as in an
annotation: `rules: [rule:no-double-booking]`. A link to a rule or concept
with no domain means the one in the linking doc's own domain, and nothing else.
One in another domain always adds `@<domain>`, even when no other domain has
that ID: `concepts: [concept:booking@guest-stays]`. That way a link's meaning
never changes when another domain adds a rule or concept with the same ID.

To go the other way, such as finding which capabilities follow a rule, search
for its reference: `grep -rn "rule:no-double-booking"` finds the docs that
link to it and the code that points at it.

## Several projects

Projects on the same platform, named in `docket.yaml`, contribute to one
picture of the product. A domain, feature, capability, persona, mechanism or
component with the same ID in two projects is one thing: its name and
description must match, its links are combined, and a capability's level is
per domain. Before creating one, check whether another project on the
platform already has it, if the project's instructions say where they are.
Reuse its ID, name and description rather than writing a second.
