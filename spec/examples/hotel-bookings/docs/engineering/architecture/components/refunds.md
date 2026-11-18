---
capabilities: [cancellations]
code: [src/cancellations/**]
gaps:
  - id: refund-errors-not-traceable
    text: >-
      Payment provider errors are logged without the booking reference, so
      tracing a failed refund means searching the provider's records by amount
      and date.
    until:
      capability: cancellations
      reaches: Alpha
---

# Refunds

Working out what a cancelled booking is refunded, and paying it back through
the payment provider. Start reading at `refundAmount` in
`src/cancellations/refund.ts`.

## Gotchas

- The provider can reject a refund days after accepting it, for example when the
  guest's card has been closed. The app doesn't retry, so a rejected refund is
  made again by hand.
