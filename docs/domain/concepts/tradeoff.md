# Tradeoff

Something we chose over an alternative, knowing what it costs, and decided to
live with.

## Details

A booking holds one room, not several, so a family that needs two rooms makes
two bookings. It's a decision, not something left to do. It says what we
chose, what it costs, and, when we expect to look at it again, what would make
us. A [gap](gap.md) we'll never close is a tradeoff instead.

It's on the thing the choice was made about:

- **A [capability](capability.md)**: a limit it has by choice, such as one
  room per booking.
- **A [feature](feature.md)**: a non-goal, a capability we've decided never to
  build, such as taking bookings from online travel agencies.
- **A [system](system.md) or [component](component.md)**: a technical choice,
  such as working out a bill's balance every time it's asked for.

A tradeoff answers the question code can't: is this deliberate? Code that
looks wrong on purpose points at its tradeoff, so neither a person nor an
agent "fixes" it. Neither a tradeoff nor a gap can excuse the security and
privacy baseline.

## Lifecycle

Chosen → Revisited

When what `revisit` names happens, someone looks at it again. A tradeoff we
reverse is deleted, or replaced by the new one.

## In the spec

Tradeoffs are listed in the frontmatter of the doc they're on, each with an
`id`, `text` saying what we chose and not what, its `cost`, and optionally
`revisit`, a concrete trigger. One we expect to keep forever leaves `revisit`
off. On the [ledger](../../../spec/examples/hotel-billing/docs/technical/systems/ledger.md):

```yaml
tradeoffs:
  - id: balance-worked-out-on-read
    text: >-
      A bill's balance is added up from its lines every time it's asked for,
      not stored on the bill.
    cost: Opening a bill gets slower as lines are added to it.
    revisit: a bill passes 1,000 lines
```

The code it explains points at it:

```ts
// docket:tradeoff system:ledger#balance-worked-out-on-read
export function balance(bill: Bill): number {
```

A feature's tradeoff is written the same way, on
[Reservations](../../../spec/examples/hotel-bookings/docs/product/domains/guest-stays/features/reservations.md):

```yaml
tradeoffs:
  - id: front-desk-bookings-only
    text: >-
      Bookings are taken at the front desk, not from online travel agencies.
    cost: >-
      Clerks enter each agency booking by hand, as it arrives by email.
    revisit: agency bookings pass a fifth of all bookings
```

## Not to be confused with

- [Gap](gap.md): something we intend to close.
- [Rule](rule.md): a constraint of the business. A tradeoff is a choice we
  made about the software, and could make differently.
