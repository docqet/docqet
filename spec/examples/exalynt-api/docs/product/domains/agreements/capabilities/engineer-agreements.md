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
concepts: [concept:agreement]
gaps:
  - id: new-versions-not-offered
    name: New versions not offered to engineers
    impact: inconvenient
    likelihood: possible
    reach: few
    description: >-
      A new version of the Engineer Agreement isn't offered to an engineer
      who accepted an earlier one. That matters once a new version of the
      Engineer Agreement is published.
  - id: names-outside-western-european-alphabets
    name: Names outside Western alphabets lost in PDFs
    outcome: usability/beta/everyone
    impact: inconvenient
    likelihood: possible
    reach: few
    description: >-
      A name with characters outside Western European alphabets shows them as
      "?" in the PDF, and the PDF keeps them that way once accepted.
  - id: shared-definitions-changed-in-place
    name: Version 1 changed in place after acceptance
    impact: inconvenient
    likelihood: unlikely
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
