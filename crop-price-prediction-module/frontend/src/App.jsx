import { Routes, Route, NavLink } from "react-router-dom";
import PriceInsights from "./pages/PriceInsights.jsx";
import AdminExternalFactors from "./pages/AdminExternalFactors.jsx";

export default function App() {
  return (
    <div className="app-shell">
      <header className="top-nav">
        <div className="brand">
          <span className="brand-mark" aria-hidden />
          <div>
            <div className="brand-title">Crop Price Prediction</div>
            <div className="brand-sub">Dynamic supply-chain pricing module</div>
          </div>
        </div>
        <nav className="nav-links">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? "active" : "")}
            end
          >
            Price Insights
          </NavLink>
          <NavLink
            to="/admin/factors"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Admin · External factors
          </NavLink>
        </nav>
      </header>
      <main className="main-area">
        <Routes>
          <Route path="/" element={<PriceInsights />} />
          <Route path="/admin/factors" element={<AdminExternalFactors />} />
        </Routes>
      </main>
    </div>
  );
}
