import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useProduct } from "../hooks/useProduct";
import { useTranslation } from "react-i18next";
import { usePublicCategories } from "../hooks/useCategory";
import ProductCard from "../components/common/ProductCard";
import Pagination from "../components/common/Pagination";

export default function SearchProductPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "VI";
  const { products = [] } = useProduct(lang);
  const { categories = [] } = usePublicCategories(lang);

  // Lấy từ khóa từ query param
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialKeyword = params.get("q") || "";

  const [searchInput, setSearchInput] = useState(initialKeyword);
  const [search, setSearch] = useState(initialKeyword);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 20;

  // Cập nhật khi query param thay đổi
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const keyword = params.get("q") || "";
    setSearchInput(keyword);
    setSearch(keyword);
    setCurrentPage(1); // Reset về trang đầu khi search mới
  }, [location.search]);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredProducts([]);
      return;
    }
    const keyword = search.trim().toLowerCase();
    setFilteredProducts(
      products.filter(
        (p) =>
          (p.name?.toLowerCase().includes(keyword) ||
            p.brandName?.toLowerCase().includes(keyword)) &&
          (selectedCategory === "" ||
            String(p.categoryId) === String(selectedCategory))
      )
    );
    setCurrentPage(1); // Reset về trang đầu khi filter mới
  }, [search, products, selectedCategory]);

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {t("search.result_title", "Sản phẩm")}
      </h1>
      <div className="flex gap-4 mb-8">
        <input
          type="text"
          className="border rounded-full px-6 py-3 w-[300px] text-lg"
          placeholder={t("header.search_placeholder")}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") setSearch(searchInput);
          }}
        />
        {/* Bộ lọc */}
        {/* <select
          className="border rounded-full px-4 py-3 text-lg"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">
            {t("search.all_categories", "Tất cả danh mục")}
          </option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select> */}
      </div>
      <div className="font-bold text-lg mb-4">
        {t("search.result_title", "Kết quả")}
      </div>

      {/* Hiển thị sản phẩm */}
      {paginatedProducts.length > 0 ? (
        <div className="grid grid-cols-5 gap-6">
          {paginatedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-gray-500 mt-8">
          {t("search.no_result", "Không tìm thấy sản phẩm phù hợp")}
        </div>
      )}

      {/* Phân trang */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
