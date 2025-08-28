const genderLabels = {
  MALE: "Nam",
  FEMALE: "Nữ",
  OTHER: "Khác",
};

export default function CustomerDetailModal({ customer, open, onClose }) {
  if (!open || !customer) return null;
  const defaultAddress = customer.addresses?.find((a) => a.isDefault);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 bg-black text-white rounded-full w-8 h-8 flex items-center justify-center text-xl cursor-pointer"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4">Chi tiết khách hàng</h2>
        <div className="space-y-2">
          <div>
            <strong>ID:</strong> {customer.id}
          </div>
          <div>
            <strong>Tên:</strong> {customer.fullName}
          </div>
          <div>
            <strong>Email:</strong> {customer.email}
          </div>
          <div>
            <strong>SĐT:</strong> {customer.phone}
          </div>
          <div>
            <strong>Giới tính:</strong>{" "}
            {genderLabels[customer.gender] || "Khác"}
          </div>
          <div>
            <strong>Ngày sinh:</strong> {customer.dob}
          </div>
          <div>
            <strong>Trạng thái:</strong>{" "}
            {customer.active ? (
              <span className="text-green-600 font-semibold">Active</span>
            ) : (
              <span className="text-gray-500">Inactive</span>
            )}
          </div>
          <div>
            <strong>Ngày tạo:</strong> {customer.createdAt}
          </div>
          <div>
            <strong>Ngày cập nhật:</strong> {customer.updatedAt}
          </div>
          <div>
            <strong>Địa chỉ mặc định:</strong>{" "}
            {defaultAddress ? (
              <span>
                {defaultAddress.street}, {defaultAddress.ward},{" "}
                {defaultAddress.district}, {defaultAddress.city},{" "}
                {defaultAddress.country}
              </span>
            ) : (
              <span className="text-gray-500">Không có địa chỉ mặc định</span>
            )}
          </div>
          <div>
            <strong>Tất cả địa chỉ:</strong>
            {customer.addresses && customer.addresses.length > 0 ? (
              <ul className="list-disc ml-4">
                {customer.addresses.map((a) => (
                  <li key={a.id}>
                    {a.street}, {a.ward}, {a.district}, {a.city}, {a.country}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-gray-500">Chưa có địa chỉ</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
