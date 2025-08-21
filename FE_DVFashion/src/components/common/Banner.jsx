import React, { useState, useEffect } from "react";

export default function Banner() {
  const slides = [
    {
      id: 1,
      image: "./src/assets/banner_home.avif",
      title: "2.9 COLLECTION",
      subtitle: "Tự do vươn mình",
      desc: "Mua 02 giảm thêm 10%",
    },
    {
      id: 2,
      image: "./src/assets/banner_home_2.avif",
      title: "NEW ARRIVAL",
      subtitle: "Phong cách trẻ trung",
      desc: "Giảm giá sốc lên đến 30%",
    },
    {
      id: 3,
      image: "./src/assets/banner_home_3.avif",
      title: "HOT DEAL",
      subtitle: "Sale cuối mùa",
      desc: "Chỉ còn 199k",
    },
  ];

  const [current, setCurrent] = useState(0);

  // Auto chuyển sau 6 giây
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [current]);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };
  return (
    <div className="relative w-full h-[620px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
          style={{
            backgroundImage: `url(${slide.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>
      ))}

      {/* Nút điều hướng */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-2xl p-2 rounded-full cursor-pointer z-30"
      >
        ❮
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-2xl p-2 rounded-full cursor-pointer z-30"
      >
        ❯
      </button>
    </div>
  );
}
