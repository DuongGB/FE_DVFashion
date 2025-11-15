import React, { useState } from "react";
import { useCategory } from "../../hooks/useCategory";
import { useNavigate } from "react-router-dom";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { encodeId } from "../../utils/encodeId";

export default function Category() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const {
    categories = [],
    isLoading,
    error,
  } = useCategory({
    lang: i18n.language || "VI",
    active: true,
    size: 20,
  });

  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;

  const activeCategories = categories?.filter((cat) => cat.active) || [];
  const paginatedCategories = activeCategories.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handleNextPage = () => {
    if ((currentPage + 1) * itemsPerPage < activeCategories.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleCategoryClick = (category) => {
    navigate(`/products?category=${encodeId(category.id)}`);
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="text-center">
              <div className="relative rounded-2xl overflow-hidden bg-gray-200 animate-pulse p-4">
                <div className="w-full h-60 bg-gray-300 rounded"></div>
                <div className="absolute bottom-0 left-0 right-0 bg-gray-400 h-6"></div>
              </div>
              <div className="mt-3 h-4 bg-gray-300 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-10">
        <div className="text-center text-red-500">
          <p>{t("category.error_loading")}</p>
        </div>
      </div>
    );
  }

  if (!activeCategories.length) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-10">
        <div className="text-center text-gray-500">
          <p>{t("category.no_categories")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-10 relative">
      {/* Danh sách danh mục */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {paginatedCategories.map((cat) => (
          <div key={cat.id} className="text-center">
            <div
              className="relative rounded-2xl overflow-hidden bg-gray-100 p-4 cursor-pointer hover:from-orange-500 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
              onClick={() => handleCategoryClick(cat)}
            >
              <div className="w-full h-60 flex items-center justify-center">
                {cat.imageUrl || cat.image ? (
                  <img
                    src={cat.imageUrl || cat.image}
                    alt={cat.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className={`${
                    cat.imageUrl || cat.image ? "hidden" : "flex"
                  } w-full h-full items-center justify-center bg-white bg-opacity-20 rounded-lg`}
                >
                  <div className="text-white text-center">
                    <div className="text-4xl mb-2">📦</div>
                    <p className="text-sm font-medium">{cat.name}</p>
                  </div>
                </div>
              </div>
            </div>
            <h3 className="mt-3 text-base font-bold text-gray-800 hover:text-orange-600 transition-colors">
              {cat.name}
            </h3>
          </div>
        ))}
      </div>

      {/* Nút điều hướng */}
      <button
        onClick={handlePreviousPage}
        disabled={currentPage === 0}
        className={`absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-90 text-white p-1 rounded-full shadow-lg cursor-pointer ${
          currentPage === 0
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-gray-900"
        }`}
      >
        <IconChevronLeft size={16} />
      </button>
      <button
        onClick={handleNextPage}
        disabled={(currentPage + 1) * itemsPerPage >= activeCategories.length}
        className={`absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-90 text-white p-1 rounded-full shadow-lg cursor-pointer ${
          (currentPage + 1) * itemsPerPage >= activeCategories.length
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-gray-900"
        }`}
      >
        <IconChevronRight size={16} />
      </button>
    </div>
  );
}
