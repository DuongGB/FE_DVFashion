import { useEffect, useState } from "react";
import { IconClock } from "@tabler/icons-react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useProduct } from "../hooks/useProduct";
import { ShoppingCart } from "react-feather";
import getColorHex from "../utils/getColorHex";
import { decodeId } from "../utils/encodeId";
import { useCart } from "../hooks/useCart";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";

export default function ProductDetailPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "VI";
  const { id: encodeId } = useParams();
  const id = decodeId(encodeId);
  const { products = [] } = useProduct(lang);
  const { isAuthenticated } = useAuth();

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [mainImageIdx, setMainImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);
  const { addToCart, isAdding } = useCart();

  // Lấy sản phẩm theo id
  const product = products.find((p) => String(p.id) === String(id));

  // Khi đổi variant thì reset về ảnh đầu tiên
  useEffect(() => {
    setMainImageIdx(0);
  }, [selectedVariant]);

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

  if (!product) {
    return (
      <div className="flex justify-center items-center h-[400px] text-lg">
        {t("search.no_result", "Không tìm thấy sản phẩm phù hợp")}
      </div>
    );
  }

  // Hàm xử lý thêm vào giỏ hàng
  const handleAddToCart = async () => {
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
      // Không chuyển trang, không nhảy đi đâu cả
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

  // Tính phần trăm giảm giá
  const discountPercent =
    product.price && product.salePrice
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : null;

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto py-8">
      {/* Left: Ảnh sản phẩm */}
      <div className="flex flex-col md:flex-row gap-6 w-full md:w-1/2">
        {/* Danh sách ảnh nhỏ */}
        <div className="flex md:flex-col gap-2">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img?.imageUrl || "https://shpetro.com/images/no_image.png"}
              alt={product?.name}
              className={`w-16 h-16 object-cover rounded-lg border cursor-pointer ${
                mainImageIdx === idx ? "border-blue-500" : ""
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
            className="w-full max-w-[420px] h-[480px] object-cover rounded-xl bg-gray-50"
          />
        </div>
      </div>

      {/* Right: Thông tin sản phẩm */}
      <div className="flex-1 flex flex-col gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
        <div className="flex items-center gap-3">
          <span className="line-through text-gray-400 text-lg">
            {product.price?.toLocaleString()}đ
          </span>
          <span className="text-2xl font-bold text-black">
            {product.salePrice
              ? `${product.salePrice.toLocaleString()}đ`
              : product.price
              ? `${product.price.toLocaleString()}đ`
              : ""}
          </span>
          {discountPercent && (
            <span className="bg-blue-700 text-white text-sm px-3 py-1 rounded-full font-bold">
              -{discountPercent}%
            </span>
          )}
        </div>
        {/* DVFcash */}
        <div className="bg-blue-50 text-blue-700 px-3 py-2 rounded flex items-center gap-2 text-sm">
          <span>{t("product.detail.cashback")}</span>
          <span className="font-bold">
            {Math.round(
              (product.salePrice || product.price) * 0.07
            ).toLocaleString()}{" "}
            DVFcash
          </span>
        </div>
        {/* Màu sắc */}
        <div className="flex items-center gap-2 mt-2">
          <span className="font-semibold">{t("product.detail.color")}</span>
          {product.variants?.map((variant) => (
            <button
              key={variant.id}
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mx-1 cursor-pointer ${
                selectedVariant?.id === variant.id
                  ? "border-blue-600"
                  : "border-gray-300"
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
          <span className="ml-2">{selectedVariant?.color}</span>
        </div>
        {/* Kích thước */}
        <div className="flex items-center gap-2 mt-2">
          <span className="font-semibold">{t("product.detail.size")}</span>
          {selectedVariant?.sizes?.map((size) => (
            <button
              key={size.name}
              className={`border rounded px-2 mx-1 ${
                selectedSize === size.sizeName
                  ? "bg-black text-white font-bold"
                  : "bg-white"
              }`}
              onClick={() => setSelectedSize(size.sizeName)}
            >
              {size.sizeName}
            </button>
          ))}
          <a
            href="#"
            className="text-blue-700 text-sm ml-4 underline"
            tabIndex={0}
          >
            {t("product.detail.size_guide")}
          </a>
        </div>
        {/* Số lượng */}
        <div className="flex items-center gap-2 mt-2">
          <button
            className="w-8 h-8 rounded-full border flex items-center justify-center text-xl"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          >
            -
          </button>
          <span className="w-8 text-center">{quantity}</span>
          <button
            className="w-8 h-8 rounded-full border flex items-center justify-center text-xl"
            onClick={() => setQuantity((q) => q + 1)}
          >
            +
          </button>
        </div>
        {/* Thêm vào giỏ */}
        <button
          className="mt-4 flex items-center justify-center gap-2 bg-black text-white font-bold rounded-full py-3 text-lg hover:bg-gray-900 transition cursor-pointer disabled:opacity-50"
          onClick={handleAddToCart}
          disabled={isAdding}
        >
          <ShoppingCart size={22} />
          {t("product.detail.add_to_cart")}
        </button>
        {/* Mô tả sản phẩm */}
        <details className="mt-4">
          <summary className="font-bold cursor-pointer text-lg">
            {t("product.detail.description")}
          </summary>
          <div className="mt-2 text-gray-700 whitespace-pre-line">
            {product.description || t("product.detail.no_description")}
          </div>
        </details>
        {/* Chính sách/ưu đãi */}
        <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-xl p-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <IconClock size={24} className="text-gray-800" />
            {t("product.detail.policy_easy_return")}
          </div>
          <div className="flex items-center gap-2">
            <IconClock size={24} className="text-gray-800" />

            {t("product.detail.policy_hotline")}
          </div>
          <div className="flex items-center gap-2">
            <IconClock size={24} className="text-gray-800" />

            {t("product.detail.policy_60days")}
          </div>
          <div className="flex items-center gap-2">
            <IconClock size={24} className="text-gray-800" />
            {t("product.detail.policy_fast_refund")}
          </div>
        </div>
      </div>
    </div>
  );
}
