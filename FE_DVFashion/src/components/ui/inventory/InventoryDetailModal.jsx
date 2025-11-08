import {
  IconX,
  IconPackage,
  IconCalendar,
  IconBox,
  IconPalette,
  IconRuler,
  IconAlertTriangle,
  IconHistory,
  IconClipboardList,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

const transactionTypes = {
  IN: { label: "admin.inventory_detail.transaction.in", color: "bg-green-500" },
  OUT: { label: "admin.inventory_detail.transaction.out", color: "bg-red-500" },
  ADJUSTMENT: {
    label: "admin.inventory_detail.transaction.adjustment",
    color: "bg-yellow-500",
  },
  RESERVED: {
    label: "admin.inventory_detail.transaction.reserved",
    color: "bg-blue-500",
  },
  RELEASED: {
    label: "admin.inventory_detail.transaction.released",
    color: "bg-purple-500",
  },
};

export default function InventoryDetailModal({
  inventory,
  transactions = [],
  open,
  onClose,
}) {
  const { t } = useTranslation();
  if (!open || !inventory) return null;

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Không có";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Tính available quantity (quantity - reservedQuantity)
  const getAvailableQuantity = (inventory) => {
    return inventory.quantityInStock - inventory.reservedQuantity;
  };

  // Xác định màu sắc và trạng thái dựa trên mức tồn kho
  const getStockStatus = (inventory) => {
    if (inventory.quantity === 0) {
      return {
        label: t("admin.inventory.status_out"),
        color: "bg-red-100 text-red-800",
        textColor: "text-red-600",
      };
    }
    if (inventory.quantity <= inventory.minStockLevel) {
      return {
        label: t("admin.inventory.status_low"),
        color: "bg-yellow-100 text-yellow-800",
        textColor: "text-yellow-600",
      };
    }
    return {
      label: t("admin.inventory.status_normal"),
      color: "bg-green-100 text-green-800",
      textColor: "text-green-600",
    };
  };

  const stockStatus = getStockStatus(inventory);

  // Lọc transactions cho inventory hiện tại
  const inventoryTransactions = (transactions || []).filter(
    (t) => t.inventory?.id === inventory.id
  );

  // Thống kê giao dịch
  const totalIn = inventoryTransactions
    .filter((t) => t.type === "IN")
    .reduce((sum, t) => sum + Math.abs(t.quantity), 0);
  const totalOut = inventoryTransactions
    .filter((t) => t.type === "OUT")
    .reduce((sum, t) => sum + Math.abs(t.quantity), 0);
  const totalAdjustment = inventoryTransactions
    .filter((t) => t.type === "ADJUSTMENT")
    .reduce((sum, t) => sum + Math.abs(t.quantity), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="backdrop-blur-xl bg-white/80 border border-white/30 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto flex flex-col transition-all duration-300 animate-scaleIn"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <IconBox size={28} className="text-white" />
            <h2 className="text-2xl font-bold">
              {t("admin.inventory_detail.title")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-black/30 backdrop-blur-sm text-white rounded-full hover:bg-black/50 transition-colors cursor-pointer"
          >
            <IconX size={20} />
          </button>
        </div>

        <div className="p-2 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
            {/* Thông tin sản phẩm & tồn kho */}
            <div className="space-y-4">
              {/* Thông tin sản phẩm */}
              <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-4 rounded-xl shadow-lg">
                <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                  <IconPackage size={18} className="text-blue-600" />
                  {t("admin.inventory_detail.product_info")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <strong className="text-gray-600">
                      {t("admin.inventory.id")}:
                    </strong>
                    <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono text-sm">
                      #{inventory.id}
                    </span>
                  </div>
                  <div>
                    <strong className="text-gray-600">
                      {t("admin.inventory.product")}:
                    </strong>
                    <span className="ml-2 font-medium">
                      {inventory.productName}
                    </span>
                  </div>
                  <div>
                    <strong className="text-gray-600">
                      {t("admin.inventory.color")}:
                    </strong>
                    <span className="ml-2 flex items-center gap-1">
                      <IconPalette size={16} className="text-blue-400" />
                      {inventory.productColor}
                    </span>
                  </div>
                  <div>
                    <strong className="text-gray-600">
                      {t("admin.inventory.size")}:
                    </strong>
                    <span className="ml-2 flex items-center gap-1">
                      <IconRuler size={16} className="text-green-400" />
                      {inventory.sizeName}
                    </span>
                  </div>
                  <div>
                    <strong className="text-gray-600">
                      {t("admin.inventory.last_updated")}:
                    </strong>
                    <span className="ml-2 text-sm">
                      {formatDate(inventory.lastUpdated)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Thông tin tồn kho */}
              <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-4 rounded-xl shadow-lg">
                <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                  <IconClipboardList size={18} className="text-purple-600" />
                  {t("admin.inventory_detail.stock_info")}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded border">
                    <div className="text-2xl font-bold text-blue-600">
                      {inventory.quantityInStock}
                    </div>
                    <div className="text-sm text-gray-600">
                      {t("admin.inventory.stock")}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded border">
                    <div className="text-2xl font-bold text-orange-600">
                      {inventory.reservedQuantity}
                    </div>
                    <div className="text-sm text-gray-600">
                      {t("admin.inventory.reserved")}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded border">
                    <div
                      className={`text-2xl font-bold ${stockStatus.textColor}`}
                    >
                      {getAvailableQuantity(inventory)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {t("admin.inventory.available")}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded border">
                    <div className="text-2xl font-bold text-red-600">
                      {inventory.minStockLevel}
                    </div>
                    <div className="text-sm text-gray-600">
                      {t("admin.inventory.min_stock")}
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <strong className="text-gray-600">
                    {t("admin.inventory.status")}:
                  </strong>
                  <span
                    className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${stockStatus.color}`}
                  >
                    {stockStatus.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Lịch sử giao dịch */}
            <div className="space-y-4">
              <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-4 rounded-xl shadow-lg h-full">
                <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                  <IconHistory size={18} className="text-orange-600" />
                  {t("admin.inventory_detail.transaction_history")}
                  <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-normal">
                    {t("admin.inventory_detail.transaction_count", {
                      count: inventoryTransactions.length,
                    })}
                  </span>
                </h3>
                <div className="max-h-full overflow-y-auto">
                  {inventoryTransactions.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-white/60">
                          <th className="p-2">
                            {t("admin.inventory_detail.transaction_type")}
                          </th>
                          <th className="p-2">
                            {t("admin.inventory_detail.transaction_date")}
                          </th>
                          <th className="p-2">
                            {t("admin.inventory_detail.transaction_quantity")}
                          </th>
                          <th className="p-2">
                            {t("admin.inventory_detail.transaction_reference")}
                          </th>
                          <th className="p-2">
                            {t("admin.inventory_detail.transaction_creator")}
                          </th>
                          <th className="p-2">
                            {t("admin.inventory_detail.transaction_notes")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventoryTransactions.map((transaction) => (
                          <tr
                            key={transaction.id}
                            className="border-b border-white/30"
                          >
                            <td className="p-2">
                              <span
                                className={`px-2 py-1 rounded text-xs text-white font-medium ${
                                  transactionTypes[transaction.type]?.color ||
                                  "bg-gray-500"
                                }`}
                              >
                                {t(transactionTypes[transaction.type]?.label) ||
                                  transaction.type}
                              </span>
                            </td>
                            <td className="p-2">
                              {formatDate(transaction.transactionDate)}
                            </td>
                            <td className="p-2 font-bold text-center">
                              <span
                                className={
                                  transaction.quantity > 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                {transaction.quantity > 0 ? "+" : ""}
                                {transaction.quantity}
                              </span>
                            </td>
                            <td className="p-2 font-mono text-xs bg-white/60 rounded">
                              {transaction.reference}
                            </td>
                            <td className="p-2">
                              {transaction.createdBy?.name}
                            </td>
                            <td className="p-2 text-gray-700">
                              {transaction.notes || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">📦</div>
                      <div>{t("admin.inventory_detail.no_transaction")}</div>
                      <div className="text-sm">
                        {t("admin.inventory_detail.no_transaction_desc")}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Thống kê giao dịch */}
          {inventoryTransactions.length > 0 && (
            <div className="mt-6 backdrop-blur-xl bg-white/60 border border-white/30 p-4 rounded-xl shadow-lg">
              <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                <IconAlertTriangle size={18} className="text-yellow-600" />
                {t("admin.inventory_detail.transaction_stats")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-100 p-3 rounded text-center">
                  <div className="text-lg font-bold text-green-700">
                    {totalIn}
                  </div>
                  <div className="text-sm text-green-600">
                    {t("admin.inventory_detail.total_in")}
                  </div>
                </div>
                <div className="bg-red-100 p-3 rounded text-center">
                  <div className="text-lg font-bold text-red-700">
                    {totalOut}
                  </div>
                  <div className="text-sm text-red-600">
                    {t("admin.inventory_detail.total_out")}
                  </div>
                </div>
                <div className="bg-yellow-100 p-3 rounded text-center">
                  <div className="text-lg font-bold text-yellow-700">
                    {totalAdjustment}
                  </div>
                  <div className="text-sm text-yellow-600">
                    {t("admin.inventory_detail.total_adjustment")}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-4 rounded-xl shadow-lg mt-3">
            <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
              <IconCalendar size={18} className="text-green-600" />
              {t("admin.inventory_detail.timestamps")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong className="text-gray-600">
                  {t("admin.inventory_detail.created_at")}:
                </strong>
                <span className="ml-2 text-gray-800">
                  {formatDate(inventory.createdAt)}
                </span>
              </div>
              <div>
                <strong className="text-gray-600">
                  {t("admin.inventory_detail.updated_at")}:
                </strong>
                <span className="ml-2 text-gray-800">
                  {formatDate(inventory.lastUpdated)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
