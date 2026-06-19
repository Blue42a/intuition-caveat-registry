# ERC-7710 Caveat Enforcer Registry — on Intuition

A permissionless, community-curated registry of **ERC-7710 caveat enforcers**, represented as
**Intuition atoms, triples, and Signal-backed attestations** — so any wallet, dapp, or agent can
query *"what does this enforcer restrict, is this deployment verified, what does it compose
with?"* through the Intuition GraphQL API, with no central gatekeeper.

What makes this entry different is not the UI — it's that **the UI is generated from a
source-verified ontology, and the ontology is checked by scripts anyone can run.**

```
npm run validate       # → PASS (158 checks): 32 types, 64 deployments,
                       #   terms offsets sum to termsLength, no mainnet over-claim
npm run dry-run:seed   # → 193 atoms / 275 triples projected, with cost estimate (no key)
```

- **Source-verified terms.** Every enforcer's `terms` layout — fields, solidity types, **byte
  offsets**, total length — is extracted from its `getTermsInfo` in the framework source. 31/32
  fully verified, 1 honestly marked `partial`. See [`PROVENANCE.md`](./PROVENANCE.md).
- **On-chain-checked deployments.** All 32 addresses confirmed to hold live bytecode on Intuition
  testnet (13579) via `eth_getCode`; mainnet (1155) flagged unverified (CREATE2-deterministic) — no over-claim.
- **Composability as data**, not hardcoded UI: `complements` / `composes with` / `conflicts with`
  as attestable triples ([`COMPOSABILITY.md`](./COMPOSABILITY.md), [`seed/composability.json`](./seed/composability.json)).

## Live demo

A read-only registry UI (browse / detail / composability / mock write previews), generated
entirely from the seed. **Deploy:** import this repo into Vercel with **root directory `app/`**
(config in [`app/vercel.json`](./app/vercel.json)) — or run locally:

```bash
cd app && npm install && npm run dev
```

**What it shows** (walkthrough): browse + filter all 32 types → a detail page rendering the
**verified terms layout with byte offsets** and per-chain CAIP-10 deployments with `eth_getCode`
badges → a composability tab of presets and conflict/complement relations → mock submit/attest
flows that render (and **export as JSON**) the exact atoms/triples a real write would create. A
header toggle flips the data source between the seed and a **live Intuition GraphQL** query (0
rows until seeded — the adapter is real, the data isn't yet).

## Contents

```
SCHEMA.md              # ontology — Type vs Deployment, predicates, terms-schema format, Signal semantics
PROVENANCE.md          # generated — per-enforcer source / getTermsInfo / address / bytecode chain
COMPOSABILITY.md       # composability model + use-case presets
INTEGRATION.md         # canonical GraphQL query + how a wallet consumes the registry
LAUNCH_CHECKLIST.md    # what's done vs gated on alignment + a funded wallet
seed/
  enforcers.json       # 32 types, verified terms schemas (offsets+lengths), 64 CAIP-10 deployments
  composability.json   # machine-readable relationships + presets (source of truth for the UI)
scripts/
  validate-seed.mjs    # rigor checks (offsets sum to length, deployment completeness, no over-claim)
  dry-run-seed.mjs     # projects the exact atom/triple set + cost estimate, no private key
  gen-provenance.mjs   # regenerates PROVENANCE.md from the seed
app/                   # Vite + React + TS read-only dapp, generated from seed/*.json
examples/registry-query.graphql
```

## The one-line model

> An enforcer has a **Type** atom (e.g. `ERC20TransferAmountEnforcer`) and one or more
> **Deployment** atoms (CAIP-10 addresses). The Type carries reusable semantics — what it
> restricts, its `terms` schema, composability; each Deployment carries chain-specific facts
> (`Deployment —implements→ Type`). Every fact is a triple, and **Signal** (stake for,
> counter-stake against) is the confidence/dispute weight. The dapp renders the graph; it never
> hardcodes the facts. Headline = **"recognized," not "safe."**

## Status / scope (honest)

- **Schema + seed + validation + read-only dapp: done.** `npm run validate` is green.
- **Deliberately gated until alignment + a funded wallet:** real wallet writes (submit/attest are
  mocked but export the exact payload), and the mainnet seeding *run* (`dry-run:seed` projects it).
- Predicate/class atoms aren't minted yet — the schema defines what gets minted once agreed, so
  nothing is minted into the wrong shape before the team weighs in. See `LAUNCH_CHECKLIST.md`.
