import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import Banner from "../components/common/Banner";
import Category from "../components/common/Category";
import ProductCarousel from "../components/common/ProductCarousel";
import {
  useTodayRecommendations,
  useTodayViewedProducts,
} from "../hooks/useProductRecomendations";
import { useAuth } from "../hooks/useAuth";
import { useProduct } from "../hooks/useProduct";
import { encodeId } from "../utils/encodeId";
import { getDefaultRouteByRoles } from "../utils/getDefaultRouteByRoles";
import { useCategory } from "../hooks/useCategory";
import { useProductsByCategoryPaging } from "../hooks/useProduct";

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();

  // Lấy gợi ý hôm nay
  const { data: todayRecs = [], isLoading: loadingTodayRecs } =
    useTodayRecommendations(isAuthenticated ? user?.id : undefined, 10);

  // Lấy sản phẩm vừa xem hôm nay (chỉ khi đăng nhập)
  const { data: todayViewed = [], isLoading: loadingTodayViewed } =
    useTodayViewedProducts(20);

  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const currentLanguage = i18n.language || "VI";
  const { categories = [], isLoading: isLoadingCategories } = useCategory({
    lang: currentLanguage,
    active: true,
    size: 20,
  });
  // Lấy 4 danh mục đầu
  const topCategories = useMemo(() => categories.slice(0, 4), [categories]);

  // Gọi hook cho từng danh mục ở cấp component (KHÔNG trong map)
  const catPagingResults = [
    useProductsByCategoryPaging(topCategories[0]?.id, 0, 12, currentLanguage),
    useProductsByCategoryPaging(topCategories[1]?.id, 0, 12, currentLanguage),
    useProductsByCategoryPaging(topCategories[2]?.id, 0, 12, currentLanguage),
    useProductsByCategoryPaging(topCategories[3]?.id, 0, 12, currentLanguage),
  ];

  // Products (existing)
  const productParams = useMemo(
    () => ({
      lang: currentLanguage,
      size: 12,
      status: "ACTIVE",
    }),
    [currentLanguage]
  );
  const { products = [], isLoading: isLoadingProducts } =
    useProduct(productParams);

  useEffect(() => {
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

  // useEffect(() => {
  //   if (isAuthenticated && user?.roles && location.pathname === "/") {
  //     const defaultRoute = getDefaultRouteByRoles(user?.roles);
  //     if (
  //       defaultRoute !== "/" &&
  //       defaultRoute !== "/customer" &&
  //       location.pathname === "/"
  //     ) {
  //       navigate(defaultRoute);
  //     }
  //   }
  // }, [isAuthenticated, user, navigate, location.pathname]);

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

  const displayProducts = isLoadingProducts ? null : products;
  const isLoading = isLoadingProducts;

  {
    isLoading ? (
      <div className="w-full max-w-7xl mx-auto px-10 py-10">
        <div className="text-center py-10 text-gray-500">
          {t("common.loading")} {t("product.loading")}...
        </div>
      </div>
    ) : displayProducts && displayProducts.length > 0 ? (
      <ProductCarousel
        products={displayProducts}
        title={t("product.featured_products")}
      />
    ) : (
      <div className="w-full max-w-7xl mx-auto px-10 py-10">
        <div className="text-center py-10 text-gray-500">
          {t("product.no_products_available")}
        </div>
      </div>
    );
  }

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
              <img
                src={ad.image}
                alt={ad.title}
                className="w-full h-[400px] object-cover transform group-hover:scale-105 transition duration-500"
              />
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

      {/* ProductCarousel tổng hợp */}
      {/* {isLoading ? (
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
      )} */}

      {/* Gợi ý hôm nay: luôn hiển thị, truyền userId nếu có */}
      <ProductCarousel
        products={todayRecs}
        title={
          isAuthenticated
            ? t("product.today_recommendations")
            : t("product.today_popular")
        }
        loading={loadingTodayRecs}
        viewAllLink={
          isAuthenticated
            ? "/today-products?type=recommend"
            : "/today-products?type=popular"
        }
      />

      {/* Sản phẩm vừa xem hôm nay: chỉ hiển thị khi đã đăng nhập và có dữ liệu */}
      {isAuthenticated && todayViewed.length > 0 && (
        <ProductCarousel
          products={todayViewed}
          title={t("product.today_viewed")}
          loading={loadingTodayViewed}
          viewAllLink="/today-products?type=viewed"
        />
      )}

      {/* ProductCarousel theo danh mục */}
      {isLoadingCategories ? (
        <div className="w-full max-w-7xl mx-auto px-10 py-10">
          <div className="text-center py-10 text-gray-500">
            {t("common.loading", "Đang tải danh mục...")}
          </div>
        </div>
      ) : (
        topCategories.map((cat, idx) => {
          const { data: catPage = { content: [] }, isLoading: loadingCat } =
            catPagingResults[idx] || {};
          return (
            <div key={cat?.id || idx} className="my-8">
              <ProductCarousel
                products={catPage.content}
                title={cat?.name}
                loading={loadingCat}
                onViewAll={(e) => {
                  e.preventDefault();
                  navigate(`/products?category=${encodeId(cat?.id)}`);
                }}
                viewAllLink={`/products?category=${encodeId(cat?.id)}`}
              />
            </div>
          );
        })
      )}
    </div>
  );
}
