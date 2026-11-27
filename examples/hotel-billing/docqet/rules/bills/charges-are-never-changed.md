---
docqet: rule
id: charges-are-never-changed
name: A charge is never changed or deleted
uses: [concept:charge, concept:bill]
respects: [constraint:charges-kept-for-the-tax-office]
why: >-
  The hotel's accountant and the tax office need to see every charge that was
  made, including the mistakes.
---

A charge is corrected by adding a charge for the opposite amount, never by
changing or deleting it.
