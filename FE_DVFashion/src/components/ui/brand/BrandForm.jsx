import { useState, useEffect } from "react";
import {
  IconX,
  IconBrandAndroid,
  IconUpload,
  IconCheck,
  IconLoader2,
  IconInfoCircle,
  IconTag,
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
              <IconBrandAndroid size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">
                {brand ? "Chỉnh sửa thương hiệu" : "Tạo thương hiệu mới"}
              </h2>
              <p className="text-blue-100 opacity-90">
                {brand
                  ? "Cập nhật thông tin thương hiệu hiện tại"
                  : "Thiết lập thông tin cho thương hiệu mới"}
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
                Thông tin cơ bản
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Brand Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên thương hiệu *
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
                    placeholder="Nhập tên thương hiệu..."
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
                    Trạng thái
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
                        🟢 Hoạt động
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
                        🔴 Không hoạt động
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả *
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
                  placeholder="Nhập mô tả thương hiệu..."
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

            {/* Logo Upload Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <IconBrandAndroid size={20} className="text-purple-600" />
                Logo thương hiệu
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
                      Tải logo lên
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      Kéo thả hoặc click để tải logo lên
                    </p>
                    <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                      <IconInfoCircle size={12} />
                      PNG, JPG, GIF (tối đa 5MB)
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
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <IconLoader2 size={16} className="animate-spin" />
                    {brand ? "Đang cập nhật..." : "Đang tạo..."}
                  </>
                ) : (
                  <>
                    <IconCheck size={16} />
                    {brand ? "Cập nhật thương hiệu" : "Tạo thương hiệu mới"}
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
