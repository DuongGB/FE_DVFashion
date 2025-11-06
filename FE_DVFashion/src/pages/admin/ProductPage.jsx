import {
  IconEdit,
  IconEye,
  IconFilter,
  IconPlus,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Pagination from "../../components/common/Pagination";
import ProductDetailModal from "../../components/ui/product/ProductDetailModal";
import ProductForm from "../../components/ui/product/ProductForm";
// import { useBrand } from "../../hooks/useBrand";
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

  const { products: getAllProducts, isLoading: isLoadingProducts } =
    useProduct(language);
  // const { brands: getAllBrands, isLoading: isLoadingBrands } =
  //   useBrand(language);
  const { categories: getAllCategories, isLoading: isLoadingCategories } =
    useCategory(language);

  const [products, setProducts] = useState([]);
  // const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [loadingStatusId, setLoadingStatusId] = useState(null);
  const [originalOrder, setOriginalOrder] = useState([]);

  const { updateProduct, isUpdating } = useProduct(language);

  // Toggle status handler (giống CategoryPage)
  const handleToggleStatus = (product) => {
    // Kiểm tra quyền trước khi thực hiện
    if (isStaff) {
      toast.error(
        t("admin.product.messages.staff_status_denied") ||
          "Bạn không có quyền thực hiện thao tác này!",
        { autoClose: 2000, position: "top-right" }
      );
      return;
    }

    // Xác định trạng thái mới
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
          ? "bg-green-600 hover:bg-green-700 rounded cursor-pointer px-3 py-1"
          : "bg-red-600 hover:bg-red-700 rounded cursor-pointer px-3 py-1"
      } text-white`,
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
          // Cập nhật trạng thái trong state products, giữ nguyên thứ tự
          setProducts((prev) =>
            prev.map((p) =>
              p.id === product.id ? { ...p, status: newStatus } : p
            )
          );
          // toast.success(
          //   `${t("admin.product.title")} ${actionText.toLowerCase()} ${t(
          //     "admin.brand.actions.success"
          //   )}!`,
          //   { autoClose: 2000, position: "top-center" }
          // );
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

  // Advanced filters
  const [filters, setFilters] = useState({
    priceRange: { min: "", max: "" },
    colors: [],
    sizes: [],
    materials: [],
    // brandIds: [],
    categoryIds: [],
  });

  const pageSize = 10;

  // Force re-render when language changes
  useEffect(() => {
    const handleLanguageChange = () => {};
    i18n.on("languageChanged", handleLanguageChange);
    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  useEffect(() => {
    setProducts(getAllProducts || []);
    // setBrands(getAllBrands || []);
    setCategories(getAllCategories || []);
    // Lưu thứ tự ban đầu khi load lần đầu
    if (getAllProducts && originalOrder.length === 0) {
      setOriginalOrder(getAllProducts.map((p) => p.id));
    }
  }, [getAllProducts, getAllCategories]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, filters]);

  // Format currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat(language === "VI" ? "vi-VN" : "en-US", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Lấy danh sách màu sắc từ variants
  const getAvailableColors = () => {
    const colors = new Set();
    products.forEach((product) => {
      product.variants?.forEach((variant) => {
        if (variant.color) colors.add(variant.color);
      });
    });
    return Array.from(colors).sort();
  };

  // Lấy danh sách kích cỡ từ variants -> sizes
  const getAvailableSizes = () => {
    const sizes = new Set();
    products.forEach((product) => {
      product.variants?.forEach((variant) => {
        variant.sizes?.forEach((size) => {
          if (size.sizeName) sizes.add(size.sizeName);
        });
      });
    });
    return Array.from(sizes).sort();
  };

  // Lấy danh sách chất liệu
  const getAvailableMaterials = () => {
    const materials = new Set();
    products.forEach((product) => {
      if (product.material) materials.add(product.material);
    });
    return Array.from(materials).sort();
  };

  // Xử lý thay đổi filter
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
    setCurrentPage(1);
  };

  // Xóa một filter cụ thể
  const removeFilter = (filterType, value = null) => {
    setFilters((prev) => {
      if (value !== null) {
        return {
          ...prev,
          [filterType]: prev[filterType].filter((v) => v !== value),
        };
      } else {
        if (filterType === "priceRange") {
          return { ...prev, [filterType]: { min: "", max: "" } };
        } else if (Array.isArray(prev[filterType])) {
          return { ...prev, [filterType]: [] };
        } else {
          return { ...prev, [filterType]: "all" };
        }
      }
    });
  };

  // Xóa tất cả filters
  const clearAllFilters = () => {
    setFilters({
      priceRange: { min: "", max: "" },
      colors: [],
      sizes: [],
      materials: [],
      // brandIds: [],
      categoryIds: [],
    });
    setStatusFilter("all");
    setSearch("");
  };

  // Kiểm tra sản phẩm có màu sắc không
  const productHasColor = (product, color) => {
    return product.variants?.some((variant) => variant.color === color);
  };

  // Kiểm tra sản phẩm có kích cỡ không
  const productHasSize = (product, size) => {
    return product.variants?.some((variant) =>
      variant.sizes?.some((s) => s.sizeName === size)
    );
  };

  // Kiểm tra sản phẩm có chất liệu không
  const productHasMaterial = (product, material) => {
    return product.material === material;
  };

  // Lọc sản phẩm với tất cả filters
  const filteredProducts = products
    .filter((product) => {
      // Tìm kiếm theo tên
      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.toLowerCase());

      // Lọc theo trạng thái
      const matchesStatus =
        statusFilter === "all" ||
        product.status.toLowerCase() === statusFilter.toLowerCase();

      // Lọc theo khoảng giá
      const matchesPriceRange = (() => {
        const { min, max } = filters.priceRange;
        const price = product.salePrice || product.price;
        if (min && price < parseFloat(min)) return false;
        if (max && price > parseFloat(max)) return false;
        return true;
      })();

      // Lọc theo màu sắc
      const matchesColors =
        filters.colors.length === 0 ||
        filters.colors.some((color) => productHasColor(product, color));

      // Lọc theo kích cỡ
      const matchesSizes =
        filters.sizes.length === 0 ||
        filters.sizes.some((size) => productHasSize(product, size));

      // Lọc theo chất liệu
      const matchesMaterials =
        filters.materials.length === 0 ||
        filters.materials.some((material) =>
          productHasMaterial(product, material)
        );

      // Lọc theo danh mục
      const matchesCategories =
        filters.categoryIds.length === 0 ||
        filters.categoryIds.some((categoryId) => {
          const category = categories.find((c) => c.id === categoryId);
          return category && product.categoryName === category.name;
        });

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriceRange &&
        matchesColors &&
        matchesSizes &&
        matchesMaterials &&
        // matchesBrands &&
        matchesCategories
      );
    })
    .sort((a, b) => {
      // Sắp xếp theo thứ tự ban đầu
      return originalOrder.indexOf(a.id) - originalOrder.indexOf(b.id);
    });

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Đếm số filter đang active
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.priceRange.min || filters.priceRange.max) count++;
    if (filters.colors.length > 0) count += filters.colors.length;
    if (filters.sizes.length > 0) count += filters.sizes.length;
    if (filters.materials.length > 0) count += filters.materials.length;
    // if (filters.brandIds.length > 0) count += filters.brandIds.length;
    if (filters.categoryIds.length > 0) count += filters.categoryIds.length;
    if (statusFilter !== "all") count++;
    return count;
  };

  // Xử lý tạo sản phẩm mới
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

  // Xử lý chỉnh sửa sản phẩm
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

  // Xử lý xem chi tiết sản phẩm
  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  // Đóng form
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  // Lấy màu trạng thái
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

  // Lấy text trạng thái
  const getStatusText = (status) => {
    const statusKey = status.toLowerCase().replace(/_/g, "_");
    return t(`admin.product.status.${statusKey}`, status);
  };

  // Tính tổng số lượng tồn kho từ tất cả variants và sizes
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

  // Lấy ảnh chính của sản phẩm
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

  // Statistics calculation
  const stats = {
    total: products.length,
    active: products.filter((p) => p.status === "ACTIVE").length,
    inactive: products.filter((p) => p.status === "INACTIVE").length,
    outOfStock: products.filter((p) => p.status === "OUT_OF_STOCK").length,
    onSale: products.filter((p) => p.onSale).length,
    totalValue: products.reduce((sum, p) => sum + (p.salePrice || p.price), 0),
  };

  if (isLoadingProducts || isLoadingCategories) {
    // Skeleton loading UI
    return (
      <div className="flex flex-col gap-6 p-8">
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
        <div className="bg-white p-4 rounded-lg shadow border flex gap-4">
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="w-full">
            <tbody>
              {[...Array(6)].map((_, idx) => (
                <tr key={idx} className="border-b">
                  {[...Array(12)].map((__, colIdx) => (
                    <td key={colIdx} className="p-2">
                      <div className="h-6 w-full bg-gray-200 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Liquid glass background blobs */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 bg-clip-text text-transparent">
            {t("admin.product.title")}
          </h1>
          {!isStaff && (
            <button
              onClick={handleCreateProduct}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl shadow-lg hover:from-blue-700 hover:to-purple-700 flex items-center gap-2 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <IconPlus size={16} />
              {t("admin.product.create_product")}
            </button>
          )}
          {isStaff && (
            <div className="text-sm text-gray-600 bg-yellow-50 px-3 py-2 rounded-xl border border-yellow-200 shadow">
              <span className="font-medium text-yellow-800">
                {t("admin.product.staff_view_only") ||
                  "Chế độ xem - Không thể chỉnh sửa"}
              </span>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="backdrop-blur-xl bg-white/40 border border-white/30 rounded-xl shadow-lg p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("admin.product.total_products")}
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
          <div className="backdrop-blur-xl bg-white/40 border border-white/30 rounded-xl shadow-lg p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("admin.product.active_products")}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {stats.active}
              </p>
            </div>
          </div>
          <div className="backdrop-blur-xl bg-white/40 border border-white/30 rounded-xl shadow-lg p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("admin.product.inactive_products")}
              </p>
              <p className="text-2xl font-bold text-red-600">
                {stats.inactive}
              </p>
            </div>
          </div>
          <div className="backdrop-blur-xl bg-white/40 border border-white/30 rounded-xl shadow-lg p-6 flex items-center justify-between">
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

        {/* Basic Filters */}
        <div className="backdrop-blur-xl bg-white/40 border border-white/30 rounded-xl shadow-lg mb-4 flex flex-col md:flex-row md:items-center gap-4 p-4">
          <div className="flex gap-4 items-center flex-1">
            <div className="relative flex-1">
              <IconSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder={t("admin.product.search_placeholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-white/30 rounded-lg bg-white/60 backdrop-blur-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-white/30 rounded-lg bg-white/60 backdrop-blur-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
            >
              <option value="all">{t("admin.product.all_status")}</option>
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
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all duration-300 cursor-pointer shadow
                ${
                  showAdvancedFilters
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "border-white/30 bg-white/60 hover:bg-blue-50 hover:border-blue-300"
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
          <div className="backdrop-blur-xl bg-white/40 border border-white/30 rounded-xl shadow-lg p-4 mb-4 space-y-4">
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
            {/* ...existing advanced filters code... */}
          </div>
        )}

        {/* Active Filters Display */}
        {getActiveFiltersCount() > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600">
                {t("admin.product.filters.filtering")}
              </span>
              {/* ...existing filter chips code... */}
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="mb-4 text-sm text-gray-600">
          {t("admin.product.showing_results", {
            current: paginatedProducts.length,
            total: filteredProducts.length,
          })}
        </div>

        {/* Products Table */}
        <div className="backdrop-blur-xl bg-white/40 border border-white/30 shadow-lg rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200">
              <tr>
                <th className="p-2">{t("admin.product.columns.id")}</th>
                <th className="p-2">{t("admin.product.columns.image")}</th>
                <th className="p-2">{t("admin.product.columns.name")}</th>
                <th className="p-2">{t("admin.product.columns.category")}</th>
                <th className="p-2">{t("admin.product.columns.material")}</th>
                <th className="p-2">
                  {t("admin.product.columns.original_price")}
                </th>
                <th className="p-2">{t("admin.product.columns.sale_price")}</th>
                <th className="p-2">{t("admin.product.columns.status")}</th>
                <th className="p-2">{t("admin.product.columns.variants")}</th>
                <th className="p-2">{t("admin.product.columns.stock")}</th>
                <th className="p-2">{t("admin.product.columns.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product) => {
                  const primaryImage = getPrimaryImage(product);
                  const totalStock = getTotalStock(product);

                  return (
                    <tr
                      key={product.id}
                      className="border-b hover:bg-white/60 transition-all"
                    >
                      <td className="p-2">{product.id}</td>
                      <td className="p-2">
                        {primaryImage ? (
                          <img
                            src={primaryImage.imageUrl}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded shadow"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-gray-400 text-xs">
                              {t("admin.product.values.no_image")}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="p-2">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {product.description}
                          </div>
                        </div>
                      </td>
                      <td className="p-2">{product.categoryName}</td>
                      <td className="p-2">
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                          {product.material}
                        </span>
                      </td>
                      <td className="p-2 w-28 font-medium">
                        {formatPrice(product.price)}
                      </td>
                      <td className="p-2 w-28">
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
                      <td className="p-2 w-32">
                        {isStaff ? (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              product.status
                            )}`}
                          >
                            {getStatusText(product.status)}
                          </span>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(product)}
                            disabled={loadingStatusId === product.id}
                            className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 hover:opacity-80 ${getStatusColor(
                              product.status
                            )}`}
                            title={
                              product.status === "ACTIVE"
                                ? t("admin.product.status.inactive")
                                : t("admin.product.status.active")
                            }
                          >
                            {loadingStatusId === product.id ? (
                              <span className="flex items-center gap-1">
                                <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></span>
                              </span>
                            ) : (
                              getStatusText(product.status)
                            )}
                          </button>
                        )}
                      </td>
                      <td className="p-2 text-center">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-medium">
                          {product.variants ? product.variants.length : 0}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <span
                          className={`px-2 py-1 rounded text-medium font-medium ${
                            totalStock > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {totalStock}
                        </span>
                      </td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <button
                            className="text-blue-600 hover:text-blue-800 p-1 cursor-pointer"
                            onClick={() => handleViewProduct(product)}
                            title={t("admin.product.actions.view_details")}
                          >
                            <IconEye size={24} />
                          </button>
                          {!isStaff ? (
                            <button
                              className="text-yellow-600 hover:text-yellow-800 p-1 cursor-pointer"
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
                  <td colSpan={12} className="text-center py-6 text-gray-500">
                    {t("admin.product.no_products")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
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
    </div>
  );
}
