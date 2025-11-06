import { useState, useEffect } from "react";
import { IconX, IconPackage, IconPlus, IconSearch } from "@tabler/icons-react";
import { useInventory } from "../../../hooks/useInventory";
import { useTranslation } from "react-i18next";
import { useProductById } from "../../../hooks/useProduct";

export default function GeneralImportStockModal({ open, onClose }) {
  const { t, i18n } = useTranslation();
  const language = i18n.language || "VI";
  const { importStock, isImporting, getInventoryBySize } = useInventory();

  const [productIdInput, setProductIdInput] = useState("");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [selectedSizeId, setSelectedSizeId] = useState(null);
  const [foundInventory, setFoundInventory] = useState(null);
  const [isFinding, setIsFinding] = useState(false);
  const [findError, setFindError] = useState("");

  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [supplierInfo, setSupplierInfo] = useState("");
  const [importError, setImportError] = useState("");
  const [importSuccess, setImportSuccess] = useState("");

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
    setNotes("");
    setSupplierInfo("");
    setImportError("");
    setImportSuccess("");
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
    setImportError("");
    setImportSuccess("");
    if (!quantity || isNaN(quantity) || Number(quantity) <= 0) {
      setImportError(t("admin.import_stock.error_invalid_quantity"));
      return;
    }
    if (!supplierInfo.trim()) {
      setImportError(t("admin.import_stock.error_supplier_required"));
      return;
    }
    try {
      await importStock({
        sizeId: foundInventory.sizeId,
        quantity: Number(quantity),
        notes,
        supplierInfo,
      });
      setImportSuccess(t("admin.import_stock.success"));
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setImportError(t("admin.import_stock.error_import"));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        className="bg-gradient-to-br from-white/70 via-white/50 to-blue-100/40 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/30 w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col transition-all duration-300 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-3 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <IconPackage size={28} />
            <h2 className="text-2xl font-bold">
              {t("admin.general_import.title")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-black/30 backdrop-blur-sm text-white rounded-full hover:bg-gray-800 cursor-pointer"
          >
            <IconX size={20} />
          </button>
        </div>

        <div className="p-3">
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
                className="w-full px-3 py-2 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white/80 backdrop-blur-sm"
                placeholder={t("admin.general_import.product_id_placeholder")}
                disabled={isFinding || isLoadingProduct}
              />
              <button
                type="button"
                onClick={handleFindProduct}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow"
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
                          ? "border-blue-600 bg-blue-50"
                          : "border-white/30 hover:border-blue-400 hover:bg-white/60"
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

          {/* Import Form Section */}
          {foundInventory && (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Info */}
                <div className="backdrop-blur-xl bg-white/60 border border-white/30 p-4 rounded-xl shadow-lg">
                  <h3 className="font-semibold text-lg mb-3 text-gray-700">
                    {t("admin.import_stock.product_info")}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>{t("admin.import_stock.product_name")}:</strong>
                      <span className="ml-2 text-blue-700 font-medium">
                        {foundInventory.productName}
                      </span>
                    </div>
                    <div>
                      <strong>{t("admin.import_stock.color")}:</strong>
                      <span className="ml-2">
                        {foundInventory.productColor}
                      </span>
                    </div>
                    <div>
                      <strong>{t("admin.import_stock.size")}:</strong>
                      <span className="ml-2">{foundInventory.sizeName}</span>
                    </div>
                    <div>
                      <strong>{t("admin.import_stock.current_stock")}:</strong>
                      <span className="ml-2 text-green-700 font-semibold">
                        {foundInventory.quantityInStock}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Import Inputs */}
                <div className="space-y-4">
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
                      className="w-full px-3 py-2 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white/80 backdrop-blur-sm"
                      required
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
                      className="w-full px-3 py-2 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white/80 backdrop-blur-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("admin.import_stock.notes_label")}
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white/80 backdrop-blur-sm"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {importError && (
                <div className="text-red-600 text-sm mb-4">{importError}</div>
              )}
              {importSuccess && (
                <div className="text-green-600 text-sm mb-4">
                  {importSuccess}
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
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow"
                  disabled={isImporting}
                >
                  <IconPlus size={16} />
                  {isImporting
                    ? t("admin.import_stock.importing")
                    : t("admin.import_stock.submit")}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
