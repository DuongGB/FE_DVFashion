import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp, X, Filter } from "react-feather";
import { IconCalendar, IconTarget } from "@tabler/icons-react";
import { decodeId } from "../../../utils/encodeId";
import { productAPI } from "../../../services/productAPI";
import ProductCard from "../../../components/common/ProductCard";
import Pagination from "../../../components/common/Pagination";
import { usePromotion } from "../../../hooks/usePromotion";

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
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

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

  // Apply filters and search
  useEffect(() => {
    let result = [...products];

    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

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
  }, [search, sortBy, products]);

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
    setFilteredProducts(products);
  };

  const hasActiveFilters = search.trim() || sortBy;

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setCurrentPage(1);
  };

  const activeFiltersCount = useMemo(() => {
    return [search.trim(), sortBy].filter(Boolean).length;
  }, [search, sortBy]);

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
    <div className="max-w-7xl mx-auto px-8 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-3 text-gray-800">
          {promotion.name}
        </h1>
        {promotion.description && (
          <p className="text-gray-600 mb-4 text-base">
            {promotion.description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1.5 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200">
            <IconCalendar size={16} />
            {t("promotion.from", "Từ")}{" "}
            {new Date(promotion.startDate).toLocaleDateString(
              i18n.language === "VI" ? "vi-VN" : "en-US"
            )}
          </span>
          <span>→</span>
          <span className="flex items-center gap-1.5 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-200">
            <IconCalendar size={16} />
            {t("promotion.to", "đến")}{" "}
            {new Date(promotion.endDate).toLocaleDateString(
              i18n.language === "VI" ? "vi-VN" : "en-US"
            )}
          </span>
          <span className="flex items-center gap-1.5 bg-orange-100/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-orange-200 text-orange-700 font-medium">
            <IconTarget size={16} />
            {products.length} {t("search.products_found", "sản phẩm")}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          className="border border-gray-200 rounded-full px-6 py-3 w-[300px] text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/70 backdrop-blur-sm"
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
          {activeFiltersCount > 0 && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {activeFiltersCount}
            </span>
          )}
          {showFilters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="relative bg-white/80 backdrop-blur-xl border border-gray-200/50 rounded-2xl p-6 mb-6 shadow-xl before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/40 before:to-transparent before:rounded-2xl before:pointer-events-none">
          <div className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  {t("search.sort_by", "Sắp xếp")}
                </label>
                <select
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/60 backdrop-blur-sm transition-all hover:bg-white/80"
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
            </div>
            <div className="flex gap-4 mt-6">
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
      {(search.trim() || sortBy) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {search.trim() && (
            <span className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 px-4 py-2 rounded-full text-sm font-medium shadow-sm backdrop-blur-sm border border-blue-200">
              {t("search.result_for", "Kết quả cho")}: "{search}"
              <button
                onClick={() => {
                  setSearch("");
                  setSearchInput("");
                }}
                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                aria-label="Remove search filter"
              >
                <X size={14} />
              </button>
            </span>
          )}
          {sortBy && (
            <span className="flex items-center gap-2 bg-gradient-to-r from-purple-100 to-purple-50 text-purple-800 px-4 py-2 rounded-full text-sm font-medium shadow-sm backdrop-blur-sm border border-purple-200">
              {sortOptions.find((o) => o.value === sortBy)?.label}
              <button
                onClick={() => setSortBy("")}
                className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                aria-label="Remove sort filter"
              >
                <X size={14} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Results Header */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-800">
          {t("promotion.promotion_products", "Sản phẩm khuyến mãi")}
          {filteredProducts.length > 0 && (
            <span className="text-gray-500 font-normal ml-2">
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
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
          {search.trim() || sortBy ? (
            <>
              {t("search.no_result", "Không tìm thấy sản phẩm phù hợp")}
              <button
                onClick={clearFilters}
                className="block mx-auto mt-4 text-blue-600 underline hover:text-blue-700 transition-colors"
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
