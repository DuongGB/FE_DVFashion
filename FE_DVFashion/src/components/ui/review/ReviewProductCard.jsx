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
    <div className="bg-gray-50 p-6 rounded-lg mb-6">
      <div className="flex items-start mb-6">
        <img
          src={item.imageUrl}
          alt={item.productName}
          className="w-16 h-16 object-cover rounded-md mr-4"
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
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white"
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
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-100"
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
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                >
                  <IconX size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fit */}
      {/* <div className="mb-6">
        <p className="font-medium mb-3">{t("review.fit_title")}</p>
        <div className="flex gap-3">
          <FitOption
            label={t("review.fit_tight")}
            value="tight"
            emoji="😥"
            checked={fit === "tight"}
            onChange={() => handleFieldChange("fit", "tight")}
          />
          <FitOption
            label={t("review.fit_true_to_size")}
            value="true_to_size"
            emoji="😊"
            checked={fit === "true_to_size"}
            onChange={() => handleFieldChange("fit", "true_to_size")}
          />
          <FitOption
            label={t("review.fit_loose")}
            value="loose"
            emoji="😲"
            checked={fit === "loose"}
            onChange={() => handleFieldChange("fit", "loose")}
          />
        </div>
      </div> */}

      {/* Body Info */}
      {/* <div>
        <p className="font-medium mb-3">{t("review.body_info_title")}</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              {t("review.height_cm")}
            </label>
            <input
              type="number"
              placeholder="165"
              value={height}
              onChange={(e) => handleFieldChange("height", e.target.value)}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              {t("review.weight_kg")}
            </label>
            <input
              type="number"
              placeholder="65"
              value={weight}
              onChange={(e) => handleFieldChange("weight", e.target.value)}
              className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button className="bg-blue-600 text-white rounded-lg px-6 py-2 font-bold text-sm hover:bg-blue-700">
            {t("review.save_info")}
          </button>
          <button className="border border-gray-400 rounded-lg px-6 py-2 font-bold text-sm hover:bg-gray-100">
            {t("review.cancel_edit")}
          </button>
        </div>
      </div> */}
    </div>
  );
}
