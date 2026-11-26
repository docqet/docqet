---
docqet: capability
id: check-in
domain: guest-stays
name: Check-in
description: Clerks check guests in when they arrive and give them their room.
stability: beta
personas: [persona:front-desk-clerk]
rules: [rule:no-double-booking]
concepts: [concept:booking, concept:room]
---

## Includes

- Clerks see today's arrivals.
- Clerks move a guest to another room for the rest of their stay.

## Success

- A guest with a booking is checked in within two minutes of reaching the desk.
