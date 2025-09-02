import { useState, useEffect } from "react";
import { IconEdit, IconTrash, IconEye, IconPlus } from "@tabler/icons-react";
import Pagination from "../../components/common/Pagination";
import PromotionForm from "../../components/ui/promotion/PromotionForm";
import PromotionDetailModal from "../../components/ui/promotion/PromotionDetailModal";
import { toast } from "react-toastify";

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
  {
    id: 3,
    name: "Giảm 20% cho tất cả sản phẩm",
    code: "SUMMER20",
    description: "Khuyến mãi mùa hè, giảm 20% cho tất cả sản phẩm",
    type: "PERCENT",
    value: 20,
    minOrderAmount: 0,
    maxUsage: 200,
    currentUsage: 150,
    startDate: "2024-06-01T00:00",
    endDate: "2024-08-31T23:59",
    active: true,
    applicableProducts: [],
  },
  {
    id: 4,
    name: "Giảm 100k cho đơn từ 1 triệu",
    code: "BIGSALE100K",
    description: "Giảm trực tiếp 100,000 VND cho đơn từ 1,000,000 VND",
    type: "AMOUNT",
    value: 100000,
    minOrderAmount: 1000000,
    maxUsage: 30,
    currentUsage: 5,
    startDate: "2024-09-01T00:00",
    endDate: "2024-09-30T23:59",
    active: true,
    applicableProducts: [
      { id: 5, name: "Đồng hồ Casio" },
      { id: 6, name: "Túi xách Gucci" },
    ],
  },
  {
    id: 5,
    name: "Giảm 15% cho đơn từ 700k",
    code: "FALL15",
    description: "Khuyến mãi mùa thu, giảm 15% cho đơn từ 700,000 VND",
    type: "PERCENT",
    value: 15,
    minOrderAmount: 700000,
    maxUsage: 80,
    currentUsage: 20,
    startDate: "2024-10-01T00:00",
    endDate: "2024-10-31T23:59",
    active: false,
    applicableProducts: [],
  },
  {
    id: 6,
    name: "Giảm 30k cho đơn từ 200k",
    code: "SAVE30K",
    description: "Giảm trực tiếp 30,000 VND cho đơn từ 200,000 VND",
    type: "AMOUNT",
    value: 30000,
    minOrderAmount: 200000,
    maxUsage: 150,
    currentUsage: 60,
    startDate: "2024-07-01T00:00",
    endDate: "2024-07-31T23:59",
    active: true,
    applicableProducts: [
      { id: 7, name: "Mũ lưỡi trai" },
      { id: 8, name: "Kính râm Ray-Ban" },
    ],
  },
  {
    id: 7,
    name: "Giảm 25% cho đơn từ 800k",
    code: "DISCOUNT25",
    description: "Giảm 25% cho đơn hàng từ 800,000 VND trở lên",
    type: "PERCENT",
    value: 25,
    minOrderAmount: 800000,
    maxUsage: 60,
    currentUsage: 15,
    startDate: "2024-11-01T00:00",
    endDate: "2024-11-30T23:59",
    active: true,
    applicableProducts: [
      { id: 9, name: "Váy maxi" },
      { id: 10, name: "Đầm dạ hội" },
    ],
  },
  {
    id: 8,
    name: "Giảm 40k cho đơn từ 400k",
    code: "LESS40K",
    description: "Giảm trực tiếp 40,000 VND cho đơn từ 400,000 VND",
    type: "AMOUNT",
    value: 40000,
    minOrderAmount: 400000,
    maxUsage: 70,
    currentUsage: 30,
    startDate: "2024-12-01T00:00",
    endDate: "2024-12-31T23:59",
    active: false,
    applicableProducts: [
      { id: 11, name: "Áo len" },
      { id: 12, name: "Quần tây" },
    ],
  },
  {
    id: 9,
    name: "Giảm 5% cho tất cả sản phẩm",
    code: "WELCOME5",
    description: "Khuyến mãi chào mừng, giảm 5% cho tất cả sản phẩm",
    type: "PERCENT",
    value: 5,
    minOrderAmount: 0,
    maxUsage: 500,
    currentUsage: 300,
    startDate: "2024-01-01T00:00",
    endDate: "2024-12-31T23:59",
    active: true,
    applicableProducts: [],
  },
  {
    id: 10,
    name: "Giảm 75k cho đơn từ 600k",
    code: "SUPER75K",
    description: "Giảm trực tiếp 75,000 VND cho đơn từ 600,000 VND",
    type: "AMOUNT",
    value: 75000,
    minOrderAmount: 600000,
    maxUsage: 40,
    currentUsage: 12,
    startDate: "2024-05-01T00:00",
    endDate: "2024-05-31T23:59",
    active: true,
    applicableProducts: [
      { id: 13, name: "Áo sơ mi" },
      { id: 14, name: "Chân váy" },
    ],
  },
  {
    id: 11,
    name: "Giảm 12% cho đơn từ 900k",
    code: "EXTRA12",
    description: "Giảm 12% cho đơn hàng từ 900,000 VND trở lên",
    type: "PERCENT",
    value: 12,
    minOrderAmount: 900000,
    maxUsage: 90,
    currentUsage: 40,
    startDate: "2024-03-01T00:00",
    endDate: "2024-03-31T23:59",
    active: false,
    applicableProducts: [
      { id: 15, name: "Áo khoác da" },
      { id: 16, name: "Boots da" },
    ],
  },
  {
    id: 12,
    name: "Giảm 20k cho đơn từ 150k",
    code: "QUICK20K",
    description: "Giảm trực tiếp 20,000 VND cho đơn từ 150,000 VND",
    type: "AMOUNT",
    value: 20000,
    minOrderAmount: 150000,
    maxUsage: 120,
    currentUsage: 45,
    startDate: "2024-02-01T00:00",
    endDate: "2024-02-28T23:59",
    active: true,
    applicableProducts: [
      { id: 17, name: "T-shirt nữ" },
      { id: 18, name: "Shorts jean" },
    ],
  },
];

