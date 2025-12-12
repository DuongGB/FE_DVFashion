import { useState, useEffect } from "react";
import {
  IconX,
  IconPackageExport,
  IconMinus,
  IconSearch,
} from "@tabler/icons-react";
import { useInventory } from "../../../hooks/useInventory";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useProductById } from "../../../hooks/useProduct";

export default function GeneralExportStockModal({ open, onClose }) {
  const { t, i18n } = useTranslation();
  const language = i18n.language || "VI";
  const { exportStock, isExporting, getInventoryBySize } = useInventory();

  const [productIdInput, setProductIdInput] = useState("");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [selectedSizeId, setSelectedSizeId] = useState(null);
  const [foundInventory, setFoundInventory] = useState(null);
  const [isFinding, setIsFinding] = useState(false);
  const [findError, setFindError] = useState("");

  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [exportError, setExportError] = useState("");
  const [exportSuccess, setExportSuccess] = useState("");

  // Fetch product by ID
  const { data: productData, isLoading: isLoadingProduct } = useProductById(
    selectedProductId,
    language
  );

  // ✅ Sử dụng useEffect để xử lý khi productData thay đổi
  useEffect(() => {
    if (!selectedProductId || !isFinding) return;

    if (isLoadingProduct) {
      // Vẫn đang loading
      return;
    }

    if (productData) {
      // Extract all sizes from all variants
      const allSizes = [];
      productData.variants?.forEach((variant) => {
        variant.sizes?.forEach((size) => {
          allSizes.push({
            sizeId: size.id,
            sizeName: size.sizeName,
            variantColor: variant.color,
            variantId: variant.id,
            stockQuantity: size.stockQuantity || 0,
          });
        });
      });

      if (allSizes.length === 0) {
        setFindError(t("admin.general_import.error_no_sizes"));
      } else {
        setAvailableSizes(allSizes);
        setFindError("");
      }
      setIsFinding(false);
    } else {
      // Product not found
      setFindError(t("admin.general_import.error_product_not_found"));
      setIsFinding(false);
    }
  }, [productData, isLoadingProduct, selectedProductId, isFinding, t]);

  if (!open) return null;

  const resetForm = () => {
    setQuantity("");
    setReason("");
    setNotes("");
    setExportError("");
    setExportSuccess("");
  };

  const resetSearch = () => {
    setProductIdInput("");
    setSelectedProductId(null);
    setAvailableSizes([]);
    setSelectedSizeId(null);
    setFoundInventory(null);
    setFindError("");
    resetForm();
  };

  const handleFindProduct = async () => {
    if (!productIdInput.trim()) {
      setFindError(t("admin.general_import.error_product_id_required"));
      return;
    }

    setIsFinding(true);
    setFindError("");
    setAvailableSizes([]);
    setSelectedSizeId(null);
    setFoundInventory(null);
    resetForm();

    // Trigger fetch by setting selectedProductId
    setSelectedProductId(productIdInput.trim());
  };

  const handleSelectSize = async (sizeId) => {
    setSelectedSizeId(sizeId);
    setFindError("");
    setFoundInventory(null);
    resetForm();

    try {
      const inventoryData = await getInventoryBySize(sizeId);
      if (inventoryData) {
        setFoundInventory(inventoryData);
      } else {
        setFindError(t("admin.general_import.error_not_found"));
      }
    } catch (err) {
      setFindError(t("admin.general_import.error_not_found"));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!isFinding && !isLoadingProduct) {
        handleFindProduct();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setExportError("");
    setExportSuccess("");
    if (!quantity || isNaN(quantity) || Number(quantity) < 1) {
      const msg = t("admin.export_stock.error_invalid_quantity");
      setExportError(msg);
      toast.error(msg);
      return;
    }
    if (!reason.trim()) {
      const msg = t("admin.export_stock.error_reason_required");
      setExportError(msg);
      toast.error(msg);
      return;
    }
    if (Number(quantity) > foundInventory.availableQuantity) {
      const msg = t("admin.export_stock.error_exceed_available");
      setExportError(msg);
      toast.error(msg);
      return;
    }
    try {
      await exportStock({
        sizeId: foundInventory.sizeId,
        quantity: Number(quantity),
        reason,
        notes,
      });
      const msg = t("admin.export_stock.success");
      setExportSuccess(msg);
      toast.success(msg);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      const msg = t("admin.export_stock.error_export");
      setExportError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 min-h-screen">
      <div
        className="backdrop-blur-xl bg-white/80 border border-white/30 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col transition-all duration-300 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-3 border-b bg-gradient-to-r from-orange-600 to-yellow-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <IconPackageExport size={28} />
            <h2 className="text-2xl font-bold">
              {t("admin.export_stock.title")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-black/30 backdrop-blur-sm text-white rounded-full hover:bg-gray-800 cursor-pointer"
          >
            <IconX size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 min-h-0">
          {/* Search Product Section */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("admin.general_import.product_id_label")}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={productIdInput}
                onChange={(e) => setProductIdInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-2 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white/80 backdrop-blur-sm"
                placeholder={t("admin.general_import.product_id_placeholder")}
                disabled={isFinding || isLoadingProduct}
              />
              <button
                type="button"
                onClick={handleFindProduct}
                className="px-4 py-2 bg-gradient-to-r from-orange-600 to-yellow-600 text-white rounded-lg hover:from-orange-700 hover:to-yellow-700 flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow"
                disabled={isFinding || isLoadingProduct}
              >
                {isFinding || isLoadingProduct ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <IconSearch size={16} />
                )}
              </button>
            </div>
            {findError && (
              <div className="text-red-600 text-sm mt-2">{findError}</div>
            )}
          </div>

          {/* Product Info */}
          {productData && availableSizes.length > 0 && (
            <div className="mb-3 backdrop-blur-xl bg-white/60 border border-white/30 p-4 rounded-xl shadow-lg">
              <h3 className="font-semibold text-lg mb-3 text-gray-700">
                {t("admin.general_import.product_info")}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <strong>{t("admin.general_import.product_name")}:</strong>
                  <span className="ml-2 text-blue-700 font-medium">
                    {productData.name}
                  </span>
                </div>
                <div>
                  <strong>{t("admin.general_import.product_id")}:</strong>
                  <span className="ml-2">{productData.id}</span>
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <h4 className="font-semibold text-md mb-2 text-gray-700">
                  {t("admin.general_import.select_size")}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                  {availableSizes.map((size) => (
                    <button
                      key={size.sizeId}
                      onClick={() => handleSelectSize(size.sizeId)}
                      className={`p-3 border-2 rounded-lg text-left transition-all cursor-pointer ${
                        selectedSizeId === size.sizeId
                          ? "border-orange-600 bg-orange-50"
                          : "border-white/30 hover:border-orange-400 hover:bg-white/30"
                      }`}
                    >
                      <div className="font-semibold text-gray-800">
                        {size.sizeName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {t("admin.general_import.color")}: {size.variantColor}
                      </div>
                      <div className="text-sm text-green-600 font-medium">
                        {t("admin.general_import.stock")}: {size.stockQuantity}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Export Form Section */}
          {foundInventory && (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Info */}
                <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-4 rounded-xl shadow-lg">
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
                      className="w-full px-3 py-2 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white/80 backdrop-blur-sm"
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
                      className="w-full px-3 py-2 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white/80 backdrop-blur-sm"
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
                      className="w-full px-3 py-2 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white/80 backdrop-blur-sm"
                      rows={2}
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
              <div className="flex justify-end gap-3 pt-4 border-t border-white/30">
                <button
                  type="button"
                  onClick={resetSearch}
                  className="px-6 py-2 text-gray-600 bg-white/80 backdrop-blur-sm border border-white/30 rounded-lg hover:bg-gray-50 hover:border-gray-400 cursor-pointer"
                >
                  {t("admin.general_import.find_another")}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-orange-600 to-yellow-600 text-white rounded-lg hover:from-orange-700 hover:to-yellow-700 flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg"
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
