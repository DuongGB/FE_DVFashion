import {
  IconCircleDashedPercentage,
  IconTruckDelivery,
} from "@tabler/icons-react";
import { useAuthModal } from "../../contexts/AuthModalContext";
import { useAuth } from "../../hooks/useAuth";

export default function CartBottom({ cart }) {
  const { isAuthenticated } = useAuth();
  const authModal = useAuthModal();

  // Tính tổng tiền và giảm giá
  const total = cart?.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const discount = cart?.reduce(
    (acc, item) =>
      acc + item.price * item.quantity * (item.discountPercentage / 100),
    0
  );

  // Hàm xử lý khi nhấn nút Đặt hàng
  const handleOrderClick = () => {
    if (!isAuthenticated) {
      authModal.openLogin({ stayOnPage: true });
      return;
    }
    // Xử lý đặt hàng ở đây (chuyển đến trang thanh toán hoặc hiển thị modal)
  };

  return (
    <div>
      {/* Voucher & Thanh toán khi nhận hàng bar */}
      <div className="fixed bottom-0 left-0 w-full flex z-20">
        <div className="flex-1 flex items-center gap-8 bg-[#edeffe] px-12 py-4 border-t">
          <div className="flex items-center gap-2 font-semibold text-gray-700 text-lg">
            <IconTruckDelivery size={24} />
            Thanh toán khi nhận hàng
          </div>
          <div className="border-l h-8 mx-6" />
          <div className="flex items-center gap-2 font-medium">
            <span className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
              <IconCircleDashedPercentage size={24} />
            </span>
            Voucher
          </div>
        </div>
        <div className="w-[600px] flex items-center justify-between bg-white px-10 py-4 border-t">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-blue-700">
              {total?.toLocaleString()}đ
            </span>
            <span className="ml-4 text-xs text-gray-500">
              Tiết kiệm{" "}
              <span className="font-bold">
                {discount > 0 ? discount?.toLocaleString() : "0"}đ
              </span>
            </span>
          </div>
          <button
            className="bg-black text-white px-10 py-3 rounded-lg text-medium font-bold cursor-pointer"
            disabled={cart?.length === 0}
            onClick={handleOrderClick}
          >
            ĐẶT HÀNG
          </button>
        </div>
      </div>
    </div>
  );
}
