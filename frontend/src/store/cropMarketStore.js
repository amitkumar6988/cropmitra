import { create } from "zustand";
import { axiosInstance } from "../libs/axios";

export const useCropMarketStore = create((set, get) => ({
  crops: [],
  loading: false,
  error: null,

  //---------------- PAGINATION ----------------
  page: 1,
  totalPages: 1,

  //---------------- FILTERS ----------------
  search: "",
  category: "all",
  organic: "all",
  priceSort: "none",

  //---------------- FETCH ----------------
  fetchCrops: async () => {
    set({ loading: true, error: null });

    try {
      const { search, category, organic, priceSort, page } = get();

      const params = { page };

      if (search) params.search = search;
      if (category !== "all") params.category = category;
      if (organic !== "all") params.organic = organic;
      if (priceSort !== "none") params.sort = priceSort;

      const res = await axiosInstance.get("/crops", { params });

      set({
        crops: res.data.crops,
        totalPages: res.data.totalPages,
      });

    } catch (err) {
      set({
        error: err.response?.data?.message || "Failed to fetch crops",
      });
    } finally {
      set({ loading: false });
    }
  },

  // Append next page of crops (used by infinite scroll)
  fetchMoreCrops: async () => {
    const { loading, page, totalPages, search, category, organic, priceSort } = get();
    if (loading || page >= totalPages) return;

    const nextPage = page + 1;
    set({ loading: true });

    try {
      const params = { page: nextPage };
      if (search) params.search = search;
      if (category !== "all") params.category = category;
      if (organic !== "all") params.organic = organic;
      if (priceSort !== "none") params.sort = priceSort;

      const res = await axiosInstance.get("/crops", { params });

      set((state) => ({
        crops: [...state.crops, ...res.data.crops],
        page: nextPage,
        totalPages: res.data.totalPages,
      }));
    } catch (err) {
      set({ error: err.response?.data?.message || "Failed to load more crops" });
    } finally {
      set({ loading: false });
    }
  },

  //---------------- PAGE ----------------
  setPage: (value) => {
    set({ page: value });
    get().fetchCrops();
  },

  //---------------- FILTER SETTERS ----------------
  // ⭐ ALWAYS RESET PAGE TO 1

  // Maps common user-typed terms to the exact backend category enum values
  // so typing "fruits" or "veggies" auto-activates the category filter
  setSearch: (value) => {
    const CATEGORY_KEYWORDS = {
      fruit: "fruit", fruits: "fruit",
      vegetable: "vegetable", vegetables: "vegetable", veggie: "vegetable", veggies: "vegetable",
      grain: "grain", grains: "grain", cereal: "grain", cereals: "grain",
      pulse: "pulse", pulses: "pulse", legume: "pulse", legumes: "pulse",
      other: "other",
    };

    const normalized = value.trim().toLowerCase();
    const matchedCategory = CATEGORY_KEYWORDS[normalized];

    if (matchedCategory) {
      // User typed a category name — activate the category filter and clear text search
      set({ search: "", category: matchedCategory, page: 1, crops: [] });
    } else {
      // Normal name search — reset category to "all" so both filters don't conflict
      set({ search: value, category: "all", page: 1, crops: [] });
    }

    get().fetchCrops();
  },

  setCategory: (value) => {
    set({ category: value, page: 1, crops: [] });
    get().fetchCrops();
  },

  setOrganic: (value) => {
    set({ organic: value, page: 1, crops: [] });
    get().fetchCrops();
  },

  setPriceSort: (value) => {
    set({ priceSort: value, page: 1, crops: [] });
    get().fetchCrops();
  },
}));
