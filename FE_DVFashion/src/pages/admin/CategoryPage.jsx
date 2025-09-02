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
import CategoryForm from "../../components/ui/category/CategoryForm";
import CategoryDetailModal from "../../components/ui/category/CategoryDetailModal";
import { showConfirmationToast } from "../../utils/showConfirmationToast";

// Translations for status labels
const statusLabels = {
  vi: {
    active: "Hoạt động",
    inactive: "Không hoạt động",
    total: "Tổng danh mục",
    activeCount: "Đang hoạt động",
    inactiveCount: "Không hoạt động",
    allStatus: "Tất cả trạng thái",
    vietnamese: "Tiếng Việt",
    english: "Tiếng Anh",
  },
  en: {
    active: "Active",
    inactive: "Inactive",
    total: "Total Categories",
    activeCount: "Active",
    inactiveCount: "Inactive",
    allStatus: "All Status",
    vietnamese: "Vietnamese",
    english: "English",
  },
};

// Mock data với structure theo class diagram
const mockCategories = [
  {
    id: 1,
    image: "",
    active: true,
    products: [],
    translations: [
      {
        id: 1,
        language: "vi",
        name: "Áo",
        description: "Các loại áo thời trang",
        category: null,
      },
      {
        id: 2,
        language: "en",
        name: "Shirts",
        description: "Fashion shirts collection",
        category: null,
      },
    ],
  },
  {
    id: 2,
    image: "",
    active: false,
    products: [],
    translations: [
      {
        id: 3,
        language: "vi",
        name: "Quần",
        description: "Các loại quần thời trang",
        category: null,
      },
      {
        id: 4,
        language: "en",
        name: "Pants",
        description: "Fashion pants collection",
        category: null,
      },
    ],
  },
  {
    id: 3,
    image: "",
    active: true,
    products: [],
    translations: [
      {
        id: 5,
        language: "vi",
        name: "Váy",
        description: "Các loại váy thời trang",
        category: null,
      },
      {
        id: 6,
        language: "en",
        name: "Dresses",
        description: "Fashion dresses collection",
        category: null,
      },
    ],
  },
  {
    id: 4,
    image: "",
    active: true,
    products: [],
    translations: [
      {
        id: 7,
        language: "vi",
        name: "Giày",
        description: "Các loại giày thời trang",
        category: null,
      },
      {
        id: 8,
        language: "en",
        name: "Shoes",
        description: "Fashion shoes collection",
        category: null,
      },
    ],
  },
  {
    id: 5,
    image: "",
    active: false,
    products: [],
    translations: [
      {
        id: 9,
        language: "vi",
        name: "Phụ kiện",
        description: "Các loại phụ kiện thời trang",
        category: null,
      },
      {
        id: 10,
        language: "en",
        name: "Accessories",
        description: "Fashion accessories collection",
        category: null,
      },
    ],
  },
  {
    id: 6,
    image: "",
    active: true,
    products: [],
    translations: [
      {
        id: 11,
        language: "vi",
        name: "Đồ lót",
        description: "Các loại đồ lót",
        category: null,
      },
      {
        id: 12,
        language: "en",
        name: "Underwear",
        description: "Underwear collection",
        category: null,
      },
    ],
  },
  {
    id: 7,
    image: "",
    active: true,
    products: [],
    translations: [
      {
        id: 13,
        language: "vi",
        name: "Áo khoác",
        description: "Các loại áo khoác",
        category: null,
      },
      {
        id: 14,
        language: "en",
        name: "Jackets",
        description: "Jackets collection",
        category: null,
      },
    ],
  },
  {
    id: 8,
    image: "",
    active: false,
    products: [],
    translations: [
      {
        id: 15,
        language: "vi",
        name: "Đồ thể thao",
        description: "Các loại đồ thể thao",
        category: null,
      },
      {
        id: 16,
        language: "en",
        name: "Sportswear",
        description: "Sportswear collection",
        category: null,
      },
    ],
  },
];

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("vi"); // Ngôn ngữ hiển thị
  const pageSize = 10;

  useEffect(() => {
    // Giả lập fetch API
    setLoading(true);
    setTimeout(() => {
      setCategories(mockCategories);
      setLoading(false);
    }, 500);
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // Helper function to get translation by language
  const getTranslation = (category, lang = language) => {
    return (
      category.translations.find((t) => t.language === lang) ||
      category.translations[0]
    );
  };

  // Helper function to get status labels
  const getStatusLabel = (key) => {
    return statusLabels[language][key] || statusLabels.vi[key];
  };

  // Lọc danh mục
  const filteredCategories = categories.filter((category) => {
    const translation = getTranslation(category);
    const matchesSearch =
      translation.name.toLowerCase().includes(search.toLowerCase()) ||
      translation.description.toLowerCase().includes(search.toLowerCase()) ||
      category.id.toString().includes(search);

    const matchesStatus =
      !statusFilter ||
      (statusFilter === "active" && category.active) ||
      (statusFilter === "inactive" && !category.active);

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredCategories.length / pageSize);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handle actions
  const handleViewDetail = (category) => {
    setSelectedCategory(category);
    setShowDetailModal(true);
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  const handleCreate = () => {
    setSelectedCategory(null);
    setShowEditModal(true);
  };

  const handleToggleStatus = async (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    const translation = getTranslation(category);
    const action = category.active
      ? language === "vi"
        ? "vô hiệu hóa"
        : "deactivate"
      : language === "vi"
      ? "kích hoạt"
      : "activate";

    const confirmText = category.active
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
          ? `Xác nhận ${action} danh mục`
          : `Confirm ${action} category`,
      message:
        language === "vi"
          ? `Bạn có chắc chắn muốn ${action} danh mục "${translation.name}" không?`
          : `Are you sure you want to ${action} category "${translation.name}"?`,
      confirmText,
      cancelText,
      confirmButtonClass: category.active
        ? "bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors cursor-pointer"
        : "bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors cursor-pointer",
      onConfirm: async () => {
        try {
          // API call to toggle status
          setCategories((prev) =>
            prev.map((c) =>
              c.id === categoryId ? { ...c, active: !c.active } : c
            )
          );
          const successMessage = category.active
            ? language === "vi"
              ? "Vô hiệu hóa danh mục thành công!"
              : "Category deactivated successfully!"
            : language === "vi"
            ? "Kích hoạt danh mục thành công!"
            : "Category activated successfully!";

          toast.success(successMessage);
        } catch (error) {
          console.error("Error toggling category status:", error);
          const errorMessage =
            language === "vi"
              ? `Có lỗi xảy ra khi ${action} danh mục!`
              : `Error occurred while ${action} category!`;
          toast.error(errorMessage);
        }
      },
    });
  };

  const handleDelete = async (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    const translation = getTranslation(category);

    showConfirmationToast({
      title:
        language === "vi" ? "Xác nhận xóa danh mục" : "Confirm delete category",
      message:
        language === "vi"
          ? `Bạn có chắc chắn muốn xóa danh mục "${translation.name}" không? Hành động này không thể hoàn tác.`
          : `Are you sure you want to delete category "${translation.name}"? This action cannot be undone.`,
      confirmText: language === "vi" ? "Xóa" : "Delete",
      cancelText: language === "vi" ? "Hủy" : "Cancel",
      confirmButtonClass:
        "bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors cursor-pointer",
      onConfirm: async () => {
        try {
          // API call to delete category
          setCategories((prev) =>
            prev.map((c) => (c.id === categoryId ? { ...c, active: false } : c))
          );
          const successMessage =
            language === "vi"
              ? "Xóa danh mục thành công!"
              : "Category deleted successfully!";
          toast.success(successMessage);
        } catch (error) {
          console.error("Error deleting category:", error);
          const errorMessage =
            language === "vi"
              ? "Có lỗi xảy ra khi xóa danh mục!"
              : "Error occurred while deleting category!";
          toast.error(errorMessage);
        }
      },
    });
  };

  const handleSubmitCategory = async (categoryData) => {
    try {
      if (selectedCategory) {
        // Update existing category
        setCategories((prev) =>
          prev.map((c) =>
            c.id === selectedCategory.id ? { ...c, ...categoryData } : c
          )
        );
        const successMessage =
          language === "vi"
            ? "Cập nhật danh mục thành công!"
            : "Category updated successfully!";
        toast.success(successMessage);
      } else {
        // Create new category
        const newCategory = {
          id: Math.max(...categories.map((c) => c.id)) + 1,
          ...categoryData,
          products: [],
        };
        setCategories((prev) => [newCategory, ...prev]);
        const successMessage =
          language === "vi"
            ? "Tạo danh mục thành công!"
            : "Category created successfully!";
        toast.success(successMessage);
      }
      setShowEditModal(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error("Error submitting category:", error);
      const errorMessage =
        language === "vi"
          ? "Có lỗi xảy ra khi lưu danh mục!"
          : "Error occurred while saving category!";
      toast.error(errorMessage);
      throw error;
    }
  };

  // Calculate statistics
  const stats = {
    total: categories.length,
    active: categories.filter((c) => c.active).length,
    inactive: categories.filter((c) => !c.active).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {language === "vi" ? "Quản lý danh mục" : "Category Management"}
        </h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <IconPlus size={20} />
          {language === "vi" ? "Tạo danh mục" : "Create Category"}
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

      {/* Categories Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-400">
              <th className="p-3">ID</th>
              <th className="p-3">
                {language === "vi" ? "Hình ảnh" : "Image"}
              </th>
              <th className="p-3">
                {language === "vi" ? "Tên danh mục" : "Category Name"}
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
            ) : paginatedCategories.length > 0 ? (
              paginatedCategories.map((category) => {
                const translation = getTranslation(category);
                return (
                  <tr key={category.id} className="border-b hover:bg-gray-300">
                    <td className="p-3">{category.id}</td>

                    <td className="p-3">
                      <img
                        src={category.image || ""}
                        alt={translation.name}
                        className="w-10 h-10 rounded object-cover"
                        onError={(e) => (e.target.src = "")}
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
                        {category.products.length}
                      </span>
                    </td>

                    <td className="p-3">
                      <button
                        onClick={() => handleToggleStatus(category.id)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          category.active
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                      >
                        {category.active
                          ? getStatusLabel("active")
                          : getStatusLabel("inactive")}
                      </button>
                    </td>

                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetail(category)}
                          className="text-blue-600 hover:text-blue-800 cursor-pointer"
                          title={
                            language === "vi" ? "Xem chi tiết" : "View Details"
                          }
                        >
                          <IconEye size={24} />
                        </button>
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-yellow-600 hover:text-yellow-800 cursor-pointer"
                          title={language === "vi" ? "Chỉnh sửa" : "Edit"}
                        >
                          <IconEdit size={24} />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600 hover:text-red-800 cursor-pointer"
                          title={language === "vi" ? "Xóa" : "Delete"}
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
                    ? "Không có danh mục nào."
                    : "No categories found."}
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

      {/* Category Detail Modal */}
      <CategoryDetailModal
        category={selectedCategory}
        open={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedCategory(null);
        }}
      />

      {/* Category Form Modal */}
      <CategoryForm
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCategory(null);
        }}
        onSubmit={handleSubmitCategory}
        category={selectedCategory}
      />
    </div>
  );
}
