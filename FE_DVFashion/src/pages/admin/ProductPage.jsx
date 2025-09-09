import { useState, useEffect } from "react";
import Pagination from "../../components/common/Pagination";
import {
  IconEye,
  IconEdit,
  IconPlus,
  IconFilter,
  IconX,
} from "@tabler/icons-react";
import ProductDetailModal from "../../components/ui/product/ProductDetailModal";
import ProductForm from "../../components/ui/product/ProductForm";
import { toast } from "react-toastify";
import { useProduct } from "../../hooks/useProduct";
import { useBrand } from "../../hooks/useBrand";
import { useCategory } from "../../hooks/useCategory";

// const mockProducts = [
//   {
//     id: 1,
//     code: "SP001",
//     name: "Áo Thun Nam Basic",
//     description: "Áo thun cotton thoáng mát, thiết kế đơn giản",
//     price: 150000,
//     sale_price: 120000,
//     on_sale: true,
//     review_count: 12,
//     status: "ACTIVE",
//     created_at: "2024-04-01T08:00:00",
//     updated_at: "2024-04-10T15:30:00",
//     brand: { id: 1, name: "Nike", code: "NIKE" },
//     category: { id: 2, name: "Áo thun nam", code: "ATNAM" },
//     gender: "Nam", // Thêm trường giới tính
//     images: [{ id: 1, url: "/src/assets/product.avif", alt: "Áo thun nam" }],
//     variants: [
//       {
//         id: 1,
//         name: "Áo Thun Nam - Đỏ - Size M",
//         sku: "SP001-RED-M",
//         price: 150000,
//         sale_price: 120000,
//         stock_quantity: 50,
//         additional_price: 0,
//         status: "ACTIVE",
//         product_id: 1,
//         attributes: [
//           { name: "Màu sắc", value: "Đỏ" },
//           { name: "Kích thước", value: "M" },
//         ],
//       },
//       {
//         id: 11,
//         name: "Áo Thun Nam - Xanh - Size L",
//         sku: "SP001-BLUE-L",
//         price: 150000,
//         sale_price: 120000,
//         stock_quantity: 30,
//         additional_price: 0,
//         status: "ACTIVE",
//         product_id: 1,
//         attributes: [
//           { name: "Màu sắc", value: "Xanh" },
//           { name: "Kích thước", value: "L" },
//         ],
//       },
//     ],
//     specifications: [
//       { key: "Chất liệu", value: "Cotton 100%" },
//       { key: "Xuất xứ", value: "Việt Nam" },
//     ],
//   },
//   {
//     id: 2,
//     code: "SP002",
//     name: "Quần Jeans Slim Fit",
//     description: "Quần jeans nam cao cấp, form slim fit",
//     price: 350000,
//     sale_price: 350000,
//     on_sale: false,
//     review_count: 8,
//     status: "ACTIVE",
//     created_at: "2024-04-02T09:15:00",
//     updated_at: "2024-04-11T16:45:00",
//     brand: { id: 2, name: "Levi's", code: "LEVIS" },
//     category: { id: 3, name: "Quần jean nam", code: "QJNAM" },
//     gender: "Nam",
//     images: [{ id: 2, url: "/src/assets/product.avif", alt: "Quần jeans" }],
//     variants: [
//       {
//         id: 2,
//         name: "Quần Jeans - Xanh - Size 32",
//         sku: "SP002-BLUE-32",
//         price: 350000,
//         sale_price: 350000,
//         stock_quantity: 30,
//         additional_price: 0,
//         status: "ACTIVE",
//         product_id: 2,
//         attributes: [
//           { name: "Màu sắc", value: "Xanh" },
//           { name: "Kích thước", value: "32" },
//         ],
//       },
//       {
//         id: 12,
//         name: "Quần Jeans - Đen - Size 34",
//         sku: "SP002-BLACK-34",
//         price: 350000,
//         sale_price: 350000,
//         stock_quantity: 20,
//         additional_price: 0,
//         status: "ACTIVE",
//         product_id: 2,
//         attributes: [
//           { name: "Màu sắc", value: "Đen" },
//           { name: "Kích thước", value: "34" },
//         ],
//       },
//     ],
//     specifications: [
//       { key: "Chất liệu", value: "Denim 98% cotton, 2% spandex" },
//       { key: "Kiểu dáng", value: "Slim fit" },
//     ],
//   },
//   {
//     id: 3,
//     code: "SP003",
//     name: "Váy Maxi Nữ",
//     description: "Váy maxi nữ thanh lịch, phù hợp dạo phố",
//     price: 280000,
//     sale_price: 250000,
//     on_sale: true,
//     review_count: 15,
//     status: "ACTIVE",
//     created_at: "2024-04-03T10:30:00",
//     updated_at: "2024-04-12T14:20:00",
//     brand: { id: 3, name: "Zara", code: "ZARA" },
//     category: { id: 4, name: "Váy nữ", code: "VAYNU" },
//     gender: "Nữ",
//     images: [{ id: 3, url: "/src/assets/product.avif", alt: "Váy maxi" }],
//     variants: [
//       {
//         id: 3,
//         name: "Váy Maxi - Hồng - Size S",
//         sku: "SP003-PINK-S",
//         price: 280000,
//         sale_price: 250000,
//         stock_quantity: 25,
//         additional_price: 0,
//         status: "ACTIVE",
//         product_id: 3,
//         attributes: [
//           { name: "Màu sắc", value: "Hồng" },
//           { name: "Kích thước", value: "S" },
//         ],
//       },
//       {
//         id: 13,
//         name: "Váy Maxi - Trắng - Size M",
//         sku: "SP003-WHITE-M",
//         price: 280000,
//         sale_price: 250000,
//         stock_quantity: 15,
//         additional_price: 0,
//         status: "ACTIVE",
//         product_id: 3,
//         attributes: [
//           { name: "Màu sắc", value: "Trắng" },
//           { name: "Kích thước", value: "M" },
//         ],
//       },
//     ],
//     specifications: [
//       { key: "Chất liệu", value: "Polyester 100%" },
//       { key: "Xuất xứ", value: "Việt Nam" },
//     ],
//   },
//   {
//     id: 4,
//     code: "SP004",
//     name: "Giày Sneaker Unisex",
//     description: "Giày sneaker thời trang, phù hợp cho mọi giới tính",
//     price: 750000,
//     sale_price: 650000,
//     on_sale: true,
//     review_count: 22,
//     status: "ACTIVE",
//     created_at: "2024-04-04T11:15:00",
//     updated_at: "2024-04-13T16:30:00",
//     brand: { id: 1, name: "Nike", code: "NIKE" },
//     category: { id: 5, name: "Giày dép", code: "GIAYDEP" },
//     gender: "Unisex",
//     images: [{ id: 4, url: "/src/assets/product.avif", alt: "Giày sneaker" }],
//     variants: [
//       {
//         id: 4,
//         name: "Giày Sneaker - Trắng - Size 42",
//         sku: "SP004-WHITE-42",
//         price: 750000,
//         sale_price: 650000,
//         stock_quantity: 12,
//         additional_price: 0,
//         status: "ACTIVE",
//         product_id: 4,
//         attributes: [
//           { name: "Màu sắc", value: "Trắng" },
//           { name: "Kích thước", value: "42" },
//         ],
//       },
//       {
//         id: 14,
//         name: "Giày Sneaker - Đen - Size 40",
//         sku: "SP004-BLACK-40",
//         price: 750000,
//         sale_price: 650000,
//         stock_quantity: 8,
//         additional_price: 0,
//         status: "ACTIVE",
//         product_id: 4,
//         attributes: [
//           { name: "Màu sắc", value: "Đen" },
//           { name: "Kích thước", value: "40" },
//         ],
//       },
//     ],
//     specifications: [
//       { key: "Chất liệu", value: "Da tổng hợp" },
//       { key: "Xuất xứ", value: "Việt Nam" },
//     ],
//   },
// ];

