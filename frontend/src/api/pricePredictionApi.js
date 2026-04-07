import { axiosInstance } from "../libs/axios.js";

const base = "/price-prediction";

export async function fetchPriceCrops() {
  const { data } = await axiosInstance.get(`${base}/crops`);
  return data;
}

export async function fetchPriceForCrop(cropId) {
  const { data } = await axiosInstance.get(`${base}/prices`, {
    params: { cropId },
  });
  return data;
}

export async function fetchAllPrices() {
  const { data } = await axiosInstance.get(`${base}/prices`);
  return data;
}

export async function fetchPriceHistory(cropId, limit = 90) {
  const { data } = await axiosInstance.get(`${base}/prices/history`, {
    params: { cropId, limit },
  });
  return data;
}

export async function fetchExternalFactors() {
  const { data } = await axiosInstance.get(`${base}/external-factors`);
  return data;
}

export async function toggleExternalFactor(id, isActive) {
  const { data } = await axiosInstance.patch(
    `${base}/external-factors/${id}/toggle`,
    { isActive }
  );
  return data;
}
