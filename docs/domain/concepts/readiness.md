# Readiness

How ready the software is for a [persona](persona.md): a percentage worked out
from the maturity of what they need, which is every capability that serves
them.

## Details

It's worked out as a feature's [maturity](maturity.md) is, from those
capabilities' levels, drafts left out. A feature has a readiness for each
persona it serves too, from just its capabilities that serve them. Readiness
is about the people, so it never counts toward a domain's or project's
maturity. A persona no capability lists has no readiness.

It has a scale of its own, so it's never mistaken for maturity:

| Readiness     | From | What it tells you                                                       |
| ------------- | ---- | ----------------------------------------------------------------------- |
| Not ready yet | 0%   | Most of what they need is still being explored.                         |
| Partly ready  | 25%  | Some of it works, but much of what they need is still taking shape.     |
| Mostly ready  | 50%  | Enough is settled or stable for them to rely on day to day.             |
| Ready         | 75%  | What they need is mostly stable and supported.                          |

The spec has [how it's worked out](../../../spec/README.md#readiness).

## In the spec

Nothing is written for it in a doc. In Hotel Bookings, the front desk clerk
has room booking and check-in at Beta, cancellations at Alpha, check-out at
GA, group bookings and room status at Prototype, and the waitlist as a draft:

```text
(60 × 4 × 2 + 35 × 3 + 100 × 6 + 15 × 2 × 2) ÷ (4 × 2 + 3 + 6 + 2 × 2) = 1245 ÷ 21 ≈ 59%
```

The indexer writes it in the persona's entry in [state](state.md):

```json
{ "id": "front-desk-clerk", "readiness": 59 }
```

That's Mostly ready.

## Not to be confused with

- [Maturity](maturity.md): how far along a feature, domain or project is.
  Readiness is worked out the same way, but about people.
