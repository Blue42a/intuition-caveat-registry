# Registry UI (read-only)

A thin registry dapp **generated entirely from the seed** — `seed/enforcers.json` and
`seed/composability.json` are the single source of truth; the app holds no duplicate data.

```bash
cd app
npm install
npm run dev        # read-only registry UI
npm run build      # typecheck + production build
```

## What it shows
- **Browse** — all 32 enforcer types, filterable by restriction category and terms-verification status.
- **Detail** — verified terms layout (fields + **byte offsets** + length), per-chain CAIP-10
  deployments with `eth_getCode` verification badges, source provenance, and composability relations.
- **Composability** — use-case presets and `complements` / `composes with` / `conflicts with`
  relationships, surfaced as attestable claims (not hardcoded UI logic).
- **Write flows (mock)** — Submit and Attest/Dispute render the **exact atoms/triples a real write
  would create**. No wallet is connected; nothing is signed or broadcast.

## Rigor scripts (no deps, no network)
```bash
node scripts/validate-seed.mjs   # 32 types, 64 deployments, offsets sum to termsLength, no mainnet over-claim
node scripts/dry-run-seed.mjs    # projects the exact atom/triple set + cost estimate; no private key
```

Real wallet writes and mainnet seeding are deliberately **not** implemented yet — they wait for
schema alignment with the Intuition team and a funded wallet.
