---
docqet: concept
id: domain
domain: authoring
name: Domain
description: >-
  A part of the business the software serves, with a language of its own: within
  a domain, each word means one thing. It's a business area and a bounded
  context, in domain-driven design's terms, as one.
confused-with:
  - concept: "concept:project"
    summary: >-
      a source of state, such as a repository or a package in one. A project works in domains, but says nothing about what words mean.
  - concept: "concept:feature"
    summary: >-
      a part of what the product offers. A domain is the part of the business whose language it's described in.
---

Guest stays is a domain: "looking after guests from their booking to their
check-out". Billing is another: "charging guests for their stays and getting
paid". Booking is "a guest's hold on one room for a stay" in Guest stays, and
"what a guest is charged for a stay" in Billing. Both are right, each in its
domain.

- **It's named for the part of the business it serves**, not for an app, a
  service or a team: Guest stays, not "the guest app" or "the front-office
  suite".
- **It doesn't follow how the software is packaged.** Several
  [projects](project.md) can work in one domain, and one project can work in
  several. A project works in as many domains as it has domain docs.
  Repackaging the software, or reorganizing the teams that build it, never
  creates, removes or splits a domain.
- **Every product doc but an initiative is written in exactly one domain**: the one whose words it uses, which it names in its `domain`
  field. Changing a doc's `domain` moves it to that domain, wherever its file
  is. Personas and problems, in the problem space, are in no domain, and
  neither are mechanisms and components.
- **Domains are shared by ID.** Projects that work in the same part of the
  business use the same domain ID, and their contributions to it are one
  domain.
- **Rules and concepts are the domain's own.** The same ID in two domains is
  two definitions, shown side by side, and that's not a mistake. A link to a
  [rule](rule.md) or [concept](concept.md) means its own domain's, unless it
  names another domain's (see
  [which rule or concept a link means](link.md#which-rule-or-concept-a-link-means)).
- **It holds open decisions about the part of the business as a whole.** See
  [open decision](open-decision.md).
- **It provides value only through its features.** A domain with no features
  is a part of the business the software doesn't serve yet.
- **It's one level.** A domain holds its parts of features, never other
  domains.
- **It has no stability level.** It has a [maturity](../../understanding/concepts/maturity.md), worked out
  from its parts of features, and a [readiness](../../understanding/concepts/readiness.md), from every
  capability with a part in it.

## How it's written

A domain is a doc whose `docqet` is `domain`, and whose `id` is the domain's
ID. Everything written in its words names that ID in its `domain` field, so
its files can be anywhere. The recommended layout keeps them together, in a
folder of the domain's own:

```text
docqet/domains/guest-stays/
├── domain.md
├── features/reservations.md
├── capabilities/room-booking.md
├── rules/booking/no-double-booking.md
└── concepts/booking.md
```

Its [`domain.md`](../../../../examples/hotel-bookings/docqet/domains/guest-stays/domain.md)
gives its name, description and open decisions in frontmatter, and anything more
worth saying about it in its body:

```markdown
---
docqet: domain
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

## Putting contributions together

Every project contributes what it knows to one picture of the
[product](../../understanding/concepts/product.md). How a doc is put together
with others of the same ID depends on its type:

| Type | Is one across | The same ID elsewhere |
| --- | --- | --- |
| domain, feature, capability, persona, problem, initiative, mechanism, component | everything | A contribution to the same one. Its links are put together, and its name and description should match. |
| rule, concept | its domain | Another definition, shown beside this one. Within the same domain, it's a contribution, as above. |

- **Features and capabilities span domains.** A feature or capability written
  in several domains is in each of them. Each domain's part is the
  capabilities that domain builds. Front desk is in Guest stays, where clerks
  check guests in and out, and in Billing, where the bill is settled at
  check-out, and the feature is one.
- **Links are combined**: a feature's capabilities and tradeoffs, a
  capability's problems, initiatives, rules, concepts, gaps and tradeoffs, a
  problem's personas, a
  mechanism's or component's capabilities, outcomes, gaps and tradeoffs, and
  everything's evidence. Each contribution's order is kept, in the order the
  projects are read.
- **What a contribution says is its own**: its body, and its frontmatter
  fields that aren't links, such as `decisions` or a rule's `why`. Readers
  show each, labelled with its project and domain. Its name and description,
  a persona's role and title, and a problem's cost, should match the others'. Where they don't,
  that's a [contradiction](../../understanding/concepts/contradiction.md).
- **A capability's `stability` is per domain.** Each contribution declares the
  level of its own part. Where they differ, the capability's level in short is
  the lowest, and readers show each.
