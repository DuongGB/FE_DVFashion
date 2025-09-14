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

const transactionTypes = {
  IN: { label: "Nhập kho", color: "bg-green-500" },
  OUT: { label: "Xuất kho", color: "bg-red-500" },
  ADJUSTMENT: { label: "Điều chỉnh", color: "bg-yellow-500" },
  RESERVED: { label: "Đặt trước", color: "bg-blue-500" },
  RELEASED: { label: "Giải phóng", color: "bg-purple-500" },
};

export default function InventoryDetailModal({
  inventory,
  transactions = [],
  open,
  onClose,
}) {
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
        label: "Hết hàng",
        color: "bg-red-100 text-red-800",
        textColor: "text-red-600",
      };
    }
    if (inventory.quantity <= inventory.minStockLevel) {
      return {
        label: "Sắp hết hàng",
        color: "bg-yellow-100 text-yellow-800",
        textColor: "text-yellow-600",
      };
    }
    return {
      label: "Bình thường",
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto flex flex-col"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center gap-3">
            <IconBox size={28} className="text-white" />
            <h2 className="text-2xl font-bold">Chi tiết tồn kho</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-black/70 text-white rounded-full hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <IconX size={20} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Thông tin sản phẩm & tồn kho */}
            <div className="space-y-4">
              {/* Thông tin sản phẩm */}
              <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                  <IconPackage size={18} className="text-blue-600" />
                  Thông tin sản phẩm
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <strong className="text-gray-600">ID Inventory:</strong>
                    <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono text-sm">
                      #{inventory.id}
                    </span>
                  </div>
                  <div>
                    <strong className="text-gray-600">Sản phẩm:</strong>
                    <span className="ml-2 font-medium">
                      {inventory.productName}
                    </span>
                  </div>
                  <div>
                    <strong className="text-gray-600">Màu sắc:</strong>
                    <span className="ml-2 flex items-center gap-1">
                      <IconPalette size={16} className="text-blue-400" />
                      {inventory.productColor}
                    </span>
                  </div>
                  <div>
                    <strong className="text-gray-600">Size:</strong>
                    <span className="ml-2 flex items-center gap-1">
                      <IconRuler size={16} className="text-green-400" />
                      {inventory.sizeName}
                    </span>
                  </div>
                  <div>
                    <strong className="text-gray-600">Cập nhật cuối:</strong>
                    <span className="ml-2 text-sm">
                      {formatDate(inventory.lastUpdated)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Thông tin tồn kho */}
              <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                  <IconClipboardList size={18} className="text-purple-600" />
                  Thông tin tồn kho
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded border">
                    <div className="text-2xl font-bold text-blue-600">
                      {inventory.quantityInStock}
                    </div>
                    <div className="text-sm text-gray-600">Tổng số lượng</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded border">
                    <div className="text-2xl font-bold text-orange-600">
                      {inventory.reservedQuantity}
                    </div>
                    <div className="text-sm text-gray-600">Đặt trước</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded border">
                    <div
                      className={`text-2xl font-bold ${stockStatus.textColor}`}
                    >
                      {getAvailableQuantity(inventory)}
                    </div>
                    <div className="text-sm text-gray-600">Khả dụng</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded border">
                    <div className="text-2xl font-bold text-red-600">
                      {inventory.minStockLevel}
                    </div>
                    <div className="text-sm text-gray-600">Mức tối thiểu</div>
                  </div>
                </div>
                <div className="mt-3">
                  <strong className="text-gray-600">Trạng thái:</strong>
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
              <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                  <IconHistory size={18} className="text-orange-600" />
                  Lịch sử giao dịch
                  <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-normal">
                    {inventoryTransactions.length} giao dịch
                  </span>
                </h3>
                <div className="max-h-96 overflow-y-auto">
                  {inventoryTransactions.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="p-2">Loại</th>
                          <th className="p-2">Ngày</th>
                          <th className="p-2">SL</th>
                          <th className="p-2">Tham chiếu</th>
                          <th className="p-2">Người tạo</th>
                          <th className="p-2">Ghi chú</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventoryTransactions.map((transaction) => (
                          <tr key={transaction.id} className="border-b">
                            <td className="p-2">
                              <span
                                className={`px-2 py-1 rounded text-xs text-white font-medium ${
                                  transactionTypes[transaction.type]?.color ||
                                  "bg-gray-500"
                                }`}
                              >
                                {transactionTypes[transaction.type]?.label ||
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
                            <td className="p-2 font-mono text-xs bg-gray-100 rounded">
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
                      <div>Chưa có giao dịch nào</div>
                      <div className="text-sm">
                        Các giao dịch nhập/xuất kho sẽ hiển thị tại đây
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Thống kê giao dịch */}
          {inventoryTransactions.length > 0 && (
            <div className="mt-6 bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                <IconAlertTriangle size={18} className="text-yellow-600" />
                Thống kê giao dịch
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-100 p-3 rounded text-center">
                  <div className="text-lg font-bold text-green-700">
                    {totalIn}
                  </div>
                  <div className="text-sm text-green-600">Tổng nhập</div>
                </div>
                <div className="bg-red-100 p-3 rounded text-center">
                  <div className="text-lg font-bold text-red-700">
                    {totalOut}
                  </div>
                  <div className="text-sm text-red-600">Tổng xuất</div>
                </div>
                <div className="bg-yellow-100 p-3 rounded text-center">
                  <div className="text-lg font-bold text-yellow-700">
                    {totalAdjustment}
                  </div>
                  <div className="text-sm text-yellow-600">Điều chỉnh</div>
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm mt-6">
            <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
              <IconCalendar size={18} className="text-green-600" />
              Thời gian
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong className="text-gray-600">Tạo lúc:</strong>
                <span className="ml-2 text-gray-800">
                  {formatDate(inventory.createdAt)}
                </span>
              </div>
              <div>
                <strong className="text-gray-600">Cập nhật lúc:</strong>
                <span className="ml-2 text-gray-800">
                  {formatDate(inventory.lastUpdated)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
