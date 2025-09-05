import { useState, useEffect, useMemo } from "react";
import { IconEdit, IconPlus, IconSearch, IconEye } from "@tabler/icons-react";
import { toast } from "react-toastify";
import Pagination from "../../components/common/Pagination";
import BrandForm from "../../components/ui/brand/BrandForm";
import BrandDetailModal from "../../components/ui/brand/BrandDetailModal";
import { showConfirmationToast } from "../../utils/showConfirmationToast";
import { useBrand } from "../../hooks/useBrand";

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

export default function BrandPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [language, setLanguage] = useState("VI");
  const [loadingItems, setLoadingItems] = useState({
    status: null,
    delete: null,
  });
  const [originalOrder, setOriginalOrder] = useState([]); // Store original order
  const pageSize = 10;

  // Use the brand hook
  const { brands, isLoading, error, updateBrand } = useBrand(language);

  // Store original order when brands first load
  useEffect(() => {
    if (brands && brands.length > 0) {
      setOriginalOrder((prev) => {
        // Only set if empty or length changed significantly
        if (prev.length === 0 || Math.abs(prev.length - brands.length) > 1) {
          return brands.map((brand) => brand.id);
        }
        return prev;
      });
    }
  }, [brands]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // Helper function to get status labels
  const getStatusLabel = (key) => {
    const langKey = language === "VI" ? "vi" : "en";
    return statusLabels[langKey][key] || statusLabels.vi[key];
  };

  // Sort brands by original order to maintain position
  const sortedBrands = useMemo(() => {
    if (!brands) return [];

    return [...brands].sort((a, b) => a.id - b.id);
  }, [brands]);

  // Filter brands with stable sorting
  const filteredBrands = useMemo(() => {
    return sortedBrands.filter((brand) => {
      const matchesSearch =
        brand.name.toLowerCase().includes(search.toLowerCase()) ||
        brand.description.toLowerCase().includes(search.toLowerCase()) ||
        brand.id.toString().includes(search);

      const matchesStatus =
        !statusFilter ||
        (statusFilter === "active" && brand.active) ||
        (statusFilter === "inactive" && !brand.active);

      return matchesSearch && matchesStatus;
    });
  }, [sortedBrands, search, statusFilter]);

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

  // Handle toggle status with position preservation
  const handleToggleStatus = async (brand) => {
    const newStatus = !brand.active;
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
        ? `Xác nhận ${actionText} thương hiệu`
        : `Confirm ${actionText} brand`;

    const message =
      langKey === "vi"
        ? `Bạn có chắc chắn muốn ${actionText} thương hiệu "${brand.name}" không?`
        : `Are you sure you want to ${actionText} brand "${brand.name}"?`;

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
        setLoadingItems((prev) => ({ ...prev, status: brand.id }));

        try {
          const brandData = new FormData();
          const brandRequest = {
            name: brand.name,
            description: brand.description,
            active: newStatus,
          };

          brandData.append(
            "brand",
            new Blob([JSON.stringify(brandRequest)], {
              type: "application/json",
            })
          );

          await updateBrand({
            brandId: brand.id,
            brandData,
            lang: language,
          });

          const successMessage =
            langKey === "vi"
              ? `${
                  newStatus ? "Kích hoạt lại" : "Vô hiệu hóa"
                } thương hiệu thành công!`
              : `Brand ${
                  newStatus ? "activated" : "deactivated"
                } successfully!`;

          toast.success(successMessage);
        } catch (error) {
          console.error("Error updating brand status:", error);
          const errorMessage =
            langKey === "vi"
              ? `Có lỗi xảy ra khi ${actionText} thương hiệu!`
              : `Error occurred while ${actionText.replace(" ", "ing")} brand!`;
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
    total: sortedBrands?.length || 0,
    active: sortedBrands?.filter((b) => b.active).length || 0,
    inactive: sortedBrands?.filter((b) => !b.active).length || 0,
  };

  // Handle error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <p className="text-red-500 text-lg">
            {language === "VI"
              ? "Có lỗi xảy ra khi tải danh sách thương hiệu"
              : "Error loading brands"}
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
          {language === "VI" ? "Quản lý thương hiệu" : "Brand Management"}
        </h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <IconPlus size={20} />
          {language === "VI" ? "Tạo thương hiệu" : "Create Brand"}
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
          ? `Hiển thị ${paginatedBrands.length} trên tổng số ${filteredBrands.length} thương hiệu`
          : `Showing ${paginatedBrands.length} of ${filteredBrands.length} brands`}
      </div>

      {/* Brands Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-400">
              <th className="p-3">ID</th>
              <th className="p-3">{language === "VI" ? "Logo" : "Logo"}</th>
              <th className="p-3">
                {language === "VI" ? "Tên thương hiệu" : "Brand Name"}
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
            ) : paginatedBrands.length > 0 ? (
              paginatedBrands.map((brand, index) => (
                <tr
                  key={`brand-${brand.id}-${index}`}
                  className="border-b hover:bg-gray-300 transition-colors"
                >
                  <td className="p-3">{brand.id}</td>

                  <td className="p-3">
                    {brand.logo ? (
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="h-8 w-auto object-contain"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center text-gray-400 text-xs"
                      style={{
                        display: brand.logo ? "none" : "flex",
                      }}
                    >
                      No Logo
                    </div>
                  </td>

                  <td className="p-3">
                    <div>
                      <p className="font-semibold">{brand.name}</p>
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="max-w-xs">
                      <p className="text-sm truncate" title={brand.description}>
                        {brand.description}
                      </p>
                    </div>
                  </td>

                  <td className="p-3">
                    <button
                      onClick={() => handleToggleStatus(brand)}
                      disabled={loadingItems.status === brand.id}
                      className={`px-3 py-1 rounded text-sm font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 hover:opacity-80 ${
                        brand.active
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      }`}
                      title={
                        language === "VI"
                          ? `Click để ${
                              brand.active ? "vô hiệu hóa" : "kích hoạt lại"
                            }`
                          : `Click to ${
                              brand.active ? "deactivate" : "activate"
                            }`
                      }
                    >
                      {loadingItems.status === brand.id ? (
                        <div className="flex items-center gap-1">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                        </div>
                      ) : (
                        <>
                          {brand.active
                            ? getStatusLabel("active")
                            : getStatusLabel("inactive")}
                        </>
                      )}
                    </button>
                  </td>

                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetail(brand)}
                        className="text-blue-600 hover:text-blue-800 cursor-pointer p-1 rounded hover:bg-blue-50 transition-colors"
                        title={
                          language === "VI" ? "Xem chi tiết" : "View Details"
                        }
                      >
                        <IconEye size={24} />
                      </button>
                      <button
                        onClick={() => handleEdit(brand)}
                        className="text-yellow-600 hover:text-yellow-800 cursor-pointer p-1 rounded hover:bg-yellow-50 transition-colors"
                        title={language === "VI" ? "Chỉnh sửa" : "Edit"}
                      >
                        <IconEdit size={24} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center text-gray-500 p-4">
                  {language === "VI"
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
        brand={selectedBrand}
      />
    </div>
  );
}
