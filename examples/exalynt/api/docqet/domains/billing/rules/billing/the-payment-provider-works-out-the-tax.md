---
docqet: rule
id: the-payment-provider-works-out-the-tax
domain: billing
name: The payment provider works out the tax
respects: [constraint:sales-tax-is-collected]
why: >-
  Exalynt is responsible for making sure sales tax is collected, but not for
  calculating it; the provider holds the billing address and the tax settings
  it needs.
---

The payment provider works out a purchase's tax, and it's charged on the
invoice. Exalynt never calculates tax itself.
