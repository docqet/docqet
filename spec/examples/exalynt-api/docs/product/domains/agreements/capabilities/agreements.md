---
id: agreements
name: Agreements
description: >-
  Admins offer each party the agreement that binds it to Exalynt: a Client
  Agreement for an organization, an Engineer Agreement for someone working in
  the console, and a Partner Agreement for a partnership.
stability: alpha
personas: [persona:exalynt-admin]
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
concepts: [concept:agreement, concept:organization@accounts, concept:partnership@partnerships]
gaps:
  - id: no-preview-before-sending
    name: No preview before sending an Engineer Agreement
    impact: inconvenient
    likelihood: possible
    reach: few
    description: >-
      An admin has no preview of an Engineer Agreement before sending it, the
      terms they choose from are a copy of the real catalog, and the list of
      engineers doesn't say whose agreements are in effect.
decisions:
  - topic: Changing shared definitions
    question: >-
      When a shared definition changes, how does that reach agreement versions
      that were already accepted?
---

## Includes

- Admins set the Commercial Terms of the Engineer Agreement when inviting
  someone to the console.
- Admins send an engineer a new Engineer Agreement on the terms chosen.
- Admins send an Engineer Agreement with no terms, or no shares.
- Admins see an engineer's Engineer Agreements, offered and accepted, and open
  each accepted one as the PDF made when it was accepted.
