# The model

_There's one model, `state`, and the types that aren't it live with what makes
them. Part of [how `docket` is built](README.md)._

**There's no `models` package. `state` is the model.** The api has one because
its models differ from what crosses each boundary: rows in the database and
resources in the API. Docket's model is defined by the spec, and it's the
same shape everywhere it goes: what the CLI prints with `--json`, what
`apply` sends, what the server stores, and what the UI reads today. A
separate package would hold the same types again.

Types that aren't the state live with what makes them:

- **Frontmatter as written**, in YAML's kebab case with each value's line, is
  `index`'s input, and private to it. Nothing else depends on how a doc is
  spelled on disk.
- **Derived figures**, such as maturity and readiness, aren't in `state.json`.
  Their types are in `derive`, beside the code that works them out.
- **API resources** are built from the state and derived figures, beside the
  handlers that return them (see [The server's API](api.md)).
