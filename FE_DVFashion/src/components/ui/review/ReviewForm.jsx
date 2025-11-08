import React, { useState, useEffect } from "react";
import {
  IconX,
  IconStar,
  IconStarFilled,
  IconUpload,
  IconTrash,
  IconCheck,
  IconUser,
  IconPackage,
  IconPhoto,
  IconMessageCircle,
} from "@tabler/icons-react";

const ReviewForm = ({
  isOpen,
  onClose,
  onSubmit,
  review = null,
  orderItem = null,
}) => {
  const [formData, setFormData] = useState({
    rating: 5,
    comment: "",
    images: [],
    status: "PENDING",
    verifiedPurchase: false,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);

  // Load data when editing review
  useEffect(() => {
    if (review) {
      setFormData({
        rating: review.rating || 5,
        comment: review.comment || "",
        images: review.images || [],
        status: review.status || "PENDING",
        verifiedPurchase: review.verifiedPurchase || false,
      });
    } else {
      // Reset form for new review
      setFormData({
        rating: 5,
        comment: "",
        images: [],
        status: "PENDING",
        verifiedPurchase: orderItem ? true : false,
      });
    }
    setErrors({});
    setImageFiles([]);
  }, [review, orderItem, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user changes input
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleRatingChange = (rating) => {
    setFormData((prev) => ({
      ...prev,
      rating,
    }));

    if (errors.rating) {
      setErrors((prev) => ({ ...prev, rating: "" }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxImages = 5;
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    // Validate file count
    if (formData.images.length + files.length > maxImages) {
      setErrors((prev) => ({
        ...prev,
        images: `Chỉ được tải lên tối đa ${maxImages} hình ảnh`,
      }));
      return;
    }

    // Validate file size and type
    const validFiles = [];
    const validImageTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    for (const file of files) {
      if (!validImageTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          images: "Chỉ chấp nhận file ảnh (JPEG, PNG, WebP)",
        }));
        return;
      }

      if (file.size > maxFileSize) {
        setErrors((prev) => ({
          ...prev,
          images: "Kích thước file không được vượt quá 5MB",
        }));
        return;
      }

      validFiles.push(file);
    }

    // Create preview URLs
    const newImages = validFiles.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));

    setImageFiles((prev) => [...prev, ...validFiles]);

    // Clear image errors
    if (errors.images) {
      setErrors((prev) => ({ ...prev, images: "" }));
    }
  };

  const handleRemoveImage = (index) => {
    const imageToRemove = formData.images[index];

    // Revoke URL if it's a local file
    if (imageToRemove.url && imageToRemove.url.startsWith("blob:")) {
      URL.revokeObjectURL(imageToRemove.url);
    }

    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));

    // Remove from file list if it's a new file
    if (imageToRemove.file) {
      setImageFiles((prev) =>
        prev.filter((file) => file !== imageToRemove.file)
      );
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Rating validation
    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = "Vui lòng chọn điểm đánh giá từ 1 đến 5 sao";
    }

    // Comment validation
    if (!formData.comment.trim()) {
      newErrors.comment = "Vui lòng nhập bình luận";
    } else if (formData.comment.trim().length < 10) {
      newErrors.comment = "Bình luận phải có ít nhất 10 ký tự";
    } else if (formData.comment.trim().length > 1000) {
      newErrors.comment = "Bình luận không được vượt quá 1000 ký tự";
    }

    // Status validation (for admin)
    if (!formData.status) {
      newErrors.status = "Vui lòng chọn trạng thái";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      try {
        const submitData = {
          ...formData,
          comment: formData.comment.trim(),
          imageFiles: imageFiles, // New image files to upload
          existingImages: formData.images.filter((img) => !img.file), // Existing images
        };

        await onSubmit(submitData);
      } catch (error) {
        console.error("Error submitting review:", error);
        setErrors({
          submit: "Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const renderStars = (rating, isInteractive = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          className={`${
            isInteractive
              ? "hover:scale-110 transition-transform cursor-pointer"
              : ""
          }`}
          onClick={isInteractive ? () => handleRatingChange(i) : undefined}
          disabled={!isInteractive}
        >
          {i <= rating ? (
            <IconStarFilled size={24} className="text-yellow-400" />
          ) : (
            <IconStar size={24} className="text-gray-300" />
          )}
        </button>
      );
    }
    return stars;
  };

  const getRatingText = (rating) => {
    switch (rating) {
      case 1:
        return "Rất kém";
      case 2:
        return "Kém";
      case 3:
        return "Trung bình";
      case 4:
        return "Tốt";
      case 5:
        return "Xuất sắc";
      default:
        return "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="backdrop-blur-xl bg-white/80 border border-white/30 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-purple-600 text-white p-6 flex justify-between items-center rounded-t-2xl">
          <div className="flex items-center gap-3">
            <IconStar size={24} className="text-yellow-200" />
            <h2 className="text-xl font-semibold text-white">
              {review ? "Chỉnh sửa đánh giá" : "Tạo đánh giá mới"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="bg-black/30 backdrop-blur-sm text-white rounded-full p-2 hover:bg-black/50 transition-colors cursor-pointer"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Order/Product Information (if available) */}
          {orderItem && (
            <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-4 rounded-xl shadow-lg mb-4">
              <h3 className="font-semibold text-lg mb-3 text-yellow-800 flex items-center gap-2">
                <IconPackage size={18} />
                Thông tin sản phẩm
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-yellow-600 font-medium">
                    Sản phẩm:
                  </span>
                  <p className="text-yellow-800 font-semibold">
                    {orderItem.productVariant?.product?.name}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-yellow-600 font-medium">
                    Biến thể:
                  </span>
                  <p className="text-yellow-800">
                    {orderItem.productVariant?.color} -{" "}
                    {orderItem.productVariant?.size}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Rating Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Điểm đánh giá *
            </label>
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-2">
                {renderStars(formData.rating, true)}
              </div>
              <div className="text-center">
                <span className="text-lg font-semibold text-gray-700">
                  {formData.rating} sao - {getRatingText(formData.rating)}
                </span>
              </div>
            </div>
            {errors.rating && (
              <p className="text-red-500 text-sm mt-2 text-center">
                {errors.rating}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <IconMessageCircle size={16} className="inline mr-1" />
              Bình luận *
            </label>
            <textarea
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              rows={5}
              maxLength={1000}
              className={`w-full px-3 py-2 backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none transition-all duration-200 ${
                errors.comment ? "border-red-500" : "hover:border-gray-400"
              }`}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
            />
            <div className="flex justify-between items-center mt-1">
              {errors.comment ? (
                <p className="text-red-500 text-sm">{errors.comment}</p>
              ) : (
                <p className="text-gray-500 text-sm">Tối thiểu 10 ký tự</p>
              )}
              <p className="text-gray-400 text-sm">
                {formData.comment.length}/1000
              </p>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <IconPhoto size={16} className="inline mr-1" />
              Hình ảnh (Tùy chọn)
            </label>
            <div className="mb-4">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-white/30 border-dashed rounded-lg cursor-pointer backdrop-blur-sm bg-white/60 hover:bg-white/80 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <IconUpload size={24} className="text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold">Nhấp để tải lên</span> hoặc
                    kéo thả
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, WebP (tối đa 5 ảnh, mỗi ảnh 5MB)
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={formData.images.length >= 5}
                />
              </label>
            </div>
            {/* Image Preview */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {formData.images.map((image, index) => (
                  <div key={image.id || index} className="relative group">
                    <img
                      src={image.url || image}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-white/30 shadow"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <IconTrash size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {errors.images && (
              <p className="text-red-500 text-sm mt-2">{errors.images}</p>
            )}
          </div>

          {/* Status (for admin) */}
          {review && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`w-full px-3 py-2 backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all duration-200 ${
                  errors.status ? "border-red-500" : "hover:border-gray-400"
                }`}
              >
                <option value="PENDING">Chờ duyệt</option>
                <option value="APPROVED">Đã duyệt</option>
                <option value="REJECTED">Từ chối</option>
                <option value="HIDDEN">Ẩn</option>
              </select>
              {errors.status && (
                <p className="text-red-500 text-sm mt-1">{errors.status}</p>
              )}
            </div>
          )}

          {/* Verified Purchase */}
          {orderItem && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="verifiedPurchase"
                name="verifiedPurchase"
                checked={formData.verifiedPurchase}
                onChange={handleChange}
                className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
              />
              <label
                htmlFor="verifiedPurchase"
                className="ml-2 text-sm text-gray-700"
              >
                Xác thực mua hàng (đánh giá từ khách hàng đã mua sản phẩm)
              </label>
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-700 text-sm">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-white/30">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 text-gray-600 backdrop-blur-sm bg-white/70 border border-white/30 rounded-lg hover:bg-white/90 transition-all duration-200 cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-yellow-600 to-purple-600 text-white rounded-lg shadow-lg hover:from-yellow-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <IconCheck size={16} />
                  {review ? "Cập nhật" : "Gửi đánh giá"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewForm;
