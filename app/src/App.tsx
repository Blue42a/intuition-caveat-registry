import { useMemo, useState } from "react";
import { enforcers, composability, allRestrictions, relationsFor, sourceUrl } from "./data";
import { submitTriples, attestTriple, type TripleView } from "./triples";
import type { Enforcer } from "./types";

type Tab = "browse" | "composability";

export default function App() {
  const [tab, setTab] = useState<Tab>("browse");
  const [selected, setSelected] = useState<string | null>(null);

  const current = selected ? enforcers.find((e) => e.name === selected) ?? null : null;

  return (
    <div className="wrap">
      <header>
        <h1>ERC-7710 Caveat Enforcer Registry</h1>
        <p>A read-only registry UI generated entirely from a source-verified ontology
          (<code>seed/enforcers.json</code>) — verified terms layouts, byte offsets, and
          per-chain deployments. Write flows are mocked; nothing is signed.</p>
      </header>

      <div className="tabs">
        <button className={tab === "browse" && !current ? "active" : ""} onClick={() => { setTab("browse"); setSelected(null); }}>Browse</button>
        <button className={tab === "composability" && !current ? "active" : ""} onClick={() => { setTab("composability"); setSelected(null); }}>Composability</button>
      </div>

      {current ? (
        <Detail e={current} onBack={() => setSelected(null)} onSelect={setSelected} />
      ) : tab === "browse" ? (
        <Browse onSelect={setSelected} />
      ) : (
        <ComposabilityView onSelect={setSelected} />
      )}
    </div>
  );
}

