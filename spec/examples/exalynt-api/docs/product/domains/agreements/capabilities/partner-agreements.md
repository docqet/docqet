---
id: partner-agreements
name: Partner agreements
description: >-
  A partnership's manager reads and accepts the Partner Agreement Exalynt
  sends with its invitation, with its Commercial Terms, before working in the
  Partner Hub for that partnership.
stability: beta
personas: [persona:partner, persona:exalynt-admin]
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
  - id: only-the-partner-hub-holds-to-the-agreement
    name: Only the Partner Hub enforces the agreement
    impact: damaging
    description: >-
      Only the Partner Hub holds a partnership to its agreement: someone using
      the API directly can still do what managing it allows without one in
      effect.
  - id: no-new-terms
    name: No way to send new terms
    impact: blocking
    description: >-
      Nothing sends a partnership new terms after its invitation, so it has
      one Partner Agreement at most for now.
    when: A partnership's terms need to change.
  - id: unnamed-partnership-in-the-document
    name: Unnamed partnership stays unnamed in the document
    impact: negligible
    description: >-
      A partnership accepted before it's named shows "your partnership" in the
      document as accepted.
    when: Naming a partnership fails before its agreement is accepted.
  - id: generated-pdf-file-name
    name: Downloaded PDFs get a generated file name
    impact: negligible
    description: >-
      A PDF downloaded from the browser's viewer gets a generated file name,
      not the agreement's.
  - id: names-outside-western-european-alphabets
    name: Names outside Western alphabets lost in PDFs
    outcome: usability/beta/everyone
    impact: damaging
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
