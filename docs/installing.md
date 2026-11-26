# Installing docket

`docket` is one Go program. Install it with Go 1.26 or later:

```sh
go install github.com/exalynt/docket/cmd/docket@latest   # or @<commit or tag>
```

Or, from a checkout of this repository, `make install`. A binary built this
way has no UI in it unless `make ui-build` ran first, but every command that
reads or changes a project works.

## In a project

In the repository to bring Docket to:

```sh
docket init --id my-app --name "My App"   # writes docket.yaml
docket kit install                        # the agent kit; --agent claude for Claude Code
docket check                              # exit 1 on any problem
```

The kit's [README](../kit/README.md) says what `docket kit` writes, for which
agents, and how they use it, and its
[`adopting.md`](../kit/skills/docket/adopting.md) how an agent helps write the
first docs.

## In CI

`go install` it the same way. The image published to GHCR is the server's,
and has no `git`, which the commands that compare with a branch need. On every pull request:

```sh
docket check --changed --base "origin/$BASE_BRANCH" --commits "origin/$BASE_BRANCH..HEAD"
docket kit check     # the kit committed is the one this docket carries
```
