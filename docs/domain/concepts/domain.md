# Domain

A part of the business the software serves, with a language of its own: within
a domain, each word means one thing. It's a business area and a bounded
context, in domain-driven design's terms, as one.

## Details

Guest stays is a domain: "looking after guests from their booking to their
check-out". Billing is another: "charging guests for their stays and getting
paid". Booking means a guest's hold on one room in Guest stays, and what a
guest is charged for a stay in Billing. Both are right, each in its domain.

- **It's named for the part of the business it serves**, not for an app, a
  service or a team: Guest stays, not "the guest app" or "the front-office
  suite".
- **It doesn't follow how the software is packaged.** Several
  [projects](project.md) can work in one domain, and one project can work in
  several. Repackaging the software, or reorganizing the teams that build it,
  never creates, removes or splits a domain.
- **Every product doc but a persona or an initiative is written in exactly
  one domain**: the one whose words it uses, which it names in its
  `domain` field.
- **Domains are shared by ID.** Projects that work in the same part of the
  business use the same domain ID, and their contributions to it are one
  domain.
- **Features and capabilities can span domains.** Front desk is in Guest
  stays, where clerks check guests in and out, and in Billing, where the bill
  is settled at check-out. Each domain's part is its own, and the feature is
  one.
- **Rules and concepts are the domain's own.** The same ID in two domains is
  two definitions, shown side by side, and that's not a problem. A capability
  uses its own domain's [rules](rule.md) and [concepts](concept.md), unless it
  names another domain's, or only one domain defines that ID.
- **It holds open decisions about the part of the business as a whole.** See
  [open decision](open-decision.md).
- **It provides value only through its features.** A domain with no features
  is a part of the business the software doesn't serve yet.
- **It's one level.** A domain holds its parts of features, never other
  domains.
- **It has no stability level.** It has a [maturity](maturity.md), worked out
  from its parts of features, and a [readiness](readiness.md), from every
  capability with a part in it.

## In the spec

A domain is a doc whose `docket` is `domain`, and whose `id` is the domain's
ID. Everything written in its words names that ID in its `domain` field, so
its files can be anywhere. The recommended layout keeps them together, in a
folder of the domain's own:

```text
docket/domains/guest-stays/
├── domain.md
├── features/reservations.md
├── capabilities/room-booking.md
├── rules/booking/no-double-booking.md
└── concepts/booking.md
```

Its [`domain.md`](../../../spec/examples/hotel-bookings/docket/domains/guest-stays/domain.md)
gives its name, description and open decisions in frontmatter, and anything more
worth saying about it in its body:

```markdown
---
docket: domain
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

## Not to be confused with

- [Project](project.md): a repository. A project works in domains, but says
  nothing about what words mean.
- [Feature](feature.md): a job the product does. A domain is the part of the
  business whose language the job is described in.
