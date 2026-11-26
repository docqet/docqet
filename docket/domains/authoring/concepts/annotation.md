---
docket: concept
id: annotation
domain: authoring
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
docket:<verb> <reference> [<reference> ...]
```

```ts
// docket:verifies rule:minimum-stay@guest-stays
it("rejects a stay that ends the day it starts", () => {
```

```gherkin
  # docket:verifies rule:no-double-booking@guest-stays
  Rule: A room can't be double-booked
```

- **Each reference is written as everywhere else**, as
  [References](doc.md#references) describes: `<type>:<id>`, or a gap's or
  tradeoff's ID, `<type>:<id>#<key>`.
- **A rule or concept always names its domain**, as `rule:<id>@<domain>`. A
  doc's links can leave out their own domain, but code is in no domain, so an
  annotation has none to leave out, even in a repository with only one.
- **One annotation can name several things**, of any of the types its verb
  takes: `docket:implements capability:room-booking component:bookings`.
- **Several annotations can stack** on one place, one per line.
- **Annotations go anywhere but a Docket doc.** Code, tests, migrations,
  workflows and config can all have them. A doc says what it links to in its
  frontmatter instead.

A database constraint, with two stacked annotations, one marking the tradeoff
behind it:

```sql
  -- docket:implements rule:no-double-booking@guest-stays component:bookings
  -- docket:tradeoff component:bookings#constraint-not-lock
  EXCLUDE USING gist (room_id WITH =, nights WITH &&) WHERE (status <> 'cancelled')
```

## Verbs

| Verb | Says | Names |
| --- | --- | --- |
| `verifies` | This place checks that the rule holds, the capability works, or the mechanism or component does what it says | `rule`, `capability`, `mechanism`, `component` |
| `implements` | This place makes it so | `rule`, `capability`, `mechanism`, `component` |
| `gap` | A known gap shows here: tracked technical debt, in place of a bare TODO | A gap's ID |
| `tradeoff` | This is deliberate, though it may look wrong, so nobody "fixes" it | A tradeoff's ID |

`verifies` and `implements` give evidence. Docket doesn't care what a place
is, whether
[a unit test](../../../../examples/hotel-bookings/src/booking/stay.test.ts),
[a Gherkin `Rule:`](../../../../examples/hotel-bookings/features/booking.feature),
[a function](../../../../examples/hotel-bookings/src/booking/availability.ts),
[a database constraint](../../../../examples/hotel-bookings/db/migrations/001_bookings.sql)
or
[a deploy job](../../../../examples/hotel-bookings/.github/workflows/deploy.yml),
or what language it's in.

`gap` and `tradeoff` show where something declared on a doc can be seen in
the code. A gap or tradeoff with none is fine. Code that implements a
capability and a component, where a known gap shows:

```ts
// docket:implements capability:room-booking component:bookings
// docket:gap component:bookings#clashes-logged-as-unknown
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
[`assertRoomFree`](../../../../examples/hotel-bookings/src/booking/availability.ts)
and `saveBooking` for bookings, or a migration or a workflow. A deploy
workflow, as evidence for a mechanism:

```yaml
  # docket:implements mechanism:deployment
  deploy:
```

## What the indexer records

**The indexer doesn't parse anything.** It looks for the four verbs, after
`docket:`, in every file in the project's folder that isn't a Docket doc or
left out by its [`.docketignore`](project.md), in whatever comment syntax the
file uses. A folder inside it with a `docket.yaml` of its own is another
project, with annotations of its own.

For each one, it records the file, the annotation's line, and the text of the
line it's on, as written, every time it runs, so readers can tell what it's
on without knowing the language. They're a rule's, capability's,
mechanism's or component's evidence in [state](state.md), as
[Evidence](evidence.md#how-its-written) shows, and a gap's or tradeoff's
`places`, in the same shape.

## Problems

Annotations are claims, and the indexer can only check some of what they
claim:

- **One naming something that doesn't exist** is `unknown-id`, such as a gap
  left behind after it closed, or an ID that's since changed.
- **One naming a rule or concept without its domain** is
  `invalid-annotation`.

It can't catch a missing annotation, or one left on code that's no longer
about what it names. Keeping them true is up to whoever changes the code.
