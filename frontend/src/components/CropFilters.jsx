import { useCropMarketStore } from "../store/cropMarketStore";
import { useTranslation } from "react-i18next";

const CropFilters = () => {

  const { t } = useTranslation();

  const CATEGORY_OPTIONS = [
    { label: t("filters.allCategories"), value: "all" },
    { label: t("filters.fruits"), value: "fruit" },
    { label: t("filters.vegetables"), value: "vegetable" },
    { label: t("filters.grains"), value: "grain" },
    { label: t("filters.pulse"), value: "pulse" },
    { label: t("filters.other"), value: "other" },
  ];

  const {
    search,
    setSearch,
    category,
    setCategory,
    organic,
    setOrganic,
    priceSort,
    setPriceSort,
  } = useCropMarketStore();

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm mb-6 grid gap-4 md:grid-cols-4">

      {/* Search */}
      <input
        type="text"
        placeholder={t("filters.search", "Search by name or category…")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border rounded-lg px-3 py-2"
      />

      {/* Category */}
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="border rounded-lg px-3 py-2"
      >
        {CATEGORY_OPTIONS.map((cat) => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </select>

      {/* Organic */}
      <select
        value={organic}
        onChange={(e) => setOrganic(e.target.value)}
        className="border rounded-lg px-3 py-2"
      >
        <option value="all">{t("filters.all")}</option>
        <option value="true">{t("filters.organic")}</option>
        <option value="false">{t("filters.nonOrganic")}</option>
      </select>

      {/* Price sort */}
      <select
        value={priceSort}
        onChange={(e) => setPriceSort(e.target.value)}
        className="border rounded-lg px-3 py-2"
      >
        <option value="none">{t("filters.sortPrice")}</option>
        <option value="lowToHigh">{t("filters.lowHigh")}</option>
        <option value="highToLow">{t("filters.highLow")}</option>
      </select>

    </div>
  );
};

export default CropFilters;