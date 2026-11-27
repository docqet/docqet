---
docqet: concept
id: band
domain: understanding
name: Band
description: >-
  The quarter of the [maturity](maturity.md) scale a feature, domain or project
  falls in, named for the level it's closest to.
confused-with:
  - concept: "concept:stability-level@authoring"
    summary: >-
      a band is named for a level, but a feature in the Promising band can still have capabilities at Prototype.
---

A [maturity](maturity.md) sits in one of four bands, a quarter of the scale
each, named for a level and shown in that level's color. Each band says how
far along a feature, domain or project is as a whole, and what to expect from
it:

| Band             | From | Named for | What it tells you                                                                                      |
| ---------------- | ---- | --------- | ------------------------------------------------------------------------------------------------------ |
| **Experimental** | 0%   | Prototype | Early days. Much of it is still being explored, and could change completely or be dropped.             |
| **Emerging**     | 25%  | Alpha     | Taking shape. Some of it works, but much is still changing often, so expect bugs and breaking changes. |
| **Promising**    | 50%  | Beta      | Firming up. Enough of it is settled or stable for real use, while other parts are still changing.      |
| **Established**  | 75%  | GA        | Well established. Most of it is stable and supported, while any newer parts settle in.                 |

A maturity is in the band whose lower bound it has reached, once it's
rounded to a whole percentage: 25% is Emerging, and so is 24.5%, which rounds
to 25%.

## About the whole, not each part

A band tells you what to expect from the whole, never from every part: a few
established capabilities can carry a feature into a higher band.

Each level's maturity score sits inside its own band, so a feature whose
capabilities are all at one level lands in that level's band. A feature with
every capability at Alpha is 35%, Emerging, and never shows as more mature
than it is.

[Readiness](readiness.md) and [exposure](exposure.md) fall in quarters of
their own, with names of their own, so neither is mistaken for maturity.

## How it's written

Nothing is written for it, and it isn't in
[state](../../authoring/concepts/state.md): readers work it out beside each
maturity. Reservations, at 42%, is Emerging.
