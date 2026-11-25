---
docket: capability
id: city-tax
domain: billing
name: City tax
description: >-
  The software adds the city's tourist tax to each guest's bill, night by
  night.
stability: alpha
personas: [persona:manager, persona:front-desk-clerk]
rules:
  - rule:city-tax-per-guest-night
  - rule:children-pay-no-city-tax
  - rule:city-tax-stops-after-seven-nights
concepts: [concept:bill, concept:charge]
gaps:
  - id: children-corrected-by-hand
    name: City tax charged for children
    rule: rule:children-pay-no-city-tax
    impact: inconvenient
    description: >-
      Guests' ages aren't recorded, so city tax is added for every guest on a
      stay, and clerks correct it by hand for children.
---

## Includes

- Clerks see the city tax on a guest's bill, night by night.
