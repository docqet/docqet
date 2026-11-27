---
docqet: concept
id: stability-level
domain: authoring
name: Stability level
description: >-
  How much people can depend on a [capability](capability.md) right now. It's
  declared by the people building it, and only changes when someone decides to
  promote or demote it.
confused-with:
  - concept: "concept:maturity@understanding"
    summary: >-
      how far along a whole feature, domain or project is, worked out from its capabilities' levels.
  - concept: "concept:readiness@understanding"
    summary: >-
      how ready people can rely on something being, worked out from levels and gaps.
  - term: "How good the work is"
    summary: >-
      a level says how much people can depend on it.
---

Every capability that's been started is at one of four stability levels. The
level says how stable the work is right now, so people know what they can
rely on before they rely on it.

| Level     | How stable | What it means |
| --------- | ---------- | ------------- |
| Prototype | Exploring  | Explores an idea so we can choose a direction. Its data may be fake, and it may change completely or be thrown away. |
| Alpha     | Developing | Works, but is still taking shape. Expect frequent breaking changes and bugs. |
| Beta      | Refining   | Settled enough for real use. Breaking changes and bugs are occasional. We aim to announce breaking changes ahead of time, but can't always. |
| GA        | Stable     | Generally available and stable. It keeps working as it does today. Breaking changes are rare, announced ahead of time, and come with time to move over. |

What each level generally expects, quality by quality, is in the
[stability rubric](rubric.md).

- **A level describes how much you can depend on the work, not how good it
  is.** A prototype that answers its question quickly is good work.
- **Stability isn't perfection.** GA software still has bugs, and it can
  still have known [gaps](gap.md).
- **Beta is the bar for real use.** Reaching each next level is one of the
  improvements [readiness](../../understanding/concepts/readiness.md) lists.
- **Only capabilities have one.** A feature's, domain's, project's,
  persona's and initiative's
  [maturity](../../understanding/concepts/maturity.md) and
  [readiness](../../understanding/concepts/readiness.md) are worked out from
  their capabilities' levels.
- **A capability has one in each domain that builds part of it.** Where they
  differ, its level in short is the lowest, since that's what you can count
  on everywhere.

## Drafts

A capability declared but not started yet is a **draft**, such as the
[waitlist](../../../../examples/hotel-bookings/docqet/domains/guest-stays/capabilities/waitlist.md)
or
[refunds](../../../../examples/hotel-billing/docqet/domains/billing/capabilities/refunds.md).
It isn't a level: it claims nothing, in the stability rubric or anywhere else,
and counts toward no maturity or readiness. Readers show it as the word
Draft, with no level's mark.

## Lifecycle

Draft → Prototype → Alpha → Beta → GA

A draft becomes a Prototype when work starts on it. Every other move is a
promotion or demotion someone decides on, never something Docqet works out.

## How it's written

`stability` in a capability's frontmatter, required, as `draft`,
`prototype`, `alpha`, `beta` or `ga`, which readers show as Draft,
Prototype, Alpha, Beta and GA:

```yaml
stability: beta
```

A capability that spans domains declares its level in each. Hotel Bookings'
[check-out](../../../../examples/hotel-bookings/docqet/domains/guest-stays/capabilities/check-out.md),
in Guest stays, says `stability: ga`, and Hotel Billing's
[check-out](../../../../examples/hotel-billing/docqet/domains/billing/capabilities/check-out.md),
in Billing, says `stability: alpha`, so check-out is Alpha in short.
