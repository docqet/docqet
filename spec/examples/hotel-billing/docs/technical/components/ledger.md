---
id: ledger
name: Ledger
description: >-
  Every amount a guest owes or pays, as lines on their bill that are only ever
  added, never changed.
capabilities: [capability:extra-charges, capability:split-bills, capability:deposits, capability:check-out, capability:direct-billing]
meets: [reliability/beta/data-kept]
gaps:
  - id: corrections-of-corrections-untested
    name: Corrections of corrections untested
    outcome: maintainability/ga/others-can-change
    impact: damaging
    likelihood: expected
    reach: few
    description: >-
      Nothing tests correcting a line that is itself a correction, so a change
      to how corrections work in `correct` could stop a twice-corrected charge
      netting to zero without anything failing.
tradeoffs:
  - id: balance-worked-out-on-read
    name: Balance summed on read, not stored
    outcome: efficiency/beta/bounded
    description: >-
      A bill's balance is added up from its lines every time it's asked for,
      not stored on the bill.
    benefit: >-
      The balance can never disagree with the lines, and there's nothing to
      keep in step when a line is added.
    drawback: >-
      Opening a bill gets slower as lines are added to it, which shows once a
      bill grows to thousands of lines, as on a long company stay.
---

Everything that changes what a guest owes goes through `post`: room nights,
extras, deposits, payments and corrections. A correction is a new line for
the opposite amount, pointing at the line it corrects with `corrects`.

Amounts are whole cents, never fractions of a unit, so totals add up exactly.
They're converted at the edges, when reading input and showing amounts.

`post` refuses a closed bill, so anything that closes a bill posts everything
first, deposits included.
