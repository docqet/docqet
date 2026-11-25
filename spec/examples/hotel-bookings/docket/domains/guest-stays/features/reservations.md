---
docket: feature
id: reservations
domain: guest-stays
name: Reservations
description: Taking bookings and handling changes to them, before the guest arrives.
capabilities:
  - capability:room-booking
  - capability:cancellations
  - capability:group-bookings
  - capability:waitlist
tradeoffs:
  - id: front-desk-bookings-only
    name: Front desk bookings only
    description: >-
      Bookings are taken at the front desk, not from online travel agencies.
    benefit: >-
      No agency integrations to build or keep working, while most bookings
      come straight to the desk.
    drawback: Clerks enter each agency booking by hand, as it arrives by email.
---
