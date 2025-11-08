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
import VoucherSection from "./customer/voucher/VoucherSection";

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Lấy danh sách sản phẩm từ API
  const currentLanguage = i18n.language || "VI";
  const { products = [], isLoading: isLoadingProducts } = useProduct({
    lang: currentLanguage,
    size: 12,
    status: "ACTIVE",
  });

  // Chỉ lấy sản phẩm gợi ý khi đã đăng nhập
  const {
    data: recommendedProducts = [],
    isLoading: isLoadingRecommendations,
    error: recommendationError,
  } = useHybridRecommendations({
    productId: null,
    limit: 12,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    // Cập nhật ngôn ngữ dựa trên trạng thái đăng nhập
    if (isAuthenticated && user?.preferredLanguage) {
      i18n.changeLanguage(user.preferredLanguage);
      localStorage.setItem("i18nextLng", user.preferredLanguage);
    } else {
      const savedLanguage = localStorage.getItem("i18nextLng") || "VI";
      if (i18n.language !== savedLanguage) {
        i18n.changeLanguage(savedLanguage);
      }
    }
  }, [isAuthenticated, user, i18n]);

  useEffect(() => {
    // Chỉ redirect nếu đang ở trang chủ "/"
    if (isAuthenticated && user?.roles && location.pathname === "/") {
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

  // Xác định sản phẩm để hiển thị dựa trên trạng thái đăng nhập
  const displayProducts = (() => {
    // Nếu chưa đăng nhập, luôn hiển thị sản phẩm từ getAll
    if (!isAuthenticated) {
      return isLoadingProducts ? null : products;
    }

    // Nếu đã đăng nhập, ưu tiên sản phẩm gợi ý
    if (isLoadingRecommendations) {
      return null;
    }

    // Hiển thị sản phẩm gợi ý nếu có, không thì fallback về products
    if (recommendedProducts && recommendedProducts.length > 0) {
      return recommendedProducts;
    }

    // Fallback về danh sách sản phẩm thông thường nếu không có gợi ý
    return isLoadingProducts ? null : products;
  })();

  // Xác định trạng thái loading
  const isLoading = !isAuthenticated
    ? isLoadingProducts
    : isLoadingRecommendations || isLoadingProducts;

  return (
    <div className="font-sans">
      {/* Banner */}
      <Banner />

      {/* Main content */}
      <Category />

      {/* Voucher Section */}
      <VoucherSection />

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

      {/* Product Carousel */}
      {isLoading ? (
        <div className="w-full max-w-7xl mx-auto px-10 py-10">
          <div className="text-center py-10 text-gray-500">
            {t("common.loading")} {t("product.loading")}...
          </div>
        </div>
      ) : displayProducts && displayProducts.length > 0 ? (
        <ProductCarousel
          products={displayProducts}
          title={
            isAuthenticated
              ? t("product.recommended_for_you")
              : t("product.featured_products")
          }
        />
      ) : (
        <div className="w-full max-w-7xl mx-auto px-10 py-10">
          <div className="text-center py-10 text-gray-500">
            {t("product.no_products_available")}
          </div>
        </div>
      )}
    </div>
  );
}
