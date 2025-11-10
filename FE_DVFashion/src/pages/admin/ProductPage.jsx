import {
  IconEdit,
  IconEye,
  IconFilter,
  IconPlus,
  IconSearch,
  IconX,
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

export default function ProductPage() {
  const { t, i18n } = useTranslation();
  const language = i18n.language || "VI";

  const { user } = useAuth();
  const isAdmin = user?.roles?.includes("ROLE_ADMIN");
  const isStaff = user?.roles?.includes("ROLE_STAFF") && !isAdmin;

  const { categories: getAllCategories, isLoading: isLoadingCategories } =
    useCategory(language);

  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [loadingStatusId, setLoadingStatusId] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [tempMinPrice, setTempMinPrice] = useState("");
  const [tempMaxPrice, setTempMaxPrice] = useState("");

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
    if (statusFilter) params.status = statusFilter.toUpperCase();
    if (filters.categoryIds.length > 0) {
      params.categoryId = filters.categoryIds[0];
    }
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
    products,
    totalElements,
    totalPages,
    isLoading: isLoadingProducts,
    filterInfo,
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
    if (isStaff) {
      toast.error(
        t("admin.product.messages.staff_status_denied") ||
          "Bạn không có quyền thực hiện thao tác này!",
        { autoClose: 2000, position: "top-right" }
      );
      return;
    }

    let newStatus;
    switch (product.status) {
      case "ACTIVE":
        newStatus = "INACTIVE";
        break;
      case "INACTIVE":
      case "OUT_OF_STOCK":
      case "DISCONTINUED":
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
          await updateProduct({
            productId: product.id,
            productData: {
              ...product,
              status: newStatus,
            },
            lang: language,
          });
        } catch (error) {
          toast.error(
            t("admin.product.actions.error") ||
              "Có lỗi xảy ra khi cập nhật trạng thái!",
            { autoClose: 2000, position: "top-center" }
          );
        } finally {
          setLoadingStatusId(null);
        }
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
        const currentValues = prev[filterType] || [];
        const newValues = currentValues.includes(value)
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value];
        return { ...prev, [filterType]: newValues };
      } else {
        return { ...prev, [filterType]: value };
      }
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
    if (filters.categoryIds.length > 0) count += filters.categoryIds.length;
    if (filters.onSale !== null) count++;
    if (statusFilter) count++;
    if (search) count++;
    return count;
  };

  // Handle create product
  const handleCreateProduct = () => {
    if (isStaff) {
      toast.error(
        t("admin.product.messages.staff_create_denied") ||
          "Bạn không có quyền tạo sản phẩm mới!",
        { autoClose: 2000, position: "top-center" }
      );
      return;
    }
    setEditingProduct(null);
    setShowForm(true);
  };

  // Handle edit product
  const handleEditProduct = (product) => {
    if (isStaff) {
      toast.error(
        t("admin.product.messages.staff_edit_denied") ||
          "Bạn không có quyền chỉnh sửa sản phẩm!",
        { autoClose: 2000, position: "top-right" }
      );
      return;
    }
    setEditingProduct(product);
    setShowForm(true);
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
      if (!variant.sizes) return total;
      return (
        total +
        variant.sizes.reduce((variantTotal, size) => {
          return variantTotal + (size.stockQuantity || 0);
        }, 0)
      );
    }, 0);
  };

  // Get primary image
  const getPrimaryImage = (product) => {
    if (!product.variants || product.variants.length === 0) return null;
    for (const variant of product.variants) {
      if (variant.images && variant.images.length > 0) {
        const primaryImage = variant.images.find((img) => img.isPrimary);
        if (primaryImage) return primaryImage;
        return variant.images[0];
      }
    }
    return null;
  };

  // Statistics calculation (from current filtered results)
  const stats = {
    total: totalElements,
    active: products.filter((p) => p.status === "ACTIVE").length,
    inactive: products.filter((p) => p.status === "INACTIVE").length,
    outOfStock: products.filter((p) => p.status === "OUT_OF_STOCK").length,
    onSale: products.filter((p) => p.onSale).length,
  };

  if (isLoadingProducts || isLoadingCategories) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-lg shadow border flex flex-col gap-2"
            >
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {t("admin.product.title")}
        </h1>
        <div className="flex items-center gap-4">
          {!isStaff && (
            <button
              onClick={handleCreateProduct}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <IconPlus size={20} />
              {t("admin.product.create_product")}
            </button>
          )}
          {isStaff && (
            <div className="text-sm text-gray-600 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
              <span className="font-medium text-yellow-800">
                {t("admin.product.staff_view_only") ||
                  "Chế độ xem - Không thể chỉnh sửa"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("admin.product.total_products")}
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("admin.product.active_products")}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats.active}
              </p>
            </div>
          </div>
        </div>
        <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("admin.product.inactive_products")}
              </p>
              <p className="text-2xl font-bold text-red-600">
                {stats.inactive}
              </p>
            </div>
          </div>
        </div>
        <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("admin.product.on_sale_products")}
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.onSale}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-4 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <IconSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSearch(searchInput);
                    setCurrentPage(0);
                  }
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
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-700">
                {t("admin.product.filters.advanced_filters")}
              </h3>
              <button
                onClick={clearAllFilters}
                className="text-red-600 hover:text-red-800 text-sm underline cursor-pointer"
              >
                {t("admin.product.filters.clear_all")}
              </button>
            </div>

            {/* Price Range Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("admin.product.filters.min_price")}
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={tempMinPrice}
                  onChange={(e) => setTempMinPrice(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setFilters((prev) => ({
                        ...prev,
                        priceRange: { ...prev.priceRange, min: tempMinPrice },
                      }));
                    }
                  }}
                  className="backdrop-blur-sm bg-white/80 border border-white/30 w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("admin.product.filters.max_price")}
                </label>
                <input
                  type="number"
                  placeholder="999999999"
                  value={tempMaxPrice}
                  onChange={(e) => setTempMaxPrice(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setFilters((prev) => ({
                        ...prev,
                        priceRange: { ...prev.priceRange, max: tempMaxPrice },
                      }));
                    }
                  }}
                  className="backdrop-blur-sm bg-white/80 border border-white/30 w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className="backdrop-blur-sm bg-white/80 border border-white/30 w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className="backdrop-blur-sm bg-white/80 border border-white/30 w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      <div className="text-sm text-gray-600">
        {t("admin.product.showing_results", {
          current: products.length,
          total: totalElements,
        })}
      </div>

      {/* Products Table */}
      <div className="backdrop-blur-xl bg-white/60 border border-white/30 shadow-lg rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-400">
              <th className="p-3">{t("admin.product.columns.id")}</th>
              <th className="p-3">{t("admin.product.columns.image")}</th>
              <th className="p-3">{t("admin.product.columns.name")}</th>
              <th className="p-3">{t("admin.product.columns.category")}</th>
              <th className="p-3">
                {t("admin.product.columns.original_price")}
              </th>
              <th className="p-3">{t("admin.product.columns.sale_price")}</th>
              <th className="p-3">{t("admin.product.columns.status")}</th>
              <th className="p-3">{t("admin.product.columns.variants")}</th>
              <th className="p-3">{t("admin.product.columns.stock")}</th>
              <th className="p-3">{t("admin.product.columns.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => {
                const primaryImage = getPrimaryImage(product);
                const totalStock = getTotalStock(product);

                return (
                  <tr
                    key={product.id}
                    className="border-b hover:bg-white/80 transition-colors"
                  >
                    <td className="p-3">{product.id}</td>
                    <td className="p-3">
                      {primaryImage ? (
                        <img
                          src={primaryImage.imageUrl}
                          alt={product.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div>
                        <p className="font-semibold">{product.name}</p>
                      </div>
                    </td>
                    <td className="p-3">{product.categoryName}</td>
                    <td className="p-3 font-medium">
                      {formatPrice(product.price)}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {formatPrice(product.salePrice)}
                        </span>
                        {product.onSale && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs w-fit">
                            {t("admin.product.values.sale")}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      {isStaff ? (
                        <span
                          className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(
                            product.status
                          )}`}
                        >
                          {getStatusText(product.status)}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(product)}
                          disabled={loadingStatusId === product.id}
                          className={`px-3 py-1 rounded text-sm font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 hover:opacity-80 ${getStatusColor(
                            product.status
                          )}`}
                          title={
                            product.status === "ACTIVE"
                              ? t("admin.product.status.inactive")
                              : t("admin.product.status.active")
                          }
                        >
                          {loadingStatusId === product.id ? (
                            <div className="flex items-center gap-1">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                            </div>
                          ) : (
                            getStatusText(product.status)
                          )}
                        </button>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {product.variants ? product.variants.length : 0}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${
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
                          className="text-blue-600 hover:text-blue-800 cursor-pointer p-1 rounded hover:bg-blue-50 transition-colors"
                          onClick={() => handleViewProduct(product)}
                          title={t("admin.product.actions.view_details")}
                        >
                          <IconEye size={24} />
                        </button>
                        {!isStaff ? (
                          <button
                            className="text-yellow-600 hover:text-yellow-800 cursor-pointer p-1 rounded hover:bg-yellow-50 transition-colors"
                            onClick={() => handleEditProduct(product)}
                            title={t("admin.product.actions.edit")}
                          >
                            <IconEdit size={24} />
                          </button>
                        ) : (
                          <button
                            className="text-gray-400 p-1 cursor-not-allowed opacity-50"
                            onClick={() => handleEditProduct(product)}
                            title={
                              t("admin.product.staff_no_permission") ||
                              "Không có quyền chỉnh sửa"
                            }
                          >
                            <IconEdit size={24} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={11} className="text-center text-gray-500 p-4">
                  {t("admin.product.no_products")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage + 1} // Display as 1-indexed
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page - 1)} // Convert back to 0-indexed
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        open={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedProduct(null);
        }}
      />

      {/* Product Form Modal */}
      {!isStaff && (
        <ProductForm
          isOpen={showForm}
          onClose={handleCloseForm}
          product={editingProduct}
          categories={categories}
        />
      )}
    </div>
  );
}
