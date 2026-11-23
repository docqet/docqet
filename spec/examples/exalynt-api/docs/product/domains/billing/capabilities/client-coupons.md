---
name: Client coupons
description: >-
  Exalynt's admins give one client a coupon: a name, and a percentage or
  amount off each block they buy, either forever or on their next purchase.
stability: prototype
personas: [exalynt-admin]
concepts: [organization]
gaps:
  - id: placeholder-coupons
    name: Coupons are placeholder data
    impact: blocking
    description: >-
      Coupons are placeholder data, held in memory until a reload, so a real
      client starts with none.
  - id: coupons-never-applied
    name: Coupons never applied to payments
    impact: blocking
    description: >-
      Nothing else knows of coupons, so a client can't use one and still pays
      in full, and a coupon added here never shows as used.
  - id: separate-from-revenue-calculator-coupons
    name: Separate from the revenue calculator's coupons
    impact: inconvenient
    description: >-
      The revenue calculator's coupons are the same shape, but the two don't
      meet.
  - id: no-record-of-who-changed-a-coupon
    name: No record of who changed a coupon
    outcome: security/ga/traceable
    impact: inconvenient
    description: >-
      It doesn't record who added or ended a coupon.
    when: Someone needs to know who added or ended a coupon.
decisions:
  - question: >-
      Is a coupon for one client, taken off each block's price, forever or
      once, the shape Exalynt needs?
---

## Includes

- Admins end a coupon, and see a client's coupons, active, used up, and ended.
- Admins see where each coupon was used, and what it took off.
