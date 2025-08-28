import { useState, useEffect } from "react";
import { IconEdit, IconTrash, IconEye } from "@tabler/icons-react";
import Pagination from "../../components/common/Pagination";

// Mock data theo hình
const mockPromotions = [
  {
    id: 1,
    name: "Giảm 10% cho đơn từ 500k",
    code: "PROMO10",
    description: "Áp dụng cho đơn hàng từ 500,000 VND trở lên",
    type: "PERCENT",
    value: 10,
    minOrderAmount: 500000,
    maxUsage: 100,
    currentUsage: 25,
    startDate: "2024-08-01T00:00",
    endDate: "2024-09-01T23:59",
    active: true,
    applicableProducts: [
      { id: 1, name: "Áo Thun Nam" },
      { id: 2, name: "Quần Jeans" },
    ],
  },
  {
    id: 2,
    name: "Giảm 50k cho đơn từ 300k",
    code: "PROMO50K",
    description: "Giảm trực tiếp 50,000 VND cho đơn từ 300,000 VND",
    type: "AMOUNT",
    value: 50000,
    minOrderAmount: 300000,
    maxUsage: 50,
    currentUsage: 10,
    startDate: "2024-08-15T00:00",
    endDate: "2024-09-15T23:59",
    active: false,
    applicableProducts: [
      { id: 3, name: "Giày Puma" },
      { id: 4, name: "Áo khoác Zara" },
    ],
  },
];

const typeLabels = {
  PERCENT: "Phần trăm",
  AMOUNT: "Tiền mặt",
};

export default function PromotionPage() {
  const [promotions, setPromotions] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setPromotions(mockPromotions);
  }, []);

  // Lọc theo tên, code hoặc id
  const filteredPromotions = promotions.filter(
    (promo) =>
      promo.name.toLowerCase().includes(search.toLowerCase()) ||
      promo.code.toLowerCase().includes(search.toLowerCase()) ||
      promo.id.toString().includes(search)
  );

  const totalPages = Math.ceil(filteredPromotions.length / pageSize);
  const paginatedPromotions = filteredPromotions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Quản lý khuyến mãi</h1>
      <div className="flex justify-between mb-4 items-center">
        <div className="flex gap-4 w-2/3">
          <input
            type="text"
            placeholder="Tìm kiếm khuyến mãi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-4 py-2 w-2/3"
          />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          + Tạo khuyến mãi
        </button>
      </div>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-400">
              <th className="p-3">ID</th>
              <th className="p-3">Tên</th>
              <th className="p-3">Code</th>
              <th className="p-3">Mô tả</th>
              <th className="p-3">Loại</th>
              <th className="p-3">Giá trị</th>
              <th className="p-3">Min Đơn</th>
              <th className="p-3">Max Lượt</th>
              <th className="p-3">Đã dùng</th>
              <th className="p-3">Bắt đầu</th>
              <th className="p-3">Kết thúc</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Sản phẩm áp dụng</th>
              <th className="p-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPromotions.length > 0 ? (
              paginatedPromotions.map((promo) => (
                <tr key={promo.id} className="border-b hover:bg-gray-300">
                  <td className="p-3">{promo.id}</td>
                  <td className="p-3 font-semibold">{promo.name}</td>
                  <td className="p-3">{promo.code}</td>
                  <td className="p-3">
                    {promo.description.length > 40
                      ? promo.description.slice(0, 40) + "..."
                      : promo.description}
                  </td>
                  <td className="p-3">
                    {typeLabels[promo.type] || promo.type}
                  </td>
                  <td className="p-3">
                    {promo.type === "PERCENT"
                      ? `${promo.value}%`
                      : `${promo.value.toLocaleString()} VND`}
                  </td>
                  <td className="p-3">
                    {promo.minOrderAmount.toLocaleString()} VND
                  </td>
                  <td className="p-3">{promo.maxUsage}</td>
                  <td className="p-3">{promo.currentUsage}</td>
                  <td className="p-3">{promo.startDate}</td>
                  <td className="p-3">{promo.endDate}</td>
                  <td className="p-3">
                    {promo.active ? (
                      <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                        Active
                      </span>
                    ) : (
                      <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    {promo.applicableProducts.map((p) => p.name).join(", ")}
                  </td>
                  <td className="p-3 w-32">
                    <button className="text-blue-600 hover:text-blue-800 mr-2 cursor-pointer">
                      <IconEye className="inline-block mr-1" />
                    </button>
                    <button className="text-yellow-600 hover:text-yellow-800 mr-2 cursor-pointer">
                      <IconEdit className="inline-block mr-1" />
                    </button>
                    <button className="text-red-600 hover:text-red-800 cursor-pointer">
                      <IconTrash className="inline-block mr-1" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={14} className="text-center py-6 text-gray-500">
                  Không có khuyến mãi nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalItems={filteredPromotions.length}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
}
