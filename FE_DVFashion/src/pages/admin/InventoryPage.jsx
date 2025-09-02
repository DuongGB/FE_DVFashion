import { useState, useEffect } from "react";
import {
  IconEdit,
  IconTrash,
  IconEye,
  IconPlus,
  IconFilter,
} from "@tabler/icons-react";
import Pagination from "../../components/common/Pagination";
import InventoryDetailModal from "../../components/ui/inventory/InventoryDetailModal";

// Mock data cho inventory
const mockInventories = [
  {
    id: 1,
    productVariant: {
      id: 1,
      name: "Áo Thun Nam - Đỏ - Size M",
      sku: "ATN-RED-M",
      product: { id: 1, name: "Áo Thun Nam" },
    },
    quantity: 100,
    reservedQuantity: 15,
    minStockLevel: 20,
    lastUpdated: "2024-09-01T10:30:00",
    transactions: [],
  },
  {
    id: 2,
    productVariant: {
      id: 2,
      name: "Quần Jeans - Xanh - Size L",
      sku: "QJ-BLUE-L",
      product: { id: 2, name: "Quần Jeans" },
    },
    quantity: 50,
    reservedQuantity: 8,
    minStockLevel: 15,
    lastUpdated: "2024-09-01T09:15:00",
    transactions: [],
  },
  {
    id: 3,
    productVariant: {
      id: 3,
      name: "Giày Sneaker - Trắng - Size 42",
      sku: "GS-WHITE-42",
      product: { id: 3, name: "Giày Sneaker" },
    },
    quantity: 5,
    reservedQuantity: 2,
    minStockLevel: 10,
    lastUpdated: "2024-08-31T16:45:00",
    transactions: [],
  },
  {
    id: 4,
    productVariant: {
      id: 4,
      name: "Áo Khoác - Đen - Size XL",
      sku: "AK-BLACK-XL",
      product: { id: 4, name: "Áo Khoác" },
    },
    quantity: 80,
    reservedQuantity: 12,
    minStockLevel: 25,
    lastUpdated: "2024-09-01T14:20:00",
    transactions: [],
  },
  {
    id: 5,
    productVariant: {
      id: 5,
      name: "Váy Maxi - Hồng - Size S",
      sku: "VM-PINK-S",
      product: { id: 5, name: "Váy Maxi" },
    },
    quantity: 2,
    reservedQuantity: 0,
    minStockLevel: 8,
    lastUpdated: "2024-08-30T11:30:00",
    transactions: [],
  },
];

// Mock data cho inventory transactions
const mockTransactions = [
  {
    id: 1,
    inventory: { id: 1 },
    type: "IN",
    quantity: 50,
    reference: "PO-001",
    notes: "Nhập hàng từ nhà cung cấp",
    transactionDate: "2024-09-01T08:00:00",
    createdBy: { id: 1, name: "Nguyễn Văn A" },
  },
  {
    id: 2,
    inventory: { id: 2 },
    type: "OUT",
    quantity: -5,
    reference: "ORDER-123",
    notes: "Xuất hàng cho đơn hàng",
    transactionDate: "2024-09-01T10:30:00",
    createdBy: { id: 2, name: "Trần Thị B" },
  },
  {
    id: 3,
    inventory: { id: 3 },
    type: "ADJUSTMENT",
    quantity: -2,
    reference: "ADJ-001",
    notes: "Điều chỉnh hàng hỏng",
    transactionDate: "2024-08-31T15:00:00",
    createdBy: { id: 1, name: "Nguyễn Văn A" },
  },
];

