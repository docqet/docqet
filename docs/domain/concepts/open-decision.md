# Open decision

A question about what's intended that hasn't been settled, recorded so it
isn't lost or quietly decided in code.

## Details

It goes on the doc it's about: a [domain](domain.md), [feature](feature.md),
[capability](capability.md), [mechanism](mechanism.md) or
[component](component.md). Does an early arrival's stay start that day is
about Guest stays; who goes first on the waitlist is about the waitlist.
Questions that building something is meant to answer, such as a prototype's,
are open decisions too.

A [rule](rule.md) never holds one: a rule is decided once its doc exists.
Something the business hasn't committed to yet is an open decision, not a
rule.

Open decisions on a capability show on every persona it serves, and on its
feature and domain, but they're declared once.

A question doesn't happen to anyone, so a decision has no impact and no
[risk](risk.md). What does happen is whatever the software does while it's
open, and that's a [gap](gap.md), rated on its own. A gap that's really an
unsettled question is written as both: the consequence as the gap, and the
question as the decision.

## Lifecycle

Open → Answered

Once it's answered, it's deleted, and git has its history. Its answer is
written where it belongs, as whatever it became, written as any other is,
with no link back to the question. Every decision written down is open, and
counts as what's left.

One answer can become several things, such as a capability and a gap for
what its first version leaves out. What it can become stays on the decision's
side:

- **On a domain, feature or capability**: rules, concepts, capabilities,
  features, and gaps or tradeoffs on any of those.
- **On a mechanism or component**: mechanisms, components, and their gaps or
  tradeoffs.

Product docs never link to technical docs, and a question whose answer is a
mechanism or component is about how it's built, so it goes on a mechanism or
component in the first place.

## In the spec

An open decision is an item in the `decisions` frontmatter field of the doc
it's on, with its `question` and, optionally, a `topic` of a few words. On the
[Guest stays domain](../../../spec/examples/hotel-bookings/docs/product/domains/guest-stays/domain.md):

```yaml
decisions:
  - topic: Early arrivals
    question: >-
      When a guest arrives before the room's usual check-in time, does
      their stay start that day, or is the night before part of it?
```

On the [waitlist](../../../spec/examples/hotel-bookings/docs/product/domains/guest-stays/capabilities/waitlist.md),
a draft capability:

```yaml
decisions:
  - topic: Who goes first
    question: Whoever asked first, or whoever's stay fits the free nights best?
```

It's in frontmatter so readers can find, count and show it on every persona,
feature and domain it touches. A question written in a doc's body isn't
counted as one.

## Not to be confused with

- [Gap](gap.md): what's intended is settled, and the software doesn't do it
  yet.
- [Rule](rule.md): a decision already made.
