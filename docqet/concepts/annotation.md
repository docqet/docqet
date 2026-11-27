---
docqet: concept
id: annotation
name: Annotation
description: >-
  A comment in the repository, the same in any language or framework, that says
  what a place is about.
confused-with:
  - concept: "concept:evidence"
    summary: >-
      what the indexer works out from annotations, for each rule, capability, mechanism and component.
---

An annotation ties code, tests or config to a rule, capability, mechanism or
component as [evidence](evidence.md), or marks where a [gap](gap.md) or
[tradeoff](tradeoff.md) shows.

## The format

An annotation is written in a comment, in whatever comment syntax the file
uses:

```text
docqet:<verb> <reference> [<reference> ...]
```

```ts
// docqet:verifies rule:minimum-stay
it("rejects a stay that ends the day it starts", () => {
```

```gherkin
  # docqet:verifies rule:no-double-booking
  Rule: A room can't be double-booked
```

- **Each reference is written as everywhere else**, as
  [References](doc.md#references) describes: `<type>:<id>`, or a gap's or
  tradeoff's ID, `<type>:<id>#<key>`.
- **A rule or concept is named by its ID alone**, as in a doc, since its ID
  is one across the product.
- **One annotation can name several things**, of any of the types its verb
  takes: `docqet:implements capability:room-booking component:bookings`.
- **Several annotations can stack** on one place, one per line.
- **Annotations go anywhere but a Docqet doc.** Code, tests, migrations,
  workflows and config can all have them. A doc says what it links to in its
  frontmatter instead.

A database constraint, with two stacked annotations, one marking the tradeoff
behind it:

```sql
  -- docqet:implements rule:no-double-booking component:bookings
  -- docqet:tradeoff component:bookings#constraint-not-lock
  EXCLUDE USING gist (room_id WITH =, nights WITH &&) WHERE (status <> 'cancelled')
```

## Verbs

| Verb | Says | Names |
| --- | --- | --- |
| `verifies` | This place checks that the rule holds, the capability works, the mechanism or component does what it says, or the constraint is kept to | `rule`, `capability`, `mechanism`, `component`, `constraint` |
| `implements` | This place makes it so. Nothing implements a constraint: what keeps to it respects it | `rule`, `capability`, `mechanism`, `component` |
| `gap` | A known gap shows here: tracked technical debt, in place of a bare TODO | A gap's ID |
| `tradeoff` | This is deliberate, though it may look wrong, so nobody "fixes" it | A tradeoff's ID |

`verifies` and `implements` give evidence. Docqet doesn't care what a place
is, whether
[a unit test](../../examples/hotel-bookings/src/booking/stay.test.ts),
[a Gherkin `Rule:`](../../examples/hotel-bookings/features/booking.feature),
[a function](../../examples/hotel-bookings/src/booking/availability.ts),
[a database constraint](../../examples/hotel-bookings/db/migrations/001_bookings.sql)
or
[a deploy job](../../examples/hotel-bookings/.github/workflows/deploy.yml),
or what language it's in.

`gap` and `tradeoff` show where something declared on a doc can be seen in
the code. A gap or tradeoff with none is fine. Code that implements a
capability and a component, where a known gap shows:

```ts
// docqet:implements capability:room-booking component:bookings
// docqet:gap component:bookings#clashes-logged-as-unknown
export async function saveBooking(db: Pool, booking: Booking): Promise<void> {
```

## What an annotation is on

**An annotation is on the first line below it** that isn't blank or another
annotation. Put it directly above the function, test, constraint or step it's
about. Nobody writes a line number down.

**One at the top of a file stands for the whole file.** Where only part of a
file is about something, such as one function in a file that's mostly about
something else, only that part is annotated.

## Mechanisms and components

**A mechanism's or component's `implements` places are where it is in the
code.** Its doc lists no paths. Annotate its entry points, where someone
changing it should start reading, and whatever else is part of it, such as
[`assertRoomFree`](../../examples/hotel-bookings/src/booking/availability.ts)
and `saveBooking` for bookings, or a migration or a workflow. A deploy
workflow, as evidence for a mechanism:

```yaml
  # docqet:implements mechanism:deployment
  deploy:
```

## What the indexer records

**The indexer doesn't parse anything.** It looks for the four verbs, after
`docqet:`, in every file in the project's folder that isn't a Docqet doc or
left out by its [`.docqetignore`](project.md), in whatever comment syntax the
file uses. A folder inside it with a `docqet.yaml` of its own is another
project, with annotations of its own.

For each one, it records the file, the annotation's line, and the text of the
line it's on, as written, every time it runs, so readers can tell what it's
on without knowing the language. They're a rule's, capability's,
mechanism's or component's evidence in [state](state.md), as
[Evidence](evidence.md#how-its-written) shows, and a gap's or tradeoff's
`places`, in the same shape.

## Findings

Annotations are claims, and the indexer can only check some of what they
claim:

- **One naming something that doesn't exist** is `unknown-id`, such as a gap
  left behind after it closed, or an ID that's since changed.
- **One naming a rule or concept with `@<domain>` after its ID**, as
  annotations once did, is `invalid-annotation`: the ID alone names it.

It can't catch a missing annotation, or one left on code that's no longer
about what it names. Keeping them true is up to whoever changes the code.
