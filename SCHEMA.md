# Caveat Enforcer Registry — Ontology (v0.1 proposal)

> Proposed semantic schema for representing ERC-7710 caveat enforcers as Intuition
> atoms, triples, and Signal-backed attestations (`$TRUST` is the economic mechanism
> behind Signal). This document is the contract between contributors and the registry:
> anyone should be able to submit or attest to an enforcer using only this file + the
> Intuition SDK/skill, without reading the dapp code.
>
> Status: **proposal, v0.1.** Predicate IDs are not yet minted on mainnet; the
> structure below is what gets minted once the schema is agreed. Open questions the
> mission left to the candidate are answered in §9 with reasoning, flagged as
> proposals not settled fact.

---

## 1. Design principles

1. **Type vs. deployment are separate atoms.** An enforcer has two faces and the
   schema keeps them distinct:
   - an **Enforcer Type** (e.g. `ERC20TransferAmountEnforcer`) — the implementation as
     a concept, carrying the *chain-independent* facts: what it restricts, its `terms`
     schema, its canonical source.
   - one or more **Enforcer Deployments** — the actual deployed addresses, keyed by
     **CAIP-10** (`caip10:eip155:{chainId}:{address}`), carrying the *chain-specific*
     facts: which chain, deployment tx, and the audit/verification claims about *that
     instance*. A Deployment `implements` a Type.

   This split matters for safety: the same Type name can be deployed honestly on one
   chain and maliciously on another, so audit/verification Signal belongs on the
   **Deployment**, while reusable facts (category, terms) live once on the **Type**.
2. **A small, minted-once predicate vocabulary.** Predicates are shared infrastructure,
   not per-submission strings. They are minted once and referenced forever — the same
   pattern Intuition already uses for the canonical `has tag` predicate
   (`0x7ec36d201c842dc787b45cb5bb753bea4cf849be3908fb1b0a7d067c3c3cc1f5`). This keeps
   the graph queryable: every "X restricts Token Amount" claim points at the *same*
   predicate atom and the *same* category atom.
3. **Claims are triples; confidence is Signal.** Every fact about an enforcer is a
   triple, and conviction in that fact is **Signal** — Intuition's primitive for
   "the aggregated attestation state of an Atom or Triple," generated when stakers
   deposit into the triple's vault. Staking *for* the triple is Signal; staking into
   its **counter** vault is counter-Signal (dispute). No fact is privileged by being
   in a JSON file — the JSON seed (`seed/enforcers.json`) is just a convenience to
   bootstrap the same triples and let the community Signal on them.
4. **Composability lives in the graph, not the UI.** "These two enforcers compose"
   is a triple, so the community can extend and contest it. The dapp renders triples;
   it does not hardcode compatibility.
5. **The `terms` schema is machine-readable.** The novel piece. An enforcer's `terms`
   bytes are meaningless without its parameter layout. We attach that layout as a
   structured atom so a wallet can encode/decode caveat parameters straight from the
   registry.

---

## 2. Atom types

| Atom kind | Identifier / content | Example |
|---|---|---|
| **Enforcer Type** | concept string (the named implementation) | `ERC20TransferAmountEnforcer` |
| **Enforcer Deployment** | Atom whose data is CAIP-10 `caip10:eip155:{chainId}:{address}` | label `caip10:eip155:1:0x...` |
| **Class** | concept string | `ERC-7710 Caveat Enforcer` |
| **Restriction category** | concept string (controlled set, §4) | `Token Amount Restriction` |
| **Chain** | CAIP-2 `eip155:{chainId}` | `eip155:1155` (Intuition mainnet) |
| **Auditor** | entity string | `MetaMask / Consensys Diligence` |
| **Audit status** | concept string (controlled set) | `Official — MetaMask Delegation Toolkit` |
| **Terms schema** | structured JSON atom (§5) | `{ "name": "...", "fields": [...] }` |
| **Use-case preset** | concept string | `Time-gated token transfer` |
| **Source / docs** | URI | `https://github.com/MetaMask/delegation-framework/.../TimestampEnforcer.sol` |
| **Predicate** | concept string (controlled set, §3) | `restricts` |

