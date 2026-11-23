---
name: Roles
description: >-
  Exalynt's admins decide what people may do by making roles: platform roles
  for people who work with Exalynt, and organization roles for client
  organizations' members.
stability: alpha
personas: [exalynt-admin]
rules:
  - roles-and-access/permissions-follow-where-someone-acts
  - roles-and-access/no-platform-role-means-no-permissions
  - roles-and-access/creators-get-the-creator-role
  - roles-and-access/member-permissions-follow-their-role
  - roles-and-access/outsiders-cant-change-organization-roles
  - roles-and-access/acting-as-engineer-or-client-never-both
  - roles-and-access/team-scoped-capacity-access
  - roles-and-access/own-scoped-capacity-access
  - roles-and-access/read-only-engineers-cant-staff-blocks
  - roles-and-access/only-exalynt-lists-its-clients
  - roles-and-access/what-each-role-kind-may-grant
  - roles-and-access/exalynt-only-permissions-cant-be-granted
  - roles-and-access/roles-grant-only-what-their-kind-allows
  - roles-and-access/who-reads-permissions-and-makes-roles
  - roles-and-access/deleted-roles-cant-be-found
  - roles-and-access/held-platform-roles-cant-be-deleted
  - roles-and-access/invited-roles-cant-be-deleted
  - roles-and-access/who-gives-out-platform-roles
  - roles-and-access/role-names-are-unique-within-their-kind
  - roles-and-access/only-one-creator-role
  - roles-and-access/the-creator-role-can-manage-members
  - roles-and-access/held-organization-roles-cant-be-deleted
  - roles-and-access/held-roles-keep-member-management
  - roles-and-access/people-lists-exclude-clients
  - roles-and-access/listing-people-requires-a-platform-role
  - roles-and-access/platform-roles-arent-organization-roles
  - roles-and-access/role-edits-keep-the-description
  - roles-and-access/roles-stay-with-their-own-kind
  - roles-and-access/platform-roles-can-be-taken-away
  - roles-and-access/who-invites-people-to-exalynt
  - roles-and-access/exalynt-invitations-show-as-pending
  - roles-and-access/accepting-an-invitation-to-exalynt
  - roles-and-access/new-people-have-no-applications
  - roles-and-access/applications-show-on-the-person
  - roles-and-access/who-sets-application-access
  - roles-and-access/inviting-with-applications-needs-access
concepts: [role, organization]
gaps:
  - id: holders-not-shown
    impact: inconvenient
    summary: >-
      How many people hold a role isn't shown, so whether one can be deleted
      is only learned by trying.
  - id: roles-given-elsewhere
    impact: inconvenient
    summary: >-
      Nobody is given a role while managing roles: invitations and the API
      give platform roles, and an organization's own members give
      organization roles.
  - id: one-scope-per-permission
    impact: blocking
    summary: >-
      A permission can be given only one scope when editing a role, though
      several are allowed. Saving a role's permissions keeps only the widest,
      so own and team becomes team, and someone on no team loses their own
      reach.
    when: A role with a permission given several scopes is saved in the app.
  - id: deploys-restore-built-in-roles
    impact: damaging
    summary: >-
      Each deploy puts back permissions taken off Admin, Member, Billing, and
      Administrator, and renaming one makes a new role under the old name. A
      role says so going by name alone, so a role of the other kind with one
      of those names says it too.
    when: An admin takes a permission off a built-in role, or renames one.
  - id: creator-role-guarded-only-by-the-app
    rule: roles-and-access/creators-get-the-creator-role
    impact: blocking
    summary: >-
      Only the app stops the role given to creators being unmarked or
      deleted: the API allows it, and the next deploy gives creators a role
      again.
    when: Someone unmarks or deletes the creators' role through the API.
  - id: tested-only-through-the-api
    outcome: functionality/beta/stays-correct
    impact: inconvenient
    summary: >-
      The workflow is tested end to end only through the API: the apps have
      no automated tests of their own for it.
    when: A change breaks managing roles in the apps.
---

## Includes

- Admins see the permissions roles can grant, and how platform and organization
  roles differ.
- Admins change or delete a platform role, granting each permission at a scope.
- Admins change or delete an organization role, and choose which role whoever
  creates an organization is given.
- Admins start a new role from a copy of another.
