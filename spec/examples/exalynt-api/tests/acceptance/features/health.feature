Feature: Health
  The app reports whether it's running and whether it's ready to serve, and
  how its database is doing.

  # Not business rules: unit tests, if the feature's level calls for them.
  #   - Liveness reports only the HTTP server, never the database.
  #   - Readiness and health report the HTTP server and the database, with its
  #     provider and latency, and nothing else when the app runs HTTP alone
  #     with no-op or in-memory providers.