Every atom has a permanent on-chain `term_id` (its DID / verifiable address); the
CAIP-10 string, the CAIP-2 chain, the URI etc. are the atom's **data**, not its id —
so deriving the same deployment address always resolves to the same atom (dedupe-safe).
Deployment, chain, and source atoms are **objective** (anyone deriving them gets the
same atom). Type, category, audit, terms-schema, and preset atoms are **curated** —
their *attachment* via a triple is the attestable claim, not the atom itself.

---

## 3. Predicate vocabulary (minted once)

| Predicate | Subject → Object | Meaning |
|---|---|---|
| `is a` | Enforcer Type → Class | Marks the implementation as an ERC-7710 caveat enforcer. **Primary Signal triple** (ranks the registry). |
| `restricts` | Enforcer Type → Restriction category | What the enforcer constrains. May appear multiple times. |
| `has terms schema` | Enforcer Type → Terms schema | Machine-readable `terms` layout. |
| `source at` | Enforcer Type → Source/docs URI | Canonical implementation source. |
| `composes with` | Enforcer Type → Enforcer Type | Claimed compatible for a specified use case (not a universal-safety claim). |
| `conflicts with` | Enforcer Type → Enforcer Type | Mutually exclusive / one negates the other. |
| `complements` | Enforcer Type → Enforcer Type | Commonly paired for a use case. |
| `implements` | Enforcer Deployment → Enforcer Type | This deployed address is an instance of the type. |
| `deployed on` | Enforcer Deployment → Chain | Which chain this instance lives on. |
| `has audit status` | Enforcer Deployment → Audit status | Audited / Unaudited / Official — for *this address*. |
| `audited by` | Enforcer Deployment → Auditor | Who audited/verified this instance (optional). |
| `source at` | Enforcer Deployment → Source/docs URI | Deployment tx or verified-source link for this address. |
| `used by` | Enforcer Deployment → Entity | Protocol/wallet known to use this instance (optional). |
| `uses` | Use-case preset → Enforcer Type | Preset is composed of these enforcer types. |

> Subjects are deliberately split: **chain-independent logic facts** (category, terms,
> composability) attach to the **Type**; **chain-specific instance facts** (which chain,
> audit/verification of *this* address) attach to the **Deployment**. `source at` is the
> one predicate used on both — the Type's canonical repo vs. a Deployment's verified
> source/tx.

> Rationale for keeping `composes with` / `conflicts with` / `complements` distinct
> rather than one "relatesTo" predicate: a wallet building a caveat picker needs to
> *act* differently on each — suggest (`composes`/`complements`) vs warn (`conflicts`).
> Collapsing them would push that logic back into UI code, violating principle 4.

---

## 4. Restriction categories (controlled vocabulary)

Grouping the 32 official enforcers into a stable category set so the registry is
filterable. An enforcer may carry more than one `restricts` triple.

| Category | Covers |
|---|---|
| `Token Amount Restriction` | ERC20TransferAmount, NativeTokenTransferAmount |
| `Token Streaming Restriction` | ERC20Streaming, NativeTokenStreaming |
| `Token Period Restriction` | ERC20PeriodTransfer, NativeTokenPeriodTransfer, MultiTokenPeriod |
| `Balance Change Restriction` | ERC20BalanceChange, ERC721BalanceChange, ERC1155BalanceChange, NativeBalanceChange |
| `Token Transfer Restriction` | ERC721Transfer, SpecificActionERC20TransferBatch |
| `Payment Restriction` | NativeTokenPayment |
| `Target Restriction` | AllowedTargets |
| `Method Restriction` | AllowedMethods |
| `Calldata Restriction` | AllowedCalldata, ExactCalldata, ExactCalldataBatch |
| `Execution Restriction` | ExactExecution, ExactExecutionBatch |
| `Value Restriction` | ValueLte |
| `Time Restriction` | Timestamp |
| `Block Restriction` | BlockNumber |
| `Call Count Restriction` | LimitedCalls |
| `Redeemer Restriction` | Redeemer |
| `Replay / ID Restriction` | Nonce, Id |
| `Ownership Restriction` | OwnershipTransfer, ApprovalRevocation |
| `Deployment Restriction` | Deployed |
| `Argument Restriction` | ArgsEqualityCheck |

