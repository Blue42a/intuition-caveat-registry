#!/usr/bin/env node
// Generates PROVENANCE.md from seed/enforcers.json — every claim traces to a source file,
// a getTermsInfo signature, and an on-chain bytecode check. Regenerable, not hand-maintained.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const seed = JSON.parse(readFileSync(join(root, "seed/enforcers.json"), "utf8"));

let md = `# Provenance

Every fact in this registry traces to a verifiable source. This file is **generated** from
\`seed/enforcers.json\` by \`scripts/gen-provenance.mjs\` — it is not hand-maintained, so it
cannot drift from the seed.

## Verification chain

1. **Terms layout** — extracted from each enforcer's \`getTermsInfo(bytes)\` in
   MetaMask \`delegation-framework/src/enforcers/<Name>.sol\`: field names, solidity types,
   byte offsets, and total \`terms\` length come straight from the function body + its
   \`require(_terms.length == N)\` check.
2. **Deployment addresses** — from \`delegation-framework/documents/Deployments.md\`.
3. **On-chain check** — every address was confirmed to hold live bytecode on Intuition
   testnet (13579) via \`eth_getCode\`. Addresses are CREATE2-deterministic (\`SimpleFactory\`),
   so the same address applies on mainnet (1155) — flagged unverified there pending a mainnet
   \`eth_getCode\` (no over-claim).

Source base: \`${seed.sourceBase}\`

## Per-enforcer provenance

| Enforcer | Source file | Terms (length · status) | 13579 address | bytecode |
|---|---|---|---|---|
`;

for (const e of seed.enforcers) {
  const ts = e.termsSchema || {};
  const src = `${e.name}.sol`;
  const terms = `${ts.termsLength ?? "?"} · ${ts.status ?? "?"}`;
  const dep = (e.deployments || []).find((d) => d.chainId === 13579);
  const addr = dep ? `\`${dep.address}\`` : "—";
  const ok = dep?.bytecodeVerified ? "✓ eth_getCode" : "—";
  md += `| ${e.name} | [${src}](${seed.sourceBase}${e.name}.sol) | ${terms} | ${addr} | ${ok} |\n`;
}

const verified = seed.enforcers.filter((e) => e.termsSchema?.status === "verified").length;
md += `\n**Totals:** ${seed.enforcers.length} types · ${verified} terms-verified · ${seed.enforcers.length - verified} partial · ` +
  `${seed.enforcers.reduce((n, e) => n + (e.deployments?.length || 0), 0)} deployment atoms.\n`;

writeFileSync(join(root, "PROVENANCE.md"), md);
console.log("wrote PROVENANCE.md");
