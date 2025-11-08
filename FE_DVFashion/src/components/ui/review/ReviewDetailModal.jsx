import { IconX, IconStarFilled, IconUser } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import ReviewReplySection from "./ReviewReplySection";
import { useAuth } from "../../../hooks/useAuth";

export default function ReviewDetailModal({ review, open, onClose }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.roles?.includes("ROLE_ADMIN");

  if (!open || !review) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="backdrop-blur-xl bg-white/90 border border-white/30 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Sticky */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl flex justify-between items-center z-10 flex-shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <IconStarFilled size={24} className="text-yellow-300" />
            {t("admin.review.detail.title")}
          </h2>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors cursor-pointer"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Review Info */}
          <div className="backdrop-blur-xl bg-white/60 border border-white/30 rounded-xl p-4 shadow-lg">
            <h3 className="font-semibold text-lg mb-3 text-gray-800">
              {t("admin.review.detail.review_info")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <IconUser size={18} className="text-blue-600" />
                  <span className="font-semibold text-gray-700">
                    {t("admin.review.columns.customer")}
                  </span>
                </div>
                <p className="text-gray-800 font-medium">
                  {review.user.fullName}
                </p>
                <p className="text-sm text-gray-500">{review.user.email}</p>
              </div>

              {/* Product */}
              <div>
                <span className="font-semibold text-gray-700 block mb-2">
                  {t("admin.review.columns.product")}
                </span>
                <p className="text-gray-800 font-medium">
                  {review.productName}
                </p>
                <p className="text-sm text-gray-500">{review.variantName}</p>
              </div>

              {/* Rating */}
              <div>
                <span className="font-semibold text-gray-700 block mb-2">
                  {t("admin.review.columns.rating")}
                </span>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <IconStarFilled
                      key={i}
                      size={20}
                      className={
                        i < review.rating ? "text-yellow-400" : "text-gray-300"
                      }
                    />
                  ))}
                  <span className="ml-2 font-semibold text-gray-800">
                    {review.rating}/5
                  </span>
                </div>
              </div>

              {/* Status */}
              <div>
                <span className="font-semibold text-gray-700 block mb-2">
                  {t("admin.review.columns.status")}
                </span>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    {
                      PENDING: "bg-yellow-100 text-yellow-800",
                      AUTO_APPROVED: "bg-cyan-100 text-cyan-800",
                      APPROVED: "bg-green-100 text-green-800",
                      NEED_REVIEW: "bg-orange-100 text-orange-800",
                      REJECTED: "bg-red-100 text-red-800",
                      HIDDEN: "bg-gray-100 text-gray-800",
                    }[review.status]
                  }`}
                >
                  {t(`admin.review.status.${review.status}`)}
                </span>
              </div>

              {/* Created At */}
              <div>
                <span className="font-semibold text-gray-700 block mb-2">
                  {t("admin.review.columns.created_at")}
                </span>
                <p className="text-gray-800">{formatDate(review.createdAt)}</p>
              </div>

              {/* Verified Purchase */}
              {review.verifiedPurchase && (
                <div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    ✓ {t("admin.review.detail.verified_purchase")}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Comment */}
          {review.comment && (
            <div className="backdrop-blur-xl bg-white/60 border border-white/30 rounded-xl p-4 shadow-lg">
              <h3 className="font-semibold text-lg mb-3 text-gray-800">
                {t("admin.review.columns.comment")}
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">
                {review.comment}
              </p>
            </div>
          )}

          {/* Images */}
          {review.imageUrls && review.imageUrls.length > 0 && (
            <div className="backdrop-blur-xl bg-white/60 border border-white/30 rounded-xl p-4 shadow-lg">
              <h3 className="font-semibold text-lg mb-3 text-gray-800">
                {t("admin.review.detail.images")}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {review.imageUrls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Review ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-white/30 shadow hover:scale-105 transition-transform cursor-pointer"
                    onClick={() => window.open(url, "_blank")}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Admin Comment */}
          {review.adminComment && (
            <div className="backdrop-blur-xl bg-red-50 border border-red-200 rounded-xl p-4 shadow-lg">
              <h3 className="font-semibold text-lg mb-2 text-red-800">
                {t("admin.review.detail.admin_comment")}
              </h3>
              <p className="text-red-700">{review.adminComment}</p>
            </div>
          )}

          {/* Review Replies Section */}
          <ReviewReplySection reviewId={review.id} isAdmin={isAdmin} />
        </div>
      </div>
    </div>
  );
}
