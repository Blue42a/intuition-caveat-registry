# Caveat Enforcer Registry — schema-first foundation

A permissionless, community-curated registry of **ERC-7710 caveat enforcers**,
represented as **Intuition atoms, triples, and Signal-backed attestations** (`$TRUST` is
the economic mechanism behind Signal) — so any wallet, dapp, or agent can query *"what
does this enforcer restrict, has this deployment been audited, what does it compose
with?"* through the Intuition GraphQL API, with no central gatekeeper.

This repository is the **schema-first foundation** for that registry: the ontology, the
seed data, and the canonical read query. It is the piece the
[mission](https://github.com/intuition-box/Caveats-Enforcers/issues/1) explicitly left
to the candidate — *"the candidate is expected to define what composability means"* and
*"`SCHEMA.md` must be clear enough for a contributor to submit an enforcer ... without
reading the dapp code."*

## Why schema-first

The dapp (browse / detail / submit / attest / composability UI) is the visible
deliverable, but it is only as good as the model underneath it. If the ontology is
wrong, every triple minted on mainnet is wrong and expensive to unwind. So the model
comes first, in the open, reviewable on its own terms before any UI is built.

## Contents

```
.
├── SCHEMA.md                      # the ontology — atom types, predicate vocabulary,
│                                  #   restriction categories, terms-schema format,
│                                  #   Signal semantics, and reasoned answers
│                                  #   to the mission's four open questions
├── seed/
│   └── enforcers.json             # the 32 official MetaMask Delegation Toolkit
│                                  #   enforcers, with restriction categories and
│                                  #   terms schemas (confident / to-verify flagged)
└── examples/
    └── registry-query.graphql     # canonical read query a wallet uses to fetch
                                   #   the registry, ranked by Signal
```

## The one-line model

> An ERC-7710 enforcer has a **Type** atom (the implementation, e.g.
> `ERC20TransferAmountEnforcer`) and one or more **Deployment** atoms (the deployed
> addresses, each a CAIP-10). The Type carries reusable semantics — what it restricts,
> its `terms` schema, composability; each Deployment carries chain-specific facts —
> which chain, and whether *that address* is audited (`Deployment —implements→ Type`).
> Every fact is a **triple**, and **Signal** (stake for, counter-stake against) on those
> triples is the confidence and dispute weight. Provenance — *who says this audit
> happened* — uses triple-on-triple claims. The dapp renders the graph; it never
> hardcodes the facts.

See [`SCHEMA.md`](./SCHEMA.md) for the full ontology and
[`examples/registry-query.graphql`](./examples/registry-query.graphql) for how to read it.

## Status

**v0.1 proposal.** Predicate atoms are not yet minted on mainnet — the schema defines
what gets minted once it's agreed. `seed/enforcers.json` covers all 32 official
enforcers; terms-schema field lists are marked `confident` or `to-verify` so nothing is
asserted beyond what's been checked. This is deliberately **not** the full dapp — it is
the foundation the dapp stands on, shared for review first.

## Scope boundaries (honest)

- **Addresses are not seeded.** MetaMask hasn't published a canonical per-chain address
  list (mission open question Q1); addresses attach per deployment from the framework's
  `documents/Deployments.md`. The name/category/terms facts are chain-independent and
  reusable.
- **Terms field lists:** 8 verified-confident, 24 marked `to-verify` against source.
  The schema *shape* is the deliverable; exhaustive verification is a fast follow.
- **GraphQL query** field names were introspected against the live mainnet schema and
  the shape verified to execute; the two well-known atom ids it takes as variables are
  filled once the predicates are minted.
