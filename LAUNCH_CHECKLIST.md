# Mainnet Launch Checklist

The schema, seed, validation, dry-run, and read-only dapp are done. The remaining steps are
gated on team alignment and a funded wallet — tracked here so launch is mechanical, not improvised.

| # | Step | Status | Gate |
|---|---|---|---|
| 1 | Schema/ontology approved by Intuition team | ☐ | team review (align on issue first) |
| 2 | `npm run validate` passes (158 checks) | ✅ | — |
| 3 | `npm run dry-run:seed` reviewed (atoms/triples/cost) | ✅ | — |
| 4 | Funded wallet for seeding (unlinked from prior wallets) | ☐ | wallet setup |
| 5 | Resolve `is a` predicate + `ERC-7710 Caveat Enforcer` class atom term IDs | ☐ | after first atoms created |
| 6 | Run real mainnet seed (32 types + 64 deployments + composability) | ☐ | steps 1 + 4 |
| 7 | Verify seeded data via the canonical GraphQL query (`INTEGRATION.md`) | ☐ | step 6 |
| 8 | Point the dapp's live-GraphQL mode at the seeded term IDs | ☐ | step 6 |
| 9 | Deploy the dapp (read-only) to a public URL | ☐ | — (can do now) |
| 10 | Build + connect wallet write flows (submit / attest) | ☐ | step 1 |
| 11 | Publish the integration guide + propose to the ERC-7710 community | ☐ | step 6 |

Steps 2, 3 are green. Step 9 (deploy) can happen immediately. Everything else waits on
alignment (1) and the funded wallet (4) — deliberately not done early.
