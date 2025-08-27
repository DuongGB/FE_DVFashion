import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getDefaultRouteByRoles } from "../utils/getDefaultRouteByRoles";
import Banner from "../components/common/Banner";
import Category from "../components/common/Category";
import ProductCarousel from "../components/common/ProductCarousel";

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  console.log("HomePage user:", user);
  console.log("HomePage isAuthenticated:", isAuthenticated);

  const navigate = useNavigate();

  useEffect(() => {
    // Chỉ redirect nếu đang ở trang chủ "/"
    if (
      isAuthenticated &&
      user?.roles &&
      location.pathname === "/" // chỉ redirect ở trang chủ
    ) {
      const defaultRoute = getDefaultRouteByRoles(user?.roles);
      if (defaultRoute !== "/") {
        navigate(defaultRoute);
      }
    }
  }, [isAuthenticated, user, navigate, location.pathname]);

  const ads = [
    {
      id: 1,
      title: "MEN WEAR",
      subtitle: "Nhập COOLNEW Giảm 30K đơn đầu tiên từ 199k",
      image: "./src/assets/ads_home_1.avif",
      button: "KHÁM PHÁ",
    },
    {
      id: 2,
      title: "WOMEN ACTIVE",
      subtitle: "Tặng phụ kiện cho đơn từ 399k | Freeship",
      image: "./src/assets/ads_home_2.avif",
      button: "KHÁM PHÁ",
    },
  ];

  return (
    // <div className="flex flex-col items-center justify-center h-screen gap-4">
    //   {!isAuthenticated && <LoginForm />}
    // </div>
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
}
