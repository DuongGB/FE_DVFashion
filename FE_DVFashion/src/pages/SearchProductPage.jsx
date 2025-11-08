import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useProduct } from "../hooks/useProduct";
import { useTranslation } from "react-i18next";
import ProductCard from "../components/common/ProductCard";
import Pagination from "../components/common/Pagination";
import { ChevronDown, ChevronUp, X, Filter } from "react-feather";
import { usePublicCategories } from "../hooks/useCategory";

export default function SearchProductPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "VI";
  const navigate = useNavigate();
  const location = useLocation();

  // Parse query params
  const params = new URLSearchParams(location.search);
  const initialKeyword = params.get("q") || "";
  const initialCategoryId = params.get("categoryId") || null;
  const initialOnSale = params.get("onSale") === "true" ? true : null;
  const initialMinPrice = params.get("minPrice") || "";
  const initialMaxPrice = params.get("maxPrice") || "";
  const initialSort = params.get("sort") || "";

  // States for search and filters
  const [searchInput, setSearchInput] = useState(initialKeyword);
  const [search, setSearch] = useState(initialKeyword);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    categoryId: initialCategoryId,
    onSale: initialOnSale,
    minPrice: initialMinPrice,
    maxPrice: initialMaxPrice,
    sort: initialSort,
  });

  const pageSize = 20;

  // Fetch categories for filter
  const { categories = [], isLoading: isCategoriesLoading } =
    usePublicCategories(lang);

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
    onSale: filters.onSale,
    minPrice: filters.minPrice ? parseFloat(filters.minPrice) : null,
    maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : null,
    sort: filters.sort || null,
  });

  // Client-side filtering cho onSale nếu backend chưa hỗ trợ đầy đủ
  const products =
    filters.onSale === true
      ? rawProducts.filter((p) => {
          const hasDiscount =
            p.currentPrice && p.price && p.currentPrice < p.price;
          return hasDiscount;
        })
      : rawProducts;

  console.log("Products after onSale filter:", {
    onSaleFilter: filters.onSale,
    rawCount: rawProducts.length,
    filteredCount: products.length,
    sampleProduct: rawProducts[0]
      ? {
          name: rawProducts[0].name,
          price: rawProducts[0].price,
          currentPrice: rawProducts[0].currentPrice,
          hasDiscount:
            rawProducts[0].currentPrice &&
            rawProducts[0].price &&
            rawProducts[0].currentPrice < rawProducts[0].price,
        }
      : null,
  });

  // Cập nhật khi query param thay đổi
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const keyword = params.get("q") || "";
    const categoryId = params.get("categoryId") || null;
    const onSale = params.get("onSale") === "true" ? true : null;
    const minPrice = params.get("minPrice") || "";
    const maxPrice = params.get("maxPrice") || "";
    const sort = params.get("sort") || "";

    setSearchInput(keyword);
    setSearch(keyword);
    setFilters({
      categoryId,
      onSale,
      minPrice,
      maxPrice,
      sort,
    });
    setCurrentPage(1);
  }, [location.search]);

  // Build query string từ filters
  const buildQueryString = (newFilters = filters, newSearch = search) => {
    const params = new URLSearchParams();
    if (newSearch.trim()) params.set("q", newSearch.trim());
    if (newFilters.categoryId) params.set("categoryId", newFilters.categoryId);
    if (newFilters.onSale === true) params.set("onSale", "true");
    if (newFilters.minPrice) params.set("minPrice", newFilters.minPrice);
    if (newFilters.maxPrice) params.set("maxPrice", newFilters.maxPrice);
    if (newFilters.sort) params.set("sort", newFilters.sort);
    return params.toString();
  };

  const handleSearch = () => {
    if (searchInput.trim()) {
      const queryString = buildQueryString(filters, searchInput);
      navigate(`/search?${queryString}`);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    console.log("Filter changed:", key, value, newFilters);
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
    const queryString = buildQueryString(filters, search);
    navigate(`/search?${queryString}`);
    setShowFilters(false);
  };

  const clearFilters = () => {
    const newFilters = {
      categoryId: null,
      onSale: null,
      minPrice: "",
      maxPrice: "",
      sort: "",
    };
    setFilters(newFilters);
    const queryString = buildQueryString(newFilters, search);
    navigate(`/search?${queryString}`);
  };

  const hasActiveFilters =
    filters.categoryId ||
    filters.onSale === true ||
    filters.minPrice ||
    filters.maxPrice;

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
      <h1 className="text-2xl font-bold mb-6">
        {t("search.result_title", "Kết quả tìm kiếm")}
      </h1>

      {/* Search Input */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          className="border border-gray-200 rounded-full px-6 py-3 w-[300px] text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/70 backdrop-blur-sm"
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
          className="bg-gradient-to-r from-gray-900 to-gray-700 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
        >
          {t("search.search_button", "Tìm kiếm")}
        </button>

        {/* Toggle Filter Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 border border-gray-200 px-4 py-3 rounded-full hover:bg-gray-50/80 backdrop-blur-sm transition-all duration-200 bg-white/70"
        >
          <Filter size={18} />
          {t("search.filters", "Bộ lọc")}
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {
                [
                  filters.categoryId,
                  filters.onSale === true,
                  filters.minPrice,
                  filters.maxPrice,
                ].filter(Boolean).length
              }
            </span>
          )}
          {showFilters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Advanced Filters Panel - Liquid Glass Effect */}
      {showFilters && (
        <div className="relative bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 mb-6 shadow-xl before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/40 before:to-transparent before:rounded-2xl before:pointer-events-none">
          <div className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  {t("search.category", "Danh mục")}
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
                      ? t("common.loading", "Đang tải") + "..."
                      : t("search.all_categories", "Tất cả danh mục")}
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
                  {t("search.price_range", "Khoảng giá")}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder={t("search.min_price", "Từ")}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/60 backdrop-blur-sm transition-all hover:bg-white/80"
                    value={filters.minPrice}
                    onChange={(e) =>
                      handleFilterChange("minPrice", e.target.value)
                    }
                  />
                  <input
                    type="number"
                    placeholder={t("search.max_price", "Đến")}
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

              {/* Sale Filter */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  {t("search.promotion", "Khuyến mãi")}
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all border border-gray-200">
                  <input
                    type="checkbox"
                    checked={filters.onSale === true}
                    onChange={(e) => {
                      const newValue = e.target.checked ? true : null;
                      handleFilterChange("onSale", newValue);
                      console.log("OnSale checkbox changed to:", newValue);
                    }}
                    className="w-4 h-4 rounded accent-blue-600"
                  />
                  <span className="text-sm">
                    {t("search.on_sale_only", "Chỉ sản phẩm giảm giá")}
                  </span>
                </label>
              </div>

              {/* Sort Filter */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  {t("search.sort_by", "Sắp xếp")}
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
            </div>

            {/* Filter Actions */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={applyFilters}
                className="bg-gradient-to-r from-gray-900 to-gray-700 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                {t("search.apply_filters", "Áp dụng")}
              </button>
              <button
                onClick={clearFilters}
                className="border border-gray-300 bg-white/60 backdrop-blur-sm px-6 py-2.5 rounded-full font-semibold hover:bg-white/90 hover:border-gray-400 transition-all duration-200"
              >
                {t("search.clear_filters", "Xóa bộ lọc")}
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
                  const queryString = buildQueryString(newFilters, search);
                  navigate(`/search?${queryString}`);
                }}
                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
              >
                <X size={14} />
              </button>
            </span>
          )}
          {filters.onSale === true && (
            <span className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 px-4 py-2 rounded-full text-sm font-medium shadow-sm backdrop-blur-sm border border-blue-200">
              {t("search.on_sale", "Đang giảm giá")}
              <button
                onClick={() => {
                  const newFilters = { ...filters, onSale: null };
                  setFilters(newFilters);
                  const queryString = buildQueryString(newFilters, search);
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
                  const queryString = buildQueryString(newFilters, search);
                  navigate(`/search?${queryString}`);
                }}
                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
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
          {t("search.result_for", "Kết quả cho")} "{search}"
          {totalElements > 0 && (
            <span className="text-gray-500 font-normal ml-2">
              ({products.length} {t("search.products_found", "sản phẩm")})
            </span>
          )}
        </div>
      )}

      {/* Products Grid */}
      {isLoading ? (
        <div className="text-center py-10 text-gray-500">
          {t("common.loading", "Đang tải")}...
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
              {t("search.no_result", "Không tìm thấy sản phẩm phù hợp")}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="block mx-auto mt-4 text-blue-600 underline hover:text-blue-700 transition-colors"
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
