---
id: engineer-agreements
name: Engineer agreements
description: >-
  Engineers read and accept the Engineer Agreement Exalynt sends them, with
  its Commercial Terms, before they work in the console.
stability: beta
personas:
  - persona:exalynt-engineer-new-hire
  - persona:exalynt-engineer-1
  - persona:exalynt-engineer-2
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
concepts: [concept:agreement]
gaps:
  - id: only-the-console-holds-to-the-agreement
    name: Only the console enforces the agreement
    impact: damaging
    description: >-
      Only the console holds engineers to an agreement: someone using the API
      directly can still do what their role allows without one in effect, and
      the admin app isn't gated.
  - id: new-versions-not-offered
    name: New versions not offered to engineers
    impact: blocking
    description: >-
      A new version of the Engineer Agreement isn't offered to an engineer
      who accepted an earlier one.
    when: A new version of the Engineer Agreement is published.
  - id: sending-relies-on-alpha-capabilities
    name: Sending relies on Alpha capabilities
    outcome: security/alpha/stable-dependencies
    impact: blocking
    description: >-
      An engineer only gets an Engineer Agreement through their console
      invitation or an admin sending one, and both are still Alpha, in
      Agreements and Engineer onboarding.
    when: A breaking change in Agreements or Engineer onboarding.
  - id: earlier-engineers-kept-out
    name: Existing engineers kept out until sent one
    impact: inconvenient
    description: >-
      Engineers and admins already at Exalynt when agreements began are kept
      out of the console until an admin sends each of them an Engineer
      Agreement.
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
  - id: shared-definitions-changed-in-place
    name: Version 1 changed in place after acceptance
    impact: damaging
    description: >-
      The definition of Fulfilled, and version 1 of the Engineer Agreement,
      were changed in place to say the engineer marks a block fulfilled and
      nobody reviews it: a copy accepted before then still says a block is
      fulfilled once it's reviewed and approved.
decisions:
  - topic: Changing shared definitions
    question: >-
      When a shared definition changes, how does that reach agreement versions
      that were already accepted?
    gaps: [shared-definitions-changed-in-place]
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
