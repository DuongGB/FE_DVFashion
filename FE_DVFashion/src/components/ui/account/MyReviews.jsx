import { useTranslation } from "react-i18next";
import { useGetMyReviews } from "../../../hooks/useReview";
import {
  IconStarFilled,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import Pagination from "../../common/Pagination";
import { useState } from "react";
import ModalUpdateReview from "../review/ModalUpdateReview";
import ReviewReplySection from "../review/ReviewReplySection";

export default function MyReviews({ refreshKey = 0 }) {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState(new Set());

  // Lấy dữ liệu phân trang
  const {
    data: pagedData = [],
    isLoading,
    refetch,
  } = useGetMyReviews({ page, size: 4, refreshKey });

  const reviews = Array.isArray(pagedData) ? pagedData : pagedData.values || [];
  const totalPages = pagedData.totalPages || 1;

  // Toggle mở/đóng replies
  const toggleReplies = (reviewId) => {
    setExpandedReviews((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  // Khi click update
  const handleUpdateClick = (review) => {
    setSelectedReview(review);
    setShowEditModal(true);
  };

  // Khi cập nhật xong, đóng modal và refetch
  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedReview(null);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="py-10 text-center bg-gradient-to-br from-blue-100/60 via-white/60 to-blue-200/60 rounded-3xl backdrop-blur-lg">
        {t("loading")}...
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full bg-gradient-to-br from-blue-100/60 via-white/60 to-blue-200/60 p-3 sm:p-6 rounded-xl sm:rounded-3xl shadow-2xl backdrop-blur-lg">
        <h2 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-8 drop-shadow">
          {t("account.sidebar.reviews_feedback")}
        </h2>

        <div className="flex flex-col gap-4 sm:gap-6 flex-grow overflow-y-auto pr-2">
          {reviews.length === 0 && (
            <div className="text-center text-gray-500 py-10 bg-white/30 backdrop-blur-sm rounded-xl border border-white/20">
              {t("review.no_reviews")}
            </div>
          )}

          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white/40 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col gap-4 shadow-lg border border-white/30 transition hover:shadow-xl"
            >
              {/* Header: Rating + Product Info */}
              <div className="flex items-start gap-4">
                {/* Product Image & Info */}
                <div className="flex gap-4 items-center flex-1">
                  {review.imageUrls && review.imageUrls.length > 0 && (
                    <div className="flex gap-2">
                      {review.imageUrls.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt={review.productName}
                          className="w-20 h-20 object-cover rounded-xl border border-white/40 shadow-md"
                        />
                      ))}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-lg">
                      {review.productName}
                    </div>
                    <div className="text-gray-600 text-sm mb-2">
                      {review.variantName}
                    </div>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <IconStarFilled
                          key={i}
                          size={20}
                          className={
                            i <= Math.floor(review.rating)
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Update Button */}
                <button
                  className="border border-white/40 bg-white/30 backdrop-blur px-5 py-2 font-bold rounded-full cursor-pointer hover:bg-white/60 hover:border-blue-400 transition shadow-md"
                  onClick={() => handleUpdateClick(review)}
                >
                  {t("review.update")}
                </button>
              </div>

              {/* Comment */}
              <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-white/30">
                <span className="font-semibold text-gray-700">
                  {t("review.comment")}:
                </span>{" "}
                <span className="text-gray-800">{review.comment}</span>
              </div>

              {/* Admin Comment (nếu có) */}
              {review.adminComment && (
                <div className="bg-blue-50/50 backdrop-blur-sm p-4 rounded-xl border border-blue-200/50">
                  <span className="font-semibold text-blue-700">Admin:</span>{" "}
                  <span className="text-gray-700">{review.adminComment}</span>
                </div>
              )}

              {/* Replies Section */}
              {review.replies && review.replies.length > 0 && (
                <div className="mt-2">
                  <button
                    onClick={() => toggleReplies(review.id)}
                    className="flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 transition"
                  >
                    {expandedReviews.has(review.id) ? (
                      <>
                        <IconChevronUp size={20} />
                        {t("review.hide_replies")}
                      </>
                    ) : (
                      <>
                        <IconChevronDown size={20} />
                        {t("review.show_replies")} ({review.replies.length})
                      </>
                    )}
                  </button>

                  {expandedReviews.has(review.id) && (
                    <div className="mt-4">
                      <ReviewReplySection
                        reviewId={review.id}
                        initialReplies={review.replies}
                        isCustomer={true}
                        onReplySuccess={() => refetch()}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Show reply input if no replies yet */}
              {(!review.replies || review.replies.length === 0) && (
                <div className="mt-2">
                  <ReviewReplySection
                    reviewId={review.id}
                    initialReplies={[]}
                    isCustomer={true}
                    onReplySuccess={() => refetch()}
                  />
                </div>
              )}

              {/* Created Date */}
              <div className="text-xs text-gray-500 text-right">
                {new Date(review.createdAt).toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 sm:mt-8 flex-shrink-0">
            <Pagination
              currentPage={page + 1}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p - 1)}
            />
          </div>
        )}
      </div>
      {/* Modal sửa nhận xét */}
      {showEditModal && (
        <ModalUpdateReview
          show={showEditModal}
          onClose={() => setShowEditModal(false)}
          review={selectedReview}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}
