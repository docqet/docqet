---
name: Ledger
description: >-
  Every amount a guest owes or pays, as lines on their bill that are only ever
  added, never changed.
capabilities: [extra-charges, split-bills, deposits, check-out, direct-billing]
meets: [reliability/beta/data-kept]
gaps:
  - id: corrections-of-corrections-untested
    outcome: maintainability/ga/others-can-change
    summary: >-
      Nothing tests correcting a line that is itself a correction, so a change
      to `correct` could stop a twice-corrected charge netting to zero without
      anything failing.
tradeoffs:
  - id: balance-worked-out-on-read
    outcome: efficiency/beta/bounded
    summary: >-
      A bill's balance is added up from its lines every time it's asked for,
      not stored on the bill.
    benefits:
      - The balance can never disagree with the lines.
      - There's nothing to keep in step when a line is added.
    drawbacks:
      - Opening a bill gets slower as lines are added to it.
---

Everything that changes what a guest owes goes through `post`: room nights,
extras, deposits, payments and corrections. A correction is a new line for
the opposite amount, pointing at the line it corrects with `corrects`.

Amounts are whole cents, never fractions of a unit, so totals add up exactly.
They're converted at the edges, when reading input and showing amounts.

`post` refuses a closed bill, so anything that closes a bill posts everything
first, deposits included.
