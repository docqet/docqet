---
docqet: mechanism
id: authorization
name: Authorization
description: >-
  Decides what a caller may do and which records they may do it to, from the
  Principal authentication built. It knows nothing of tokens or the database.
  What the terms mean in the domain is in the role and organization concepts.
tradeoffs:
  - id: application-access-not-enforced
    name: Application access enforced only by the front ends
    description: >-
      Which applications someone is offered is `application_access`, held per
      user and not by role, and only the front ends act on it: they decide
      what to show by it, and the API keeps checking permissions.
    drawback: >-
      Someone who isn't offered an application can still call its routes with
      whatever their permissions allow. That matters when an organization
      counts on application access alone to keep someone out of an
      application.
---

| Term | What it is | Where |
| --- | --- | --- |
| **Permission** | Something checked before doing it, as `resource:action`. Says what, never where | `authz.Catalog()` |
| **Platform role** | What people working with Exalynt may do when a request acts in no organization. A set of grants; a user holds at most one | `users.platform_role_id` |
| **Grant** | One permission at one scope, in a platform role | `authz.Grant` |
| **Scope** | How far a platform grant reaches from the caller: `global`, `team`, or `own`. Only platform roles have them | `authz/scope.go` |
| **Organization role** | What a member may do in that organization. A set of permissions; each membership holds one | `organization_members.role_id` |
| **Bounds** | The records a caller may act on with a permission: these organizations and users, or all | `authz.Bounds` |

A request's role turns into Bounds in the Principal: an organization role
bounds each permission to that organization, and a platform role resolves each
scope once, through its registry entry and `authz.Directory`. Services and
repositories only ever see Bounds, so a member's "this organization" and an
engineer's "my team's clients" are checked the same way.

A service requires the permission, then reads and writes within what it gets:

```go
bounds, err := authz.Require(ctx, authz.CapacitySchedule)  // ErrForbidden if not held
capacity, err := s.capacities.GetByID(ctx, bounds, id)     // ErrNotFound → ErrCapacityNotFound
```

Every table whose records a caller acts on directly has one bounds rule, beside
its columns: the condition matching a set of organizations, and the one
matching a set of users. `List` and `GetByID` both apply it. What hangs off a
parent (such as messages) is read by the parent's ID once the parent has been
read within Bounds, and needs no rule of its own. Creates go through
`organizationFor`. `authz.Allows` says whether a permission is held at all, for
deciding what to show.

`GET /v1/permissions` serves the catalog to whoever builds roles, and
`authz.NormalizeGrants` and `authz.NormalizePermissions` check roles against it
on save.

Postgres enforces the organization boundary again underneath: see
[row-level security](row-level-security.md).

**Out of bounds looks like not found.** A record outside the caller's Bounds
is a `404`, so nobody can probe for another organization's records. Not
holding the permission at all is a `403`. The zero `Bounds` cover nothing, so
a query whose Bounds were never set finds nothing. A permission at a scope
that covers nothing, such as `team` while on no team, gets empty Bounds and not
an error.

**`authz.All`** is for the API's own lookups, such as re-reading something
just authorized under a lock. Every use in a service carries a comment saying
why. A permission neither kind of role can grant, such as `identity:sync`, is
held only by service actors.

**Stored roles.** Permissions and scopes are stored as text, so one removed
from the code simply stops counting. `api provision roles --apply` runs on
every deploy and makes sure Admin, Member, and Billing hold at least what
`authz.OrganizationRoles` gives them, so removing a permission from one of
those by hand lasts until the next deploy. A role any member holds, or marked
`assign_to_creator`, keeps `member:manage` (`ErrRoleManagesMembers`), so an
organization can't be left with nobody who can give it to anyone.

**Bootstrap.** On a new deployment nobody can manage roles.
`api access bootstrap --apply` makes someone the platform Administrator, and
every deploy runs it with `--create` for the platform's own administrator
(`.kube/migrate-job.yaml`).

**Adding to it.**

- **A permission** is a constant and `Definition` in `authz/catalog.go`,
  describing what each scope and the organization role give for it, and an
  `authz.Require` in the operations that need it. The catalog tests fail for a
  constant with no definition.
- **A platform scope** is a constant and its registry entry in
  `authz/scope.go`, which the scope tests fail without, offered on the
  permissions it applies to in the catalog. Data it needs about the caller
  comes through a method on `authz.Directory`, implemented in
  `internal/authn/directory.go`, which keeps `authz` free of the
  repositories. If it bounds records by something `authz.Bounds` doesn't hold,
  that's a field there and a condition in each bounds rule that honors it.
- **A resource** either has a bounds rule on its table, with `GetByID` taking
  `authz.Bounds` and its query a `Bounds` field, or is read only through a
  parent. Either way, its table needs row-level security.
- **A new place a request can act** isn't a new scope. Partnerships are the
  worked example: a route names it, `services.ReachPartnership` checks the
  caller belongs, and the request then runs on that place's own database role.
  A role table is only needed if admins must give its people different
  permissions.
