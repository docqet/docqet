# Installing docqet

`docqet` is one Go program. Install it with Go 1.26 or later:

```sh
go install github.com/docqet/docqet/cmd/docqet@latest   # or @<commit or tag>
```

Or, from a checkout of this repository, `make install`. A binary built this
way has no UI in it unless `make ui-build` ran first, but every command that
reads or changes a project works.

## `dqt`, the shorter name

`dqt` is the same command under a shorter name: `dqt check` is
`docqet check`. `make install` and the Docker image install it beside
`docqet`. After `go install`, link it yourself:

```sh
ln -sf docqet "$(go env GOPATH)/bin/dqt"   # or $(go env GOBIN), if it's set
```

A link rather than a shell alias, so completion works for it too. Docs,
scripts and the agent kit always say `docqet`.

## Shell completion

`docqet completion <shell>` prints a script that completes its commands and
flags, for bash, zsh, fish or PowerShell. Run as `dqt`, it completes `dqt`.
Add what you use to your shell's startup:

```sh
# ~/.bashrc
source <(docqet completion bash)
source <(dqt completion bash)

# ~/.zshrc
source <(docqet completion zsh)
source <(dqt completion zsh)

# fish
docqet completion fish > ~/.config/fish/completions/docqet.fish
dqt completion fish > ~/.config/fish/completions/dqt.fish
```

## In a project

In the repository to bring Docqet to:

```sh
docqet init --id my-app --name "My App"   # writes docqet.yaml
docqet kit install                        # the agent kit; --agent claude for Claude Code
docqet check                              # exit 1 on any finding
```

The kit's [README](../kit/README.md) says what `docqet kit` writes, for which
agents, and how they use it, and its
[`adopting.md`](../kit/skills/docqet/adopting.md) how an agent helps write the
first docs.

## In CI

`go install` it the same way. The image published to GHCR is the server's,
and has no `git`, which the commands that compare with a branch need. On every pull request:

```sh
docqet check --changed --base "origin/$BASE_BRANCH" --commits "origin/$BASE_BRANCH..HEAD"
docqet kit check     # the kit committed is the one this docqet carries
```
