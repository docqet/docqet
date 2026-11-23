# Tradeoff

Something we chose over an alternative, with its benefit and its drawback,
and decided to live with.

## Details

A booking holds one room, not several, so a family that needs two rooms makes
two bookings. It's a decision, not something left to do. It says what we
chose, its benefit, and its drawback. We accept both together: they're
what came with the choice. Without its benefit, there's nothing to weigh the
drawback against. A [gap](gap.md) we'll never close is a tradeoff instead.

One tradeoff is one choice. When a choice has two drawbacks, its drawback
says both, rather than the choice being written twice.

Its drawback has an impact, on the same scale as a gap's, and `when` it
bites, so the choices we live with can be ordered by what we've accepted, as
[risk](risk.md) describes. A choice that's fine until something changes,
such as a quicker design that slows down as bills grow, says so in `when`,
which is also when it's worth looking at again.

It's on the thing the choice was made about:

- **A [capability](capability.md)**: a limit it has by choice, such as one
  room per booking.
- **A [feature](feature.md)**: a non-goal, a capability we've decided never to
  build, such as taking bookings from online travel agencies.
- **A [mechanism](mechanism.md) or [component](component.md)**: a technical choice,
  such as working out a bill's balance every time it's asked for.

A tradeoff answers the question code can't: is this deliberate? Code that
looks wrong on purpose points at its tradeoff, so neither a person nor an
agent "fixes" it. When the choice means falling short of a
[stability checklist](stability-checklist.md) outcome, the tradeoff names it,
and the checklist shows that outcome as not met by choice, so it's neither
claimed nor taken for a gap. Neither a tradeoff nor a gap can excuse the
security and privacy baseline.

A tradeoff we reverse is deleted, or replaced by the new one.

## In the spec

Tradeoffs are listed in the frontmatter of the doc they're on, each with an
`id`, a `name` saying in a few words what we chose, a `description` saying
what we chose and not what, its `benefit`, and its
`drawback`. Optionally, as a gap does, its `outcome` names the checklist
outcome it falls short of, and its `impact` and `when` rate its drawback. On the [ledger](../../../spec/examples/hotel-billing/docs/technical/components/ledger.md):

```yaml
tradeoffs:
  - id: balance-worked-out-on-read
    name: Balance summed on read, not stored
    outcome: efficiency/beta/bounded
    impact: inconvenient
    description: >-
      A bill's balance is added up from its lines every time it's asked for,
      not stored on the bill.
    benefit: >-
      The balance can never disagree with the lines, and there's nothing to
      keep in step when a line is added.
    drawback: Opening a bill gets slower as lines are added to it.
    when: A bill grows to thousands of lines, as on a long company stay.
```

The code it explains points at it:

```ts
// docket:tradeoff component:ledger#balance-worked-out-on-read
export function balance(bill: Bill): number {
```

A feature's tradeoff is written the same way, on
[Reservations](../../../spec/examples/hotel-bookings/docs/product/domains/guest-stays/features/reservations.md):

```yaml
tradeoffs:
  - id: front-desk-bookings-only
    name: Front desk bookings only
    impact: inconvenient
    description: >-
      Bookings are taken at the front desk, not from online travel agencies.
    benefit: >-
      No agency integrations to build or keep working, while most bookings
      come straight to the desk.
    drawback: Clerks enter each agency booking by hand, as it arrives by email.
```

## Not to be confused with

- [Gap](gap.md): something we intend to close.
- [Rule](rule.md): a constraint of the business. A tradeoff is a choice we
  made about the software, and could make differently.
