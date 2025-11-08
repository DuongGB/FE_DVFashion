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
      setFormData({
        name: category.name || "",
        description: category.description || "",
        active: category.active !== undefined ? category.active : true,
      });
      setImagePreview(category.image || category.imageUrl || "");
      setImageFile(null);
    } else {
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
      if (!file.type.startsWith("image/")) {
        toast.error(t("admin.category.form.image_error"));
        return;
      }

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
      const categoryData = new FormData();

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

      if (imageFile) {
        categoryData.append("imageFile", imageFile);
      }

      let result;
      if (category) {
        result = await update({
          categoryId: category.id,
          categoryData,
          lang: language,
        });
        toast.success(t("admin.category.form.update_success"));
      } else {
        result = await create({
          categoryData,
          lang: language,
        });
        toast.success(t("admin.category.form.create_success"));
      }

      // Đóng modal và truyền dữ liệu mới về parent
      onClose(result);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        className="relative backdrop-blur-xl bg-white/80 border border-white/30 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden transition-all duration-300 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl z-20 flex items-center justify-center cursor-not-allowed">
            <IconLoader2 size={48} className="animate-spin text-blue-600" />
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 relative rounded-t-2xl">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="absolute top-3 right-3 bg-black/30 backdrop-blur-sm text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={t("common.close")}
          >
            <IconX size={16} />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-md backdrop-blur-sm">
              <IconPhoto size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {category
                  ? t("admin.category.form.edit_title")
                  : t("admin.category.form.create_title")}
              </h2>
              <div className="text-sm text-blue-100 opacity-90">
                {category
                  ? t("admin.category.form.edit_description")
                  : t("admin.category.form.create_description")}
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Basic Information Section */}
          <div className="backdrop-blur-xl bg-white/60 border border-white/30 rounded-xl p-6 shadow-lg">
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
                  className={`w-full px-3 py-2 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white/80 backdrop-blur-sm transition-all duration-200 ${
                    errors.name ? "border-red-500 bg-red-50/50" : ""
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
                className={`w-full px-3 py-2 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white/80 backdrop-blur-sm transition-all duration-200 ${
                  errors.description ? "border-red-500 bg-red-50/50" : ""
                }`}
                placeholder={t("admin.category.form.description_placeholder")}
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
          <div className="backdrop-blur-xl bg-white/60 border border-white/30 rounded-xl p-6 shadow-lg">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
              <IconPhoto size={20} className="text-purple-600" />
              {t("admin.category.form.image_section")}
            </h3>
            <div className="border-2 border-dashed border-white/50 rounded-lg p-6 relative hover:border-gray-400 transition-all duration-200 backdrop-blur-sm bg-white/50">
              {imagePreview ? (
                <div className="relative group">
                  <div className="w-full flex items-center justify-center">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-auto max-h-[60vh] object-contain rounded-lg shadow-md bg-gray-50"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
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
                  <div className="backdrop-blur-sm bg-white/70 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
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
          <div className="flex justify-end gap-2 pt-4 border-t border-white/30">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full shadow-lg cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2 font-semibold"
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
        </div>
      </form>
    </div>
  );
}
