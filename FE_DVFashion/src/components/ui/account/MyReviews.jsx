import { useTranslation } from "react-i18next";
import { useGetMyReviews } from "../../../hooks/useReview";
import { IconStarFilled } from "@tabler/icons-react";
import Pagination from "../../common/Pagination";
import { useState } from "react";
import ModalUpdateReview from "../review/ModalUpdateReview";

export default function MyReviews() {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Lấy dữ liệu phân trang
  const {
    data: pagedData = [],
    isLoading,
    refetch,
  } = useGetMyReviews({ page, size: 4 });

  const reviews = Array.isArray(pagedData) ? pagedData : pagedData.values || [];
  const totalPages = pagedData.totalPages || 1;

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
    return <div className="py-10 text-center">{t("loading")}...</div>;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8">
        {t("account.sidebar.reviews_feedback")}
      </h2>
      <div className="flex flex-col gap-6">
        {reviews.length === 0 && (
          <div className="text-center text-gray-500">
            {t("review.no_reviews")}
          </div>
        )}
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-gray-100 rounded-xl p-6 flex flex-col gap-2"
          >
            <div className="flex items-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <IconStarFilled
                  key={i}
                  size={22}
                  className={
                    i <= Math.floor(review.rating)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>
            <div className="mb-2">
              <span className="font-semibold">{t("review.comment")}:</span>{" "}
              {review.comment}
            </div>
            <div className="flex gap-4 items-center">
              {review.imageUrls && review.imageUrls.length > 0 && (
                <div className="flex gap-2">
                  {review.imageUrls.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={review.productName}
                      className="w-20 h-20 object-cover rounded-md border"
                    />
                  ))}
                </div>
              )}
              <div>
                <div className="font-bold">{review.productName}</div>
                <div className="text-gray-500 text-sm">
                  {review.variantName}
                </div>
              </div>
            </div>
            <button
              className="border rounded-full px-6 py-2 font-bold mt-4 w-fit cursor-pointer hover:bg-gray-200 transition"
              onClick={() => handleUpdateClick(review)}
            >
              {t("review.update")}
            </button>
          </div>
        ))}
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={page + 1}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p - 1)}
          />
        </div>
      )}
      {/* Modal sửa nhận xét */}
      {showEditModal && (
        <ModalUpdateReview
          show={showEditModal}
          onClose={() => setShowEditModal(false)}
          review={selectedReview}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
