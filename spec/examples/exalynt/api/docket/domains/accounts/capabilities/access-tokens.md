---
docket: capability
id: access-tokens
domain: accounts
name: Access tokens
description: >-
  People create personal access tokens so their scripts and tools can call the
  API as them, everywhere they belong or only in the organizations they
  choose.
stability: beta
personas:
  - persona:client-admin-founder
  - persona:client-admin-operations
  - persona:client-member
  - persona:client-billing
  - persona:exalynt-admin
  - persona:exalynt-engineer-1
  - persona:exalynt-engineer-2
  - persona:exalynt-engineer-new-hire
  - persona:exalynt-team-lead
  - persona:partner
initiatives: [initiative:mvp]
rules:
  - rule:tokens-carry-their-creators-access
  - rule:role-changes-apply-at-once
  - rule:tokens-stay-in-their-creators-organizations
  - rule:secret-shown-only-once
  - rule:managing-tokens-requires-a-session
  - rule:tokens-are-private-to-their-owner
  - rule:revoked-tokens-stop-working
  - rule:tokens-cover-all-organizations-by-default
  - rule:limited-tokens-work-only-where-limited
  - rule:limited-tokens-must-name-an-organization
  - rule:unlimited-tokens-follow-their-creator
  - rule:limits-need-the-creators-membership
  - rule:limited-tokens-reveal-only-their-organizations
  - rule:a-tokens-organizations-are-fixed
  - rule:limited-tokens-cant-act-elsewhere
  - rule:unknown-tokens-sign-no-one-in
  - rule:expired-tokens-sign-no-one-in
  - rule:expired-tokens-stay-listed
  - rule:deleting-someone-deletes-their-tokens
  - rule:bans-suspend-a-persons-tokens
  - rule:last-use-is-recorded
  - rule:limited-tokens-keep-an-organization
  - rule:limits-never-widen
  - rule:owners-see-a-tokens-limits
concepts: [concept:access-token, concept:organization, concept:role]
gaps:
  - id: impersonators-can-create-tokens
    name: Impersonators can create lasting tokens
    impact: damaging
    likelihood: unlikely
    description: >-
      Someone impersonating a user through the sign-in provider can create a
      token for them, which outlasts the impersonation.
  - id: bans-can-arrive-late
    name: Bans can arrive late or out of order
    affects:
      - rule:bans-suspend-a-persons-tokens
    impact: damaging
    likelihood: unlikely
    description: >-
      A ban can arrive late or out of order: a banned user's tokens work until
      word of it arrives. An older update arriving after the ban undoes it
      until the next update or a sync, and nothing runs the sync on a
      schedule, so that could be a long time. An update that doesn't mention a
      ban leaves it alone.
tradeoffs:
  - id: no-scopes
    name: Tokens have no scopes
    description: >-
      A token can do everything its user can, wherever it works: there are no
      scopes.
    drawback: >-
      A script that needs only a little access holds all of its user's. That
      matters when a script's token leaks or the script misbehaves.
  - id: managing-tokens-needs-a-session
    name: Managing tokens needs a session, not a token
    description: >-
      Managing tokens needs a session: a token can't list, create, or revoke
      tokens.
    drawback: Tokens can't be managed from scripts.
  - id: limited-tokens-reach-their-users-record
    name: Limited tokens still reach their user's record
    description: >-
      A limited token still reaches its user's own record: it can read and
      change their profile, including updating it from the sign-in provider,
      and sees their platform role and applications.
    drawback: >-
      A limited token reaches more than its organizations, though none of it
      reveals another organization. That matters only when a limited token
      leaks or its script misbehaves.
  - id: limited-tokens-can-leave
    name: Limited tokens can leave an organization
    description: >-
      A limited token can remove its user from one of its organizations, as
      their own session can.
    drawback: >-
      A script can take its user out of an organization. That's within its
      limit, and acts on nothing else. It matters only if a script actually
      does.
  - id: failed-authentication-not-rate-limited
    name: Failed authentication isn't rate limited
    description: Requests that fail to authenticate aren't rate limited.
    drawback: >-
      Each request with a bad token costs a lookup that nothing counts, though a
      token can't be guessed. That matters only if someone floods the API with
      bad tokens.
---

## Includes

- Everyone lists and revokes their personal access tokens.
- Everyone sees where each of their tokens works.
