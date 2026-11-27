---
docqet: concept
id: doc
name: Doc
description: >-
  One Markdown file describing one thing: an area, feature, capability, rule,
  concept, persona, problem, constraint, initiative, mechanism, component or archetype.
confused-with:
  - concept: "concept:state"
    summary: >-
      what the indexer writes from the docs. Docs are declared; state is derived.
---

Every doc is a Markdown file in two parts: YAML frontmatter, then a body.

```markdown
---
docqet: concept
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
  level, its [links](link.md), its gaps, tradeoffs and decisions, and the
  fields its type has, such as a persona's role or a rule's why. Tools read
  it, check it, count it, follow its links and lay it out.
- **The body is free Markdown**, for anything more worth saying, in whatever
  shape suits it: prose, lists, tables, code, images, and headings of the
  author's own. It's optional. No tool reads anything out of it, and readers
  show it as written.

## Frontmatter or body

Something is a frontmatter field when either of these is true:

- **The format defines it.** It has a name and a meaning that every Docqet
  repository shares, such as a persona's `role` or a concept's
  `confused-with`.
- **Something depends on finding it.** A tool or reader computes with it,
  counts it, links to it, checks it or shows it in a set place, such as a
  capability's `stability` or an area's `decisions`.

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

[`cancellations.md`](../../examples/hotel-bookings/docqet/capabilities/cancellations.md),
shortened, is complete without its body:

```markdown
---
docqet: capability
id: cancellations
name: Cancellations
description: >-
  Clerks cancel a booking when a guest's plans change, and the guest is
  refunded what the cancellation policy allows.
stability: alpha
within: feature:reservations
solves: [problem:late-cancellations-leave-rooms-empty]
follows:
  - rule:free-cancellation-window
  - rule:late-cancellation-fee
uses: [concept:booking]
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

Every doc starts its frontmatter by saying what it is: `docqet`, its type,
then `id`, its ID. Where its file is says nothing, so its file name and the
folders it's in are the author's to choose and change, and renaming,
moving or regrouping it breaks nothing.

```yaml
---
docqet: capability
id: room-booking
name: Room booking
---
```

Docs can be anywhere in the [project](project.md). The recommended home is
its `docqet/` folder, with a folder per type:

| `docqet`   | Recommended folder      | Example ID                    |
| ---------- | ----------------------- | ----------------------------- |
| area       | `docqet/areas/`         | `guest-stays`                 |
| feature    | `docqet/features/`      | `reservations`                |
| capability | `docqet/capabilities/`  | `room-booking`                |
| rule       | `docqet/rules/`         | `no-double-booking`           |
| concept    | `docqet/concepts/`      | `booking`                     |
| persona    | `docqet/personas/`      | `front-desk-clerk`            |
| problem    | `docqet/problems/`      | `room-given-to-two-guests`    |
| constraint | `docqet/constraints/`   | `invoice-numbers-in-sequence` |
| initiative | `docqet/initiatives/`   | `busy-season`                 |
| mechanism  | `docqet/mechanisms/`    | `deployment`                  |
| component  | `docqet/components/`    | `bookings`                    |
| archetype  | `docqet/archetypes/`    | `web-app`                     |

- **`docqet` marks a file as a Docqet doc** and gives its type, one of those
  above. A Markdown file without it isn't a Docqet doc, and nothing reads it.
  A type that isn't one of these is `invalid-frontmatter`.
- **IDs and values are kebab case**: lowercase words joined by hyphens, such
  as `room-booking`, `not-decided` or `ga`. Tools show values with their own
  labels, such as GA for `ga`.
