---
name: Auth
description: >-
  Signing in and up, and onboarding: the pages that belong to no app, where
  someone gets an account and joins or creates what they'll work in.
capabilities:
  - organizations-and-members
  - engineer-onboarding
  - partnerships
tradeoffs:
  - id: clerks-screens-for-session-tasks
    text: >-
      The session tasks Clerk can hold a session back for, a password reset
      it forces or two-step setup, use Clerk's own screens, dressed by
      `clerkAppearance`, since they're rare.
    cost: >-
      Those few screens look like Clerk's rather than ours.
---

Sign-in and sign-up are our own forms over Clerk's `useSignIn` and
`useSignUp`. Clerk decides what each needs next, and the forms are just the
steps for each answer. A social provider leaves for its consent screen and
comes back through `/sso-callback` (`SSOCallback.tsx`). What the instance
allows, such as password length and which factors exist, is in Clerk's
dashboard, and Clerk's own error sentences are shown as they come
(`errors.ts`).

Signing in with no app asked for lands on `Landing.tsx`: someone with one app
goes straight in, someone with several picks, and someone with none goes on to
onboarding. Onboarding is where someone in no organization lands, and where an
invitation's email brings them. They accept an organization's invitation, or
an invitation to work with Exalynt, which opens the console, or go on to the
hub's welcome page for a partnership, or create an organization. Invitations
and organizations are the API's; Clerk only signs people in. Each choice
reloads the page it opens, so everything reads afresh what they've just been
given.

Sign-up, onboarding, and switching or creating organizations are GA in
`src/featureStability.ts`, with their rules covered by the API's acceptance
tests.

- **Creating an organization can't happen twice.** Onboarding holds one
  `Idempotency-Key` for it. The logo is uploaded once the organization
  exists: if that fails, the organization is kept and the page stays, to try
  the logo again or go on without it.
- **A referral code outlives the redirects.** It arrives on the sign-up link
  as `ref` and is kept in this browser (`referralCode.ts`) until the
  organization is created, past email verification or a provider's
  redirect. Where storage is unavailable, the person types it instead. A
  code the API refuses leaves nothing created.
- **Onboarding sits outside the portal's `RequireOrganization`**, which sends
  everyone in no organization there, so the redirect can't loop.
