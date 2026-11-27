---
docqet: capability
id: client-coupons
domain: billing
name: Client coupons
description: >-
  Exalynt's admins give one client a coupon: a name, and a percentage or
  amount off each block they buy, either forever or on their next purchase.
stability: prototype
solves: [problem:agreed-terms-applied-by-hand]
initiatives: [initiative:mvp]
concepts: [concept:organization@accounts]
decisions:
  - question: >-
      Is a coupon for one client, taken off each block's price, forever or
      once, the shape Exalynt needs?
---

## Includes

- Admins end a coupon, and see a client's coupons, active, used up, and ended.
- Admins see where each coupon was used, and what it took off.
