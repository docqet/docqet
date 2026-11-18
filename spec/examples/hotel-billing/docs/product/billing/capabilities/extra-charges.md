---
stability: GA
personas: [front-desk-clerk]
rules:
  - bills/charges-are-never-changed
  - bills/closed-bills-dont-change
concepts: [bill, charge]
code: [src/ledger/**]
---

# Extra charges

Staff add extras such as breakfast, parking or the minibar to a guest's bill.

## Covers

- Clerks correct a charge that was added by mistake.

## Success

- No guest leaves with an extra that never reached their bill.
