import { useEffect, useState } from "react";
import { IconClock, IconPlus, IconMinus } from "@tabler/icons-react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useProductById } from "../hooks/useProduct";
import { ShoppingCart } from "react-feather";
import getColorHex from "../utils/getColorHex";
import { decodeId } from "../utils/encodeId";
import { useCart } from "../hooks/useCart";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import ProductRecommendations from "./ProductRecommendations";
import ProductReviews from "../components/ui/product/ProductReviews";
import AuthModal from "../components/ui/auth/AuthModal";

export default function ProductDetailPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "VI";
  const { id: encodeId } = useParams();
  const id = decodeId(encodeId);
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Sử dụng useProductById để lấy chi tiết sản phẩm
  const { data: product, isLoading, error } = useProductById(id, lang);

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [mainImageIdx, setMainImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);
  const { addToCart, isAdding } = useCart();

  // Khi đổi variant thì reset về ảnh đầu tiên
  useEffect(() => {
    setMainImageIdx(0);
  }, [selectedVariant]);

  useEffect(() => {
    setIsInitialized(false);
    setQuantity(1);
  }, [id]);

  // Khi có product thì set variant và size mặc định
  useEffect(() => {
    if (
      product &&
      product.variants &&
      product.variants.length > 0 &&
      !isInitialized
    ) {
      setSelectedVariant(product.variants[0]);
      setSelectedSize(
        product.variants[0].sizes?.[0]?.name ||
          product.variants[0].sizes?.[0]?.sizeName ||
          null
      );
      setIsInitialized(true);
    }
  }, [product, isInitialized]);

  // Hiển thị loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px] text-lg">
        {t("common.loading")}...
      </div>
    );
  }

  // Hiển thị lỗi
  if (error) {
    return (
      <div className="flex justify-center items-center h-[400px] text-lg text-red-500">
        {t("product.detail.error_loading")}
      </div>
    );
  }

  // Không tìm thấy sản phẩm
  if (!product) {
    return (
      <div className="flex justify-center items-center h-[400px] text-lg">
        {t("search.no_result", "Không tìm thấy sản phẩm phù hợp")}
      </div>
    );
  }

  // Hàm xử lý thêm vào giỏ hàng
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    if (!product || !selectedVariant || !selectedSize) return;
    const sizeObj = selectedVariant.sizes?.find(
      (s) => s.sizeName === selectedSize || s.name === selectedSize
    );
    if (!sizeObj) return toast.error(t("product.card.choose_valid_size"));

    try {
      await addToCart({
        productVariantId: selectedVariant.id,
        sizeId: sizeObj.id || sizeObj.sizeId,
        quantity,
      });
      toast.success(t("product.card.added_to_cart"));
    } catch (error) {
      if (!isAuthenticated) {
        toast.error(t("product.card.login_to_add"));
        return;
      }
      toast.error(t("product.card.out_of_stock"));
    }
  };

  // Lấy ảnh chính và danh sách ảnh
  const images =
    selectedVariant?.images?.length > 0
      ? selectedVariant.images
      : product.primaryImage
      ? [product.primaryImage]
      : product.images || [];

  const mainImage =
    images[mainImageIdx]?.imageUrl ||
    images[mainImageIdx]?.url ||
    product.image ||
    "https://shpetro.com/images/no_image.png";

  // Tính phần trăm giảm giá dựa trên price và currentPrice
  const discountPercent =
    product.price && product.currentPrice
      ? Math.round(
          ((product.price - product.currentPrice) / product.price) * 100
        )
      : null;

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-8 px-4">
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
        {/* Left: Ảnh sản phẩm */}
        <div className="flex flex-row lg:flex-row gap-3 sm:gap-6 w-full lg:w-1/2">
          {/* Danh sách ảnh nhỏ */}
          <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img?.imageUrl || "https://shpetro.com/images/no_image.png"}
                alt={product?.name}
                className={`w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 object-cover rounded-lg border cursor-pointer ${
                  mainImageIdx === idx
                    ? "border-blue-500 ring-2 ring-blue-300"
                    : ""
                }`}
                onClick={() => setMainImageIdx(idx)}
              />
            ))}
          </div>
          {/* Ảnh lớn */}
          <div className="flex-1 flex items-center justify-center">
            <img
              src={mainImage}
              alt={product?.name}
              className="w-full max-w-[420px] h-[300px] sm:h-[400px] lg:h-[480px] object-cover rounded-xl bg-gray-50"
            />
          </div>
        </div>

        {/* Right: Thông tin sản phẩm */}
        <div className="flex-1 flex flex-col gap-3 sm:gap-4">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
            {product.name}
          </h1>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="line-through text-gray-400 text-base sm:text-lg">
              {product.price?.toLocaleString()}đ
            </span>
            <span className="text-xl sm:text-2xl font-bold text-black">
              {product.currentPrice?.toLocaleString()}đ
            </span>
            {discountPercent && (
              <span className="bg-red-500 text-white text-xs sm:text-sm px-2 py-1 rounded-full">
                -{discountPercent}%
              </span>
            )}
          </div>
          {/* Màu sắc */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="font-semibold text-sm sm:text-base">
              {t("product.detail.color")}:
            </span>
            {product.variants?.map((variant) => (
              <button
                key={variant.id}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${
                  selectedVariant?.id === variant.id
                    ? "border-blue-600 ring-2 ring-blue-300"
                    : "border-gray-300 hover:border-gray-400"
                }`}
                style={{
                  backgroundColor: getColorHex(variant.color),
                }}
                title={variant.color}
                onClick={() => {
                  setSelectedVariant(variant);
                  setSelectedSize(
                    variant.sizes?.[0]?.name ||
                      variant.sizes?.[0]?.sizeName ||
                      null
                  );
                }}
              ></button>
            ))}
            <span className="ml-2 text-sm sm:text-base">
              {selectedVariant?.color}
            </span>
          </div>
          {/* Kích thước */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="font-semibold text-sm sm:text-base">
              {t("product.detail.size")}:
            </span>
            {selectedVariant?.sizes?.map((size) => (
              <button
                key={size.id || size.sizeName}
                className={`border rounded px-2.5 sm:px-3 py-1 sm:py-1.5 cursor-pointer transition-all text-sm sm:text-base ${
                  selectedSize === size.sizeName
                    ? "bg-black text-white font-bold"
                    : "bg-white hover:bg-gray-100"
                }`}
                onClick={() => setSelectedSize(size.sizeName)}
              >
                {size.sizeName}
              </button>
            ))}
            <a
              href="#"
              className="text-blue-700 text-xs sm:text-sm ml-2 sm:ml-4 underline"
              tabIndex={0}
            >
              {t("product.detail.size_guide")}
            </a>
          </div>
          {/* Số lượng */}
          <div className="flex items-center gap-2 sm:gap-3 mt-2">
            <span className="font-semibold text-sm sm:text-base">
              {t("product.detail.quantity")}:
            </span>
            <button
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center text-lg sm:text-xl cursor-pointer hover:bg-gray-100"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <IconMinus size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
            <span className="w-8 sm:w-10 text-center font-semibold text-sm sm:text-base">
              {quantity}
            </span>
            <button
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center text-lg sm:text-xl cursor-pointer hover:bg-gray-100"
              onClick={() => setQuantity((q) => q + 1)}
            >
              <IconPlus size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>
          </div>
          {/* Thêm vào giỏ */}
          <button
            className="mt-4 flex items-center justify-center gap-2 bg-black text-white font-bold rounded-full py-2.5 sm:py-3 text-base sm:text-lg hover:bg-gray-900 transition cursor-pointer disabled:opacity-50 w-full"
            onClick={handleAddToCart}
            disabled={isAdding}
          >
            <ShoppingCart size={20} className="sm:w-[22px] sm:h-[22px]" />
            {t("product.detail.add_to_cart")}
          </button>
          {/* Mô tả sản phẩm */}
          <details className="mt-4 border rounded-lg p-3 sm:p-4 bg-gray-50">
            <summary className="font-bold cursor-pointer text-base sm:text-lg">
              {t("product.detail.description")}
            </summary>
            <div className="mt-2 text-gray-700 whitespace-pre-line text-sm sm:text-base">
              {product.description || t("product.detail.no_description")}
            </div>
          </details>
          {/* Chính sách/ưu đãi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-gray-50 rounded-xl p-3 sm:p-4 mt-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <IconClock
                size={20}
                className="text-gray-800 sm:w-6 sm:h-6 flex-shrink-0"
              />
              <span>{t("product.detail.policy_easy_return")}</span>
            </div>
            <div className="flex items-center gap-2">
              <IconClock
                size={20}
                className="text-gray-800 sm:w-6 sm:h-6 flex-shrink-0"
              />
              <span>{t("product.detail.policy_hotline")}</span>
            </div>
            <div className="flex items-center gap-2">
              <IconClock
                size={20}
                className="text-gray-800 sm:w-6 sm:h-6 flex-shrink-0"
              />
              <span>{t("product.detail.policy_60days")}</span>
            </div>
            <div className="flex items-center gap-2">
              <IconClock
                size={20}
                className="text-gray-800 sm:w-6 sm:h-6 flex-shrink-0"
              />
              <span>{t("product.detail.policy_fast_refund")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gợi ý sản phẩm */}
      <ProductRecommendations productId={id} />
      {/* Reviews */}
      <ProductReviews productId={id} />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="login"
        stayOnPage
      />
    </div>
  );
}
