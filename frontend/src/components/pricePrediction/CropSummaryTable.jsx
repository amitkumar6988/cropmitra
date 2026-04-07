import { formatInr } from "../../utils/priceUnits.js";

export default function CropSummaryTable({ rows, onSelect, selectedId }) {
  if (!rows?.length) return null;
  return (
    <section className="card">
      <h3 className="card-title">Matching crops — ₹ per quintal</h3>
      <p className="table-hint muted small">
        Min / max / final are per quintal.
      </p>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Crop</th>
              <th>Min (₹/q)</th>
              <th>Max (₹/q)</th>
              <th>Final (₹/q)</th>
              <th className="col-sample">10 kg (est.)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const minQ = r.minPrice;
              const maxQ = r.maxPrice;
              const finalQ = r.finalPrice;
              const tenKg = finalQ / 10;
              return (
                <tr
                  key={r.cropId}
                  className={r.cropId === selectedId ? "selected" : ""}
                >
                  <td>
                    <button
                      type="button"
                      className="linkish"
                      onClick={() => onSelect(r.cropId)}
                    >
                      {r.cropName}
                    </button>
                  </td>
                  <td>{formatInr(minQ)}</td>
                  <td>{formatInr(maxQ)}</td>
                  <td>
                    <strong>{formatInr(finalQ)}</strong>
                  </td>
                  <td className="muted">₹ {formatInr(tenKg)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
