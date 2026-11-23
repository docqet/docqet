---
name: Estimates
description: An estimate and everything in it is one document, replaced whole.
capabilities: [estimates]
gaps:
  - id: later-save-wins
    name: Later of two saves silently wins
    outcome: reliability/ga/holds-up
    impact: damaging
    description: >-
      A PUT doesn't check what the caller last read, so the later of two saves
      replaces the earlier one. An `If-Unmodified-Since` precondition with a
      `412` could be added without breaking anyone.
    when: Two people edit the same estimate at once.
tradeoffs:
  - id: prices-copied-onto-estimate
    name: Prices copied onto the estimate when made
    impact: inconvenient
    description: >-
      Prices are copied onto the estimate when it's made, so a client's
      estimate doesn't change when prices do. Every response returns the copy
      as `capacity_prices`, and the console and portal price from it.
    drawback: >-
      A capacity type added later only reaches estimates made after it's
      recorded.
    when: A capacity type is added.
  - id: unindexed-search
    name: Unindexed ILIKE search over estimates
    impact: inconvenient
    description: >-
      Search is `ILIKE '%word%'` over four columns, with no index: at 2,000
      estimates that's a few milliseconds, measured against the local stack on
      2026-10-23.
    drawback: It scans.
    when: Estimates grow far beyond the 2,000 measured.
---

`PUT /v1/estimates/{id}` replaces the estimate in one transaction: it updates
the `estimates` row first, which locks it, then deletes its discounts and
Focuses, which cascades to their notes, and inserts the new ones. Focuses,
notes, and discounts keep the IDs a request sends and get new UUIDv7s where it
leaves them out, so the console can keep its React keys from the first
keystroke.

`Replace` and `Delete` repeat the caller's bounds in their `WHERE`, against the
row as it stands once locked, so an estimate moved out of someone's team while
they were saving it isn't written over.

`focus_count` and `units_*` are denormalized by `Estimate.RecountTotals` in the
same transaction, so a listing needn't add up Focuses. Costs aren't stored. A
listing carries each estimate's Focuses in brief and discounts in full, each
loaded for the whole page in one extra query.

The console does the discount arithmetic too, so a change lands in both:
`price - (price × total + 50) / 100` in whole cents.

`include_operations` and `operations_fee_cents` stay in the API though the UI
doesn't show operations for now, and a save from the editor leaves the flag as
it was.

A Focus's pace is `estimate_focuses.capacity`; one written without it is
planned at Dedicated.
