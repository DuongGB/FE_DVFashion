import { useState, useEffect, useMemo, useRef } from "react";
import {
  IconEdit,
  IconPlus,
  IconSearch,
  IconEye,
  IconRefresh,
} from "@tabler/icons-react";
import { toast } from "react-toastify";
import Pagination from "../../components/common/Pagination";
import CategoryForm from "../../components/ui/category/CategoryForm";
import CategoryDetailModal from "../../components/ui/category/CategoryDetailModal";
import { showConfirmationToast } from "../../utils/showConfirmationToast";
import { useCategory } from "../../hooks/useCategory";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../../utils/LoadingSpinner";

export default function CategoryPage() {
  const { t, i18n } = useTranslation();
  const language = i18n.language || "VI";

  const { user } = useAuth();
  const isAdmin = user?.roles?.includes("ROLE_ADMIN");
  const isStaff = user?.roles?.includes("ROLE_STAFF") && !isAdmin;

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loadingItems, setLoadingItems] = useState({
    status: null,
    delete: null,
  });
  const [originalOrder, setOriginalOrder] = useState([]);
  const [localCategories, setLocalCategories] = useState([]);
  const pageSize = 10;

  const { categories, isLoading, error, update, refetch } = useCategory({
    lang: language,
    size: 20,
  });

  const debounceTimeout = useRef(null);

  // Debounce search: khi dừng gõ 1s thì mới search
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      setSearch(searchInput);
    }, 1000);

    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
    // eslint-disable-ne
  }, [searchInput]);

  // Đồng bộ localCategories khi categories thay đổi
  useEffect(() => {
    if (categories) {
      setLocalCategories(categories);
    }
  }, [categories]);

  // Đảm bảo khi đổi filter khác, cũng reset searchInput về search nếu muốn đồng bộ:
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Force re-render when language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      // Force component update
    };

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

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

  // Sắp xếp danh mục theo thứ tự ban đầu
  const sortedCategories = useMemo(() => {
    if (!localCategories) return [];

    return [...localCategories].sort((a, b) => a.id - b.id);
  }, [localCategories]);

  // Loc danh mục dựa trên tìm kiếm và trạng thái
  const filteredCategories = useMemo(() => {
    if (!sortedCategories || sortedCategories.length === 0) return [];

    return sortedCategories.filter((category) => {
      // Đảm bảo category tồn tại
      if (!category) return false;

      // Kiểm tra an toàn cho các thuộc tính
      const name = (category.name || "").toLowerCase();
      const description = (category.description || "").toLowerCase();
      const id = (category.id || "").toString();
      const searchLower = search.toLowerCase();

      const matchesSearch =
        name.includes(searchLower) ||
        description.includes(searchLower) ||
        id.includes(search);

      const matchesStatus =
        !statusFilter ||
        (statusFilter === "active" && category.active === true) ||
        (statusFilter === "inactive" && category.active === false);

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
    if (isStaff) {
      toast.error(
        t("admin.category.messages.staff_edit_denied") ||
          "Nhân viên không có quyền chỉnh sửa danh mục!",
        { autoClose: 2000, position: "top-center" }
      );
      return;
    }
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  const handleCreate = () => {
    if (isStaff) {
      toast.error(
        t("admin.category.messages.staff_create_denied") ||
          "Nhân viên không có quyền tạo danh mục mới!",
        { autoClose: 2000, position: "top-center" }
      );
      return;
    }
    setSelectedCategory(null);
    setShowEditModal(true);
  };

  const handleCloseEditModal = (updatedCategory) => {
    if (updatedCategory) {
      // Cập nhật local state ngay lập tức
      setLocalCategories((prev) => {
        const existingIndex = prev.findIndex(
          (cat) => cat.id === updatedCategory.id
        );

        if (existingIndex >= 0) {
          // Update existing category
          const newCategories = [...prev];
          newCategories[existingIndex] = {
            ...newCategories[existingIndex],
            ...updatedCategory,
            // Đảm bảo imageUrl được cập nhật
            imageUrl: updatedCategory.imageUrl || updatedCategory.image,
            image: updatedCategory.image || updatedCategory.imageUrl,
          };
          return newCategories;
        } else {
          // Add new category
          return [...prev, updatedCategory];
        }
      });
    }

    setShowEditModal(false);
    setSelectedCategory(null);
  };

  // Hàm xử lý thay đổi trạng thái danh mục
  const handleToggleStatus = async (category) => {
    // Kiểm tra quyền trước khi thực hiện
    if (isStaff) {
      toast.error(
        t("admin.category.messages.staff_status_denied") ||
          "Nhân viên không có quyền thay đổi trạng thái danh mục!",
        { autoClose: 2000, position: "top-center" }
      );
      return;
    }

    const newStatus = !category.active;
    const actionText = newStatus
      ? t("admin.category.actions.activate")
      : t("admin.category.actions.deactivate");

    const confirmText = newStatus
      ? t("admin.category.actions.activate")
      : t("admin.category.actions.deactivate");

    const cancelText = language === "VI" ? "Hủy" : "Cancel";

    const title = `${t(
      "admin.category.actions.confirm"
    )} ${actionText.toLowerCase()} ${t("admin.category.title").toLowerCase()}`;

    const message = `${t("admin.category.actions.confirm_message")} "${
      category.name
    }"?`;

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

          const result = await update({
            categoryId: category.id,
            categoryData,
            lang: language,
          });

          // Cập nhật local state ngay lập tức
          if (result) {
            setLocalCategories((prev) =>
              prev.map((cat) =>
                cat.id === category.id
                  ? {
                      ...cat,
                      ...result,
                      imageUrl: result.imageUrl || result.image,
                      image: result.image || result.imageUrl,
                    }
                  : cat
              )
            );
          }

          const successMessage = `${actionText} ${t(
            "admin.category.title"
          ).toLowerCase()} ${t("admin.category.actions.success")}!`;

          toast.success(successMessage);
        } catch (error) {
          console.error("Error updating category status:", error);
          const errorMessage = `${t(
            "admin.category.actions.error"
          )} ${actionText.toLowerCase()} ${t(
            "admin.category.title"
          ).toLowerCase()}!`;
          toast.error(errorMessage);
        } finally {
          // Clear loading state
          setLoadingItems((prev) => ({ ...prev, status: null }));
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

  if (isLoading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="medium" />
      </div>
    );

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          {t("admin.category.title")}
        </h1>
        <div className="flex items-center gap-4">
          {!isStaff && (
            <button
              onClick={handleCreate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer text-sm sm:text-base"
            >
              <IconPlus size={20} />
              {t("admin.category.create_category")}
            </button>
          )}
          {isStaff && (
            <div className="text-xs sm:text-sm text-gray-600 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
              <span className="font-medium text-yellow-800">
                {t("admin.category.staff_view_only") ||
                  "Chế độ xem - Không thể chỉnh sửa"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
        <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-3 sm:p-6 rounded-lg shadow-lg">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">
              {t("admin.category.total_categories")}
            </p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              {stats.total}
            </p>
          </div>
        </div>
        <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-3 sm:p-6 rounded-lg shadow-lg">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">
              {t("admin.category.active_categories")}
            </p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              {stats.active}
            </p>
          </div>
        </div>
        <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-3 sm:p-6 rounded-lg shadow-lg">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">
              {t("admin.category.inactive_categories")}
            </p>
            <p className="text-xl sm:text-2xl font-bold text-red-600">
              {stats.inactive}
            </p>
          </div>
        </div>
      </div>

      {/* Filters + Refresh */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1">
          <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-3 sm:p-4 rounded-lg shadow-lg">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="sm:col-span-2">
                <div className="relative">
                  <IconSearch
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder={t("admin.category.search_placeholder")}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setSearch(searchInput);
                      }
                    }}
                    className="backdrop-blur-sm bg-white/80 border border-white/30 w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xl text-sm"
                  />
                </div>
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="backdrop-blur-sm bg-white/80 border border-white/30 w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xl text-sm"
                >
                  <option value="">{t("admin.category.all_status")}</option>
                  <option value="active">
                    {t("admin.category.active_categories")}
                  </option>
                  <option value="inactive">
                    {t("admin.category.inactive_categories")}
                  </option>
                </select>
              </div>
              <div className="flex items-center h-full">
                <button
                  type="button"
                  onClick={() => refetch && refetch()}
                  className="flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow cursor-pointer text-sm"
                >
                  <IconRefresh size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4 text-xs sm:text-sm text-gray-600">
        {t("admin.category.showing_results", {
          current: paginatedCategories.length,
          total: filteredCategories.length,
        })}
      </div>

      {/* Responsive Categories Table/Card */}
      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-3">
        {isLoading ? (
          <div className="text-center text-gray-500 p-4">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
              {t("admin.category.loading")}
            </div>
          </div>
        ) : paginatedCategories.length > 0 ? (
          paginatedCategories.map((category, index) => (
            <div
              key={`category-card-${category.id}-${index}`}
              className="backdrop-blur-xl bg-white/60 border border-white/30 shadow-lg rounded-lg p-3 flex flex-col gap-2"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                  {category.imageUrl || category.image ? (
                    <img
                      src={category.imageUrl || category.image}
                      alt={category.name || "Category"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-400 text-xs">No Image</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base text-gray-900 truncate">
                    {category.name || "N/A"}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {category.description || "N/A"}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span
                  className={`px-3 py-1 rounded text-xs font-medium ${
                    category.active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {category.active
                    ? t("admin.category.status.active")
                    : t("admin.category.status.inactive")}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetail(category)}
                    className="text-blue-600 hover:text-blue-800 cursor-pointer p-1 rounded hover:bg-blue-50 transition-colors"
                    title={t("admin.category.actions.view_details")}
                  >
                    <IconEye size={20} />
                  </button>
                  {!isStaff ? (
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-yellow-600 hover:text-yellow-800 cursor-pointer p-1 rounded hover:bg-yellow-50 transition-colors"
                      title={t("admin.category.actions.edit")}
                    >
                      <IconEdit size={20} />
                    </button>
                  ) : (
                    <button
                      className="text-gray-400 p-1 cursor-not-allowed opacity-50"
                      onClick={() => handleEdit(category)}
                      title={
                        t("admin.category.staff_no_permission") ||
                        "Không có quyền chỉnh sửa"
                      }
                    >
                      <IconEdit size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 p-4">
            {t("admin.category.no_categories")}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block backdrop-blur-xl bg-white/60 border border-white/30 shadow-lg rounded-lg overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-400">
              <th className="p-3">{t("admin.category.columns.id")}</th>
              <th className="p-3">{t("admin.category.columns.image")}</th>
              <th className="p-3">{t("admin.category.columns.name")}</th>
              <th className="p-3">{t("admin.category.columns.description")}</th>
              <th className="p-3">{t("admin.category.columns.status")}</th>
              <th className="p-3">{t("admin.category.columns.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 p-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                    {t("admin.category.loading")}
                  </div>
                </td>
              </tr>
            ) : paginatedCategories.length > 0 ? (
              paginatedCategories.map((category, index) => (
                <tr
                  key={`category-${category.id}-${index}`}
                  className="border-b hover:bg-white/80 transition-colors"
                >
                  <td className="p-3">{category.id || "-"}</td>
                  <td className="p-3">
                    {category.imageUrl || category.image ? (
                      <img
                        src={category.imageUrl || category.image}
                        alt={category.name || "Category"}
                        className="w-10 h-10 rounded object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                        No Image
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <div>
                      <p className="font-semibold">{category.name || "N/A"}</p>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="max-w-xs">
                      <p
                        className="text-sm truncate"
                        title={category.description || ""}
                      >
                        {category.description || "N/A"}
                      </p>
                    </div>
                  </td>
                  <td className="p-3">
                    {isStaff ? (
                      <span
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          category.active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {category.active
                          ? t("admin.category.status.active")
                          : t("admin.category.status.inactive")}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleToggleStatus(category)}
                        disabled={loadingItems.status === category.id}
                        className={`px-3 py-1 rounded text-sm font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 hover:opacity-80 ${
                          category.active
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                        title={
                          category.active
                            ? t("admin.category.actions.deactivate")
                            : t("admin.category.actions.activate")
                        }
                      >
                        {loadingItems.status === category.id ? (
                          <div className="flex items-center gap-1">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                          </div>
                        ) : (
                          <>
                            {category.active
                              ? t("admin.category.status.active")
                              : t("admin.category.status.inactive")}
                          </>
                        )}
                      </button>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetail(category)}
                        className="text-blue-600 hover:text-blue-800 cursor-pointer p-1 rounded hover:bg-blue-50 transition-colors"
                        title={t("admin.category.actions.view_details")}
                      >
                        <IconEye size={24} />
                      </button>
                      {!isStaff ? (
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-yellow-600 hover:text-yellow-800 cursor-pointer p-1 rounded hover:bg-yellow-50 transition-colors"
                          title={t("admin.category.actions.edit")}
                        >
                          <IconEdit size={24} />
                        </button>
                      ) : (
                        <button
                          className="text-gray-400 p-1 cursor-not-allowed opacity-50"
                          onClick={() => handleEdit(category)}
                          title={
                            t("admin.category.staff_no_permission") ||
                            "Không có quyền chỉnh sửa"
                          }
                        >
                          <IconEdit size={24} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 p-4">
                  {t("admin.category.no_categories")}
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
        onClose={handleCloseEditModal}
        category={selectedCategory}
      />
    </div>
  );
}
