import React, { useState, useEffect } from "react";
import {
  IconX,
  IconCalendar,
  IconPercentage,
  IconCurrencyDollar,
  IconTag,
  IconDiscount,
  IconCheck,
  IconTruck,
  IconGift,
  IconLoader2,
  IconInfoCircle,
} from "@tabler/icons-react";
import { toast } from "react-toastify";
import { usePromotion } from "../../../hooks/usePromotion";

const PromotionForm = ({ isOpen, onClose, promotion = null }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "PERCENTAGE", // PERCENTAGE, FIXED_AMOUNT, FREE_SHIPPING, BUY_ONE_GET_ONE
    value: "",
    minOrderAmount: "",
    maxUsages: "",
    startDate: "",
    endDate: "",
    active: true,
  });

  const [errors, setErrors] = useState({});

  // Use promotion hook
  const { createPromotion, isCreating, updatePromotion, isUpdating } =
    usePromotion();

  const isSubmitting = isCreating || isUpdating;

  // Load dữ liệu khi edit promotion
  useEffect(() => {
    if (promotion && isOpen) {
      setFormData({
        name: promotion.name || "",
        description: promotion.description || "",
        type: promotion.type || "PERCENTAGE",
        value: promotion.value || "",
        minOrderAmount: promotion.minOrderAmount || "",
        maxUsages: promotion.maxUsages || "",
        startDate: promotion.startDate ? promotion.startDate.split("T")[0] : "",
        endDate: promotion.endDate ? promotion.endDate.split("T")[0] : "",
        active: promotion.active !== undefined ? promotion.active : true,
      });
    } else if (!promotion && isOpen) {
      // Reset form cho create mới
      setFormData({
        name: "",
        description: "",
        type: "PERCENTAGE",
        value: "",
        minOrderAmount: "",
        maxUsages: "",
        startDate: "",
        endDate: "",
        active: true,
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

  const validateForm = () => {
    const newErrors = {};

    // Validate required fields
    if (!formData.name.trim()) {
      newErrors.name = "Tên khuyến mãi là bắt buộc";
    }

    if (!formData.type.trim()) {
      newErrors.type = "Loại khuyến mãi là bắt buộc";
    }

    // Validation cho value dựa trên type
    if (formData.type === "FREE_SHIPPING") {
      // FREE_SHIPPING không cần value
    } else if (formData.type === "BUY_ONE_GET_ONE") {
      // BUY_ONE_GET_ONE có thể không cần value
    } else {
      // PERCENTAGE và FIXED_AMOUNT cần value
      if (!formData.value || parseFloat(formData.value) <= 0) {
        newErrors.value = "Giá trị khuyến mãi phải > 0";
      }

      if (formData.type === "PERCENTAGE" && parseFloat(formData.value) > 100) {
        newErrors.value = "Phần trăm giảm không được vượt quá 100%";
      }
    }

    // Validate dates
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

    // Validate optional numeric fields
    if (formData.minOrderAmount && parseFloat(formData.minOrderAmount) < 0) {
      newErrors.minOrderAmount = "Giá trị đơn hàng tối thiểu phải >= 0";
    }

    if (formData.maxUsages && parseInt(formData.maxUsages) <= 0) {
      newErrors.maxUsages = "Số lần sử dụng tối đa phải > 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function để xử lý value dựa trên type
  const getValueForType = (type, value) => {
    switch (type) {
      case "FREE_SHIPPING":
        return 0; // Backend cần value = 0 cho FREE_SHIPPING
      case "BUY_ONE_GET_ONE":
        return parseFloat(value) || 1; // Default = 1 cho BUY_ONE_GET_ONE
      case "PERCENTAGE":
      case "FIXED_AMOUNT":
        return parseFloat(value);
      default:
        return parseFloat(value) || 0;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Format data theo PromotionRequest
    const submitData = {
      name: formData.name.trim(),
      description: formData.description?.trim() || null,
      type: formData.type,
      value: getValueForType(formData.type, formData.value),
      minOrderAmount: formData.minOrderAmount
        ? parseFloat(formData.minOrderAmount)
        : 0,
      maxUsages: formData.maxUsages ? parseInt(formData.maxUsages) : 100000,
      startDate: formData.startDate, // Format yyyy-MM-dd
      endDate: formData.endDate, // Format yyyy-MM-dd
      active: formData.active,
    };

    try {
      if (promotion) {
        // Cập nhật promotion
        await updatePromotion({
          promotionId: promotion.id,
          promotionData: submitData,
          lang: "VI",
        });
        toast.success("Cập nhật khuyến mãi thành công!");
      } else {
        // Tạo promotion mới
        await createPromotion({
          promotionData: submitData,
          lang: "VI",
        });
        toast.success("Tạo khuyến mãi mới thành công!");
      }

      // Đóng form sau khi thành công
      onClose();
    } catch (error) {
      console.error("Error submitting promotion:", error);

      // Improved error handling
      let errorMessage = "Có lỗi xảy ra!";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = promotion
          ? "Có lỗi xảy ra khi cập nhật khuyến mãi!"
          : "Có lỗi xảy ra khi tạo khuyến mãi!";
      }

      toast.error(errorMessage);
    }
  };

  // Function để render icon dựa trên type
  const getTypeIcon = (type) => {
    switch (type) {
      case "PERCENTAGE":
        return <IconPercentage size={16} className="text-gray-400" />;
      case "FIXED_AMOUNT":
        return <IconCurrencyDollar size={16} className="text-gray-400" />;
      case "FREE_SHIPPING":
        return <IconTruck size={16} className="text-gray-400" />;
      case "BUY_ONE_GET_ONE":
        return <IconGift size={16} className="text-gray-400" />;
      default:
        return <IconPercentage size={16} className="text-gray-400" />;
    }
  };

  // Function để render value input dựa trên type
  const renderValueInput = () => {
    if (formData.type === "FREE_SHIPPING") {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Miễn phí vận chuyển
          </label>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="bg-purple-600 p-2 rounded-lg">
                <IconTruck size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-purple-800">
                  Áp dụng miễn phí vận chuyển
                </p>
                <p className="text-xs text-purple-600">
                  Không tính phí vận chuyển cho đơn hàng
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (formData.type === "BUY_ONE_GET_ONE") {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mua 1 tặng 1
          </label>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center gap-3">
              <div className="bg-orange-600 p-2 rounded-lg">
                <IconGift size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-orange-800">
                  Mua 1 tặng 1 sản phẩm
                </p>
                <p className="text-xs text-orange-600">
                  Khách hàng sẽ nhận được 1 sản phẩm miễn phí
                </p>
              </div>
            </div>
          </div>
          <input type="hidden" name="value" value="1" />
        </div>
      );
    }

    return (
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
            disabled={isSubmitting}
            min="0"
            step="0.01"
            max={formData.type === "PERCENTAGE" ? "100" : undefined}
            className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 ${
              errors.value
                ? "border-red-500 bg-red-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            placeholder="0"
            required
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {getTypeIcon(formData.type)}
          </div>
        </div>
        {formData.type === "PERCENTAGE" && (
          <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
            <IconInfoCircle size={12} />
            Nhập phần trăm (0-100%)
          </p>
        )}
        {formData.type === "FIXED_AMOUNT" && (
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <IconInfoCircle size={12} />
            Nhập số tiền giảm (VNĐ)
          </p>
        )}
        {errors.value && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <IconX size={12} />
            {errors.value}
          </p>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl relative overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header với gradient background */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="absolute top-4 right-4 bg-black backdrop-blur-sm text-white rounded-full w-10 h-10 flex items-center justify-center text-xl hover:bg-gray-800 transition-all duration-200 cursor-pointer"
          >
            <IconX size={20} />
          </button>

          <div className="flex items-start gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
              <IconDiscount size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">
                {promotion ? "Chỉnh sửa khuyến mãi" : "Tạo khuyến mãi mới"}
              </h2>
              <p className="text-blue-100 opacity-90">
                {promotion
                  ? "Cập nhật thông tin khuyến mãi hiện tại"
                  : "Thiết lập thông tin cho khuyến mãi mới"}
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

              {/* Tên khuyến mãi */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên khuyến mãi *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 ${
                    errors.name
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  placeholder="Nhập tên khuyến mãi"
                  required
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <IconX size={12} />
                    {errors.name}
                  </p>
                )}
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
                  disabled={isSubmitting}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 hover:border-gray-400"
                  placeholder="Nhập mô tả khuyến mãi"
                />
              </div>
            </div>

            {/* Promotion Type & Value Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <IconPercentage size={20} className="text-green-600" />
                Loại và giá trị khuyến mãi
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Loại khuyến mãi *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 hover:border-gray-400"
                    required
                  >
                    <option value="PERCENTAGE">📊 Phần trăm (%)</option>
                    <option value="FIXED_AMOUNT">
                      💰 Số tiền cố định (VNĐ)
                    </option>
                    <option value="FREE_SHIPPING">
                      🚚 Miễn phí vận chuyển
                    </option>
                    <option value="BUY_ONE_GET_ONE">🎁 Mua 1 tặng 1</option>
                  </select>
                  {errors.type && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <IconX size={12} />
                      {errors.type}
                    </p>
                  )}
                </div>

                {renderValueInput()}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đơn hàng tối thiểu (VNĐ)
                  </label>
                  <input
                    type="number"
                    name="minOrderAmount"
                    value={formData.minOrderAmount}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    min="0"
                    step="1000"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 ${
                      errors.minOrderAmount
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <IconInfoCircle size={12} />
                    Để trống = không yêu cầu tối thiểu
                  </p>
                  {errors.minOrderAmount && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <IconX size={12} />
                      {errors.minOrderAmount}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Time & Limits Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <IconCalendar size={20} className="text-purple-600" />
                Thời gian và giới hạn
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày bắt đầu *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 ${
                      errors.startDate
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    required
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <IconX size={12} />
                      {errors.startDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày kết thúc *
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 ${
                      errors.endDate
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    required
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <IconX size={12} />
                      {errors.endDate}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số lần sử dụng tối đa
                  </label>
                  <input
                    type="number"
                    name="maxUsages"
                    value={formData.maxUsages}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    min="1"
                    step="1"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed transition-all duration-200 ${
                      errors.maxUsages
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                    placeholder="100 000"
                  />
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <IconInfoCircle size={12} />
                    Để trống = 100 000 lần sử dụng
                  </p>
                  {errors.maxUsages && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <IconX size={12} />
                      {errors.maxUsages}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Status Section */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <IconCheck size={20} className="text-green-600" />
                Trạng thái khuyến mãi
              </h3>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-5 h-5 rounded border-green-300 text-green-600 focus:ring-green-500 disabled:cursor-not-allowed transition-all duration-200"
                />
                <div>
                  <span className="text-sm font-medium text-green-800">
                    Kích hoạt khuyến mãi ngay lập tức
                  </span>
                  <p className="text-xs text-green-600 mt-1">
                    Khuyến mãi sẽ có hiệu lực ngay khi được tạo và trong khoảng
                    thời gian đã thiết lập
                  </p>
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <>
                    <IconLoader2 size={16} className="animate-spin" />
                    {promotion ? "Đang cập nhật..." : "Đang tạo..."}
                  </>
                ) : (
                  <>
                    <IconCheck size={16} />
                    {promotion ? "Cập nhật khuyến mãi" : "Tạo khuyến mãi mới"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PromotionForm;
