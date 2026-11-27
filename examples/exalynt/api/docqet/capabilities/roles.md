---
docqet: capability
id: roles
name: Roles
description: >-
  Exalynt's admins decide what people may do by making roles: platform roles
  for people who work with Exalynt, and organization roles for client
  organizations' members.
stability: alpha
within: feature:access
solves: [problem:access-doesnt-match-the-job]
included-in: [initiative:mvp]
follows:
  - rule:permissions-follow-where-someone-acts
  - rule:no-platform-role-means-no-permissions
  - rule:creators-get-the-creator-role
  - rule:member-permissions-follow-their-role
  - rule:outsiders-cant-change-organization-roles
  - rule:acting-as-engineer-or-client-never-both
  - rule:team-scoped-capacity-access
  - rule:own-scoped-capacity-access
  - rule:read-only-engineers-cant-staff-blocks
  - rule:only-exalynt-lists-its-clients
  - rule:what-each-role-kind-may-grant
  - rule:exalynt-only-permissions-cant-be-granted
  - rule:roles-grant-only-what-their-kind-allows
  - rule:who-reads-permissions-and-makes-roles
  - rule:deleted-roles-cant-be-found
  - rule:held-platform-roles-cant-be-deleted
  - rule:invited-roles-cant-be-deleted
  - rule:who-gives-out-platform-roles
  - rule:role-names-are-unique-within-their-kind
  - rule:only-one-creator-role
  - rule:the-creator-role-can-manage-members
  - rule:held-organization-roles-cant-be-deleted
  - rule:held-roles-keep-member-management
  - rule:people-lists-exclude-clients
  - rule:listing-people-requires-a-platform-role
  - rule:platform-roles-arent-organization-roles
  - rule:role-edits-keep-the-description
  - rule:roles-stay-with-their-own-kind
  - rule:platform-roles-can-be-taken-away
  - rule:who-invites-people-to-exalynt
  - rule:exalynt-invitations-show-as-pending
  - rule:accepting-an-invitation-to-exalynt
  - rule:new-people-have-no-applications
  - rule:applications-show-on-the-person
  - rule:who-sets-application-access
  - rule:inviting-with-applications-needs-access
uses: [concept:role, concept:organization]
gaps:
  - id: one-scope-per-permission
    name: Only one scope per permission
    impact: inconvenient
    likelihood: possible
    reach: few
    description: >-
      A permission can be given only one scope when editing a role, though
      several are allowed. Saving a role's permissions keeps only the widest,
      so own and team becomes team, and someone on no team loses their own
      reach. That happens when a role with a permission given several scopes
      is saved in the app.
  - id: deploys-restore-built-in-roles
    name: Deploys restore built-in roles
    impact: damaging
    likelihood: unlikely
    reach: all
    description: >-
      Each deploy puts back permissions taken off Admin, Member, Billing, and
      Administrator, and renaming one makes a new role under the old name. A
      role says so going by name alone, so a role of the other kind with one
      of those names says it too. That bites when an admin takes a permission
      off a built-in role, or renames one.
---

## Includes

- Admins see the permissions roles can grant, and how platform and organization
  roles differ.
- Admins change or delete a platform role, granting each permission at a scope.
- Admins change or delete an organization role, and choose which role whoever
  creates an organization is given.
- Admins start a new role from a copy of another.
