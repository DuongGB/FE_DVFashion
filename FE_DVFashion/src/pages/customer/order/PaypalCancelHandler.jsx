import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCancelPayPal } from "../../../hooks/useOrder";
import { RingLoader } from "react-spinners";
import { useTranslation } from "react-i18next";
import { useCart } from "../../../hooks/useCart";

export default function PayPalCancelHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const cancelPayPalMutation = useCancelPayPal();
  const { clearCart } = useCart();

  useEffect(() => {
    const orderNumber = searchParams.get("orderNumber");

    if (!orderNumber) {
      navigate("/cart");
      return;
    }

    // Clear cart ngay lập tức
    clearCart();

    // Sau đó gọi mutation để xử lý cancel
    cancelPayPalMutation.mutate(orderNumber);
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-gray-600">
      <RingLoader color="#ef4444" size={80} />
      <p className="mt-4 text-lg">{t("order.payment_cancel_warn")}</p>
    </div>
  );
}
