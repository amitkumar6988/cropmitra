import { useEffect, useState, useCallback, useMemo } from "react";
import {
  fetchPriceCrops,
  fetchPriceForCrop,
  fetchAllPrices,
  fetchPriceHistory,
} from "../api/pricePredictionApi.js";
import PriceBreakdownCard from "../components/pricePrediction/PriceBreakdownCard.jsx";
import PriceTrendChart from "../components/pricePrediction/PriceTrendChart.jsx";
import CropSummaryTable from "../components/pricePrediction/CropSummaryTable.jsx";
import CropSearchBar from "../components/pricePrediction/CropSearchBar.jsx";
import "../styles/pricePrediction.css";

function apiErrorMessage(e, fallback) {
  if (e.response?.status === 401) {
    return "Please log in to view price predictions.";
  }
  return (
    e.response?.data?.message ||
    e.message ||
    fallback
  );
}

export default function PriceInsightsPage() {
  const [crops, setCrops] = useState([]);
  const [cropId, setCropId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [quantityKg, setQuantityKg] = useState("1");
  const [price, setPrice] = useState(null);
  const [allRows, setAllRows] = useState([]);
  const [series, setSeries] = useState(null);
  const [loading, setLoading] = useState(true);
  const [histLoading, setHistLoading] = useState(false);
  const [error, setError] = useState("");
  const [histError, setHistError] = useState("");

  const loadCropsAndSummary = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [cRes, pRes] = await Promise.all([
        fetchPriceCrops(),
        fetchAllPrices(),
      ]);
      setCrops(cRes.data || []);
      setAllRows(pRes.data || []);
      const first = cRes.data?.[0]?._id;
      if (first) setCropId(first);
    } catch (e) {
      setError(
        apiErrorMessage(
          e,
          "Unable to load prices. Check that the backend is running and price data is seeded."
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCropsAndSummary();
  }, [loadCropsAndSummary]);

  const filteredCrops = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return crops;
    return crops.filter((c) => c.name.toLowerCase().includes(q));
  }, [crops, searchQuery]);

  const selectOptions = useMemo(() => {
    const selected = crops.find((c) => c._id === cropId);
    const q = searchQuery.trim();
    let list = q ? filteredCrops : crops;
    if (selected && !list.some((c) => c._id === cropId)) {
      return [selected, ...list];
    }
    if (!list.length && selected) {
      return [selected];
    }
    return list;
  }, [crops, cropId, filteredCrops, searchQuery]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allRows;
    return allRows.filter((r) => r.cropName.toLowerCase().includes(q));
  }, [allRows, searchQuery]);

  useEffect(() => {
    if (!cropId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetchPriceForCrop(cropId);
        if (!cancelled) setPrice(res.data);
      } catch (e) {
        if (!cancelled) {
          setError(apiErrorMessage(e, "Failed to load price"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cropId]);

  useEffect(() => {
    if (!cropId) return;
    let cancelled = false;
    (async () => {
      setHistLoading(true);
      setHistError("");
      try {
        const res = await fetchPriceHistory(cropId, 90);
        if (!cancelled) setSeries(res.data);
      } catch (e) {
        if (!cancelled) {
          setHistError(apiErrorMessage(e, "History failed"));
        }
      } finally {
        if (!cancelled) setHistLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cropId]);

  return (
    <div className="price-prediction-page">
      <div className="page-intro">
        <h1>Price Insights</h1>
        <p className="lede">
          Modelled min–max bands and a final price <strong>per quintal</strong> from
          base benchmarks (per quintal in the model), seasonality, supply &amp;
          demand, and external shocks. Only admins can turn events like{" "}
          <strong>flood</strong> or <strong>fuel crisis</strong> on or off.
        </p>
      </div>

      <CropSearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        disabled={!crops.length}
      />

      <div className="toolbar">
        <label className="field">
          <span>Crop</span>
          <select
            value={cropId}
            onChange={(e) => setCropId(e.target.value)}
            disabled={!crops.length}
          >
            {selectOptions.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="btn secondary"
          onClick={loadCropsAndSummary}
        >
          Refresh
        </button>
      </div>

      <div className="layout-split">
        <PriceBreakdownCard
          price={price}
          loading={loading && !price}
          error={error}
          quantityKg={quantityKg}
          onQuantityKgChange={setQuantityKg}
        />
        <PriceTrendChart
          series={series}
          loading={histLoading}
          error={histError}
        />
      </div>

      {filteredRows.length === 0 && allRows.length > 0 && (
        <p className="muted search-empty">
          No crops match &quot;{searchQuery}&quot;. Try another spelling or clear
          the search box.
        </p>
      )}
      <CropSummaryTable
        rows={filteredRows}
        selectedId={cropId}
        onSelect={(id) => setCropId(id)}
      />
    </div>
  );
}
