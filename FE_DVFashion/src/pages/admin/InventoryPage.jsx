import {
  IconPackageImport,
  IconEye,
  IconFilter,
  IconAdjustments,
  IconPackageExport,
} from "@tabler/icons-react";
import { useState } from "react";
import Pagination from "../../components/common/Pagination";
import InventoryDetailModal from "../../components/ui/inventory/InventoryDetailModal";
import { useInventory } from "../../hooks/useInventory";
import ImportStockModal from "../../components/ui/inventory/ImportStockModal";
import ExportStockModal from "../../components/ui/inventory/ExportStockModal";
import AdjustStockModal from "../../components/ui/inventory/AdjustStockModal";
import { useTranslation } from "react-i18next";

export default function InventoryPage() {
  const { t } = useTranslation();
  const { inventories, isLoading, error } = useInventory();
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  // Thêm state cho bộ lọc nâng cao
  const [filters, setFilters] = useState({
    colors: [],
    sizes: [],
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const pageSize = 10;

  // Lấy danh sách màu và size có trong kho
  const availableColors = Array.from(
    new Set((inventories || []).map((inv) => inv.productColor).filter(Boolean))
  );
  const availableSizes = Array.from(
    new Set((inventories || []).map((inv) => inv.sizeName).filter(Boolean))
  );

  // Nếu đang loading hoặc lỗi
  if (isLoading) return <div>{t("admin.inventory.loading")}</div>;
  if (error) return <div>{t("admin.inventory.error")}</div>;

  // Lọc inventory
  const filteredInventories = (inventories || []).filter((inventory) => {
    const matchesSearch =
      inventory.productName?.toLowerCase().includes(search.toLowerCase()) ||
      inventory.sizeName?.toLowerCase().includes(search.toLowerCase());

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

    // Lọc theo màu
    const matchesColor =
      filters.colors.length === 0 ||
      filters.colors.includes(inventory.productColor);

    // Lọc theo size
    const matchesSize =
      filters.sizes.length === 0 || filters.sizes.includes(inventory.sizeName);

    return matchesSearch && matchesStockFilter && matchesColor && matchesSize;
  });

  // Đếm số filter đang active
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.colors.length > 0) count += filters.colors.length;
    if (filters.sizes.length > 0) count += filters.sizes.length;
    if (stockFilter !== "all") count++;
    if (search) count++;
    return count;
  };

  // Xoá filter
  const removeFilter = (type, value = null) => {
    setFilters((prev) => {
      if (type === "colors" || type === "sizes") {
        return {
          ...prev,
          [type]: prev[type].filter((v) => v !== value),
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
    if (inventory.quantityInStock === 0) return "text-red-600 font-bold";
    if (inventory.quantityInStock <= inventory.minStockLevel)
      return "text-yellow-600 font-bold";
    return "text-green-600";
  };

  // Thống kê số lượng các loại tồn kho
  const totalProducts = inventories.length;
  const normalStock = inventories.filter(
    (inv) => inv.quantityInStock > inv.minStockLevel
  ).length;
  const lowStock = inventories.filter(
    (inv) => inv.quantityInStock > 0 && inv.quantityInStock <= inv.minStockLevel
  ).length;
  const outOfStock = inventories.filter(
    (inv) => inv.quantityInStock === 0
  ).length;

  return (
    <div>
      {/* Header */}
      <h1 className="text-2xl font-bold">{t("admin.inventory.title")}</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("admin.inventory.total_products")}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {totalProducts}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("admin.inventory.normal_stock")}
              </p>
              <p className="text-2xl font-bold text-green-600">{normalStock}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("admin.inventory.low_stock")}
              </p>
              <p className="text-2xl font-bold text-yellow-600">{lowStock}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("admin.inventory.out_of_stock")}
              </p>
              <p className="text-2xl font-bold text-red-600">{outOfStock}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Filters */}
      <div className="bg-white p-4 rounded-lg shadow border mb-4 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex gap-4 items-center flex-1">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={t("admin.inventory.search_placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t("admin.inventory.all")}</option>
            <option value="low">{t("admin.inventory.filter_low")}</option>
            <option value="out">{t("admin.inventory.filter_out")}</option>
          </select>
          <button
            onClick={() => setShowAdvancedFilters((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors cursor-pointer ${
              showAdvancedFilters
                ? "bg-blue-50 border-blue-300 text-blue-700"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            <IconFilter size={16} />
            {t("admin.inventory.advanced_filters")}
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
              {t("admin.inventory.advanced_filters")}
            </h3>
            <button
              onClick={() => setFilters({ colors: [], sizes: [] })}
              className="text-red-600 hover:text-red-800 text-sm underline cursor-pointer"
            >
              {t("admin.inventory.clear_all")}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Lọc theo màu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
            {/* Lọc theo size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
        </div>
      )}

      {/* Active Filters Display */}
      {getActiveFiltersCount() > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-600">
              {t("admin.inventory.active_filters")}
            </span>
            {/* Search */}
            {search && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                {t("admin.inventory.search", { search })}
                <button
                  onClick={() => removeFilter("search")}
                  className="hover:text-blue-600"
                >
                  ×
                </button>
              </span>
            )}
            {/* Stock filter */}
            {stockFilter !== "all" && (
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                {stockFilter === "low"
                  ? t("admin.inventory.filter_low")
                  : t("admin.inventory.filter_out")}
                <button
                  onClick={() => removeFilter("stockFilter")}
                  className="hover:text-gray-600"
                >
                  ×
                </button>
              </span>
            )}
            {/* Colors */}
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
                  ×
                </button>
              </span>
            ))}
            {/* Sizes */}
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
      <div className="mb-4 text-sm text-gray-600">
        {t("admin.inventory.showing_results", {
          current: paginatedInventories.length,
          total: filteredInventories.length,
        })}
      </div>

      {/* Inventory Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-400">
              <th className="p-2">{t("admin.inventory.id")}</th>
              <th className="p-2">{t("admin.inventory.product")}</th>
              <th className="p-2">{t("admin.inventory.color")}</th>
              <th className="p-2">{t("admin.inventory.size")}</th>
              <th className="p-2">{t("admin.inventory.stock")}</th>
              <th className="p-2">{t("admin.inventory.reserved")}</th>
              <th className="p-2">{t("admin.inventory.available")}</th>
              <th className="p-2">{t("admin.inventory.min_stock")}</th>
              <th className="p-2">{t("admin.inventory.status")}</th>
              <th className="p-2">{t("admin.inventory.last_updated")}</th>
              <th className="p-2">{t("admin.inventory.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedInventories.length > 0 ? (
              paginatedInventories.map((inventory) => (
                <tr key={inventory.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{inventory.id}</td>
                  <td className="p-2">
                    <div>
                      <div className="font-medium">{inventory.productName}</div>
                    </div>
                  </td>
                  <td className="p-2">{inventory.productColor}</td>
                  <td className="p-2 text-blue-600">{inventory.sizeName}</td>
                  <td
                    className={`p-2 font-bold ${getStockLevelColor(inventory)}`}
                  >
                    {inventory.quantityInStock}
                  </td>
                  <td className="p-2">{inventory.reservedQuantity}</td>
                  <td className="p-2">{inventory.availableQuantity}</td>
                  <td className="p-2 text-gray-600">
                    {inventory.minStockLevel}
                  </td>
                  <td className="p-2">
                    {inventory.quantityInStock === 0 ? (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                        {t("admin.inventory.status_out")}
                      </span>
                    ) : inventory.quantityInStock <= inventory.minStockLevel ? (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        {t("admin.inventory.status_low")}
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        {t("admin.inventory.status_normal")}
                      </span>
                    )}
                  </td>
                  <td className="p-2 text-gray-600">
                    {formatDate(inventory.lastUpdated)}
                  </td>
                  <td className="p-2">
                    <button
                      className="text-blue-600 hover:text-blue-800 p-1 cursor-pointer"
                      onClick={() => handleViewDetail(inventory)}
                      title={t("admin.inventory.view_detail")}
                    >
                      <IconEye size={24} />
                    </button>
                    <button
                      className="text-green-600 hover:text-green-800 p-1 cursor-pointer"
                      title={t("admin.inventory.import")}
                      onClick={() => {
                        setSelectedInventory(inventory);
                        setShowImportModal(true);
                      }}
                    >
                      <IconPackageImport size={24} />
                    </button>
                    <button
                      className="text-orange-600 hover:text-orange-800 p-1 cursor-pointer"
                      title={t("admin.inventory.export")}
                      onClick={() => {
                        setSelectedInventory(inventory);
                        setShowExportModal(true);
                      }}
                    >
                      <IconPackageExport size={24} />
                    </button>
                    <button
                      className="text-purple-600 hover:text-purple-800 p-1 cursor-pointer"
                      title={t("admin.inventory.adjust")}
                      onClick={() => {
                        setSelectedInventory(inventory);
                        setShowAdjustModal(true);
                      }}
                    >
                      <IconAdjustments size={24} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11} className="text-center py-6 text-gray-500">
                  {t("admin.inventory.no_data")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
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

      {/* Import Stock Modal */}
      {showImportModal && (
        <ImportStockModal
          open={showImportModal}
          onClose={() => setShowImportModal(false)}
          inventory={selectedInventory}
        />
      )}

      {/* Export Stock Modal */}
      {showExportModal && (
        <ExportStockModal
          open={showExportModal}
          onClose={() => setShowExportModal(false)}
          inventory={selectedInventory}
        />
      )}

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
