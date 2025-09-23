import { useState } from "react";
import { IconX, IconPackage, IconPlus } from "@tabler/icons-react";
import { useInventory } from "../../../hooks/useInventory";
import { useTranslation } from "react-i18next";

export default function ImportStockModal({ open, onClose, inventory }) {
  const { t } = useTranslation();
  const { importStock, isImporting } = useInventory();
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [supplierInfo, setSupplierInfo] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!open || !inventory) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
      setError(t("admin.import_stock.error_invalid_quantity"));
      return;
    }
    if (!supplierInfo.trim()) {
      setError(t("admin.import_stock.error_supplier_required"));
      return;
    }
    try {
      await importStock({
        sizeId: inventory.sizeId,
        quantity: Number(quantity),
        notes,
        supplierInfo,
      });
      setSuccess(t("admin.import_stock.success"));
      setQuantity("");
      setNotes("");
      setSupplierInfo("");
      setTimeout(() => {
        setSuccess("");
        onClose();
      }, 1000);
    } catch (err) {
      setError(t("admin.import_stock.error_import"));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center gap-3">
            <IconPackage size={28} className="text-white" />
            <h2 className="text-2xl font-bold">
              {t("admin.import_stock.title")}
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
                <IconPackage size={18} className="text-blue-600" />
                {t("admin.import_stock.product_info")}
              </h3>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div>
                  <strong className="text-gray-600">
                    {t("admin.import_stock.product_name")}:
                  </strong>
                  <span className="ml-2 text-blue-700 font-medium">
                    {inventory.productName}
                  </span>
                </div>
                <div>
                  <strong className="text-gray-600">
                    {t("admin.import_stock.color")}:
                  </strong>
                  <span className="ml-2">{inventory.productColor}</span>
                </div>
                <div>
                  <strong className="text-gray-600">
                    {t("admin.import_stock.size")}:
                  </strong>
                  <span className="ml-2">{inventory.sizeName}</span>
                </div>
                <div>
                  <strong className="text-gray-600">
                    {t("admin.import_stock.current_stock")}:
                  </strong>
                  <span className="ml-2 text-green-700 font-semibold">
                    {inventory.quantityInStock}
                  </span>
                </div>
              </div>
            </div>
            {/* Thông tin nhập kho */}
            <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm space-y-4">
              <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                <IconPlus size={18} className="text-green-600" />
                {t("admin.import_stock.import_info")}
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("admin.import_stock.quantity_label")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder={t("admin.import_stock.quantity_placeholder")}
                  required
                  disabled={isImporting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("admin.import_stock.notes_label")}
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  rows={2}
                  placeholder={t("admin.import_stock.notes_placeholder")}
                  disabled={isImporting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("admin.import_stock.supplier_label")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={supplierInfo}
                  onChange={(e) => setSupplierInfo(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder={t("admin.import_stock.supplier_placeholder")}
                  required
                  disabled={isImporting}
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
              disabled={isImporting}
            >
              {t("admin.import_stock.close")}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isImporting}
            >
              <IconPlus size={16} />
              {isImporting
                ? t("admin.import_stock.importing")
                : t("admin.import_stock.submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
