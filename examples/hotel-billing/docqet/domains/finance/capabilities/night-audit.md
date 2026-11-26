---
docqet: capability
id: night-audit
domain: finance
name: Night audit
description: >-
  The software closes each business day overnight, charging every guest in the
  hotel for that night's room.
stability: ga
personas: [persona:night-auditor, persona:manager]
rules:
  - rule:one-room-charge-per-night
  - rule:closed-days-dont-change
  - rule:charges-are-never-changed@billing
concepts: [concept:business-day, concept:bill@billing, concept:charge@billing]
---

## Includes

- Night auditors see whether tonight's audit has run, and what it charged.
- Night auditors start the audit by hand when it hasn't run.

## Success

- Every morning starts with yesterday closed, without anyone staying up for it.
