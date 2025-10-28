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

      // Lọc theo thương hiệu
      // const matchesBrands =
      //   filters.brandIds.length === 0 ||
      //   filters.brandIds.some((brandId) => {
      //     const brand = brands.find((b) => b.id === brandId);
      //     return brand && product.brandName === brand.name;
      //   });

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
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
          <div className="text-lg">{t("admin.product.loading_data")}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("admin.product.title")}</h1>
        {/* Chỉ hiển thị nút tạo sản phẩm cho admin */}
        {!isStaff && (
          <button
            onClick={handleCreateProduct}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IconPlus size={16} />
            {t("admin.product.create_product")}
          </button>
        )}
        {/* Hiển thị thông báo cho staff */}
        {isStaff && (
          <div className="text-sm text-gray-600 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
            <span className="font-medium text-yellow-800">
              {t("admin.product.staff_view_only") ||
                "Chế độ xem - Không thể chỉnh sửa"}
            </span>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("admin.product.total_products")}
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
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

        <div className="bg-white p-6 rounded-lg shadow border">
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

        <div className="bg-white p-6 rounded-lg shadow border">
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

      {/* Basic Filters */}
      <div className="bg-white p-4 rounded-lg shadow border mb-4 flex flex-col md:flex-row md:items-center gap-4">
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors cursor-pointer ${
              showAdvancedFilters
                ? "bg-blue-50 border-blue-300 text-blue-700"
                : "border-gray-300 hover:bg-gray-50"
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
        <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-4">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("admin.product.filters.price_range")}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder={t("admin.product.filters.price_from")}
                  value={filters.priceRange.min}
                  onChange={(e) =>
                    handleFilterChange("priceRange", {
                      ...filters.priceRange,
                      min: e.target.value,
                    })
                  }
                  className="border rounded px-3 py-2 flex-1 text-sm"
                />
                <input
                  type="number"
                  placeholder={t("admin.product.filters.price_to")}
                  value={filters.priceRange.max}
                  onChange={(e) =>
                    handleFilterChange("priceRange", {
                      ...filters.priceRange,
                      max: e.target.value,
                    })
                  }
                  className="border rounded px-3 py-2 flex-1 text-sm"
                />
              </div>
            </div>

            {/* Brand */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("admin.product.filters.brand")}
              </label>
              <select
                value=""
                onChange={(e) =>
                  e.target.value &&
                  handleFilterChange("brandIds", parseInt(e.target.value), true)
                }
                className="border rounded-lg px-3 py-2 w-full text-sm"
              >
                <option value="">
                  {t("admin.product.filters.select_brand")}
                </option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div> */}

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("admin.product.filters.category")}
              </label>
              <select
                value=""
                onChange={(e) =>
                  e.target.value &&
                  handleFilterChange(
                    "categoryIds",
                    parseInt(e.target.value),
                    true
                  )
                }
                className="border rounded-lg px-3 py-2 w-full text-sm"
              >
                <option value="">
                  {t("admin.product.filters.select_category")}
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Colors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("admin.product.filters.colors")}
            </label>
            <div className="flex flex-wrap gap-2">
              {getAvailableColors().map((color) => (
                <button
                  key={color}
                  onClick={() => handleFilterChange("colors", color, true)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    filters.colors.includes(color)
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-700 border-gray-300 hover:border-blue-300"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("admin.product.filters.sizes")}
            </label>
            <div className="flex flex-wrap gap-2">
              {getAvailableSizes().map((size) => (
                <button
                  key={size}
                  onClick={() => handleFilterChange("sizes", size, true)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    filters.sizes.includes(size)
                      ? "bg-green-500 text-white border-green-500"
                      : "bg-white text-gray-700 border-gray-300 hover:border-green-300"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Materials */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("admin.product.filters.materials")}
            </label>
            <div className="flex flex-wrap gap-2">
              {getAvailableMaterials().map((material) => (
                <button
                  key={material}
                  onClick={() =>
                    handleFilterChange("materials", material, true)
                  }
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    filters.materials.includes(material)
                      ? "bg-purple-500 text-white border-purple-500"
                      : "bg-white text-gray-700 border-gray-300 hover:border-purple-300"
                  }`}
                >
                  {material}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {getActiveFiltersCount() > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600">
              {t("admin.product.filters.filtering")}
            </span>

            {/* Price Range */}
            {(filters.priceRange.min || filters.priceRange.max) && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                {t("admin.product.filters.price_filter", {
                  min: filters.priceRange.min
                    ? formatPrice(filters.priceRange.min)
                    : "",
                  max: filters.priceRange.max
                    ? formatPrice(filters.priceRange.max)
                    : "",
                })}
                <button
                  onClick={() => removeFilter("priceRange")}
                  className="hover:text-blue-600"
                >
                  <IconX size={12} />
                </button>
              </span>
            )}

            {/* Colors */}
            {filters.colors.map((color) => (
              <span
                key={color}
                className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"
              >
                {t("admin.product.filters.color_filter", { color })}
                <button
                  onClick={() => removeFilter("colors", color)}
                  className="hover:text-purple-600"
                >
                  <IconX size={12} />
                </button>
              </span>
            ))}

            {/* Sizes */}
            {filters.sizes.map((size) => (
              <span
                key={size}
                className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"
              >
                {t("admin.product.filters.size_filter", { size })}
                <button
                  onClick={() => removeFilter("sizes", size)}
                  className="hover:text-green-600"
                >
                  <IconX size={12} />
                </button>
              </span>
            ))}

            {/* Materials */}
            {filters.materials.map((material) => (
              <span
                key={material}
                className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"
              >
                {t("admin.product.filters.material_filter", { material })}
                <button
                  onClick={() => removeFilter("materials", material)}
                  className="hover:text-yellow-600"
                >
                  <IconX size={12} />
                </button>
              </span>
            ))}

            {/* Brands */}
            {/* {filters.brandIds.map((brandId) => {
              const brand = brands.find((b) => b.id === brandId);
              return (
                brand && (
                  <span
                    key={brandId}
                    className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                  >
                    {t("admin.product.filters.brand_filter", {
                      brand: brand.name,
                    })}
                    <button
                      onClick={() => removeFilter("brandIds", brandId)}
                      className="hover:text-indigo-600"
                    >
                      <IconX size={12} />
                    </button>
                  </span>
                )
              );
            })} */}

            {/* Categories */}
            {filters.categoryIds.map((categoryId) => {
              const category = categories.find((c) => c.id === categoryId);
              return (
                category && (
                  <span
                    key={categoryId}
                    className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                  >
                    {t("admin.product.filters.category_filter", {
                      category: category.name,
                    })}
                    <button
                      onClick={() => removeFilter("categoryIds", categoryId)}
                      className="hover:text-pink-600"
                    >
                      <IconX size={12} />
                    </button>
                  </span>
                )
              );
            })}

            {/* Status */}
            {statusFilter !== "all" && (
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                {t("admin.product.filters.status_filter", {
                  status: getStatusText(statusFilter.toUpperCase()),
                })}
                <button
                  onClick={() => setStatusFilter("all")}
                  className="hover:text-gray-600"
                >
                  <IconX size={12} />
                </button>
              </span>
            )}
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
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-400">
              <th className="p-2">{t("admin.product.columns.id")}</th>
              <th className="p-2">{t("admin.product.columns.image")}</th>
              <th className="p-2">{t("admin.product.columns.name")}</th>
              {/* <th className="p-2">{t("admin.product.columns.brand")}</th> */}
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
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{product.id}</td>
                    <td className="p-2">
                      {primaryImage ? (
                        <img
                          src={primaryImage.imageUrl}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
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
                    {/* <td className="p-2">{product.brandName}</td> */}
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
                        // Staff chỉ xem, không thể thay đổi
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            product.status
                          )}`}
                        >
                          {getStatusText(product.status)}
                        </span>
                      ) : (
                        // Admin có thể click để thay đổi
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
                        {/* Nút xem chi tiết - tất cả đều có thể xem */}
                        <button
                          className="text-blue-600 hover:text-blue-800 p-1 cursor-pointer"
                          onClick={() => handleViewProduct(product)}
                          title={t("admin.product.actions.view_details")}
                        >
                          <IconEye size={24} />
                        </button>

                        {/* Nút chỉnh sửa - chỉ admin mới có */}
                        {!isStaff ? (
                          <button
                            className="text-yellow-600 hover:text-yellow-800 p-1 cursor-pointer"
                            onClick={() => handleEditProduct(product)}
                            title={t("admin.product.actions.edit")}
                          >
                            <IconEdit size={24} />
                          </button>
                        ) : (
                          // Hiển thị icon disabled cho staff
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
  );
}
