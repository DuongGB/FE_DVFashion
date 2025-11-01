import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useProduct } from "../hooks/useProduct";
import { useTranslation } from "react-i18next";
import { usePublicCategories } from "../hooks/useCategory";
import ProductCard from "../components/common/ProductCard";
import Pagination from "../components/common/Pagination";
import { decodeId, encodeId } from "../utils/encodeId";

export default function CategoryProductPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "VI";

  const { products = [], isLoading: loadingProducts } = useProduct(lang);
  const { categories = [], isLoading: loadingCategories } =
    usePublicCategories(lang);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialCategoryRaw = params.get("category") || "";
  const initialCategory = (() => {
    const decoded = decodeId(initialCategoryRaw);
    return decoded === null ? initialCategoryRaw : decoded;
  })();

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const raw = p.get("category") || "";
    const decoded = decodeId(raw);
    setSelectedCategory(decoded === null ? raw : decoded);
    setCurrentPage(1);
  }, [location.search]);

  useEffect(() => {
    // Lọc sản phẩm theo category
    // Category param có thể là id (được encode) hoặc categoryName
    const all = products || [];

    // Lọc chỉ product ACTIVE (nếu muốn show cả inactive thì bỏ điều kiện này)
    const onlyActive = all.filter((p) => !p.status || p.status === "ACTIVE");

    if (!selectedCategory) {
      setFilteredProducts(onlyActive);
      setCurrentPage(1);
      return;
    }

    // Nếu selectedCategory trùng id của một category, lấy tên để so sánh với product.categoryName
    const catById = categories.find(
      (c) => String(c.id) === String(selectedCategory)
    );
    const targetCategoryName = catById?.name || selectedCategory;

    const result = onlyActive.filter((prod) => {
      // match bằng categoryId nếu có
      if (
        prod.categoryId &&
        String(prod.categoryId) === String(selectedCategory)
      ) {
        return true;
      }
      // hoặc match bằng categoryName (case-insensitive)
      if (
        prod.categoryName &&
        String(prod.categoryName).toLowerCase() ===
          String(targetCategoryName).toLowerCase()
      ) {
        return true;
      }
      return false;
    });

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [products, selectedCategory, categories]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const currentCategoryObj = categories.find((c) => {
    if (String(c.id) === String(selectedCategory)) return true;
    if (
      c.name &&
      String(c.name).toLowerCase() === String(selectedCategory).toLowerCase()
    )
      return true;
    if (initialCategoryRaw && encodeId(c.id) === initialCategoryRaw)
      return true;
    return false;
  });

  const currentCategoryName =
    currentCategoryObj?.name ||
    (selectedCategory ? selectedCategory : t("category.all", "Tất cả"));

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <h1 className="text-2xl font-bold mb-4">
        {t("category.products_title", { name: currentCategoryName }) ||
          currentCategoryName}
      </h1>

      {(loadingProducts || loadingCategories) && (
        <div className="text-gray-500 mb-4">
          {t("common.loading", "Đang tải...")}
        </div>
      )}

      {paginatedProducts.length > 0 ? (
        <div className="grid grid-cols-5 gap-6">
          {paginatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-gray-500 mt-8">
          {t("category.no_products", "Không có sản phẩm trong danh mục này")}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
