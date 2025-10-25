import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { IconX } from "@tabler/icons-react";
import ReviewProductCard from "./ReviewProductCard";

const SelectableProduct = ({ item, isSelected, onSelect }) => (
  <div
    className={`border-2 rounded-lg p-2 cursor-pointer transition-all ${
      isSelected ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"
    }`}
    onClick={() => onSelect(item.productId)}
  >
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
            readOnly
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
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

  useEffect(() => {
    if (order) {
      const initialReviews = {};
      const allProductIds = order.items.map((item) => item.productId);
      allProductIds.forEach((id) => {
        initialReviews[id] = {
          rating: 0,
          comment: "",
          fit: null,
          height: "",
          weight: "",
        };
      });
      setReviews(initialReviews);
      setSelectedProductIds(allProductIds);
    }
  }, [order]);

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

  const handleProductSelect = (productId) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleReviewChange = (productId, reviewData) => {
    setReviews((prev) => ({
      ...prev,
      [productId]: reviewData,
    }));
  };

  const handleSubmit = () => {
    const reviewsToSubmit = selectedProductIds.map((id) => ({
      productId: id,
      ...reviews[id],
    }));
    console.log("Submitting reviews:", {
      orderId: order.orderId,
      reviews: reviewsToSubmit,
    });
    onClose();
  };

  if (!show || !order) {
    return null;
  }

  const selectedItems = order.items.filter((item) =>
    selectedProductIds.includes(item.productId)
  );
  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-70 z-50 flex justify-center items-start p-4 sm:p-6 md:p-10">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col relative">
        <button
          onClick={onClose}
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
              {order.items.map((item) => (
                <SelectableProduct
                  key={item.productId}
                  item={item}
                  isSelected={selectedProductIds.includes(item.productId)}
                  onSelect={handleProductSelect}
                />
              ))}
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
                  key={item.productId}
                  item={item}
                  reviewData={reviews[item.productId]}
                  onReviewChange={handleReviewChange}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t bg-white sticky bottom-0 rounded-b-2xl">
          <button
            onClick={handleSubmit}
            disabled={selectedProductIds.length === 0}
            className="w-full bg-black text-white rounded-lg px-6 py-4 font-bold text-base hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {t("review.submit_review_arrow")}
          </button>
        </div>
      </div>
    </div>
  );
}
