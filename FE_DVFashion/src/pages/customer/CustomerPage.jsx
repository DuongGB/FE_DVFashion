import React from "react";
import { useAuth } from "../../hooks/useAuth";
import Banner from "../../components/common/Banner";
import Category from "../../components/common/Category";
import ProductCarousel from "../../components/common/ProductCarousel";

const ads = [
  {
    id: 1,
    title: "ƯU ĐÃI KHÁCH HÀNG",
    subtitle: "Nhận ngay voucher 50K cho đơn đầu tiên",
    image: "./src/assets/ads_home_1.avif",
    button: "NHẬN ƯU ĐÃI",
  },
  {
    id: 2,
    title: "THÀNH VIÊN DVFCLUB",
    subtitle: "Tích điểm đổi quà, nhận ưu đãi độc quyền",
    image: "./src/assets/ads_home_2.avif",
    button: "THAM GIA NGAY",
  },
];

const CustomerPage = () => {
  const { user } = useAuth();
  return (
    <div className="font-sans">
      {/* Banner */}
      <Banner />

      {/* Main content */}
      <Category />

      {/* Advertisement */}
      <div className="w-full max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ads.map((ad) => (
            <div
              key={ad.id}
              className="relative rounded-2xl overflow-hidden group"
            >
              {/* Background image */}
              <img
                src={ad.image}
                alt={ad.title}
                className="w-full h-[400px] object-cover transform group-hover:scale-105 transition duration-500"
              />

              {/* Overlay content */}
              <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-6">
                <h2 className="text-white text-3xl font-bold">{ad.title}</h2>
                <p className="text-white text-sm mt-2">{ad.subtitle}</p>
                <button className="mt-4 bg-white text-black font-semibold px-6 py-2 rounded-full hover:bg-gray-100 transition">
                  {ad.button}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <ProductCarousel />
    </div>
  );
};

export default CustomerPage;
