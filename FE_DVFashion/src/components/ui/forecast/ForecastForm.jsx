import React, { useState, useEffect } from "react";
import {
  IconX,
  IconChartLine,
  IconCalendar,
  IconCpu,
  IconPlus,
  IconTrash,
  IconCheck,
  IconTrendingUp,
  IconWeight,
  IconTag,
} from "@tabler/icons-react";

// Available forecasting models
const forecastingModels = [
  "Linear Regression",
  "ARIMA",
  "Neural Network",
  "Random Forest",
  "Support Vector Machine",
  "Polynomial Regression",
];

// Common forecasting factors
const commonFactors = [
  "Seasonal Trend",
  "Weather",
  "Promotion",
  "Day of Week",
  "Stock Level",
  "Marketing Campaign",
  "Economic Index",
  "Competition",
  "Holiday Effect",
  "Inventory Level",
  "Customer Sentiment",
  "Historical Sales",
  "Market Demand",
  "Price Changes",
  "Social Media Buzz",
];

const ForecastForm = ({ isOpen, onClose, onSubmit, forecast = null }) => {
  const [formData, setFormData] = useState({
    forecastDate: "",
    model: "Linear Regression",
    predictedRevenue: "",
    notes: "",
    factors: [{ factorName: "", weight: 0, value: "" }],
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Load data when editing forecast
  useEffect(() => {
    if (forecast) {
      setFormData({
        forecastDate: forecast.forecastDate || "",
        model: forecast.model || "Linear Regression",
        predictedRevenue: forecast.predictedRevenue || "",
        notes: forecast.notes || "",
        factors:
          forecast.factors && forecast.factors.length > 0
            ? forecast.factors.map((f) => ({
                factorName: f.factorName || "",
                weight: f.weight || 0,
                value: f.value || "",
              }))
            : [{ factorName: "", weight: 0, value: "" }],
      });
    } else {
      // Reset form for new forecast
      setFormData({
        forecastDate: "",
        model: "Linear Regression",
        predictedRevenue: "",
        notes: "",
        factors: [{ factorName: "", weight: 0, value: "" }],
      });
    }
    setErrors({});
  }, [forecast, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user changes input
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFactorChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      factors: prev.factors.map((factor, i) =>
        i === index ? { ...factor, [field]: value } : factor
      ),
    }));

    // Clear factor errors
    if (errors[`factor_${index}_${field}`]) {
      setErrors((prev) => ({ ...prev, [`factor_${index}_${field}`]: "" }));
    }
  };

  const handleAddFactor = () => {
    setFormData((prev) => ({
      ...prev,
      factors: [...prev.factors, { factorName: "", weight: 0, value: "" }],
    }));
  };

  const handleRemoveFactor = (index) => {
    if (formData.factors.length > 1) {
      setFormData((prev) => ({
        ...prev,
        factors: prev.factors.filter((_, i) => i !== index),
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Forecast date validation
    if (!formData.forecastDate) {
      newErrors.forecastDate = "Ngày dự báo là bắt buộc";
    } else {
      const forecastDate = new Date(formData.forecastDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (forecastDate < today) {
        newErrors.forecastDate = "Ngày dự báo không thể là ngày trong quá khứ";
      }
    }

    // Model validation
    if (!formData.model) {
      newErrors.model = "Mô hình dự báo là bắt buộc";
    }

    // Predicted revenue validation (optional for auto-generation)
    if (
      formData.predictedRevenue &&
      isNaN(parseFloat(formData.predictedRevenue))
    ) {
      newErrors.predictedRevenue = "Doanh thu dự báo phải là số hợp lệ";
    }

    // Factors validation
    let totalWeight = 0;
    const validFactors = formData.factors.filter((f) => f.factorName.trim());

    if (validFactors.length === 0) {
      newErrors.factors = "Phải có ít nhất một yếu tố dự báo";
    } else {
      validFactors.forEach((factor, index) => {
        const actualIndex = formData.factors.findIndex((f) => f === factor);

        if (!factor.factorName.trim()) {
          newErrors[`factor_${actualIndex}_factorName`] =
            "Tên yếu tố là bắt buộc";
        }

        if (factor.weight < 0 || factor.weight > 1) {
          newErrors[`factor_${actualIndex}_weight`] =
            "Trọng số phải từ 0 đến 1";
        }

        if (!factor.value.trim()) {
          newErrors[`factor_${actualIndex}_value`] =
            "Giá trị yếu tố là bắt buộc";
        }

        totalWeight += parseFloat(factor.weight) || 0;
      });

      // Check if total weight is approximately 1 (allow small deviation)
      if (Math.abs(totalWeight - 1) > 0.01) {
        newErrors.totalWeight = `Tổng trọng số phải bằng 1.0 (hiện tại: ${totalWeight.toFixed(
          2
        )})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      try {
        // Filter out empty factors
        const validFactors = formData.factors.filter(
          (f) => f.factorName.trim() && f.value.trim()
        );

        const submitData = {
          ...formData,
          factors: validFactors,
          predictedRevenue: formData.predictedRevenue
            ? parseFloat(formData.predictedRevenue)
            : null,
        };

        await onSubmit(submitData);
      } catch (error) {
        console.error("Error submitting forecast:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Auto-normalize weights
  const handleNormalizeWeights = () => {
    const validFactors = formData.factors.filter((f) => f.factorName.trim());
    if (validFactors.length === 0) return;

    const totalWeight = validFactors.reduce(
      (sum, f) => sum + (parseFloat(f.weight) || 0),
      0
    );
    if (totalWeight === 0) return;

    setFormData((prev) => ({
      ...prev,
      factors: prev.factors.map((factor) => ({
        ...factor,
        weight: factor.factorName.trim()
          ? (parseFloat(factor.weight) || 0) / totalWeight
          : factor.weight,
      })),
    }));
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
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <IconChartLine size={24} className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              {forecast ? "Chỉnh sửa dự báo" : "Tạo dự báo mới"}
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
            {/* Forecast Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <IconCalendar size={16} className="inline mr-1" />
                Ngày dự báo *
              </label>
              <input
                type="date"
                name="forecastDate"
                value={formData.forecastDate}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.forecastDate ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.forecastDate && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.forecastDate}
                </p>
              )}
            </div>

            {/* Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <IconCpu size={16} className="inline mr-1" />
                Mô hình dự báo *
              </label>
              <select
                name="model"
                value={formData.model}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.model ? "border-red-500" : "border-gray-300"
                }`}
              >
                {forecastingModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
              {errors.model && (
                <p className="text-red-500 text-sm mt-1">{errors.model}</p>
              )}
            </div>

            {/* Predicted Revenue (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <IconTrendingUp size={16} className="inline mr-1" />
                Doanh thu dự báo (VND)
              </label>
              <input
                type="number"
                name="predictedRevenue"
                value={formData.predictedRevenue}
                onChange={handleChange}
                min="0"
                step="1000"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.predictedRevenue ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Để trống nếu muốn hệ thống tự tính"
              />
              {errors.predictedRevenue && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.predictedRevenue}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                Nếu để trống, hệ thống sẽ tự động tính toán dựa trên các yếu tố
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ghi chú thêm về dự báo..."
              />
            </div>
          </div>

          {/* Forecasting Factors */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg text-gray-700 flex items-center gap-2">
                <IconWeight size={18} />
                Yếu tố dự báo
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleNormalizeWeights}
                  className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors"
                >
                  Chuẩn hóa trọng số
                </button>
                <button
                  type="button"
                  onClick={handleAddFactor}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors flex items-center gap-1"
                >
                  <IconPlus size={14} />
                  Thêm yếu tố
                </button>
              </div>
            </div>

            {errors.factors && (
              <p className="text-red-500 text-sm mb-3">{errors.factors}</p>
            )}

            {errors.totalWeight && (
              <p className="text-red-500 text-sm mb-3">{errors.totalWeight}</p>
            )}

            <div className="space-y-3">
              {formData.factors.map((factor, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-3 p-3 bg-white rounded border"
                >
                  {/* Factor Name */}
                  <div className="col-span-4">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Tên yếu tố
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        list={`factors-${index}`}
                        placeholder="Nhập hoặc chọn yếu tố"
                        value={factor.factorName}
                        onChange={(e) =>
                          handleFactorChange(
                            index,
                            "factorName",
                            e.target.value
                          )
                        }
                        className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                          errors[`factor_${index}_factorName`]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      <datalist id={`factors-${index}`}>
                        {commonFactors.map((commonFactor) => (
                          <option key={commonFactor} value={commonFactor} />
                        ))}
                      </datalist>
                      <IconTag
                        size={14}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                    </div>
                    {errors[`factor_${index}_factorName`] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors[`factor_${index}_factorName`]}
                      </p>
                    )}
                  </div>

                  {/* Weight */}
                  <div className="col-span-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Trọng số (0-1)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      placeholder="0.00"
                      value={factor.weight}
                      onChange={(e) =>
                        handleFactorChange(
                          index,
                          "weight",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        errors[`factor_${index}_weight`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors[`factor_${index}_weight`] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors[`factor_${index}_weight`]}
                      </p>
                    )}
                  </div>

                  {/* Value */}
                  <div className="col-span-4">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Giá trị
                    </label>
                    <input
                      type="text"
                      placeholder="Nhập giá trị yếu tố"
                      value={factor.value}
                      onChange={(e) =>
                        handleFactorChange(index, "value", e.target.value)
                      }
                      className={`w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        errors[`factor_${index}_value`]
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors[`factor_${index}_value`] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors[`factor_${index}_value`]}
                      </p>
                    )}
                  </div>

                  {/* Remove Button */}
                  <div className="col-span-1 flex items-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveFactor(index)}
                      disabled={formData.factors.length === 1}
                      className="w-full p-1 text-red-600 hover:text-red-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                      title="Xóa yếu tố"
                    >
                      <IconTrash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Weight Summary */}
            <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
              <div className="flex justify-between items-center">
                <span className="font-medium text-blue-800">
                  Tổng trọng số:
                </span>
                <span
                  className={`font-bold ${
                    Math.abs(
                      formData.factors.reduce(
                        (sum, f) => sum + (parseFloat(f.weight) || 0),
                        0
                      ) - 1
                    ) <= 0.01
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formData.factors
                    .reduce((sum, f) => sum + (parseFloat(f.weight) || 0), 0)
                    .toFixed(2)}
                </span>
              </div>
              <p className="text-blue-600 text-xs mt-1">
                Tổng trọng số nên bằng 1.0 để đạt kết quả tối ưu
              </p>
            </div>
          </div>

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
                  {forecast ? "Cập nhật" : "Tạo dự báo"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForecastForm;
