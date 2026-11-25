# Initiative

A named body of work the product is taking on, so it can be seen on its own,
such as the MVP, or what comes after it. Capabilities and personas say which
initiatives they're part of, so Docket can show the whole product, or one
initiative alone.

## Details

Busy season is an initiative in Hotel Bookings: "handling full nights:
groups, a waitlist, and turning rooms over faster". Group bookings and the
waitlist, in Reservations, and room status, in Housekeeping, are part of it,
and it's for the front desk clerk and the housekeeper.

- **It's work, not a job.** A [feature](feature.md) is a job the product does
  for good, and owns its capabilities. An initiative groups capabilities for a
  stretch of work. Once that work no longer needs seeing on its own, its
  capabilities and personas drop the link and the doc is deleted.
- **[Capabilities](capability.md) link to it**, and so do the
  [personas](persona.md) its work is for. Nobody lists them on the
  initiative. Its features, domains, rules and gaps are worked out from its
  capabilities.
- **It cuts across features and [domains](domain.md)**, and a capability or
  persona can be part of several initiatives. One in none shows only when
  everything does.
- **Docket shows everything, or one initiative.** Showing one, only its
  capabilities and personas show, and every number counts only those. A
  persona's readiness there counts only the initiative's capabilities that
  serve them. A capability can serve a persona who isn't part of the
  initiative, and that persona doesn't show in it.
- **It has no [stability level](stability-level.md)**, the same as a feature.
  It has a [maturity](maturity.md), an [exposure](exposure.md) and a
  [readiness](readiness.md), worked out from its capabilities.
- **It doesn't say when.** It has no dates and no order, just as a
  [gap](gap.md) doesn't say when it'll be closed.
- **It isn't a flag.** Being behind a flag is what Prototype and Alpha mean.
  An initiative says what body of work a capability belongs to. The two often
  line up, but neither implies the other.

## In the spec

An initiative is a doc in `docs/product/initiatives/`, outside any domain,
like a persona. It has an `id`, a `name` and a `description`, and its body
can say more. The same ID in two projects is one initiative.
[`busy-season.md`](../../../spec/examples/hotel-bookings/docs/product/initiatives/busy-season.md):

```markdown
---
id: busy-season
name: Busy season
description: >-
  Handling full nights: groups, a waitlist, and turning rooms over faster.
---
```

A capability or persona links it with `initiatives: [initiative:busy-season]`.

## Not to be confused with

- Feature: a lasting job that a capability is in at most one of.
- Domain: a part of the business, with its own language.
- Stability level: how much a capability can be counted on.
