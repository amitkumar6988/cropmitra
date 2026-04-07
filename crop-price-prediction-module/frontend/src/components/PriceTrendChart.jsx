import { quintalToPerKg, formatInr } from "../utils/priceUnits.js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function PriceTrendChart({ series, loading, error }) {
  if (loading) {
    return (
      <section className="card">
        <p className="muted">Loading trend…</p>
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
  if (!series?.points?.length) {
    return (
      <section className="card">
        <p className="muted">No historical points yet. Seed the database.</p>
      </section>
    );
  }

  const labels = series.points.map((p) =>
    new Date(p.date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    })
  );

  const data = {
    labels,
    datasets: [
      {
        label: "Final (₹/kg)",
        data: series.points.map((p) => quintalToPerKg(p.finalPrice)),
        borderColor: "rgba(34, 197, 94, 1)",
        backgroundColor: "rgba(34, 197, 94, 0.12)",
        fill: true,
        tension: 0.25,
        pointRadius: 0,
      },
      {
        label: "Min band (₹/kg)",
        data: series.points.map((p) => quintalToPerKg(p.minPrice)),
        borderColor: "rgba(148, 163, 184, 0.6)",
        borderDash: [4, 4],
        fill: false,
        tension: 0.2,
        pointRadius: 0,
      },
      {
        label: "Max band (₹/kg)",
        data: series.points.map((p) => quintalToPerKg(p.maxPrice)),
        borderColor: "rgba(148, 163, 184, 0.6)",
        borderDash: [4, 4],
        fill: false,
        tension: 0.2,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      title: {
        display: true,
        text: `Price trend (₹ per kg) — ${series.cropName}`,
        font: { size: 14, weight: "600" },
      },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { ticks: { maxTicksLimit: 8 } },
      y: {
        ticks: {
          callback: (v) => "₹" + formatInr(Number(v), 0),
        },
      },
    },
  };

  return (
    <section className="card chart-card">
      <div className="chart-wrap">
        <Line data={data} options={options} />
      </div>
    </section>
  );
}
