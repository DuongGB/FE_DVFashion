import {
  IconAlertCircle,
  IconCalendar,
  IconCheck,
  IconEdit,
  IconEye,
  IconInfoCircle,
  IconMail,
  IconMapPin,
  IconPhone,
  IconSearch,
  IconShoppingCart,
  IconTrendingUp,
  IconUser,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function CustomerDetailModal({ customer, open, onClose }) {
  const { t, i18n } = useTranslation();

  // Force re-render when language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      // Force component update
    };

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  if (!open || !customer) return null;

  // Get language from i18n
  const language = i18n.language || "VI";

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return t("admin.customer.detail.no_data");
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "VI" ? "vi-VN" : "en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Format date time for display
  const formatDateTime = (dateString) => {
    if (!dateString) return t("admin.customer.detail.no_data");
    const date = new Date(dateString);
    return date.toLocaleString(language === "VI" ? "vi-VN" : "en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(language === "VI" ? "vi-VN" : "en-US", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Calculate member duration
  const getMemberDuration = () => {
    if (!customer.createAt) return t("admin.customer.detail.no_data");

    const createdDate = new Date(customer.createAt);
    const now = new Date();
    const diffTime = Math.abs(now - createdDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays} ${language === "VI" ? "ngày" : "days"}`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${language === "VI" ? "tháng" : "months"}`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} ${language === "VI" ? "năm" : "years"}`;
    }
  };

  // Get status info
  const getStatusInfo = () => {
    if (customer.active) {
      return {
        color: "bg-green-100 text-green-800 border-green-200",
        label: t("admin.customer.detail.status.active"),
        icon: <IconCheck size={16} />,
      };
    }
    return {
      color: "bg-red-100 text-red-800 border-red-200",
      label: t("admin.customer.detail.status.inactive"),
      icon: <IconAlertCircle size={16} />,
    };
  };

  const statusInfo = getStatusInfo();

  // Mock data for stats (since we don't have real order data in customer object)
  const mockStats = {
    totalOrders: 0,
    totalSpent: 0,
    avgOrderValue: 0,
    favoriteCategory: t("admin.customer.detail.no_data"),
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl relative overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header với gradient background */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative">
          <button
            className="absolute top-4 right-4 bg-black backdrop-blur-sm text-white rounded-full w-10 h-10 flex items-center justify-center text-xl hover:bg-gray-800 transition-all duration-200 cursor-pointer"
            onClick={onClose}
          >
            <IconX size={20} />
          </button>

          <div className="flex items-start gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
              <IconUser size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">
                {t("admin.customer.detail.title")}
              </h2>
              <p className="text-blue-100 opacity-90">
                {t("admin.customer.detail.description", {
                  name: customer.fullName || customer.userName,
                })}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.color} flex items-center gap-1`}
                >
                  {statusInfo.icon}
                  {statusInfo.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="bg-green-600 p-2 rounded-lg">
                  <IconUser size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-green-600 font-medium">
                    {t("admin.customer.detail.fields.customer_id")}
                  </p>
                  <p className="text-sm font-bold text-green-800">
                    {customer.id}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <IconCalendar size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-medium">
                    {t("admin.customer.detail.fields.member_since")}
                  </p>
                  <p className="text-sm font-bold text-blue-800">
                    {t("admin.customer.detail.values.member_for", {
                      duration: getMemberDuration(),
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="bg-purple-600 p-2 rounded-lg">
                  <IconShoppingCart size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-purple-600 font-medium">
                    {t("admin.customer.detail.fields.total_orders")}
                  </p>
                  <p className="text-sm font-bold text-purple-800">
                    {mockStats.totalOrders}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center gap-3">
                <div className="bg-orange-600 p-2 rounded-lg">
                  <IconMapPin size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-orange-600 font-medium">
                    {t("admin.customer.detail.sections.addresses")}
                  </p>
                  <p className="text-sm font-bold text-orange-800">
                    {t("admin.customer.detail.values.address_count", {
                      count: customer.addresses?.length || 0,
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                  <IconInfoCircle size={20} className="text-blue-600" />
                  {t("admin.customer.detail.sections.basic_info")}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">
                      {t("admin.customer.detail.fields.full_name")}:
                    </span>
                    <span className="text-gray-800 font-semibold">
                      {customer.fullName || t("admin.customer.detail.no_data")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">
                      {t("admin.customer.detail.fields.username")}:
                    </span>
                    <span className="text-gray-800 font-mono">
                      {customer.userName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">
                      {t("admin.customer.detail.fields.email")}:
                    </span>
                    <span className="text-gray-800 flex items-center gap-2">
                      <IconMail size={16} className="text-blue-600" />
                      {customer.email}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">
                      {t("admin.customer.detail.fields.phone")}:
                    </span>
                    <span className="text-gray-800 flex items-center gap-2">
                      <IconPhone size={16} className="text-green-600" />
                      {customer.phone ||
                        t("admin.customer.detail.values.no_phone")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">
                      {t("admin.customer.detail.fields.date_of_birth")}:
                    </span>
                    <span className="text-gray-800">
                      {customer.dob
                        ? formatDate(customer.dob)
                        : t("admin.customer.detail.values.no_birth_date")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">
                      {t("admin.customer.detail.fields.gender")}:
                    </span>
                    <span className="text-gray-800">
                      {t(`admin.customer.gender.${customer.gender}`) ||
                        t("admin.customer.gender.OTHER")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                  <IconUsers size={20} className="text-purple-600" />
                  {t("admin.customer.detail.sections.account_info")}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">
                      {t("admin.customer.detail.fields.role")}:
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {customer.role}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">
                      {t("admin.customer.detail.fields.status")}:
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color} flex items-center gap-1`}
                    >
                      {statusInfo.icon}
                      {statusInfo.label}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">
                      {t("admin.customer.detail.fields.created_at")}:
                    </span>
                    <span className="text-gray-800 text-sm">
                      {formatDateTime(customer.createAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Purchase Statistics */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                  <IconShoppingCart size={20} className="text-green-600" />
                  {t("admin.customer.detail.sections.purchase_history")}
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      {t("admin.customer.detail.fields.total_orders")}:
                    </span>
                    <span className="text-gray-800 font-semibold">
                      {mockStats.totalOrders}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      {t("admin.customer.detail.fields.total_spent")}:
                    </span>
                    <span className="text-green-600 font-semibold">
                      {formatCurrency(mockStats.totalSpent)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      {t("admin.customer.detail.fields.avg_order_value")}:
                    </span>
                    <span className="text-blue-600 font-semibold">
                      {formatCurrency(mockStats.avgOrderValue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      {t("admin.customer.detail.fields.favorite_category")}:
                    </span>
                    <span className="text-purple-600 font-semibold">
                      {mockStats.favoriteCategory}
                    </span>
                  </div>

                  {mockStats.totalOrders === 0 && (
                    <div className="text-center py-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <IconShoppingCart
                        size={32}
                        className="text-orange-400 mx-auto mb-2"
                      />
                      <p className="text-orange-700 font-medium">
                        {t("admin.customer.detail.orders.no_orders")}
                      </p>
                      <p className="text-orange-600 text-sm">
                        {t("admin.customer.detail.orders.encourage_purchase")}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Behavior Analytics */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                  <IconTrendingUp size={20} className="text-orange-600" />
                  {t("admin.customer.detail.sections.behavior_analytics")}
                </h3>
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-blue-800">
                      <IconEye size={16} />
                      <span className="font-medium">
                        {t("admin.customer.detail.behavior.view_behavior")}:
                      </span>
                    </div>
                    <p className="text-blue-700 mt-1">
                      {t("admin.customer.detail.values.no_activity")}
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-800">
                      <IconShoppingCart size={16} />
                      <span className="font-medium">
                        {t("admin.customer.detail.behavior.purchase_behavior")}:
                      </span>
                    </div>
                    <p className="text-green-700 mt-1">
                      {t("admin.customer.detail.values.no_activity")}
                    </p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-purple-800">
                      <IconSearch size={16} />
                      <span className="font-medium">
                        {t("admin.customer.detail.behavior.search_behavior")}:
                      </span>
                    </div>
                    <p className="text-purple-700 mt-1">
                      {t("admin.customer.detail.values.no_activity")}
                    </p>
                  </div>

                  <div className="text-center py-2 text-gray-500 text-sm">
                    {t("admin.customer.detail.behavior.collect_data_prompt")}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Addresses */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <IconMapPin size={20} className="text-blue-600" />
              {t("admin.customer.detail.address.title")}
            </h3>
            {customer.addresses && customer.addresses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customer.addresses.map((address, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        <IconMapPin size={16} className="text-blue-600" />
                        {t("admin.customer.form.address_number", {
                          number: index + 1,
                        })}
                      </h4>
                      {address.isDefault && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          {t("admin.customer.detail.address.default_badge")}
                        </span>
                      )}
                    </div>
                    <div className="text-gray-700 space-y-1">
                      <p className="text-sm">
                        {t("admin.customer.detail.address.full_address", {
                          street: address.street,
                          ward: address.ward,
                          district: address.district,
                          city: address.city,
                          country: address.country,
                        })}
                      </p>
                      {address.zipCode && (
                        <p className="text-xs text-gray-500">
                          {t("admin.customer.detail.address.zip_code", {
                            zipCode: address.zipCode,
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <IconMapPin size={32} className="text-gray-400" />
                </div>
                <p className="text-lg font-medium text-gray-700 mb-2">
                  {t("admin.customer.detail.address.no_addresses")}
                </p>
                <p className="text-sm text-gray-500">
                  {t("admin.customer.detail.address.add_address_prompt")}
                </p>
              </div>
            )}
          </div>

          {/* Recent Orders - Placeholder */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <IconShoppingCart size={20} className="text-green-600" />
              {t("admin.customer.detail.orders.recent_orders")}
            </h3>
            <div className="text-center py-8">
              <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <IconShoppingCart size={32} className="text-orange-500" />
              </div>
              <p className="text-lg font-medium text-gray-700 mb-2">
                {t("admin.customer.detail.orders.no_orders")}
              </p>
              <p className="text-sm text-gray-500">
                {t("admin.customer.detail.orders.encourage_purchase")}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 cursor-pointer"
            >
              {t("admin.customer.detail.close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
