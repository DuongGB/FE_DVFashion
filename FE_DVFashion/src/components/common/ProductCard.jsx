import getColorHex from "../../utils/getColorHex";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { encodeId } from "../../utils/encodeId";
import { useCart } from "../../hooks/useCart";
import { toast } from "react-toastify";

export default function ProductCard({ product }) {
  const { addToCart, isAdding } = useCart();

  // Lấy variant đầu tiên (hoặc chọn theo logic khác nếu cần)
  const [activeColor, setActiveColor] = useState(
    product.variants?.[0]?.color || ""
  );

  // Lấy ảnh chính
  const [mainImage, setMainImage] = useState(
    product.variants?.[0]?.images?.find((img) => img.isPrimary)?.imageUrl ||
      product.variants?.[0]?.images?.[0]?.imageUrl ||
      "https://shpetro.com/images/no_image.png"
  );

  // Lấy tất cả màu sắc từ các variant
  const colors = product.variants?.map((v) => v.color).filter(Boolean) || [];

  // Khi click màu, đổi ảnh theo variant màu đó
  const handleColorClick = (color) => {
    setActiveColor(color);
    const variant = product.variants?.find((v) => v.color === color);
    const img =
      variant?.images?.find((img) => img.isPrimary)?.imageUrl ||
      variant?.images?.[0]?.imageUrl ||
      "https://shpetro.com/images/no_image.png";
    setMainImage(img);
  };

  // Khi đổi product, reset về màu và ảnh đầu tiên
  useEffect(() => {
    setActiveColor(product.variants?.[0]?.color || "");
    setMainImage(
      product.variants?.[0]?.images?.find((img) => img.isPrimary)?.imageUrl ||
        product.variants?.[0]?.images?.[0]?.imageUrl ||
        "https://shpetro.com/images/no_image.png"
    );
  }, [product]);

  // Lấy tất cả size từ các variant
  const activeVariant = product.variants?.find((v) => v.color === activeColor);
  const sizes = activeVariant?.sizes?.map((s) => s.sizeName) || [];

  // Tính phần trăm giảm giá nếu có
  const discountPercent =
    product.price && product.salePrice
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : null;

  // Hàm xử lý thêm nhanh vào giỏ hàng
  const handleQuickAddToCart = async (sizeName) => {
    // Tìm variant theo màu đang chọn
    const variant = product.variants?.find((v) => v.color === activeColor);
    if (!variant) {
      toast.error("Vui lòng chọn màu sắc hợp lệ.");
      return;
    }

    // Tìm size trong variant
    const size = variant.sizes?.find((s) => s.sizeName === sizeName);
    if (!size) {
      toast.error("Vui lòng chọn kích thước hợp lệ.");
      return;
    }

    try {
      await addToCart({
        productVariantId: variant.id,
        sizeId: size.id,
        quantity: 1,
      });
      toast.success("Đã thêm vào giỏ hàng");
    } catch (error) {
      toast.error("Sản phẩm đã hết hàng!");
    }
  };

  return (
    <Link
      to={`/product/${encodeId(product.id)}`}
      className="block group bg-white rounded-xl shadow-sm overflow-hidden p-2 hover:shadow-lg transition"
    >
      {/* Hình ảnh */}
      <div className="relative">
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-[300px] object-cover rounded-lg"
        />
        {product.onSale && discountPercent && (
          <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded font-bold">
            -{discountPercent}%
          </span>
        )}
        <div className="absolute inset-0 bg-black/30 flex flex-col justify-center items-center gap-2 opacity-0 group-hover:opacity-100 transition rounded-lg">
          <span className="text-white text-sm">Thêm nhanh vào giỏ hàng</span>
          <div className="flex gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                className="bg-white px-2 py-1 rounded text-xs font-medium hover:bg-gray-200"
                type="button"
                tabIndex={-1}
                // Không cho click chuyển trang khi bấm size
                onClick={async (e) => {
                  e.preventDefault();
                  await handleQuickAddToCart(size);
                }}
                disabled={isAdding}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Màu sắc */}
      <div className="flex gap-2 mt-2 ">
        {colors.map((color) => (
          <span
            key={color}
            className={`w-6 h-6 rounded-full border ${
              activeColor === color ? "border-blue-600" : "border-gray-300"
            } cursor-pointer`}
            style={{ backgroundColor: getColorHex(color) }}
            title={color}
            onClick={(e) => {
              e.preventDefault();
              handleColorClick(color);
            }}
          ></span>
        ))}
      </div>
      {/* Tên + Giá */}
      <h3 className="text-sm mt-2">{product.name}</h3>
      <div className="flex items-center gap-2">
        <span className="font-bold text-base text-black">
          {product.salePrice
            ? `${product.salePrice.toLocaleString()}₫`
            : product.price
            ? `${product.price.toLocaleString()}₫`
            : ""}
        </span>
        {product.salePrice && (
          <span className="line-through text-gray-400 text-sm">
            {product.price?.toLocaleString()}₫
          </span>
        )}
        {product.onSale && discountPercent && (
          <span className="text-blue-600 text-xs font-semibold">
            -{discountPercent}%
          </span>
        )}
      </div>
    </Link>
  );
}
