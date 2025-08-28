import { useAuth } from "../../hooks/useAuth";

const stats = [
  { label: "Tổng đơn hàng", value: 200 },
  { label: "Tổng sàn phẩm", value: 150 },
  { label: "Tổng khách hàng", value: 50 },
  { label: "Tổng doanh thu", value: "4 000 000 VNĐ" },
];

const orders = [
  {
    id: "12345",
    customer: "John Doe",
    date: "2024-04-01",
    status: "Shipped",
    total: "300 000 VNĐ",
  },
  {
    id: "12346",
    customer: "Jane Smith",
    date: "2024-04-02",
    status: "Processing",
    total: "430 000 VNĐ",
  },
  {
    id: "12347",
    customer: "Michael Johnson",
    date: "2024-04-03",
    status: "Delivered",
    total: "220 000 VNĐ",
  },
  {
    id: "12348",
    customer: "Emily Davis",
    date: "2024-04-04",
    status: "Cancelled",
    total: "250 000 VNĐ",
  },
];

const customers = [
  { name: "John Doe", email: "john.doe@email.com" },
  { name: "Jane Smith", email: "jane.smith@eemail.com" },
  { name: "Michael Johnson", email: "michael.johnson@etalic" },
  { name: "Emily Davis", email: "emily.davis@email.com" },
];

const inventory = [
  { label: "Clothing", color: "#4285F4", percent: 40 },
  { label: "Shoes", color: "#34A853", percent: 30 },
  { label: "Accessories", color: "#FABB05", percent: 20 },
  { label: "Bags", color: "#EA4335", percent: 10 },
];

const statusColor = {
  Shipped: "#34A853",
  Processing: "#4285F4",
  Delivered: "#00C853",
  Cancelled: "#EA4335",
};

export default function AdminPage() {
  const { user } = useAuth();
  return (
    <div className="overflow-y-auto">
      <h1 className="text-3xl font-bold mb-6">
        Xin chào, {user?.name || "Admin"}
      </h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center"
          >
            <span className="text-gray-500">{stat.label}</span>
            <span className="text-2xl font-bold">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead>
              <tr>
                {["Order ID", "Customer", "Date", "Status", "Total"].map(
                  (header) => (
                    <th
                      key={header}
                      className="py-3 px-6 bg-gray-100 text-left text-sm font-semibold text-gray-600"
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-300">
                  <td className="py-3 px-6">{order.id}</td>
                  <td className="py-3 px-6">{order.customer}</td>
                  <td className="py-3 px-6">{order.date}</td>
                  <td className="py-3 px-6">
                    <span
                      className="px-3 py-1 rounded-full text-white text-sm"
                      style={{ backgroundColor: statusColor[order.status] }}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-6">{order.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Customers */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Top Customers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {customers.map((customer) => (
            <div
              key={customer.email}
              className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center"
            >
              <span className="text-lg font-semibold">{customer.name}</span>
              <span className="text-gray-500 text-sm">{customer.email}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Inventory Status */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Inventory Status</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          {inventory.map((item) => (
            <div key={item.label} className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="font-semibold">{item.label}</span>
                <span className="text-sm text-gray-500">{item.percent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="h-4 rounded-full"
                  style={{
                    width: `${item.percent}%`,
                    backgroundColor: item.color,
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
