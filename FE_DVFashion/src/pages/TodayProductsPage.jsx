import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProductCard from "../components/common/ProductCard";
import Pagination from "../components/common/Pagination";
import { ChevronDown, ChevronUp, X, Filter } from "react-feather";
import { useAuth } from "../hooks/useAuth";
import {
  useTodayRecommendations,
  useTodayViewedProducts,
} from "../hooks/useProductRecomendations";
import getColorHex from "../utils/getColorHex";

export default function TodayProductsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "VI";
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // Parse query params
  const params = new URLSearchParams(location.search);
  const type = params.get("type"); // recommend | popular | viewed
  const initialKeyword = params.get("q") || "";
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
    minPrice: initialMinPrice,
    maxPrice: initialMaxPrice,
    sort: initialSort,
    color: initialColor,
  });
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
        navigate(`/today-products?type=${type}&${queryString}`);
      }
    }, 1000);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const pageSize = 20;

  // Fetch products theo type
  let rawProducts = [];
  let isLoading = false;
  let title = "";

  if (type === "recommend" && isAuthenticated) {
    const { data = [], isLoading: loading } = useTodayRecommendations(
      user?.id,
      1000
    );
    rawProducts = data;
    isLoading = loading;
    title = t("product.today_recommendations");
  } else if (type === "popular" && !isAuthenticated) {
    const { data = [], isLoading: loading } = useTodayRecommendations(
      undefined,
      1000
    );
    rawProducts = data;
    isLoading = loading;
    title = t("product.today_popular");
  } else if (type === "viewed" && isAuthenticated) {
    const { data = [], isLoading: loading } = useTodayViewedProducts(1000);
    rawProducts = data;
    isLoading = loading;
    title = t("product.today_viewed");
  } else {
    title = t("product.no_products_available");
  }

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
  const filteredProducts =
    onlyDiscounted || filters.color || search.trim()
      ? rawProducts.filter((p) => {
          let match = true;
          if (onlyDiscounted) {
            match = p.currentPrice && p.price && p.currentPrice < p.price;
          }
          if (filters.color) {
            match = match && p.variants?.some((v) => v.color === filters.color);
          }
          if (search.trim()) {
            match =
              match &&
              (p.name?.toLowerCase().includes(search.trim().toLowerCase()) ||
                p.description
                  ?.toLowerCase()
                  .includes(search.trim().toLowerCase()));
          }
          if (filters.minPrice) {
            match = match && p.currentPrice >= parseFloat(filters.minPrice);
          }
          if (filters.maxPrice) {
            match = match && p.currentPrice <= parseFloat(filters.maxPrice);
          }
          return match;
        })
      : rawProducts;

  // Sort products
  const sortedProducts = useMemo(() => {
    let arr = [...filteredProducts];
    switch (filters.sort) {
      case "price,asc":
        arr.sort(
          (a, b) => (a.currentPrice || a.price) - (b.currentPrice || b.price)
        );
        break;
      case "price,desc":
        arr.sort(
          (a, b) => (b.currentPrice || b.price) - (a.currentPrice || a.price)
        );
        break;
      case "name,asc":
        arr.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name,desc":
        arr.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "createdDate,desc":
        arr.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
        break;
      default:
        break;
    }
    return arr;
  }, [filteredProducts, filters.sort]);

  // Pagination
  const totalElements = sortedProducts.length;
  const totalPages = Math.ceil(totalElements / pageSize);
  const pagedProducts = sortedProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Cập nhật khi query param thay đổi
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const keyword = params.get("q") || "";
    const minPrice = params.get("minPrice") || "";
    const maxPrice = params.get("maxPrice") || "";
    const sort = params.get("sort") || "";
    const color = params.get("color") || "";
    const onlyDiscountedParam = params.get("onlyDiscounted") === "true";

    setSearchInput(keyword);
    setSearch(keyword);
    setFilters({
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
    if (newFilters.minPrice) params.set("minPrice", newFilters.minPrice);
    if (newFilters.maxPrice) params.set("maxPrice", newFilters.maxPrice);
    if (newFilters.sort) params.set("sort", newFilters.sort);
    if (newFilters.color) params.set("color", newFilters.color);
    if (onlyDiscountedValue) params.set("onlyDiscounted", "true");
    return params.toString();
  };

  const handleSearch = () => {
    const queryString = buildQueryString(filters, searchInput, onlyDiscounted);
    navigate(`/today-products?type=${type}&${queryString}`);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

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
    navigate(`/today-products?type=${type}&${queryString}`);
    setShowFilters(false);
  };

  const clearFilters = () => {
    const newFilters = {
      minPrice: "",
      maxPrice: "",
      sort: "",
      color: "",
    };
    setFilters(newFilters);
    setOnlyDiscounted(false);
    const queryString = buildQueryString(newFilters, search, false);
    navigate(`/today-products?type=${type}&${queryString}`);
  };

  const hasActiveFilters =
    filters.minPrice || filters.maxPrice || filters.color || onlyDiscounted;

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
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">{title}</h1>

      {/* Search Input - Responsive */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
        <input
          type="text"
          className="border border-gray-200 rounded-full px-4 sm:px-6 py-2.5 sm:py-3 w-full sm:w-[300px] text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/70 backdrop-blur-sm"
          placeholder={t("header.search_placeholder", "Tìm kiếm sản phẩm...")}
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
          className="bg-gradient-to-r from-gray-900 to-gray-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm sm:text-base"
        >
          {t("search.search_button", "Tìm kiếm")}
        </button>

        {/* Toggle Filter Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-center gap-2 border border-gray-200 px-3 sm:px-4 py-2.5 sm:py-3 rounded-full hover:bg-gray-50/80 backdrop-blur-sm transition-all duration-200 bg-white/70 text-sm sm:text-base"
        >
          <Filter size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span className="hidden sm:inline">
            {t("search.filters", "Bộ lọc")}
          </span>
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {
                [
                  filters.minPrice,
                  filters.maxPrice,
                  filters.color,
                  onlyDiscounted,
                ].filter(Boolean).length
              }
            </span>
          )}
          {showFilters ? (
            <ChevronUp size={16} className="sm:w-[18px] sm:h-[18px]" />
          ) : (
            <ChevronDown size={16} className="sm:w-[18px] sm:h-[18px]" />
          )}
        </button>
      </div>

      {/* Advanced Filters Panel - Responsive */}
      {showFilters && (
        <div className="relative bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-xl">
          <div className="relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Price Range Filter */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  {t("search.price_range", "Khoảng giá")}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder={t("search.min_price", "Từ")}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/60 backdrop-blur-sm transition-all hover:bg-white/80 text-sm sm:text-base"
                    value={filters.minPrice}
                    onChange={(e) =>
                      handleFilterChange("minPrice", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    placeholder={t("search.max_price", "Đến")}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/60 backdrop-blur-sm transition-all hover:bg-white/80 text-sm sm:text-base"
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
                        className={`text-xs border rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 transition-all duration-200 ${
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
                  {t("search.promotion", "Khuyến mãi")}
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2.5 sm:p-3 rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all border border-gray-200">
                  <input
                    type="checkbox"
                    checked={onlyDiscounted}
                    onChange={(e) => setOnlyDiscounted(e.target.checked)}
                    className="w-4 h-4 rounded accent-blue-600"
                  />
                  <span className="text-xs sm:text-sm">
                    {t("search.on_sale_only", "Chỉ sản phẩm có giá ưu đãi")}
                  </span>
                </label>
              </div>

              {/* Sort Filter */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  {t("search.sort_by", "Sắp xếp")}
                </label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/60 backdrop-blur-sm transition-all hover:bg-white/80 text-sm sm:text-base"
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
                  {t("search.color", "Màu sắc")}
                </label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/60 backdrop-blur-sm transition-all hover:bg-white/80 text-sm sm:text-base"
                  value={filters.color || ""}
                  onChange={(e) => handleFilterChange("color", e.target.value)}
                >
                  <option value="">
                    {t("search.all_colors", "Tất cả màu")}
                  </option>
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
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 ${
                        filters.color === c
                          ? "border-blue-600 ring-2 ring-blue-300"
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

            {/* Filter Actions - Responsive */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-6">
              <button
                onClick={applyFilters}
                className="bg-gradient-to-r from-gray-900 to-gray-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm sm:text-base w-full sm:w-auto"
              >
                {t("search.apply_filters", "Áp dụng")}
              </button>
              <button
                onClick={clearFilters}
                className="border border-gray-300 bg-white/60 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-full font-semibold hover:bg-white/90 hover:border-gray-400 transition-all duration-200 text-sm sm:text-base w-full sm:w-auto"
              >
                {t("search.clear_filters", "Xóa bộ lọc")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Tags - Responsive */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {onlyDiscounted && (
            <span className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium shadow-sm backdrop-blur-sm border border-blue-200">
              {t("search.on_sale", "Đang giảm giá")}
              <button
                onClick={() => setOnlyDiscounted(false)}
                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
              >
                <X size={12} className="sm:w-[14px] sm:h-[14px]" />
              </button>
            </span>
          )}
          {(filters.minPrice || filters.maxPrice) && (
            <span className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium shadow-sm backdrop-blur-sm border border-blue-200">
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
                  navigate(`/today-products?type=${type}&${queryString}`);
                }}
                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
              >
                <X size={12} className="sm:w-[14px] sm:h-[14px]" />
              </button>
            </span>
          )}
          {filters.color && (
            <span className="flex items-center gap-2 bg-gradient-to-r from-pink-100 to-pink-50 text-pink-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium shadow-sm backdrop-blur-sm border border-pink-200">
              <span
                className="inline-block w-3 h-3 sm:w-4 sm:h-4 rounded-full border mr-1"
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
                  navigate(`/today-products?type=${type}&${queryString}`);
                }}
                className="hover:bg-pink-200 rounded-full p-0.5 transition-colors"
                aria-label="Remove color filter"
              >
                <X size={12} className="sm:w-[14px] sm:h-[14px]" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Results Header - Responsive */}
      {search.trim() && (
        <div className="font-bold text-base sm:text-lg mb-4">
          {t("search.result_for", "Kết quả cho")} "{search}"
          {totalElements > 0 && (
            <span className="text-gray-500 font-normal ml-2 text-sm sm:text-base">
              ({pagedProducts.length} {t("search.products_found", "sản phẩm")})
            </span>
          )}
        </div>
      )}

      {/* Products Grid - Responsive */}
      {isLoading ? (
        <div className="text-center py-10 text-gray-500 text-sm sm:text-base">
          {t("common.loading", "Đang tải")}...
        </div>
      ) : pagedProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
            {pagedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 sm:mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-10 text-gray-500 text-sm sm:text-base">
          {search.trim() || hasActiveFilters ? (
            <>
              {t("search.no_result", "Không tìm thấy sản phẩm phù hợp")}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="block mx-auto mt-4 text-blue-600 underline hover:text-blue-700 transition-colors text-sm sm:text-base"
                >
                  {t("search.clear_filters", "Xóa bộ lọc")}
                </button>
              )}
            </>
          ) : (
            t("search.enter_keyword", "Nhập từ khóa để tìm kiếm sản phẩm")
          )}
        </div>
      )}
    </div>
  );
}
