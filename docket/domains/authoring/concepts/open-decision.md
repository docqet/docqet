---
docket: concept
id: open-decision
domain: authoring
name: Open decision
description: >-
  A question about what's intended that hasn't been settled, recorded so it
  isn't lost or quietly decided in code.
confused-with:
  - concept: "concept:gap"
    summary: >-
      what's intended is settled, and the software doesn't do it yet.
  - concept: "concept:rule"
    summary: >-
      a decision already made.
---

A question goes on the doc it's about: a [domain](domain.md),
[feature](feature.md), [capability](capability.md),
[mechanism](mechanism.md) or [component](component.md). Does an early
arrival's stay start that day is about Guest stays; who goes first on the
waitlist is about the waitlist. Questions that building something is meant to
answer, such as a prototype's, are open decisions too.

A [rule](rule.md) never holds one: a rule is decided once its doc exists.
Something the business hasn't committed to yet is an open decision, not a
rule.

Open decisions on a capability show on every persona it serves, every
initiative it's part of, and on its feature and domain, but they're declared
once.

## No risk of its own

A question doesn't happen to anyone, so a decision has no impact and no
[risk](../../reporting/concepts/risk.md). What does happen is whatever the
software does while it's open, and that's a [gap](gap.md), rated on its own.
A gap that's really an unsettled question is written as both: the
consequence as the gap, and the question as the decision, which affects the
gap.

## What it affects

What a decision [affects](gap.md#affects) is what's waiting on its answer:

- **A gap** waits on it: it can't be closed until it's answered. The gap
  keeps its own risk, and readers show the decision with the risk of the
  riskiest gap waiting on it, so the questions with most at stake can be
  asked first.
- **A [tradeoff](tradeoff.md)** is reopened by it: the choice is in question
  again, and stays as it is, the current one, until the decision is answered.
- **An [expectations](expectations.md) outcome** is open: whether to meet
  it, or whether it applies, isn't settled, so it's neither claimed nor
  short.

A decision affects nothing else: the doc it's on is already what it's about.

## Lifecycle

Open → Answered

Every decision written down is open, and counts as what's left. Once it's
answered, it's deleted, and git has its history. Its answer is written where
it belongs, as whatever it became, written as any other is, with no link
back to the question.

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

## How it's written

An open decision is an item in the `decisions` frontmatter field of the doc
it's on, with its `question` and, optionally, a `topic` of a few words and
what it `affects`. On the
[Guest stays domain](../../../../examples/hotel-bookings/docket/domains/guest-stays/domain.md):

```yaml
decisions:
  - topic: Early arrivals
    question: >-
      When a guest arrives before the room's usual check-in time, does
      their stay start that day, or is the night before part of it?
```

On the [waitlist](../../../../examples/hotel-bookings/docket/domains/guest-stays/capabilities/waitlist.md),
a draft capability:

```yaml
decisions:
  - topic: Who goes first
    question: Whoever asked first, or whoever's stay fits the free nights best?
```

On [refunds](../../../../examples/hotel-billing/docket/domains/billing/capabilities/refunds.md),
another draft:

```yaml
decisions:
  - topic: Where the money goes
    question: >-
      Always back to the card it came from, or to whichever card the guest
      has with them?
```

On [deployment](../../../../examples/hotel-bookings/docket/mechanisms/deployment.md),
a question that a gap waits on, and that leaves an outcome open:

```yaml
decisions:
  - topic: Undoing a schema change
    question: >-
      Is restoring the night before's database enough to undo a release that
      changed the schema, or does every migration need a down step?
    affects:
      - outcome:reliability/ga/recovery
      - mechanism:deployment#migrations-only-go-forward
```

If restoring is enough, the gap becomes a tradeoff that affects the outcome.
If not, the gap stays, and the decision is deleted.

It's in frontmatter so readers can find, count and show it on every persona,
initiative, feature and domain it touches. A question written in a doc's body
isn't counted as one.
