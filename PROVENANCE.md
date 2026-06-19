# Provenance

Every fact in this registry traces to a verifiable source. This file is **generated** from
`seed/enforcers.json` by `scripts/gen-provenance.mjs` — it is not hand-maintained, so it
cannot drift from the seed.

## Verification chain

1. **Terms layout** — extracted from each enforcer's `getTermsInfo(bytes)` in
   MetaMask `delegation-framework/src/enforcers/<Name>.sol`: field names, solidity types,
   byte offsets, and total `terms` length come straight from the function body + its
   `require(_terms.length == N)` check.
2. **Deployment addresses** — from `delegation-framework/documents/Deployments.md`.
3. **On-chain check** — every address was confirmed to hold live bytecode on Intuition
   testnet (13579) via `eth_getCode`. Addresses are CREATE2-deterministic (`SimpleFactory`),
   so the same address applies on mainnet (1155) — flagged unverified there pending a mainnet
   `eth_getCode` (no over-claim).

Source base: `https://github.com/MetaMask/delegation-framework/blob/main/src/enforcers/`

## Per-enforcer provenance

| Enforcer | Source file | Terms (length · status) | 13579 address | bytecode |
|---|---|---|---|---|
| ERC20TransferAmountEnforcer | [ERC20TransferAmountEnforcer.sol](https://github.com/MetaMask/delegation-framework/blob/main/src/enforcers/ERC20TransferAmountEnforcer.sol) | 52 · verified | `0xf100b0819427117EcF76Ed94B358B1A5b5C6D2Fc` | ✓ eth_getCode |
| NativeTokenTransferAmountEnforcer | [NativeTokenTransferAmountEnforcer.sol](https://github.com/MetaMask/delegation-framework/blob/main/src/enforcers/NativeTokenTransferAmountEnforcer.sol) | 32 · verified | `0xF71af580b9c3078fbc2BBF16FbB8EEd82b330320` | ✓ eth_getCode |
| ERC20StreamingEnforcer | [ERC20StreamingEnforcer.sol](https://github.com/MetaMask/delegation-framework/blob/main/src/enforcers/ERC20StreamingEnforcer.sol) | 148 · verified | `0x56c97aE02f233B29fa03502Ecc0457266d9be00e` | ✓ eth_getCode |
| NativeTokenStreamingEnforcer | [NativeTokenStreamingEnforcer.sol](https://github.com/MetaMask/delegation-framework/blob/main/src/enforcers/NativeTokenStreamingEnforcer.sol) | 128 · verified | `0xD10b97905a320b13a0608f7E9cC506b56747df19` | ✓ eth_getCode |
| ERC20PeriodTransferEnforcer | [ERC20PeriodTransferEnforcer.sol](https://github.com/MetaMask/delegation-framework/blob/main/src/enforcers/ERC20PeriodTransferEnforcer.sol) | 116 · verified | `0x474e3Ae7E169e940607cC624Da8A15Eb120139aB` | ✓ eth_getCode |
| NativeTokenPeriodTransferEnforcer | [NativeTokenPeriodTransferEnforcer.sol](https://github.com/MetaMask/delegation-framework/blob/main/src/enforcers/NativeTokenPeriodTransferEnforcer.sol) | 96 · verified | `0x9BC0FAf4Aca5AE429F4c06aEEaC517520CB16BD9` | ✓ eth_getCode |
| MultiTokenPeriodEnforcer | [MultiTokenPeriodEnforcer.sol](https://github.com/MetaMask/delegation-framework/blob/main/src/enforcers/MultiTokenPeriodEnforcer.sol) | multiple of 116, != 0 · verified | `0xFB2f1a9BD76d3701B730E5d69C3219D42D80eBb7` | ✓ eth_getCode |
| ERC20BalanceChangeEnforcer | [ERC20BalanceChangeEnforcer.sol](https://github.com/MetaMask/delegation-framework/blob/main/src/enforcers/ERC20BalanceChangeEnforcer.sol) | 73 · verified | `0xcdF6aB796408598Cea671d79506d7D48E97a5437` | ✓ eth_getCode |
| ERC721BalanceChangeEnforcer | [ERC721BalanceChangeEnforcer.sol](https://github.com/MetaMask/delegation-framework/blob/main/src/enforcers/ERC721BalanceChangeEnforcer.sol) | 73 · verified | `0x8aFdf96eDBbe7e1eD3f5Cd89C7E084841e12A09e` | ✓ eth_getCode |
| ERC1155BalanceChangeEnforcer | [ERC1155BalanceChangeEnforcer.sol](https://github.com/MetaMask/delegation-framework/blob/main/src/enforcers/ERC1155BalanceChangeEnforcer.sol) | 105 · verified | `0x63c322732695cAFbbD488Fc6937A0A7B66fC001A` | ✓ eth_getCode |
| NativeBalanceChangeEnforcer | [NativeBalanceChangeEnforcer.sol](https://github.com/MetaMask/delegation-framework/blob/main/src/enforcers/NativeBalanceChangeEnforcer.sol) | 53 · verified | `0xbD7B277507723490Cd50b12EaaFe87C616be6880` | ✓ eth_getCode |
| ERC721TransferEnforcer | [ERC721TransferEnforcer.sol](https://github.com/MetaMask/delegation-framework/blob/main/src/enforcers/ERC721TransferEnforcer.sol) | 52 · verified | `0x3790e6B7233f779b09DA74C72b6e94813925b9aF` | ✓ eth_getCode |
| SpecificActionERC20TransferBatchEnforcer | [SpecificActionERC20TransferBatchEnforcer.sol](https://github.com/MetaMask/delegation-framework/blob/main/src/enforcers/SpecificActionERC20TransferBatchEnforcer.sol) | >= 124 · partial | `0x6649b61c873F6F9686A1E1ae9ee98aC380c7bA13` | ✓ eth_getCode |
| NativeTokenPaymentEnforcer | [NativeTokenPaymentEnforcer.sol](https://github.com/MetaMask/delegation-framework/blob/main/src/enforcers/NativeTokenPaymentEnforcer.sol) | 52 · verified | `0x4803a326ddED6dDBc60e659e5ed12d85c7582811` | ✓ eth_getCode |
| AllowedTargetsEnforcer | [AllowedTargetsEnforcer.sol](https://github.com/MetaMask/delegation-framework/blob/main/src/enforcers/AllowedTargetsEnforcer.sol) | multiple of 20, != 0 · verified | `0x7F20f61b1f09b08D970938F6fa563634d65c4EeB` | ✓ eth_getCode |
| AllowedMethodsEnforcer | [AllowedMethodsEnforcer.sol](https://github.com/MetaMask/delegation-framework/blob/main/src/enforcers/AllowedMethodsEnforcer.sol) | multiple of 4, != 0 · verified | `0x2c21fD0Cb9DC8445CB3fb0DC5E7Bb0Aca01842B5` | ✓ eth_getCode |
| AllowedCalldataEnforcer | [AllowedCalldataEnforcer.sol](https://github.com/MetaMask/delegation-framework/blob/main/src/enforcers/AllowedCalldataEnforcer.sol) | >= 33 · verified | `0xc2b0d624c1c4319760C96503BA27C347F3260f55` | ✓ eth_getCode |
| ExactCalldataEnforcer | [ExactCalldataEnforcer.sol](https://github.com/MetaMask/delegation-framework/blob/main/src/enforcers/ExactCalldataEnforcer.sol) | variable · verified | `0x99F2e9bF15ce5eC84685604836F71aB835DBBdED` | ✓ eth_getCode |
| ExactCalldataBatchEnforcer | [ExactCalldataBatchEnforcer.sol](https://github.com/MetaMask/delegation-framework/blob/main/src/enforcers/ExactCalldataBatchEnforcer.sol) | variable · verified | `0x982FD5C86BBF425d7d1451f974192d4525113DfD` | ✓ eth_getCode |
| ExactExecutionEnforcer | [ExactExecutionEnforcer.sol](https://github.com/MetaMask/delegation-framework/blob/main/src/enforcers/ExactExecutionEnforcer.sol) | variable · verified | `0x146713078D39eCC1F5338309c28405ccf85Abfbb` | ✓ eth_getCode |
| ExactExecutionBatchEnforcer | [ExactExecutionBatchEnforcer.sol](https://github.com/MetaMask/delegation-framework/blob/main/src/enforcers/ExactExecutionBatchEnforcer.sol) | variable · verified | `0x1e141e455d08721Dd5BCDA1BaA6Ea5633Afd5017` | ✓ eth_getCode |
| ValueLteEnforcer | [ValueLteEnforcer.sol](https://github.com/MetaMask/delegation-framework/blob/main/src/enforcers/ValueLteEnforcer.sol) | 32 · verified | `0x92Bf12322527cAA612fd31a0e810472BBB106A8F` | ✓ eth_getCode |
| TimestampEnforcer | [TimestampEnforcer.sol](https://github.com/MetaMask/delegation-framework/blob/main/src/enforcers/TimestampEnforcer.sol) | 32 · verified | `0x1046bb45C8d673d4ea75321280DB34899413c069` | ✓ eth_getCode |
| BlockNumberEnforcer | [BlockNumberEnforcer.sol](https://github.com/MetaMask/delegation-framework/blob/main/src/enforcers/BlockNumberEnforcer.sol) | 32 · verified | `0x5d9818dF0AE3f66e9c3D0c5029DAF99d1823ca6c` | ✓ eth_getCode |
| LimitedCallsEnforcer | [LimitedCallsEnforcer.sol](https://github.com/MetaMask/delegation-framework/blob/main/src/enforcers/LimitedCallsEnforcer.sol) | 32 · verified | `0x04658B29F6b82ed55274221a06Fc97D318E25416` | ✓ eth_getCode |
| RedeemerEnforcer | [RedeemerEnforcer.sol](https://github.com/MetaMask/delegation-framework/blob/main/src/enforcers/RedeemerEnforcer.sol) | multiple of 20, > 0 · verified | `0xE144b0b2618071B4E56f746313528a669c7E65c5` | ✓ eth_getCode |
| NonceEnforcer | [NonceEnforcer.sol](https://github.com/MetaMask/delegation-framework/blob/main/src/enforcers/NonceEnforcer.sol) | 32 · verified | `0xDE4f2FAC4B3D87A1d9953Ca5FC09FCa7F366254f` | ✓ eth_getCode |
| IdEnforcer | [IdEnforcer.sol](https://github.com/MetaMask/delegation-framework/blob/main/src/enforcers/IdEnforcer.sol) | 32 · verified | `0xC8B5D93463c893401094cc70e66A206fb5987997` | ✓ eth_getCode |
| OwnershipTransferEnforcer | [OwnershipTransferEnforcer.sol](https://github.com/MetaMask/delegation-framework/blob/main/src/enforcers/OwnershipTransferEnforcer.sol) | 20 · verified | `0x7EEf9734E7092032B5C56310Eb9BbD1f4A524681` | ✓ eth_getCode |
| ApprovalRevocationEnforcer | [ApprovalRevocationEnforcer.sol](https://github.com/MetaMask/delegation-framework/blob/main/src/enforcers/ApprovalRevocationEnforcer.sol) | 0 · verified | `0xe264F1f09A19505a1ca1a86D5b01E8bFdb64324A` | ✓ eth_getCode |
| DeployedEnforcer | [DeployedEnforcer.sol](https://github.com/MetaMask/delegation-framework/blob/main/src/enforcers/DeployedEnforcer.sol) | > 52 · verified | `0x24ff2AA430D53a8CD6788018E902E098083dcCd2` | ✓ eth_getCode |
| ArgsEqualityCheckEnforcer | [ArgsEqualityCheckEnforcer.sol](https://github.com/MetaMask/delegation-framework/blob/main/src/enforcers/ArgsEqualityCheckEnforcer.sol) | variable · verified | `0x44B8C6ae3C304213c3e298495e12497Ed3E56E41` | ✓ eth_getCode |

**Totals:** 32 types · 31 terms-verified · 1 partial · 64 deployment atoms.
