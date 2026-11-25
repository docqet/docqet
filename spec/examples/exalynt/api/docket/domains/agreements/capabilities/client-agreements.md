---
docket: capability
id: client-agreements
domain: agreements
name: Client agreements
description: >-
  A client organization's Admin reads and accepts its Client Agreement on its
  behalf, before anyone can use the portal for it.
stability: beta
personas:
  - persona:client-admin-founder
  - persona:client-admin-operations
  - persona:client-member
  - persona:client-billing
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
concepts: [concept:agreement, concept:organization@accounts]
gaps:
  - id: new-versions-not-offered
    name: New versions not offered to organizations
    impact: inconvenient
    likelihood: possible
    reach: some
    description: >-
      A new version of the Client Agreement isn't offered to an organization
      that accepted an earlier one, and nothing sends a client new terms (it
      has none). That matters once a new version of the Client Agreement is
      published.
  - id: names-outside-western-european-alphabets
    name: Names outside Western alphabets lost in PDFs
    outcome: usability/beta/everyone
    impact: inconvenient
    likelihood: unlikely
    reach: few
    description: >-
      A name with characters outside Western European alphabets shows them as
      "?" in the PDF, and the PDF keeps them that way once accepted.
  - id: shared-definitions-changed-in-place
    name: Version 1 changed in place after acceptance
    impact: damaging
    likelihood: unlikely
    description: >-
      The definition of Fulfilled, and version 1 of the Client Agreement, were
      changed in place to say the engineer marks a block fulfilled and nobody
      reviews it: a copy accepted before then still says a block is fulfilled
      once it's reviewed and approved. Version 1 was changed in place again to
      stop saying each block is assigned to a product: a copy accepted before
      then still does.
tradeoffs:
  - id: every-member-sees-agreements
    name: Agreements visible to every member
    description: >-
      Every member of an organization sees its agreements, whatever their
      role.
    drawback: >-
      Members and Billing see the organization's terms with Exalynt, not just
      its Admins.
decisions:
  - topic: Changing shared definitions
    question: >-
      When a shared definition changes, how does that reach agreement versions
      that were already accepted?
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
