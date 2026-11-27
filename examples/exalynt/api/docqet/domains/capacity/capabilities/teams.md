---
docqet: capability
id: teams
domain: capacity
name: Teams
description: >-
  Exalynt groups its people into teams to work with the clients they're
  assigned to, and a client's teams decide who at Exalynt it sees.
stability: beta
solves:
  - problem:spend-without-visible-progress
  - problem:requests-go-unheard
  - problem:working-without-client-context
  - problem:new-engineer-unsure-ready-or-paid
  - problem:team-trouble-seen-one-by-one
initiatives: [initiative:mvp]
rules:
  - rule:only-exalynt-makes-teams
  - rule:team-names-are-unique
  - rule:clients-can-have-several-teams
  - rule:teams-can-support-several-clients
  - rule:clients-cant-see-a-teams-other-clients
  - rule:clients-see-only-their-supporting-teams
  - rule:member-access-to-teams-follows-role
  - rule:exalynts-view-of-teams
  - rule:engineers-work-only-with-supported-clients
  - rule:only-exalynt-assigns-teams
  - rule:repeat-assignment-changes-nothing
  - rule:what-counts-as-a-team-update
  - rule:removing-one-team-keeps-the-others
  - rule:deleted-teams-disappear-for-clients
  - rule:members-are-listed-lead-first
  - rule:one-team-per-engineer
  - rule:one-lead-per-team
  - rule:a-departing-lead-leaves-no-lead
  - rule:removed-members-leave-every-clients-view
  - rule:removing-someone-already-gone
  - rule:only-exalynts-people-join-teams
  - rule:who-edits-a-bio
  - rule:who-sees-a-bio
  - rule:bios-are-at-most-500-characters
  - rule:clearing-a-bio-leaves-none
  - rule:least-unfulfilled-capacity-wins
  - rule:fewest-clients-breaks-ties
  - rule:only-teams-offering-time-qualify
  - rule:signing-up-without-a-team
  - rule:engineers-join-by-invitation-only@accounts
  - rule:existing-accounts-gain-the-engineer-role@accounts
  - rule:admins-see-and-revoke-all-invitations@accounts
  - rule:invalid-payout-accounts-delay-payment@accounts
  - rule:when-an-engineer-is-ready@accounts
  - rule:invited-engineers-join-their-team@accounts
concepts: [concept:team, concept:organization@accounts]
gaps:
  - id: names-can-name-clients
    name: Team names can name clients
    impact: damaging
    likelihood: unlikely
    reach: all
    description: >-
      Nothing checks that a team's name doesn't name one of its clients,
      though every client it supports sees it. Name teams for what they do.
      That matters if a team is named after one of its clients.
  - id: terms-from-the-apps-copy
    name: Terms from the app's own catalog copy
    impact: damaging
    likelihood: unlikely
    reach: all
    description: >-
      The terms on an invitation come from the app's own copy of the terms
      catalog. That matters once the terms catalog changes and the app's copy
      isn't updated.
  - id: invitations-dont-expire
    name: Invitations don't expire
    impact: damaging
    likelihood: unlikely
    reach: all
    description: >-
      An engineer invitation doesn't expire. That matters if an old invitation
      is accepted by someone who shouldn't join any more.
tradeoffs:
  - id: names-unique-across-all-teams
    name: Names unique across teams, not per client
    description: Team names are unique across all teams, not per client.
    drawback: >-
      Two teams can't both be called "Platform", even for different clients.
---

## Includes

- Clients see the engineering teams assigned to their organization, and each
  team's engineers and lead.
- Clients get to know each engineer on their teams through their short bio, and
  see how long they've been with Exalynt.
- Engineers see the team they belong to, its members, and its lead if there is
  one.
- Engineers see which clients their team supports.
- Engineers see their teammates' bios.
- Engineers write a bio about themselves, and change or clear it.
- Team leads see the team they lead, its engineers, and the clients it supports.
- Admins invite an engineer to Exalynt by email, including someone who already
  has an account as a client member or partner.
- Admins see pending engineer invitations, with each one's email address and
  when it was sent, and revoke one.
- Admins choose the team an engineer joins when they accept their invitation.
- Admins write, change, or clear any engineer's bio.
- Admins create and manage engineering teams.
- Admins assign an engineer to a team, move them to another team, or remove them
  from their team.
- Admins designate or remove a team's lead.
- Admins assign engineering teams to a client organization, or remove them.
