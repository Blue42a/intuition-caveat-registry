// Builds the exact write payload (atoms + triples + signal target) the mock flows export.
// Same shape the real wallet write / dry-run seed produce — proves the write path is
// architected; only on-chain execution is gated.
import type { Enforcer } from "./types";
import { submitTriples } from "./triples";
import { seed } from "./data";

export interface WritePayload {
  operation: "submit-enforcer";
  enforcer: string;
  chainId: number;
  atoms: { kind: string; data: string }[];
  triples: { subject: string; predicate: string; object: string }[];
  signalTarget: { triple: string; vault: string; note: string };
  generatedBy: string;
}

export function buildSubmitPayload(e: Enforcer, chainId: number): WritePayload {
  const triples = submitTriples(e, chainId).map((t) => ({ subject: t.s, predicate: t.p, object: t.o }));
  // atoms = the unique endpoints referenced by these triples, typed by kind.
  const seen = new Map<string, { kind: string; data: string }>();
  const add = (kind: string, data: string) => seen.set(`${kind}\t${data}`, { kind, data });
  add("class", seed.class);
  add("enforcer-type", e.name);
  for (const t of triples) {
    if (t.predicate === "implements") add("deployment", t.subject);
    if (t.predicate === "deployed on") add("chain", t.object);
    if (t.predicate === "restricts") add("restriction", t.object);
    if (t.predicate === "has terms schema") add("terms-schema", t.object);
    if (t.predicate === "source at") add("source", t.object);
  }
  return {
    operation: "submit-enforcer",
    enforcer: e.name,
    chainId,
    atoms: [...seen.values()],
    triples,
    signalTarget: {
      triple: `(${e.name}, is a, ${seed.class})`,
      vault: "triple vault (FOR) / counter-triple vault (AGAINST)",
      note: "initial $TRUST deposit on this triple signals legitimacy; counter-vault signals dispute",
    },
    generatedBy: "intuition-caveat-registry (mock — not signed/broadcast)",
  };
}

export function downloadJson(filename: string, obj: unknown) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
