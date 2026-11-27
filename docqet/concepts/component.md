---
docqet: concept
id: component
name: Component
description: >-
  One part of the code, and what to know before changing it, named the way the
  code names it.
confused-with:
  - concept: "concept:mechanism"
    summary: >-
      how something works across the whole project, applying to every capability it serves without listing them.
  - concept: "concept:capability"
    summary: >-
      a result of value. A component's scope follows the code, so it rarely lines up with one capability.
---

Hotel Bookings'
[bookings](../../examples/hotel-bookings/docqet/components/bookings.md)
component is where a room is held and no double-booking is enforced. Its scope
follows the code, not the [capability](capability.md), so one component can
serve several capabilities: bookings serves room booking, group bookings and
check-in. Hotel Billing's
[ledger](../../examples/hotel-billing/docqet/components/ledger.md) is one
too, though five capabilities rely on it, since it's one place in the code.
Something that works across the whole project, such as deployment, is a
[mechanism](mechanism.md) instead.

A component is a technical doc, as a mechanism is: it lists the capabilities
that rely on it, and holds its technical [gaps](gap.md), [tradeoffs](tradeoff.md) and
[open decisions](open-decision.md), and any outcomes from the
[stability rubric](rubric.md) it meets. What it holds, and what it leaves to
the code, is in [how it's built](../areas/authoring.md#how-its-built). Most parts of the
code need none.

## How it's written

A component is a doc whose `docqet` is `component`. Its frontmatter, in order, is `docqet`, `id`, `name`, `description`,
`capabilities`, `meets`, `gaps`, `tradeoffs` and `decisions`. Its body is how
it works, as a mechanism's is.

- **`capabilities`** lists the capabilities that rely on it. It's the only
  link between the technical docs and the product. A mechanism has none.
- **It names no code**, as a mechanism doesn't: its entry points say
  `docqet:implements component:bookings`.

[`bookings.md`](../../examples/hotel-bookings/docqet/components/bookings.md):

```markdown
---
docqet: component
id: bookings
name: Bookings
description: >-
  Where a room is held for a stay, and where no double-booking is enforced.
capabilities: [capability:room-booking, capability:group-bookings, capability:check-in]
gaps:
  - id: clashes-logged-as-unknown
    name: Booking clashes logged as unknown errors
    affects:
      - outcome:observability/beta/hears-of-errors
    impact: inconvenient
    likelihood: possible
    reach: all
    description: >-
      `saveBooking` passes every database error up as it is, so a clash that
      only the exclusion constraint caught is logged as an unknown failure,
      not as a double booking that was refused. That happens when two bookings
      for the same room arrive at once.
tradeoffs:
  - id: constraint-not-lock
    name: Database constraint, not an app lock
    impact: inconvenient
    likelihood: unlikely
    description: >-
      The database refuses overlapping bookings with an exclusion
      constraint, rather than the app locking the room while it checks.
    benefit: >-
      No two bookings can overlap, however they arrive at once, without the
      app having to get locking right. The check in the app is only there to
      give clerks a clear message first.
    drawback: >-
      Bookings need Postgres with `btree_gist`, so they can't move to a
      database without it.
---

The app checks the room is free (`assertRoomFree`) so it can tell the clerk
why it can't be booked. The bookings table's exclusion constraint is what
actually guarantees it, since two clerks can pass the app's check at the same
moment.

A stay is a half-open date range: the check-out date isn't a night of the
stay. `daterange` in Postgres is half-open by default, and `overlaps` in the
app agrees with it.
```
