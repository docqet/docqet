# Developing docket

```sh
cp compose.override.example.yml compose.override.yml   # publishes the server on localhost:8090
make build      # build and start the server in Docker
make run        # or run it on this machine, on localhost:8080
make examples   # load the examples into the server make run started
make ui         # the UI's dev server, over that server's API
make help       # everything else
```

Run `make check` before committing. [How `docket` is built](architecture/)
explains the code.

## Viewing a project locally

`docket ui` serves the built UI and the API over one project's
`.docket/state.json`, on http://127.0.0.1:4100:

```sh
make ui-build
go run ./cmd/docket -C examples/hotel-bookings ui
```

## Sending a project to a local server

Index and check a project, then send its state to a local server. The
examples are folders in this repository, so `apply` sends their state at each
commit of it:

```sh
go run ./cmd/docket -C examples/hotel-bookings check          # its problems, exit 1 if any
go run ./cmd/docket -C examples/hotel-bookings index --stdout # its state
make run                                                      # migrate, then serve on localhost:8080
DOCKET_SERVER=http://localhost:8080 go run ./cmd/docket -C examples/hotel-bookings apply
curl localhost:8080/api/v1/projects/hotel-bookings/state      # the state the server keeps
```

> [!CAUTION]
> `docket index` without `--stdout` writes over an example's hand-written
> `state.json`.

Docket documents itself, so it can be sent to a local server too. `apply`
sends commits, so the server shows what's committed, while `docket ui` shows
the working tree.

```sh
make ui-build   # the UI the server embeds
make run        # migrate, then serve on localhost:8080
make apply      # send Docket's new commits; open http://localhost:8080
make apply DOCKET_SERVER=http://localhost:8090   # or to the server make build started
curl localhost:8080/api/v1/products/docket/status   # its figures, as the API serves them
```

## Configuration

`docket serve` and `docket migrate` read these, each also a flag:

| Variable        | Flag           | Default          | What it does                                      |
| --------------- | -------------- | ---------------- | ------------------------------------------------- |
| `PORT`          | `--port`       | `8080`           | The port `serve` listens on                       |
| `LOG_LEVEL`     | `--log-level`  | `info`           | The lowest level logged: debug, info, warn, error |
| `LOG_FORMAT`    | `--log-format` | `json`           | `json` for log pipelines, `text` for reading      |
| `DATABASE_PATH` | `--database`   | `data/docket.db` | The server's SQLite database                      |

`docket apply` sends to the server in the project's `docket.yaml`, as
`server:`, or in `DOCKET_SERVER`, which wins.

`go build` embeds the UI from `ui/dist`, so run `make ui-build` first to
serve the real UI. Docker always builds it.