// Mock data cho products và categories
const mockProducts = [
  { id: 1, name: "Áo Thun Nam" },
  { id: 2, name: "Quần Jeans" },
  { id: 3, name: "Giày Puma" },
  { id: 4, name: "Áo khoác Zara" },
  { id: 5, name: "Đồng hồ Casio" },
  { id: 6, name: "Túi xách Gucci" },
  { id: 7, name: "Mũ lưỡi trai" },
  { id: 8, name: "Kính râm Ray-Ban" },
  { id: 9, name: "Váy maxi" },
  { id: 10, name: "Đầm dạ hội" },
];

const mockCategories = [
  { id: 1, name: "Thời trang nam" },
  { id: 2, name: "Thời trang nữ" },
  { id: 3, name: "Phụ kiện" },
  { id: 4, name: "Giày dép" },
  { id: 5, name: "Túi xách" },
];

const typeLabels = {
  PERCENT: "Phần trăm",
  AMOUNT: "Tiền mặt",
};

export default function PromotionPage() {
  const [promotions, setPromotions] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetailPromotion, setSelectedDetailPromotion] = useState(null);
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

  // Xử lý tạo khuyến mãi mới
  const handleCreatePromotion = () => {
    setSelectedPromotion(null);
    setShowForm(true);
  };

  // Xử lý chỉnh sửa khuyến mãi
  const handleEditPromotion = (promotion) => {
    setSelectedPromotion(promotion);
    setShowForm(true);
  };

  // Xử lý xem chi tiết khuyến mãi
  const handleViewPromotion = (promotion) => {
    setSelectedDetailPromotion(promotion);
    setShowDetailModal(true);
  };

  // Xử lý xóa khuyến mãi (thực chất là deactivate)
  const handleDeletePromotion = (promotionId) => {
    const promotion = promotions.find((p) => p.id === promotionId);

    if (!promotion) {
      toast.error("Không tìm thấy khuyến mãi!");
      return;
    }

    const confirmDelete = () => {
      if (promotion.active) {
        setPromotions((prev) =>
          prev.map((p) => (p.id === promotionId ? { ...p, active: false } : p))
        );
        toast.success(`Đã vô hiệu hóa khuyến mãi "${promotion.name}"`, {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        setPromotions((prev) =>
          prev.map((p) => (p.id === promotionId ? { ...p, active: true } : p))
        );
        toast.success(`Đã kích hoạt lại khuyến mãi "${promotion.name}"`, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    };

    // Lưu toast ID để dismiss cụ thể
    const warningToastId = toast.warn(
      <div className="flex flex-col gap-3">
        <div>
          <strong>Xác nhận thao tác</strong>
        </div>
        <div>
          Bạn có chắc chắn muốn{" "}
          {promotion.active ? "vô hiệu hóa" : "kích hoạt lại"} khuyến mãi <br />
          <strong>"{promotion.name}"</strong>?
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              confirmDelete();
              toast.dismiss(warningToastId); // Dismiss chỉ toast warning này
            }}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
          >
            Xác nhận
          </button>
          <button
            onClick={() => toast.dismiss(warningToastId)} // Dismiss chỉ toast warning này
            className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400 transition-colors"
          >
            Hủy
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        draggable: false,
        toastId: `warning-${promotionId}`, // Thêm ID duy nhất
      }
    );
  };

  // Xử lý submit form (tạo mới hoặc cập nhật)
  const handleFormSubmit = (formData) => {
    console.log("Form submitted:", formData);

    if (selectedPromotion) {
      // Cập nhật promotion
      setPromotions((prev) =>
        prev.map((p) =>
          p.id === selectedPromotion.id
            ? {
                ...p,
                ...formData,
                id: selectedPromotion.id,
                // FIX: Chuyển đổi ID thành object có name
                applicableProducts: mockProducts.filter((product) =>
                  formData.applicableProducts.includes(product.id)
                ),
                applicableCategories: mockCategories.filter((category) =>
                  formData.applicableCategories.includes(category.id)
                ),
              }
            : p
        )
      );
      toast.success("Cập nhật khuyến mãi thành công!", {
        position: "top-right",
        autoClose: 3000,
      });
    } else {
      // Tạo promotion mới
      const newPromotion = {
        ...formData,
        id: Math.max(...promotions.map((p) => p.id)) + 1,
        currentUsage: 0,
        applicableProducts: mockProducts.filter((p) =>
          formData.applicableProducts.includes(p.id)
        ),
        applicableCategories: mockCategories.filter((c) =>
          formData.applicableCategories.includes(c.id)
        ),
      };
      setPromotions((prev) => [newPromotion, ...prev]);
      console.log("Promotion created");
    }

    setShowForm(false);
    setSelectedPromotion(null);
  };

  // Đóng form
  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedPromotion(null);
  };

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
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 flex items-center gap-2 transition-colors"
          onClick={handleCreatePromotion}
        >
          <IconPlus size={16} />
          Tạo khuyến mãi
        </button>
      </div>

      {/* Results Summary */}
      <div className="mb-4 text-sm text-gray-600">
        {`Hiển thị ${paginatedPromotions.length} trên tổng số ${filteredPromotions.length} khuyến mãi`}
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-400">
              <th className="p-2">ID</th>
              <th className="p-2">Tên</th>
              <th className="p-2">Code</th>
              <th className="p-2">Mô tả</th>
              <th className="p-2">Loại</th>
              <th className="p-2">Giá trị</th>
              <th className="p-2">Min Đơn</th>
              <th className="p-2">Max Lượt</th>
              <th className="p-2">Đã dùng</th>
              <th className="p-2">Bắt đầu</th>
              <th className="p-2">Kết thúc</th>
              <th className="p-2">Trạng thái</th>
              <th className="p-2">Sản phẩm áp dụng</th>
              <th className="p-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPromotions.length > 0 ? (
              paginatedPromotions.map((promo) => (
                <tr key={promo.id} className="border-b hover:bg-gray-300">
                  <td className="p-2">{promo.id}</td>
                  <td className="p-2 font-semibold">{promo.name}</td>
                  <td className="p-2">{promo.code}</td>
                  <td className="p-2">
                    {promo.description.length > 40
                      ? promo.description.slice(0, 40) + "..."
                      : promo.description}
                  </td>
                  <td className="p-2">
                    {typeLabels[promo.type] || promo.type}
                  </td>
                  <td className="p-2">
                    {promo.type === "PERCENT"
                      ? `${promo.value}%`
                      : `${promo.value.toLocaleString()} VND`}
                  </td>
                  <td className="p-2">
                    {promo.minOrderAmount.toLocaleString()} VND
                  </td>
                  <td className="p-2">{promo.maxUsage}</td>
                  <td className="p-2">{promo.currentUsage}</td>
                  <td className="p-2">{promo.startDate}</td>
                  <td className="p-2">{promo.endDate}</td>
                  <td className="p-2">
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
                  <td className="p-2">
                    {promo.applicableProducts.map((p) => p.name).join(", ")}
                  </td>
                  <td className="p-2 w-32">
                    <button
                      className="text-blue-600 hover:text-blue-800 mr-2 cursor-pointer"
                      onClick={() => handleViewPromotion(promo)}
                    >
                      <IconEye className="inline-block mr-1" />
                    </button>
                    <button
                      className="text-yellow-600 hover:text-yellow-800 mr-2 cursor-pointer"
                      onClick={() => handleEditPromotion(promo)}
                    >
                      <IconEdit className="inline-block mr-1" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800 cursor-pointer"
                      onClick={() => handleDeletePromotion(promo.id)}
                    >
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

      {showForm && (
        <PromotionForm
          isOpen={showForm}
          promotion={selectedPromotion}
          products={mockProducts}
          categories={mockCategories}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
        />
      )}
      {showDetailModal && (
        <PromotionDetailModal
          open={showDetailModal}
          promotion={selectedDetailPromotion}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedDetailPromotion(null);
          }}
        />
      )}
    </div>
  );
}