export default function InventoryPage() {
  const [inventories, setInventories] = useState([]);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const pageSize = 10;

  useEffect(() => {
    setInventories(mockInventories);
    setTransactions(mockTransactions);
  }, []);

  // Lọc inventory
  const filteredInventories = inventories.filter((inventory) => {
    const matchesSearch =
      inventory.productVariant.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      inventory.productVariant.sku
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      inventory.id.toString().includes(search);

    const matchesStockFilter = (() => {
      switch (stockFilter) {
        case "low":
          return inventory.quantity <= inventory.minStockLevel;
        case "out":
          return inventory.quantity === 0;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesStockFilter;
  });

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
    if (inventory.quantity === 0) return "text-red-600 font-bold";
    if (inventory.quantity <= inventory.minStockLevel)
      return "text-yellow-600 font-bold";
    return "text-green-600";
  };

  // Tính available quantity (quantity - reservedQuantity)
  const getAvailableQuantity = (inventory) => {
    return inventory.quantity - inventory.reservedQuantity;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Quản Lý Kho Hàng</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng sản phẩm</p>
              <p className="text-2xl font-bold text-gray-900">
                {inventories.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Tồn kho bình thường
              </p>
              <p className="text-2xl font-bold text-green-600">
                {
                  inventories.filter((inv) => inv.quantity > inv.minStockLevel)
                    .length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sắp hết hàng</p>
              <p className="text-2xl font-bold text-yellow-600">
                {
                  inventories.filter(
                    (inv) =>
                      inv.quantity > 0 && inv.quantity <= inv.minStockLevel
                  ).length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hết hàng</p>
              <p className="text-2xl font-bold text-red-600">
                {inventories.filter((inv) => inv.quantity === 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex justify-between mb-4 items-center gap-4 bg-white p-4 rounded-lg shadow border">
        <div className="flex gap-4 items-center w-2/3">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, SKU hoặc ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-4 py-2 flex-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="border rounded-lg px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả</option>
            <option value="low">Sắp hết hàng</option>
            <option value="out">Hết hàng</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors">
            <IconPlus size={16} />
            Nhập kho
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors">
            <IconFilter size={16} />
            Điều chỉnh
          </button>
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-600">
        {`Hiển thị ${paginatedInventories.length} trên tổng số ${filteredInventories.length} bản ghi`}
      </div>

      {/* Inventory Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-400">
              <th className="p-3">ID</th>
              <th className="p-3">Sản phẩm</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Số lượng</th>
              <th className="p-3">Đặt trước</th>
              <th className="p-3">Khả dụng</th>
              <th className="p-3">Mức tối thiểu</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Cập nhật cuối</th>
              <th className="p-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedInventories.length > 0 ? (
              paginatedInventories.map((inventory) => (
                <tr key={inventory.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{inventory.id}</td>
                  <td className="p-3">
                    <div>
                      <div className="font-medium">
                        {inventory.productVariant.product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {inventory.productVariant.name}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-sm">
                    {inventory.productVariant.sku}
                  </td>
                  <td
                    className={`p-3 font-bold ${getStockLevelColor(inventory)}`}
                  >
                    {inventory.quantity}
                  </td>
                  <td className="p-3 text-blue-600">
                    {inventory.reservedQuantity}
                  </td>
                  <td className="p-3 font-medium">
                    {getAvailableQuantity(inventory)}
                  </td>
                  <td className="p-3">{inventory.minStockLevel}</td>
                  <td className="p-3">
                    {inventory.quantity === 0 ? (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded ">
                        Hết hàng
                      </span>
                    ) : inventory.quantity <= inventory.minStockLevel ? (
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded ">
                        Sắp hết
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded ">
                        Bình thường
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-gray-600">
                    {formatDate(inventory.lastUpdated)}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        className="text-blue-600 hover:text-blue-800 p-1 cursor-pointer"
                        onClick={() => handleViewDetail(inventory)}
                        title="Xem lịch sử giao dịch"
                      >
                        <IconEye />
                      </button>
                      <button
                        className="text-yellow-600 hover:text-yellow-800 p-1 cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <IconEdit />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="text-center py-6 text-gray-500">
                  Không có dữ liệu kho hàng.
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
        transactions={transactions}
        open={showDetailModal}
        onClose={handleCloseDetailModal}
      />
    </div>
  );
}
