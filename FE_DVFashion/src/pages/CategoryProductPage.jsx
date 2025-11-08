import { useState, useEffect, useMemo, useRef } from "react";
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
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const prevCategoryIdRef = useRef(null);

  // Sync selectedCategory từ URL
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const raw = p.get("category") || "";
    const decoded = decodeId(raw);
    const next = decoded === null ? raw : decoded;
    setSelectedCategory(next);
  }, [location.search]);

  // Resolve numeric id
  const selectedCategoryId = useMemo(() => {
    if (!selectedCategory) return null;
    const byId = categories.find(
      (c) => String(c.id) === String(selectedCategory)
    );
    if (byId) return byId.id;
    const byEncoded = categories.find(
      (c) => initialCategoryRaw && encodeId(c.id) === initialCategoryRaw
    );
    if (byEncoded) return byEncoded.id;
    if (/^\d+$/.test(String(selectedCategory))) return Number(selectedCategory);
    return null;
  }, [selectedCategory, categories, initialCategoryRaw]);

  // Fetch theo category (server paging)
  const {
    data: categoryPage = { content: [], totalElements: 0 },
    isLoading: loadingCategoryProducts,
  } = useProductsByCategoryPaging(
    selectedCategoryId,
    Math.max(0, currentPage - 1),
    pageSize,
    lang
  );

  // Reset page chỉ khi categoryId thực sự đổi
  useEffect(() => {
    if (prevCategoryIdRef.current !== selectedCategoryId) {
      setCurrentPage(1);
      prevCategoryIdRef.current = selectedCategoryId;
    }
  }, [selectedCategoryId]);

  // Tính filteredProducts với useMemo (không setState)
  const filteredProducts = useMemo(() => {
    const source = selectedCategoryId
      ? categoryPage.content || []
      : products || [];

    const onlyActive = source.filter((p) => !p.status || p.status === "ACTIVE");

    if (!selectedCategory) return onlyActive;

    if (selectedCategoryId) return onlyActive;

    const catById = categories.find(
      (c) => String(c.id) === String(selectedCategory)
    );
    const targetCategoryName = catById?.name || selectedCategory;

    return onlyActive.filter((prod) => {
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
  }, [
    products,
    categoryPage.content, // chỉ mảng content
    selectedCategory,
    selectedCategoryId,
    categories,
  ]);

  // Giữ currentPage hợp lệ với server paging
  useEffect(() => {
    if (!selectedCategoryId) return;
    const totalPagesCalc = Math.max(
      1,
      Math.ceil((categoryPage.totalElements || 0) / pageSize)
    );
    if (currentPage > totalPagesCalc) {
      setCurrentPage(totalPagesCalc);
    }
  }, [selectedCategoryId, categoryPage.totalElements, pageSize, currentPage]);

  const totalPages = selectedCategoryId
    ? Math.max(1, Math.ceil((categoryPage.totalElements || 0) / pageSize))
    : Math.max(1, Math.ceil(filteredProducts.length / pageSize));

  const paginatedProducts = selectedCategoryId
    ? filteredProducts
    : filteredProducts.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      );

  const currentCategoryName = useMemo(() => {
    if (!selectedCategory) return "";
    if (selectedCategoryId) {
      const c = categories.find(
        (cat) => String(cat.id) === String(selectedCategoryId)
      );
      if (c?.name) return c.name;
    }
    if (initialCategoryRaw) {
      const cEnc = categories.find(
        (cat) => encodeId(cat.id) === String(initialCategoryRaw)
      );
      if (cEnc?.name) return cEnc.name;
    }
    const cByIdString = categories.find(
      (cat) => String(cat.id) === String(selectedCategory)
    );
    if (cByIdString?.name) return cByIdString.name;
    const cByName = categories.find(
      (cat) =>
        cat.name &&
        String(cat.name).toLowerCase() ===
          String(selectedCategory).toLowerCase()
    );
    if (cByName?.name) return cByName.name;
    return String(selectedCategory);
  }, [selectedCategory, selectedCategoryId, categories, initialCategoryRaw]);

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
