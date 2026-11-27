---
docqet: rule
id: no-double-booking
name: A room can't be double-booked
concepts: [concept:booking, concept:room]
respects: [constraint:one-stay-a-room-a-night]
---

Two bookings for the same room can't share a night. A cancelled booking no
longer holds its nights.
