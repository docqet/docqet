---
docqet: rule
id: failed-payouts-are-sent-again
domain: pay
name: Failed payouts are sent again
respects: [constraint:bank-transfers-cant-be-recalled]
---

A failed payout's earnings go out in a new payout once there's an account that
can receive them. The failed one says why and links to the new one.
