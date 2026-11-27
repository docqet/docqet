---
docqet: capability
id: extra-charges
name: Extra charges
description: >-
  Staff add extras such as breakfast, parking or the minibar to a guest's
  bill.
stability: ga
within: feature:guest-bills
solves: [problem:guests-leave-owing, problem:guests-billed-more-than-they-owe]
follows:
  - rule:charges-are-never-changed
  - rule:closed-bills-dont-change
uses: [concept:bill, concept:charge]
---

## Includes

- Clerks correct a charge that was added by mistake.

## Success

- No guest leaves with an extra that never reached their bill.
