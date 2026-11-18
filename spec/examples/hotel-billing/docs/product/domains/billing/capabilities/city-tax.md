---
stability: alpha
personas: [manager, front-desk-clerk]
rules:
  - tax/city-tax-per-guest-night
  - tax/children-pay-no-city-tax
  - tax/city-tax-stops-after-seven-nights
concepts: [bill, charge]
code: [src/tax/**]
gaps:
  - id: children-corrected-by-hand
    kind: to-close-later
    text: >-
      Guests' ages aren't recorded, so city tax is added for every guest on a
      stay, and clerks correct it by hand for children.
---

# City tax

The software adds the city's tourist tax to each guest's bill, night by night.

## Covers

- Clerks see the city tax on a guest's bill, night by night.
