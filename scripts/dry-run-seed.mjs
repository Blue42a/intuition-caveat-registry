#!/usr/bin/env node
// Dry-run of the mainnet seed: derives the exact deduped set of atoms and triples
// that seeding would create from seed/*.json, and prints a cost estimate. No private
// key, no signing, no network — pure projection of the source of truth.
//
// Costs default to placeholders; override with real on-chain values:
//   ATOM_COST_TRUST / TRIPLE_COST_TRUST  (fetch via `cast call $MULTIVAULT "getAtomCost()(uint256)"`
//   and getTripleCost()+minDeposit; see MEMORY notes). Example:
//   ATOM_COST_TRUST=0.001 TRIPLE_COST_TRUST=0.0021 node scripts/dry-run-seed.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const seed = JSON.parse(readFileSync(join(root, "seed/enforcers.json"), "utf8"));
const comp = JSON.parse(readFileSync(join(root, "seed/composability.json"), "utf8"));
const enforcers = seed.enforcers;

const atoms = new Map();   // key "kind\tdata" -> {kind, data}
const triples = [];        // {s, p, o}
const A = (kind, data) => { atoms.set(`${kind}\t${data}`, { kind, data }); return data; };
const T = (s, p, o) => triples.push({ s, p, o });

// predicate + class + chain atoms
const CLASS = A("class", "ERC-7710 Caveat Enforcer");
const PRED = {};
for (const p of ["is a", "restricts", "has terms schema", "source at", "implements", "deployed on", "composes with", "conflicts with", "complements", "includes enforcer"]) PRED[p] = A("predicate", p);
const chainAtom = (id) => A("chain", `eip155:${id}`);

for (const e of enforcers) {
  const type = A("enforcer-type", e.name);
  T(type, PRED["is a"], CLASS);
  for (const r of e.restricts || []) T(type, PRED["restricts"], A("restriction", r));
  if (e.termsSchema) T(type, PRED["has terms schema"], A("terms-schema", JSON.stringify(e.termsSchema)));
  T(type, PRED["source at"], A("source", (seed.sourceBase || "") + e.name + ".sol"));
  for (const d of e.deployments || []) {
    const dep = A("deployment", d.caip10);
    T(dep, PRED["implements"], type);
    T(dep, PRED["deployed on"], chainAtom(d.chainId));
  }
}

// composability
for (const r of comp.relationships) T(A("enforcer-type", r.subject), PRED[r.predicate], A("enforcer-type", r.object));
for (const p of comp.presets) {
  const preset = A("preset", p.name);
  for (const m of p.members || []) T(preset, PRED["includes enforcer"], A("enforcer-type", m));
}

// breakdown
const byKind = {};
for (const { kind } of atoms.values()) byKind[kind] = (byKind[kind] || 0) + 1;

const atomCost = parseFloat(process.env.ATOM_COST_TRUST ?? "0.001");
const tripleCost = parseFloat(process.env.TRIPLE_COST_TRUST ?? "0.0021");
const placeholder = process.env.ATOM_COST_TRUST === undefined;

console.log("=== Mainnet seed dry-run (no key, no broadcast) ===\n");
console.log(`Atoms to create: ${atoms.size}`);
for (const [k, n] of Object.entries(byKind).sort((a, b) => b[1] - a[1])) console.log(`    ${String(n).padStart(3)}  ${k}`);
console.log(`\nTriples to create: ${triples.length}`);
console.log("    sample:");
for (const t of triples.slice(0, 4)) console.log(`      (${t.s})  —[${pname(t.p)}]→  (${trunc(t.o)})`);

const cost = atoms.size * atomCost + triples.length * tripleCost;
console.log(`\nCost estimate: ${atoms.size} atoms × ${atomCost} + ${triples.length} triples × ${tripleCost} = ${cost.toFixed(4)} TRUST`);
if (placeholder) console.log("    (placeholder costs — set ATOM_COST_TRUST / TRIPLE_COST_TRUST from getAtomCost()/getTripleCost()+minDeposit for a real figure)");
console.log("\nNothing was created. Re-run the real seed only from the funded Blue42a wallet after alignment.");

function pname(p) { return p; }
function trunc(s) { return s.length > 40 ? s.slice(0, 37) + "…" : s; }