function Browse({ onSelect }: { onSelect: (n: string) => void }) {
  const [q, setQ] = useState("");
  const [restriction, setRestriction] = useState("");
  const [status, setStatus] = useState("");

  const rows = useMemo(
    () =>
      enforcers.filter((e) => {
        if (q && !e.name.toLowerCase().includes(q.toLowerCase())) return false;
        if (restriction && !e.restricts.includes(restriction)) return false;
        if (status && e.termsSchema?.status !== status) return false;
        return true;
      }),
    [q, restriction, status],
  );

  return (
    <>
      <div className="filters">
        <input placeholder="Search enforcer…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={restriction} onChange={(e) => setRestriction(e.target.value)}>
          <option value="">All restrictions</option>
          {allRestrictions.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Any terms status</option>
          <option value="verified">verified</option>
          <option value="partial">partial</option>
        </select>
        <span className="muted" style={{ alignSelf: "center" }}>{rows.length} / {enforcers.length}</span>
      </div>
      <div className="grid">
        {rows.map((e) => (
          <div className="card" key={e.name} onClick={() => onSelect(e.name)}>
            <h3>{e.name}</h3>
            <div>{e.restricts.map((r) => <span className="tag" key={r}>{r}</span>)}</div>
            <div style={{ marginTop: 6 }}>
              <StatusTag e={e} />
              <span className="tag">{(e.deployments || []).length} deployments</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function StatusTag({ e }: { e: Enforcer }) {
  const s = e.termsSchema?.status;
  if (s === "verified") return <span className="tag verified">terms verified</span>;
  if (s === "partial") return <span className="tag partial">terms partial</span>;
  return <span className="tag">terms —</span>;
}

function Detail({ e, onBack, onSelect }: { e: Enforcer; onBack: () => void; onSelect: (n: string) => void }) {
  const rels = relationsFor(e.name);
  return (
    <>
      <button className="back" onClick={onBack}>← Back</button>
      <div className="panel">
        <h2 style={{ marginTop: 0 }}>{e.name}</h2>
        <div>{e.restricts.map((r) => <span className="tag" key={r}>{r}</span>)} <StatusTag e={e} /></div>
        <p className="muted">Source: <a href={sourceUrl(e.name)} target="_blank" rel="noreferrer">{e.name}.sol</a></p>
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Terms layout</h3>
        {e.termsSchema ? (
          <>
            <div className="kv">
              <span className="muted">encoding</span><span className="mono">{e.termsSchema.encoding}</span>
              <span className="muted">termsLength</span><span className="mono">{String(e.termsSchema.termsLength)}</span>
              <span className="muted">status</span><span><StatusTag e={e} /></span>
            </div>
            <table style={{ marginTop: 10 }}>
              <thead><tr><th>offset</th><th>field</th><th>type</th></tr></thead>
              <tbody>
                {e.termsSchema.fields.length === 0 && <tr><td colSpan={3} className="muted">no parameters (empty terms)</td></tr>}
                {e.termsSchema.fields.map((f) => (
                  <tr key={f.name}><td className="mono">{f.offset ?? "—"}</td><td>{f.name}</td><td className="mono">{f.type}</td></tr>
                ))}
              </tbody>
            </table>
          </>
        ) : <span className="muted">no terms schema</span>}
      </div>

      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Deployments</h3>
        <table>
          <thead><tr><th>chain</th><th>CAIP-10</th><th>bytecode</th></tr></thead>
          <tbody>
            {(e.deployments || []).map((d) => (
              <tr key={d.chainId}>
                <td>{d.chainId} <span className="muted">{d.network}</span></td>
                <td className="mono">{d.caip10}</td>
                <td>{d.bytecodeVerified
                  ? <span className="tag verified">eth_getCode ✓</span>
                  : <span className="tag">unverified{d.note ? " · " + d.note : ""}</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rels.length > 0 && (
        <div className="panel">
          <h3 style={{ marginTop: 0 }}>Composability</h3>
          <table>
            <thead><tr><th>subject</th><th>relation</th><th>object</th><th>why</th></tr></thead>
            <tbody>
              {rels.map((r, i) => (
                <tr key={i}>
                  <td><a onClick={() => onSelect(r.subject)} style={{ cursor: "pointer" }}>{r.subject}</a></td>
                  <td><RelTag p={r.predicate} /></td>
                  <td><a onClick={() => onSelect(r.object)} style={{ cursor: "pointer" }}>{r.object}</a></td>
                  <td className="muted">{r.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <WriteMocks e={e} />
    </>
  );
}

function RelTag({ p }: { p: string }) {
  const cls = p === "conflicts with" ? "tag bad" : p === "complements" ? "tag verified" : "tag";
  return <span className={cls}>{p}</span>;
}

function WriteMocks({ e }: { e: Enforcer }) {
  const [chainId, setChainId] = useState(13579);
  const submit = submitTriples(e, chainId);
  const attest = attestTriple(e, "for");
  const dispute = attestTriple(e, "against");
  return (
    <div className="panel">
      <h3 style={{ marginTop: 0 }}>Write flows (mock)</h3>
      <div className="mockbar">MOCK — no wallet connected, nothing is signed or broadcast. This shows the exact atoms/triples a real write would create.</div>

      <h4>Submit / register deployment</h4>
      <div className="filters">
        <label className="muted" style={{ alignSelf: "center" }}>chain</label>
        <select value={chainId} onChange={(ev) => setChainId(Number(ev.target.value))}>
          <option value={13579}>13579 (testnet)</option>
          <option value={1155}>1155 (mainnet)</option>
        </select>
      </div>
      <Triples list={submit} />

      <h4 style={{ marginTop: 16 }}>Attest / dispute the legitimacy claim</h4>
      <div className="triple">FOR → stake TRUST on <Triple t={attest.triple} /> <span className="muted">({attest.vault})</span></div>
      <div className="triple">AGAINST → stake TRUST on counter-vault of the same triple <span className="muted">({dispute.vault})</span></div>
    </div>
  );
}

function Triples({ list }: { list: TripleView[] }) {
  return <div>{list.map((t, i) => <div className="triple" key={i}><Triple t={t} /></div>)}</div>;
}
function Triple({ t }: { t: TripleView }) {
  return <span className="mono">({t.s}) <span className="p">—[{t.p}]→</span> ({t.o})</span>;
}

function ComposabilityView({ onSelect }: { onSelect: (n: string) => void }) {
  return (
    <>
      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Use-case presets</h3>
        {composability.presets.map((p) => (
          <div key={p.name} style={{ marginBottom: 12 }}>
            <strong>{p.name}</strong> <span className="muted">— {p.intent}</span>
            <div style={{ marginTop: 4 }}>
              {p.members.map((m) => <span className="tag verified" key={m} style={{ cursor: "pointer" }} onClick={() => onSelect(m)}>{m}</span>)}
              {(p.optional || []).map((m) => <span className="tag" key={m} style={{ cursor: "pointer" }} onClick={() => onSelect(m)}>{m} (optional)</span>)}
            </div>
          </div>
        ))}
      </div>
      <div className="panel">
        <h3 style={{ marginTop: 0 }}>Relationships <span className="muted">(attestable triples, not hardcoded UI rules)</span></h3>
        <table>
          <thead><tr><th>subject</th><th>relation</th><th>object</th><th>why</th></tr></thead>
          <tbody>
            {composability.relationships.map((r, i) => (
              <tr key={i}>
                <td><a onClick={() => onSelect(r.subject)} style={{ cursor: "pointer" }}>{r.subject}</a></td>
                <td><RelTag p={r.predicate} /></td>
                <td><a onClick={() => onSelect(r.object)} style={{ cursor: "pointer" }}>{r.object}</a></td>
                <td className="muted">{r.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="muted">Predicate meanings: {Object.entries(composability.predicates).map(([k, v]) => `${k} = ${v}`).join("  ·  ")}</p>
      </div>
    </>
  );
}
