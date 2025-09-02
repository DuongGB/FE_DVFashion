import { useState, useEffect } from "react";
import {
  IconEdit,
  IconTrash,
  IconPlus,
  IconSearch,
  IconEye,
} from "@tabler/icons-react";
import { toast } from "react-toastify";
import Pagination from "../../components/common/Pagination";
import BrandForm from "../../components/ui/brand/BrandForm";
import BrandDetailModal from "../../components/ui/brand/BrandDetailModal";
import { showConfirmationToast } from "../../utils/showConfirmationToast";

// Translations for status labels
const statusLabels = {
  vi: {
    active: "Hoạt động",
    inactive: "Không hoạt động",
    total: "Tổng thương hiệu",
    activeCount: "Đang hoạt động",
    inactiveCount: "Không hoạt động",
    allStatus: "Tất cả trạng thái",
    vietnamese: "Tiếng Việt",
    english: "Tiếng Anh",
  },
  en: {
    active: "Active",
    inactive: "Inactive",
    total: "Total Brands",
    activeCount: "Active",
    inactiveCount: "Inactive",
    allStatus: "All Status",
    vietnamese: "Vietnamese",
    english: "English",
  },
};

// Mock data theo cấu trúc class diagram
const mockBrands = [
  {
    id: 1,
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg",
    active: true,
    products: [],
    translations: [
      {
        id: 1,
        language: "vi",
        name: "Nike",
        description: "Thương hiệu thể thao nổi tiếng",
        brand: null,
      },
      {
        id: 2,
        language: "en",
        name: "Nike",
        description: "Famous sports brand",
        brand: null,
      },
    ],
  },
  {
    id: 2,
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg",
    active: false,
    products: [],
    translations: [
      {
        id: 3,
        language: "vi",
        name: "Adidas",
        description: "Thương hiệu thời trang thể thao",
        brand: null,
      },
      {
        id: 4,
        language: "en",
        name: "Adidas",
        description: "Sports fashion brand",
        brand: null,
      },
    ],
  },
  {
    id: 3,
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Gucci_logo.png",
    active: true,
    products: [],
    translations: [
      {
        id: 5,
        language: "vi",
        name: "Gucci",
        description: "Thương hiệu thời trang cao cấp",
        brand: null,
      },
      {
        id: 6,
        language: "en",
        name: "Gucci",
        description: "Luxury fashion brand",
        brand: null,
      },
    ],
  },
  {
    id: 4,
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Zara_Logo.svg",
    active: true,
    products: [],
    translations: [
      {
        id: 7,
        language: "vi",
        name: "Zara",
        description: "Thời trang nhanh",
        brand: null,
      },
      {
        id: 8,
        language: "en",
        name: "Zara",
        description: "Fast fashion",
        brand: null,
      },
    ],
  },
  {
    id: 5,
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/UNIQLO_logo.svg/772px-UNIQLO_logo.svg.png",
    active: false,
    products: [],
    translations: [
      {
        id: 9,
        language: "vi",
        name: "Uniqlo",
        description: "Thời trang Nhật Bản",
        brand: null,
      },
      {
        id: 10,
        language: "en",
        name: "Uniqlo",
        description: "Japanese fashion",
        brand: null,
      },
    ],
  },
  {
    id: 6,
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/53/H%26M-Logo.svg",
    active: true,
    products: [],
    translations: [
      {
        id: 11,
        language: "vi",
        name: "H&M",
        description: "Thời trang nhanh toàn cầu",
        brand: null,
      },
      {
        id: 12,
        language: "en",
        name: "H&M",
        description: "Global fast fashion",
        brand: null,
      },
    ],
  },
  {
    id: 7,
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/76/Louis_Vuitton_logo_and_wordmark.svg",
    active: true,
    products: [],
    translations: [
      {
        id: 13,
        language: "vi",
        name: "Louis Vuitton",
        description: "Thương hiệu xa xỉ",
        brand: null,
      },
      {
        id: 14,
        language: "en",
        name: "Louis Vuitton",
        description: "Luxury brand",
        brand: null,
      },
    ],
  },
  {
    id: 8,
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIYZoN-v60qelJBrnr9iXZPNLjfta92YHTkA&s",
    active: false,
    products: [],
    translations: [
      {
        id: 15,
        language: "vi",
        name: "Puma",
        description: "Thương hiệu thể thao và thời trang",
        brand: null,
      },
      {
        id: 16,
        language: "en",
        name: "Puma",
        description: "Sports and fashion brand",
        brand: null,
      },
    ],
  },
  {
    id: 9,
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsjNwYqUfsd2OhUfcQo0XSEollFpf-0W1HlA&s",
    active: true,
    products: [],
    translations: [
      {
        id: 17,
        language: "vi",
        name: "Reebok",
        description: "Thương hiệu thể thao và giày dép",
        brand: null,
      },
      {
        id: 18,
        language: "en",
        name: "Reebok",
        description: "Sports and footwear brand",
        brand: null,
      },
    ],
  },
  {
    id: 10,
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/e1/The_North_Face.png",
    active: true,
    products: [],
    translations: [
      {
        id: 19,
        language: "vi",
        name: "The North Face",
        description: "Thời trang và thiết bị ngoài trời",
        brand: null,
      },
      {
        id: 20,
        language: "en",
        name: "The North Face",
        description: "Outdoor fashion and equipment",
        brand: null,
      },
    ],
  },
  {
    id: 11,
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Under_armour_logo.svg",
    active: false,
    products: [],
    translations: [
      {
        id: 21,
        language: "vi",
        name: "Under Armour",
        description: "Thương hiệu thể thao và đồ tập luyện",
        brand: null,
      },
      {
        id: 22,
        language: "en",
        name: "Under Armour",
        description: "Sports and training apparel brand",
        brand: null,
      },
    ],
  },
  {
    id: 12,
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/New_Balance_logo.svg/2560px-New_Balance_logo.svg.png",
    active: true,
    products: [],
    translations: [
      {
        id: 23,
        language: "vi",
        name: "New Balance",
        description: "Thương hiệu giày dép và thể thao",
        brand: null,
      },
      {
        id: 24,
        language: "en",
        name: "New Balance",
        description: "Footwear and sports brand",
        brand: null,
      },
    ],
  },
  {
    id: 13,
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Logomarca_da_VANS.png",
    active: true,
    products: [],
    translations: [
      {
        id: 25,
        language: "vi",
        name: "Vans",
        description: "Thương hiệu giày dép và thời trang đường phố",
        brand: null,
      },
      {
        id: 26,
        language: "en",
        name: "Vans",
        description: "Footwear and streetwear brand",
        brand: null,
      },
    ],
  },
];

