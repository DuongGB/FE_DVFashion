import { useState } from "react";
import { IconEye, IconEdit, IconTrash } from "@tabler/icons-react";
import OrderDetailModal from "../../components/ui/order/OrderDetailModal";
import OrderEditModal from "../../components/ui/order/OrderEditModal";
import Pagination from "../../components/common/Pagination";

const orders = [
  {
    id: "1",
    customer: "John Doe",
    date: "2024-04-01",
    status: "Shipped",
    total: "300,000 VND",
  },
  {
    id: "2",
    customer: "Jane Smith",
    date: "2024-04-02",
    status: "Processing",
    total: "430,000 VND",
  },
  {
    id: "3",
    customer: "Michael Johnson",
    date: "2024-04-03",
    status: "Delivered",
    total: "220,000 VND",
  },
  {
    id: "4",
    customer: "Emily Davis",
    date: "2024-04-04",
    status: "Cancelled",
    total: "250,000 VND",
  },
  {
    id: "5",
    customer: "John Doe",
    date: "2024-04-01",
    status: "Shipped",
    total: "300,000 VND",
  },
  {
    id: "6",
    customer: "Jane Smith",
    date: "2024-04-02",
    status: "Processing",
    total: "430,000 VND",
  },
  {
    id: "7",
    customer: "Michael Johnson",
    date: "2024-04-03",
    status: "Delivered",
    total: "220,000 VND",
  },
  {
    id: "8",
    customer: "Emily Davis",
    date: "2024-04-04",
    status: "Cancelled",
    total: "250,000 VND",
  },
  {
    id: "9",
    customer: "John Doe",
    date: "2024-04-01",
    status: "Shipped",
    total: "300,000 VND",
  },
  {
    id: "10",
    customer: "Jane Smith",
    date: "2024-04-02",
    status: "Processing",
    total: "430,000 VND",
  },
  {
    id: "11",
    customer: "Michael Johnson",
    date: "2024-04-03",
    status: "Delivered",
    total: "220,000 VND",
  },
  {
    id: "12",
    customer: "Emily Davis",
    date: "2024-04-04",
    status: "Cancelled",
    total: "250,000 VND",
  },
  {
    id: "13",
    customer: "John Doe",
    date: "2024-04-01",
    status: "Shipped",
    total: "300,000 VND",
  },
  {
    id: "14",
    customer: "Jane Smith",
    date: "2024-04-02",
    status: "Processing",
    total: "430,000 VND",
  },
  {
    id: "15",
    customer: "Michael Johnson",
    date: "2024-04-03",
    status: "Delivered",
    total: "220,000 VND",
  },
  {
    id: "16",
    customer: "Emily Davis",
    date: "2024-04-04",
    status: "Cancelled",
    total: "250,000 VND",
  },
  {
    id: "17",
    customer: "John Doe",
    date: "2024-04-01",
    status: "Shipped",
    total: "300,000 VND",
  },
  {
    id: "18",
    customer: "Jane Smith",
    date: "2024-04-02",
    status: "Processing",
    total: "430,000 VND",
  },
  {
    id: "19",
    customer: "Michael Johnson",
    date: "2024-04-03",
    status: "Delivered",
    total: "220,000 VND",
  },
  {
    id: "20",
    customer: "Emily Davis",
    date: "2024-04-04",
    status: "Cancelled",
    total: "250,000 VND",
  },
];

const statusColors = {
  Shipped: "bg-green-500",
  Delivered: "bg-green-600",
  Processing: "bg-blue-500",
  Pending: "bg-yellow-500",
  Cancelled: "bg-red-500",
};

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Pagination logic
  const filteredOrders = orders.filter(
    (order) =>
      (statusFilter === "Tất cả" || order.status === statusFilter) &&
      (order.customer.toLowerCase().includes(search.toLowerCase()) ||
        order.id.includes(search))
  );

  const totalPages = Math.ceil(filteredOrders.length / pageSize);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const statusOptions = [
    "Tất cả",
    "Shipped",
    "Delivered",
    "Processing",
    "Pending",
    "Cancelled",
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Quản lý đơn hàng</h1>

      {/* Thanh công cụ */}
      <div className="flex justify-between mb-4 items-center">
        <div className="flex gap-4 w-2/3">
          <input
            type="text"
            placeholder="Tìm kiếm đơn hàng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-4 py-2 w-2/3"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-4 py-2 w-1/3"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          + Tạo đơn hàng
        </button>
      </div>

      {/* Bảng đơn hàng */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Mã đơn</th>
              <th className="p-3">Khách hàng</th>
              <th className="p-3">Ngày đặt</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Tổng tiền</th>
              <th className="p-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedOrders.map((order) => (
              <tr key={order.id} className="border-b hover:bg-gray-300">
                <td className="p-3">{order.id}</td>
                <td className="p-3">{order.customer}</td>
                <td className="p-3">{order.date}</td>
                <td className="p-3">
                  <span
                    className={`text-white text-sm px-3 py-1 rounded-lg ${
                      statusColors[order.status]
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="p-3 font-semibold">{order.total}</td>
                <td className="p-3 space-x-2">
                  <button
                    className="text-blue-600 hover:text-blue-800 cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <IconEye className="inline-block mr-1" />
                    Xem
                  </button>
                  <button
                    className="text-yellow-600 hover:text-yellow-800 cursor-pointer"
                    onClick={() => setEditingOrder(order)}
                  >
                    <IconEdit className="inline-block mr-1" />
                    Sửa
                  </button>
                  <button className="text-red-600 hover:text-red-800 cursor-pointer">
                    <IconTrash className="inline-block mr-1" />
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {paginatedOrders.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  Không tìm thấy đơn hàng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
      <OrderEditModal
        order={editingOrder}
        open={!!editingOrder}
        onClose={() => setEditingOrder(null)}
        onSave={(updatedOrder) => {
          console.log("Saved order:", updatedOrder);
          setEditingOrder(null);
        }}
      />
    </div>
  );
}
