import { IconCircleCheck, IconX } from "@tabler/icons-react";
import { useQueries } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useCreateReview } from "../../../hooks/useReview";
import { canReviewProduct } from "../../../services/reviewAPI";
import ReviewProductCard from "./ReviewProductCard";

const SelectableProduct = ({ item, isSelected, onSelect, canReview }) => (
  <div
    className={`border-2 rounded-lg p-2 transition-all relative ${
      isSelected
        ? "border-blue-500 bg-blue-50"
        : canReview
        ? "border-gray-300 bg-white"
        : "border-gray-200 bg-gray-100"
    } ${canReview ? "" : "cursor-not-allowed"}`}
  >
    {!canReview && (
      <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg z-10">
        <IconCircleCheck className="text-green-500" size={32} />
      </div>
    )}
    <div className="flex items-start gap-3 flex-col">
      <div className="flex-shrink-0">
        <img
          src={item.imageUrl}
          alt={item.productName}
          className="w-20 h-20 object-cover rounded"
        />
        <div className="mt-2 flex items-center justify-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => {
              if (canReview) {
                onSelect(item.productVariantId);
              }
            }}
            disabled={!canReview}
            className={`h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
              canReview ? "cursor-pointer" : "cursor-not-allowed"
            }`}
          />
        </div>
      </div>
      <div>
        <p className="font-semibold text-sm leading-tight">
          {item.productName}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {item.color} / {item.sizeName}
        </p>
      </div>
    </div>
  </div>
);

export default function ModalReview({ show, onClose, order }) {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState({});
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sử dụng useQueries để kiểm tra trạng thái review cho tất cả sản phẩm
  const reviewabilityResults = useQueries({
    queries:
      order?.items.map((item) => ({
        queryKey: [
          "canReview",
          { orderId: order.id, productVariantId: item.productVariantId },
        ],
        queryFn: () =>
          canReviewProduct({
            orderId: order.id,
            productVariantId: item.productVariantId,
          }),
        enabled: !!order && show,
        staleTime: 5 * 60 * 1000, // Cache trong 5 phút
      })) ?? [],
  });

  const isCheckingReviewability = reviewabilityResults.some((q) => q.isLoading);

  // Hàm đóng modal và reset state
  const handleClose = useCallback(() => {
    onClose();
    // Reset state sau một khoảng trễ để animation đóng modal được mượt mà
    setTimeout(() => {
      setSubmissionCount(0);
      setIsSubmitting(false);
    }, 300);
  }, [onClose]);

  const { mutate: createReviewMutation } = useCreateReview({
    onSuccess: () => {
      setSubmissionCount((prev) => prev + 1);
    },
  });

  // Khởi tạo state khi modal được mở hoặc dữ liệu reviewability đã sẵn sàng
  useEffect(() => {
    if (order && show && !isCheckingReviewability) {
      const initialReviews = {};
      const reviewableProductIds = order.items
        .filter((_, index) => reviewabilityResults[index]?.data?.data === true)
        .map((item) => item.productVariantId);

      order.items.forEach((item) => {
        initialReviews[item.productVariantId] = {
          rating: 0,
          comment: "",
          // fit: null,
          // height: "",
          // weight: "",
          imageFiles: [],
        };
      });

      setReviews(initialReviews);
      setSelectedProductIds(reviewableProductIds);
      setSubmissionCount(0);
      setIsSubmitting(false);
    }
  }, [order, show, isCheckingReviewability]);

  // Tự động đóng modal sau khi submit thành công tất cả review
  useEffect(() => {
    if (
      submissionCount > 0 &&
      selectedProductIds.length > 0 &&
      submissionCount === selectedProductIds.length
    ) {
      handleClose();
    }
  }, [submissionCount, selectedProductIds.length, handleClose]);

  // Ngăn cuộn trang khi modal đang mở
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    // Cleanup function để khôi phục lại cuộn khi component bị unmount
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [show]);

  const handleProductSelect = (variantId) => {
    setSelectedProductIds((prev) =>
      prev.includes(variantId)
        ? prev.filter((id) => id !== variantId)
        : [...prev, variantId]
    );
  };

  const handleReviewChange = (variantId, reviewData) => {
    setReviews((prev) => ({
      ...prev,
      [variantId]: reviewData,
    }));
  };

  const handleSubmit = async () => {
    if (selectedProductIds.length === 0) {
      handleClose();
      return;
    }
    setIsSubmitting(true);
    setSubmissionCount(0);

    const reviewsToSubmit = selectedProductIds.map((variantId) => {
      const reviewData = reviews[variantId];
      const product = order.items.find(
        (item) => item.productVariantId === variantId
      );
      return {
        review: {
          orderId: order.id,
          productVariantId: product.productVariantId,
          rating: reviewData.rating,
          comment: reviewData.comment,
        },
        imageFiles: reviewData.imageFiles || [],
      };
    });

    if (reviewsToSubmit.length === 0) {
      onClose();
      return;
    }

    // Gửi từng đánh giá một cách tuần tự
    for (const payload of reviewsToSubmit) {
      await new Promise((resolve) =>
        createReviewMutation(payload, { onSettled: resolve })
      );
    }
  };

  if (!show || !order) {
    return null;
  }

  const selectedItems = order.items.filter((item) =>
    selectedProductIds.includes(item.productVariantId)
  );
  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-70 z-50 flex justify-center items-start p-4 sm:p-6 md:p-10">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col relative">
        <button
          onClick={handleClose}
          className="absolute -top-3 -right-3 bg-black rounded-full p-1.5 text-white hover:bg-gray-700 z-10 cursor-pointer"
        >
          <IconX size={24} />
        </button>

        <div className="flex-grow overflow-y-auto p-6 sm:p-8">
          {/* Product Selection */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">
              {t("review.select_products_title")}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-3">
              {isCheckingReviewability ? (
                <p>{t("loading")}...</p>
              ) : (
                order.items.map((item, index) => {
                  const canReview =
                    reviewabilityResults[index]?.data?.data === true;
                  return (
                    <SelectableProduct
                      key={item.productVariantId}
                      item={item}
                      isSelected={selectedProductIds.includes(
                        item.productVariantId
                      )}
                      onSelect={handleProductSelect}
                      canReview={canReview}
                    />
                  );
                })
              )}
            </div>
            <p className="text-sm text-gray-600">
              {t("review.selected_products_count", {
                count: selectedProductIds.length,
                total: order.items.length,
              })}
            </p>
          </div>

          {/* Review Forms */}
          {selectedItems.length > 0 && (
            <div>
              <h3 className="text-xl font-bold mb-4 border-t pt-6">
                {t("review.review_section_title")}
              </h3>
              {selectedItems.map((item) => (
                <ReviewProductCard
                  key={item.productVariantId}
                  item={item}
                  reviewData={reviews[item.productVariantId]}
                  onReviewChange={(reviewData) =>
                    handleReviewChange(item.productVariantId, reviewData)
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4  border-t bg-white sticky bottom-0 rounded-b-2xl">
          <button
            onClick={handleSubmit}
            disabled={selectedProductIds.length === 0 || isSubmitting}
            className="w-full bg-black text-white rounded-lg px-6 py-4 font-bold text-base hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity cursor-pointer"
          >
            {isSubmitting
              ? t("review.submit")
              : t("review.submit_review_arrow")}
          </button>
        </div>
      </div>
    </div>
  );
}
