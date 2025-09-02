const transactionTypes = {
  IN: { label: "Nhập kho", color: "bg-green-500" },
  OUT: { label: "Xuất kho", color: "bg-red-500" },
  ADJUSTMENT: { label: "Điều chỉnh", color: "bg-yellow-500" },
  RESERVED: { label: "Đặt trước", color: "bg-blue-500" },
  RELEASED: { label: "Giải phóng", color: "bg-purple-500" },
};

export default function InventoryDetailModal({
  inventory,
  transactions,
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
    return inventory.quantity - inventory.reservedQuantity;
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
  const inventoryTransactions = transactions.filter(
    (t) => t.inventory.id === inventory.id
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-5xl relative overflow-auto scrollbar-hide max-h-[90vh]"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 bg-black text-white rounded-full w-8 h-8 flex items-center justify-center text-xl cursor-pointer hover:bg-gray-800 transition-colors"
          onClick={onClose}
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Chi tiết tồn kho
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-gray-700">
                Thông tin sản phẩm
              </h3>
              <div className="space-y-3">
                <div>
                  <strong className="text-gray-600">ID Inventory:</strong>
                  <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono text-sm">
                    #{inventory.id}
                  </span>
                </div>
                <div>
                  <strong className="text-gray-600">Sản phẩm:</strong>
                  <span className="ml-2 font-medium">
                    {inventory.productVariant.product.name}
                  </span>
                </div>
                <div>
                  <strong className="text-gray-600">Biến thể:</strong>
                  <span className="ml-2 text-gray-700">
                    {inventory.productVariant.name}
                  </span>
                </div>
                <div>
                  <strong className="text-gray-600">SKU:</strong>
                  <span className="ml-2 bg-gray-100 text-gray-800 px-2 py-1 rounded font-mono text-sm">
                    {inventory.productVariant.sku}
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

            {/* Stock Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-gray-700">
                Thông tin tồn kho
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="text-2xl font-bold text-blue-600">
                      {inventory.quantity}
                    </div>
                    <div className="text-sm text-gray-600">Tổng số lượng</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="text-2xl font-bold text-orange-600">
                      {inventory.reservedQuantity}
                    </div>
                    <div className="text-sm text-gray-600">Đặt trước</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white rounded border">
                    <div
                      className={`text-2xl font-bold ${stockStatus.textColor}`}
                    >
                      {getAvailableQuantity(inventory)}
                    </div>
                    <div className="text-sm text-gray-600">Khả dụng</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded border">
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
          </div>

          {/* Transaction History */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-gray-700">
                Lịch sử giao dịch
                <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-normal">
                  {inventoryTransactions.length} giao dịch
                </span>
              </h3>

              <div className="max-h-96 overflow-y-auto">
                {inventoryTransactions.length > 0 ? (
                  <div className="space-y-2">
                    {inventoryTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="bg-white p-3 rounded border border-gray-200 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded text-xs text-white font-medium ${
                                transactionTypes[transaction.type]?.color ||
                                "bg-gray-500"
                              }`}
                            >
                              {transactionTypes[transaction.type]?.label ||
                                transaction.type}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatDate(transaction.transactionDate)}
                            </span>
                          </div>
                          <span
                            className={`font-bold text-sm ${
                              transaction.quantity > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.quantity > 0 ? "+" : ""}
                            {transaction.quantity}
                          </span>
                        </div>

                        <div className="text-sm space-y-1">
                          <div>
                            <strong className="text-gray-600">
                              Tham chiếu:
                            </strong>
                            <span className="ml-1 font-mono text-xs bg-gray-100 px-1 rounded">
                              {transaction.reference}
                            </span>
                          </div>
                          {transaction.notes && (
                            <div>
                              <strong className="text-gray-600">
                                Ghi chú:
                              </strong>
                              <span className="ml-1 text-gray-700">
                                {transaction.notes}
                              </span>
                            </div>
                          )}
                          <div>
                            <strong className="text-gray-600">
                              Người tạo:
                            </strong>
                            <span className="ml-1 text-gray-700">
                              {transaction.createdBy.name}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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

        {/* Statistics Summary */}
        {inventoryTransactions.length > 0 && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 text-gray-700">
              Thống kê giao dịch
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-100 p-3 rounded text-center">
                <div className="text-lg font-bold text-green-700">
                  {inventoryTransactions
                    .filter((t) => t.type === "IN")
                    .reduce((sum, t) => sum + Math.abs(t.quantity), 0)}
                </div>
                <div className="text-sm text-green-600">Tổng nhập</div>
              </div>
              <div className="bg-red-100 p-3 rounded text-center">
                <div className="text-lg font-bold text-red-700">
                  {inventoryTransactions
                    .filter((t) => t.type === "OUT")
                    .reduce((sum, t) => sum + Math.abs(t.quantity), 0)}
                </div>
                <div className="text-sm text-red-600">Tổng xuất</div>
              </div>
              <div className="bg-yellow-100 p-3 rounded text-center">
                <div className="text-lg font-bold text-yellow-700">
                  {inventoryTransactions
                    .filter((t) => t.type === "ADJUSTMENT")
                    .reduce((sum, t) => sum + Math.abs(t.quantity), 0)}
                </div>
                <div className="text-sm text-yellow-600">Điều chỉnh</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
