import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useProduct, useProductsByCategoryPaging } from "../hooks/useProduct";
import { useTranslation } from "react-i18next";
import { usePublicCategories } from "../hooks/useCategory";
import ProductCard from "../components/common/ProductCard";
import Pagination from "../components/common/Pagination";
import { decodeId, encodeId } from "../utils/encodeId";

export default function CategoryProductPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "VI";

  // keep fetching all products as fallback when no category selected
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

  // derive numeric categoryId if possible (from selectedCategory, categories list or encoded param)
  const selectedCategoryId = (() => {
    if (!selectedCategory) return null;
    // match by raw id string
    const byId = categories.find(
      (c) => String(c.id) === String(selectedCategory)
    );
    if (byId) return byId.id;
    // match by encoded initial param
    const byEncoded = categories.find(
      (c) => initialCategoryRaw && encodeId(c.id) === initialCategoryRaw
    );
    if (byEncoded) return byEncoded.id;
    // numeric string fallback
    if (/^\d+$/.test(String(selectedCategory))) return Number(selectedCategory);
    return null;
  })();

  // server-side paging hook for category
  const {
    data: categoryPage = { content: [], totalElements: 0 },
    isLoading: loadingCategoryProducts,
  } = useProductsByCategoryPaging(
    selectedCategoryId,
    // backend pages are 0-based
    Math.max(0, currentPage - 1),
    pageSize,
    lang
  );

  useEffect(() => {
    // Use backend result when categoryId present, else use all products (client-side)
    const all = selectedCategoryId
      ? categoryPage.content || []
      : products || [];

    // filter only ACTIVE
    const onlyActive = (all || []).filter(
      (p) => !p.status || p.status === "ACTIVE"
    );

    if (!selectedCategory) {
      setFilteredProducts(onlyActive);
      setCurrentPage(1);
      return;
    }

    // If we used backend fetch by categoryId, data already paginated and filtered
    if (selectedCategoryId) {
      setFilteredProducts(onlyActive);
      // ensure current page valid when backend total changes
      const totalPages = Math.max(
        1,
        Math.ceil((categoryPage.totalElements || 0) / pageSize)
      );
      if (currentPage > totalPages) setCurrentPage(1);
      return;
    }

    // Fallback: selectedCategory may be category name or id string but not resolvable to numeric id -> client filter
    const catById = categories.find(
      (c) => String(c.id) === String(selectedCategory)
    );
    const targetCategoryName = catById?.name || selectedCategory;

    const result = onlyActive.filter((prod) => {
      if (
        prod.categoryId &&
        String(prod.categoryId) === String(selectedCategory)
      )
        return true;
      if (
        prod.categoryName &&
        String(prod.categoryName).toLowerCase() ===
          String(targetCategoryName).toLowerCase()
      )
        return true;
      return false;
    });

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [
    products,
    categoryPage,
    selectedCategory,
    categories,
    selectedCategoryId,
    currentPage,
    pageSize,
  ]);

  const totalPages = selectedCategoryId
    ? Math.max(1, Math.ceil((categoryPage.totalElements || 0) / pageSize))
    : Math.ceil(filteredProducts.length / pageSize);

  // when server-paged, filteredProducts already contains current page content
  const paginatedProducts = selectedCategoryId
    ? filteredProducts
    : filteredProducts.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      );
  const currentCategoryName = (() => {
    if (!selectedCategory) return "";
    // 1) nếu có numeric id -> lấy tên từ danh sách categories
    if (selectedCategoryId) {
      const c = categories.find(
        (cat) => String(cat.id) === String(selectedCategoryId)
      );
      if (c?.name) return c.name;
    }
    // 2) nếu param ban đầu là encoded id -> tìm theo encodeId
    if (initialCategoryRaw) {
      const cEnc = categories.find(
        (cat) => encodeId(cat.id) === String(initialCategoryRaw)
      );
      if (cEnc?.name) return cEnc.name;
    }
    // 3) thử match theo id string
    const cByIdString = categories.find(
      (cat) => String(cat.id) === String(selectedCategory)
    );
    if (cByIdString?.name) return cByIdString.name;
    // 4) thử match theo tên (case-insensitive)
    const cByName = categories.find(
      (cat) =>
        cat.name &&
        String(cat.name).toLowerCase() ===
          String(selectedCategory).toLowerCase()
    );
    if (cByName?.name) return cByName.name;
    // 5) fallback: trả về chính giá trị selectedCategory (có thể là tên)
    return String(selectedCategory);
  })();

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <h1 className="text-2xl font-bold mb-4">{t(currentCategoryName)}</h1>

      {(loadingProducts || loadingCategories || loadingCategoryProducts) && (
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
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}
    </div>
  );
}
