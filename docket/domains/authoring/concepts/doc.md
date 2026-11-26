---
docket: concept
id: doc
domain: authoring
name: Doc
description: >-
  One Markdown file describing one thing: a domain, feature, capability, rule,
  concept, persona, initiative, mechanism or component.
confused-with:
  - concept: "concept:state"
    summary: >-
      what the indexer writes from the docs. Docs are declared; state is derived.
---

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
  level, its [links](link.md), its gaps, tradeoffs and decisions, and the
  fields its type has, such as a persona's role or a rule's why. Tools read
  it, check it, count it, follow its links and lay it out.
- **The body is free Markdown**, for anything more worth saying, in whatever
  shape suits it: prose, lists, tables, code, images, and headings of the
  author's own. It's optional. No tool reads anything out of it, and readers
  show it as written.

## Frontmatter or body

Something is a frontmatter field when either of these is true:

- **The format defines it.** It has a name and a meaning that every Docket
  repository shares, such as a persona's `role` or a concept's
  `confused-with`.
- **Something depends on finding it.** A tool or reader computes with it,
  counts it, links to it, checks it or shows it in a set place, such as a
  capability's `stability` or a domain's `decisions`.

Everything else is the body. That means:

- **The format never gives the body a structure.** No heading in a body means
  anything to the format or to any tool, and the format never asks for one.
  When part of the body turns out to need a shared meaning, or a tool needs to
  find it, the format adds a field and that part moves into frontmatter. It
  never becomes a heading that tools recognize.
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

[`cancellations.md`](../../../../examples/hotel-bookings/docket/domains/guest-stays/capabilities/cancellations.md),
shortened, has no body at all:

```markdown
---
docket: capability
id: cancellations
domain: guest-stays
name: Cancellations
description: >-
  Clerks cancel a booking when a guest's plans change, and the guest is
  refunded what the cancellation policy allows.
stability: alpha
personas: [persona:front-desk-clerk]
rules:
  - rule:free-cancellation-window
  - rule:late-cancellation-fee
---
```

## Writing frontmatter

- **Field names are kebab case**, like IDs: `confused-with`.
- **Text values are Markdown**, for inline formatting such as code, emphasis
  and links. A relative link resolves from the doc's file, as it does in the
  body. A short value can be plain. A longer one uses `>-`, which folds its
  lines into one paragraph. One with paragraphs or a list uses `|`, which
  keeps its line breaks.
- **A list of sentences is a YAML list**, one string per item, never a
  Markdown list in one string, so each item can be counted and shown alone.

## IDs

Every doc starts its frontmatter by saying what it is: `docket`, its type,
then `id`, its ID, then `domain`, for a doc written in a
[domain](domain.md). Where its file is says nothing, so its file name and the
folders it's in are the author's to choose and change, and renaming,
moving or regrouping it breaks nothing.

```yaml
---
docket: capability
id: room-booking
domain: guest-stays
name: Room booking
---
```

Docs can be anywhere in the [project](project.md). The recommended home is
its `docket/` folder, with a folder per type and per domain:

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
- **What an ID names depends on the type.** A domain, feature, capability,
  persona, initiative, mechanism or component ID names one thing across every
  project, and the same ID anywhere is a contribution to the same one. A rule
  or concept ID names one definition within a domain, and the same ID in two
  domains is two definitions. [Domain](domain.md) says how contributions are
  put together.
- **A project has one doc of each type with a given ID in each domain**, and
  one domain, persona, initiative, mechanism or component with a given ID in
  all. A second is a `duplicate-id` [problem](problem.md). The same ID in
  another domain, or in another project, is a contribution or another
  definition, as above.
- **Name the file after its ID**, as the examples do, so it's easy to find.
  That's a convention: nothing reads a file's name.
- **Changing an ID is a breaking change.** Everything that names it, in its
  project and in others in its product, has to change with it, and the
  indexer reports each one left dangling. The commit that changes it says so
  with a [trailer](trailer.md), or history sees the old one removed and an
  unrelated one added. Readers show the `name`, so a doc can be renamed for
  people without changing its ID.

## References

Everything else names a doc by its **reference**, its type and ID.

- **A reference names its type**, as `<type>:<id>`, such as
  `rule:no-double-booking`, everywhere one is written: frontmatter links,
  annotations, and `state.json`. A reference reads the same in a doc as in
  code, so searching for one finds everything that names that doc. A link of
  the wrong type for its field, such as a concept in `rules`, is
  `invalid-frontmatter`.

  ```yaml
  rules: [rule:no-double-booking, rule:minimum-stay]
  ```

- **A reference to a rule or concept names its domain** as `@<domain>`,
  unless it's from a doc in the same domain: `concepts:
  [concept:booking@guest-stays]`. An annotation has no domain of its own, so
  it always names one: `docket:verifies rule:closed-bills-dont-change@billing`
  (see [which rule or concept a link means](link.md#which-rule-or-concept-a-link-means)).
- **A gap's or tradeoff's ID** is its doc's reference plus its key:
  `capability:room-booking#calendar-needs-a-mouse`,
  `feature:reservations#front-desk-bookings-only` or
  `component:ledger#balance-worked-out-on-read`.
