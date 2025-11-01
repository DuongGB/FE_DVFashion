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
  const { isAuthenticated } = useAuth();
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

    // Handle empty cart with translated toast
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

    if (!isAuthenticated) {
      authModal.openLogin({ stayOnPage: true });
      return;
    }
    if (onOrder) {
      onOrder();
    }
  };

  return (
    <div>
      {/* Voucher & Thanh toán khi nhận hàng bar */}
      <div className="fixed bottom-0 left-0 w-full flex z-20">
        <div className="flex-1 flex items-center gap-8 bg-[#edeffe] px-12 py-4 border-t">
          <div className="flex items-center gap-2 font-semibold text-gray-700 text-lg">
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
          <div className="border-l h-8 mx-6" />
          <div className="flex items-center gap-2 font-medium">
            <span className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
              <IconCircleDashedPercentage size={24} />
            </span>
            {t("cart.voucher")}
          </div>
        </div>
        <div className="w-[600px] flex items-center justify-between bg-white px-10 py-4 border-t">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-blue-700">
              {computedTotal?.toLocaleString()}đ
            </span>
            <span className="ml-4 text-xs text-gray-500">
              {t("cart.save_amount")}{" "}
              <span className="font-bold">
                {computedDiscount > 0 ? discount?.toLocaleString() : "0"}đ
              </span>
            </span>
          </div>
          <button
            className="bg-black text-white px-10 py-3 rounded-lg text-medium font-bold cursor-pointer"
            disabled={creatingLock} // disable while creating
            onClick={handleOrderClick}
          >
            {creatingLock ? t("cart.processing") : t("cart.place_order")}
          </button>
        </div>
      </div>
    </div>
  );
}
