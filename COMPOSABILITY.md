# Composability

The registry's differentiator is not a list of enforcers — it is **machine- and human-readable
guidance on which enforcers belong together**. Per the mission, composability is modeled as
**Intuition triples**, not hardcoded UI logic, so the community can extend and stake on it.

## What "composability" means here

Three relationship predicates, each an attestable triple subject/predicate/object over **Enforcer
Types** (not deployments — composability is a property of the meaning, not the address). Confidence
is expressed by Signal / staked TRUST on the triple; disagreement by staking the counter-triple.

| Predicate | Meaning | Example |
|---|---|---|
| `complements` | Each constrains a **different** dimension; combining them tightens scope with no overlap. Order-independent. | `TimestampEnforcer complements ERC20TransferAmountEnforcer` (a *when* bound + a *how much* bound) |
| `composes with` | Safe to use together and commonly do; may overlap but do not contradict. Weaker than `complements`. | `AllowedTargetsEnforcer composes with AllowedMethodsEnforcer` |
| `conflicts with` | Combining them is redundant or contradictory — one subsumes the other, or they can deadlock a redemption. Flag in UI. | `ExactCalldataEnforcer conflicts with AllowedCalldataEnforcer` |

A combination is "well-formed" when its enforcers are pairwise `complements`/`composes with` and no
pair is `conflicts with`. The UI surfaces the staked weight of each relationship, never a hardcoded verdict.

## Curated use-case presets

Each preset is a named bundle whose member relationships are themselves triples. A preset is just a
subject atom (e.g. `Preset: Time-gated token allowance`) linked by `includes enforcer` to its members,
plus the pairwise composability triples below.

### 1. Time-gated token allowance
*"This agent may move up to N of token T, but only within a validity window."*
- **Members:** `ERC20TransferAmountEnforcer` (amount cap) + `TimestampEnforcer` (validity window)
- **Optional:** `AllowedTargetsEnforcer` to pin the token contract as the only callable target.
- **Relationships:**
  - `TimestampEnforcer complements ERC20TransferAmountEnforcer` — *when* vs *how much*, no overlap.
  - `AllowedTargetsEnforcer complements ERC20TransferAmountEnforcer` — *where* vs *how much*.

### 2. Scoped agent action
*"This agent may call only these methods on only these contracts, at most K times."*
- **Members:** `AllowedTargetsEnforcer` + `AllowedMethodsEnforcer` + `LimitedCallsEnforcer`
- **Relationships:**
  - `AllowedTargetsEnforcer complements AllowedMethodsEnforcer` — *which contract* vs *which selector*.
  - `LimitedCallsEnforcer complements AllowedMethodsEnforcer` — *how often* vs *which selector*.
  - `LimitedCallsEnforcer conflicts with NonceEnforcer` — both throttle reuse; combining them is
    usually redundant (single-use is better expressed by one). Stake decides.

### 3. Streaming payout to a fixed redeemer
*"Funds stream over time, and only a specific account may redeem them."*
- **Members:** `ERC20StreamingEnforcer` (linear release) + `RedeemerEnforcer` (allowed redeemer set)
- **Relationships:**
  - `RedeemerEnforcer complements ERC20StreamingEnforcer` — *who may redeem* vs *how much is unlocked*.
  - `ERC20StreamingEnforcer conflicts with ERC20PeriodTransferEnforcer` on the same token — two
    different release models on one allowance contradict each other.

## Conflict / redundancy claims (seedable now)

These are high-confidence `conflicts with` triples worth seeding so the UI can warn immediately:
- `ExactCalldataEnforcer conflicts with AllowedCalldataEnforcer` — exact-match subsumes partial-match.
- `ExactExecutionEnforcer conflicts with AllowedTargetsEnforcer` — exact execution already fixes the target.
- `ERC20StreamingEnforcer conflicts with ERC20PeriodTransferEnforcer` (same token) — competing release models.
- `LimitedCallsEnforcer conflicts with NonceEnforcer` — overlapping reuse throttles.

All claims above are proposals to be **staked**, not assertions. The registry surfaces the Signal
weight (FOR via the triple, AGAINST via the counter-triple); the community owns the final picture.
