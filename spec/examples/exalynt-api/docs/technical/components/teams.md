---
name: Teams
summary: >-
  Who at Exalynt a client sees and, through the `team` scope, which clients'
  records an engineer can reach.
start: >-
  `internal/services/teams.go`, `internal/services/team_assignment.go`,
  `internal/repositories/postgres/team.go`
capabilities:
  - teams
  - client-directory
  - engineers
  - engineer-onboarding
  - organizations-and-members
  - staffing
code:
  - internal/services/teams.go
  - internal/services/team_assignment.go
  - internal/repositories/postgres/team.go
---

`teams`, `team_members` (keyed by user, so the one-team rule is the primary
key), and `team_clients`. A partial unique index keeps one lead per team, and
a unique index on `lower(name)` holds names distinct.

`OrganizationService.Create` assigns a new client a team once its organization
exists, through `CapacityService.AssignLeastLoadedTeam`: fewest unfulfilled
units, then fewest clients, then first by name, among teams with an engineer
offering time in one of the next three weeks. Assigning runs outside the
sign-up's transaction so it can't undo the sign-up, and always as the system,
not the person signing up. When no team qualifies, the client signs up with
none.

**Members.** Someone who loses their platform role keeps their row on the team
but isn't read as a member, so giving a role back restores them. A team's row
is locked while someone's put on it, so two people made its lead at once take
turns.

**Releasing blocks.** Changing a team's members or clients, or deleting it,
also runs `CapacityService.ReleaseIneligible` in the same transaction, across
organizations, which takes engineers off upcoming blocks of clients they no
longer support. That's wired with `TeamService.ReleaseBlocksWith` in `serve`;
a `TeamService` built without it, as in unit tests, leaves blocks alone. It
locks every upcoming block, which is fine at a few hundred.

**Reads.** A client's teams and a person's team are read unpaginated inside
the API, the second on each request an engineer makes with a `team` grant.
Both are a few rows. Of a team's clients a caller sees only those they reach,
so a client never learns who else a team works with. A list's cursor holds
only its place, so following another caller's reads only the caller's own
teams.