- **An outcome's reference** is `outcome:` and its quality, level and own ID:
  `outcome:usability/beta/everyone`. Outcomes are what a level expects, in
  [the stability rubric](rubric.md). The rubric is part of the
  format, so it's the same in every project, and in no domain.

## Name and description

Every doc has its `docket` type and an `id`, a doc in a domain has its
`domain`, and every doc has a `name` and, but for a rule, a `description`, all
required:

- **`name`** is what it's called, such as `Room booking`. A persona's is the
  invented person's, such as `Maria`, and a rule's is the rule in a few words.
- **`description`** says what it is: for most docs a sentence, and for a
  concept a definition in the domain's words, in as many sentences as that
  takes. Readers show the name and description wherever the doc appears. A
  rule has none: its body says anything its name leaves out.

A [gap](gap.md) and a [tradeoff](tradeoff.md) have a `name` and a
`description` too, though they're entries in a doc rather than docs of their
own. What has no name, such as what a concept is confused with, is said in its
`summary` instead: the sentence or two that is the thing itself.

## Doc types

| Type | Frontmatter, in order | Its body, if it has one | Example |
| --- | --- | --- | --- |
| domain | `docket`, `id`, `name`, `description`, `decisions` | Anything more about the part of the business | [guest-stays](../../../../examples/hotel-bookings/docket/domains/guest-stays/domain.md) |
| feature | `docket`, `id`, `domain`, `name`, `description`, `capabilities` (required), `tradeoffs`, `decisions` | Anything more about the job | [reservations](../../../../examples/hotel-bookings/docket/domains/guest-stays/features/reservations.md) |
| capability | `docket`, `id`, `domain`, `name`, `description`, `stability` (required), `personas`, `initiatives`, `rules`, `concepts`, `gaps`, `tradeoffs`, `decisions` | Anything more about what it does, such as what else it includes, or how we'll know it's working | [room-booking](../../../../examples/hotel-bookings/docket/domains/guest-stays/capabilities/room-booking.md) |
| rule | `docket`, `id`, `domain`, `name`, `concepts`, `why` | The rule in full, where its name doesn't say it all, and examples or how it plays out | [same-day-turnover](../../../../examples/hotel-bookings/docket/domains/guest-stays/rules/booking/same-day-turnover.md) |
| concept | `docket`, `id`, `domain`, `name`, `description`, `confused-with` | Its details: what it's made of, how it relates to other concepts, and the states it moves through | [booking](../../../../examples/hotel-bookings/docket/domains/guest-stays/concepts/booking.md) |
| persona | `docket`, `id`, `name`, `description`, `role`, `title`, `image`, `initiatives` | Anything more about who they are, such as what they need, what they know, their context, what they expect, and what they care about | [front-desk-clerk](../../../../examples/hotel-bookings/docket/personas/front-desk-clerk.md) |
| initiative | `docket`, `id`, `name`, `description` | Anything more about the work, such as what's in it and why | [busy-season](../../../../examples/hotel-bookings/docket/initiatives/busy-season.md) |
| mechanism | `docket`, `id`, `name`, `description`, `applies`, `meets`, `gaps`, `tradeoffs`, `decisions` | How it works | [deployment](../../../../examples/hotel-bookings/docket/mechanisms/deployment.md) |
| component | `docket`, `id`, `name`, `description`, `capabilities`, `meets`, `gaps`, `tradeoffs`, `decisions` | How it works | [bookings](../../../../examples/hotel-bookings/docket/components/bookings.md) |

The body column is a suggestion of what's worth writing, not a structure.
Each field is defined by the concept it's about:

- **`stability`** is a capability's
  [stability level](stability-level.md), and only capabilities have one.
- **`personas`** lists the [personas](persona.md) a capability serves.
- **`initiatives`** lists the [initiatives](initiative.md) a capability is
  part of, or on a persona, those whose work is for them.
- **`capabilities`** on a [component](component.md) lists the capabilities
  that rely on it.
- **No doc names its code**: [mechanisms](mechanism.md) and components are
  found in the code by their [annotations](annotation.md), and a capability
  through the mechanisms that apply to it and the components that list it.
- **`applies`** says what a [mechanism](mechanism.md) applies to.
- **`meets`** lists the outcomes of [the stability rubric](rubric.md) a
  mechanism or component meets.
- **`decisions`** lists the [open decisions](open-decision.md) on a domain,
  feature, capability, mechanism or component.
- **`why`** says why a [rule](rule.md) holds.
- **`confused-with`** lists what a [concept](concept.md) is easily mistaken
  for.
- **`role`**, **`title`** and **`image`** describe a [persona](persona.md).
