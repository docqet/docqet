---
name: Payment
description: Money a guest has paid towards their bill, by card or in cash.
lifecycle:
  states:
    - Pending
    - Paid
  text: A pending card payment can instead be Declined.
---

A deposit is a payment taken before the guest arrives. A card payment is
known by the provider's reference, never by the card's number.
