---
id: teams
name: Teams
description: >-
  Exalynt groups its people into teams to work with the clients they're
  assigned to, and a client's teams decide who at Exalynt it sees.
stability: beta
personas:
  - persona:client-admin-founder
  - persona:client-admin-operations
  - persona:client-member
  - persona:exalynt-engineer-1
  - persona:exalynt-engineer-2
  - persona:exalynt-engineer-new-hire
  - persona:exalynt-team-lead
  - persona:exalynt-admin
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
  - id: no-resending-invitations
    name: Invitations can't be resent
    impact: inconvenient
    description: >-
      An admin can't resend a pending engineer invitation: they revoke it and
      invite the same address again. Once resending comes, any admin can
      resend any of them, not only the ones they sent.
  - id: team-changes-unannounced
    name: Team changes' effect on blocks unannounced
    impact: inconvenient
    description: >-
      Moving or removing an engineer, or removing a team from a client, takes
      the engineers it leaves ineligible off that client's blocks whose week
      hasn't started, back to the shared queue, but nobody sees which blocks
      before the change, and nobody is told. A block whose week has started,
      or that work has begun on, keeps its engineer until an admin reassigns
      or unassigns it through Staffing.
    when: An engineer is moved or removed, or a team is taken off a client.
  - id: last-team-removable
    name: Last team removable with blocks scheduled
    impact: inconvenient
    description: >-
      A client's last team can be removed even while the client has scheduled
      blocks. Those blocks stay scheduled and owed, but no one can claim them
      until a team is assigned again, and nothing stops the removal.
    when: A client's last team is removed while it has scheduled blocks.
  - id: team-name-last-save-wins
    name: Last save wins on team names
    impact: inconvenient
    description: >-
      The last save wins on a team's name: nothing checks what the person last
      read.
    when: Two people rename a team at once.
  - id: names-can-name-clients
    name: Team names can name clients
    impact: damaging
    description: >-
      Nothing checks that a team's name doesn't name one of its clients,
      though every client it supports sees it. Name teams for what they do.
    when: A team is named after one of its clients.
  - id: no-team-history
    name: No team history or undo
    impact: inconvenient
    description: >-
      Nothing keeps a history of who was on a team, or which teams a client
      had, and a deleted team can't be undone.
  - id: moves-unchecked-against-blocks
    name: Moves not checked against assigned blocks
    impact: inconvenient
    description: >-
      Moving an engineer off a team, or taking a team off a client, isn't
      checked against the blocks they're assigned. They stay on those blocks
      until they're reassigned through Staffing.
    when: >-
      An engineer on blocks is moved off a team, or their team is taken off a
      client.
  - id: no-team-notifications
    name: No notice of team changes
    impact: inconvenient
    description: >-
      Nobody is told when they're put on a team, or when a client's teams
      change, including the client given a team at sign-up.
  - id: clients-see-name-and-email-only
    name: Clients see only name and email
    impact: negligible
    description: Clients see a member's name and email only.
  - id: leavers-stay-on-teams
    name: Leavers stay on teams
    impact: inconvenient
    description: >-
      Someone who leaves Exalynt drops off the team without being taken off
      it, and is back on it if they rejoin.
    when: Someone who left Exalynt rejoins.
  - id: team-reread-each-time
    name: Team read again each time
    impact: negligible
    description: The team is read again each time it's shown.
  - id: teamless-clients-not-listed
    name: Clients without a team not listed
    impact: inconvenient
    description: >-
      Nothing lists the clients no team is assigned to. Teams lists only the
      teams, and Engineers filters for engineers on no team.
  - id: team-choice-blind
    name: Team choice shows no room or fit
    impact: inconvenient
    description: >-
      Choosing a team for a client doesn't say how much room the team has,
      and nothing says what kind of work suits it.
  - id: invitation-terms-hidden
    name: Invitation terms hidden
    impact: inconvenient
    description: The pending engineer invitations don't show the terms they carry.
  - id: terms-from-the-apps-copy
    name: Terms from the app's own catalog copy
    impact: damaging
    description: >-
      The terms on an invitation come from the app's own copy of the terms
      catalog.
    when: The terms catalog changes and the app's copy isn't updated.
  - id: invitations-dont-expire
    name: Invitations don't expire
    impact: damaging
    description: An engineer invitation doesn't expire.
    when: An old invitation is accepted by someone who shouldn't join any more.
  - id: invitation-permissions-split
    name: Invitation steps need separate permissions
    impact: inconvenient
    description: >-
      Choosing an invitation's role, sending it, giving it applications, and
      giving it a team each need their own permission.
  - id: leads-lose-lead-on-accepting
    name: Leads lose the lead on accepting
    impact: inconvenient
    description: >-
      Someone who already leads the team they're invited to stops leading it
      when they accept.
    when: Someone is invited to the team they already lead.
  - id: tested-only-through-the-api
    name: Tested end to end only through the API
    outcome: functionality/beta/stays-correct
    impact: inconvenient
    description: >-
      The workflow is tested end to end only through the API. The apps' own
      tests cover reading every page of teams, the order people show in, and
      finding an engineer's team.
    when: A change breaks the apps' side of the workflow.
tradeoffs:
  - id: names-unique-across-all-teams
    name: Names unique across teams, not per client
    impact: negligible
    description: Team names are unique across all teams, not per client.
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
