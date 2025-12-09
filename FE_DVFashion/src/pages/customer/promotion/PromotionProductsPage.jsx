import { useEffect, useState, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp, X, Filter } from "react-feather";
import { IconCalendar, IconTarget } from "@tabler/icons-react";
import { decodeId } from "../../../utils/encodeId";
import { productAPI } from "../../../services/productAPI";
import ProductCard from "../../../components/common/ProductCard";
import Pagination from "../../../components/common/Pagination";
import { usePromotion } from "../../../hooks/usePromotion";
import getColorHex from "../../../utils/getColorHex"; // Thêm dòng này

export default function PromotionProductsPage() {
  const { promotionId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Use hook to get promotion details (public)
  const { usePromotionById } = usePromotion(i18n.language || "VI");
  const decodedId = useMemo(() => decodeId(promotionId), [promotionId]);

  const {
    data: promotion,
    isLoading: isLoadingPromotion,
    error: promotionError,
  } = usePromotionById(decodedId, !!decodedId);

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [productError, setProductError] = useState(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [color, setColor] = useState(""); // Thêm state cho màu sắc
  const pageSize = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const debounceTimeout = useRef(null);

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

  // Lấy danh sách màu sắc từ products
  const colorOptions = useMemo(() => {
    return Array.from(
      new Set(
        products.flatMap((p) => p.variants?.map((v) => v.color)).filter(Boolean)
      )
    );
  }, [products]);

  // Debounce search input
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      if (searchInput.trim() !== search) {
        setSearch(searchInput);
        setCurrentPage(1);
      }
    }, 1000);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  // Apply filters and search
  useEffect(() => {
    let result = [...products];

    // Search
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    // Price filter
    if (minPrice) {
      result = result.filter(
        (p) =>
          (p.promotionPrice || p.currentPrice || p.price) >=
          parseFloat(minPrice)
      );
    }
    if (maxPrice) {
      result = result.filter(
        (p) =>
          (p.promotionPrice || p.currentPrice || p.price) <=
          parseFloat(maxPrice)
      );
    }

    // Color filter
    if (color) {
      result = result.filter((p) => p.variants?.some((v) => v.color === color));
    }

    // Sort
    if (sortBy) {
      const [field, direction] = sortBy.split(",");
      result.sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];

        if (field === "price") {
          aVal = a.promotionPrice || a.currentPrice || a.price;
          bVal = b.promotionPrice || b.currentPrice || b.price;
        }

        if (typeof aVal === "string") {
          return direction === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        return direction === "asc" ? aVal - bVal : bVal - aVal;
      });
    }

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [search, sortBy, minPrice, maxPrice, color, products]);

  // Fetch full product details after promotion is loaded
  useEffect(() => {
    const loadProducts = async () => {
      if (!promotion) return;
      try {
        setIsLoadingProducts(true);
        setProductError(null);
        const promotionProducts = promotion.promotionProducts || [];
        if (promotionProducts.length === 0) {
          setProducts([]);
          setFilteredProducts([]);
          return;
        }

        const fullProducts = await Promise.all(
          promotionProducts.map((item) =>
            productAPI
              .getProductById(item.productId, i18n.language)
              .then((res) => {
                const data = res.data?.data ?? res.data;
                return {
                  ...data,
                  promotionPrice: item.promotionPrice,
                  discountPercentage: item.discountPercentage,
                  originalPrice: item.originalPrice,
                };
              })
          )
        );

        setProducts(fullProducts);
        setFilteredProducts(fullProducts);
      } catch (err) {
        console.error("Error loading products for promotion:", err);
        setProductError(err);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadProducts();
  }, [promotion, i18n.language]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Sort options
  const sortOptions = [
    { value: "", label: t("search.sort.default", "Mặc định") },
    { value: "price,asc", label: t("search.sort.price_asc", "Giá tăng dần") },
    {
      value: "price,desc",
      label: t("search.sort.price_desc", "Giá giảm dần"),
    },
    { value: "name,asc", label: t("search.sort.name_asc", "Tên A-Z") },
    { value: "name,desc", label: t("search.sort.name_desc", "Tên Z-A") },
  ];

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setSortBy("");
    setMinPrice("");
    setMaxPrice("");
    setColor(""); // Xóa filter màu
    setFilteredProducts(products);
  };

  const hasActiveFilters =
    search.trim() || sortBy || minPrice || maxPrice || color;

  const activeFiltersCount = useMemo(() => {
    return [search.trim(), sortBy, minPrice, maxPrice, color].filter(Boolean)
      .length;
  }, [search, sortBy, minPrice, maxPrice, color]);

  // Combined loading/error state
  const isLoading = isLoadingPromotion || isLoadingProducts;
  const error = promotionError || productError;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-orange-50/20">
        <div className="max-w-[95%] mx-auto px-4 sm:px-8 py-8">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t("common.loading")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !promotion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-orange-50/20">
        <div className="max-w-[95%] mx-auto px-4 sm:px-8 py-8">
          <div className="text-center py-20">
            <p className="text-red-500 text-lg mb-4">
              {t("promotion.not_found")}
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              {t("common.back_to_home", "Về trang chủ")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-8">
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-3 text-gray-800">
          {promotion.name}
        </h1>
        {promotion.description && (
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            {promotion.description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
          <span className="flex items-center gap-1 bg-white/60 backdrop-blur-sm px-2 sm:px-2 py-0.5 rounded-full border border-gray-200 text-xs sm:text-xs">
            <IconCalendar size={12} />
            {t("promotion.from", "Từ")}{" "}
            {new Date(promotion.startDate).toLocaleDateString(
              i18n.language === "VI" ? "vi-VN" : "en-US"
            )}
          </span>
          <span>→</span>
          <span className="flex items-center gap-1 bg-white/60 backdrop-blur-sm px-2 sm:px-2 py-0.5 rounded-full border border-gray-200 text-xs sm:text-xs">
            <IconCalendar size={12} />
            {t("promotion.to", "đến")}{" "}
            {new Date(promotion.endDate).toLocaleDateString(
              i18n.language === "VI" ? "vi-VN" : "en-US"
            )}
          </span>
          <span className="flex items-center gap-1 bg-orange-100/60 backdrop-blur-sm px-2 sm:px-2 py-0.5 rounded-full border border-orange-200 text-orange-700 font-medium text-xs sm:text-xs">
            <IconTarget size={12} />
            {products.length} {t("search.products_found", "sản phẩm")}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
        <input
          type="text"
          className="border border-gray-200 rounded-full px-4 sm:px-6 py-2.5 sm:py-3 w-full sm:w-[300px] text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/70 backdrop-blur-sm"
          placeholder={t("search_placeholder")}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setSearch(searchInput);
              setCurrentPage(1);
            }
          }}
        />
        <button
          onClick={() => {
            setSearch(searchInput);
            setCurrentPage(1);
          }}
          className="bg-gradient-to-r from-gray-900 to-gray-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm sm:text-base"
        >
          {t("search.search_button", "Tìm kiếm")}
        </button>
        {/* Toggle Filter Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex justify-center items-center gap-2 border border-gray-200 px-3 sm:px-4 py-2.5 sm:py-3 rounded-full hover:bg-gray-50/80 backdrop-blur-sm transition-all duration-200 bg-white/70 text-sm sm:text-base"
        >
          <Filter size={16} className="sm:w-[18px] sm:h-[18px]" />
          <span className="hidden sm:inline">
            {t("search.filters", "Bộ lọc")}
          </span>
          {activeFiltersCount > 0 && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
          {showFilters ? (
            <ChevronUp size={16} className="sm:w-[18px] sm:h-[18px]" />
          ) : (
            <ChevronDown size={16} className="sm:w-[18px] sm:h-[18px]" />
          )}
        </button>
      </div>

      {/* Filters Panel */}
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
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder={t("search.max_price", "Đến")}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/60 backdrop-blur-sm transition-all hover:bg-white/80 text-sm sm:text-base"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
                {/* Price range presets */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {priceRanges.map((range, idx) => {
                    const isActive =
                      minPrice === range.min && maxPrice === range.max;
                    return (
                      <button
                        key={idx}
                        className={`text-xs border rounded-full px-2.5 sm:px-3 py-1 sm:py-1.5 transition-all duration-200 ${
                          isActive
                            ? "bg-blue-600 text-white border-blue-600 shadow-md"
                            : "border-gray-300 bg-white/60 backdrop-blur-sm hover:bg-white/90 hover:border-blue-400"
                        }`}
                        onClick={() => {
                          setMinPrice(range.min);
                          setMaxPrice(range.max);
                        }}
                      >
                        {range.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sort Filter */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  {t("search.sort_by", "Sắp xếp")}
                </label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/60 backdrop-blur-sm transition-all hover:bg-white/80 text-sm sm:text-base"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
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
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
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
                        color === c
                          ? "border-blue-600 ring-2 ring-blue-300"
                          : "border-gray-300"
                      }`}
                      style={{ background: getColorHex(c) }}
                      title={c}
                      onClick={() => setColor(c === color ? "" : c)}
                      type="button"
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-6">
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

      {/* Active Filters Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {search.trim() && (
            <span className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium shadow-sm backdrop-blur-sm border border-blue-200">
              {t("search.result_for", "Kết quả cho")}: "{search}"
              <button
                onClick={() => {
                  setSearch("");
                  setSearchInput("");
                }}
                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                aria-label="Remove search filter"
              >
                <X size={12} className="sm:w-[14px] sm:h-[14px]" />
              </button>
            </span>
          )}
          {(minPrice || maxPrice) && (
            <span className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium shadow-sm backdrop-blur-sm border border-blue-200">
              {minPrice && `${parseInt(minPrice).toLocaleString()}đ`}
              {minPrice && maxPrice && " - "}
              {maxPrice && `${parseInt(maxPrice).toLocaleString()}đ`}
              <button
                onClick={() => {
                  setMinPrice("");
                  setMaxPrice("");
                }}
                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
              >
                <X size={12} className="sm:w-[14px] sm:h-[14px]" />
              </button>
            </span>
          )}
          {sortBy && (
            <span className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-purple-50 text-purple-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium shadow-sm backdrop-blur-sm border border-purple-200">
              {sortOptions.find((o) => o.value === sortBy)?.label}
              <button
                onClick={() => setSortBy("")}
                className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                aria-label="Remove sort filter"
              >
                <X size={12} className="sm:w-[14px] sm:h-[14px]" />
              </button>
            </span>
          )}
          {color && (
            <span className="flex items-center gap-2 bg-gradient-to-r from-pink-100 to-pink-50 text-pink-800 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium shadow-sm backdrop-blur-sm border border-pink-200">
              <span
                className="inline-block w-3 h-3 sm:w-4 sm:h-4 rounded-full border mr-1"
                style={{ background: getColorHex(color) }}
              ></span>
              {color}
              <button
                onClick={() => setColor("")}
                className="hover:bg-pink-200 rounded-full p-0.5 transition-colors"
                aria-label="Remove color filter"
              >
                <X size={12} className="sm:w-[14px] sm:h-[14px]" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Results Header */}
      <div className="mb-4">
        <h2 className="text-base sm:text-lg font-bold text-gray-800">
          {t("promotion.promotion_products", "Sản phẩm khuyến mãi")}
          {filteredProducts.length > 0 && (
            <span className="text-gray-500 font-normal ml-2 text-xs sm:text-base">
              (
              {t(
                "search.showing_results",
                "Hiển thị {{current}} trên {{total}} sản phẩm",
                {
                  current: paginatedProducts.length,
                  total: filteredProducts.length,
                }
              )}
              )
            </span>
          )}
        </h2>
      </div>

      {/* Products Grid */}
      {paginatedProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
            {paginatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  currentPrice: product.promotionPrice || product.currentPrice,
                  salePrice: product.promotionPrice,
                }}
              />
            ))}
          </div>
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
          {search.trim() || sortBy || color ? (
            <>
              {t("search.no_result", "Không tìm thấy sản phẩm phù hợp")}
              <button
                onClick={clearFilters}
                className="block mx-auto mt-4 text-blue-600 underline hover:text-blue-700 transition-colors text-sm sm:text-base"
              >
                {t("search.clear_filters", "Xóa bộ lọc")}
              </button>
            </>
          ) : (
            t(
              "promotion.no_products",
              "Chưa có sản phẩm nào trong chương trình"
            )
          )}
        </div>
      )}
    </div>
  );
}
