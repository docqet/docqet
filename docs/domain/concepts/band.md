# Band

The quarter of the [maturity](maturity.md) scale a feature, domain or project
falls in, named for the level it's closest to.

## Details

| Band | From | Named for |
| --- | --- | --- |
| **Experimental** | 0% | Prototype |
| **Emerging** | 25% | Alpha |
| **Promising** | 50% | Beta |
| **Established** | 75% | GA |

A band tells you what to expect from the whole, never from every part. A
feature whose capabilities are all at one level lands in that level's band.

## In the spec

Nothing is written for it in a doc. The indexer writes it beside each
maturity in [state](state.md), as the level it's named for:

```json
{ "id": "reservations", "maturity": 42, "band": "alpha" }
```

Readers show it by its own name: Reservations is Emerging.

## Not to be confused with

- [Stability level](stability-level.md): a band is named for a level, but a
  feature in the Promising band can still have capabilities at Prototype.
