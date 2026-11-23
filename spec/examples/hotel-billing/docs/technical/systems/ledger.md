---
capabilities: [extra-charges, split-bills, deposits, check-out, direct-billing]
code: [src/ledger/**]
meets: [reliability/beta/data-kept]
gaps:
  - id: corrections-of-corrections-untested
    until: extra-charges@ga
    outcome: maintainability/ga/others-can-change
    text: >-
      Nothing tests correcting a line that is itself a correction, so a change
      to `correct` could stop a twice-corrected charge netting to zero without
      anything failing.
tradeoffs:
  - id: balance-worked-out-on-read
    text: >-
      A bill's balance is added up from its lines every time it's asked for,
      not stored on the bill.
    cost: Opening a bill gets slower as lines are added to it.
    revisit: a bill passes 1,000 lines
---

# Ledger

Every amount a guest owes or pays, as lines on their bill that are only ever
added, never changed.

**Code:** `src/ledger/ledger.ts`, starting at `post`

## How it works

Everything that changes what a guest owes goes through `post`: room nights,
extras, deposits, payments and corrections. A correction is a new line for
the opposite amount, pointing at the line it corrects with `corrects`.

## Gotchas

- Amounts are whole cents, never fractions of a unit, so totals add up
  exactly. Convert at the edges, when reading input and showing amounts.
- `post` refuses a closed bill, so anything that closes a bill has to post
  everything first, deposits included.
