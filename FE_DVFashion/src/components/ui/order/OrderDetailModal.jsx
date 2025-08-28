export default function OrderDetailModal({ order, onClose }) {
  if (!order) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-2/3 lg:w-1/2 p-6 relative">
        <button
          className="absolute top-4 right-4 bg-black text-white rounded-full w-8 h-8 flex items-center justify-center text-xl cursor-pointer"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4">Chi tiết đơn hàng</h2>
        <div className="mb-4">
          <p>
            <strong>Mã đơn hàng:</strong> {order.id}
          </p>
          <p>
            <strong>Khách hàng:</strong> {order.customer}
          </p>
          <p>
            <strong>Trạng thái:</strong>{" "}
            <span
              className={`px-2 py-1 rounded text-white ${
                {
                  Shipped: "bg-blue-500",
                  Delivered: "bg-green-500",
                  Processing: "bg-yellow-500",
                  Pending: "bg-gray-500",
                  Cancelled: "bg-red-500",
                }[order.status]
              }`}
            >
              {order.status}
            </span>
          </p>
          <p>
            <strong>Tổng tiền:</strong> {order.total}
          </p>
        </div>
        <h3 className="text-xl font-semibold mb-2">Sản phẩm</h3>
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2 text-left">Tên sản phẩm</th>
              <th className="border p-2 text-left">Số lượng</th>
              <th className="border p-2 text-left">Giá</th>
            </tr>
          </thead>
          <tbody>
            {order.items && order.items.length > 0 ? (
              order.items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  <td className="border p-2">{item.name}</td>
                  <td className="border p-2">{item.quantity}</td>
                  <td className="border p-2">{item.price}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="border p-2 text-center text-gray-500"
                >
                  Không có sản phẩm nào trong đơn hàng.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