export default function BrandPage() {
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("vi");
  const pageSize = 10;

  useEffect(() => {
    // Giả lập fetch API
    setLoading(true);
    setTimeout(() => {
      setBrands(mockBrands);
      setLoading(false);
    }, 500);
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // Helper function to get translation by language
  const getTranslation = (brand, lang = language) => {
    return (
      brand.translations.find((t) => t.language === lang) ||
      brand.translations[0]
    );
  };

  // Helper function to get status labels
  const getStatusLabel = (key) => {
    return statusLabels[language][key] || statusLabels.vi[key];
  };

  // Lọc thương hiệu
  const filteredBrands = brands.filter((brand) => {
    const translation = getTranslation(brand);
    const matchesSearch =
      translation.name.toLowerCase().includes(search.toLowerCase()) ||
      translation.description.toLowerCase().includes(search.toLowerCase()) ||
      brand.id.toString().includes(search);

    const matchesStatus =
      !statusFilter ||
      (statusFilter === "active" && brand.active) ||
      (statusFilter === "inactive" && !brand.active);

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredBrands.length / pageSize);
  const paginatedBrands = filteredBrands.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handle actions
  const handleViewDetail = (brand) => {
    setSelectedBrand(brand);
    setShowDetailModal(true);
  };

  const handleEdit = (brand) => {
    setSelectedBrand(brand);
    setShowEditModal(true);
  };

  const handleCreate = () => {
    setSelectedBrand(null);
    setShowEditModal(true);
  };

  const handleToggleStatus = async (brandId) => {
    const brand = brands.find((b) => b.id === brandId);
    const translation = getTranslation(brand);
    const action = brand.active
      ? language === "vi"
        ? "vô hiệu hóa"
        : "deactivate"
      : language === "vi"
      ? "kích hoạt"
      : "activate";

    const confirmText = brand.active
      ? language === "vi"
        ? "Vô hiệu hóa"
        : "Deactivate"
      : language === "vi"
      ? "Kích hoạt"
      : "Activate";

    const cancelText = language === "vi" ? "Hủy" : "Cancel";

    showConfirmationToast({
      title:
        language === "vi"
          ? `Xác nhận ${action} thương hiệu`
          : `Confirm ${action} brand`,
      message:
        language === "vi"
          ? `Bạn có chắc chắn muốn ${action} thương hiệu "${translation.name}" không?`
          : `Are you sure you want to ${action} brand "${translation.name}"?`,
      confirmText,
      cancelText,
      confirmButtonClass: brand.active
        ? "bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors cursor-pointer"
        : "bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors cursor-pointer",
      onConfirm: async () => {
        try {
          // API call to toggle status
          setBrands((prev) =>
            prev.map((b) =>
              b.id === brandId ? { ...b, active: !b.active } : b
            )
          );
          const successMessage = brand.active
            ? language === "vi"
              ? "Vô hiệu hóa thương hiệu thành công!"
              : "Brand deactivated successfully!"
            : language === "vi"
            ? "Kích hoạt thương hiệu thành công!"
            : "Brand activated successfully!";

          toast.success(successMessage);
        } catch (error) {
          console.error("Error toggling brand status:", error);
          const errorMessage =
            language === "vi"
              ? `Có lỗi xảy ra khi ${action} thương hiệu!`
              : `Error occurred while ${action} brand!`;
          toast.error(errorMessage);
        }
      },
    });
  };

  const handleDelete = async (brandId) => {
    const brand = brands.find((b) => b.id === brandId);
    const translation = getTranslation(brand);

    // Kiểm tra nếu thương hiệu đã bị vô hiệu hóa
    if (!brand.active) {
      const message =
        language === "vi"
          ? "Thương hiệu này đã được vô hiệu hóa!"
          : "This brand is already deactivated!";
      toast.warning(message);
      return;
    }

    showConfirmationToast({
      title:
        language === "vi" ? "Xác nhận xóa thương hiệu" : "Confirm delete brand",
      message:
        language === "vi"
          ? `Bạn có chắc chắn muốn xóa thương hiệu "${translation.name}" không? Thương hiệu sẽ được chuyển sang trạng thái không hoạt động.`
          : `Are you sure you want to delete brand "${translation.name}"? The brand will be deactivated.`,
      confirmText: language === "vi" ? "Xóa" : "Delete",
      cancelText: language === "vi" ? "Hủy" : "Cancel",
      confirmButtonClass:
        "bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors cursor-pointer",
      onConfirm: async () => {
        try {
          // API call to deactivate brand instead of deleting
          setBrands((prev) =>
            prev.map((b) => (b.id === brandId ? { ...b, active: false } : b))
          );
          const successMessage =
            language === "vi"
              ? "Vô hiệu hóa thương hiệu thành công!"
              : "Brand deactivated successfully!";
          toast.success(successMessage);
        } catch (error) {
          console.error("Error deactivating brand:", error);
          const errorMessage =
            language === "vi"
              ? "Có lỗi xảy ra khi vô hiệu hóa thương hiệu!"
              : "Error occurred while deactivating brand!";
          toast.error(errorMessage);
        }
      },
    });
  };

  const handleSubmitBrand = async (brandData) => {
    try {
      if (selectedBrand) {
        // Update existing brand
        setBrands((prev) =>
          prev.map((b) =>
            b.id === selectedBrand.id ? { ...b, ...brandData } : b
          )
        );
        const successMessage =
          language === "vi"
            ? "Cập nhật thương hiệu thành công!"
            : "Brand updated successfully!";
        toast.success(successMessage);
      } else {
        // Create new brand
        const newBrand = {
          id: Math.max(...brands.map((b) => b.id)) + 1,
          ...brandData,
          products: [],
        };
        setBrands((prev) => [newBrand, ...prev]);
        const successMessage =
          language === "vi"
            ? "Tạo thương hiệu thành công!"
            : "Brand created successfully!";
        toast.success(successMessage);
      }
      setShowEditModal(false);
      setSelectedBrand(null);
    } catch (error) {
      console.error("Error submitting brand:", error);
      const errorMessage =
        language === "vi"
          ? "Có lỗi xảy ra khi lưu thương hiệu!"
          : "Error occurred while saving brand!";
      toast.error(errorMessage);
      throw error;
    }
  };

  // Calculate statistics
  const stats = {
    total: brands.length,
    active: brands.filter((b) => b.active).length,
    inactive: brands.filter((b) => !b.active).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {language === "vi" ? "Quản lý thương hiệu" : "Brand Management"}
        </h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <IconPlus size={20} />
          {language === "vi" ? "Tạo thương hiệu" : "Create Brand"}
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <IconSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder={
                  language === "vi"
                    ? "Tìm kiếm theo tên, mô tả, ID..."
                    : "Search by name, description, ID..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{getStatusLabel("allStatus")}</option>
              <option value="active">{getStatusLabel("activeCount")}</option>
              <option value="inactive">
                {getStatusLabel("inactiveCount")}
              </option>
            </select>
          </div>

          {/* Language Filter */}
          <div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="vi">{getStatusLabel("vietnamese")}</option>
              <option value="en">{getStatusLabel("english")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-600">
        {language === "vi"
          ? `Hiển thị ${paginatedBrands.length} trên tổng số ${filteredBrands.length} thương hiệu`
          : `Showing ${paginatedBrands.length} of ${filteredBrands.length} brands`}
      </div>

      {/* Brands Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-400">
              <th className="p-3">ID</th>
              <th className="p-3">{language === "vi" ? "Logo" : "Logo"}</th>
              <th className="p-3">
                {language === "vi" ? "Tên thương hiệu" : "Brand Name"}
              </th>
              <th className="p-3">
                {language === "vi" ? "Mô tả" : "Description"}
              </th>
              <th className="p-3">
                {language === "vi" ? "Số sản phẩm" : "Products"}
              </th>
              <th className="p-3">
                {language === "vi" ? "Trạng thái" : "Status"}
              </th>
              <th className="p-3">
                {language === "vi" ? "Hành động" : "Actions"}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center text-gray-500 p-4">
                  {language === "vi" ? "Đang tải..." : "Loading..."}
                </td>
              </tr>
            ) : paginatedBrands.length > 0 ? (
              paginatedBrands.map((brand) => {
                const translation = getTranslation(brand);
                return (
                  <tr key={brand.id} className="border-b hover:bg-gray-300">
                    <td className="p-3">{brand.id}</td>

                    <td className="p-3">
                      <img
                        src={brand.logo || ""}
                        alt={translation.name}
                        className="h-8 w-auto object-contain"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    </td>

                    <td className="p-3">
                      <div>
                        <p className="font-semibold">{translation.name}</p>
                        <p className="text-xs text-gray-500">
                          {getStatusLabel(
                            language === "vi" ? "vietnamese" : "english"
                          )}
                        </p>
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="max-w-xs">
                        <p
                          className="text-sm truncate"
                          title={translation.description}
                        >
                          {translation.description}
                        </p>
                      </div>
                    </td>

                    <td className="p-3">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {brand.products.length}
                      </span>
                    </td>

                    <td className="p-3">
                      <button
                        onClick={() => handleToggleStatus(brand.id)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          brand.active
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                      >
                        {brand.active
                          ? getStatusLabel("active")
                          : getStatusLabel("inactive")}
                      </button>
                    </td>

                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetail(brand)}
                          className="text-blue-600 hover:text-blue-800 cursor-pointer"
                          title={
                            language === "vi" ? "Xem chi tiết" : "View Details"
                          }
                        >
                          <IconEye size={24} />
                        </button>
                        <button
                          onClick={() => handleEdit(brand)}
                          className="text-yellow-600 hover:text-yellow-800 cursor-pointer"
                          title={language === "vi" ? "Chỉnh sửa" : "Edit"}
                        >
                          <IconEdit size={24} />
                        </button>
                        <button
                          onClick={() => handleDelete(brand.id)}
                          className={`text-red-600 hover:text-red-800 cursor-pointer ${
                            !brand.active ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                          disabled={!brand.active}
                          title={
                            language === "vi"
                              ? brand.active
                                ? "Vô hiệu hóa thương hiệu"
                                : "Thương hiệu đã bị vô hiệu hóa"
                              : brand.active
                              ? "Deactivate brand"
                              : "Brand already deactivated"
                          }
                        >
                          <IconTrash size={24} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="text-center text-gray-500 p-4">
                  {language === "vi"
                    ? "Không có thương hiệu nào."
                    : "No brands found."}
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
        onPageChange={setCurrentPage}
      />

      {/* Brand Detail Modal */}
      <BrandDetailModal
        brand={selectedBrand}
        open={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedBrand(null);
        }}
      />

      {/* Brand Form Modal */}
      <BrandForm
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedBrand(null);
        }}
        onSubmit={handleSubmitBrand}
        brand={selectedBrand}
      />
    </div>
  );
}
