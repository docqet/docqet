---
name: Teams
description: >-
  Exalynt groups its people into teams to work with the clients they're
  assigned to, and a client's teams decide who at Exalynt it sees.
stability: beta
personas:
  - client-admin-founder
  - client-admin-operations
  - client-member
  - exalynt-engineer-1
  - exalynt-engineer-2
  - exalynt-engineer-new-hire
  - exalynt-team-lead
  - exalynt-admin
rules:
  - teams/only-exalynt-makes-teams
  - teams/team-names-are-unique
  - teams/clients-can-have-several-teams
  - teams/teams-can-support-several-clients
  - teams/clients-cant-see-a-teams-other-clients
  - teams/clients-see-only-their-supporting-teams
  - teams/member-access-to-teams-follows-role
  - teams/exalynts-view-of-teams
  - teams/engineers-work-only-with-supported-clients
  - teams/only-exalynt-assigns-teams
  - teams/repeat-assignment-changes-nothing
  - teams/what-counts-as-a-team-update
  - teams/removing-one-team-keeps-the-others
  - teams/deleted-teams-disappear-for-clients
  - teams/members-are-listed-lead-first
  - teams/one-team-per-engineer
  - teams/one-lead-per-team
  - teams/a-departing-lead-leaves-no-lead
  - teams/removed-members-leave-every-clients-view
  - teams/removing-someone-already-gone
  - teams/only-exalynts-people-join-teams
  - engineer-profiles/who-edits-a-bio
  - engineer-profiles/who-sees-a-bio
  - engineer-profiles/bios-are-at-most-500-characters
  - engineer-profiles/clearing-a-bio-leaves-none
  - team-assignment/least-unfulfilled-capacity-wins
  - team-assignment/fewest-clients-breaks-ties
  - team-assignment/only-teams-offering-time-qualify
  - team-assignment/signing-up-without-a-team
  - onboarding/engineers-join-by-invitation-only
  - onboarding/existing-accounts-gain-the-engineer-role
  - onboarding/admins-see-and-revoke-all-invitations
  - onboarding/invalid-payout-accounts-delay-payment
  - onboarding/when-an-engineer-is-ready
  - onboarding/invited-engineers-join-their-team
concepts: [team, organization]
gaps:
  - id: no-resending-invitations
    impact: inconvenient
    summary: >-
      An admin can't resend a pending engineer invitation: they revoke it and
      invite the same address again. Once resending comes, any admin can
      resend any of them, not only the ones they sent.
  - id: team-changes-unannounced
    impact: inconvenient
    summary: >-
      Moving or removing an engineer, or removing a team from a client, takes
      the engineers it leaves ineligible off that client's blocks whose week
      hasn't started, back to the shared queue, but nobody sees which blocks
      before the change, and nobody is told. A block whose week has started,
      or that work has begun on, keeps its engineer until an admin reassigns
      or unassigns it through Staffing.
    when: An engineer is moved or removed, or a team is taken off a client.
  - id: last-team-removable
    impact: inconvenient
    summary: >-
      A client's last team can be removed even while the client has scheduled
      blocks. Those blocks stay scheduled and owed, but no one can claim them
      until a team is assigned again, and nothing stops the removal.
    when: A client's last team is removed while it has scheduled blocks.
  - id: team-name-last-save-wins
    impact: inconvenient
    summary: >-
      The last save wins on a team's name: nothing checks what the person last
      read.
    when: Two people rename a team at once.
  - id: names-can-name-clients
    impact: damaging
    summary: >-
      Nothing checks that a team's name doesn't name one of its clients,
      though every client it supports sees it. Name teams for what they do.
    when: A team is named after one of its clients.
  - id: no-team-history
    impact: inconvenient
    summary: >-
      Nothing keeps a history of who was on a team, or which teams a client
      had, and a deleted team can't be undone.
  - id: moves-unchecked-against-blocks
    impact: inconvenient
    summary: >-
      Moving an engineer off a team, or taking a team off a client, isn't
      checked against the blocks they're assigned. They stay on those blocks
      until they're reassigned through Staffing.
    when: >-
      An engineer on blocks is moved off a team, or their team is taken off a
      client.
  - id: no-team-notifications
    impact: inconvenient
    summary: >-
      Nobody is told when they're put on a team, or when a client's teams
      change, including the client given a team at sign-up.
  - id: clients-see-name-and-email-only
    impact: negligible
    summary: Clients see a member's name and email only.
  - id: leavers-stay-on-teams
    impact: inconvenient
    summary: >-
      Someone who leaves Exalynt drops off the team without being taken off
      it, and is back on it if they rejoin.
    when: Someone who left Exalynt rejoins.
  - id: team-reread-each-time
    impact: negligible
    summary: The team is read again each time it's shown.
  - id: teamless-clients-not-listed
    impact: inconvenient
    summary: >-
      Nothing lists the clients no team is assigned to. Teams lists only the
      teams, and Engineers filters for engineers on no team.
  - id: team-choice-blind
    impact: inconvenient
    summary: >-
      Choosing a team for a client doesn't say how much room the team has,
      and nothing says what kind of work suits it.
  - id: invitation-terms-hidden
    impact: inconvenient
    summary: The pending engineer invitations don't show the terms they carry.
  - id: terms-from-the-apps-copy
    impact: damaging
    summary: >-
      The terms on an invitation come from the app's own copy of the terms
      catalog.
    when: The terms catalog changes and the app's copy isn't updated.
  - id: invitations-dont-expire
    impact: damaging
    summary: An engineer invitation doesn't expire.
    when: An old invitation is accepted by someone who shouldn't join any more.
  - id: invitation-permissions-split
    impact: inconvenient
    summary: >-
      Choosing an invitation's role, sending it, giving it applications, and
      giving it a team each need their own permission.
  - id: leads-lose-lead-on-accepting
    impact: inconvenient
    summary: >-
      Someone who already leads the team they're invited to stops leading it
      when they accept.
    when: Someone is invited to the team they already lead.
  - id: tested-only-through-the-api
    outcome: functionality/beta/stays-correct
    impact: inconvenient
    summary: >-
      The workflow is tested end to end only through the API. The apps' own
      tests cover reading every page of teams, the order people show in, and
      finding an engineer's team.
    when: A change breaks the apps' side of the workflow.
tradeoffs:
  - id: names-unique-across-all-teams
    impact: negligible
    summary: Team names are unique across all teams, not per client.
    drawback: >-
      Two teams can't both be called "Platform", even for different clients.
    when: Teams for different clients would take the same name.
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
