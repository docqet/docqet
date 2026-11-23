---
name: Access tokens
summary: >-
  Personal access tokens, which identify their creator to the API without a
  session. How one becomes a caller is in the [authentication
  doc](../systems/authentication.md).
start: >-
  `internal/services/access_tokens.go`, `internal/authn/access_token.go`
capabilities: [access-tokens]
code: [internal/services/access_tokens.go, internal/authn/access_token.go]
---

Only the secret's SHA-256 is kept, unsalted on purpose: 256 random bits need no
salt or slow hash, and a request has to find its token by it. The secret can't
be shown again, so a token revoked by mistake can only be replaced. Revoking
deletes the row, and a revoked token is simply unknown.

A banned user's tokens are refused, not deleted, as Clerk ending someone's
sessions doesn't reach a token. `users.banned` follows Clerk's `banned` from
the `user.updated` webhook and `api sync users clerk`, and lifting the ban
makes the tokens work again. A lockout from failed sign-ins is short-lived and
doesn't count.

`organization_ids` is NULL for a token with no limit. It's IDs in a column and
not rows with foreign keys, so nothing can empty the list and make a limited
token look unlimited. Membership is still checked each request, so someone
leaving an organization stops the token working there, and rejoining restores
it.

Anything that reads with `AcrossOrganizations` on the caller's behalf honors
`Principal.Limited()`, as `GET /v1/users/me` and `GET /v1/organizations` do.
`POST /v1/organizations`, the caller's invitations, and
`/v1/users/me/payout-account` refuse a limited token instead.

`access_tokens` has no row-level security, as a token belongs to a person and
not an organization. The `user_id` in each query is what keeps people apart.

A refused token's span says why in `auth.access_token.refusal`, as the caller
is only told it was refused. Spans carry `auth.method`, and a token's has
`auth.access_token.id`.

`last_used_at` changes at most once a minute, but the `UPDATE` is still sent
on each request. Failing to record it doesn't fail the request.
