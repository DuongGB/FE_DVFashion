import { useTranslation } from "react-i18next";
import { useHybridRecommendations } from "../hooks/useProductRecomendations";
import ProductCard from "../components/common/ProductCard";
import { useRef, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "react-feather";

export default function ProductRecommendations({
  productId,
  products,
  isLoading,
  error,
}) {
  const { t } = useTranslation();
  // Nếu truyền products từ ngoài vào thì dùng luôn, không thì fetch bằng hook
  const shouldFetch = !products;
  const {
    data: recommendations = [],
    isLoading: loadingFromHook,
    error: errorFromHook,
  } = useHybridRecommendations({
    productId,
    limit: 10,
    enabled: shouldFetch,
  });

  const displayProducts = products || recommendations;
  const loading = typeof isLoading === "boolean" ? isLoading : loadingFromHook;
  const fetchError = error || errorFromHook;

  const scrollContainerRef = useRef(null);

  // Lọc bỏ sản phẩm trùng lặp
  const uniqueRecommendations = useMemo(() => {
    const seen = new Set();
    return (displayProducts || []).filter((product) => {
      if (seen.has(product.id)) {
        return false;
      }
      seen.add(product.id);
      return true;
    });
  }, [displayProducts]);

  // Hàm cuộn ngang khi nhấn nút trái/phải
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.offsetWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <div className="w-full mx-auto py-12">
        <h2 className="text-2xl font-bold text-center mb-6 uppercase">
          {t("product.detail.recommendations")}
        </h2>
        <div className="text-center py-8 text-gray-500">
          {t("product.detail.loading_recommendations")}
        </div>
      </div>
    );
  }

  if (fetchError) {
    console.error("Error loading recommendations:", fetchError);
    return null;
  }

  if (!uniqueRecommendations || uniqueRecommendations.length === 0) {
    return null;
  }

  return (
    <div className="w-full mx-auto py-12">
      <h2 className="text-2xl font-bold text-center mb-6 uppercase">
        {t("product.detail.recommendations")}
      </h2>
      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-black text-white shadow-md w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800 z-10"
          aria-label="Scroll Left"
        >
          <ChevronLeft size={24} />
        </button>
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-2"
        >
          {uniqueRecommendations.map((product) => (
            <div
              key={product.id}
              className="snap-start px-2 flex-shrink-0 w-[280px]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-black text-white shadow-md w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800 z-10"
          aria-label="Scroll Right"
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}
