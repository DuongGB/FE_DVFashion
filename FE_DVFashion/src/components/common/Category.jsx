import React from "react";

export default function Category({ category }) {
  const categories = [
    {
      id: 1,
      name: "ÁO THUN",
      image: "./src/assets/shirt.jpg",
    },
    {
      id: 2,
      name: "ÁO POLO",
      image: "./src/assets/t-shirt.jpg",
    },
    {
      id: 3,
      name: "QUẦN SHORT",
      image: "./src/assets/shirt.jpg",
    },
    {
      id: 4,
      name: "QUẦN LÓT",
      image: "./src/assets/t-shirt.jpg",
    },
    {
      id: 5,
      name: "ĐỒ BƠI",
      image: "./src/assets/shirt.jpg",
    },
    {
      id: 6,
      name: "PHỤ KIỆN",
      image: "./src/assets/t-shirt.jpg",
    },
  ];
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-10">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="text-center">
            {/* Khung Category */}
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-orange-400 to-red-600 p-4">
              {/* Hình ảnh */}
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-60 object-contain"
              />

              {/* Banner nhỏ ở dưới */}
              <div className="absolute bottom-0 left-0 right-0 bg-orange-500 text-white text-xs font-semibold py-1 flex justify-center gap-2">
                <span>↠ Tự do vươn mình ↞</span>
              </div>
            </div>

            {/* Tên Category */}
            <h3 className="mt-3 text-base font-bold">{cat.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}
