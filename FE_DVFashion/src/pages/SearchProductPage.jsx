import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useProduct } from "../hooks/useProduct";
import { useTranslation } from "react-i18next";
import ProductCard from "../components/common/ProductCard";
import Pagination from "../components/common/Pagination";
import { ChevronDown, ChevronUp, X, Filter } from "react-feather";
import { useCategory } from "../hooks/useCategory";
import getColorHex from "../utils/getColorHex";

export default function SearchProductPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "VI";
  const navigate = useNavigate();
  const location = useLocation();

  // Parse query params
  const params = new URLSearchParams(location.search);
  const initialKeyword = params.get("q") || "";
  const initialCategoryId = params.get("categoryId") || null;
  const initialMinPrice = params.get("minPrice") || "";
  const initialMaxPrice = params.get("maxPrice") || "";
  const initialSort = params.get("sort") || "";
  const initialColor = params.get("color") || "";
  const initialOnlyDiscounted = params.get("onlyDiscounted") === "true";

  // States for search and filters
  const [searchInput, setSearchInput] = useState(initialKeyword);
  const [search, setSearch] = useState(initialKeyword);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const debounceTimeout = useRef(null);

  // Filter states
  const [filters, setFilters] = useState({
    categoryId: initialCategoryId,
    minPrice: initialMinPrice,
    maxPrice: initialMaxPrice,
    sort: initialSort,
    color: initialColor,
  });
  // State riêng cho lọc giá ưu đãi
  const [onlyDiscounted, setOnlyDiscounted] = useState(initialOnlyDiscounted);

  // Debounce search: khi dừng gõ 1s thì search
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      if (searchInput.trim() !== search) {
        const queryString = buildQueryString(
          filters,
          searchInput,
          onlyDiscounted
        );
        navigate(`/search?${queryString}`);
      }
    }, 1000);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const pageSize = 20;

  // Fetch categories for filter
  const { categories = [], isLoading: isCategoriesLoading } = useCategory({
    lang,
    active: true,
    size: 100,
  });

  // Fetch products với search query và filters
  const {
    products: rawProducts = [],
    totalElements = 0,
    totalPages = 0,
    isLoading,
    filterInfo,
  } = useProduct({
    lang,
    search: search.trim() || null,
    status: "ACTIVE",
    page: currentPage - 1,
    size: pageSize,
    categoryId: filters.categoryId,
    minPrice: filters.minPrice ? parseFloat(filters.minPrice) : null,
    maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : null,
    sort: filters.sort || null,
  });

  // Lấy danh sách màu từ products
  const colorOptions = useMemo(() => {
    return Array.from(
      new Set(
        rawProducts
          .flatMap((p) => p.variants?.map((v) => v.color))
          .filter(Boolean)
      )
    );
  }, [rawProducts]);

  // Lọc sản phẩm theo màu và chỉ sản phẩm có giá ưu đãi (client-side)
  const products =
    onlyDiscounted || filters.color
      ? rawProducts.filter((p) => {
          let match = true;
          if (onlyDiscounted) {
            match = p.currentPrice && p.price && p.currentPrice < p.price;
          }
          if (filters.color) {
            match = match && p.variants?.some((v) => v.color === filters.color);
          }
          return match;
        })
      : rawProducts;

  // Cập nhật khi query param thay đổi
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const keyword = params.get("q") || "";
    const categoryId = params.get("categoryId") || null;
    const minPrice = params.get("minPrice") || "";
    const maxPrice = params.get("maxPrice") || "";
    const sort = params.get("sort") || "";
    const color = params.get("color") || "";
    const onlyDiscountedParam = params.get("onlyDiscounted") === "true";

    setSearchInput(keyword);
    setSearch(keyword);
    setFilters({
      categoryId,
      minPrice,
      maxPrice,
      sort,
      color,
    });
    setOnlyDiscounted(onlyDiscountedParam);
    setCurrentPage(1);
  }, [location.search]);

  // Build query string từ filters
  const buildQueryString = (
    newFilters = filters,
    newSearch = search,
    onlyDiscountedValue = onlyDiscounted
  ) => {
    const params = new URLSearchParams();
    if (newSearch.trim()) params.set("q", newSearch.trim());
    if (newFilters.categoryId) params.set("categoryId", newFilters.categoryId);
    if (newFilters.minPrice) params.set("minPrice", newFilters.minPrice);
    if (newFilters.maxPrice) params.set("maxPrice", newFilters.maxPrice);
    if (newFilters.sort) params.set("sort", newFilters.sort);
    if (newFilters.color) params.set("color", newFilters.color);
    if (onlyDiscountedValue) params.set("onlyDiscounted", "true");
    return params.toString();
  };

  const handleSearch = () => {
    if (searchInput.trim()) {
      const queryString = buildQueryString(
        filters,
        searchInput,
        onlyDiscounted
      );
      navigate(`/search?${queryString}`);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  //cập nhật cả state và apply ngay
  const handlePriceRangeClick = (range) => {
    const newFilters = {
      ...filters,
      minPrice: range.min,
      maxPrice: range.max,
    };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    const queryString = buildQueryString(filters, search, onlyDiscounted);
    navigate(`/search?${queryString}`);
    setShowFilters(false);
  };

  const clearFilters = () => {
    const newFilters = {
      categoryId: null,
      minPrice: "",
      maxPrice: "",
      sort: "",
      color: "",
    };
    setFilters(newFilters);
    setOnlyDiscounted(false);
    const queryString = buildQueryString(newFilters, search, false);
    navigate(`/search?${queryString}`);
  };

  const hasActiveFilters =
    filters.categoryId ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.color ||
    onlyDiscounted;

  // Sort options
  const sortOptions = [
    { value: "", label: t("search.sort.default", "Mặc định") },
    { value: "price,asc", label: t("search.sort.price_asc", "Giá tăng dần") },
    { value: "price,desc", label: t("search.sort.price_desc", "Giá giảm dần") },
    { value: "name,asc", label: t("search.sort.name_asc", "Tên A-Z") },
    { value: "name,desc", label: t("search.sort.name_desc", "Tên Z-A") },
    { value: "createdDate,desc", label: t("search.sort.newest", "Mới nhất") },
  ];

  // Price range presets
  const priceRanges = [
    {
      label: t("search.price.under_200k", "Dưới 200k"),
      min: "",
      max: "200000",
    },
    {
      label: t("search.price.200k_500k", "200k - 500k"),
      min: "200000",
      max: "500000",
    },
    {
      label: t("search.price.500k_1m", "500k - 1tr"),
      min: "500000",
      max: "1000000",
    },
    { label: t("search.price.over_1m", "Trên 1tr"), min: "1000000", max: "" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">{t("search.result_title")}</h1>

      {/* Search Input */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          className="border border-gray-200 rounded-full px-6 py-3 w-[300px] text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/70 backdrop-blur-sm"
          placeholder={t("header.search_placeholder")}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
        />
        <button
          onClick={handleSearch}
          className="bg-gradient-to-r from-gray-900 to-gray-700 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
        >
          {t("search.search_button")}
        </button>

        {/* Toggle Filter Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 border border-gray-200 px-4 py-3 rounded-full hover:bg-gray-50/80 backdrop-blur-sm transition-all duration-200 bg-white/70"
        >
          <Filter size={18} />
          {t("search.filters")}
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {
                [
                  filters.categoryId,
                  filters.minPrice,
                  filters.maxPrice,
                  filters.color,
                  onlyDiscounted,
                ].filter(Boolean).length
              }
            </span>
          )}
          {showFilters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="relative bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 mb-6 shadow-xl before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/40 before:to-transparent before:rounded-2xl before:pointer-events-none">
          <div className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  {t("search.category")}
                </label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/60 backdrop-blur-sm transition-all hover:bg-white/80"
                  value={filters.categoryId || ""}
                  onChange={(e) =>
                    handleFilterChange("categoryId", e.target.value || null)
                  }
                  disabled={isCategoriesLoading}
                >
                  <option value="">
                    {isCategoriesLoading
                      ? t("common.loading") + "..."
                      : t("search.all_categories")}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  {t("search.price_range")}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder={t("search.min_price")}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/60 backdrop-blur-sm transition-all hover:bg-white/80"
                    value={filters.minPrice}
                    onChange={(e) =>
                      handleFilterChange("minPrice", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    placeholder={t("search.max_price")}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/60 backdrop-blur-sm transition-all hover:bg-white/80"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      handleFilterChange("maxPrice", e.target.value)
                    }
                  />
                </div>
                {/* Price range presets */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {priceRanges.map((range, idx) => {
                    const isActive =
                      filters.minPrice === range.min &&
                      filters.maxPrice === range.max;
                    return (
                      <button
                        key={idx}
                        className={`text-xs border rounded-full px-3 py-1.5 transition-all duration-200 ${
                          isActive
                            ? "bg-blue-600 text-white border-blue-600 shadow-md"
                            : "border-gray-300 bg-white/60 backdrop-blur-sm hover:bg-white/90 hover:border-blue-400"
                        }`}
                        onClick={() => handlePriceRangeClick(range)}
                      >
                        {range.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Discounted Price Filter */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  {t("search.promotion")}
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all border border-gray-200">
                  <input
                    type="checkbox"
                    checked={onlyDiscounted}
                    onChange={(e) => setOnlyDiscounted(e.target.checked)}
                    className="w-4 h-4 rounded accent-blue-600"
                  />
                  <span className="text-sm">{t("search.on_sale_only")}</span>
                </label>
              </div>

              {/* Sort Filter */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  {t("search.sort_by")}
                </label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/60 backdrop-blur-sm transition-all hover:bg-white/80"
                  value={filters.sort || ""}
                  onChange={(e) =>
                    handleFilterChange("sort", e.target.value || "")
                  }
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Color Filter */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  {t("search.color")}
                </label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/60 backdrop-blur-sm transition-all hover:bg-white/80"
                  value={filters.color || ""}
                  onChange={(e) => handleFilterChange("color", e.target.value)}
                >
                  <option value="">{t("search.all_colors")}</option>
                  {colorOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {/* Nút chọn màu đẹp hơn */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {colorOptions.map((c) => (
                    <button
                      key={c}
                      className={`w-8 h-8 rounded-full border-2 ${
                        filters.color === c
                          ? "border-blue-600"
                          : "border-gray-300"
                      }`}
                      style={{ background: getColorHex(c) }}
                      title={c}
                      onClick={() =>
                        handleFilterChange(
                          "color",
                          filters.color === c ? "" : c
                        )
                      }
                      type="button"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={applyFilters}
                className="bg-gradient-to-r from-gray-900 to-gray-700 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                {t("search.apply_filters")}
              </button>
              <button
                onClick={clearFilters}
                className="border border-gray-300 bg-white/60 backdrop-blur-sm px-6 py-2.5 rounded-full font-semibold hover:bg-white/90 hover:border-gray-400 transition-all duration-200"
              >
                {t("search.clear_filters")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.categoryId && (
            <span className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 px-4 py-2 rounded-full text-sm font-medium shadow-sm backdrop-blur-sm border border-blue-200">
              {categories.find((c) => c.id === filters.categoryId)?.name}
              <button
                onClick={() => {
                  const newFilters = { ...filters, categoryId: null };
                  setFilters(newFilters);
                  const queryString = buildQueryString(
                    newFilters,
                    search,
                    onlyDiscounted
                  );
                  navigate(`/search?${queryString}`);
                }}
                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
              >
                <X size={14} />
              </button>
            </span>
          )}
          {onlyDiscounted && (
            <span className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 px-4 py-2 rounded-full text-sm font-medium shadow-sm backdrop-blur-sm border border-blue-200">
              {t("search.on_sale")}
              <button
                onClick={() => {
                  setOnlyDiscounted(false);
                  const queryString = buildQueryString(filters, search, false);
                  navigate(`/search?${queryString}`);
                }}
                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
              >
                <X size={14} />
              </button>
            </span>
          )}
          {(filters.minPrice || filters.maxPrice) && (
            <span className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 px-4 py-2 rounded-full text-sm font-medium shadow-sm backdrop-blur-sm border border-blue-200">
              {filters.minPrice &&
                `${parseInt(filters.minPrice).toLocaleString()}đ`}
              {filters.minPrice && filters.maxPrice && " - "}
              {filters.maxPrice &&
                `${parseInt(filters.maxPrice).toLocaleString()}đ`}
              <button
                onClick={() => {
                  const newFilters = {
                    ...filters,
                    minPrice: "",
                    maxPrice: "",
                  };
                  setFilters(newFilters);
                  const queryString = buildQueryString(
                    newFilters,
                    search,
                    onlyDiscounted
                  );
                  navigate(`/search?${queryString}`);
                }}
                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
              >
                <X size={14} />
              </button>
            </span>
          )}
          {filters.color && (
            <span className="flex items-center gap-2 bg-gradient-to-r from-pink-100 to-pink-50 text-pink-800 px-4 py-2 rounded-full text-sm font-medium shadow-sm backdrop-blur-sm border border-pink-200">
              <span
                className="inline-block w-4 h-4 rounded-full border mr-1"
                style={{ background: getColorHex(filters.color) }}
              ></span>
              {filters.color}
              <button
                onClick={() => {
                  const newFilters = { ...filters, color: "" };
                  setFilters(newFilters);
                  const queryString = buildQueryString(
                    newFilters,
                    search,
                    onlyDiscounted
                  );
                  navigate(`/search?${queryString}`);
                }}
                className="hover:bg-pink-200 rounded-full p-0.5 transition-colors"
                aria-label="Remove color filter"
              >
                <X size={14} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Results Header */}
      {search.trim() && (
        <div className="font-bold text-lg mb-4">
          {t("search.result_for")} "{search}"
          {totalElements > 0 && (
            <span className="text-gray-500 font-normal ml-2">
              ({products.length} {t("search.products_found")})
            </span>
          )}
        </div>
      )}

      {/* Products Grid */}
      {isLoading ? (
        <div className="text-center py-10 text-gray-500">
          {t("common.loading")}...
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-10 text-gray-500">
          {search.trim() || hasActiveFilters ? (
            <>
              {t("search.no_result")}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="block mx-auto mt-4 text-blue-600 underline hover:text-blue-700 transition-colors"
                >
                  {t("search.clear_filters")}
                </button>
              )}
            </>
          ) : (
            t("search.enter_keyword")
          )}
        </div>
      )}
    </div>
  );
}
