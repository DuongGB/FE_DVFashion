import React from "react";
import { usePublicCategories } from "../../hooks/useCategory";
import { useNavigate } from "react-router-dom";

export default function Category({ language = "VI" }) {
  const navigate = useNavigate();
  const { categories, isLoading, error } = usePublicCategories(language);

  // Filter only active categories
  const activeCategories = categories?.filter((cat) => cat.active) || [];

  const handleCategoryClick = (category) => {
    // Navigate to products page with category filter
    navigate(`/products?category=${category.id}`);
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
          <p>Không thể tải danh mục. Vui lòng thử lại sau.</p>
        </div>
      </div>
    );
  }

  if (!activeCategories.length) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-10">
        <div className="text-center text-gray-500">
          <p>Không có danh mục nào để hiển thị.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-10">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="text-center">
            {/* Khung Category */}
            <div
              className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-orange-400 to-red-600 p-4 cursor-pointer hover:from-orange-500 hover:to-red-700 transition-all duration-300 transform hover:scale-105"
              onClick={() => handleCategoryClick(cat)}
            >
              {/* Hình ảnh */}
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

                {/* Fallback image */}
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

              {/* Banner nhỏ ở dưới */}
              <div className="absolute bottom-0 left-0 right-0 bg-orange-500 text-white text-xs font-semibold py-1 flex justify-center gap-2">
                <span>↠ Tự do vươn mình ↞</span>
              </div>
            </div>

            {/* Tên Category */}
            <h3 className="mt-3 text-base font-bold text-gray-800 hover:text-orange-600 transition-colors">
              {cat.name}
            </h3>

            {/* Description (optional) */}
            {cat.description && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {cat.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
