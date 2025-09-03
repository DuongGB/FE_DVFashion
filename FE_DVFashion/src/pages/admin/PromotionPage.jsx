import { useState, useEffect } from "react";
import { IconEdit, IconTrash, IconEye, IconPlus } from "@tabler/icons-react";
import Pagination from "../../components/common/Pagination";
import PromotionForm from "../../components/ui/promotion/PromotionForm";
import PromotionDetailModal from "../../components/ui/promotion/PromotionDetailModal";
import { toast } from "react-toastify";
import { showConfirmationToast } from "../../utils/showConfirmationToast";

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
  const handleDeletePromotion = async (promotionId) => {
    const promotion = promotions.find((p) => p.id === promotionId);

    if (!promotion) {
      toast.error("Không tìm thấy khuyến mãi!");
      return;
    }

    // Determine action based on current status
    const isActivating = !promotion.active;
    const action = isActivating ? "kích hoạt" : "vô hiệu hóa";

    const confirmText = isActivating ? "Kích hoạt" : "Vô hiệu hóa";
    const cancelText = "Hủy";

    const title = isActivating
      ? "Xác nhận kích hoạt khuyến mãi"
      : "Xác nhận vô hiệu hóa khuyến mãi";

    const message = isActivating
      ? `Bạn có chắc chắn muốn kích hoạt lại khuyến mãi "${promotion.name}" không? Khuyến mãi sẽ có hiệu lực và khách hàng có thể sử dụng.`
      : `Bạn có chắc chắn muốn vô hiệu hóa khuyến mãi "${promotion.name}" không? Khuyến mãi sẽ không hiển thị và khách hàng không thể sử dụng.`;

    showConfirmationToast({
      title,
      message,
      confirmText,
      cancelText,
      confirmButtonClass: isActivating
        ? "bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors cursor-pointer"
        : "bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors cursor-pointer",
      onConfirm: async () => {
        try {
          setPromotions((prev) =>
            prev.map((p) =>
              p.id === promotionId ? { ...p, active: !p.active } : p
            )
          );

          const successMessage = isActivating
            ? `Đã kích hoạt khuyến mãi "${promotion.name}" thành công!`
            : `Đã vô hiệu hóa khuyến mãi "${promotion.name}" thành công!`;

          toast.success(successMessage);
        } catch (error) {
          console.error("Error toggling promotion status:", error);
          const errorMessage = `Có lỗi xảy ra khi ${action} khuyến mãi!`;
          toast.error(errorMessage);
        }
      },
    });
  };

  // Xử lý submit form (tạo mới hoặc cập nhật)
  const handleFormSubmit = (formData) => {
    console.log("Form submitted:", formData);

    try {
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
        toast.success("Cập nhật khuyến mãi thành công!");
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
        toast.success("Tạo khuyến mãi mới thành công!");
      }

      setShowForm(false);
      setSelectedPromotion(null);
    } catch (error) {
      console.error("Error submitting promotion:", error);
      toast.error("Có lỗi xảy ra khi lưu khuyến mãi!");
    }
  };

  // Đóng form
  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedPromotion(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Quản lý Khuyến mãi</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 flex items-center gap-2 transition-colors"
          onClick={handleCreatePromotion}
        >
          <IconPlus size={16} />
          Tạo khuyến mãi
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Tổng khuyến mãi
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {promotions.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Đang hoạt động
              </p>
              <p className="text-2xl font-bold text-green-600">
                {promotions.filter((p) => p.active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Không hoạt động
              </p>
              <p className="text-2xl font-bold text-red-600">
                {promotions.filter((p) => !p.active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Hết hạn sử dụng
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {promotions.filter((p) => p.currentUsage >= p.maxUsage).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Basic filter */}
      <div className="bg-white p-4 rounded-lg shadow border mb-4 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex gap-4 w-2/3">
          <input
            type="text"
            placeholder="Tìm kiếm khuyến mãi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-4 py-2 flex-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {/* Lọc theo trạng thái */}
        <select
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onChange={(e) => {
            const value = e.target.value;
            if (value === "all") {
              setPromotions(mockPromotions);
            }
            if (value === "active") {
              setPromotions(mockPromotions.filter((p) => p.active));
            }
            if (value === "inactive") {
              setPromotions(mockPromotions.filter((p) => !p.active));
            }
          }}
        >
          <option value="all">Tất cả</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Không hoạt động</option>
        </select>
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
                  <td className="p-3">
                    <div className="flex gap-1">
                      <button
                        className="text-blue-600 hover:text-blue-800 cursor-pointer p-1"
                        onClick={() => handleViewPromotion(promo)}
                        title="Xem chi tiết"
                      >
                        <IconEye size={24} />
                      </button>
                      <button
                        className="text-yellow-600 hover:text-yellow-800 cursor-pointer p-1"
                        onClick={() => handleEditPromotion(promo)}
                        title="Chỉnh sửa"
                      >
                        <IconEdit size={24} />
                      </button>
                      <button
                        className={`cursor-pointer p-1 ${
                          promo.active
                            ? "text-red-600 hover:text-red-800"
                            : "text-green-600 hover:text-green-800"
                        }`}
                        onClick={() => handleDeletePromotion(promo.id)}
                        title={
                          promo.active
                            ? "Vô hiệu hóa khuyến mãi"
                            : "Kích hoạt khuyến mãi"
                        }
                      >
                        <IconTrash size={24} />
                      </button>
                    </div>
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
