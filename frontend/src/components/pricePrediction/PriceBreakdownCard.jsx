import { formatInr } from "../../utils/priceUnits.js";

export default function PriceBreakdownCard({
  price,
  loading,
  error,
  quantityKg,
  onQuantityKgChange,
}) {
  if (loading) {
    return (
      <section className="card">
        <p className="muted">Loading price model…</p>
      </section>
    );
  }
  if (error) {
    return (
      <section className="card card-error">
        <p>{error}</p>
      </section>
    );
  }
  if (!price) return null;

  const b = price.breakdown || {};
  const finalPerQ = price.finalPrice;
  const minPerQ = price.minPrice;
  const maxPerQ = price.maxPrice;
  const basePerQ = b.basePrice;
  const qty = Math.max(
    0,
    Number.parseFloat(String(quantityKg ?? "").replace(",", ".")) || 0
  );
  const lineTotal = Math.round((finalPerQ / 100) * qty * 100) / 100;

  return (
    <section className="card">
      <div className="card-header">
        <h2>{price.cropName}</h2>
        <span className="pill">{price.meta?.inSeason ? "In season" : "Off season"}</span>
      </div>
      <p className="unit-note">
        All amounts below are <strong>₹ per quintal</strong> (model output is per quintal).
      </p>
      <div className="price-grid">
        <div>
          <div className="label">Final price (est.)</div>
          <div className="value-lg">₹ {formatInr(finalPerQ)} / quintal</div>
        </div>
        <div>
          <div className="label">Expected range</div>
          <div className="value">
            ₹ {formatInr(minPerQ)} – ₹ {formatInr(maxPerQ)} / quintal
          </div>
        </div>
      </div>
      <div className="qty-row">
        <label className="field inline">
          <span>Quantity (kg)</span>
          <input
            type="number"
            min={0}
            step={0.5}
            value={quantityKg ?? ""}
            onChange={(e) => onQuantityKgChange?.(e.target.value)}
          />
        </label>
        <div className="qty-total">
          <div className="label">Estimated total</div>
          <div className="value">
            ₹ {formatInr(lineTotal)} for {formatInr(qty, qty % 1 === 0 ? 0 : 2)} kg
          </div>
        </div>
      </div>
      <div className="breakdown">
        <div className="breakdown-row">
          <span>Base (MSP / benchmark)</span>
          <strong>₹ {formatInr(basePerQ)} / quintal</strong>
        </div>
        <div className="breakdown-row">
          <span>Seasonal multiplier</span>
          <strong>{b.seasonalMultiplier}</strong>
        </div>
        <div className="breakdown-row">
          <span>Demand / supply</span>
          <strong>{b.demandSupplyMultiplier}</strong>
        </div>
        <div className="breakdown-row">
          <span>External events</span>
          <strong>{b.externalMultiplier}</strong>
        </div>
      </div>
      {price.explanation && (
        <div className="explain">
          <div className="explain-headline">{price.explanation.headline}</div>
          <ul>
            {price.explanation.details?.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
