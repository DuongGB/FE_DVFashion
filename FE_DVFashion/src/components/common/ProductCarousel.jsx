import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "react-feather";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import ProductCard from "./ProductCard";
import AuthModal from "../ui/auth/AuthModal";

export default function ProductCarousel({ products = [] }) {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const swiperRef = useRef(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
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

  return (
    <div className="w-full max-w-7xl mx-auto px-10 py-10 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Sản phẩm có thể phù hợp với bạn</h2>
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
            <ProductCard
              product={product}
              onRequireLogin={() => setShowAuthModal(true)}
            />
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
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="login"
        stayOnPage
      />
    </div>
  );
}
