import {
  IconEdit,
  IconEye,
  IconFilter,
  IconPlus,
  IconSearch,
  IconX,
  IconRefresh,
} from "@tabler/icons-react";
import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Pagination from "../../components/common/Pagination";
import ProductDetailModal from "../../components/ui/product/ProductDetailModal";
import ProductForm from "../../components/ui/product/ProductForm";
import { useCategory } from "../../hooks/useCategory";
import { useProduct } from "../../hooks/useProduct";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import { showConfirmationToast } from "../../utils/showConfirmationToast";
import { useProductStatistics } from "../../hooks/useProduct";
import LoadingSpinner from "../../utils/LoadingSpinner";

export default function ProductPage() {
  const { t, i18n } = useTranslation();
  const language = i18n.language || "VI";

  const { user } = useAuth();
  const isAdmin = user?.roles?.includes("ROLE_ADMIN");
  const isStaff = user?.roles?.includes("ROLE_STAFF") && !isAdmin;

  const { categories: getAllCategories, isLoading: isLoadingCategories } =
    useCategory({ lang: language });

  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [loadingStatusId, setLoadingStatusId] = useState(null);
  const [tempMinPrice, setTempMinPrice] = useState("");
  const [tempMaxPrice, setTempMaxPrice] = useState("");

  const { data: stats, isLoading: statsLoading } = useProductStatistics();

  // Debounce searchInput -> setSearch sau 1.5s không gõ
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchInput);
    }, 1000);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Advanced filters
  const [filters, setFilters] = useState({
    priceRange: { min: "", max: "" },
    colors: [],
    sizes: [],
    materials: [],
    categoryIds: [],
    onSale: null,
  });

  const pageSize = 10;

  // Build API params from filters
  const buildApiParams = () => {
    const params = {
      page: currentPage,
      size: pageSize,
      lang: language,
    };

    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    if (filters.categoryIds.length > 0)
      params.categoryIds = filters.categoryIds;
    if (filters.onSale !== null) params.onSale = filters.onSale;
    if (filters.priceRange.min) params.minPrice = filters.priceRange.min;
    if (filters.priceRange.max) params.maxPrice = filters.priceRange.max;

    return params;
  };

  // Fetch products with current filters
  const apiParams = useMemo(
    () => buildApiParams(),
    [search, statusFilter, filters, currentPage, language]
  );
  const {
    products = [],
    totalElements = 0,
    totalPages = 1,
    isLoading: isLoadingProducts,
    filterInfo,
    refetch,
  } = useProduct(apiParams);

  const { updateProduct } = useProduct({ lang: language });

  useEffect(() => {
    setCategories(getAllCategories || []);
  }, [getAllCategories]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [search, statusFilter, filters]);

  // Force re-render when language changes
  useEffect(() => {
    const handleLanguageChange = () => {};
    i18n.on("languageChanged", handleLanguageChange);
    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  useEffect(() => {
    setTempMinPrice(filters.priceRange.min);
    setTempMaxPrice(filters.priceRange.max);
  }, [showAdvancedFilters, filters.priceRange.min, filters.priceRange.max]);

  // Toggle status handler
  const handleToggleStatus = (product) => {
    if (isStaff) return;

    let newStatus;
    switch (product.status) {
      case "ACTIVE":
        newStatus = "INACTIVE";
        break;
      case "INACTIVE":
      case "DISCONTINUED":
      case "OUT_OF_STOCK":
        newStatus = "ACTIVE";
        break;
      default:
        newStatus = "INACTIVE";
    }

    const actionText =
      newStatus === "ACTIVE"
        ? t("admin.product.status.active")
        : t("admin.product.status.inactive");

    const confirmText = actionText;
    const cancelText = language === "VI" ? "Hủy" : "Cancel";
    const title = `${t(
      "admin.product.actions.confirm"
    )} ${actionText.toLowerCase()} ${t("admin.product.title").toLowerCase()}`;
    const message = `${t("admin.product.actions.confirm_message")} "${
      product.name
    }"?`;

    showConfirmationToast({
      title,
      message,
      confirmText,
      cancelText,
      confirmButtonClass: `${
        newStatus === "ACTIVE"
          ? "bg-green-600 hover:bg-green-700"
          : "bg-red-600 hover:bg-red-700"
      } text-white px-3 py-1 rounded transition-colors cursor-pointer`,
      onConfirm: async () => {
        setLoadingStatusId(product.id);
        try {
          await updateProduct({ ...product, status: newStatus });
          refetch && refetch();
        } catch (e) {}
        setLoadingStatusId(null);
      },
    });
  };

  // Format currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat(language === "VI" ? "vi-VN" : "en-US", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Handle filter change
  const handleFilterChange = (filterType, value, isMultiple = false) => {
    setFilters((prev) => {
      if (isMultiple) {
        return {
          ...prev,
          [filterType]: prev[filterType].includes(value)
            ? prev[filterType].filter((v) => v !== value)
            : [...prev[filterType], value],
        };
      }
      return {
        ...prev,
        [filterType]: value,
      };
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      priceRange: { min: "", max: "" },
      colors: [],
      sizes: [],
      materials: [],
      categoryIds: [],
      onSale: null,
    });
    setStatusFilter("");
    setSearch("");
  };

  // Count active filters
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.priceRange.min || filters.priceRange.max) count++;
    if (filters.categoryIds.length > 0) count++;
    if (filters.onSale !== null) count++;
    if (statusFilter) count++;
    if (search) count++;
    return count;
  };

  // Handle create product
  const handleCreateProduct = () => {
    if (isStaff) return;
    setEditingProduct(null);
    setShowForm(true);
  };

  // Handle edit product
  const handleEditProduct = (product) => {
    if (isStaff) return;
    setEditingProduct(product);
    setShowForm(true);
  };

  // Callback khi thêm/sửa thành công
  const handleProductFormSuccess = () => {
    refetch && refetch();
    setShowForm(false);
    setEditingProduct(null);
  };

  // Handle view product
  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  // Close form
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "INACTIVE":
        return "bg-red-100 text-red-800";
      case "OUT_OF_STOCK":
        return "bg-yellow-100 text-yellow-800";
      case "DISCONTINUED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status text
  const getStatusText = (status) => {
    const statusKey = status.toLowerCase().replace(/_/g, "_");
    return t(`admin.product.status.${statusKey}`, status);
  };

  // Get total stock
  const getTotalStock = (product) => {
    if (!product.variants) return 0;
    return product.variants.reduce((total, variant) => {
      if (typeof variant.stock === "number") return total + variant.stock;
      return total;
    }, 0);
  };

  // Get primary image
  const getPrimaryImage = (product) => {
    if (!product.variants || product.variants.length === 0) return null;
    for (const variant of product.variants) {
      if (variant.images && variant.images.length > 0) {
        return variant.images[0];
      }
    }
    return null;
  };

  // Loading cho statistics và categories
  const isLoadingHeader = isLoadingCategories || statsLoading;

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          {t("admin.product.title")}
        </h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
          {!isStaff && (
            <button
              onClick={handleCreateProduct}
              className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base"
            >
              <IconPlus size={18} />
              <span className="hidden sm:inline">
                {t("admin.product.create_product")}
              </span>
              <span className="sm:hidden">
                {t("admin.product.create_product")}
              </span>
            </button>
          )}
          {isStaff && (
            <div className="text-xs sm:text-sm text-gray-600 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
              <span className="font-medium text-yellow-800">
                {t("admin.product.staff_view_only") ||
                  "Chế độ xem - Không thể chỉnh sửa"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {isLoadingHeader ? (
          [...Array(4)].map((_, idx) => (
            <div
              key={idx}
              className="backdrop-blur-xl bg-white/60 border border-white/30 p-3 sm:p-4 lg:p-6 rounded-lg shadow-lg animate-pulse"
            >
              <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
              <div className="h-8 w-16 bg-gray-200 rounded" />
            </div>
          ))
        ) : (
          <>
            <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-3 sm:p-4 lg:p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 line-clamp-2">
                    {t("admin.product.total_products")}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {stats?.totalProducts ?? 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-3 sm:p-4 lg:p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 line-clamp-2">
                    {t("admin.product.active_products")}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">
                    {stats?.totalActiveProducts ?? 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-3 sm:p-4 lg:p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 line-clamp-2">
                    {t("admin.product.inactive_products")}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-red-600">
                    {stats?.totalInactiveProducts ?? 0}
                  </p>
                </div>
              </div>
            </div>
            <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-3 sm:p-4 lg:p-6 rounded-lg shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 line-clamp-2">
                    {t("admin.product.on_sale_products")}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-orange-600">
                    {stats?.totalProductsOnPromotion ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filters + Refresh */}
      <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-3 sm:p-4 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="relative">
              <IconSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setSearch(searchInput);
                }}
                placeholder={t("admin.product.search_placeholder")}
                className="backdrop-blur-sm bg-white/80 border border-white/30 w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
              />
            </div>
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="backdrop-blur-sm bg-white/80 border border-white/30 w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
            >
              <option value="">{t("admin.product.all_status")}</option>
              <option value="active">{t("admin.product.status.active")}</option>
              <option value="inactive">
                {t("admin.product.status.inactive")}
              </option>
              <option value="out_of_stock">
                {t("admin.product.status.out_of_stock")}
              </option>
              <option value="discontinued">
                {t("admin.product.status.discontinued")}
              </option>
            </select>
          </div>
          <div>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 border rounded-lg transition-colors cursor-pointer backdrop-blur-sm shadow-lg ${
                showAdvancedFilters
                  ? "bg-blue-50 border-blue-300 text-blue-700"
                  : "border-white/30 hover:bg-white/70"
              }`}
            >
              <IconFilter size={16} />
              {t("admin.product.filters.filter")}
              {getActiveFiltersCount() > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                  {getActiveFiltersCount()}
                </span>
              )}
            </button>
          </div>
          <div className="flex items-center h-full">
            <button
              type="button"
              onClick={() => refetch && refetch()}
              className="flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow cursor-pointer"
              title={t("common.refresh") || "Làm mới"}
            >
              <IconRefresh size={18} />
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <h3 className="font-semibold text-gray-700 text-sm sm:text-base">
                {t("admin.product.filters.advanced_filters")}
              </h3>
              <button
                onClick={clearAllFilters}
                className="text-red-600 hover:text-red-800 text-xs sm:text-sm underline cursor-pointer"
              >
                {t("admin.product.filters.clear_all")}
              </button>
            </div>

            {/* Price Range Filter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  {t("admin.product.filters.min_price")}
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={tempMinPrice}
                  onChange={(e) => setTempMinPrice(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      setFilters((prev) => ({
                        ...prev,
                        priceRange: {
                          ...prev.priceRange,
                          min: tempMinPrice,
                        },
                      }));
                  }}
                  className="backdrop-blur-sm bg-white/80 border border-white/30 w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  {t("admin.product.filters.max_price")}
                </label>
                <input
                  type="number"
                  placeholder="999999999"
                  value={tempMaxPrice}
                  onChange={(e) => setTempMaxPrice(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      setFilters((prev) => ({
                        ...prev,
                        priceRange: {
                          ...prev.priceRange,
                          max: tempMaxPrice,
                        },
                      }));
                  }}
                  className="backdrop-blur-sm bg-white/80 border border-white/30 w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                {t("admin.product.filters.category")}
              </label>
              <select
                value={filters.categoryIds[0] || ""}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    categoryIds: e.target.value ? [Number(e.target.value)] : [],
                  }))
                }
                className="backdrop-blur-sm bg-white/80 border border-white/30 w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">
                  {t("admin.product.filters.all_categories")}
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* On Sale Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                {t("admin.product.filters.sale_status")}
              </label>
              <select
                value={filters.onSale === null ? "" : filters.onSale.toString()}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    onSale:
                      e.target.value === "" ? null : e.target.value === "true",
                  }))
                }
                className="backdrop-blur-sm bg-white/80 border border-white/30 w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">{t("admin.product.filters.all")}</option>
                <option value="true">
                  {t("admin.product.filters.on_sale")}
                </option>
                <option value="false">
                  {t("admin.product.filters.not_on_sale")}
                </option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="text-xs sm:text-sm text-gray-600">
        {t("admin.product.showing_results", {
          current: products.length,
          total: totalElements,
        })}
      </div>

      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-3">
        {isLoadingProducts ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : products.length > 0 ? (
          products.map((product) => {
            const primaryImage = getPrimaryImage(product);
            const totalStock = getTotalStock(product);

            return (
              <div
                key={product.id}
                className="backdrop-blur-xl bg-white/60 border border-white/30 shadow-lg rounded-lg p-3 sm:p-4"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm">
                    {primaryImage ? (
                      <img
                        src={primaryImage.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-2 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {product.categoryName}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">
                      {t("admin.product.columns.original_price")}
                    </p>
                    <p className="font-medium text-sm">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">
                      {t("admin.product.columns.sale_price")}
                    </p>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-sm">
                        {formatPrice(product.salePrice)}
                      </span>
                      {product.onSale && (
                        <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs w-fit">
                          {t("admin.product.values.sale")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">
                      {t("admin.product.columns.status")}
                    </p>
                    {isStaff ? (
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                          product.status
                        )}`}
                      >
                        {getStatusText(product.status)}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleToggleStatus(product)}
                        disabled={loadingStatusId === product.id}
                        className={`px-2 py-1 rounded text-xs font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 hover:opacity-80 ${getStatusColor(
                          product.status
                        )}`}
                      >
                        {loadingStatusId === product.id ? (
                          <div className="flex items-center justify-center gap-1">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                          </div>
                        ) : (
                          getStatusText(product.status)
                        )}
                      </button>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">
                      {t("admin.product.columns.variants")}
                    </p>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                      {product.variants ? product.variants.length : 0}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">
                      {t("admin.product.columns.stock")}
                    </p>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        totalStock > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {totalStock}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all text-sm cursor-pointer"
                    onClick={() => handleViewProduct(product)}
                  >
                    <IconEye size={18} />
                    {t("admin.product.actions.view_details")}
                  </button>
                  {!isStaff ? (
                    <button
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-yellow-600 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-all text-sm cursor-pointer"
                      onClick={() => handleEditProduct(product)}
                    >
                      <IconEdit size={18} />
                      {t("admin.product.actions.edit")}
                    </button>
                  ) : (
                    <button
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-gray-400 bg-gray-50 rounded-lg text-sm cursor-not-allowed opacity-50"
                      onClick={() => handleEditProduct(product)}
                    >
                      <IconEdit size={18} />
                      {t("admin.product.actions.edit")}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="backdrop-blur-xl bg-white/60 border border-white/30 shadow-lg rounded-lg p-8 text-center">
            <p className="text-base font-medium text-gray-400">
              {t("admin.product.no_products")}
            </p>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block backdrop-blur-xl bg-white/60 border border-white/30 shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-gray-400">
                <th className="p-3 text-sm font-bold">
                  {t("admin.product.columns.id")}
                </th>
                <th className="p-3 text-sm font-bold">
                  {t("admin.product.columns.image")}
                </th>
                <th className="p-3 text-sm font-bold">
                  {t("admin.product.columns.name")}
                </th>
                <th className="p-3 text-sm font-bold">
                  {t("admin.product.columns.category")}
                </th>
                <th className="p-3 text-sm font-bold">
                  {t("admin.product.columns.original_price")}
                </th>
                <th className="p-3 text-sm font-bold">
                  {t("admin.product.columns.sale_price")}
                </th>
                <th className="p-3 text-sm font-bold">
                  {t("admin.product.columns.status")}
                </th>
                <th className="p-3 text-sm font-bold">
                  {t("admin.product.columns.variants")}
                </th>
                <th className="p-3 text-sm font-bold">
                  {t("admin.product.columns.stock")}
                </th>
                <th className="p-3 text-sm font-bold">
                  {t("admin.product.columns.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoadingProducts ? (
                <tr>
                  <td colSpan={10} className="py-12">
                    <div className="flex justify-center">
                      <LoadingSpinner />
                    </div>
                  </td>
                </tr>
              ) : products.length > 0 ? (
                products.map((product) => {
                  const primaryImage = getPrimaryImage(product);
                  const totalStock = getTotalStock(product);
                  return (
                    <tr key={product.id}>
                      <td className="p-3">{product.id}</td>
                      <td className="p-3">
                        {primaryImage ? (
                          <img
                            src={primaryImage.imageUrl}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 flex items-center justify-center bg-gray-100 text-gray-400 text-xs rounded">
                            No Image
                          </div>
                        )}
                      </td>
                      <td className="p-3">{product.name}</td>
                      <td className="p-3">{product.categoryName}</td>
                      <td className="p-3">{formatPrice(product.price)}</td>
                      <td className="p-3">
                        {formatPrice(product.salePrice)}
                        {product.onSale && (
                          <span className="ml-2 bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs">
                            {t("admin.product.values.sale")}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {isStaff ? (
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                              product.status
                            )}`}
                          >
                            {getStatusText(product.status)}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(product)}
                            disabled={loadingStatusId === product.id}
                            className={`px-2 py-1 rounded text-xs font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 hover:opacity-80 ${getStatusColor(
                              product.status
                            )}`}
                          >
                            {loadingStatusId === product.id ? (
                              <div className="flex items-center justify-center gap-1">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                              </div>
                            ) : (
                              getStatusText(product.status)
                            )}
                          </button>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                          {product.variants ? product.variants.length : 0}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            totalStock > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {totalStock}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            className="flex items-center gap-1 px-2 py-1 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-all text-xs cursor-pointer"
                            onClick={() => handleViewProduct(product)}
                          >
                            <IconEye size={16} />
                            {t("admin.product.actions.view_details")}
                          </button>
                          {!isStaff ? (
                            <button
                              className="flex items-center gap-1 px-2 py-1 text-yellow-600 bg-yellow-50 hover:bg-yellow-100 rounded transition-all text-xs cursor-pointer"
                              onClick={() => handleEditProduct(product)}
                            >
                              <IconEdit size={16} />
                              {t("admin.product.actions.edit")}
                            </button>
                          ) : (
                            <button
                              className="flex items-center gap-1 px-2 py-1 text-gray-400 bg-gray-50 rounded text-xs cursor-not-allowed opacity-50"
                              onClick={() => handleEditProduct(product)}
                            >
                              <IconEdit size={16} />
                              {t("admin.product.actions.edit")}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="text-center text-gray-500 p-4">
                    {t("admin.product.no_products")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={currentPage + 1}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page - 1)}
      />

      <ProductDetailModal
        product={selectedProduct}
        open={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedProduct(null);
        }}
      />

      {!isStaff && (
        <ProductForm
          isOpen={showForm}
          onClose={handleCloseForm}
          product={editingProduct}
          categories={categories}
          onSuccess={handleProductFormSuccess}
        />
      )}
    </div>
  );
}
