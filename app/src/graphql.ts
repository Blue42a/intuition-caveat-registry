// Live GraphQL adapter. The registry is designed to read from the Intuition graph; this
// proves the query path exists. Until the registry is seeded on-chain it returns 0 rows —
// the adapter, not the data, is the point here.
const ENDPOINT = "https://mainnet.intuition.sh/v1/graphql";

// Canonical query (see ../INTEGRATION.md). Resolved against live mainnet; structurally valid.
const QUERY = `
query RegistryEnforcers($isAPredicate: numeric!, $enforcerClassAtom: numeric!) {
  triples(
    where: { predicate_id: { _eq: $isAPredicate }, object_id: { _eq: $enforcerClassAtom } }
    order_by: { term: { total_assets: desc } }
  ) {
    term_id
    subject { term_id label }
    term { total_assets }
    counter_term { total_assets }
  }
}`;

export interface LiveResult { count: number; rows: { label: string; signalFor: string; signalAgainst: string }[]; note: string }

// isAPredicate / enforcerClassAtom are the deterministic term IDs resolved once after seeding.
export async function fetchLiveEnforcers(isAPredicate?: string, enforcerClassAtom?: string): Promise<LiveResult> {
  if (!isAPredicate || !enforcerClassAtom) {
    return { count: 0, rows: [], note: "registry not yet seeded — predicate/class term IDs unset. Adapter ready; query is live-schema valid." };
  }
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: QUERY, variables: { isAPredicate, enforcerClassAtom } }),
  });
  const json = await res.json();
  if (json.errors) return { count: 0, rows: [], note: "query error: " + JSON.stringify(json.errors) };
  const triples = json.data?.triples ?? [];
  return {
    count: triples.length,
    rows: triples.map((t: any) => ({
      label: t.subject?.label ?? "?",
      signalFor: String(t.term?.total_assets ?? 0),
      signalAgainst: String(t.counter_term?.total_assets ?? 0),
    })),
    note: triples.length ? "live mainnet data" : "live query ran; 0 rows (registry not yet seeded)",
  };
}
