import { useState, useEffect } from "react";

export default function OrderEditModal({ order, open, onClose, onSave }) {
  const [formData, setFormData] = useState({
    id: "",
    customer: "",
    date: "",
    status: "",
    total: "",
  });

  useEffect(() => {
    if (order) setFormData(order);
  }, [order]);

  if (!open || !order) return null;

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <form
        className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative"
        onSubmit={handleSubmit}
      >
        <button
          type="button"
          className="absolute top-4 right-4 bg-black text-white rounded-full w-8 h-8 flex items-center justify-center text-xl cursor-pointer"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-6">Chỉnh sửa đơn hàng</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Mã đơn</label>
            <input
              className="border rounded px-3 py-2 w-full bg-gray-100"
              value={formData.id}
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Khách hàng</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={formData.customer}
              onChange={(e) => handleChange("customer", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ngày đặt</label>
            <input
              type="date"
              className="border rounded px-3 py-2 w-full"
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Trạng thái</label>
            <select
              className="border rounded px-3 py-2 w-full"
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
              required
            >
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Tổng tiền (VND)
            </label>
            <input
              type="number"
              className="border rounded px-3 py-2 w-full"
              value={formData.total}
              onChange={(e) => handleChange("total", e.target.value)}
              required
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded"
            onClick={onClose}
          >
            Hủy
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Lưu thay đổi
          </button>
        </div>
      </form>
    </div>
  );
}
