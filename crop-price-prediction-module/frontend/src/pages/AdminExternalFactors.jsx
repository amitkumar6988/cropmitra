import { useCallback, useEffect, useState } from "react";
import {
  fetchExternalFactors,
  toggleExternalFactor,
} from "../api/priceApi.js";

export default function AdminExternalFactors() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchExternalFactors();
      setItems(res.data || []);
    } catch (e) {
      setError(
        e.response?.data?.message ||
          e.message ||
          "Could not load external factors."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onToggle(factor) {
    setBusyId(factor._id);
    try {
      await toggleExternalFactor(factor._id, !factor.isActive);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Toggle failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="page">
      <div className="page-intro">
        <h1>External factors</h1>
        <p className="lede">
          Enable or disable modeled events (war, flood, fuel crisis). When
          active and within the date window, their impact multipliers apply to
          linked crops.
        </p>
      </div>

      {loading && <p className="muted">Loading…</p>}
      {error && <div className="card card-error">{error}</div>}

      <div className="grid-cards">
        {items.map((f) => (
          <section key={f._id} className="card factor-card">
            <div className="card-header">
              <h2 className="factor-title">{f.type}</h2>
              <span className={f.isActive ? "pill success" : "pill muted"}>
                {f.isActive ? "Active" : "Off"}
              </span>
            </div>
            <div className="factor-meta">
              <div>
                Impact ×<strong>{f.impact}</strong>
              </div>
              <div className="muted small">
                {new Date(f.startDate).toLocaleDateString()} →{" "}
                {new Date(f.endDate).toLocaleDateString()}
              </div>
            </div>
            <div className="affected">
              <div className="label">Affected crops</div>
              <ul>
                {(f.affectedCrops || []).map((c) => (
                  <li key={c._id || c}>{c.name || c}</li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              className="btn"
              disabled={busyId === f._id}
              onClick={() => onToggle(f)}
            >
              {busyId === f._id
                ? "Saving…"
                : f.isActive
                  ? "Deactivate"
                  : "Activate"}
            </button>
          </section>
        ))}
      </div>
    </div>
  );
}
