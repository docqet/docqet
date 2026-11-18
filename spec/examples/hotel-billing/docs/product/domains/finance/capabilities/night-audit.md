---
stability: ga
personas: [night-auditor, manager]
rules:
  - night-audit/one-room-charge-per-night
  - night-audit/closed-days-dont-change
  - bills/charges-are-never-changed
concepts: [business-day, bill, charge]
code: [src/night-audit/**]
---

# Night audit

The software closes each business day overnight, charging every guest in the
hotel for that night's room.

## Covers

- Night auditors see whether tonight's audit has run, and what it charged.
- Night auditors start the audit by hand when it hasn't run.

## Success

- Every morning starts with yesterday closed, without anyone staying up for it.
