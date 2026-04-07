/** Model & seed prices are treated as ₹ per quintal (100 kg); display in ₹ per kg. */
export const KG_PER_QUINTAL = 100;

export function quintalToPerKg(quintalPrice) {
  if (quintalPrice == null || Number.isNaN(quintalPrice)) return 0;
  return quintalPrice / KG_PER_QUINTAL;
}

export function formatInr(value, fractionDigits = 2) {
  return Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function totalForQuantityKg(pricePerKg, quantityKg) {
  const q = Math.max(0, Number(quantityKg) || 0);
  return pricePerKg * q;
}
