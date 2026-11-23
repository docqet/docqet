---
name: Engineer agreements
description: >-
  Engineers read and accept the Engineer Agreement Exalynt sends them, with
  its Commercial Terms, before they work in the console.
stability: beta
personas:
  - exalynt-engineer-new-hire
  - exalynt-engineer-1
  - exalynt-engineer-2
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
concepts: [agreement]
gaps:
  - id: only-the-console-holds-to-the-agreement
    summary: >-
      Only the console holds engineers to an agreement: someone using the API
      directly can still do what their role allows without one in effect, and
      the admin app isn't gated.
  - id: new-versions-not-offered
    summary: >-
      A new version of the Engineer Agreement isn't offered to an engineer
      who accepted an earlier one.
  - id: sending-relies-on-alpha-capabilities
    outcome: security/alpha/stable-dependencies
    summary: >-
      An engineer only gets an Engineer Agreement through their console
      invitation or an admin sending one, and both are still Alpha, in
      Agreements and Engineer onboarding.
  - id: earlier-engineers-kept-out
    summary: >-
      Engineers and admins already at Exalynt when agreements began are kept
      out of the console until an admin sends each of them an Engineer
      Agreement.
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
      decided yet. The definition of Fulfilled, and version 1 of the Engineer
      Agreement, were changed in place to say the engineer marks a block
      fulfilled and nobody reviews it: a copy accepted before then still says
      a block is fulfilled once it's reviewed and approved.
---

## Includes

- Engineers see their accepted Engineer Agreements, which one is in effect, and
  its terms, and open each accepted one as the PDF made when it was accepted, to
  read, print, or download.
- Engineers see a newer Engineer Agreement waiting for them, read it in full,
  and accept it.
- Engineers are told if the one they're accepting was replaced or already
  accepted while they read it, and read what's waiting now instead.

## Success

- Every engineer working in the console has an Engineer Agreement in effect,
  reads and accepts a new one without help, and is paid by the terms they
  accepted.
