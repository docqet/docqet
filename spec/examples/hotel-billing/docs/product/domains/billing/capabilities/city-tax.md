---
name: City tax
description: >-
  The software adds the city's tourist tax to each guest's bill, night by
  night.
stability: alpha
personas: [manager, front-desk-clerk]
rules:
  - tax/city-tax-per-guest-night
  - tax/children-pay-no-city-tax
  - tax/city-tax-stops-after-seven-nights
concepts: [bill, charge]
gaps:
  - id: children-corrected-by-hand
    name: City tax charged for children
    rule: tax/children-pay-no-city-tax
    impact: inconvenient
    description: >-
      Guests' ages aren't recorded, so city tax is added for every guest on a
      stay, and clerks correct it by hand for children.
---

## Includes

- Clerks see the city tax on a guest's bill, night by night.
