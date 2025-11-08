import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IconStarFilled, IconX, IconTrash } from "@tabler/icons-react";
import { useUpdateReview } from "../../../hooks/useReview";

export default function ModalUpdateReview({
  show,
  onClose,
  review,
  onSuccess,
}) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(review?.rating || 0);
  const [comment, setComment] = useState(review?.comment || "");
  const [imageFiles, setImageFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [oldImages, setOldImages] = useState(review?.imageUrls || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutate: updateReview } = useUpdateReview();

  // Xử lý chọn ảnh mới
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    setPreviewUrls(files.map((file) => URL.createObjectURL(file)));
  };

  // Xóa ảnh mới vừa chọn
  const handleRemoveNewImage = (idx) => {
    const newFiles = [...imageFiles];
    const newPreviews = [...previewUrls];
    newFiles.splice(idx, 1);
    newPreviews.splice(idx, 1);
    setImageFiles(newFiles);
    setPreviewUrls(newPreviews);
  };

  // Xóa ảnh cũ (đã upload trước đó)
  const handleRemoveOldImage = (idx) => {
    setOldImages((prev) => prev.filter((_, i) => i !== idx));
  };

  // Xử lý submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    updateReview(
      {
        reviewId: review.id,
        review: { rating, comment, keepImageUrls: oldImages },
        imageFiles,
      },
      {
        onSuccess: () => {
          setIsSubmitting(false);
          if (onSuccess) onSuccess();
        },
        onError: () => setIsSubmitting(false),
      }
    );
  };

  if (!show || !review) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden
        rounded-3xl shadow-2xl border border-white/30
        bg-gradient-to-br from-white/70 via-white/40 to-blue-200/50
        backdrop-blur-2xl
        transition-all duration-300
        animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-blue-700 cursor-pointer bg-white/60 backdrop-blur-sm rounded-full p-2 shadow z-10 transition"
        >
          <IconX size={24} />
        </button>
        <form className="p-6" onSubmit={handleSubmit}>
          <h3 className="text-xl font-bold mb-4">
            {t("review.update_review")}
          </h3>
          <div className="mb-4">
            <label className="block font-semibold mb-1">
              {t("review.rating")}
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <IconStarFilled
                  key={i}
                  size={28}
                  className={i <= rating ? "text-yellow-400" : "text-gray-300"}
                  onClick={() => setRating(i)}
                  style={{ cursor: "pointer" }}
                />
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">
              {t("review.comment")}
            </label>
            <textarea
              className="w-full px-3 py-2 backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1">
              {t("review.upload_images")}
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="block mb-2 cursor-pointer"
            />
            {/* Preview new images */}
            {previewUrls.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={url}
                      alt="preview"
                      className="w-16 h-16 object-cover rounded-lg border border-white/30 shadow"
                    />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 cursor-pointer"
                      onClick={() => handleRemoveNewImage(idx)}
                      title={t("common.delete")}
                    >
                      <IconTrash size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {/* Show old images if no new selected */}
            {previewUrls.length === 0 && oldImages && oldImages.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {oldImages.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={url}
                      alt="old"
                      className="w-16 h-16 object-cover rounded-lg border border-white/30 shadow"
                    />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 cursor-pointer"
                      onClick={() => handleRemoveOldImage(idx)}
                      title={t("common.delete")}
                    >
                      <IconTrash size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg px-6 py-3 font-bold text-base hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-lg transition-all duration-200"
            disabled={isSubmitting}
          >
            {isSubmitting ? t("review.updating") : t("review.update")}
          </button>
        </form>
      </div>
    </div>
  );
}
