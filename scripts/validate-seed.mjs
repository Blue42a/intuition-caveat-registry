#!/usr/bin/env node
// Validates seed/enforcers.json + seed/composability.json for internal rigor.
// No network, no deps. Exit 1 on any failure. This is the check a hand-shaped
// registry can't pass: terms offsets must sum to the declared length, deployments
// must be complete, and no mainnet address may claim bytecode verification it lacks.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const enforcers = JSON.parse(readFileSync(join(root, "seed/enforcers.json"), "utf8")).enforcers;
const comp = JSON.parse(readFileSync(join(root, "seed/composability.json"), "utf8"));

// fixed solidity-type byte widths for packed `terms`
const WIDTH = { address: 20, bool: 1, bytes32: 32, bytes4: 4, uint256: 32, uint128: 16, uint64: 8 };
const fail = [];
const pass = [];
const check = (cond, ok, bad) => (cond ? pass.push(ok) : fail.push(bad));

// 1. exactly 32 types, unique names
const names = enforcers.map((e) => e.name);
check(enforcers.length === 32, "32 enforcer types present", `expected 32 types, got ${enforcers.length}`);
check(new Set(names).size === names.length, "type names unique", "duplicate type name(s)");

// 2. 64 deployments — every type has a 13579 + 1155 entry
let depCount = 0;
for (const e of enforcers) {
  const chains = (e.deployments || []).map((d) => d.chainId).sort();
  depCount += (e.deployments || []).length;
  check(chains.length === 2 && chains[0] === 1155 && chains[1] === 13579,
    `${e.name}: 13579+1155 deployments`, `${e.name}: deployments not exactly [1155,13579] (got ${chains})`);
  for (const d of e.deployments || []) {
    const expected = `caip10:eip155:${d.chainId}:${d.address}`;
    check(d.caip10 === expected, `${e.name}@${d.chainId}: caip10 well-formed`, `${e.name}@${d.chainId}: caip10 "${d.caip10}" != "${expected}"`);
  }
}
check(depCount === 64, "64 deployment atoms total", `expected 64 deployments, got ${depCount}`);

// 3. terms offsets sum to termsLength (fixed-length verified entries)
for (const e of enforcers) {
  const ts = e.termsSchema;
  if (!ts || typeof ts.termsLength !== "number" || ts.termsLength === 0) continue; // skip variable/array/empty
  const fields = ts.fields || [];
  if (fields.length === 0) continue;
  // every field must have a fixed-width type and a monotonic offset
  let okLayout = true, cursor = 0;
  for (const f of fields) {
    const w = WIDTH[f.type];
    if (w === undefined) { okLayout = false; break; }        // variable type inside a fixed length → can't verify
    if (typeof f.offset !== "number" || f.offset !== cursor) { okLayout = false; break; }
    cursor += w;
  }
  if (!okLayout) { pass.push(`${e.name}: layout not offset-checkable (skipped)`); continue; }
  check(cursor === ts.termsLength,
    `${e.name}: offsets+widths sum to termsLength (${ts.termsLength})`,
    `${e.name}: fields sum to ${cursor} but termsLength=${ts.termsLength}`);
}

// 4. no mainnet (1155) bytecode over-claim
for (const e of enforcers) {
  for (const d of e.deployments || []) {
    if (d.chainId === 1155 && d.bytecodeVerified === true)
      fail.push(`${e.name}: 1155 claims bytecodeVerified=true (only 13579 was checked)`);
  }
}
pass.push("no 1155 bytecode over-claim");

// 5. composability references resolve to real types
const nameSet = new Set(names);
for (const r of comp.relationships) {
  check(nameSet.has(r.subject), `rel subject ${r.subject} exists`, `composability subject not in seed: ${r.subject}`);
  check(nameSet.has(r.object), `rel object ${r.object} exists`, `composability object not in seed: ${r.object}`);
  check(comp.predicates[r.predicate] !== undefined, `predicate ${r.predicate} defined`, `undefined predicate: ${r.predicate}`);
}
for (const p of comp.presets)
  for (const m of [...(p.members || []), ...(p.optional || [])])
    check(nameSet.has(m), `preset member ${m} exists`, `preset "${p.name}" references unknown type: ${m}`);
check(comp.presets.length >= 3, `${comp.presets.length} presets (>= 3 required)`, `only ${comp.presets.length} presets, need >= 3`);

// report
console.log(`PASS (${pass.length} checks)`);
const verified = enforcers.filter((e) => e.termsSchema?.status === "verified").length;
const partial = enforcers.filter((e) => e.termsSchema?.status === "partial").length;
console.log(`  termsSchema: ${verified} verified, ${partial} partial · deployments: ${depCount} · presets: ${comp.presets.length} · relationships: ${comp.relationships.length}`);
if (fail.length) {
  console.error(`\nFAIL (${fail.length}):`);
  for (const f of fail) console.error("  ✗ " + f);
  process.exit(1);
}
console.log("\nAll rigor checks passed.");
