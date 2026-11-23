---
name: Your profile
description: >-
  Everyone manages their own account in every app: their name and photo, their
  email addresses, the accounts they sign in with, their password, and the
  devices they're signed in on.
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
  - profile/everyone-sees-the-name-given
  - profile/invitations-follow-the-primary-address
  - profile/at-least-one-name-is-kept
  - profile-photos/everyone-sees-the-uploaded-photo
  - profile-photos/removed-photos-are-no-longer-shown
gaps:
  - id: blank-names-allowed-outside-the-app
    rule: profile/at-least-one-name-is-kept
    impact: inconvenient
    summary: >-
      Only the app refuses a blank name. The sign-in provider is the source of
      truth for users and takes one from sign-up, a connected account, or its
      own tools, and Exalynt has to record what it holds, since refusing would
      leave that person unable to sign in. So someone can have no name until
      they set it, and a client sees them without one on their teams until
      then.
    when: Someone's name is left blank in the sign-in provider.
  - id: stuck-without-a-primary-address
    impact: blocking
    summary: >-
      Someone new without a primary address, which sign-up should prevent, is
      stuck with no way to add one: Exalynt has to fix them with the sign-in
      provider.
    when: Someone gets through sign-up without a primary address.
  - id: changes-arrive-late
    impact: inconvenient
    summary: >-
      A name or primary address reaches Exalynt only when the sign-in provider
      sends it, or through a sync, so others can see the old one until it
      arrives, and a retried older update can bring an old one back.
  - id: success-reported-as-failure
    outcome: usability/beta/clear-results
    impact: inconvenient
    summary: >-
      If an action succeeds but reading the result fails, the app says it
      failed.
    when: An action succeeds but reading its result fails.
  - id: no-new-confirmation-code
    impact: inconvenient
    summary: >-
      Confirming it's them can't send a new code: cancelling and retrying can.
    when: A confirmation code doesn't arrive.
  - id: provider-outage-signs-out
    outcome: reliability/beta/fails-clearly
    impact: inconvenient
    summary: >-
      If the sign-in provider fails to load, its cookies are cleared in the
      hope that helps, so even a brief outage signs that browser out.
    when: The sign-in provider fails to load, even briefly.
  - id: turned-off-provider-accounts-hidden
    impact: blocking
    summary: >-
      An account from a provider later turned off isn't listed, so it can't
      be disconnected.
    when: >-
      A sign-in provider is turned off after someone connected an account from
      it.
  - id: photo-removal-unconfirmed
    impact: inconvenient
    summary: Removing a photo isn't confirmed.
    when: Someone removes their photo by mistake.
  - id: gravatar-looked-up-by-viewers
    impact: damaging
    summary: >-
      Gravatar is looked up from each viewer's browser, by a hash of the
      address of whoever they're looking at, for anyone without a photo.
      People are told this about themselves only.
  - id: devices-no-retry
    outcome: usability/beta/recover
    impact: inconvenient
    summary: >-
      If the list of devices fails to load, it says to reload, with no retry.
    when: The list of devices fails to load.
  - id: focus-lost-after-row-actions
    outcome: usability/beta/everyone
    impact: inconvenient
    summary: >-
      Signing a device out or making an address primary leaves keyboard focus
      nowhere useful, as what did it goes with its row.
  - id: provider-updates-not-tested-end-to-end
    impact: inconvenient
    summary: >-
      Updating a profile straight from the sign-in provider has no end-to-end
      test, as those tests run without the provider. Acceptance and unit tests
      cover it instead.
    when: >-
      A change breaks updating a profile from the sign-in provider in a way
      acceptance and unit tests miss.
  - id: never-verified
    impact: blocking
    summary: >-
      Never verified: a completed connection of a Google account and
      disconnecting one, whether reported failures arrive, delivery of changes
      from the sign-in provider, and real screen-reader output.
    when: One of these doesn't work in real use.
---

## Includes

- Everyone changes their name, and is shown by it everywhere they appear.
- Everyone uploads, changes, or removes their photo, knowing that without one
  their Gravatar shows by default, if their address has one.
- Everyone adds, verifies, and removes email addresses, and makes one primary.
- Everyone connects and disconnects accounts they sign in with, and is told why
  when a provider refuses.
- Everyone sets or resets their password, with a code emailed to them.
- Everyone sees the devices they're signed in on, and signs any other out.
