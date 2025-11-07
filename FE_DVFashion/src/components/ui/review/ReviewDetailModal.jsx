import {
  IconAlertTriangle,
  IconBan,
  IconCheck,
  IconClock,
  IconNotes,
  IconPackage,
  IconStar,
  IconStarFilled,
  IconThumbUp,
  IconUser,
  IconX,
  IconMessage,
  IconCalendar,
  IconInfoCircle,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

export default function ReviewDetailModal({ review, open, onClose }) {
  const { t, i18n } = useTranslation();

  if (!open || !review) return null;

  const formatDate = (dateString) => {
    if (!dateString) return t("common.not_available");
    return new Date(dateString).toLocaleString(
      i18n.language === "vi" ? "vi-VN" : "en-US",
      {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) =>
      i < rating ? (
        <IconStarFilled key={i} size={20} className="text-yellow-400" />
      ) : (
        <IconStar key={i} size={20} className="text-gray-300" />
      )
    );
  };

  const getStatusInfo = (status) => {
    const statuses = {
      PENDING: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: IconClock,
      },
      APPROVED: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: IconCheck,
      },
      AUTO_APPROVED: {
        color: "bg-cyan-100 text-cyan-800 border-cyan-200",
        icon: IconCheck,
      },
      REJECTED: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: IconBan,
      },
      HIDDEN: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: IconBan,
      },
      NEED_REVIEW: {
        color: "bg-orange-100 text-orange-800 border-orange-200",
        icon: IconAlertTriangle,
      },
    };
    const info = statuses[status] || {
      color: "bg-gray-100 text-gray-800 border-gray-200",
      icon: IconAlertTriangle,
    };
    return {
      ...info,
      label: t(`admin.review.status.${status}`),
      description: t(`admin.review.detail.status_desc.${status}`),
    };
  };

  const getRatingLevel = (rating) => {
    if (rating >= 5)
      return {
        level: t("admin.review.detail.rating_level.excellent"),
        color: "text-green-600",
      };
    if (rating >= 4)
      return {
        level: t("admin.review.detail.rating_level.good"),
        color: "text-blue-600",
      };
    if (rating >= 3)
      return {
        level: t("admin.review.detail.rating_level.average"),
        color: "text-yellow-600",
      };
    if (rating >= 2)
      return {
        level: t("admin.review.detail.rating_level.poor"),
        color: "text-orange-600",
      };
    return {
      level: t("admin.review.detail.rating_level.very_poor"),
      color: "text-red-600",
    };
  };

  const statusInfo = getStatusInfo(review.status);
  const ratingInfo = getRatingLevel(review.rating);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="backdrop-blur-xl bg-white/80 border border-white/30 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/50 transition-colors cursor-pointer"
          >
            <IconX size={20} />
          </button>
          <div className="flex items-start gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
              <IconStar size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {t("admin.review.detail.title")} #{review.id}
              </h2>
              <p className="text-blue-100 opacity-90">
                {t("admin.review.detail.description", {
                  name: review.user.fullName,
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 backdrop-blur-xl bg-white/30 border border-white/30 rounded-xl p-6 shadow-lg text-center">
              <h3 className="flex items-center justify-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                {t("admin.review.detail.rating_summary")}
              </h3>
              <div className="flex justify-center gap-1 mb-3">
                {renderStars(review.rating)}
              </div>
              <h3 className={`font-bold text-lg ${ratingInfo.color} mb-3`}>
                {ratingInfo.level}
              </h3>
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${statusInfo.color}`}
              >
                <StatusIcon size={14} />
                {statusInfo.label}
              </div>
            </div>

            <div className="lg:col-span-2 backdrop-blur-xl bg-white/30 border border-white/30 rounded-xl p-6 shadow-lg">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <IconUser size={20} className="text-blue-600" />
                {t("admin.review.detail.customer_info")}
              </h3>
              <div className="space-y-3">
                <InfoRow
                  label={t("admin.review.detail.customer_name")}
                  value={review.user?.fullName}
                />
              </div>
            </div>
          </div>

          {/* Product & Order Info */}
          <div className="backdrop-blur-xl bg-white/30 border border-white/30 rounded-xl p-6 shadow-lg">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <IconPackage size={20} className="text-purple-600" />
              {t("admin.review.detail.product_order_info")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow
                label={t("admin.review.detail.product_name")}
                value={review.productName}
              />
              <InfoRow
                label={t("admin.review.detail.variant")}
                value={review.variantName}
              />
              <InfoRow
                label={t("admin.review.detail.order_code")}
                value={`#${review.orderNumber}`}
              />
              <InfoRow
                label={t("admin.review.detail.order_status")}
                value={t(`order.status.${review.status?.toLowerCase()}`)}
              />
            </div>
          </div>

          {/* Review Content */}
          <div className="backdrop-blur-xl bg-white/30 border border-white/30 rounded-xl p-6 shadow-lg">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <IconNotes size={20} className="text-green-600" />
              {t("admin.review.detail.review_content")}
            </h3>
            <p className="text-gray-700 text-base leading-relaxed italic bg-white/80 p-4 rounded-md border border-white/30">
              "{review.comment || t("admin.review.detail.no_comment")}"
            </p>
          </div>

          {/* Admin Comment */}
          {review.adminComment && (
            <div className="backdrop-blur-xl bg-white/30 border border-white/30 rounded-xl p-6 shadow-lg">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <IconMessage size={20} className="text-orange-600" />
                {t("admin.review.detail.admin_feedback")}
              </h3>
              <p className="text-gray-700 text-base leading-relaxed bg-yellow-50/60 p-4 rounded-md border border-yellow-200/40">
                {review.adminComment}
              </p>
            </div>
          )}

          {/* Images */}
          {review.imageUrls && review.imageUrls.length > 0 && (
            <div className="backdrop-blur-xl bg-white/30 border border-white/30 rounded-xl p-6 shadow-lg">
              <h3 className="font-semibold text-lg mb-3 text-gray-700">
                {t("admin.review.detail.attached_images", {
                  count: review.imageUrls.length,
                })}
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {review.imageUrls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Review ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md border border-white/30 cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => window.open(url, "_blank")}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="backdrop-blur-xl bg-white/30 border border-white/30 rounded-xl p-6 shadow-lg">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <IconCalendar size={20} className="text-cyan-600" />
              {t("admin.review.detail.timestamps")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow
                label={t("admin.review.detail.created_at")}
                value={formatDate(review.createdAt)}
              />
              <InfoRow
                label={t("admin.review.detail.updated_at")}
                value={formatDate(review.updatedAt)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const InfoRow = ({ label, value, isLink = null }) => (
  <div className="p-3 bg-white/80 rounded-lg border border-white/30">
    <div className="text-sm text-gray-600 mb-1">{label}</div>
    {isLink ? (
      <a
        href={isLink}
        className="text-base font-semibold text-blue-600 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {value || "-"}
      </a>
    ) : (
      <div className="text-base font-semibold text-gray-800">
        {value || "-"}
      </div>
    )}
  </div>
);
