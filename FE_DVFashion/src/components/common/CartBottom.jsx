import {
  IconCircleDashedPercentage,
  IconCreditCard,
  IconTruckDelivery,
} from "@tabler/icons-react";
import { useAuthModal } from "../../contexts/AuthModalContext";
import { useAuth } from "../../hooks/useAuth";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

export default function CartBottom({
  cart,
  total,
  discount,
  onOrder,
  isLoading,
  paymentMethod,
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const authModal = useAuthModal();

  // simple lock check from localStorage (same key used in useCreateOrder)
  const creatingTimestamp =
    typeof window !== "undefined"
      ? Number(localStorage.getItem("creatingOrderInProgress") || 0)
      : 0;
  const creatingLock =
    isLoading || (creatingTimestamp && Date.now() - creatingTimestamp < 60_000);

  // Nếu truyền total từ trên xuống thì dùng, không thì tự tính
  const computedTotal =
    typeof total === "number"
      ? total
      : cart?.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  // Nếu truyền discount từ trên xuống thì dùng, không thì tự tính
  const computedDiscount =
    typeof discount === "number"
      ? discount
      : cart?.reduce(
          (acc, item) =>
            acc +
            (item.oldPrice ? item.oldPrice : item.unitPrice) * item.quantity,
          0
        ) - computedTotal;

  // Hàm xử lý khi nhấn nút Đặt hàng
  const handleOrderClick = () => {
    if (isLoading) return;

    if (!isAuthenticated) {
      toast.warn(t("cart.not_logged_in"));
      return;
    }

    // Kiểm tra giỏ hàng trống
    if (!cart || cart.length === 0) {
      toast.info(t("cart.empty_cart"));
      return;
    }

    if (creatingLock) {
      toast.info(
        t("order.create_in_progress") || "Đang tạo đơn hàng, vui lòng chờ..."
      );
      return;
    }

    if (onOrder) {
      onOrder();
    }
  };

  return (
    <div>
      {/* Voucher & Thanh toán khi nhận hàng bar */}
      <div className="fixed bottom-0 left-0 w-full flex z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] lg:shadow-none">
        <div className="hidden lg:flex flex-1 items-center gap-4 xl:gap-8 bg-[#edeffe] px-4 xl:px-12 py-4 border-t">
          <div className="flex items-center gap-2 font-semibold text-gray-700 text-sm xl:text-lg">
            {paymentMethod === "cod" ? (
              <>
                <IconTruckDelivery size={24} />
                {t("cart.payment_cod")}
              </>
            ) : (
              <>
                <IconCreditCard size={24} />
                {t("cart.payment_online")}
              </>
            )}
          </div>
          <div className="border-l h-8 mx-2 xl:mx-6 border-gray-300" />
          <div className="flex items-center gap-2 font-medium text-sm xl:text-base">
            <span className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-xs flex-shrink-0">
              <IconCircleDashedPercentage size={16} />
            </span>
            <span className="truncate">{t("cart.voucher")}</span>
          </div>
        </div>
        <div className="w-full lg:w-[500px] xl:w-[600px] flex items-center justify-between bg-white px-4 md:px-6 lg:px-10 py-4 border-t border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center">
            <span className="text-xl md:text-2xl font-bold text-blue-700">
              {computedTotal?.toLocaleString()}đ
            </span>
            <span className="text-xs text-gray-500 mt-1 md:mt-0 md:ml-4">
              {t("cart.save_amount")}{" "}
              <span className="font-bold text-green-600">
                {computedDiscount > 0 ? discount?.toLocaleString() : "0"}đ
              </span>
            </span>
          </div>
          <button
            className="bg-black text-white px-6 md:px-10 py-3 rounded-lg text-sm md:text-base font-bold cursor-pointer hover:bg-gray-800 transition active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap ml-4"
            disabled={creatingLock}
            onClick={handleOrderClick}
          >
            {creatingLock ? t("cart.processing") : t("cart.place_order")}
          </button>
        </div>
      </div>
    </div>
  );
}
