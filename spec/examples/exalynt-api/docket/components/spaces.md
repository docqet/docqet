---
docket: component
id: spaces
name: Spaces
description: >-
  Our records of each organization's conversation space and who we put in it,
  kept in step with the messaging provider as memberships change, and blocks'
  conversations there. The provider is behind messaging: Google Chat or
  Stream.
capabilities: [capability:conversation-spaces]
gaps:
  - id: sync-users-has-no-hook
    name: User sync doesn't remove people from spaces
    impact: damaging
    likelihood: unlikely
    description: >-
      `api sync users` has no hook, so a ban or deletion it applies doesn't
      take the user out of the provider's spaces. That matters when it bans or
      deletes someone in a real messaging provider's spaces.
---

For spaces and memberships our row comes first and the provider follows. Its
`provider` and `provider_id` stay null until the provider has the thing, and a
record naming another provider counts as not made yet.

- **A space** is recorded in `OrganizationService.CreateReferred`'s
  transaction, with the organization.
- **A block's conversation** is the other way round: `StartBlockConversation`
  has the provider start it within the request, making the space with the
  provider first if it isn't yet, and records it only once that worked, with
  no transaction around the call. A failure records nothing and is the
  caller's error (502), so they can try again.
- **The membership changes with the provider** run after the change commits.
  The services whose changes affect who belongs call one `Spaces` method each:
  - `OrganizationService`: creating an organization, removing a member.
  - `InvitationService`: accepting an invitation to an organization or the
    platform.
  - `TeamService`: assigning and unassigning a client, putting someone on a
    team, taking them off, deleting a team.
  - `RoleService`: taking a platform role away.
  - `UserService`: banning a user, deleting a user.

  Each service gets the hook through `SpacesWith`, wired in `serve`.
- **Every method is the happy path for one change.** It skips what's already
  done, records failures on the request's span, and never fails the change.
- **Whatever a change unlinks is read before it**, such as a team's clients
  before the team is deleted.

`spaces` and `space_memberships` are api_platform's only: no grant opens them
to the organization or partner roles. A block's conversations are for its
client too, so `SpaceService` checks `capacity:read` reaches the block's
organization itself and then reads and writes across organizations, since it
needs the space.

**Without the hook.** A hook that isn't wired is skipped silently: tests and
the CLIs build services without one. An organization created straight through
the repository, as test fixtures are, has no space, so starting a conversation
on its blocks is refused; the acceptance tests make Acme's and Globex's spaces
themselves. Deleting a user without the hook still deletes their memberships
by cascade, but leaves them in the provider's spaces.

**Two at once.** Two people starting a conversation on the same subject at
once both reach the provider before the unique index refuses the second, which
leaves its thread with the provider and no record of it.

**The noop provider** takes any space or conversation it's asked about as
existing, since it forgets everything on restart, so records it made earlier
still work locally.

**Deleting an organization** leaves its space behind, since a space stands on
its own. Acceptance tests and the seeders' reset leave such spaces in the
local database.