// Mock data cho brands và categories
// const mockBrands = [
//   { id: 1, name: "Nike", code: "NIKE", active: true },
//   { id: 2, name: "Adidas", code: "ADIDAS", active: true },
//   { id: 3, name: "Levi's", code: "LEVIS", active: true },
//   { id: 4, name: "Zara", code: "ZARA", active: true },
// ];

// const mockCategories = [
//   { id: 1, name: "Thời trang nam", code: "TTNAM", active: true },
//   { id: 2, name: "Áo thun nam", code: "ATNAM", active: true },
//   { id: 3, name: "Quần jean nam", code: "QJNAM", active: true },
//   { id: 4, name: "Váy nữ", code: "VAYNU", active: true },
//   { id: 5, name: "Giày dép", code: "GIAYDEP", active: true },
// ];

export default function ProductPage() {
  const { products: getAllProducts, isLoading: isLoadingProducts } =
    useProduct();
  const { brands: getAllBrands, isLoading: isLoadingBrands } = useBrand();
  const { categories: getAllCategories, isLoading: isLoadingCategories } =
    useCategory();

  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Advanced filters
  const [filters, setFilters] = useState({
    priceRange: { min: "", max: "" },
    colors: [],
    sizes: [],
    gender: "all",
    brandIds: [],
    categoryIds: [],
  });

  const pageSize = 10;

  useEffect(() => {
    // Giả lập fetch API
    setProducts(getAllProducts || []);
    setBrands(getAllBrands || []);
    setCategories(getAllCategories || []);
  }, [isLoadingBrands, isLoadingCategories, isLoadingProducts]);

  // Lấy danh sách màu sắc từ variants
  const getAvailableColors = () => {
    const colors = new Set();
    products.forEach((product) => {
      product.variants?.forEach((variant) => {
        const colorAttr = variant.attributes?.find(
          (attr) => attr.name === "Màu sắc"
        );
        if (colorAttr) colors.add(colorAttr.value);
      });
    });
    return Array.from(colors).sort();
  };

  // Lấy danh sách kích cỡ từ variants
  const getAvailableSizes = () => {
    const sizes = new Set();
    products.forEach((product) => {
      product.variants?.forEach((variant) => {
        const sizeAttr = variant.attributes?.find(
          (attr) => attr.name === "Kích thước"
        );
        if (sizeAttr) sizes.add(sizeAttr.value);
      });
    });
    return Array.from(sizes).sort();
  };

  // Lấy danh sách giới tính
  const getAvailableGenders = () => {
    const genders = new Set();
    products.forEach((product) => {
      if (product.gender) genders.add(product.gender);
    });
    return Array.from(genders).sort();
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
    setCurrentPage(1); // Reset về trang đầu khi filter
  };

  // Xóa một filter cụ thể
  const removeFilter = (filterType, value = null) => {
    setFilters((prev) => {
      if (value !== null) {
        // Xóa một giá trị cụ thể trong array
        return {
          ...prev,
          [filterType]: prev[filterType].filter((v) => v !== value),
        };
      } else {
        // Xóa toàn bộ filter
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
      gender: "all",
      brandIds: [],
      categoryIds: [],
    });
    setStatusFilter("all");
    setSearch("");
  };

  // Kiểm tra sản phẩm có màu sắc không
  const productHasColor = (product, color) => {
    return product.variants?.some((variant) =>
      variant.attributes?.some(
        (attr) => attr.name === "Màu sắc" && attr.value === color
      )
    );
  };

  // Kiểm tra sản phẩm có kích cỡ không
  const productHasSize = (product, size) => {
    return product.variants?.some((variant) =>
      variant.attributes?.some(
        (attr) => attr.name === "Kích thước" && attr.value === size
      )
    );
  };

  // Lọc sản phẩm với tất cả filters
  const filteredProducts = products.filter((product) => {
    // Tìm kiếm theo tên hoặc mã
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.code.toLowerCase().includes(search.toLowerCase());

    // Lọc theo trạng thái
    const matchesStatus =
      statusFilter === "all" ||
      product.status.toLowerCase() === statusFilter.toLowerCase();

    // Lọc theo khoảng giá
    const matchesPriceRange = (() => {
      const { min, max } = filters.priceRange;
      const price = product.sale_price || product.price;
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

    // Lọc theo giới tính
    const matchesGender =
      filters.gender === "all" || product.gender === filters.gender;

    // Lọc theo thương hiệu
    const matchesBrands =
      filters.brandIds.length === 0 ||
      filters.brandIds.includes(product.brand?.id);

    // Lọc theo danh mục
    const matchesCategories =
      filters.categoryIds.length === 0 ||
      filters.categoryIds.includes(product.category?.id);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriceRange &&
      matchesColors &&
      matchesSizes &&
      matchesGender &&
      matchesBrands &&
      matchesCategories
    );
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
    if (filters.gender !== "all") count++;
    if (filters.brandIds.length > 0) count += filters.brandIds.length;
    if (filters.categoryIds.length > 0) count += filters.categoryIds.length;
    if (statusFilter !== "all") count++;
    return count;
  };

  // Xử lý tạo sản phẩm mới
  const handleCreateProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  // Xử lý chỉnh sửa sản phẩm
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  // Xử lý xem chi tiết sản phẩm
  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  // Xử lý submit form (tạo mới hoặc cập nhật)
  const handleFormSubmit = (formData) => {
    console.log("Form submitted:", formData);

    if (editingProduct) {
      // Cập nhật sản phẩm
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? {
                ...p,
                ...formData,
                id: editingProduct.id,
                updated_at: new Date().toISOString(),
                brand: brands.find((b) => b.id === formData.brand_id),
                category: categories.find((c) => c.id === formData.category_id),
              }
            : p
        )
      );
      toast.success("Cập nhật sản phẩm thành công!", {
        position: "top-right",
        autoClose: 3000,
      });
    } else {
      // Tạo sản phẩm mới
      const newProduct = {
        ...formData,
        id: Math.max(...products.map((p) => p.id)) + 1,
        review_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        brand: brands.find((b) => b.id === formData.brand_id),
        category: categories.find((c) => c.id === formData.category_id),
      };
      setProducts((prev) => [newProduct, ...prev]);
      toast.success("Tạo sản phẩm thành công!", {
        position: "top-right",
        autoClose: 3000,
      });
    }

    setShowForm(false);
    setEditingProduct(null);
  };

  // Đóng form
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " ₫";
  };

  // Format ngày tháng
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
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
    switch (status) {
      case "ACTIVE":
        return "Hoạt động";
      case "INACTIVE":
        return "Không hoạt động";
      case "OUT_OF_STOCK":
        return "Hết hàng";
      case "DISCONTINUED":
        return "Ngừng bán";
      default:
        return status;
    }
  };

  // Statistics calculation
  const stats = {
    total: products.length,
    active: products.filter((p) => p.status === "ACTIVE").length,
    inactive: products.filter((p) => p.status === "INACTIVE").length,
    outOfStock: products.filter((p) => p.status === "OUT_OF_STOCK").length,
    onSale: products.filter((p) => p.on_sale).length,
    totalValue: products.reduce((sum, p) => sum + (p.sale_price || p.price), 0),
  };

  // Get status label
  const getStatusLabel = (type) => {
    switch (type) {
      case "total":
        return "Tổng sản phẩm";
      case "activeCount":
        return "Đang hoạt động";
      case "inactiveCount":
        return "Không hoạt động";
      case "outOfStock":
        return "Hết hàng";
      case "onSale":
        return "Đang khuyến mãi";
      case "totalValue":
        return "Tổng giá trị";
      default:
        return "";
    }
  };

  if (isLoadingProducts || isLoadingBrands || isLoadingCategories) {
    return <div>Đang tải dữ liệu...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mb-6">Quản lý sản phẩm</h1>
        <button
          onClick={handleCreateProduct}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors cursor-pointer"
        >
          <IconPlus size={16} />
          Tạo sản phẩm
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {getStatusLabel("total")}
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {getStatusLabel("activeCount")}
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
                {getStatusLabel("inactiveCount")}
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
                {getStatusLabel("onSale")}
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
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc mã sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-4 py-2 flex-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
            <option value="out_of_stock">Hết hàng</option>
            <option value="discontinued">Ngừng bán</option>
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
            Bộ lọc
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
            <h3 className="font-semibold text-gray-700">Bộ lọc nâng cao</h3>
            <button
              onClick={clearAllFilters}
              className="text-red-600 hover:text-red-800 text-sm underlin cursor-pointer"
            >
              Xóa tất cả
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Khoảng giá
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Từ"
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
                  placeholder="Đến"
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

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giới tính
              </label>
              <select
                value={filters.gender}
                onChange={(e) => handleFilterChange("gender", e.target.value)}
                className="border rounded-lg px-3 py-2 w-full text-sm"
              >
                <option value="all">Tất cả</option>
                {getAvailableGenders().map((gender) => (
                  <option key={gender} value={gender}>
                    {gender}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thương hiệu
              </label>
              <select
                value=""
                onChange={(e) =>
                  e.target.value &&
                  handleFilterChange("brandIds", parseInt(e.target.value), true)
                }
                className="border rounded-lg px-3 py-2 w-full text-sm"
              >
                <option value="">Chọn thương hiệu</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Colors */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Màu sắc
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
              Kích cỡ
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
        </div>
      )}

      {/* Active Filters Display */}
      {getActiveFiltersCount() > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600">Đang lọc:</span>

            {/* Price Range */}
            {(filters.priceRange.min || filters.priceRange.max) && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                Giá:{" "}
                {filters.priceRange.min &&
                  `từ ${formatPrice(filters.priceRange.min)}`}{" "}
                {filters.priceRange.max &&
                  `đến ${formatPrice(filters.priceRange.max)}`}
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
                Màu: {color}
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
                Size: {size}
                <button
                  onClick={() => removeFilter("sizes", size)}
                  className="hover:text-green-600"
                >
                  <IconX size={12} />
                </button>
              </span>
            ))}

            {/* Gender */}
            {filters.gender !== "all" && (
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                Giới tính: {filters.gender}
                <button
                  onClick={() => removeFilter("gender")}
                  className="hover:text-yellow-600"
                >
                  <IconX size={12} />
                </button>
              </span>
            )}

            {/* Brands */}
            {filters.brandIds.map((brandId) => {
              const brand = brands.find((b) => b.id === brandId);
              return (
                brand && (
                  <span
                    key={brandId}
                    className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                  >
                    Thương hiệu: {brand.name}
                    <button
                      onClick={() => removeFilter("brandIds", brandId)}
                      className="hover:text-indigo-600"
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
                Trạng thái: {getStatusText(statusFilter.toUpperCase())}
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
        Hiển thị {paginatedProducts.length} trong tổng số{" "}
        {filteredProducts.length} sản phẩm
      </div>

      {/* Products Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-400">
              <th className="p-2">ID</th>
              <th className="p-2">Hình ảnh</th>
              <th className="p-2">Mã SP</th>
              <th className="p-2">Tên sản phẩm</th>
              <th className="p-2">Thương hiệu</th>
              <th className="p-2">Danh mục</th>
              <th className="p-2">Giới tính</th>
              <th className="p-2">Giá gốc</th>
              <th className="p-2">Giá KM</th>
              <th className="p-2">Trạng thái</th>
              <th className="p-2">Biến thể</th>
              <th className="p-2">Đánh giá</th>
              <th className="p-2">Ngày tạo</th>
              <th className="p-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{product.id}</td>
                  <td className="p-2">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0].url}
                        alt={product.images[0].alt}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No img</span>
                      </div>
                    )}
                  </td>
                  <td className="p-2 font-mono text-sm">{product.code}</td>
                  <td className="p-2">
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {product.description}
                      </div>
                    </div>
                  </td>
                  <td className="p-2">{product.brand?.name}</td>
                  <td className="p-2">{product.category?.name}</td>
                  <td className="p-2">
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                      {product.gender}
                    </span>
                  </td>
                  <td className="p-2 w-28 font-medium">
                    {formatPrice(product.price)}
                  </td>
                  <td className="p-2 w-28">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {formatPrice(product.sale_price)}
                      </span>
                      {product.on_sale && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs w-fit">
                          SALE
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-2 w-32">
                    <span
                      className={`px-2 py-1 rounded-full font-medium ${getStatusColor(
                        product.status
                      )}`}
                    >
                      {getStatusText(product.status)}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {product.variants?.length || 0}
                    </span>
                  </td>
                  <td className="p-2 text-center">{product.review_count}</td>
                  <td className="p-2 text-sm text-gray-600">
                    {formatDate(product.created_at)}
                  </td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button
                        className="text-blue-600 hover:text-blue-800 p-1 cursor-pointer"
                        onClick={() => handleViewProduct(product)}
                        title="Xem chi tiết"
                      >
                        <IconEye />
                      </button>
                      <button
                        className="text-yellow-600 hover:text-yellow-800 p-1 cursor-pointer"
                        onClick={() => handleEditProduct(product)}
                        title="Chỉnh sửa"
                      >
                        <IconEdit />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={14} className="text-center py-6 text-gray-500">
                  Không có sản phẩm nào phù hợp với bộ lọc.
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
      <ProductForm
        isOpen={showForm}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        product={editingProduct}
        brands={brands}
        categories={categories}
      />
    </div>
  );
}
