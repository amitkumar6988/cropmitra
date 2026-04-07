import { quintalToPerKg, formatInr } from "../utils/priceUnits.js";

export default function CropSummaryTable({ rows, onSelect, selectedId }) {
  if (!rows?.length) return null;
  return (
    <section className="card">
      <h3 className="card-title">Matching crops — ₹ per kg</h3>
      <p className="table-hint muted small">
        Min / max / final are per kg (converted from the per-quintal model).
      </p>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Crop</th>
              <th>Min (₹/kg)</th>
              <th>Max (₹/kg)</th>
              <th>Final (₹/kg)</th>
              <th className="col-sample">10 kg (est.)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const minKg = quintalToPerKg(r.minPrice);
              const maxKg = quintalToPerKg(r.maxPrice);
              const finalKg = quintalToPerKg(r.finalPrice);
              const tenKg = finalKg * 10;
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
                  <td>{formatInr(minKg)}</td>
                  <td>{formatInr(maxKg)}</td>
                  <td>
                    <strong>{formatInr(finalKg)}</strong>
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
