---
id: guest-stays
name: Guest stays
description: Looking after guests from their booking to their check-out.
decisions:
  - topic: Early arrivals
    question: >-
      When a guest arrives before the room's usual check-in time, does
      their stay start that day, or is the night before part of it?
  - topic: Same-day turnover
    question: >-
      Can a room be booked from the day an earlier booking checks out?
    status: closed
    answer: >-
      Yes. The two stays don't share a night, and there's time to clean the
      room between check-out and check-in.
    became: [rule:same-day-turnover]
---
