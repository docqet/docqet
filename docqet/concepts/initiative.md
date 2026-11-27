---
docqet: concept
id: initiative
name: Initiative
description: >-
  A named body of work the product is taking on, so it can be seen on its own,
  such as the MVP, or what comes after it. Capabilities say which initiatives
  they're part of, and an initiative names the personas its work is for, so
  Docqet can show the whole product, or one initiative alone.
confused-with:
  - term: "Feature"
    summary: >-
      a lasting part of the product that a capability is in at most one of.
  - concept: "concept:area"
    summary: >-
      a lasting part of the product that groups features.
  - term: "Stability level"
    summary: >-
      how much a capability can be counted on.
---

Busy season is an initiative in Hotel Bookings: "handling full nights:
groups, a waitlist, and turning rooms over faster". Group bookings and the
waitlist, in Reservations, and room status, in Housekeeping, are part of it,
and it's for the front desk clerk and the housekeeper.

- **It's work, not a part of the product.** A [feature](feature.md) is a part
  of the product for good, and owns its capabilities. An initiative groups capabilities for a
  stretch of work. Once that work no longer needs seeing on its own, its
  capabilities drop the link and the doc is deleted.
- **[Capabilities](capability.md) link to it**, and it links to the
  [personas](persona.md) its work is for. It lists no capabilities. Its
  features, areas, rules, gaps and [problems](problem.md) are worked out from
  its capabilities: a problem is in it when one of its capabilities solves
  it.
- **It cuts across features and [areas](area.md)**, so like a persona it's
  written once for the whole product. A capability or persona can be part of
  several initiatives, or none.
- **Docqet shows everything, or one initiative.** Showing one, only its
  capabilities and personas show, and every number counts only those, the way
  showing only some projects does. A persona's readiness there counts only the
  initiative's capabilities that serve them. A capability can serve a persona
  who isn't part of the initiative, and that persona doesn't show in it. A
  capability or persona in no initiative shows only when everything does.
- **It has no [stability level](stability-level.md)**, the same as a feature,
  and no gaps, tradeoffs or open decisions. It has a
  [maturity](maturity.md), an
  [exposure](exposure.md) and a
  [readiness](readiness.md), worked out from its
  capabilities.
- **It doesn't say when.** It has no dates and no order, just as a
  [gap](gap.md) doesn't say when it'll be closed.
- **It isn't a flag.** Being behind a flag is what Prototype and Alpha mean.
  An initiative says what body of work a capability belongs to. The two often
  line up, but neither implies the other.

## How it's written

An initiative is a doc whose `docqet` is `initiative`. Its frontmatter, in
order, is `docqet`, `id`, `name`, `description`, which say what the work is,
and `for`, optional, the personas its work is for, so showing it shows
only its people. Its body, optional, can say more, such as what's in it and
why. The same ID in two projects is one initiative.
[`busy-season.md`](../../examples/hotel-bookings/docqet/initiatives/busy-season.md):

```markdown
---
docqet: initiative
id: busy-season
name: Busy season
description: >-
  Handling full nights: groups, a waitlist, and turning rooms over faster.
for: [persona:front-desk-clerk, persona:housekeeper]
---
```

A capability says which initiatives it's part of with `included-in`:

```yaml
included-in: [initiative:busy-season]
```
