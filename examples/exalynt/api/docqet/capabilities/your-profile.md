---
docqet: capability
id: your-profile
name: Your profile
description: >-
  Everyone manages their own account in every app: their name and photo, their
  email addresses, the accounts they sign in with, their password, and the
  devices they're signed in on.
stability: beta
within: feature:your-account
solves: [problem:others-can-act-as-you]
included-in: [initiative:mvp]
follows:
  - rule:everyone-sees-the-name-given
  - rule:invitations-follow-the-primary-address
  - rule:at-least-one-name-is-kept
  - rule:everyone-sees-the-uploaded-photo
  - rule:removed-photos-are-no-longer-shown
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
