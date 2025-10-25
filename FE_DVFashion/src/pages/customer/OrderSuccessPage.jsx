import { useParams, Link } from "react-router-dom";
import { useOrderByOrderNumber } from "../../hooks/useOrder";
import { useTranslation } from "react-i18next";
import { IconCheck, IconArrowLeft } from "@tabler/icons-react";
import { RingLoader } from "react-spinners"; // dùng để hiển thị loading spinner khi đang tải dữ liệu đơn hàng

export default function OrderSuccessPage() {
  const { orderNumber } = useParams();
  const { t } = useTranslation();
  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useOrderByOrderNumber(orderNumber);

  const order = response?.data;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-600">
        <RingLoader color="#3b82f6" size={80} />
        <p className="mt-4 text-lg">{t("order.loading_details")}</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-red-600">
        <h2 className="text-2xl font-bold mb-4">{t("common.error")}</h2>
        <p>{error.response?.data?.message || t("order.load_details_fail")}</p>
        <Link
          to="/"
          className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <IconArrowLeft size={20} />
          {t("order.back_to_home")}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-xl p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <IconCheck size={48} className="text-green-500" />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              {t("order.success_title")}
            </h1>
            <p className="mt-2 text-gray-600">
              {t("order.success_message", { orderNumber: order.orderNumber })}
            </p>
          </div>

          {/* Order Summary */}
          <div className="border-t border-b border-gray-200 py-6 my-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {t("order.summary")}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">{t("order.number")}</p>
                <p className="font-medium text-gray-900">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-gray-500">{t("order.date")}</p>
                <p className="font-medium text-gray-900">
                  {new Date(order.orderDate).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500">{t("order.total_amount")}</p>
                <p className="font-medium text-gray-900">
                  {order.totalAmount.toLocaleString()}đ
                </p>
              </div>
              <div>
                <p className="text-gray-500">{t("order.status_label")}</p>
                <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                  {order.status}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {t("cart.shipping_info")}
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700">
              <p className="font-bold">{order.shippingInfo.fullName}</p>
              <p>{order.shippingInfo.phone}</p>
              <p>{order.shippingInfo.fullAddress}</p>
            </div>
          </div>

          {/* Items List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {t("order.items_title")}
            </h3>
            <ul className="divide-y divide-gray-200">
              {order.items.map((item) => (
                <li key={item.productVariantId} className="py-4 flex">
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    className="h-20 w-20 rounded-md object-cover"
                  />
                  <div className="ml-4 flex-1 flex flex-col">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {item.productName}
                      </h4>
                      <p className="mt-1 text-sm text-gray-500">
                        {item.color} - {item.sizeName}
                      </p>
                    </div>
                    <div className="flex-1 flex items-end justify-between text-sm">
                      <p className="text-gray-500">
                        {t("cart.quantity")}: {item.quantity}
                      </p>
                      <p className="font-medium text-gray-900">
                        {item.totalPrice.toLocaleString()}đ
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Button */}
          <div className="mt-10 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold px-8 py-3 rounded-full text-base shadow-lg hover:bg-blue-700 transition-all duration-200"
            >
              <IconArrowLeft size={20} />
              {t("order.continue_shopping")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
