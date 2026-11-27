---
docqet: concept
id: area
name: Area
description: >-
  A part of the product that groups the features belonging together, such as
  Guest stays or Billing. It's a plain grouping: it has no language of its
  own, and nothing in it is named apart from the rest of the product.
confused-with:
  - concept: "concept:feature"
    summary: >-
      a part of what the product offers, that someone comes to and would name. An area groups features, and offers nothing of its own.
  - concept: "concept:project"
    summary: >-
      a source of state, such as a repository or a package in one. An area can have features from several projects.
  - term: "A domain, or bounded context"
    summary: >-
      a part of the business with a language of its own, in domain-driven design's terms. Docqet keeps no language boundaries: a word that means two things is two concepts.
---

Guest stays is an area: "looking after guests from their booking to their
check-out", with Reservations and Front desk in it. Billing is another:
"charging guests for their stays, and getting paid", with Guest bills and
Payments.

- **It's named for the part of the business it serves**, not for an app, a
  service or a team: Guest stays, not "the guest app" or "the front-office
  suite".
- **It doesn't follow how the software is packaged.** Several
  [projects](project.md) can have features in one area, and one project can
  have features in several. Front desk is in Guest stays, with check-in from
  Hotel Bookings and settling the bill from Hotel Billing. Repackaging the
  software, or reorganizing the teams that build it, never creates, removes
  or splits an area.
- **Features name it.** A [feature](feature.md) says which area it's in, if
  any, and the area lists nothing: its features are worked out. A feature in
  no area is allowed, and shows on its own.
- **It's one level.** An area holds features, never other areas.
- **It has no language of its own.** [Rules](rule.md) and
  [concepts](concept.md) aren't in an area, and each ID names one across the
  product. A word that means two things in two parts of the business is two
  concepts with different IDs, each saying it's easily confused with the
  other: the booking app's booking, "a guest's hold on one room for a stay",
  and billing's billed stay, "what a guest is charged for a stay".
- **It holds open decisions about that part of the business as a whole.**
  See [open decision](open-decision.md).
- **It provides value only through its features.** An area with no features
  is a part of the business the software doesn't serve yet.
- **It has no stability level.** It has a [maturity](maturity.md), worked
  out from its features, and a [readiness](readiness.md), from their
  capabilities.

## How it's written

An area is a doc whose `docqet` is `area`. Its frontmatter, in order, is
`docqet`, `id`, `name`, `description` and `decisions`. Its body, if it has
one, is anything more about the part of the business.
[`guest-stays.md`](../../examples/hotel-bookings/docqet/areas/guest-stays.md):

```markdown
---
docqet: area
id: guest-stays
name: Guest stays
description: Looking after guests from their booking to their check-out.
decisions:
  - topic: Early arrivals
    question: >-
      When a guest arrives before the room's usual check-in time, does
      their stay start that day, or is the night before part of it?
---
```

A feature names it with `within: area:guest-stays`. Hotel Billing writes the
same doc, since its front desk is in Guest stays too, and the two are one
area.
