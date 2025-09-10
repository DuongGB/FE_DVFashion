import { useState, useEffect } from "react";
import {
  IconX,
  IconPhoto,
  IconUpload,
  IconCheck,
  IconLoader2,
  IconInfoCircle,
  IconTag,
} from "@tabler/icons-react";
import { toast } from "react-toastify";
import { useCategory } from "../../../hooks/useCategory";
import { useTranslation } from "react-i18next";

export default function CategoryForm({ isOpen, onClose, category }) {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    active: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState({});

  const language = i18n.language || "VI";
  const { create, update, isCreating, isUpdating } = useCategory(language);

  const loading = isCreating || isUpdating;

  // Force re-render when language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      // Force component update
    };

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  useEffect(() => {
    if (category) {
      // Edit mode - populate form with existing data
      setFormData({
        name: category.name || "",
        description: category.description || "",
        active: category.active !== undefined ? category.active : true,
      });
      setImagePreview(category.image || category.imageUrl || "");
      setImageFile(null);
    } else {
      // Create mode - reset form
      setFormData({
        name: "",
        description: "",
        active: true,
      });
      setImagePreview("");
      setImageFile(null);
    }
    setErrors({});
  }, [category, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear errors
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error(t("admin.category.form.image_error"));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t("admin.category.form.image_size_error"));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setImageFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview("");
    setImageFile(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t("admin.category.form.category_name_required");
    }

    if (!formData.description.trim()) {
      newErrors.description = t("admin.category.form.description_required");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error(t("admin.category.form.validation_error"));
      return;
    }

    try {
      // Prepare form data for multipart/form-data
      const categoryData = new FormData();

      // Add category JSON data
      const categoryRequest = {
        name: formData.name,
        description: formData.description,
        active: formData.active,
      };

      categoryData.append(
        "category",
        new Blob([JSON.stringify(categoryRequest)], {
          type: "application/json",
        })
      );

      // Add image file if exists
      if (imageFile) {
        categoryData.append("imageFile", imageFile);
      }

      if (category) {
        // Update existing category
        await update({
          categoryId: category.id,
          categoryData,
          lang: language,
        });
        toast.success(t("admin.category.form.update_success"));
      } else {
        // Create new category
        await create({
          categoryData,
          lang: language,
        });
        toast.success(t("admin.category.form.create_success"));
      }

      onClose();
    } catch (error) {
      console.error("Error submitting category:", error);
      const errorMessage =
        error.response?.data?.message ||
        (category
          ? t("admin.category.form.update_error")
          : t("admin.category.form.create_error"));
      toast.error(errorMessage);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl relative overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header với gradient background */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative">
          <button
            onClick={handleClose}
            disabled={loading}
            className="absolute top-4 right-4 bg-black backdrop-blur-sm text-white rounded-full w-10 h-10 flex items-center justify-center text-xl hover:bg-gray-800 transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            <IconX size={20} />
          </button>

          <div className="flex items-start gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
              <IconPhoto size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">
                {category
                  ? t("admin.category.form.edit_title")
                  : t("admin.category.form.create_title")}
              </h2>
              <p className="text-blue-100 opacity-90">
                {category
                  ? t("admin.category.form.edit_description")
                  : t("admin.category.form.create_description")}
              </p>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <IconTag size={20} className="text-blue-600" />
                {t("admin.category.form.basic_info")}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("admin.category.form.category_name")} *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    disabled={loading}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 ${
                      errors.name
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder={t(
                      "admin.category.form.category_name_placeholder"
                    )}
                    required
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <IconX size={12} />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("admin.category.form.status")}
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="active"
                        checked={formData.active === true}
                        onChange={() => handleInputChange("active", true)}
                        disabled={loading}
                        className="w-4 h-4 text-green-600 focus:ring-green-500 disabled:cursor-not-allowed transition-all duration-200"
                      />
                      <span className="ml-3 text-sm font-medium text-green-600">
                        {t("admin.category.form.status_active")}
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="active"
                        checked={formData.active === false}
                        onChange={() => handleInputChange("active", false)}
                        disabled={loading}
                        className="w-4 h-4 text-red-600 focus:ring-red-500 disabled:cursor-not-allowed transition-all duration-200"
                      />
                      <span className="ml-3 text-sm font-medium text-red-600">
                        {t("admin.category.form.status_inactive")}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("admin.category.form.description")} *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  disabled={loading}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 ${
                    errors.description
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder={t("admin.category.form.description_placeholder")}
                  required
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <IconX size={12} />
                    {errors.description}
                  </p>
                )}
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <IconPhoto size={20} className="text-purple-600" />
                {t("admin.category.form.image_section")}
              </h3>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 relative hover:border-gray-400 transition-all duration-200">
                {imagePreview ? (
                  <div className="relative group">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg shadow-md"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                      <button
                        type="button"
                        onClick={removeImage}
                        disabled={loading}
                        className="bg-red-500 text-white rounded-full p-3 hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <IconX size={20} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <IconUpload size={32} className="text-gray-400" />
                    </div>
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      {t("admin.category.form.image_upload")}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      {t("admin.category.form.image_drag_drop")}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                      <IconInfoCircle size={12} />
                      {t("admin.category.form.image_format")}
                    </p>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={loading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("admin.category.form.cancel")}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <IconLoader2 size={16} className="animate-spin" />
                    {category
                      ? t("admin.category.form.updating")
                      : t("admin.category.form.creating")}
                  </>
                ) : (
                  <>
                    <IconCheck size={16} />
                    {category
                      ? t("admin.category.form.update_button")
                      : t("admin.category.form.create_button")}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
