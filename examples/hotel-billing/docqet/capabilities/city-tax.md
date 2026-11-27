---
docqet: capability
id: city-tax
name: City tax
description: >-
  The software adds the city's tourist tax to each guest's bill, night by
  night.
stability: alpha
within: feature:guest-bills
solves: [problem:guests-leave-owing, problem:guests-billed-more-than-they-owe]
follows:
  - rule:city-tax-per-guest-night
  - rule:children-pay-no-city-tax
  - rule:city-tax-stops-after-seven-nights
uses: [concept:bill, concept:charge]
gaps:
  - id: children-corrected-by-hand
    name: City tax charged for children
    affects:
      - rule:children-pay-no-city-tax
    impact: inconvenient
    likelihood: certain
    reach: all
    description: >-
      Guests' ages aren't recorded, so city tax is added for every guest on a
      stay, and clerks correct it by hand for children.
---

## Includes

- Clerks see the city tax on a guest's bill, night by night.
