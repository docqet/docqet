---
docqet: component
id: admin
name: Admin
description: >-
  The admin, where Exalynt's admins run clients, partners, engineers, teams,
  roles and payouts.
serves:
  - capability:client-directory
  - capability:client-coupons
  - capability:partnerships
  - capability:engineers
  - capability:agreements
  - capability:teams
  - capability:staffing
  - capability:payouts
  - capability:roles
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
