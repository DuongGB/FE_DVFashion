import {
  IconAdjustments,
  IconEye,
  IconFilter,
  IconPackageExport,
  IconPackageImport,
  IconRefresh,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Pagination from "../../components/common/Pagination";
import AdjustStockModal from "../../components/ui/inventory/AdjustStockModal";
import GeneralExportStockModal from "../../components/ui/inventory/GeneralExportStockModal";
import GeneralImportStockModal from "../../components/ui/inventory/GeneralImportStockModal";
import InventoryDetailModal from "../../components/ui/inventory/InventoryDetailModal";
import { useInventory } from "../../hooks/useInventory";
import LoadingSpinner from "../../utils/LoadingSpinner";

export default function InventoryPage() {
  const { t } = useTranslation();
  const { inventories, isLoading, error, refetch } = useInventory();
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showGeneralImportModal, setShowGeneralImportModal] = useState(false);
  const [showGeneralExportModal, setShowGeneralExportModal] = useState(false);

  // Debounce searchTerm -> setSearch sau 1.5s không gõ
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchTerm);
      setCurrentPage(1);
    }, 1000);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Thêm state cho bộ lọc nâng cao
  const [filters, setFilters] = useState({
    colors: [],
    sizes: [],
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const pageSize = 10;

  // Hàm ánh xạ tên màu sang mã hex mẫu
  const getColorCode = (colorName) => {
    const colorMap = {
      trắng: "#fff",
      đen: "#000",
      đỏ: "#ff0000",
      xanh: "#007bff",
      vàng: "#ffd700",
      hồng: "#ff69b4",
      xám: "#808080",
      nâu: "#8b4513",
      cam: "#ffa500",
      "xanh lá": "#28a745",
    };
    return colorMap[colorName?.toLowerCase()] || "#ccc";
  };

  // Lấy danh sách màu và size có trong kho
  const availableColors = Array.from(
    new Set((inventories || []).map((inv) => inv.productColor).filter(Boolean))
  );
  const availableSizes = Array.from(
    new Set((inventories || []).map((inv) => inv.sizeName).filter(Boolean))
  );

  if (error) return <div>{t("admin.inventory.error")}</div>;

  // Lọc inventory
  const filteredInventories = (inventories || []).filter((inventory) => {
    const matchesSearch = inventory.productName
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchesStockFilter = (() => {
      switch (stockFilter) {
        case "low":
          return inventory.isLowStock;
        case "out":
          return inventory.availableQuantity === 0;
        default:
          return true;
      }
    })();

    const matchesColor =
      filters.colors.length === 0 ||
      filters.colors.includes(inventory.productColor);

    const matchesSize =
      filters.sizes.length === 0 || filters.sizes.includes(inventory.sizeName);

    return matchesSearch && matchesStockFilter && matchesColor && matchesSize;
  });

  // Đếm số filter đang active
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.colors.length > 0) count++;
    if (filters.sizes.length > 0) count++;
    if (stockFilter !== "all") count++;
    if (search) count++;
    return count;
  };

  // Xoá filter
  const removeFilter = (type, value = null) => {
    setFilters((prev) => {
      if (value) {
        return {
          ...prev,
          [type]: prev[type].filter((item) => item !== value),
        };
      }
      return prev;
    });
    if (type === "stockFilter") setStockFilter("all");
    if (type === "search") setSearch("");
  };

  const totalPages = Math.ceil(filteredInventories.length / pageSize);
  const paginatedInventories = filteredInventories.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Xử lý xem chi tiết inventory
  const handleViewDetail = (inventory) => {
    setSelectedInventory(inventory);
    setShowDetailModal(true);
  };

  // Đóng modal chi tiết
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedInventory(null);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  // Xác định màu sắc dựa trên mức tồn kho
  const getStockLevelColor = (inventory) => {
    if (inventory.quantityInStock === 0) return "text-red-600";
    if (inventory.quantityInStock <= inventory.minStockLevel)
      return "text-yellow-600";
    return "text-green-600";
  };

  // Thống kê số lượng các loại tồn kho
  const totalProducts = inventories?.length || 0;
  const normalStock =
    inventories?.filter((inv) => inv.quantityInStock > inv.minStockLevel)
      .length || 0;
  const lowStock =
    inventories?.filter(
      (inv) =>
        inv.quantityInStock > 0 && inv.quantityInStock <= inv.minStockLevel
    ).length || 0;
  const outOfStock =
    inventories?.filter((inv) => inv.quantityInStock === 0).length || 0;

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          {t("admin.inventory.title")}
        </h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowGeneralImportModal(true)}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer text-sm sm:text-base"
          >
            <IconPackageImport size={16} />
            <span className="hidden sm:inline">
              {t("admin.inventory.import_stock")}
            </span>
            <span className="sm:hidden">
              {t("admin.inventory.import_stock")}
            </span>
          </button>
          <button
            onClick={() => setShowGeneralExportModal(true)}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors cursor-pointer text-sm sm:text-base"
          >
            <IconPackageExport size={16} />
            {t("admin.inventory.export")}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-3 sm:p-4 lg:p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 line-clamp-2">
                {t("admin.inventory.total_products")}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {totalProducts}
              </p>
            </div>
          </div>
        </div>
        <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-3 sm:p-4 lg:p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 line-clamp-2">
                {t("admin.inventory.normal_stock")}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">
                {normalStock}
              </p>
            </div>
          </div>
        </div>
        <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-3 sm:p-4 lg:p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 line-clamp-2">
                {t("admin.inventory.low_stock")}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-600">
                {lowStock}
              </p>
            </div>
          </div>
        </div>
        <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-3 sm:p-4 lg:p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 line-clamp-2">
                {t("admin.inventory.out_of_stock")}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-red-600">
                {outOfStock}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-3 sm:p-4 rounded-lg shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 items-center">
          <div className="sm:col-span-2 lg:col-span-2">
            <input
              type="text"
              placeholder={t("admin.inventory.search_placeholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSearch(searchTerm);
                  setCurrentPage(1);
                }
              }}
              className="backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg w-full px-3 sm:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xl"
            />
          </div>
          <div>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg w-full px-3 sm:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xl"
            >
              <option value="all">{t("admin.inventory.all")}</option>
              <option value="low">{t("admin.inventory.filter_low")}</option>
              <option value="out">{t("admin.inventory.filter_out")}</option>
            </select>
          </div>
          <div>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border rounded-lg transition-colors cursor-pointer backdrop-blur-sm shadow-xl text-sm ${
                showAdvancedFilters
                  ? "bg-blue-50 border-blue-300 text-blue-700"
                  : "border-white/30 hover:bg-white/70"
              }`}
            >
              <IconFilter size={16} />
              <span className="hidden sm:inline">
                {t("admin.inventory.advanced_filters")}
              </span>
              {getActiveFiltersCount() > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                  {getActiveFiltersCount()}
                </span>
              )}
            </button>
          </div>
          <div>
            <button
              type="button"
              onClick={() => refetch && refetch()}
              className="w-full flex items-center justify-center gap-1 px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow text-sm cursor-pointer"
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
                {t("admin.inventory.advanced_filters")}
              </h3>
              <button
                onClick={() => setFilters({ colors: [], sizes: [] })}
                className="text-red-600 hover:text-red-800 text-xs sm:text-sm underline cursor-pointer"
              >
                {t("admin.inventory.clear_all")}
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Lọc theo màu */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  {t("admin.inventory.color")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          colors: prev.colors.includes(color)
                            ? prev.colors.filter((c) => c !== color)
                            : [...prev.colors, color],
                        }))
                      }
                      className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm border transition-colors ${
                        filters.colors.includes(color)
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-white/80 text-gray-700 border-white/30 hover:border-blue-300"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
              {/* Lọc theo size */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  {t("admin.inventory.size")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          sizes: prev.sizes.includes(size)
                            ? prev.sizes.filter((s) => s !== size)
                            : [...prev.sizes, size],
                        }))
                      }
                      className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm border transition-colors ${
                        filters.sizes.includes(size)
                          ? "bg-green-500 text-white border-green-500"
                          : "bg-white/80 text-gray-700 border-white/30 hover:border-green-300"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* General Import Stock Modal */}
      {showGeneralImportModal && (
        <GeneralImportStockModal
          open={showGeneralImportModal}
          onClose={() => setShowGeneralImportModal(false)}
        />
      )}
      {/* General Export Stock Modal */}
      {showGeneralExportModal && (
        <GeneralExportStockModal
          open={showGeneralExportModal}
          onClose={() => setShowGeneralExportModal(false)}
        />
      )}

      {/* Active Filters Display */}
      {!search && getActiveFiltersCount() > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs sm:text-sm text-gray-600">
              {t("admin.inventory.active_filters")}
            </span>
            {stockFilter !== "all" && (
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                {stockFilter === "low"
                  ? t("admin.inventory.filter_low")
                  : t("admin.inventory.filter_out")}
                <button
                  onClick={() => removeFilter("stockFilter")}
                  className="hover:text-gray-600"
                >
                  <IconX size={12} />
                </button>
              </span>
            )}
            {filters.colors.map((color) => (
              <span
                key={color}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"
              >
                {color}
                <button
                  onClick={() => removeFilter("colors", color)}
                  className="hover:text-blue-600"
                >
                  <IconX size={12} />
                </button>
              </span>
            ))}
            {filters.sizes.map((size) => (
              <span
                key={size}
                className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"
              >
                {size}
                <button
                  onClick={() => removeFilter("sizes", size)}
                  className="hover:text-green-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="text-xs sm:text-sm text-gray-600">
        {t("admin.inventory.showing_results", {
          current: paginatedInventories.length,
          total: filteredInventories.length,
        })}
      </div>

      {/* Inventory Table - Mobile Card View */}
      <div className="block lg:hidden space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="medium" />
          </div>
        ) : paginatedInventories.length > 0 ? (
          paginatedInventories.map((inventory) => (
            <div
              key={inventory.id}
              className="backdrop-blur-xl bg-white/60 border border-white/30 shadow-lg rounded-lg p-3 sm:p-4"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm">
                  {inventory.productImage ? (
                    <img
                      src={inventory.productImage}
                      alt={inventory.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <IconPackageImport size={24} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-2 mb-1">
                    {inventory.productName}
                  </h3>
                  <p className="text-xs text-gray-500">ID: {inventory.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-600 mb-1">
                    {t("admin.inventory.color")}
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-full border-2 border-gray-300"
                      style={{
                        backgroundColor: getColorCode(inventory.productColor),
                      }}
                    ></div>
                    <span className="text-sm">{inventory.productColor}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">
                    {t("admin.inventory.size")}
                  </p>
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold text-sm">
                    {inventory.sizeName}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                <div>
                  <p className="text-xs text-gray-600 mb-1">
                    {t("admin.inventory.stock")}
                  </p>
                  <p
                    className={`text-lg font-bold ${getStockLevelColor(
                      inventory
                    )}`}
                  >
                    {inventory.quantityInStock}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">
                    {t("admin.inventory.reserved")}
                  </p>
                  <p className="text-lg font-semibold text-orange-600">
                    {inventory.reservedQuantity}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">
                    {t("admin.inventory.available")}
                  </p>
                  <p className="text-lg font-semibold text-green-600">
                    {inventory.availableQuantity}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div>
                  {inventory.quantityInStock === 0 ? (
                    <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                      <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      {t("admin.inventory.status_out")}
                    </span>
                  ) : inventory.quantityInStock <= inventory.minStockLevel ? (
                    <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                      {t("admin.inventory.status_low")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      {t("admin.inventory.status_normal")}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-600 text-right">
                  {formatDate(inventory.lastUpdated).split(",")[0]}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all text-sm cursor-pointer"
                  onClick={() => handleViewDetail(inventory)}
                >
                  <IconEye size={18} />
                  {t("admin.inventory.view_detail")}
                </button>
                <button
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-all text-sm cursor-pointer"
                  onClick={() => {
                    setSelectedInventory(inventory);
                    setShowAdjustModal(true);
                  }}
                >
                  <IconAdjustments size={18} />
                  {t("admin.inventory.adjust")}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="backdrop-blur-xl bg-white/60 border border-white/30 shadow-lg rounded-lg p-8 text-center">
            <IconPackageImport
              size={48}
              className="mx-auto mb-4 opacity-50 text-gray-400"
            />
            <p className="text-base font-medium text-gray-400">
              {t("admin.inventory.no_data")}
            </p>
            <p className="text-sm mt-2 text-gray-400">
              {t("admin.inventory.no_data_description")}
            </p>
          </div>
        )}
      </div>

      {/* Inventory Table - Desktop */}
      <div className="hidden lg:block backdrop-blur-xl bg-white/60 border border-white/30 shadow-lg rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="bg-gray-400">
              <tr>
                <th className="p-4 text-sm font-bold whitespace-nowrap">
                  {t("admin.inventory.product")}
                </th>
                <th className="p-4 text-sm font-bold text-center whitespace-nowrap">
                  {t("admin.inventory.color")}
                </th>
                <th className="p-4 text-sm font-bold text-center whitespace-nowrap">
                  {t("admin.inventory.size")}
                </th>
                <th className="p-4 text-sm font-bold text-center whitespace-nowrap">
                  {t("admin.inventory.stock")}
                </th>
                <th className="p-4 text-sm font-bold text-center whitespace-nowrap">
                  {t("admin.inventory.reserved")}
                </th>
                <th className="p-4 text-sm font-bold text-center whitespace-nowrap">
                  {t("admin.inventory.available")}
                </th>
                <th className="p-4 text-sm font-bold text-center whitespace-nowrap">
                  {t("admin.inventory.status")}
                </th>
                <th className="p-4 text-sm font-bold text-center whitespace-nowrap">
                  {t("admin.inventory.last_updated")}
                </th>
                <th className="p-4 text-sm font-bold text-center whitespace-nowrap">
                  {t("admin.inventory.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12">
                    <div className="flex justify-center">
                      <LoadingSpinner size="medium" />
                    </div>
                  </td>
                </tr>
              ) : paginatedInventories.length > 0 ? (
                paginatedInventories.map((inventory) => (
                  <tr
                    key={inventory.id}
                    className="border-b hover:bg-white/80 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm">
                          {inventory.productImage ? (
                            <img
                              src={inventory.productImage}
                              alt={inventory.productName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <IconPackageImport size={24} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className="font-semibold text-gray-900 truncate max-w-[250px]"
                            title={inventory.productName}
                          >
                            {inventory.productName}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ID: {inventory.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm"
                          style={{
                            backgroundColor:
                              getColorCode(inventory.productColor) || "#ccc",
                          }}
                          title={inventory.productColor}
                        ></div>
                        <span className="text-sm text-gray-700">
                          {inventory.productColor}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-blue-700 font-bold text-sm">
                          {inventory.sizeName}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-center">
                        <div
                          className={`text-2xl font-bold ${getStockLevelColor(
                            inventory
                          )}`}
                        >
                          {inventory.quantityInStock}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {t("admin.inventory.min")}: {inventory.minStockLevel}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-orange-600">
                          {inventory.reservedQuantity}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {t("admin.inventory.in_orders")}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">
                          {inventory.availableQuantity}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {t("admin.inventory.ready")}
                        </div>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex justify-center">
                        {inventory.quantityInStock === 0 ? (
                          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            {t("admin.inventory.status_out")}
                          </span>
                        ) : inventory.quantityInStock <=
                          inventory.minStockLevel ? (
                          <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                            {t("admin.inventory.status_low")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            {t("admin.inventory.status_normal")}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-center text-sm text-gray-600">
                        <div>
                          {formatDate(inventory.lastUpdated).split(",")[0]}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(inventory.lastUpdated).split(",")[1]}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                          onClick={() => handleViewDetail(inventory)}
                          title={t("admin.inventory.view_detail")}
                        >
                          <IconEye size={20} />
                        </button>
                        <button
                          className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-all cursor-pointer"
                          title={t("admin.inventory.adjust")}
                          onClick={() => {
                            setSelectedInventory(inventory);
                            setShowAdjustModal(true);
                          }}
                        >
                          <IconAdjustments size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <IconPackageImport
                        size={64}
                        className="mb-4 opacity-50"
                      />
                      <p className="text-lg font-medium">
                        {t("admin.inventory.no_data")}
                      </p>
                      <p className="text-sm mt-2">
                        {t("admin.inventory.no_data_description")}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={filteredInventories.length}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />

      {/* Inventory Detail Modal */}
      <InventoryDetailModal
        inventory={selectedInventory}
        open={showDetailModal}
        onClose={handleCloseDetailModal}
      />

      {/* Adjust Stock Modal */}
      {showAdjustModal && (
        <AdjustStockModal
          open={showAdjustModal}
          onClose={() => setShowAdjustModal(false)}
          inventory={selectedInventory}
        />
      )}
    </div>
  );
}
