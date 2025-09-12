import React, { useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { ChevronLeft, ChevronRight } from "react-feather";

export default function ProductCarousel({ products = [] }) {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const swiperRef = useRef(null);
  // Chỉ lấy sản phẩm ACTIVE
  const activeProducts = products.filter((p) => p.status === "ACTIVE");

  useEffect(() => {
    if (
      swiperRef.current &&
      prevRef.current &&
      nextRef.current &&
      swiperRef.current.navigation
    ) {
      swiperRef.current.params.navigation.prevEl = prevRef.current;
      swiperRef.current.params.navigation.nextEl = nextRef.current;
      swiperRef.current.navigation.destroy();
      swiperRef.current.navigation.init();
      swiperRef.current.navigation.update();
    }
  }, [products]);

  const ProductCard = ({ product }) => {
    // Lấy variant đầu tiên (hoặc chọn theo logic khác nếu cần)
    const mainVariant = product.variants?.[0];
    // Lấy ảnh chính
    const mainImage =
      mainVariant?.images?.find((img) => img.isPrimary)?.imageUrl ||
      mainVariant?.images?.[0]?.imageUrl ||
      product.primaryImage?.imageUrl ||
      product.image ||
      "/placeholder.png";
    // Lấy tất cả màu sắc từ các variant
    const colors = product.variants?.map((v) => v.color).filter(Boolean) || [];
    // Lấy tất cả size từ các variant
    const sizes =
      product.variants
        ?.flatMap((v) => v.sizes?.map((s) => s.sizeName) || [])
        .filter((v, i, arr) => arr.indexOf(v) === i) || [];

    // Tính phần trăm giảm giá nếu có
    const discountPercent =
      product.price && product.salePrice
        ? Math.round(
            ((product.price - product.salePrice) / product.price) * 100
          )
        : null;

    return (
      <div className="relative group bg-white rounded-xl shadow-sm overflow-hidden p-2">
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
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Màu sắc */}
        <div className="flex gap-2 mt-2 ">
          {colors.map((color, idx) => (
            <span
              key={idx}
              className="w-8 h-8 rounded-full border cursor-pointer"
              style={{
                backgroundColor: /^#|rgb|hsl/.test(color) ? color : undefined,
                borderColor: "#ccc",
              }}
              title={color}
            >
              {/* Nếu là tên màu (Đen, Xanh...), có thể thêm border hoặc text */}
              {!/^#|rgb|hsl/.test(color) && (
                <span className="block w-full h-full flex items-center text-[10px] leading-5 justify-center">
                  {color}
                </span>
              )}
            </span>
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
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-10 py-10 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Sản phẩm nổi bật</h2>
        <a href="#" className="text-sm underline">
          Xem thêm
        </a>
      </div>

      {/* Swiper + custom buttons */}
      <Swiper
        modules={[Navigation]}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        spaceBetween={16}
        slidesPerView={2}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 4 },
        }}
      >
        {activeProducts.map((product) => (
          <SwiperSlide key={product.id}>
            <ProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom buttons */}
      <button
        ref={prevRef}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-black text-white shadow-md w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800 z-10"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        ref={nextRef}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-black text-white shadow-md w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800 z-10"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}
