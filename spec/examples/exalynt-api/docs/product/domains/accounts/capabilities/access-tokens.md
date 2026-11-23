---
name: Access tokens
summary: >-
  People create personal access tokens so their scripts and tools can call the
  API as them, everywhere they belong or only in the organizations they
  choose.
stability: beta
personas:
  - client-admin-founder
  - client-admin-operations
  - client-member
  - client-billing
  - exalynt-admin
  - exalynt-engineer-1
  - exalynt-engineer-2
  - exalynt-engineer-new-hire
  - exalynt-team-lead
  - partner
rules:
  - access-tokens/tokens-carry-their-creators-access
  - access-tokens/role-changes-apply-at-once
  - access-tokens/tokens-stay-in-their-creators-organizations
  - access-tokens/secret-shown-only-once
  - access-tokens/managing-tokens-requires-a-session
  - access-tokens/tokens-are-private-to-their-owner
  - access-tokens/revoked-tokens-stop-working
  - access-tokens/tokens-cover-all-organizations-by-default
  - access-tokens/limited-tokens-work-only-where-limited
  - access-tokens/limited-tokens-must-name-an-organization
  - access-tokens/unlimited-tokens-follow-their-creator
  - access-tokens/limits-need-the-creators-membership
  - access-tokens/limited-tokens-reveal-only-their-organizations
  - access-tokens/a-tokens-organizations-are-fixed
  - access-tokens/limited-tokens-cant-act-elsewhere
  - access-tokens/unknown-tokens-sign-no-one-in
  - access-tokens/expired-tokens-sign-no-one-in
  - access-tokens/expired-tokens-stay-listed
  - access-tokens/deleting-someone-deletes-their-tokens
  - access-tokens/bans-suspend-a-persons-tokens
  - access-tokens/last-use-is-recorded
  - access-tokens/limited-tokens-keep-an-organization
  - access-tokens/limits-never-widen
  - access-tokens/owners-see-a-tokens-limits
concepts: [access-token, organization, role]
gaps:
  - id: old-code-ignores-limits
    outcome: reliability/beta/undo-release
    text: >-
      Older code ignores limits: a limited token works everywhere on an
      instance running code from before limits, during a rolling deploy or
      after rolling the code back. Before rolling back past them, the limited
      tokens have to be deleted.
  - id: left-organizations-stay-listed
    text: >-
      The list keeps organizations someone has left. Someone sees only those
      they belonged to when it was last read: it's read again after they
      leave, create, or join one, but not when someone else removes them,
      until they reload. The token is refused there either way.
  - id: impersonators-can-create-tokens
    text: >-
      Someone impersonating a user through the sign-in provider can create a
      token for them, which outlasts the impersonation.
  - id: no-token-oversight
    outcome: security/ga/traceable
    text: >-
      No email is sent when a token is created, there's no admin view of
      everyone's tokens, and no record of what a token did beyond the record
      of each request.
  - id: no-token-limit
    text: Nothing limits how many tokens someone can create.
  - id: bans-can-arrive-late
    rule: access-tokens/bans-suspend-a-persons-tokens
    text: >-
      A ban can arrive late or out of order: a banned user's tokens work until
      word of it arrives. An older update arriving after the ban undoes it
      until the next update or a sync, and nothing runs the sync on a
      schedule, so that could be a long time. An update that doesn't mention a
      ban leaves it alone.
  - id: bans-not-always-recorded
    rule: access-tokens/bans-suspend-a-persons-tokens
    text: >-
      A ban can't always be recorded: a banned user with no primary email
      address isn't recorded, as with any other change to them. Nor is one
      whose new email another user of ours has: the whole update fails, the
      ban with it, until the sign-in provider gives up sending it.
  - id: real-ban-delivery-unseen
    text: >-
      A real delivery of a ban hasn't been seen: QA on 2026-11-03 banned and
      lifted a real user on the sign-in provider's development instance, then
      replayed what it sent. Neither its own delivery nor anything in
      production has been checked.
  - id: partners-and-screen-readers-unchecked
    outcome: usability/beta/everyone
    text: >-
      Partners haven't been through it in a browser, nor has a real screen
      reader, though it's the same for everyone. Contrast hasn't been checked
      either.
  - id: limiting-unchecked-with-screen-reader
    outcome: usability/beta/everyone
    text: >-
      No real screen reader has been through limiting a token: QA on
      2026-11-03 went through creating one and the list by keyboard, and read
      their accessibility tree. It only saw limiting disabled for admins,
      engineers, and team leads, as they belong to no organization.
  - id: revoke-clipped-on-phones
    text: >-
      At phone width, revoking is slightly clipped until the list is scrolled
      sideways.
tradeoffs:
  - id: no-scopes
    text: >-
      A token can do everything its user can, wherever it works: there are no
      scopes.
    cost: >-
      A script that needs only a little access holds all of its user's.
  - id: managing-tokens-needs-a-session
    text: >-
      Managing tokens needs a session: a token can't list, create, or revoke
      tokens.
    cost: Tokens can't be managed from scripts.
  - id: limited-tokens-reach-their-users-record
    text: >-
      A limited token still reaches its user's own record: it can read and
      change their profile, including updating it from the sign-in provider,
      and sees their platform role and applications.
    cost: >-
      A limited token reaches more than its organizations, though none of it
      reveals another organization.
  - id: limited-tokens-can-leave
    text: >-
      A limited token can remove its user from one of its organizations, as
      their own session can.
    cost: >-
      A script can take its user out of an organization. That's within its
      limit, and acts on nothing else.
  - id: last-used-to-the-minute
    text: Last used is accurate to about a minute.
    cost: When a token was last used can be up to a minute out.
  - id: tokens-filtered-on-the-device
    text: >-
      All of someone's tokens are read at once, then searched, filtered, and
      sorted on their own device.
    cost: >-
      Opening the list loads every token someone has, however many there
      are.
  - id: failed-authentication-not-rate-limited
    text: Requests that fail to authenticate aren't rate limited.
    cost: >-
      A bad token costs one lookup, uncounted. A token can't be guessed.
---

## Includes

- Everyone lists and revokes their personal access tokens.
- Everyone sees where each of their tokens works.
