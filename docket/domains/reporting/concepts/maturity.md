---
docket: concept
id: maturity
domain: reporting
name: Maturity
description: >-
  How far along a feature, a domain, a project, an initiative, or what serves a
  persona is: how much of the work under way is stable and supported. It's a percentage, derived from capabilities'
  [stability levels](../../authoring/concepts/stability-level.md), and nobody writes it down. It's for
  seeing where the work is heading. How ready people can rely on it being,
  with gaps taken into account, is [readiness](readiness.md).
confused-with:
  - concept: "concept:stability-level@authoring"
    summary: >-
      how much you can depend on one capability. Maturity is about the whole.
  - concept: "concept:exposure"
    summary: >-
      what the gaps open on the same capabilities put at stake. It's to risk what maturity is to stability.
  - concept: "concept:readiness"
    summary: >-
      maturity less the same capabilities' exposure, with what's left.
---

Maturity says how close the work under way is to being stable and supported.
Higher means more of it is stable and supported: 75% or more, Established, is
healthy for most businesses. Each maturity falls in a [band](band.md), which
says what to expect from it.

## What it tells you

- **It's about the whole, not each part.** It's an indication, not a verdict.
  Before depending on something, check its [readiness](readiness.md).
- **New work shows on its feature.** Starting a new capability lowers that
  feature's maturity, without anything having got worse. An established
  domain moves only a little, because what's already stable counts most.
- **It isn't a finish line, and 100% isn't the goal.** 100% means everything
  under way is GA. Software that keeps growing usually has newer parts
  settling in, and stays Established as it does.

## How it's worked out

Each capability has a score for how far along it is, and a weight for how
much it counts:

| Level     | Score | Weight |
| --------- | ----- | ------ |
| Prototype | 15%   | 2      |
| Alpha     | 35%   | 3      |
| Beta      | 60%   | 4      |
| GA        | 100%  | 6      |

The more stable a capability is, the more it counts: one GA capability counts
as much as 1.5 Betas, 2 Alphas or 3 Prototypes. That's enough that dependable
work lifts a feature, but not so much that a little of it carries a feature
that's mostly early work. Drafts are left out, since no work has started on
them.

### A feature

A feature's maturity is the weighted average of its capabilities' scores,
rounded to a whole percentage. Each capability counts once, at its level in
short: the lowest across the domains that build it. Each score sits inside
its level's band, so a feature never shows as more mature than it is. A
feature with no capabilities but drafts has no maturity.

Reservations has room booking at Beta, cancellations at Alpha, group bookings
at Prototype, and the waitlist as a draft:

```text
(60 × 4 + 35 × 3 + 15 × 2) ÷ (4 + 3 + 2) = 375 ÷ 9 ≈ 42%
```

That's Emerging. Without group bookings it would be 345 ÷ 7 ≈ 49%. Starting
group bookings lowered it, but nothing got worse: something new started.

### A domain

A domain's maturity is the weighted average of its parts of features'
maturities, worked out the same way:

- **Its part of a feature** is the capabilities in that feature that the
  domain builds, at their levels in that domain. Its maturity is worked out
  as a feature's is, from those levels alone, so a capability that spans
  domains counts once in each, at that domain's level.
- **Each part counts as a capability in its band would**, so an Established
  part counts for a lot and an Experimental one for little, however many
  capabilities it has.
- **Parts with no maturity don't count.**
- **A domain with no part that has a maturity has none.**

In the hotel example, Guest stays has Reservations (42%, Emerging), which
weighs 3, and its part of Front desk (84%, Established), which weighs 6:

```text
(42 × 3 + 84 × 6) ÷ (3 + 6) = 630 ÷ 9 = 70%
```

That's Promising. Property has only Housekeeping, so it's 15%, Experimental.

Front desk's own maturity, as a feature, counts check-out once, at its level
in short. Shown with Hotel Billing, Front desk has check-in at Beta, and
check-out at GA in Guest stays but Alpha in Billing, so Alpha in short:

```text
(60 × 4 + 35 × 3) ÷ (4 + 3) = 345 ÷ 7 ≈ 49%
```

That's Emerging.

### A project or a product

A project's maturity is worked out the same way from its features, so a
capability that spans domains still counts once. Hotel Bookings has
Reservations (42%), Front desk (84%) and Housekeeping (15%):

```text
(42 × 3 + 84 × 6 + 15 × 2) ÷ (3 + 6 + 2) = 660 ÷ 11 = 60%
```

That's Promising. Several projects shown together, such as a
[product's](product.md), have a maturity too, worked out from all their
features the same way, as if they were one project. Showing only some
projects works out each feature's and domain's maturity from the capabilities
those projects declare.

### A persona or an initiative

What serves a [persona](../../authoring/concepts/persona.md) has a maturity
worked out as a feature's is, from the capabilities that list them, each
counted once at its level in short. An
[initiative's](../../authoring/concepts/initiative.md) is worked out the same
way, from the capabilities that list it.

Showing one initiative narrows every capability showing to its own, the way
showing only some projects does, so every maturity counts only those.

## How it's written

Nothing is written for it in a doc, and it isn't in
[state](../../authoring/concepts/state.md). Readers work out maturity and
bands, since a capability's level in short needs every project that builds
part of it.
