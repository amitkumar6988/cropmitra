import axios from "axios";

const baseURL =
  import.meta.env.VITE_PRICE_API_URL || "http://localhost:5050/api";

export const priceClient = axios.create({
  baseURL,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

export async function fetchCrops() {
  const { data } = await priceClient.get("/crops");
  return data;
}

export async function fetchPrice(cropId) {
  const { data } = await priceClient.get("/prices", { params: { cropId } });
  return data;
}

export async function fetchAllPrices() {
  const { data } = await priceClient.get("/prices");
  return data;
}

export async function fetchPriceHistory(cropId, limit = 90) {
  const { data } = await priceClient.get("/prices/history", {
    params: { cropId, limit },
  });
  return data;
}

export async function fetchExternalFactors() {
  const { data } = await priceClient.get("/external-factors");
  return data;
}

export async function toggleExternalFactor(id, isActive) {
  const { data } = await priceClient.patch(
    `/external-factors/${id}/toggle`,
    { isActive }
  );
  return data;
}
