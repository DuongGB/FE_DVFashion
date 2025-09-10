import React, { useEffect } from "react";
import {
  IconX,
  IconTag,
  IconCalendar,
  IconUsers,
  IconPercentage,
  IconCurrencyDollar,
  IconTruck,
  IconGift,
  IconShoppingCart,
  IconClock,
  IconCheck,
  IconAlertCircle,
  IconInfoCircle,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

export default function PromotionDetailModal({ promotion, open, onClose }) {
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

  if (!open || !promotion) return null;

  // Get language from i18n
  const language = i18n.language || "VI";

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return t("admin.promotion.detail.no_data");
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

  // Calculate usage percentage
  const usagePercentage =
    promotion.maxUsages > 0
      ? Math.round((promotion.currentUsage / promotion.maxUsages) * 100)
      : 0;

  // Get promotion type icon
  const getTypeIcon = () => {
    switch (promotion.type) {
      case "PERCENTAGE":
        return <IconPercentage size={20} className="text-green-600" />;
      case "FIXED_AMOUNT":
        return <IconCurrencyDollar size={20} className="text-blue-600" />;
      case "FREE_SHIPPING":
        return <IconTruck size={20} className="text-purple-600" />;
      case "BUY_ONE_GET_ONE":
        return <IconGift size={20} className="text-orange-600" />;
      default:
        return <IconTag size={20} className="text-gray-600" />;
    }
  };

  // Get promotion value display
  const getValueDisplay = () => {
    switch (promotion.type) {
      case "PERCENTAGE":
        return `${promotion.value}%`;
      case "FIXED_AMOUNT":
        return formatCurrency(promotion.value);
      case "FREE_SHIPPING":
        return t("admin.promotion.detail.values.free_shipping");
      case "BUY_ONE_GET_ONE":
        return t("admin.promotion.detail.values.buy_one_get_one");
      default:
        return promotion.value;
    }
  };

  // Check if promotion is expired
  const isExpired = new Date(promotion.endDate) < new Date();
  const isUpcoming = new Date(promotion.startDate) > new Date();

  // Get status color and label
  const getStatusInfo = () => {
    if (isExpired) {
      return {
        color: "bg-red-100 text-red-800 border-red-200",
        label: t("admin.promotion.detail.status.expired"),
        icon: <IconAlertCircle size={16} />,
      };
    }
    if (isUpcoming) {
      return {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        label: t("admin.promotion.detail.status.upcoming"),
        icon: <IconClock size={16} />,
      };
    }
    if (promotion.active) {
      return {
        color: "bg-green-100 text-green-800 border-green-200",
        label: t("admin.promotion.detail.status.active"),
        icon: <IconCheck size={16} />,
      };
    }
    return {
      color: "bg-gray-100 text-gray-800 border-gray-200",
      label: t("admin.promotion.detail.status.inactive"),
      icon: <IconAlertCircle size={16} />,
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl relative overflow-hidden max-h-[90vh] flex flex-col"
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
              {getTypeIcon()}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">
                {t("admin.promotion.detail.title")}
              </h2>
              <p className="text-blue-100 opacity-90">
                {t("admin.promotion.detail.description", {
                  name: promotion.name,
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
                  <IconTag size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-green-600 font-medium">
                    {t("admin.promotion.detail.fields.promotion_code")}
                  </p>
                  <p className="text-sm font-bold text-green-800">
                    {promotion.code || `PROMO-${promotion.id}`}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  {getTypeIcon()}
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-medium">
                    {t("admin.promotion.detail.fields.value")}
                  </p>
                  <p className="text-sm font-bold text-blue-800">
                    {getValueDisplay()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="bg-purple-600 p-2 rounded-lg">
                  <IconUsers size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-purple-600 font-medium">
                    {t("admin.promotion.detail.fields.used")}
                  </p>
                  <p className="text-sm font-bold text-purple-800">
                    {promotion.currentUsage || 0}/{promotion.maxUsages || "∞"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center gap-3">
                <div className="bg-orange-600 p-2 rounded-lg">
                  <IconShoppingCart size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-orange-600 font-medium">
                    {t("admin.promotion.detail.fields.min_order")}
                  </p>
                  <p className="text-sm font-bold text-orange-800">
                    {promotion.minOrderAmount > 0
                      ? formatCurrency(promotion.minOrderAmount)
                      : t("admin.promotion.detail.values.no_minimum")}
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
                  {t("admin.promotion.detail.sections.basic_info")}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">
                      {t("admin.promotion.detail.fields.id")}:
                    </span>
                    <span className="text-gray-800 font-mono">
                      {promotion.id}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">
                      {t("admin.promotion.detail.fields.type")}:
                    </span>
                    <span className="text-gray-800 flex items-center gap-2">
                      {getTypeIcon()}
                      {t(`admin.promotion.type.${promotion.type}`) ||
                        promotion.type}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600 font-medium">
                      {t("admin.promotion.detail.fields.status")}:
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color} flex items-center gap-1`}
                    >
                      {statusInfo.icon}
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Time Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                  <IconCalendar size={20} className="text-purple-600" />
                  {t("admin.promotion.detail.sections.time_info")}
                </h3>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">
                      {t("admin.promotion.detail.fields.start_time")}:
                    </span>
                    <span className="text-gray-800 text-sm sm:text-base">
                      {formatDate(promotion.startDate)}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2">
                    <span className="text-gray-600 font-medium">
                      {t("admin.promotion.detail.fields.end_time")}:
                    </span>
                    <span className="text-gray-800 text-sm sm:text-base">
                      {formatDate(promotion.endDate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Usage Statistics */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                  <IconUsers size={20} className="text-green-600" />
                  {t("admin.promotion.detail.sections.usage_stats")}
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      {t("admin.promotion.detail.fields.max_usage")}:
                    </span>
                    <span className="text-gray-800 font-semibold">
                      {promotion.maxUsages ||
                        t("admin.promotion.detail.values.unlimited")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      {t("admin.promotion.detail.fields.current_usage")}:
                    </span>
                    <span className="text-blue-600 font-semibold">
                      {promotion.currentUsage || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      {t("admin.promotion.detail.fields.remaining")}:
                    </span>
                    <span className="text-orange-600 font-semibold">
                      {promotion.maxUsages
                        ? promotion.maxUsages - (promotion.currentUsage || 0)
                        : t("admin.promotion.detail.values.unlimited")}
                    </span>
                  </div>

                  {promotion.maxUsages && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>
                          {t("admin.promotion.detail.fields.progress")}
                        </span>
                        <span>{usagePercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 relative overflow-hidden"
                          style={{ width: `${usagePercentage}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Conditions */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                  <IconShoppingCart size={20} className="text-orange-600" />
                  {t("admin.promotion.detail.sections.conditions")}
                </h3>
                <div className="space-y-3">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-orange-800">
                      <IconShoppingCart size={16} />
                      <span className="font-medium">
                        {t("admin.promotion.detail.fields.min_order_amount")}:
                      </span>
                    </div>
                    <p className="text-orange-700 mt-1">
                      {promotion.minOrderAmount > 0
                        ? formatCurrency(promotion.minOrderAmount)
                        : t("admin.promotion.detail.values.no_minimum_value")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Promotion Description */}
          {promotion.description && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <IconInfoCircle size={20} className="text-green-600" />
                Mô tả khuyến mãi
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {promotion.description}
                </p>
              </div>
            </div>
          )}

          {/* Applicable Products */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <IconTag size={20} className="text-blue-600" />
              {t("admin.promotion.detail.sections.applicable_products")}
            </h3>
            {promotion.applicableProducts &&
            promotion.applicableProducts.length > 0 ? (
              <div>
                <p className="text-gray-600 mb-3">
                  {t("admin.promotion.detail.values.apply_to_products", {
                    count: promotion.applicableProducts.length,
                  })}
                </p>
                <div className="flex flex-wrap gap-2">
                  {promotion.applicableProducts.map((product) => (
                    <span
                      key={product.id}
                      className="bg-blue-50 border border-blue-200 text-blue-800 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                    >
                      {product.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 inline-flex items-center gap-2">
                  <IconCheck size={20} className="text-green-600" />
                  <span className="text-green-700 font-medium">
                    {t("admin.promotion.detail.values.apply_all_products")}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Categories if available */}
          {promotion.applicableCategories &&
            promotion.applicableCategories.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                  <IconTag size={20} className="text-purple-600" />
                  {t("admin.promotion.detail.sections.applicable_categories")}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {promotion.applicableCategories.map((category) => (
                    <span
                      key={category.id}
                      className="bg-purple-50 border border-purple-200 text-purple-800 px-3 py-2 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 cursor-pointer"
            >
              {t("admin.promotion.detail.close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
