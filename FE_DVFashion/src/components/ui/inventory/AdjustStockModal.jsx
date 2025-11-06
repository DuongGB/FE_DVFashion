import { useState } from "react";
import {
  IconX,
  IconAdjustmentsHorizontal,
  IconEdit,
} from "@tabler/icons-react";
import { useInventory } from "../../../hooks/useInventory";
import { useTranslation } from "react-i18next"; // Thêm dòng này

export default function AdjustStockModal({ open, onClose, inventory }) {
  const { t } = useTranslation(); // Thêm dòng này
  const { adjustStock, isAdjusting } = useInventory();
  const [newQuantity, setNewQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!open || !inventory) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (newQuantity === "" || isNaN(newQuantity) || Number(newQuantity) < 0) {
      setError(t("admin.adjust_stock.error_invalid_quantity"));
      return;
    }
    if (!reason.trim()) {
      setError(t("admin.adjust_stock.error_reason_required"));
      return;
    }
    try {
      await adjustStock({
        sizeId: inventory.sizeId,
        newQuantity: Number(newQuantity),
        reason,
        notes,
      });
      setSuccess(t("admin.adjust_stock.success"));
      setTimeout(() => {
        setSuccess("");
        onClose();
      }, 1000);
    } catch (err) {
      setError(t("admin.adjust_stock.error_adjust"));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center gap-3">
            <IconAdjustmentsHorizontal size={28} className="text-white" />
            <h2 className="text-2xl font-bold">
              {t("admin.adjust_stock.title")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-black/70 text-white rounded-full hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <IconX size={20} />
          </button>
        </div>

        <form className="p-8 flex-1" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Thông tin sản phẩm */}
            <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                <IconEdit size={18} className="text-purple-600" />
                {t("admin.adjust_stock.product_info")}
              </h3>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div>
                  <strong className="text-gray-600">
                    {t("admin.adjust_stock.product_name")}:
                  </strong>
                  <span className="ml-2 text-blue-700 font-medium">
                    {inventory.productName}
                  </span>
                </div>
                <div>
                  <strong className="text-gray-600">
                    {t("admin.adjust_stock.color")}:
                  </strong>
                  <span className="ml-2">{inventory.productColor}</span>
                </div>
                <div>
                  <strong className="text-gray-600">
                    {t("admin.adjust_stock.size")}:
                  </strong>
                  <span className="ml-2">{inventory.sizeName}</span>
                </div>
                <div>
                  <strong className="text-gray-600">
                    {t("admin.adjust_stock.current_stock")}:
                  </strong>
                  <span className="ml-2 text-green-700 font-semibold">
                    {inventory.quantityInStock}
                  </span>
                </div>
              </div>
            </div>
            {/* Thông tin điều chỉnh tồn kho */}
            <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm space-y-4">
              <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                <IconAdjustmentsHorizontal
                  size={18}
                  className="text-blue-600"
                />
                {t("admin.adjust_stock.adjust_info")}
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("admin.adjust_stock.new_quantity_label")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  value={newQuantity}
                  onChange={(e) => setNewQuantity(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder={t("admin.adjust_stock.new_quantity_placeholder")}
                  required
                  disabled={isAdjusting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("admin.adjust_stock.reason_label")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder={t("admin.adjust_stock.reason_placeholder")}
                  required
                  disabled={isAdjusting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("admin.adjust_stock.notes_label")}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  rows={2}
                  placeholder={t("admin.adjust_stock.notes_placeholder")}
                  disabled={isAdjusting}
                />
              </div>
            </div>
          </div>
          {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
          {success && (
            <div className="text-green-600 text-sm mb-2">{success}</div>
          )}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isAdjusting}
            >
              {t("admin.adjust_stock.close")}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isAdjusting}
            >
              <IconAdjustmentsHorizontal size={16} />
              {isAdjusting
                ? t("admin.adjust_stock.adjusting")
                : t("admin.adjust_stock.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