---

## 5. Terms schema atom (the machine-readable piece)

An enforcer type's `Caveat.terms` is enforcer-specific packed bytes. It is a property
of the **Type** (same across every deployment), so `has terms schema` hangs off the
Type. To make it encodable/decodable from the registry, the object atom holds a
structured description:

```json
{
  "enforcer": "ERC20TransferAmountEnforcer",
  "encoding": "abi.encodePacked",
  "status": "verified",
  "termsLength": 52,
  "fields": [
    { "name": "allowedContract", "type": "address", "offset": 0 },
    { "name": "maxTokens",       "type": "uint256", "offset": 20 }
  ]
}
```

- `encoding` distinguishes `abi.encodePacked` (most enforcers) from `abi.encode`.
- `fields` is the ordered parameter list. For packed encoding the seed now records the
  byte `offset` and total `termsLength` of each field, read directly from the enforcer's
  `getTermsInfo` in the framework source. (Offsets are also derivable from the type
  widths; recording the verified value lets an integrator decode `terms` without
  re-deriving.)
- A wallet integrating the registry reads this atom and can build the `terms` blob for
  a caveat without reading the enforcer source.

> **Verification status:** the `fields` lists in `seed/enforcers.json` are populated from
> each enforcer's `getTermsInfo` in the framework source — **31 of 32** carry
> `"status": "verified"` (exact fields, types, byte offsets, and total `termsLength`).
> The sole exception is **`SpecificActionERC20TransferBatchEnforcer`**, marked
> `"status": "partial"`: its `TermsData` is a compound struct captured at a high level,
> with the exact field breakdown still to confirm against source. No other field list is
> outstanding.

---

## 6. Worked example — one enforcer, fully represented

`ERC20TransferAmountEnforcer`, the type, plus one deployment on Ethereum mainnet:

```
Atoms:
  T   = "ERC20TransferAmountEnforcer"                     (Enforcer Type)
  C   = "ERC-7710 Caveat Enforcer"                        (class)
  R   = "Token Amount Restriction"                        (category)
  TS  = { enforcer:"ERC20TransferAmountEnforcer", ... }   (terms schema)
  SRC = "https://github.com/MetaMask/delegation-framework/blob/main/src/enforcers/ERC20TransferAmountEnforcer.sol"
  D   = caip10:eip155:1:0x<addr>                          (Enforcer Deployment)
  CH  = eip155:1                                          (chain)
  AS  = "Official — MetaMask Delegation Toolkit"          (audit status)

Type triples — chain-independent logic (each independently stakeable):
  T  —[is a]→               C      ← headline Signal: stake here = "recognized enforcer"
  T  —[restricts]→          R
  T  —[has terms schema]→   TS
  T  —[source at]→          SRC

Deployment triples — chain-specific instance:
  D  —[implements]→         T
  D  —[deployed on]→        CH
  D  —[has audit status]→   AS      ← audit of THIS address, not the type in the abstract

Composability (community-attested, Type → Type):
  T  —[composes with]→  "TimestampEnforcer"
  T  —[complements]→    "LimitedCallsEnforcer"
```

A use-case preset is just another subgraph over types:

```
P = "Time-gated token transfer"
  P —[uses]→ "ERC20TransferAmountEnforcer"
  P —[uses]→ "TimestampEnforcer"
```

---

## 7. Claims about claims (triple-on-triple)

A flat registry stops at "deployment → audited by → auditor." Intuition doesn't: a Triple
can itself be the subject or object of another Triple, so we attest to *claims*, not just
entities. This is the part a normal database can't express, and it's where the registry
earns the "native" label.

Two places it matters here:

- **Audit provenance.** The bare claim is `D —audited by→ Auditor` (on the deployment).
  The *evidence* for it is a claim about that claim:
  ```
  [[ D —audited by→ Auditor ]] —has report→ <audit-report URI>
  ```
  Signal on the **inner** triple endorses "yes, this address was audited"; Signal on the
  outer triple endorses "and here's the report backing it." A wallet can trust the audit
  proportionally to the Signal on the inner claim, independent of who keeps re-asserting it.

