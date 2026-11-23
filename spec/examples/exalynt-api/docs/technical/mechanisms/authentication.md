---
name: Authentication
summary: >-
  Decides who is calling each request, and puts the `authz.Principal` the rest
  of the API works from on the context. Clerk only signs people in: users are
  copied to our database, and organizations, memberships, and roles are the
  API's own.
start: >-
  `internal/authn`, `internal/middleware/authentication/bearer.go`,
  `internal/authz/principal.go`
capabilities:
  - organizations-and-members
  - roles
  - access-tokens
  - your-profile
  - getting-set-up
  - engineer-onboarding
  - estimates
  - capacity-purchasing
  - client-home
  - scheduling
  - claiming-blocks
  - staffing
  - fulfillment
  - teams
  - availability
  - engineers
  - client-directory
  - conversation-spaces
  - agreements
  - client-agreements
  - engineer-agreements
  - partner-agreements
  - billing
  - earnings
  - payouts
  - payout-accounts
  - partner-earnings
  - partner-payouts
  - partner-payout-accounts
  - partnerships
  - client-invitations
  - partner-clients
  - partner-home
code:
  - internal/authn/**
  - internal/middleware/authentication/bearer.go
  - internal/authz/principal.go
gaps:
  - id: rate-limit-per-instance
    text: >-
      Each running instance counts its own rate limit, so an organization's
      real limit is `RATE_LIMIT_PER_MINUTE` times the instances running
      (`internal/middleware/ratelimit.go`).
---

```text
Authorization: Bearer <Clerk session JWT, or exa_pat_ token>
X-Organization-ID: <our organization ID>          (optional)
        │
        ▼
authn   TokenVerifier          signature, issuer, expiry, azp → Claims
        │                      (exa_pat_ skips this: AccessTokenResolver finds the user)
        ▼
authn   Resolver               finds the user; with the header, checks membership and
        │                      loads their organization role, without it, their platform role
        ▼
authz   New…Principal          each permission → Bounds → Principal on the context
```

One role applies per request, and the two kinds never merge. With
`X-Organization-ID` it's the caller's role in that organization, once our
database confirms they're a member, or the request is a `403`. Without it, it's
their platform role, if they have one. What a role then allows is in the
[authorization doc](authorization.md).

**Personal access tokens** only identify the user who created one. The token is
found by the SHA-256 of its secret, and from the user on the request resolves
through `Resolver.ResolveUser`, exactly as a session's would. A token holds no
grants of its own, so a change to its user's roles or memberships applies to its
next request. `Principal.AccessTokenID` says a token authenticated the request.

**Service actors** aren't users. The Clerk and Stripe webhooks, identity sync,
and `api sync` each act as `authz.ServicePrincipal(id)`, with a fixed user ID
from `internal/authn/webhookusers.go` and `authz.All` for every permission.

**A user Clerk knows and we don't yet.** Our users normally follow Clerk by
webhook. Every session route uses `authn.SyncingResolver`, which, when the
caller's user isn't found, fetches them from Clerk as the identity-sync service
actor and resolves once more. It only runs with `CLERK_SECRET_KEY` set, and
only because the user is missing, never because someone isn't a member or a
record is out of bounds.

**A Principal can't be forged.** Only `authz.ContextWithPrincipal` can set one,
and only its constructors can set its Bounds. `authz.FromContext` returns a
copy, and fails closed with `ErrUnauthenticated` when there's none.

**Refusals say little.** A caller only ever sees `unauthorized` or `forbidden`,
and the specific reason goes to the logs. Clerk's signing keys or API being
unreachable is a `503`, never a `401`, as it says nothing about the caller. A
limited token is refused with `403` before membership is looked at, unless the
request names one of its organizations, so a refusal says nothing about where
its user belongs. Its Principal carries the limit in `OrganizationLimit`.

**Tokens can't mint tokens.** Creating, listing, and revoking tokens refuse a
Principal with an `AccessTokenID`, so a leaked token can't mint more. Managing
tokens needs a session.

**End-to-end tests skip verification.** `AUTH_INSECURE_SKIP_VERIFICATION`
accepts any session token unverified. The API refuses to start with it set
alongside any Clerk setting.
