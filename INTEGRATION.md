# Integration Guide

How a wallet or dapp consumes the registry from the Intuition GraphQL API — no Intuition-specific
knowledge required beyond this page.

**Endpoint:** `https://mainnet.intuition.sh/v1/graphql` (testnet: `https://testnet.intuition.sh/v1/graphql`)
No auth for reads.

## The model in one paragraph

Each **Enforcer Type** is an atom. Recognised enforcers are the subjects of triples whose predicate is
`is a` → object `ERC-7710 Caveat Enforcer`. Community confidence is the **Signal** on that triple:
`term.total_assets` (staked TRUST FOR) vs `counter_term.total_assets` (AGAINST). Deployments attach as
separate CAIP-10 atoms via `implements`. So "rank enforcers by community confidence" = "order the
`is a Caveat Enforcer` triples by `term.total_assets desc`."

## Canonical query — list recognised enforcers by Signal

```graphql
query RegistryEnforcers($isAPredicate: numeric!, $enforcerClassAtom: numeric!) {
  triples(
    where: { predicate_id: { _eq: $isAPredicate }, object_id: { _eq: $enforcerClassAtom } }
    order_by: { term: { total_assets: desc } }
  ) {
    term_id
    subject { term_id label }                      # the Enforcer Type
    term { total_assets }                           # Signal FOR (staked TRUST)
    counter_term { total_assets }                   # Signal AGAINST (disputes)
    # what the community further claims about this type:
    subject_as_subject: subject {
      as_subject_triples {
        predicate { label }                         # e.g. "restricts", "has terms schema", "implements"
        object { label }
        term { total_assets }
      }
    }
  }
}
```

`$isAPredicate` and `$enforcerClassAtom` are the deterministic term IDs of the `is a` predicate atom
and the `ERC-7710 Caveat Enforcer` class atom (resolve once, then cache). A full query example is in
[`examples/registry-query.graphql`](examples/registry-query.graphql).

## Populating an enforcer picker (viem / fetch)

```ts
const res = await fetch("https://mainnet.intuition.sh/v1/graphql", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ query: REGISTRY_ENFORCERS, variables: { isAPredicate, enforcerClassAtom } }),
}).then(r => r.json())

const options = res.data.triples.map(t => {
  const claims = t.subject_as_subject.as_subject_triples
  return {
    name: t.subject.label,
    signalFor: BigInt(t.term?.total_assets ?? 0),
    signalAgainst: BigInt(t.counter_term?.total_assets ?? 0),
    // pull the deployment + terms-schema claims for this type:
    deployments: claims.filter(c => c.predicate.label === "implements").map(c => c.object.label),
    termsSchema: claims.find(c => c.predicate.label === "has terms schema")?.object.label,
  }
})
// Disputed enforcers (signalAgainst > signalFor) sort last or render with a warning badge.
options.sort((a, b) => Number(b.signalFor - a.signalFor))
```

## Notes for integrators

- **Labels are not unique.** Never key trust off `label`. Resolve and pin the `term_id` of the predicate
  and class atoms; match on IDs. (Two atoms can share a label — see `SCHEMA.md`.)
- **"Recognised" ≠ "safe."** A high Signal means the community endorses the entry, not that the enforcer
  is risk-free. Surface the stake weight; don't collapse it to a boolean.
- **Composability** lives in the same graph: query `composes with` / `complements` / `conflicts with`
  triples (see `COMPOSABILITY.md`) to drive "these caveats work well together" / conflict warnings.
- **Deployment binding:** the picker should show the CAIP-10 deployment for the user's chain
  (`caip10:eip155:<chainId>:<address>`) from the `implements` claims, not the chain-independent type alone.
