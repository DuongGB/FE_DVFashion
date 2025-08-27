import React, { useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { ChevronLeft, ChevronRight } from "react-feather";

export default function ProductCarousel() {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const swiperRef = useRef(null);

  const products = [
    {
      id: 1,
      name: "Áo Polo nam Premium Aircool",
      price: "399.000đ",
      image: "./src/assets/product.avif",
      colors: ["#e5d3c6", "#000000", "#cccccc"],
      tag: "NEW",
    },
    {
      id: 2,
      name: "Áo sơ mi nam Casual kẻ sọc",
      price: "499.000đ",
      image: "./src/assets/product1.avif",
      colors: ["#d0e0ff", "#cccccc"],
      tag: "NEW",
    },
    {
      id: 3,
      name: "Áo Polo nam Premium Cotton Linen",
      price: "399.000đ",
      image: "./src/assets/product.avif",
      colors: ["#eaa2b6", "#d8e4c0", "#d8e4c0"],
    },
    {
      id: 4,
      name: "Áo Tanktop Nam Mặc Trong Antismell",
      price: "89.000đ",
      oldPrice: "99.000đ",
      discount: "-10%",
      image: "./src/assets/product1.avif",
      colors: ["#222", "#444"],
    },
    {
      id: 5,
      name: "Áo Polo nam Premium Pique",
      price: "399.000đ",
      image: "./src/assets/product.avif",
      colors: ["#111", "#ddd"],
      tag: "NEW",
    },
  ];

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
  }, []);

  const ProductCard = ({ product }) => (
    <div className="relative group bg-white rounded-xl shadow-sm overflow-hidden p-2">
      {/* Hình ảnh */}
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-[300px] object-cover rounded-lg"
        />
        {product.tag && (
          <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
            {product.tag}
          </span>
        )}
        <div className="absolute inset-0 bg-black/30 flex flex-col justify-center items-center gap-2 opacity-0 group-hover:opacity-100 transition rounded-lg">
          <span className="text-white text-sm">Thêm nhanh vào giỏ hàng</span>
          <div className="flex gap-2">
            {["M", "L", "XL", "2XL", "3XL"].map((size) => (
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
      <div className="flex gap-2 mt-2">
        {product.colors.map((c, idx) => (
          <span
            key={idx}
            className="w-5 h-5 rounded-full border cursor-pointer"
            style={{ backgroundColor: c }}
          ></span>
        ))}
      </div>

      {/* Tên + Giá */}
      <h3 className="text-sm mt-2">{product.name}</h3>
      <div className="flex items-center gap-2">
        <span className="font-bold">{product.price}</span>
        {product.oldPrice && (
          <span className="line-through text-gray-400 text-sm">
            {product.oldPrice}
          </span>
        )}
        {product.discount && (
          <span className="text-blue-600 text-xs font-semibold">
            {product.discount}
          </span>
        )}
      </div>
    </div>
  );

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
        {products.map((product) => (
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
