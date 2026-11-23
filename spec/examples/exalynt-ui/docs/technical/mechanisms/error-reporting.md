---
name: Error reporting
summary: >-
  How the apps report unexpected failures from the browser, so someone looking
  can see what went wrong.
start: >-
  `src/shared/telemetry.ts`, through `initTelemetry` and `reportError`
capabilities:
  - client-home
  - getting-set-up
  - billing
  - organizations-and-members
  - estimates
  - your-profile
  - partner-home
  - partner-earnings
  - partner-payouts
  - partner-payout-accounts
code: [src/shared/telemetry.ts]
meets: [observability/alpha/see-errors]
tradeoffs:
  - id: errors-only
    text: >-
      Only errors are collected: uncaught ones, and those pages pass to
      `reportError`. No page views, request timings or session recordings.
    cost: >-
      A slow page, or one people give up on without an error, leaves nothing
      to look at.
---

`main.tsx` calls `initTelemetry` once, as early as possible. It loads Dash0's
web SDK and starts it only when `VITE_TELEMETRY_ENDPOINT` (an OTLP/HTTP base
URL) and `VITE_TELEMETRY_TOKEN` are set, as the deploy workflow sets them.
Left unset, as they are locally, both functions do nothing and the SDK is
never fetched. If the SDK can't load, errors go unreported rather than
breaking the app. This file is the app's only tie to the vendor, so moving
off Dash0 changes it alone.

Pages call `reportError` with the error and a context of IDs and names of
things, never people's names, emails or anything they wrote. It leaves out
what the caller expects: the API's 4xx answers (not found, forbidden,
invalid), and aborted requests, which are the page moving on.

- **The token ships in the bundle**, so it must be one that can only
  ingest.
- **Only a page's origin and path are sent.** The SDK reports the page's URL
  with every error, and its query and fragment can hold a secret or what
  someone searched for, so `urlAttributeScrubber` drops them.
