---
docket: concept
id: access-token
domain: accounts
name: Access token
description: >-
  A personal access token lets someone's scripts and tools call the API as
  them.
confused-with:
  - concept: concept:role
    summary: >-
      a role says what someone may do. A token only identifies who is
      calling.
---

A token is a person's own, not an [organization](organization.md)'s, and holds no
access of its own: it acts with its user's [roles](role.md), so a change to those
applies at once. It has a name, an optional description, and an optional expiry.

A limited token is one limited, when it's created, to some of the organizations
its user belongs to, so it works only in those. Any other works in all of them.
