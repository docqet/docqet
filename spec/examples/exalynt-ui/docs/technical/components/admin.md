---
name: Admin
description: >-
  The admin, where Exalynt's admins run clients, partners, engineers, teams,
  roles and payouts.
capabilities:
  - client-directory
  - client-coupons
  - partnerships
  - engineers
  - agreements
  - teams
  - staffing
  - payouts
  - roles
gaps:
  - id: clients-read-everything
    outcome: efficiency/beta/bounded
    impact: inconvenient
    summary: >-
      The Clients pages read every client and every block before showing
      anything, and the list pages them in the browser. Each block's invoice
      is read from the payment provider by the API, one at a time.
    when: As clients and their blocks grow in number.
  - id: coupons-two-shapes
    impact: inconvenient
    summary: >-
      Client coupons (`data/coupons.ts`) and the revenue calculator's coupons
      are the same shape but separate code, and the two don't meet.
  - id: whole-lists-paged-in-browser
    outcome: efficiency/beta/bounded
    impact: inconvenient
    summary: >-
      The API sends every partnership and every pending invitation at once,
      and the Partners and Invitations lists page them in the browser.
    when: Partnerships and pending invitations grow to many.
  - id: roster-reads-everything
    outcome: efficiency/beta/bounded
    impact: inconvenient
    summary: >-
      Each Engineers page reads everyone, every team, client and block, once
      when it opens and again after a team change.
    when: As engineers, teams, clients and blocks grow in number.
  - id: roster-assumes-global-reads
    impact: blocking
    summary: >-
      The Engineers pages are written for administrators: without
      `user:read`, `team:read`, `capacity:read` or `client:read` the roster
      doesn't load, and with a team or own scope it shows only what that
      reaches.
    when: Someone without global reads is given the Engineers pages.
  - id: team-picker-ignores-permission
    impact: inconvenient
    summary: >-
      The team picker on the Engineers pages shows without `team:manage`, so
      the change is only refused by the API, and toasted.
    when: Someone without `team:manage` opens the Engineers pages.
  - id: terms-catalog-copied
    impact: blocking
    summary: >-
      The Commercial Terms an admin chooses from, on an invitation or when
      sending an engineer new terms, come from the UI's own copy of the
      catalog (`src/shared/terms.ts`), not the API's.
    when: The API's catalog of Commercial Terms changes.
  - id: agreement-pdf-from-preview
    impact: blocking
    summary: >-
      A client's accepted agreements open their PDF from the API's agreement
      preview, filled in from the placeholder record each time, so they open
      only where `AGREEMENT_PREVIEW_ENABLED` is on (Compose, never
      production). They have to read the API's own agreement endpoints, as an
      engineer's page does.
  - id: readiness-per-person
    impact: inconvenient
    summary: >-
      Whether someone is ready for client work is read for one person at a
      time (`engineers/useReadiness.ts`), since asking whether they can be
      paid asks the payout provider, so the Engineers list can't show it.
      The list has no Agreement column either, as that would take a request
      per engineer.
  - id: partner-page-reads-manager-account
    impact: inconvenient
    summary: >-
      A partner's page reads its manager's own payout account, not the
      partnership's.
  - id: scheduling-placeholder-teams
    impact: negligible
    summary: >-
      Scheduling shows its own placeholder teams (`data/teams.ts`), which
      don't match the API's teams on the Teams page, so its preference for a
      client's teams isn't real.
  - id: creator-role-guarded-by-page
    impact: inconvenient
    summary: >-
      Only the Roles page stops the role given to an organization's creator
      being unmarked or deleted. The API allows it, and the next deploy gives
      creators a role again.
    when: Someone unmarks or deletes the creator role through the API directly.
  - id: one-scope-per-permission
    impact: inconvenient
    summary: >-
      The role editor gives a permission one scope, though the API allows
      several, and saving keeps only the widest, so own and team becomes
      team.
    when: A role is saved with a permission given more than one scope.
  - id: roles-pages-untested
    outcome: functionality/beta/stays-correct
    impact: damaging
    summary: >-
      Roles is tested end to end only by the API's tests. The pages have no
      automated tests of their own.
    when: A change breaks what the Roles pages save.
---

The admin acts in no organization: its requests name none, so the caller's
platform role applies. It isn't gated on any agreement. Each page needs the
permissions its data takes, such as `partner:manage` for Partners or
`payout:manage` for Payouts, and the API refuses what the role doesn't allow.

Some pages are still placeholders, marked Prototype:

- The overview (`overview/`) runs on `data/mock.ts`, except its note of
  overbooked weeks (`OverbookedWeeks`), which is the API's. The API adds up
  every engineer against every booking across Exalynt, so one team's
  overbooked week can be hidden by another's spare time.
- Scheduling (`scheduling/`) runs on `data/mock.ts` and `data/teams.ts`.
  Assigning changes only the page's state. It's marked Prototype in
  `src/featureStability.ts`, below Staffing's Alpha.
- The revenue calculator (`revenue/`) runs on `data/mock.ts`. It's part of
  no capability.
- A client's Coupons tab runs on `data/coupons.ts`, held in memory until a
  reload.
- A client's Agreements tab runs on `data/agreements.ts` and
  `data/sentAgreements.ts`, over placeholder clients. It's marked Prototype,
  below Agreements' Alpha; an engineer's agreements and a partner's are real.
  `SendAgreementDialog` sends through the API only when it's given `onSend`,
  which an engineer's page passes. Without one it records the agreement in
  `data/sentAgreements.ts`, in this browser until a reload.

The rest reads and writes the API. `data/partners.ts` isn't placeholder
data: it keeps the API's partnerships in memory for the Partners pages, read
once by `loadPartners`.

Inviting people to work with Exalynt (`engineers/invitations.ts`, on the
Engineers list) is marked Alpha, below Teams' Beta, which includes it. Each
permission an invitation uses is checked apart: choosing the role takes
`role:manage`, sending it `user_role:manage`, giving it applications
`application_access:manage`, and giving it a team `team:manage`.

Each deploy of the API puts back permissions taken off Admin, Member, Billing
and Administrator, and the Roles page says so for a role by its name alone,
so a role of the other kind with one of those names says it too.
