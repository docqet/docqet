---
name: Partner agreements
summary: >-
  A partnership's manager reads and accepts the Partner Agreement Exalynt
  sends with its invitation, with its Commercial Terms, before working in the
  Partner Hub for that partnership.
stability: beta
personas: [partner, exalynt-admin]
rules:
  - agreements/engineer-agreement-follows-the-invitations-terms
  - agreements/an-engineer-agreement-can-have-no-commercial-terms
  - agreements/acceptance-puts-an-agreement-in-effect
  - agreements/new-terms-wait-for-acceptance
  - agreements/a-newer-agreement-replaces-one-waiting
  - agreements/only-the-waiting-agreement-is-accepted-once
  - agreements/a-new-organization-is-offered-the-client-agreement
  - agreements/who-accepts-a-client-agreement
  - agreements/manager-accepts-the-partner-agreement
  - agreements/reading-the-partner-agreement-before-accepting
  - agreements/accepted-agreements-never-change
  - agreements/accepted-agreements-outlive-their-partys-account
  - agreements/agreements-stay-private
concepts: [agreement, partnership]
gaps:
  - id: only-the-partner-hub-holds-to-the-agreement
    text: >-
      Only the Partner Hub holds a partnership to its agreement: someone using
      the API directly can still do what managing it allows without one in
      effect.
  - id: no-new-terms
    text: >-
      Nothing sends a partnership new terms after its invitation, so it has
      one Partner Agreement at most for now.
  - id: offered-only-through-alpha-invitations
    outcome: security/alpha/stable-dependencies
    text: >-
      A partnership gets its Partner Agreement only through its invitation,
      sent and accepted in Partnerships, which is still Alpha.
  - id: unnamed-partnership-in-the-document
    text: >-
      A partnership accepted before it's named shows "your partnership" in the
      document as accepted.
  - id: switching-relies-on-alpha-partnerships
    outcome: security/alpha/stable-dependencies
    text: >-
      Switching between the partnerships someone manages relies on
      Partnerships, which is still Alpha.
  - id: generated-pdf-file-name
    text: >-
      A PDF downloaded from the browser's viewer gets a generated file name,
      not the agreement's.
  - id: names-outside-western-european-alphabets
    outcome: usability/beta/everyone
    text: >-
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
