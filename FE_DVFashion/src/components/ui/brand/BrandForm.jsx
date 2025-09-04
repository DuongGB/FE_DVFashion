import { useState, useEffect } from "react";
import {
  IconX,
  IconBrandAndroid,
  IconUpload,
  IconCheck,
} from "@tabler/icons-react";
import { toast } from "react-toastify";
import { useBrand } from "../../../hooks/useBrand";

export default function BrandForm({ isOpen, onClose, brand }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    active: true,
  });
  const [language, setLanguage] = useState("VI");
  const [logoFile, setLogoFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState({});

  const { createBrand, updateBrand, isCreating, isUpdating } = useBrand();

  const loading = isCreating || isUpdating;

  useEffect(() => {
    if (brand) {
      // Edit mode - populate form with existing data
      setFormData({
        name: brand.name || "",
        description: brand.description || "",
        active: brand.active !== undefined ? brand.active : true,
      });
      setImagePreview(brand.image || "");
      setLogoFile(null);
    } else {
      // Create mode - reset form
      setFormData({
        name: "",
        description: "",
        active: true,
      });
      setImagePreview("");
      setLogoFile(null);
    }
    setErrors({});
    setLanguage("VI");
  }, [brand, isOpen]);

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
        toast.error("Vui lòng chọn file hình ảnh!");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước file không được vượt quá 5MB!");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        setLogoFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview("");
    setLogoFile(null);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên thương hiệu là bắt buộc";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Mô tả thương hiệu là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    try {
      // Prepare form data for multipart/form-data
      const brandData = new FormData();

      // Add brand JSON data
      const brandRequest = {
        name: formData.name,
        description: formData.description,
        active: formData.active,
      };

      brandData.append(
        "brand",
        new Blob([JSON.stringify(brandRequest)], {
          type: "application/json",
        })
      );

      // Add image file if exists
      if (logoFile) {
        brandData.append("logoFile", logoFile);
      }

      if (brand) {
        // Update existing brand
        await updateBrand({
          brandId: brand.id,
          brandData,
          lang: language,
        });
        toast.success("Cập nhật thương hiệu thành công!");
      } else {
        // Create new brand
        await createBrand({
          brandData,
          lang: language,
        });
        toast.success("Tạo thương hiệu thành công!");
      }

      onClose();
    } catch (error) {
      console.error("Error submitting brand:", error);
      const errorMessage =
        error.response?.data?.message ||
        (brand
          ? "Có lỗi xảy ra khi cập nhật thương hiệu!"
          : "Có lỗi xảy ra khi tạo thương hiệu!");
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
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <IconBrandAndroid size={24} className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              {brand ? "Chỉnh sửa thương hiệu" : "Tạo thương hiệu mới"}
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 bg-black text-white rounded-full transition-colors cursor-pointer hover:bg-gray-800 disabled:opacity-50"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Brand Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên thương hiệu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập tên thương hiệu..."
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="active"
                    checked={formData.active === true}
                    onChange={() => handleInputChange("active", true)}
                    className="mr-3"
                  />
                  <span className="text-green-600 font-medium">Hoạt động</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="active"
                    checked={formData.active === false}
                    onChange={() => handleInputChange("active", false)}
                    className="mr-3"
                  />
                  <span className="text-red-600 font-medium">
                    Không hoạt động
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Nhập mô tả thương hiệu..."
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <IconBrandAndroid size={16} className="inline mr-1" />
              Logo thương hiệu
            </label>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 relative">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <IconX size={16} />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <IconUpload
                    size={48}
                    className="mx-auto text-gray-400 mb-2"
                  />
                  <p className="text-sm text-gray-600 mb-2">
                    Kéo thả hoặc click để tải logo lên
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF (tối đa 5MB)
                  </p>
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <IconCheck size={16} />
                  {brand ? "Cập nhật" : "Tạo mới"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
