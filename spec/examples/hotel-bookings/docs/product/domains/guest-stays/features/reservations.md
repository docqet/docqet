---
name: Reservations
summary: Taking bookings and handling changes to them, before the guest arrives.
capabilities:
  - room-booking
  - cancellations
  - group-bookings
  - waitlist
tradeoffs:
  - id: front-desk-bookings-only
    text: >-
      Bookings are taken at the front desk, not from online travel agencies.
    gain: >-
      No agency integrations to build or keep working, while most bookings
      come straight to the desk.
    cost: >-
      Clerks enter each agency booking by hand, as it arrives by email.
decisions:
  - topic: Agency bookings
    question: Should bookings come in from online travel agencies?
    status: closed
    answer: >-
      Not yet. Most bookings come straight to the desk, so clerks enter the
      few agency bookings by hand.
    became: [feature:reservations#front-desk-bookings-only]
  - topic: Groups
    question: Should a group be able to book several rooms under one name?
    status: closed
    answer: Yes, as a capability of its own, explored as a prototype first.
    became: [capability:group-bookings]
---
