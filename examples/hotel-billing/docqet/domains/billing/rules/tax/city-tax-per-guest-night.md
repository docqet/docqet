---
docqet: rule
id: city-tax-per-guest-night
domain: billing
name: City tax is charged per guest, per night
concepts: [concept:bill, concept:charge]
respects: [constraint:city-tax-owed-per-guest-night]
why: >-
  The hotel owes the city tax for every guest night, whether or not it charged
  the guest.
---

Each guest on a stay is charged the city's tax for each night, at the rate on
that night.
