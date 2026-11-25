---
docket: capability
id: partner-agreements
domain: agreements
name: Partner agreements
description: >-
  A partnership's manager reads and accepts the Partner Agreement Exalynt
  sends with its invitation, with its Commercial Terms, before working in the
  Partner Hub for that partnership.
stability: beta
personas: [persona:partner, persona:exalynt-admin]
initiatives: [initiative:mvp]
rules:
  - rule:engineer-agreement-follows-the-invitations-terms
  - rule:an-engineer-agreement-can-have-no-commercial-terms
  - rule:acceptance-puts-an-agreement-in-effect
  - rule:new-terms-wait-for-acceptance
  - rule:a-newer-agreement-replaces-one-waiting
  - rule:only-the-waiting-agreement-is-accepted-once
  - rule:a-new-organization-is-offered-the-client-agreement
  - rule:who-accepts-a-client-agreement
  - rule:manager-accepts-the-partner-agreement
  - rule:reading-the-partner-agreement-before-accepting
  - rule:accepted-agreements-never-change
  - rule:accepted-agreements-outlive-their-partys-account
  - rule:agreements-stay-private
concepts: [concept:agreement, concept:partnership@partnerships]
gaps:
  - id: names-outside-western-european-alphabets
    name: Names outside Western alphabets lost in PDFs
    affects:
      - outcome:usability/beta/everyone
    impact: inconvenient
    likelihood: unlikely
    reach: few
    description: >-
      A name with characters outside Western European alphabets shows them as
      "?" in the PDF, and the PDF keeps them that way once accepted.
---

## Includes

- Partners look at another partnership they manage while one's Partner Agreement
  waits for them.
- Partners see the partnership's Partner Agreements, which one is in effect, and
  open each accepted one as the PDF made when it was accepted, to read, print,
  or download.
- Partners are told if the one they're accepting was accepted elsewhere while
  they read it, and see where it stands instead.
- Admins read any partnership's Partner Agreements, offered and accepted.

## Success

- Every partnership working in the Partner Hub has a Partner Agreement in
  effect, accepted by its manager without help, and its manager can open the
  copy they accepted.
