---
name: Client agreements
description: >-
  A client organization's Admin reads and accepts its Client Agreement on its
  behalf, before anyone can use the portal for it.
stability: beta
personas:
  - client-admin-founder
  - client-admin-operations
  - client-member
  - client-billing
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
concepts: [agreement, organization]
gaps:
  - id: only-the-portal-holds-to-the-agreement
    summary: >-
      Only the portal holds an organization to its Client Agreement: someone
      using the API directly can still do what their role allows without one
      in effect.
  - id: new-versions-not-offered
    summary: >-
      A new version of the Client Agreement isn't offered to an organization
      that accepted an earlier one, and nothing sends a client new terms (it
      has none).
  - id: generated-pdf-file-name
    summary: >-
      A PDF downloaded from the browser's viewer gets a generated file name,
      not the agreement's.
  - id: names-outside-western-european-alphabets
    outcome: usability/beta/everyone
    summary: >-
      A name with characters outside Western European alphabets shows them as
      "?" in the PDF, and the PDF keeps them that way once accepted.
  - id: shared-definitions-changed-in-place
    summary: >-
      How a shared definition changes once an accepted version uses it isn't
      decided yet. The definition of Fulfilled, and version 1 of the Client
      Agreement, were changed in place to say the engineer marks a block
      fulfilled and nobody reviews it: a copy accepted before then still says
      a block is fulfilled once it's reviewed and approved. Version 1 was
      changed in place again to stop saying each block is assigned to a
      product: a copy accepted before then still does.
tradeoffs:
  - id: every-member-sees-agreements
    summary: >-
      Every member of an organization sees its agreements, whatever their
      role.
    drawbacks:
      - >-
        Members and Billing see the organization's terms with Exalynt, not just
        its Admins.
---

## Includes

- Members and Billing see that an Admin has to accept the Client Agreement
  first, and switch to another organization meanwhile.
- Everyone in the organization sees its accepted Client Agreements, who accepted
  each and when, and opens each as the PDF made when it was accepted, to read,
  print, or download.
- Clients are told if another Admin accepted it while they were reading, or
  their role changed so they no longer can, and see the organization as it is
  now instead.

## Success

- Every organization working in the portal has a Client Agreement in effect,
  accepted by one of its Admins without help, and everyone in it can open the
  copy they accepted.
