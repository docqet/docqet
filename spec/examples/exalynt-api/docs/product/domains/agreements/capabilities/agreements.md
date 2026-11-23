---
name: Agreements
summary: >-
  Admins offer each party the agreement that binds it to Exalynt: a Client
  Agreement for an organization, an Engineer Agreement for someone working in
  the console, and a Partner Agreement for a partnership.
stability: alpha
personas: [exalynt-admin]
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
concepts: [agreement, organization, partnership]
gaps:
  - id: only-the-apps-hold-people-to-an-agreement
    text: >-
      Only the apps hold people to an agreement: someone using the API
      directly can still do what their role allows without one in effect, and
      the admin app isn't gated.
  - id: new-versions-not-offered
    text: >-
      A new version isn't offered to an organization or person that accepted
      an earlier one, and nothing sends a client new terms (it has none).
  - id: read-in-full-only-to-accept
    text: >-
      An agreement is only read in full to accept it: nobody else can read
      one that's waiting, so an admin can't read an Engineer Agreement they've
      sent until it's accepted.
  - id: generated-pdf-file-name
    text: >-
      A PDF downloaded from the browser's viewer gets a generated file name,
      not the agreement's.
  - id: names-outside-western-european-alphabets
    outcome: usability/beta/everyone
    text: >-
      A name with characters outside Western European alphabets shows them as
      "?" in the PDF, and the PDF keeps them that way once accepted.
  - id: placeholder-client-agreement-records
    text: >-
      Admins see only placeholder records of what clients have accepted, over
      placeholder clients. Nothing sends or accepts a client's agreement from
      there, and the real Client Agreements Exalynt keeps aren't shown.
  - id: placeholder-documents-local-only
    text: >-
      Those placeholder records open their documents only in local
      development. They have to read the real agreements before this part
      leaves Prototype.
  - id: no-preview-before-sending
    text: >-
      An admin has no preview of an Engineer Agreement before sending it, the
      terms they choose from are a copy of the real catalog, and the list of
      engineers doesn't say whose agreements are in effect.
  - id: shared-definitions-changed-in-place
    text: >-
      How a shared definition changes once an accepted version uses it isn't
      decided yet. The definition of Fulfilled, and version 1 of the Client
      Agreement, were changed in place to say the engineer marks a block
      fulfilled and nobody reviews it: a copy accepted before then still says
      a block is fulfilled once it's reviewed and approved.
---

## Includes

- Admins set the Commercial Terms of the Engineer Agreement when inviting
  someone to the console.
- Admins send an engineer a new Engineer Agreement on the terms chosen.
- Admins send an Engineer Agreement with no terms, or no shares.
- Admins see an engineer's Engineer Agreements, offered and accepted, and open
  each accepted one as the PDF made when it was accepted.
