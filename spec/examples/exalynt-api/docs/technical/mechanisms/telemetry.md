---
name: Telemetry
description: >-
  What the API emits and how to read it. The API exports over OTLP to the
  collector `OTEL_EXPORTER_OTLP_ENDPOINT` names, which in the cluster is the
  Grafana Alloy collector the exalynt/collector repo deploys, forwarding to
  Grafana Cloud. The README's Configuration section covers the settings.
meets: [observability/alpha/see-errors]
gaps:
  - id: log-retention-not-set
    summary: >-
      Request log lines carry `remote_addr` and `user_id`, and how long
      Grafana Cloud keeps them is its default.
  - id: no-alerts-or-dashboards
    outcome: observability/beta/hears-of-errors
    summary: >-
      Alerts and dashboards aren't set up in Grafana Cloud, though the
      in-cluster Alloy collector now sends there. Each feature with a
      `.changes` counter needs an alert on the share of its routes ending in a
      5xx, over a few minutes, above about 1%, and a panel of those routes'
      request rate and p95 latency with its `.changes` counter by `operation`
      and `outcome`. Also needed: an alert on any `capacity.changes` with
      `reason` = `charged_not_recorded`, since a client has paid for nothing,
      one on `access_tokens.authentications` with `reason` `error` above a few
      in a few minutes, and client home's production alert. The organization
      routes' alert links the respond-to-organization-errors runbook.
---

Every request gets a SERVER span named for its route template, with a CLIENT
span per query under it, such as `SELECT estimates`, and one per call to a
provider. Each log line carries `trace_id` and `span_id`, there's one per
request, and a 5xx logs the error behind it.

Each feature has a `<feature>.changes` counter, by `operation` and `outcome`.
Reading the names from the code is quickest: search for `Int64Counter(`.

Queries' spans carry their text but never their values, and invitees' email
addresses are never logged.

**Reading it.**

- A counter's `failure` includes a caller's mistake, such as a `404`, a `409`,
  or a full week. The request spans say which.
- Assigning a new client that finds no team counts as a `success` on
  `teams.changes`. The `POST /v1/organizations` span has a `team not assigned`
  event saying why.
- A slow request with fast queries is waiting on a provider, which its CLIENT
  spans show.
- A `SELECT` waiting a long time on `users` or `capacities` means lock
  contention on an engineer, a block, or a week.

**Exporting.** `OTEL_EXPORTER_OTLP_ENDPOINT`'s port matches
`OTEL_EXPORTER_OTLP_PROTOCOL`: the collector's HTTP port (4318) for
`http/protobuf`, the default, or its gRPC port (4317) for `grpc`. A mismatch
fails every export, and only the warnings on stderr say so.
