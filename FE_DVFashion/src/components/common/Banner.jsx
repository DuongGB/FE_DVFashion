import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePromotion } from "../../hooks/usePromotion";
import { encodeId } from "../../utils/encodeId";

export default function Banner() {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();

  // Public: get active promotions with banners
  const { useActivePromotionsPaging } = usePromotion(i18n.language || "VI");
  const { data: activePromosPage, isLoading } = useActivePromotionsPaging({
    page: 0,
    size: 10,
  });

  const promoSlides = useMemo(() => {
    const values = activePromosPage?.values ?? [];
    return values
      .filter((p) => !!p?.bannerUrl)
      .map((p) => ({
        id: p.id,
        image: p.bannerUrl,
        title: p.name,
        subtitle: "",
        desc: p.description || "",
      }));
  }, [activePromosPage]);

  // Fallback slides if no promo banner available
  const fallbackSlides = [
    {
      id: "fb-1",
      image: "./src/assets/banner_home.avif",
      title: "2.9 COLLECTION",
      subtitle: "Tự do vươn mình",
      desc: "Mua 02 giảm thêm 10%",
    },
    {
      id: "fb-2",
      image: "./src/assets/banner_home_2.avif",
      title: "NEW ARRIVAL",
      subtitle: "Phong cách trẻ trung",
      desc: "Giảm giá sốc lên đến 30%",
    },
    {
      id: "fb-3",
      image: "./src/assets/banner_home_3.avif",
      title: "HOT DEAL",
      subtitle: "Sale cuối mùa",
      desc: "Chỉ còn 199k",
    },
  ];

  const slides = promoSlides.length > 0 ? promoSlides : fallbackSlides;

  const [current, setCurrent] = useState(0);

  // Auto chuyển sau 6 giây
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [current, slides.length]);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const openPromotion = (id) => {
    if (!id || String(id).startsWith("fb-")) return;
    navigate(`/promotions/${encodeId(id)}`);
  };

  return (
    <div className="relative w-full h-[620px] overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter") openPromotion(slide.id);
            }}
            className="w-full h-full relative"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.4), rgba(0,0,0,0.1) 60%, transparent 100%)",
            }}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover object-center absolute inset-0"
              style={{
                maxHeight: 620,
                minHeight: 320,
                aspectRatio: "16/7",
                zIndex: 0,
                pointerEvents: "none",
                userSelect: "none",
              }}
              draggable={false}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent z-10" />
            {/* Text overlay */}
            {(slide.title || slide.desc) && (
              <div className="absolute bottom-10 left-10 text-white max-w-xl drop-shadow-md z-20">
                {slide.title && (
                  <h2 className="text-4xl font-extrabold mb-2">
                    {slide.title}
                  </h2>
                )}
                {slide.subtitle && (
                  <p className="text-lg opacity-90 mb-1">{slide.subtitle}</p>
                )}
                {slide.desc && (
                  <p className="text-sm opacity-90 line-clamp-2">
                    {slide.desc}
                  </p>
                )}
                {!String(slide.id).startsWith("fb-") && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openPromotion(slide.id);
                    }}
                    className="mt-4 inline-block bg-white text-black font-semibold px-5 py-2 rounded-full hover:bg-gray-100 transition cursor-pointer"
                  >
                    {t("promotion.view_products")}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Tải dữ liệu nếu đang load */}
      {isLoading && promoSlides.length === 0 && (
        <div className="absolute inset-0 z-20 animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
      )}

      {/* Nút điều hướng */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-2xl p-2 rounded-full cursor-pointer z-30 bg-black/30 hover:bg-black/50"
        aria-label="Previous slide"
      >
        ❮
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-2xl p-2 rounded-full cursor-pointer z-30 bg-black/30 hover:bg-black/50"
        aria-label="Next slide"
      >
        ❯
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((s, idx) => (
          <button
            key={s.id}
            onClick={() => setCurrent(idx)}
            className={`h-2.5 rounded-full transition-all ${
              idx === current ? "w-6 bg-white" : "w-2.5 bg-white/60"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
