import { useState } from "react";
import {
  IconX,
  IconPackageExport,
  IconMinus,
  IconSearch,
} from "@tabler/icons-react";
import { useInventory } from "../../../hooks/useInventory";
import { useTranslation } from "react-i18next";

export default function GeneralExportStockModal({ open, onClose }) {
  const { t } = useTranslation();
  const { exportStock, isExporting, getInventoryBySize } = useInventory();

  const [sizeIdInput, setSizeIdInput] = useState("");
  const [foundInventory, setFoundInventory] = useState(null);
  const [isFinding, setIsFinding] = useState(false);
  const [findError, setFindError] = useState("");

  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [exportError, setExportError] = useState("");
  const [exportSuccess, setExportSuccess] = useState("");

  if (!open) return null;

  const resetForm = () => {
    setQuantity("");
    setReason("");
    setNotes("");
    setExportError("");
    setExportSuccess("");
  };

  const resetSearch = () => {
    setSizeIdInput("");
    setFoundInventory(null);
    setFindError("");
    resetForm();
  };

  const handleFindInventory = async () => {
    if (!sizeIdInput.trim()) {
      setFindError(t("admin.general_import.error_size_id_required"));
      return;
    }
    setIsFinding(true);
    setFindError("");
    setFoundInventory(null);
    resetForm();
    try {
      const inventoryData = await getInventoryBySize(sizeIdInput);
      if (inventoryData) {
        setFoundInventory(inventoryData);
      } else {
        setFindError(t("admin.general_import.error_not_found"));
      }
    } catch (err) {
      setFindError(t("admin.general_import.error_not_found"));
    } finally {
      setIsFinding(false);
    }
  };

  // Thêm: xử lý khi nhấn Enter trong input để tìm kiếm
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!isFinding) {
        handleFindInventory();
      }
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setExportError("");
    setExportSuccess("");
    if (!quantity || isNaN(quantity) || Number(quantity) < 1) {
      setExportError(t("admin.export_stock.error_invalid_quantity"));
      return;
    }
    if (!reason.trim()) {
      setExportError(t("admin.export_stock.error_reason_required"));
      return;
    }
    if (Number(quantity) > foundInventory.availableQuantity) {
      setExportError(t("admin.export_stock.error_exceed_available"));
      return;
    }
    try {
      await exportStock({
        sizeId: foundInventory.sizeId,
        quantity: Number(quantity),
        reason,
        notes,
      });
      setExportSuccess(t("admin.export_stock.success"));
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setExportError(t("admin.export_stock.error_export"));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-orange-600 to-yellow-600 text-white">
          <div className="flex items-center gap-3">
            <IconPackageExport size={28} />
            <h2 className="text-2xl font-bold">
              {t("admin.export_stock.title")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-black/70 text-white rounded-full hover:bg-gray-800 cursor-pointer"
          >
            <IconX size={20} />
          </button>
        </div>

        <div className="p-8">
          {/* Search Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("admin.general_import.size_id_label")}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={sizeIdInput}
                onChange={(e) => setSizeIdInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder={t("admin.general_import.size_id_placeholder")}
                disabled={isFinding}
              />
              <button
                type="button"
                onClick={handleFindInventory}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                disabled={isFinding}
              >
                <IconSearch size={16} />
              </button>
            </div>
            {findError && (
              <div className="text-red-600 text-sm mt-2">{findError}</div>
            )}
          </div>

          {foundInventory && (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Info */}
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3 text-gray-700">
                    {t("admin.export_stock.product_info")}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>{t("admin.export_stock.product_name")}:</strong>
                      <span className="ml-2 text-blue-700 font-medium">
                        {foundInventory.productName}
                      </span>
                    </div>
                    <div>
                      <strong>{t("admin.export_stock.color")}:</strong>
                      <span className="ml-2">
                        {foundInventory.productColor}
                      </span>
                    </div>
                    <div>
                      <strong>{t("admin.export_stock.size")}:</strong>
                      <span className="ml-2">{foundInventory.sizeName}</span>
                    </div>
                    <div>
                      <strong>{t("admin.export_stock.available")}:</strong>
                      <span className="ml-2 text-green-700 font-semibold">
                        {foundInventory.availableQuantity}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Export Inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("admin.export_stock.quantity_label")}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={foundInventory.availableQuantity}
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {t("admin.export_stock.max_label", {
                        max: foundInventory.availableQuantity,
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("admin.export_stock.reason_label")}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("admin.export_stock.notes_label")}
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      rows={1}
                    />
                  </div>
                </div>
              </div>

              {exportError && (
                <div className="text-red-600 text-sm mb-4">{exportError}</div>
              )}
              {exportSuccess && (
                <div className="text-green-600 text-sm mb-4">
                  {exportSuccess}
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-300">
                <button
                  type="button"
                  onClick={resetSearch}
                  className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  {t("admin.general_import.find_another")}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  disabled={isExporting}
                >
                  <IconMinus size={16} />
                  {isExporting
                    ? t("admin.export_stock.exporting")
                    : t("admin.export_stock.submit")}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
