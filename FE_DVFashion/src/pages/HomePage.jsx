import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getDefaultRouteByRoles } from "../utils/getDefaultRouteByRoles";
import Banner from "../components/common/Banner";
import Category from "../components/common/Category";
import ProductCarousel from "../components/common/ProductCarousel";
import { useTranslation } from "react-i18next";
import { useProduct } from "../hooks/useProduct";
import { useHybridRecommendations } from "../hooks/useProductRecomendations";

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Lấy danh sách sản phẩm từ API
  const language = i18n.language || "VI";
  const { products = [], isLoading: isLoadingProducts } = useProduct(language);

  // Lấy sản phẩm gợi ý dựa trên behavior (không cần productId ở trang chủ)
  const { data: recommendedProducts, isLoading: isLoadingRecommendations } =
    useHybridRecommendations({ productId: null, limit: 12 });

  useEffect(() => {
    // Cập nhật ngôn ngữ dựa trên trạng thái đăng nhập
    if (isAuthenticated && user?.preferredLanguage) {
      i18n.changeLanguage(user.preferredLanguage);
      localStorage.setItem("i18nextLng", user.preferredLanguage); // Lưu vào localStorage
    } else {
      const savedLanguage = localStorage.getItem("i18nextLng") || "VI";
      i18n.changeLanguage(savedLanguage);
    }
  }, [isAuthenticated, user, i18n]);

  useEffect(() => {
    // Chỉ redirect nếu đang ở trang chủ "/"
    if (
      isAuthenticated &&
      user?.roles &&
      location.pathname === "/" // chỉ redirect ở trang chủ
    ) {
      const defaultRoute = getDefaultRouteByRoles(user?.roles);
      // Chỉ redirect nếu defaultRoute khác "/" và KHÔNG phải là "/customer"
      if (
        defaultRoute !== "/" &&
        defaultRoute !== "/customer" &&
        location.pathname === "/"
      ) {
        navigate(defaultRoute);
      }
    }
  }, [isAuthenticated, user, navigate, location.pathname]);

  const ads = [
    {
      id: 1,
      title: t("ads.men_wear.title"),
      subtitle: t("ads.men_wear.subtitle"),
      image: "./src/assets/ads_home_1.avif",
      button: t("ads.men_wear.button"),
    },
    {
      id: 2,
      title: t("ads.women_active.title"),
      subtitle: t("ads.women_active.subtitle"),
      image: "./src/assets/ads_home_2.avif",
      button: t("ads.women_active.button"),
    },
  ];

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
      {isLoadingRecommendations || isLoadingProducts ? (
        <div className="text-center py-10">Đang tải sản phẩm...</div>
      ) : (
        <ProductCarousel
          products={
            recommendedProducts?.length > 0 ? recommendedProducts : products
          }
        />
      )}
    </div>
  );
}