- **Composability with evidence.** `[[ T_a —composes with→ T_b ]]` is itself signalable,
  and can be tied to where it's been shown to work:
  ```
  [[ E_a —composes with→ E_b ]] —demonstrated in→ "Time-gated token transfer" (preset)
  ```
  So "these compose" isn't an opinion floating in the UI — it's a staked claim with a
  pointer to the use-case that exercises it.

The dapp does not need triple-on-triple to ship the v1 browse/submit flows (flat triples
cover those), but the schema reserves it as the canonical way to carry **provenance and
contested evidence**, which is exactly the registry's hard problem: *"is this safe, and
who says so?"*

## 8. Signal semantics (FOR and counter)

- **`is a` triple = the headline Signal.** Total assets staked on `T —is a→ Caveat
  Enforcer` is the single number that ranks the registry. High Signal = community
  recognizes it as a **legitimate, recognized** enforcer — *not* a safety verdict.
  Safety is carried by the separate audit / source / composability claims (mostly on the
  Deployment), never collapsed into the headline. (Query: `order_by: { term: { total_assets: desc } }`.)
- **Per-claim Signal.** Staking on `D —has audit status→ Audited` attests *that specific
  claim*, independent of the headline — which is why audit status is its own triple, not
  a field. It can be Signalled and contested on its own.
- **Disputes = counter-Signal.** Every triple has a counter vault (`counter_term`); staking
  there is "I disagree." An enforcer whose core triple carries heavy counter-Signal is
  flagged, not filtered (see §9, Q4) — the data stays neutral, the policy lives at the edge.

---

## 9. Open questions (mission-listed) — proposed answers

**Q1 — Canonical list of MetaMask enforcer addresses per chain?**
**Answered.** The framework publishes all 32 enforcer addresses (plus the DelegationManager
and DeleGator impls) in `documents/Deployments.md`. The seed now attaches a CAIP-10
**Enforcer Deployment** atom per enforcer; every address was confirmed to have live bytecode
on Intuition testnet (13579) via `eth_getCode`, and is CREATE2-deterministic (`SimpleFactory`),
so the same address applies on Intuition mainnet (1155) — to be re-confirmed against the
mainnet RPC before reliance. The name-level facts remain reusable across every chain.

**Q2 — `terms` ABI as raw JSON atom or IPFS-pinned?**
Proposal: **inline JSON atom** for the compact schemas (all 32 official enforcers fit
in well under a KB), **IPFS URI atom** only if a community enforcer ships an oversized
or richly-documented schema. Inline keeps the common case fully on-graph and queryable
in one hop; IPFS is the escape hatch, not the default.

**Q3 — Any EVM chain, or scoped?**
Proposal: **launch scoped to Intuition mainnet (1155) + Ethereum mainnet (1)**, but the
schema imposes no chain limit — `deployed on` + CAIP-10 already generalise. Scoping is a
seeding decision, not a schema constraint.

**Q4 — Flag disputed enforcers or filter them?**
Proposal: **flag, don't filter.** Filtering above a threshold reintroduces a gatekeeper
and breaks permissionlessness. Surface a dispute badge when counter-stake on the core
triple exceeds a displayed ratio of its positive stake; let the querying wallet decide
its own threshold. The data stays neutral; the policy lives at the edge.

---

## 10. What this artifact is — and is not

**Is:** a proposed ontology + a source-verified 32-enforcer seed (`seed/enforcers.json` —
terms layouts with byte offsets + per-chain CAIP-10 deployments) + a canonical read query
(`examples/registry-query.graphql`) + a live read-only dapp generated from the seed
(`app/`). Enough that a contributor can mint the same triples by hand and a wallet can read them.

**Is not (yet):** the minted on-chain predicates, the real wallet-write flows (submit/attest
are mocked previews that export the exact triples), or the mainnet seeding run. Those are
gated on schema alignment and a funded wallet — the build-out the mission funds.
