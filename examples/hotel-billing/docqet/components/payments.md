---
docqet: component
id: payments
name: Payments
description: >-
  Taking card payments through the payment provider, for deposits and payment
  links.
serves: [capability:deposits, capability:pay-by-link]
gaps:
  - id: no-timeout-on-provider-calls
    name: No timeout on payment provider calls
    affects:
      - outcome:reliability/beta/fails-clearly
    impact: inconvenient
    likelihood: expected
    reach: all
    description: >-
      Calls to the payment provider have no timeout, so a slow provider holds
      the request open until the platform gives up on it.
tradeoffs:
  - id: providers-card-form
    name: Provider's hosted card form, not our own
    description: >-
      Guests type their card into the provider's hosted form, not one of
      ours.
    benefit: >-
      Card numbers never reach our servers, so the hotel stays out of most
      card-security rules.
    drawback: The payment page looks like the provider's, not the hotel's.
---

The guest types their card into the provider's form, which hands the app a
token. `takePayment` sends the provider that token and the amount, and keeps
the reference it sends back. Card numbers never reach the app.

The integration tests run against the provider's sandbox
(`test/integration/sandbox.ts`), which accepts any test token instantly. Real
payments can take seconds.
