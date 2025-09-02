import { useState, useEffect } from "react";
import {
  IconX,
  IconBrandAndroid,
  IconUpload,
  IconCheck,
} from "@tabler/icons-react";
import { toast } from "react-toastify";

export default function BrandForm({ isOpen, onClose, onSubmit, brand }) {
  const [formData, setFormData] = useState({
    logo: "",
    active: true,
    translations: [
      {
        language: "vi",
        name: "",
        description: "",
      },
      {
        language: "en",
        name: "",
        description: "",
      },
    ],
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [logoPreview, setLogoPreview] = useState("");

  useEffect(() => {
    if (brand) {
      // Edit mode - populate form with existing data
      setFormData({
        logo: brand.logo || "",
        active: brand.active,
        translations: brand.translations || [
          { language: "vi", name: "", description: "" },
          { language: "en", name: "", description: "" },
        ],
      });
      setLogoPreview(brand.logo || "");
    } else {
      // Create mode - reset form
      setFormData({
        logo: "",
        active: true,
        translations: [
          { language: "vi", name: "", description: "" },
          { language: "en", name: "", description: "" },
        ],
      });
      setLogoPreview("");
    }
    setErrors({});
  }, [brand, isOpen]);

  const handleTranslationChange = (language, field, value) => {
    setFormData((prev) => ({
      ...prev,
      translations: prev.translations.map((t) =>
        t.language === language ? { ...t, [field]: value } : t
      ),
    }));

    // Clear errors
    if (errors[`${language}_${field}`]) {
      setErrors((prev) => ({
        ...prev,
        [`${language}_${field}`]: "",
      }));
    }
  };

  const handleLogoChange = (e) => {
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
        const logoUrl = e.target.result;
        setLogoPreview(logoUrl);
        setFormData((prev) => ({ ...prev, logo: logoUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoUrlChange = (e) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, logo: url }));
    setLogoPreview(url);
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate Vietnamese translation
    const viTranslation = formData.translations.find(
      (t) => t.language === "vi"
    );
    if (!viTranslation?.name.trim()) {
      newErrors.vi_name = "Tên thương hiệu tiếng Việt là bắt buộc";
    }
    if (!viTranslation?.description.trim()) {
      newErrors.vi_description = "Mô tả tiếng Việt là bắt buộc";
    }

    // Validate English translation
    const enTranslation = formData.translations.find(
      (t) => t.language === "en"
    );
    if (!enTranslation?.name.trim()) {
      newErrors.en_name = "Tên thương hiệu tiếng Anh là bắt buộc";
    }
    if (!enTranslation?.description.trim()) {
      newErrors.en_description = "Mô tả tiếng Anh là bắt buộc";
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

    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error submitting brand:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const viTranslation =
    formData.translations.find((t) => t.language === "vi") || {};
  const enTranslation =
    formData.translations.find((t) => t.language === "en") || {};

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide"
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
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <IconBrandAndroid size={16} className="inline mr-1" />
                Logo thương hiệu
              </label>

              {/* Logo URL Input */}
              <div className="mb-4">
                <input
                  type="url"
                  value={formData.logo}
                  onChange={handleLogoUrlChange}
                  placeholder="Nhập URL logo hoặc tải lên file..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Logo Preview/Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 relative">
                {logoPreview ? (
                  <div className="relative">
                    <div className="flex items-center justify-center h-40 bg-white rounded-lg border">
                      <img
                        src={logoPreview}
                        alt="Logo Preview"
                        className="max-h-32 max-w-full object-contain"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      <div className="hidden items-center justify-center h-32 text-gray-500">
                        <IconBrandAndroid size={48} />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setLogoPreview("");
                        setFormData((prev) => ({ ...prev, logo: "" }));
                      }}
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
                      PNG, JPG, SVG (tối đa 5MB)
                    </p>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
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
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, active: true }))
                    }
                    className="mr-3"
                  />
                  <span className="text-green-600 font-medium">Hoạt động</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="active"
                    checked={formData.active === false}
                    onChange={() =>
                      setFormData((prev) => ({ ...prev, active: false }))
                    }
                    className="mr-3"
                  />
                  <span className="text-red-600 font-medium">
                    Không hoạt động
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Translations */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Thông tin đa ngôn ngữ
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vietnamese Translation */}
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center mb-4">
                  <img
                    src="https://flagcdn.com/w20/vn.png"
                    alt="Vietnamese"
                    className="w-5 h-3 mr-2"
                  />
                  <h4 className="font-semibold text-gray-800">Tiếng Việt</h4>
                  <span className="text-red-500 ml-1">*</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên thương hiệu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={viTranslation.name || ""}
                      onChange={(e) =>
                        handleTranslationChange("vi", "name", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.vi_name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Nhập tên thương hiệu..."
                    />
                    {errors.vi_name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.vi_name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={viTranslation.description || ""}
                      onChange={(e) =>
                        handleTranslationChange(
                          "vi",
                          "description",
                          e.target.value
                        )
                      }
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.vi_description
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Nhập mô tả thương hiệu..."
                    />
                    {errors.vi_description && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.vi_description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* English Translation */}
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center mb-4">
                  <img
                    src="https://flagcdn.com/w20/us.png"
                    alt="English"
                    className="w-5 h-3 mr-2"
                  />
                  <h4 className="font-semibold text-gray-800">English</h4>
                  <span className="text-red-500 ml-1">*</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Brand Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={enTranslation.name || ""}
                      onChange={(e) =>
                        handleTranslationChange("en", "name", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.en_name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter brand name..."
                    />
                    {errors.en_name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.en_name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={enTranslation.description || ""}
                      onChange={(e) =>
                        handleTranslationChange(
                          "en",
                          "description",
                          e.target.value
                        )
                      }
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.en_description
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter brand description..."
                    />
                    {errors.en_description && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.en_description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
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
