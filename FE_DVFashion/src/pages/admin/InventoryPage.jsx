import {
  IconPackageImport,
  IconEye,
  IconFilter,
  IconAdjustments,
  IconPackageExport,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import Pagination from "../../components/common/Pagination";
import InventoryDetailModal from "../../components/ui/inventory/InventoryDetailModal";
import { useInventory } from "../../hooks/useInventory";
import AdjustStockModal from "../../components/ui/inventory/AdjustStockModal";
import { useTranslation } from "react-i18next";
import GeneralImportStockModal from "../../components/ui/inventory/GeneralImportStockModal";
import GeneralExportStockModal from "../../components/ui/inventory/GeneralExportStockModal";

export default function InventoryPage() {
  const { t } = useTranslation();
  const { inventories, isLoading, error } = useInventory();
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showGeneralImportModal, setShowGeneralImportModal] = useState(false);
  const [showGeneralExportModal, setShowGeneralExportModal] = useState(false);

  // Thêm state cho bộ lọc nâng cao
  const [filters, setFilters] = useState({
    colors: [],
    sizes: [],
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const pageSize = 10;

  // Debounce cho việc tìm kiếm
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(searchTerm);
      setCurrentPage(1); // Reset về trang đầu khi có tìm kiếm mới
    }, 300); // Đợi 300ms sau khi người dùng ngừng gõ

    return () => {
      clearTimeout(handler); // Cleanup timeout
    };
  }, [searchTerm]);

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
            {t("admin.inventory.title")}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowGeneralImportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-xl shadow-lg hover:from-green-600 hover:to-green-800 transition-all cursor-pointer"
            >
              <IconPackageImport size={16} />
              {t("admin.inventory.import_stock")}
            </button>
            <button
              onClick={() => setShowGeneralExportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-700 text-white rounded-xl shadow-lg hover:from-orange-600 hover:to-orange-800 transition-all cursor-pointer"
            >
              <IconPackageExport size={16} />
              {t("admin.inventory.export")}
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="backdrop-blur-xl bg-white/40 border border-white/30 rounded-xl shadow-lg p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("admin.inventory.total_products")}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {totalProducts}
              </p>
            </div>
          </div>
          <div className="backdrop-blur-xl bg-white/40 border border-white/30 rounded-xl shadow-lg p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("admin.inventory.normal_stock")}
              </p>
              <p className="text-2xl font-bold text-green-600">{normalStock}</p>
            </div>
          </div>
          <div className="backdrop-blur-xl bg-white/40 border border-white/30 rounded-xl shadow-lg p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("admin.inventory.low_stock")}
              </p>
              <p className="text-2xl font-bold text-yellow-600">{lowStock}</p>
            </div>
          </div>
          <div className="backdrop-blur-xl bg-white/40 border border-white/30 rounded-xl shadow-lg p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                {t("admin.inventory.out_of_stock")}
              </p>
              <p className="text-2xl font-bold text-red-600">{outOfStock}</p>
            </div>
          </div>
        </div>

        {/* Basic Filters */}
        <div className="backdrop-blur-xl bg-white/40 border border-white/30 rounded-xl shadow-lg mb-4 flex flex-col md:flex-row md:items-center gap-4 p-4">
          <div className="flex gap-4 items-center flex-1">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={t("admin.inventory.search_placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-4 py-2 border border-white/30 rounded-lg bg-white/60 backdrop-blur-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
              />
            </div>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-4 py-2 border border-white/30 rounded-lg bg-white/60 backdrop-blur-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300"
            >
              <option value="all">{t("admin.inventory.all")}</option>
              <option value="low">{t("admin.inventory.filter_low")}</option>
              <option value="out">{t("admin.inventory.filter_out")}</option>
            </select>
            <button
              onClick={() => setShowAdvancedFilters((v) => !v)}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-all duration-300 cursor-pointer shadow
                ${
                  showAdvancedFilters
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "border-white/30 bg-white/60 hover:bg-blue-50 hover:border-blue-300"
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
          <div className="backdrop-blur-xl bg-white/40 border border-white/30 rounded-xl shadow-lg p-4 mb-4 space-y-4">
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
        <div className="backdrop-blur-xl bg-white/40 border border-white/30 shadow-lg rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead className="bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200">
                <tr>
                  <th className="p-4 text-sm font-semibold text-gray-700 whitespace-nowrap">
                    {t("admin.inventory.product")}
                  </th>
                  <th className="p-4 text-sm font-semibold text-gray-700 text-center whitespace-nowrap">
                    {t("admin.inventory.color")}
                  </th>
                  <th className="p-4 text-sm font-semibold text-gray-700 text-center whitespace-nowrap">
                    {t("admin.inventory.size")}
                  </th>
                  <th className="p-4 text-sm font-semibold text-gray-700 text-center whitespace-nowrap">
                    {t("admin.inventory.stock")}
                  </th>
                  <th className="p-4 text-sm font-semibold text-gray-700 text-center whitespace-nowrap">
                    {t("admin.inventory.reserved")}
                  </th>
                  <th className="p-4 text-sm font-semibold text-gray-700 text-center whitespace-nowrap">
                    {t("admin.inventory.available")}
                  </th>
                  <th className="p-4 text-sm font-semibold text-gray-700 text-center whitespace-nowrap">
                    {t("admin.inventory.status")}
                  </th>
                  <th className="p-4 text-sm font-semibold text-gray-700 text-center whitespace-nowrap">
                    {t("admin.inventory.last_updated")}
                  </th>
                  <th className="p-4 text-sm font-semibold text-gray-700 text-center whitespace-nowrap">
                    {t("admin.inventory.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedInventories.length > 0 ? (
                  paginatedInventories.map((inventory) => (
                    <tr
                      key={inventory.id}
                      className="border-b border-gray-200 hover:bg-white/80 transition-all"
                    >
                      {/* Product Info with Image */}
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

                      {/* Color */}
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <div
                            className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm"
                            style={{
                              backgroundColor:
                                inventory.productColorCode || "#ccc",
                            }}
                            title={inventory.productColor}
                          ></div>
                          <span className="text-sm text-gray-700">
                            {inventory.productColor}
                          </span>
                        </div>
                      </td>

                      {/* Size */}
                      <td className="p-4">
                        <div className="flex justify-center">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-blue-700 font-bold text-sm">
                            {inventory.sizeName}
                          </span>
                        </div>
                      </td>

                      {/* Stock Quantity */}
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
                            {t("admin.inventory.min")}:{" "}
                            {inventory.minStockLevel}
                          </div>
                        </div>
                      </td>

                      {/* Reserved */}
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

                      {/* Available */}
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

                      {/* Status */}
                      <td className="p-4">
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

                      {/* Last Updated */}
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

                      {/* Actions */}
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
    </div>
  );
}
