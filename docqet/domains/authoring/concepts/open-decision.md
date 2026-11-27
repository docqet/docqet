---
docqet: concept
id: open-decision
domain: authoring
name: Open decision
description: >-
  A question about what's intended that hasn't been settled, recorded so it
  isn't lost or quietly decided in code, and rated, when its answer could
  change what people rely on, by how much that could cost them.
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

## What's at stake

A question doesn't happen to anyone, but the change its answer may bring
does. People rely on what the software does now, and an answer that changes
it changes what they relied on. A decision says how much that could cost
them with the same three ratings a [gap](gap.md#whats-at-stake) has,
`impact`, `likelihood` and `reach`, and has a
[risk](../../reporting/concepts/risk.md) worked out from them the same way.

The ratings are optional, but all or none. A decision with none has no
risk: answering it changes nothing anyone relies on, such as what the
format is called. A decision with only one or two is
`invalid-frontmatter`.

### Read about the change, not the question

The scales are a gap's, with the same values, but each is read about what
the answer could change rather than about something biting:

| Rating         | On a gap                                       | On a decision                                                                |
| -------------- | ---------------------------------------------- | ---------------------------------------------------------------------------- |
| **Impact**     | How bad it is for those it reaches, if it bit. | How bad it is for those it reaches, if the answer changes what they rely on. |
| **Likelihood** | How likely it is to bite within a year.        | How likely it is that the answer changes what the software does now.         |
| **Reach**      | How many of the people served it would reach.  | How many of the people served the change would reach.                        |

**Impact** asks a gap's four questions, in order, of the change:

1. Could the change leave something wrong that can't be fully put right, or
   that someone acted on without knowing, at a cost, such as data kept in a
   shape the answer rules out, or money worked out on terms it reverses?
   It's `damaging`.
2. Could it stop someone getting done what they relied on it for, until
   something else is built? It's `blocking`.
3. Would people adapt, with extra time, a new step or a new way of working,
   while what they get still comes out right? It's `inconvenient`.
4. Otherwise, nothing anyone relies on changes, and it's `negligible`. A
   decision that would be `negligible`, `unlikely` and `few` is usually one
   with no ratings at all.

**Likelihood** has no year: it's how likely the answer is to mean changing
what the software does, whenever it's given.

| Likelihood | The test                                                                           |
| ---------- | ---------------------------------------------------------------------------------- |
| `certain`  | Whatever the answer, what it does now changes, such as a placeholder or a stopgap. |
| `expected` | You'd bet the answer changes what it does now.                                     |
| `possible` | It could go either way.                                                            |
| `unlikely` | You'd expect the answer to confirm what it does now.                               |

**Reach** is a gap's, of the people the change would reach.

Like a gap's, the ratings are made as if people relied on the capability,
never lowered for its level, which risk weighs already. A decision on a
Prototype is rated as it would be on GA, and scores far lower: questions are
what a Prototype is for, while GA promises that what people rely on stays as
it is. One on a draft scores 0, since a draft weighs 0 and nobody relies on
it yet.

### Where it counts

A decision is scored on every capability it's about:

| Declared on                 | Counts on                          |
| --------------------------- | ---------------------------------- |
| [Capability](capability.md) | Itself                             |
| [Feature](feature.md)       | Its capabilities                   |
| [Domain](domain.md)         | Every capability with a part in it |
| [Component](component.md)   | The capabilities relying on it     |
| [Mechanism](mechanism.md)   | Every capability it applies to     |

On each, it breaks a claim, as a gap does, where it affects an outcome that
capability's level expects: whether the outcome is met isn't settled, so
people relying on it are relying on something nobody can vouch for yet.

A rated decision counts in [exposure](../../reporting/concepts/exposure.md)
beside gaps, so answering it can be one of the
[improvements](../../reporting/capabilities/improvements.md) that would
make something more ready.

## What it affects

What a decision [affects](gap.md#affects) is what's waiting on its answer.
It's there to show the relationship, and never gives the decision risk: a
decision's risk comes from its own ratings alone, and what it affects keeps
its own.

- **A gap** waits on it: it can't be closed until it's answered. A gap
  that's really an unsettled question is written as both: the consequence
  as the gap, rated as what the software does while it's open, and the
  question as the decision, rated as what its answer could change.
- **A [tradeoff](tradeoff.md)** is reopened by it: the choice is in question
  again, and stays as it is, the current one, until the decision is answered.
- **A [stability rubric](rubric.md) outcome** is open: whether to meet
  it, or whether it applies, isn't settled, so it's neither claimed nor
  short. A rated decision breaks a claim there, as above.

A decision affects nothing else: the doc it's on is already what it's about.

## Lifecycle

Open → Answered

Every decision written down is open, and shows with the gaps as what's
open. Once it's answered, it's deleted, and git has its history. Its answer
is written where it belongs, as whatever it became, written as any other
is, with no link back to the question.

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
it's on, with its `question` and, optionally, a `topic` of a few words, what
it `affects`, and its `impact`, `likelihood` and `reach`, all three or none.
On the
[Guest stays domain](../../../../examples/hotel-bookings/docqet/domains/guest-stays/domain.md):

```yaml
decisions:
  - topic: Early arrivals
    question: >-
      When a guest arrives before the room's usual check-in time, does
      their stay start that day, or is the night before part of it?
```

On the [waitlist](../../../../examples/hotel-bookings/docqet/domains/guest-stays/capabilities/waitlist.md),
a draft capability:

```yaml
decisions:
  - topic: Who goes first
    question: Whoever asked first, or whoever's stay fits the free nights best?
```

On [refunds](../../../../examples/hotel-billing/docqet/domains/billing/capabilities/refunds.md),
another draft:

```yaml
decisions:
  - topic: Where the money goes
    question: >-
      Always back to the card it came from, or to whichever card the guest
      has with them?
```

On [deployment](../../../../examples/hotel-bookings/docqet/mechanisms/deployment.md),
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

None of those is rated, so none has risk. A rated one says what its answer
could change for the people relying on what's there now. On a group
bookings capability at Beta, where clerks book a block of rooms on one bill:

```yaml
decisions:
  - topic: One bill or one each
    question: >-
      Does a group stay on one bill paid by its organiser, or does each guest
      pay for their own room?
    impact: damaging
    likelihood: expected
    reach: some
```

It's one bill today. If each guest pays, bills organisers have already
settled were worked out on terms the answer reverses, so it's `damaging`.
Organisers keep asking for it, so you'd bet on the change: `expected`. Only
groups' guests are reached, so it's `some`. On Beta, it scores
4 × ¾ × ½ × 4 = 6, so 38, `tolerable`: OK to leave for now, but worth
answering, and answering it would raise readiness wherever group bookings
counts. The same question on a Prototype scores 3, so 14, `acceptable`.

It's in frontmatter so readers can find, count and show it on every persona,
initiative, feature and domain it touches. A question written in a doc's body
isn't counted as one.
