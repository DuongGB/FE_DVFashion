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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <IconStar size={24} className="text-yellow-500" />
            <h2 className="text-xl font-semibold text-gray-800">
              {review ? "Chỉnh sửa đánh giá" : "Tạo đánh giá mới"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-black text-white rounded-full transition-colors cursor-pointer hover:bg-gray-800"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Order/Product Information (if available) */}
          {orderItem && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-lg mb-3 text-blue-800 flex items-center gap-2">
                <IconPackage size={18} />
                Thông tin sản phẩm
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-blue-600 font-medium">
                    Sản phẩm:
                  </span>
                  <p className="text-blue-800 font-semibold">
                    {orderItem.productVariant?.product?.name}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-blue-600 font-medium">
                    Biến thể:
                  </span>
                  <p className="text-blue-800">
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none ${
                errors.comment ? "border-red-500" : "border-gray-300"
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

            {/* Upload Button */}
            <div className="mb-4">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
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
                      className="w-full h-24 object-cover rounded-lg border"
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                  errors.status ? "border-red-500" : "border-gray-300"
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
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
