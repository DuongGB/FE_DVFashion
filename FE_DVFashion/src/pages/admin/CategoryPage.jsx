import { useState, useEffect, useMemo } from "react";
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
import { useCategory } from "../../hooks/useCategory";

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

export default function CategoryPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [language, setLanguage] = useState("VI");
  const [loadingItems, setLoadingItems] = useState({
    status: null,
    delete: null,
  });
  const [originalOrder, setOriginalOrder] = useState([]); // Store original order
  const pageSize = 10;

  // Use the category hook
  const { categories, isLoading, error, update, deleteCategory } =
    useCategory(language);

  // Store original order when categories first load
  useEffect(() => {
    if (categories && categories.length > 0) {
      setOriginalOrder((prev) => {
        // Only set if empty or length changed significantly
        if (
          prev.length === 0 ||
          Math.abs(prev.length - categories.length) > 1
        ) {
          return categories.map((cat) => cat.id);
        }
        return prev;
      });
    }
  }, [categories]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // Helper function to get status labels
  const getStatusLabel = (key) => {
    const langKey = language === "VI" ? "vi" : "en";
    return statusLabels[langKey][key] || statusLabels.vi[key];
  };

  // Sort categories by original order to maintain position
  const sortedCategories = useMemo(() => {
    if (!categories || originalOrder.length === 0) return categories || [];

    return [...categories].sort((a, b) => {
      const indexA = originalOrder.indexOf(a.id);
      const indexB = originalOrder.indexOf(b.id);

      // If both items are in original order
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }

      // If only one is in original order, prioritize it
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      // If neither is in original order, sort by ID
      return a.id - b.id;
    });
  }, [categories, originalOrder]);

  // Filter categories with stable sorting
  const filteredCategories = useMemo(() => {
    return sortedCategories.filter((category) => {
      const matchesSearch =
        category.name.toLowerCase().includes(search.toLowerCase()) ||
        category.description.toLowerCase().includes(search.toLowerCase()) ||
        category.id.toString().includes(search);

      const matchesStatus =
        !statusFilter ||
        (statusFilter === "active" && category.active) ||
        (statusFilter === "inactive" && !category.active);

      return matchesSearch && matchesStatus;
    });
  }, [sortedCategories, search, statusFilter]);

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

  // Handle toggle status with position preservation
  const handleToggleStatus = async (category) => {
    const newStatus = !category.active;
    const langKey = language === "VI" ? "vi" : "en";
    const actionText = newStatus
      ? langKey === "vi"
        ? "kích hoạt lại"
        : "activate"
      : langKey === "vi"
      ? "vô hiệu hóa"
      : "deactivate";

    const confirmText = newStatus
      ? langKey === "vi"
        ? "Kích hoạt"
        : "Activate"
      : langKey === "vi"
      ? "Vô hiệu hóa"
      : "Deactivate";

    const cancelText = langKey === "vi" ? "Hủy" : "Cancel";

    const title =
      langKey === "vi"
        ? `Xác nhận ${actionText} danh mục`
        : `Confirm ${actionText} category`;

    const message =
      langKey === "vi"
        ? `Bạn có chắc chắn muốn ${actionText} danh mục "${category.name}" không?`
        : `Are you sure you want to ${actionText} category "${category.name}"?`;

    showConfirmationToast({
      title,
      message,
      confirmText,
      cancelText,
      confirmButtonClass: `${
        newStatus
          ? "bg-green-600 hover:bg-green-700"
          : "bg-red-600 hover:bg-red-700"
      } text-white px-3 py-1 rounded transition-colors cursor-pointer`,
      onConfirm: async () => {
        // Set loading state
        setLoadingItems((prev) => ({ ...prev, status: category.id }));

        try {
          const categoryData = new FormData();
          const categoryRequest = {
            name: category.name,
            description: category.description,
            active: newStatus,
          };

          categoryData.append(
            "category",
            new Blob([JSON.stringify(categoryRequest)], {
              type: "application/json",
            })
          );

          await update({
            categoryId: category.id,
            categoryData,
            lang: language,
          });

          const successMessage =
            langKey === "vi"
              ? `${
                  newStatus ? "Kích hoạt lại" : "Vô hiệu hóa"
                } danh mục thành công!`
              : `Category ${
                  newStatus ? "activated" : "deactivated"
                } successfully!`;

          toast.success(successMessage);
        } catch (error) {
          console.error("Error updating category status:", error);
          const errorMessage =
            langKey === "vi"
              ? `Có lỗi xảy ra khi ${actionText} danh mục!`
              : `Error occurred while ${actionText.replace(
                  " ",
                  "ing"
                )} category!`;
          toast.error(errorMessage);
        } finally {
          // Clear loading state
          setLoadingItems((prev) => ({ ...prev, status: null }));
        }
      },
    });
  };

  // Handle delete
  const handleDelete = async (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return;

    const langKey = language === "VI" ? "vi" : "en";
    const confirmText = langKey === "vi" ? "Xóa" : "Delete";
    const cancelText = langKey === "vi" ? "Hủy" : "Cancel";

    const title =
      langKey === "vi" ? "Xác nhận xóa danh mục" : "Confirm delete category";
    const message =
      langKey === "vi"
        ? `Bạn có chắc chắn muốn xóa danh mục "${category.name}" không? Hành động này không thể hoàn tác.`
        : `Are you sure you want to delete category "${category.name}"? This action cannot be undone.`;

    showConfirmationToast({
      title,
      message,
      confirmText,
      cancelText,
      confirmButtonClass:
        "bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors cursor-pointer",
      onConfirm: async () => {
        setLoadingItems((prev) => ({ ...prev, delete: categoryId }));

        try {
          await deleteCategory(categoryId);

          // Remove from original order when deleted
          setOriginalOrder((prev) => prev.filter((id) => id !== categoryId));

          const successMessage =
            langKey === "vi"
              ? "Xóa danh mục thành công!"
              : "Category deleted successfully!";
          toast.success(successMessage);
        } catch (error) {
          console.error("Error deleting category:", error);
          const errorMessage =
            langKey === "vi"
              ? "Có lỗi xảy ra khi xóa danh mục!"
              : "Error occurred while deleting category!";
          toast.error(errorMessage);
        } finally {
          setLoadingItems((prev) => ({ ...prev, delete: null }));
        }
      },
    });
  };

  // Calculate statistics
  const stats = {
    total: sortedCategories?.length || 0,
    active: sortedCategories?.filter((c) => c.active).length || 0,
    inactive: sortedCategories?.filter((c) => !c.active).length || 0,
  };

  // Handle error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-red-500 text-lg">
            {language === "VI"
              ? "Có lỗi xảy ra khi tải danh sách danh mục"
              : "Error loading categories"}
          </p>
          <p className="text-gray-500 mt-2">
            {error.message ||
              (language === "VI"
                ? "Vui lòng thử lại sau"
                : "Please try again later")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          {language === "VI" ? "Quản lý danh mục" : "Category Management"}
        </h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <IconPlus size={20} />
          {language === "VI" ? "Tạo danh mục" : "Create Category"}
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
                  language === "VI"
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
              <option value="VI">{getStatusLabel("vietnamese")}</option>
              <option value="EN">{getStatusLabel("english")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-600">
        {language === "VI"
          ? `Hiển thị ${paginatedCategories.length} trên tổng số ${filteredCategories.length} danh mục`
          : `Showing ${paginatedCategories.length} of ${filteredCategories.length} categories`}
      </div>

      {/* Categories Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-400">
              <th className="p-3">ID</th>
              <th className="p-3">
                {language === "VI" ? "Hình ảnh" : "Image"}
              </th>
              <th className="p-3">
                {language === "VI" ? "Tên danh mục" : "Category Name"}
              </th>
              <th className="p-3">
                {language === "VI" ? "Mô tả" : "Description"}
              </th>
              <th className="p-3">
                {language === "VI" ? "Trạng thái" : "Status"}
              </th>
              <th className="p-3">
                {language === "VI" ? "Hành động" : "Actions"}
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 p-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                    {language === "VI" ? "Đang tải..." : "Loading..."}
                  </div>
                </td>
              </tr>
            ) : paginatedCategories.length > 0 ? (
              paginatedCategories.map((category, index) => (
                <tr
                  key={`category-${category.id}-${index}`}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3">{category.id}</td>

                  <td className="p-3">
                    {category.imageUrl || category.image ? (
                      <img
                        src={category.imageUrl || category.image}
                        alt={category.name}
                        className="w-10 h-10 rounded object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center text-gray-400 text-xs"
                      style={{
                        display:
                          category.imageUrl || category.image ? "none" : "flex",
                      }}
                    >
                      No Image
                    </div>
                  </td>

                  <td className="p-3">
                    <div>
                      <p className="font-semibold">{category.name}</p>
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="max-w-xs">
                      <p
                        className="text-sm truncate"
                        title={category.description}
                      >
                        {category.description}
                      </p>
                    </div>
                  </td>

                  <td className="p-3">
                    <button
                      onClick={() => handleToggleStatus(category)}
                      disabled={loadingItems.status === category.id}
                      className={`px-3 py-1 rounded text-sm font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 hover:opacity-80 ${
                        category.active
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      }`}
                      title={
                        language === "VI"
                          ? `Click để ${
                              category.active ? "vô hiệu hóa" : "kích hoạt lại"
                            }`
                          : `Click to ${
                              category.active ? "deactivate" : "activate"
                            }`
                      }
                    >
                      {loadingItems.status === category.id ? (
                        <div className="flex items-center gap-1">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                        </div>
                      ) : (
                        <>
                          {category.active
                            ? getStatusLabel("active")
                            : getStatusLabel("inactive")}
                        </>
                      )}
                    </button>
                  </td>

                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetail(category)}
                        className="text-blue-600 hover:text-blue-800 cursor-pointer p-1 rounded hover:bg-blue-50 transition-colors"
                        title={
                          language === "VI" ? "Xem chi tiết" : "View Details"
                        }
                      >
                        <IconEye size={18} />
                      </button>
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-yellow-600 hover:text-yellow-800 cursor-pointer p-1 rounded hover:bg-yellow-50 transition-colors"
                        title={language === "VI" ? "Chỉnh sửa" : "Edit"}
                      >
                        <IconEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        disabled={loadingItems.delete === category.id}
                        className="text-red-600 hover:text-red-800 cursor-pointer disabled:opacity-50 p-1 rounded hover:bg-red-50 transition-colors"
                        title={
                          language === "VI" ? "Xóa danh mục" : "Delete category"
                        }
                      >
                        {loadingItems.delete === category.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        ) : (
                          <IconTrash size={18} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 p-4">
                  {language === "VI"
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
        category={selectedCategory}
      />
    </div>
  );
}
