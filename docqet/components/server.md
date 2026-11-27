---
docqet: component
id: server
name: Server
description: >-
  `docqet serve`: the API that takes and hands back applied states, kept in
  SQLite.
serves:
  - capability:applying
tradeoffs:
  - id: sqlite
    name: One SQLite file
    description: >-
      The server keeps everything in one SQLite file, through a pure-Go
      driver, rather than in a database server.
    benefit: >-
      One binary and one file to run for each client, and an image with no C
      libraries.
    drawback: >-
      One server process per database, so a server can't run as several
      replicas.
  - id: flags-and-environment
    name: Configured by flags and environment
    description: >-
      The server is configured by its flags and environment variables, with
      no configuration file.
    benefit: Nothing to design before anyone needs more.
    drawback: >-
      Anything more involved than a few settings, such as several clients'
      worth of one setting, has nowhere to go.
---

How it works is in [Storage](../../docs/architecture/storage.md) and
[the server's API](../../docs/architecture/api.md).
