---
stability: GA
rules:
  - bills/charges-are-never-changed
  - bills/closed-bills-dont-change
concepts: [bill, charge]
code: [src/ledger/**]
---

# Extra charges

Staff add extras such as breakfast, parking or the minibar to a guest's bill,
so everything the guest owes is on it.

## What people can do

### Front desk clerk

- Add an extra to a guest's bill.
- Correct a charge that was added by mistake.

## Success

- No guest leaves with an extra that never reached their bill.
