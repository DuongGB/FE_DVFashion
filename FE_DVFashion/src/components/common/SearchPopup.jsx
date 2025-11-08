import { useState, useEffect, useRef } from "react";
import { useProduct } from "../../hooks/useProduct";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { encodeId } from "../../utils/encodeId";
import { useNavigate } from "react-router-dom";

export default function SearchPopup({ show, onClose }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "VI";

  const [search, setSearch] = useState("");
  const popupRef = useRef(null);

  // Fetch products with search query
  const { products = [], isLoading } = useProduct({
    lang,
    search: search.trim() || null,
    status: "ACTIVE",
    page: 0,
    size: 4, // Only show 4 products in popup
  });

  // Đóng popup khi click ngoài
  useEffect(() => {
    if (!show) return;
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [show, onClose]);

  const keywords = [
    t("search.keywords.tshirt", "Áo thun"),
    t("search.keywords.shorts", "Quần Shorts"),
    t("search.keywords.polo", "Áo Polo"),
    t("search.keywords.sun_protection_jacket", "Áo khoác chống nắng"),
    t("search.keywords.sun_protection_gloves", "Găng tay chống nắng"),
    t("search.keywords.trousers", "Quần dài"),
  ];

  const handleKeywordClick = (keyword) => {
    setSearch(keyword);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-start bg-black/50">
      <div ref={popupRef} className="flex flex-col items-center w-full">
        {/* Thanh search */}
        <div className="w-full flex justify-center mt-8 bg-white h-20 items-center">
          <div className="relative w-[500px]">
            <input
              type="text"
              placeholder={t("header.search_placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-full px-12 py-3 text-lg shadow focus:outline-none"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && search.trim()) {
                  navigate(`/search?q=${encodeURIComponent(search.trim())}`);
                  onClose();
                }
              }}
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
              <svg
                width="22"
                height="22"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </span>
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl text-gray-500 hover:text-gray-700 cursor-pointer"
              onClick={onClose}
              aria-label={t("search.close", "Đóng")}
              tabIndex={0}
            >
              ×
            </button>
          </div>
        </div>

        {/* Kết quả tìm kiếm hoặc gợi ý */}
        <div className="bg-white rounded-2xl shadow-xl mt-8 p-8 w-full max-w-[1100px] min-h-[420px] relative flex flex-col items-center">
          {search.trim() ? (
            <>
              <div className="font-bold text-lg mb-6 w-full text-left">
                {t("search.result_title", "Kết quả tìm kiếm")}
              </div>
              {isLoading ? (
                <div className="text-gray-500 mt-8">
                  {t("common.loading", "Đang tải")}...
                </div>
              ) : products.length > 0 ? (
                <>
                  <div className="grid grid-cols-4 gap-6 w-full">
                    {products.map((p) => {
                      const mainVariant = p.variants?.[0];
                      const mainImage =
                        mainVariant?.images?.find((img) => img.isPrimary)
                          ?.imageUrl ||
                        mainVariant?.images?.[0]?.imageUrl ||
                        p.primaryImage?.imageUrl ||
                        p.image ||
                        "/placeholder.png";

                      // Tính discount từ price và currentPrice
                      const discountPercent =
                        p.price && p.currentPrice
                          ? Math.round(
                              ((p.price - p.currentPrice) / p.price) * 100
                            )
                          : null;

                      return (
                        <Link
                          to={`/product/${encodeId(p.id)}`}
                          key={p.id}
                          className="block hover:shadow-lg transition"
                          onClick={onClose}
                        >
                          <div className="flex flex-col items-center bg-white rounded-xl p-4">
                            <img
                              src={mainImage}
                              alt={p.name}
                              className="w-48 h-64 object-cover rounded-lg mb-2"
                            />
                            <div className="font-semibold text-base text-center">
                              {p.name}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-bold text-lg text-black">
                                {p.currentPrice
                                  ? `${p.currentPrice.toLocaleString()}đ`
                                  : p.price
                                  ? `${p.price.toLocaleString()}đ`
                                  : ""}
                              </span>
                              {p.currentPrice && p.currentPrice < p.price && (
                                <>
                                  <span className="line-through text-gray-400 text-sm">
                                    {p.price?.toLocaleString()}đ
                                  </span>
                                  {discountPercent && (
                                    <span className="bg-blue-700 text-white text-xs px-2 py-1 rounded-full font-bold">
                                      -{discountPercent}%
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  {products.length >= 4 && (
                    <button
                      className="mt-8 px-8 py-2 bg-black text-white rounded-full font-bold hover:bg-gray-900"
                      onClick={() => {
                        navigate(
                          `/search?q=${encodeURIComponent(search.trim())}`
                        );
                        onClose();
                      }}
                    >
                      {t("search.view_all", "Xem tất cả")}
                    </button>
                  )}
                </>
              ) : (
                <div className="text-gray-500 mt-8">
                  {t("search.no_result", "Không tìm thấy sản phẩm phù hợp")}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="font-bold text-lg mb-4">
                {t("search.suggest_title", "Từ khóa nổi bật ngày hôm nay")}
              </div>
              <div className="flex flex-wrap gap-3 mb-4 justify-center">
                {keywords.map((kw) => (
                  <button
                    key={kw}
                    className="border rounded-full px-4 py-1 hover:bg-gray-100"
                    onClick={() => handleKeywordClick(kw)}
                  >
                    {kw}
                  </button>
                ))}
              </div>
              <div className="text-gray-500">
                {t("search.no_recent", "Không có sản phẩm đã xem gần đây")}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
