---
name: Account
description: >-
  The profile every app mounts at `/<app>/account`: the signed-in person's own
  account, their bio, their access tokens, their notification choices, and the
  app's theme.
capabilities:
  - your-profile
  - teams
  - access-tokens
  - notifications
gaps:
  - id: sync-no-end-to-end-test
    outcome: functionality/beta/stays-correct
    impact: blocking
    summary: >-
      `POST /users/me/sync` has no end-to-end test, as the API's end-to-end
      server runs without Clerk. Acceptance and unit tests cover it instead.
    when: A change breaks syncing in a way only a real Clerk would show.
  - id: name-by-webhook-only
    impact: damaging
    summary: >-
      A name or primary address reaches the API only by Clerk's webhook, or
      by `api sync users`, so others see the old one until it arrives, and a
      retried older webhook can bring an old one back.
    when: Clerk retries an older webhook after a newer one has arrived.
  - id: clerk-failure-signs-out
    impact: inconvenient
    summary: >-
      If Clerk fails to load, `ResetFailedClerk` clears Clerk's cookies and
      reloads, in the hope that helps, so even a brief Clerk outage signs
      that browser out.
    when: Clerk fails to load, even briefly.
  - id: google-connection-never-tried
    outcome: functionality/alpha/main-path
    impact: blocking
    summary: >-
      Nobody has yet completed a Google connection or disconnected one, as
      that needs a real Google account.
    when: >-
      Connecting or disconnecting a real Google account doesn't work as
      built.
  - id: tokens-filtered-in-browser
    outcome: efficiency/beta/bounded
    impact: inconvenient
    summary: >-
      Access tokens reads every page of someone's tokens, then searches,
      filters, sorts and pages them in the browser.
    when: Someone's access tokens grow to many pages.
  - id: tokens-not-tried-by-everyone
    outcome: usability/beta/everyone
    impact: inconvenient
    summary: >-
      No partner has been through Access tokens in a browser, and no real
      screen reader has been through it or its organization limits, though
      it's the same page for everyone. QA only saw the limits disabled, for
      admins, engineers and team leads, who belong to no organization.
    when: >-
      A partner, or someone using a screen reader, works with Access
      tokens or its organization limits.
---

The account is the person's, not an organization's or a partnership's, so it
reads the same in every app, and its requests name no organization.

The profile (`Profile.tsx`) stands in for Clerk's `UserProfile` modal. Its
name, photo, email addresses, connected accounts, password and devices go
straight to Clerk, and reach the API through Clerk's `user.updated` webhook;
a new or removed photo also at once, as `DetailsSection` asks the API to read
it. Anything sensitive asks the person to confirm it's them first
(`ReverificationProvider`). The theme (`AppearanceSection`) is kept by this
browser, not by Clerk. It's part of no capability.

Only the profile refuses a blank name. The API accepts one, since Clerk is
the source of truth for users and takes names from sign-up, a provider or its
dashboard, and refusing its sync would leave that person unable to sign in.
For anyone without a photo, Gravatar is looked up from each viewer's
browser, by a hash of the address of whoever they're looking at, and the
page says so to people about themselves only. Unit tests in `src/account/`
cover cleaning a name, what's reported, reading Clerk's settings, how a
connected account stands, how devices are named and ordered, finding an
address already on the account, Gravatar's URL, and the token list and
limits.

The bio (`BioSection`, on the profile of someone who works with Exalynt) is
the API's, and is part of Teams, since teammates and clients read it there.
The length check is in `src/shared/bio.ts` and `src/components/BioField.tsx`,
which the admin's Teams uses too.

Access tokens and their organization limits are all the API's, read again
after each create or revoke. `tokenLimits.ts` shows only the organizations a
limited token's owner still belonged to when the page last read them, since
the API goes on returning any they've left. The example requests on the
page read the secret from the environment, so they run as they are and the
secret stays out of the shell's history.

Notifications is a Prototype on placeholder data (`data/notifications.ts`):
the choices are held in memory by `useNotificationSettings` until a reload,
Slack, Discord and Microsoft Teams are pretend, and the API sends nothing. It
shows only while the `notifications` flag is on in Flipt (`RequireFlag`).
Each app shows the notifications for who someone is in it, and in the
console, being a team lead comes from their team.

`payoutAccount/` holds the payout account page that the console and the hub
mount; it's described with them.
