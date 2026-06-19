// Projects the exact atoms/triples a write WOULD create — shown in the mock write flows.
// This is the same shape the real wallet write and the dry-run seed script produce; the
// UI never writes anything, it only shows what would be written.
import type { Enforcer } from "./types";
import { seed } from "./data";

export interface TripleView { s: string; p: string; o: string }

// Submitting/registering one enforcer deployment.
export function submitTriples(e: Enforcer, chainId: number): TripleView[] {
  const dep = (e.deployments || []).find((d) => d.chainId === chainId);
  const caip10 = dep?.caip10 ?? `caip10:eip155:${chainId}:0x…`;
  const out: TripleView[] = [
    { s: e.name, p: "is a", o: seed.class },
    { s: caip10, p: "implements", o: e.name },
    { s: caip10, p: "deployed on", o: `eip155:${chainId}` },
  ];
  for (const r of e.restricts) out.push({ s: e.name, p: "restricts", o: r });
  if (e.termsSchema) out.push({ s: e.name, p: "has terms schema", o: shortSchema(e) });
  out.push({ s: e.name, p: "source at", o: `${seed.sourceBase}${e.name}.sol` });
  return out;
}

// Attesting (FOR) or disputing (AGAINST) a claim = staking on the triple / counter-triple.
export function attestTriple(e: Enforcer, dir: "for" | "against"): { triple: TripleView; vault: string } {
  return {
    triple: { s: e.name, p: "is a", o: seed.class },
    vault: dir === "for" ? "triple vault (stake TRUST → signal recognized)" : "counter-triple vault (stake TRUST → signal dispute)",
  };
}

function shortSchema(e: Enforcer): string {
  const ts = e.termsSchema!;
  const fields = ts.fields.map((f) => `${f.type} ${f.name}`).join(", ");
  return `{${ts.encoding}, ${ts.status}, len ${ts.termsLength}: ${fields || "—"}}`;
}
