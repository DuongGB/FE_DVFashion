import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useConfirmPayPal } from "../../hooks/useOrder";
import { RingLoader } from "react-spinners";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

export default function PayPalSuccessHandler() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { mutate: confirmPayment, isLoading, isSuccess } = useConfirmPayPal();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const orderNumber = localStorage.getItem("pendingOrderNumber");

    if (token && orderNumber) {
      confirmPayment({ token, orderNumber });
    } else {
      toast.error(t("order.payment_confirm_fail"));
      navigate("/cart");
    }
    // Hook `useConfirmPayPal` will handle navigation on success/error.
  }, [location, confirmPayment, t, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-gray-600">
      <RingLoader color="#3b82f6" size={80} />
      <p className="mt-4 text-lg">
        {isLoading
          ? t("order.payment_confirming")
          : isSuccess
          ? t("order.payment_success_redirecting")
          : t("order.processing_redirect")}
      </p>
    </div>
  );
}
