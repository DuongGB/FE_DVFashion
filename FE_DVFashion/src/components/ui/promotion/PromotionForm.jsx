import React, { useState, useEffect } from "react";
import {
  IconX,
  IconCalendar,
  IconPercentage,
  IconCurrencyDollar,
  IconPackage,
  IconTag,
  IconDiscount,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";

const PromotionForm = ({
  isOpen,
  onClose,
  onSubmit,
  promotion = null,
  products = [],
  categories = [],
}) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    type: "PERCENTAGE", // PERCENTAGE hoặc FIXED_AMOUNT
    value: "",
    minOrderAmount: "",
    maxUsage: "",
    startDate: "",
    endDate: "",
    active: true,
    applicableProducts: [],
    applicableCategories: [],
  });

  const [errors, setErrors] = useState({});
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [showCategorySelector, setShowCategorySelector] = useState(false);

  // Load dữ liệu khi edit promotion
  useEffect(() => {
    if (promotion) {
      setFormData({
        name: promotion.name || "",
        code: promotion.code || "",
        description: promotion.description || "",
        type: promotion.type || "PERCENTAGE",
        value: promotion.value || "",
        minOrderAmount: promotion.minOrderAmount || "",
        maxUsage: promotion.maxUsage || "",
        startDate: promotion.startDate ? promotion.startDate.split("T")[0] : "",
        endDate: promotion.endDate ? promotion.endDate.split("T")[0] : "",
        active: promotion.active !== undefined ? promotion.active : true,
        applicableProducts: promotion.applicableProducts || [],
        applicableCategories: promotion.applicableCategories || [],
      });
    } else {
      // Reset form cho create mới
      setFormData({
        name: "",
        code: "",
        description: "",
        type: "PERCENTAGE",
        value: "",
        minOrderAmount: "",
        maxUsage: "",
        startDate: "",
        endDate: "",
        active: true,
        applicableProducts: [],
        applicableCategories: [],
      });
    }
    setErrors({});
  }, [promotion, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error khi user thay đổi
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleProductToggle = (product) => {
    setFormData((prev) => ({
      ...prev,
      applicableProducts: prev.applicableProducts.find(
        (p) => p.id === product.id
      )
        ? prev.applicableProducts.filter((p) => p.id !== product.id)
        : [...prev.applicableProducts, product],
    }));
  };

  const handleCategoryToggle = (category) => {
    setFormData((prev) => ({
      ...prev,
      applicableCategories: prev.applicableCategories.find(
        (c) => c.id === category.id
      )
        ? prev.applicableCategories.filter((c) => c.id !== category.id)
        : [...prev.applicableCategories, category],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên khuyến mãi là bắt buộc";
    }

    if (!formData.code.trim()) {
      newErrors.code = "Mã khuyến mãi là bắt buộc";
    }

    if (!formData.value || formData.value <= 0) {
      newErrors.value = "Giá trị khuyến mãi phải lớn hơn 0";
    }

    if (formData.type === "PERCENTAGE" && formData.value > 100) {
      newErrors.value = "Phần trăm giảm không được vượt quá 100%";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Ngày bắt đầu là bắt buộc";
    }

    if (!formData.endDate) {
      newErrors.endDate = "Ngày kết thúc là bắt buộc";
    }

    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) >= new Date(formData.endDate)
    ) {
      newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    }

    if (formData.minOrderAmount && formData.minOrderAmount < 0) {
      newErrors.minOrderAmount = "Giá trị đơn hàng tối thiểu không được âm";
    }

    if (formData.maxUsage && formData.maxUsage <= 0) {
      newErrors.maxUsage = "Số lần sử dụng tối đa phải lớn hơn 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Format data trước khi submit
      const submitData = {
        ...formData,
        value: parseFloat(formData.value),
        minOrderAmount: formData.minOrderAmount
          ? parseFloat(formData.minOrderAmount)
          : null,
        maxUsage: formData.maxUsage ? parseInt(formData.maxUsage) : null,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        applicableProducts: formData.applicableProducts.map((p) => p.id),
        applicableCategories: formData.applicableCategories.map((c) => c.id),
      };
      onSubmit(submitData);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
        style={{
          scrollbarWidth: "none" /* Firefox */,
          msOverflowStyle: "none" /* Internet Explorer 10+ */,
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-3">
            <IconDiscount size={24} className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              {promotion ? "Chỉnh sửa khuyến mãi" : "Tạo khuyến mãi mới"}
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
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tên khuyến mãi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <IconTag size={16} className="inline mr-1" />
                Tên khuyến mãi *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập tên khuyến mãi"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Mã khuyến mãi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <IconDiscount size={16} className="inline mr-1" />
                Mã khuyến mãi *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.code ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập mã khuyến mãi"
              />
              {errors.code && (
                <p className="text-red-500 text-sm mt-1">{errors.code}</p>
              )}
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập mô tả khuyến mãi"
            />
          </div>

          {/* Loại và giá trị khuyến mãi */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại khuyến mãi *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="PERCENTAGE">Phần trăm (%)</option>
                <option value="FIXED_AMOUNT">Số tiền cố định (VNĐ)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá trị *
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  min="0"
                  max={formData.type === "PERCENTAGE" ? "100" : undefined}
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.value ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="0"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  {formData.type === "PERCENTAGE" ? (
                    <IconPercentage size={16} className="text-gray-400" />
                  ) : (
                    <IconCurrencyDollar size={16} className="text-gray-400" />
                  )}
                </div>
              </div>
              {errors.value && (
                <p className="text-red-500 text-sm mt-1">{errors.value}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đơn hàng tối thiểu (VNĐ)
              </label>
              <input
                type="number"
                name="minOrderAmount"
                value={formData.minOrderAmount}
                onChange={handleChange}
                min="0"
                step="1000"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.minOrderAmount ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0"
              />
              {errors.minOrderAmount && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.minOrderAmount}
                </p>
              )}
            </div>
          </div>

          {/* Thời gian và giới hạn */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <IconCalendar size={16} className="inline mr-1" />
                Ngày bắt đầu *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.startDate ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.startDate && (
                <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <IconCalendar size={16} className="inline mr-1" />
                Ngày kết thúc *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.endDate ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.endDate && (
                <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số lần sử dụng tối đa
              </label>
              <input
                type="number"
                name="maxUsage"
                value={formData.maxUsage}
                onChange={handleChange}
                min="1"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.maxUsage ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Không giới hạn"
              />
              {errors.maxUsage && (
                <p className="text-red-500 text-sm mt-1">{errors.maxUsage}</p>
              )}
            </div>
          </div>

          {/* Áp dụng cho sản phẩm */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <IconPackage size={16} className="inline mr-1" />
              Áp dụng cho sản phẩm
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowProductSelector(!showProductSelector)}
                className="flex items-center justify-between w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <IconPackage size={16} />
                  <span>
                    Chọn sản phẩm ({formData.applicableProducts.length})
                  </span>
                </div>
                {showProductSelector ? (
                  <IconChevronUp size={16} />
                ) : (
                  <IconChevronDown size={16} />
                )}
              </button>

              {formData.applicableProducts.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.applicableProducts.map((product) => (
                    <span
                      key={product.id}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
                    >
                      {product.name}
                      <button
                        type="button"
                        onClick={() => handleProductToggle(product)}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <IconX size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {showProductSelector && (
                <div className="border border-gray-200 rounded-md p-4 max-h-48 overflow-y-auto">
                  {products.length > 0 ? (
                    products.map((product) => (
                      <label
                        key={product.id}
                        className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 rounded px-2"
                      >
                        <input
                          type="checkbox"
                          checked={
                            formData.applicableProducts.find(
                              (p) => p.id === product.id
                            ) !== undefined
                          }
                          onChange={() => handleProductToggle(product)}
                          className="rounded"
                        />
                        <span className="text-sm">{product.name}</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-4">
                      Không có sản phẩm nào
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Áp dụng cho danh mục */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <IconTag size={16} className="inline mr-1" />
              Áp dụng cho danh mục
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowCategorySelector(!showCategorySelector)}
                className="flex items-center justify-between w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <IconTag size={16} />
                  <span>
                    Chọn danh mục ({formData.applicableCategories.length})
                  </span>
                </div>
                {showCategorySelector ? (
                  <IconChevronUp size={16} />
                ) : (
                  <IconChevronDown size={16} />
                )}
              </button>

              {formData.applicableCategories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.applicableCategories.map((category) => (
                    <span
                      key={category.id}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-sm rounded-md"
                    >
                      {category.name}
                      <button
                        type="button"
                        onClick={() => handleCategoryToggle(category)}
                        className="hover:bg-green-200 rounded-full p-0.5"
                      >
                        <IconX size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {showCategorySelector && (
                <div className="border border-gray-200 rounded-md p-4 max-h-48 overflow-y-auto">
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 rounded px-2"
                      >
                        <input
                          type="checkbox"
                          checked={
                            formData.applicableCategories.find(
                              (c) => c.id === category.id
                            ) !== undefined
                          }
                          onChange={() => handleCategoryToggle(category)}
                          className="rounded"
                        />
                        <span className="text-sm">{category.name}</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-4">
                      Không có danh mục nào
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Trạng thái */}
          <div className="bg-gray-50 p-4 rounded-md">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                className="rounded"
              />
              <IconCheck size={16} className="text-green-600" />
              <span className="text-sm font-medium text-gray-700">
                Kích hoạt khuyến mãi
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">
              Khuyến mãi sẽ có hiệu lực ngay khi được tạo và trong khoảng thời
              gian đã thiết lập
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <IconCheck size={16} />
              {promotion ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromotionForm;
