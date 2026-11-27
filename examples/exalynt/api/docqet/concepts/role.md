---
docqet: concept
id: role
name: Role
description: >-
  A role is a named set of permissions that says what someone may do. There
  are two kinds: platform roles, for people who work with Exalynt, and
  organization roles, for a client [organization](organization.md)'s members.
confused-with:
  - concept: concept:access-token
    summary: a token holds no access of its own. It acts with its user's roles.
---

A permission is something checked before it's done, such as scheduling a block.
It says what may be done, never where.

A platform role says what someone who works with Exalynt may do when they aren't
acting in any organization. It grants each permission at a scope, how far that
permission reaches from the person holding it: their own, their
[team](team.md)'s, or everything. A person holds at most one platform role.

An organization role says what a member of an organization may do in that
organization, each permission reaching that organization and no further. A
member holds exactly one in each organization they belong to, such as Admin,
Member, or Billing. Organization roles are shared by every organization, not made
per organization, and one of them is the role given to whoever creates an
organization.

One role applies at a time, by where someone is acting. The two kinds never
merge.

Which of Exalynt's applications someone is offered belongs to them directly, not
to a role.