- **An ID names one doc of its type across the whole product**, rules and
  concepts included. The same ID in another project is a contribution to the
  same doc: [product](product.md#putting-contributions-together) says how
  contributions are put together. A word that means two things in two parts
  of the business is two [concepts](concept.md), with different IDs.
- **A project has one doc of each type with a given ID.** A second is a
  `duplicate-id` [finding](finding.md).
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
  the wrong type for its field, such as a concept in `follows`, is
  `invalid-frontmatter`.

  ```yaml
  follows: [rule:no-double-booking, rule:minimum-stay]
  ```

- **A reference is the same everywhere.** Rule and concept IDs are one
  across the product, so `rule:closed-bills-dont-change` names the same rule
  in a capability, in an annotation and in another project. A reference with
  `@` and a domain after its ID, as docs once had, is `invalid-frontmatter`
  in a doc and `invalid-annotation` in code.
- **A gap's or tradeoff's ID** is its doc's reference plus its key:
  `capability:room-booking#calendar-needs-a-mouse`,
  `feature:reservations#front-desk-bookings-only` or
  `component:ledger#balance-worked-out-on-read`.
- **An outcome's reference** is `outcome:` and its quality, level and own ID:
  `outcome:usability/beta/everyone`. Outcomes are what a level expects, in
  [the stability rubric](rubric.md). The rubric is part of the
  format, so it's the same in every project.

## Name and description

Every doc has its `docqet` type and an `id`, then a `name` and, but for a
rule, a `description`, all required:

- **`name`** is what it's called, such as `Room booking`. A persona's is the
  invented person's, such as `Maria`, and a rule's is the rule in a few words.
- **`description`** says what it is: for most docs a sentence, and for a
  concept a definition in the business's words, in as many sentences as that
  takes. Readers show the name and description wherever the doc appears. A
  rule has none: its body says anything its name leaves out.

A [gap](gap.md) and a [tradeoff](tradeoff.md) have a `name` and a
`description` too, though they're entries in a doc rather than docs of their
own. What has no name, such as what a concept is confused with, is said in its
`summary` instead: the sentence or two that is the thing itself.

## Doc types

| Type | Frontmatter, in order | Its body, if it has one | Example |
| --- | --- | --- | --- |
| area | `docqet`, `id`, `name`, `description`, `decisions` | Anything more about the part of the business | [guest-stays](../../examples/hotel-bookings/docqet/areas/guest-stays.md) |
| feature | `docqet`, `id`, `name`, `description`, `within`, `tradeoffs`, `decisions` | Anything more about what it offers | [reservations](../../examples/hotel-bookings/docqet/features/reservations.md) |
| capability | `docqet`, `id`, `name`, `description`, `stability` (required), `within`, `solves`, `included-in`, `follows`, `uses`, `gaps`, `tradeoffs`, `decisions` | Anything more about what it does, such as what else it includes, or how we'll know it's working | [room-booking](../../examples/hotel-bookings/docqet/capabilities/room-booking.md) |
| rule | `docqet`, `id`, `name`, `uses`, `respects`, `why` | The rule in full, where its name doesn't say it all, and examples or how it plays out | [same-day-turnover](../../examples/hotel-bookings/docqet/rules/booking/same-day-turnover.md) |
| concept | `docqet`, `id`, `name`, `description`, `confused-with` | Its details: what it's made of, how it relates to other concepts, and the states it moves through | [booking](../../examples/hotel-bookings/docqet/concepts/booking.md) |
| persona | `docqet`, `id`, `name`, `description`, `role`, `title`, `image` | Anything more about who they are, such as what they know, their context, what they expect, and what they care about | [front-desk-clerk](../../examples/hotel-bookings/docqet/personas/front-desk-clerk.md) |
| problem | `docqet`, `id`, `name`, `description`, `cost`, `felt-by` (required) | Anything more about the pain, such as when it happens and what people do about it today | [room-given-to-two-guests](../../examples/hotel-bookings/docqet/problems/room-given-to-two-guests.md) |
| constraint | `docqet`, `id`, `name`, `description`, `source` | Anything more, such as the clause or article it comes from, or what happens if it's broken | [invoice-numbers-in-sequence](../../examples/hotel-billing/docqet/constraints/invoice-numbers-in-sequence.md) |
| initiative | `docqet`, `id`, `name`, `description`, `for` | Anything more about the work, such as what's in it and why | [busy-season](../../examples/hotel-bookings/docqet/initiatives/busy-season.md) |
| mechanism | `docqet`, `id`, `name`, `description`, `applies`, `respects`, `meets`, `gaps`, `tradeoffs`, `decisions` | How it works | [deployment](../../examples/hotel-bookings/docqet/mechanisms/deployment.md) |
| component | `docqet`, `id`, `name`, `description`, `within`, `is`, `serves`, `meets`, `gaps`, `tradeoffs`, `decisions` | How it works | [bookings](../../examples/hotel-bookings/docqet/components/bookings.md) |
| archetype | `docqet`, `id`, `name`, `description` | What it means here for a component to be one, such as what's expected of every one | [web-app](../../examples/exalynt/ui/docqet/archetypes/web-app.md) |

The body column is a suggestion of what's worth writing, not a structure.
Each field is defined by the concept it's about:

- **Every link field reads as a sentence from the doc that writes it**, in
  plain words: a capability is *within* a feature, *solves* a problem,
  *follows* a rule and *uses* a concept.
- **`within`** names the one thing a doc is part of: the [area](area.md) a
  feature is in, or the [feature](feature.md) a capability is in. It's
  optional, and names one.
- **`stability`** is a capability's
  [stability level](stability-level.md), and only capabilities have one.
- **`solves`** lists the [problems](problem.md) a capability solves, and so
  the personas it serves.
- **`felt-by`** lists the [personas](persona.md) who have a problem, and
  **`for`** those an initiative's work is for.
- **`cost`** says what a problem costs the people who have it.
- **`respects`** lists the [constraints](constraint.md) a rule or mechanism
  keeps to, and **`source`** says where a constraint comes from.
- **`included-in`** lists the [initiatives](initiative.md) a capability is
  part of.
- **`follows`** lists the [rules](rule.md) a capability follows, and
  **`uses`** the [concepts](concept.md) a capability or rule uses.
- **`within`** on a component names the one bigger component it's part of,
  and **`is`** the [archetype](archetype.md) it is.
- **`serves`** lists the capabilities a [component](component.md) serves:
  those that rely on it.
- **No doc names its code**: [mechanisms](mechanism.md) and components are
  found in the code by their [annotations](annotation.md), and a capability
  through the mechanisms that apply to it and the components that list it.
- **`applies`** says what a [mechanism](mechanism.md) applies to.
- **`meets`** lists the outcomes of [the stability rubric](rubric.md) a
  mechanism or component meets.
- **`decisions`** lists the [open decisions](open-decision.md) on an area,
  feature, capability, mechanism or component.
- **`why`** says why a [rule](rule.md) holds.
- **`confused-with`** lists what a [concept](concept.md) is easily mistaken
  for.
- **`role`**, **`title`** and **`image`** describe a [persona](persona.md).
