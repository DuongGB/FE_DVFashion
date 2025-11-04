import React, { useMemo, useState, useEffect } from "react";
import { IconX, IconSearch } from "@tabler/icons-react";
import { useProduct } from "../../../hooks/useProduct";
import { useTranslation } from "react-i18next";
import { usePromotion } from "../../../hooks/usePromotion";

export default function ProductSelectModal({
  open,
  onClose,
  onConfirm,
  preSelected = [],
  lang = "VI",
}) {
  const { t, i18n } = useTranslation();
  const language = i18n.language || lang;
  const { products, isLoading } = useProduct(language);
  // Lấy danh sách khuyến mãi (dù không dùng trong UI, nhưng để đảm bảo cache được cập nhật khi có thay đổi)
  const { promotions } = usePromotion(language);
  const [search, setSearch] = useState("");

  // existingIds là tập hợp các productId đã có trong khuyến mãi (preSelected)
  const existingIds = useMemo(
    () => new Set(preSelected.map((p) => p.productId)),
    [preSelected]
  );

  // promotedIds là tập hợp các productId đã có trong tất cả khuyến mãi
  const promotedIds = useMemo(() => {
    if (!Array.isArray(promotions)) return new Set();
    const ids = [];
    promotions.forEach((promo) => {
      (promo.promotionProducts || []).forEach((pp) => {
        const id = pp.productId ?? pp.product?.id ?? pp.productId;
        if (id != null) ids.push(id);
      });
    });
    return new Set(ids);
  }, [promotions]);

  // disabledIds là tập hợp các productId đã có trong khuyến mãi khác (không tính preSelected)
  const disabledIds = useMemo(() => {
    const s = new Set(promotedIds);
    // Xóa các id đã có trong preSelected để chỉ còn lại các id của khuyến mãi khác
    existingIds.forEach((id) => s.delete(id));
    return s;
  }, [promotedIds, existingIds]);

  // selectedIds holds only newly selected product ids (not the existing ones)
  const [selectedIds, setSelectedIds] = useState(new Set());

  useEffect(() => {
    if (open) {
      // reset selection when opening (existing items remain disabled via existingIds)
      setSelectedIds(new Set());
    } else {
      setSearch("");
    }
  }, [open, preSelected]);

  const list = Array.isArray(products) ? products : [];

  const filtered = useMemo(() => {
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        (p.id && p.id.toString().includes(q))
    );
  }, [list, search]);

  // chọn tất cả sản phẩm hiển thị (ngoại trừ existingIds và disabledIds)
  const selectAll = () => {
    const selectable = filtered
      .map((p) => p.id)
      .filter(
        (id) => id != null && !existingIds.has(id) && !disabledIds.has(id)
      );
    setSelectedIds((prev) => {
      const next = new Set(prev);
      selectable.forEach((id) => next.add(id));
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const toggle = (id) => {
    // Tránh chọn những sản phẩm đã tồn tại hoặc bị vô hiệu hóa
    if (existingIds.has(id) || disabledIds.has(id)) return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    const selectedProducts = list
      .filter((p) => selectedIds.has(p.id))
      .map((p) => ({
        productId: p.id,
        name: p.name,
        originalPrice: p.currentPrice ?? p.salePrice ?? p.price ?? 0,
      }));
    onConfirm(selectedProducts);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-xl w-full max-w-3xl shadow-xl overflow-hidden flex flex-col ring-1 ring-black/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-20 bg-white border border-gray-200 rounded-md shadow-sm px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-800">
              {t("admin.promotion.select_products") || "Select products"}
            </h3>
            <span className="text-sm text-gray-500">
              {filtered.length} / {list.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-72">
              <IconSearch
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                aria-label={
                  t("admin.promotion.search_placeholder") || "Search products"
                }
                className="w-full pl-10 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder={
                  t("admin.promotion.search_placeholder") ||
                  "Search by name, description, ID..."
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* select all */}
            <div className="flex items-center gap-2">
              <button
                onClick={selectAll}
                className="px-1 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 cursor-pointer transition-all"
                disabled={
                  filtered.filter(
                    (p) => !existingIds.has(p.id) && !disabledIds.has(p.id)
                  ).length === 0
                }
                title={t("admin.promotion.select_all")}
              >
                {t("admin.promotion.select_all")}
              </button>
              <button
                onClick={clearSelection}
                className="px-1 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 cursor-pointer transition-all"
                disabled={selectedIds.size === 0}
                title={t("admin.promotion.clear_selection")}
              >
                {t("admin.promotion.clear_selection")}
              </button>
            </div>

            <button
              aria-label="close"
              className="h-10 w-10 rounded-md flex items-center justify-center hover:bg-gray-100 text-gray-700 cursor-pointer"
              onClick={onClose}
            >
              <IconX size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {isLoading ? (
            <div className="py-12 text-center text-gray-500">
              {t("admin.promotion.loading") || "Loading..."}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              {t("admin.promotion.no_products") || "No products"}
            </div>
          ) : (
            <ul className="space-y-2">
              {filtered.map((p) => {
                const imageUrl =
                  p?.variants
                    ?.flatMap((v) => v?.images || [])
                    ?.find((img) => img?.isPrimary)?.imageUrl ||
                  p?.variants?.[0]?.images?.[0]?.imageUrl ||
                  null;
                const isExisting = existingIds.has(p.id);
                const isDisabled = disabledIds.has(p.id);
                const isChecked = isExisting || selectedIds.has(p.id);
                return (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-4 py-3 px-3 hover:bg-gray-50 rounded-md"
                  >
                    <label className="flex items-center gap-3 cursor-pointer w-full min-w-0">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggle(p.id)}
                        disabled={isExisting || isDisabled}
                        className="h-5 w-5 text-blue-600 border-gray-300 rounded"
                      />

                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-14 h-14 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden flex-shrink-0">
                          {
                            <img
                              src={imageUrl}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          }
                        </div>

                        <div className="min-w-0">
                          <div className="font-medium text-sm text-gray-800 truncate">
                            {p.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                            <span>{p.currentPrice.toLocaleString()} VND</span>
                            {isExisting && (
                              <span className="text-xs text-white bg-gray-400 px-2 py-0.5 rounded">
                                {t("admin.promotion.form.already_added") ||
                                  "Added"}
                              </span>
                            )}
                            {isDisabled && !isExisting && (
                              <span className="text-xs text-white bg-red-400 px-2 py-0.5 rounded">
                                {t("admin.promotion.form.already_in_other") ||
                                  "In other promotion"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </label>

                    <div className="text-xs text-gray-400 ml-2 w-14 text-right">
                      ID:{" "}
                      <span className="font-mono text-gray-500">{p.id}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-20 bg-white border border-gray-200 rounded-md shadow-sm px-6 py-3 flex items-center justify-end gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleConfirm}
              className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50 cursor-pointer transition-all"
              disabled={selectedIds.size === 0}
            >
              {t("admin.promotion.add_selected")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
