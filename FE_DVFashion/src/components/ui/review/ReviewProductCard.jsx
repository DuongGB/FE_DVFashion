import { useTranslation } from "react-i18next";
import { IconStar, IconPhoto, IconX } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
import { useEffect, useState } from "react";

const FitOption = ({ label, value, emoji, checked, onChange }) => (
  <label
    className={`flex items-center gap-2 px-4 py-2 border rounded-full cursor-pointer transition-colors ${
      checked
        ? "bg-blue-100 border-blue-500 text-blue-700"
        : "bg-gray-100 border-gray-200 hover:bg-gray-200"
    }`}
  >
    <input
      type="radio"
      name={`fit-${value}`}
      value={value}
      checked={checked}
      onChange={onChange}
      className="hidden"
    />
    <span>{emoji}</span>
    <span className="font-medium text-sm">{label}</span>
  </label>
);

export default function ReviewProductCard({
  item,
  onReviewChange,
  reviewData,
}) {
  const { t } = useTranslation();
  const {
    rating = 0,
    comment = "",
    // fit = null,
    // height = "",
    // weight = "",
    imageFiles = [],
  } = reviewData || {};

  const [previews, setPreviews] = useState([]);
  const handleFieldChange = (field, value) => {
    onReviewChange({ ...reviewData, [field]: value });
  };

  const onDrop = (acceptedFiles) => {
    const newFiles = [...imageFiles, ...acceptedFiles].slice(0, 5); // Giới hạn 5 ảnh
    handleFieldChange("imageFiles", newFiles);
  };

  useEffect(() => {
    const newPreviews = imageFiles.map((file) =>
      typeof file === "string" ? file : URL.createObjectURL(file)
    );
    setPreviews(newPreviews);

    // Cleanup function
    return () => newPreviews.forEach((url) => URL.revokeObjectURL(url));
  }, [imageFiles]);

  const removeImage = (indexToRemove) => {
    const newFiles = imageFiles.filter((_, index) => index !== indexToRemove);
    handleFieldChange("imageFiles", newFiles);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 5,
    multiple: true,
  });

  return (
    <div className="backdrop-blur-xl bg-white/80 border border-white/30 rounded-2xl shadow-lg p-6 mb-6">
      <div className="flex items-start mb-6">
        <img
          src={item.imageUrl}
          alt={item.productName}
          className="w-16 h-16 object-cover rounded-md mr-4 border border-white/30 shadow"
        />
        <div className="flex-grow">
          <p className="font-semibold">{item.productName}</p>
          <p className="text-sm text-gray-500">
            {item.color} / {item.sizeName}
          </p>
        </div>
      </div>

      {/* Rating */}
      <div className="mb-6">
        <p className="font-medium mb-2">{t("review.rating")}</p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <IconStar
              key={star}
              className={`cursor-pointer h-7 w-7 ${
                rating >= star ? "text-yellow-400" : "text-gray-300"
              }`}
              fill={rating >= star ? "currentColor" : "none"}
              onClick={() => handleFieldChange("rating", star)}
            />
          ))}
        </div>
      </div>

      {/* Comment */}
      <div className="mb-6">
        <p className="font-medium mb-2">{t("review.comment")}</p>
        <textarea
          className="w-full px-3 py-2 backdrop-blur-sm bg-white/80 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          rows="4"
          placeholder={t("review.comment_placeholder")}
          value={comment}
          onChange={(e) => handleFieldChange("comment", e.target.value)}
        ></textarea>
      </div>

      {/* Image Upload */}
      <div className="mb-6">
        <div
          {...getRootProps()}
          className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center cursor-pointer backdrop-blur-sm bg-white/60 hover:bg-white/80 transition-colors"
        >
          <input {...getInputProps()} />
          <IconPhoto className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 font-semibold text-blue-600">
            {t("review.upload_images")} {t("review.upload_images_limit")}
          </p>
          <p className="text-xs text-gray-500">
            {t("review.upload_images_desc")}
          </p>
        </div>
        {previews.length > 0 && (
          <div className="mt-4 grid grid-cols-5 gap-3">
            {previews.map((preview, index) => (
              <div key={index} className="relative group">
                <img
                  src={preview}
                  alt={`Preview ${index}`}
                  className="w-full h-24 object-cover rounded-lg border border-white/30 shadow"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 cursor-pointer"
                >
                  <IconX size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
