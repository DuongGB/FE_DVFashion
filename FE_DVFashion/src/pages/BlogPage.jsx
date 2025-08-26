import React, { useState, useEffect } from "react";

const featuredPost = [
  {
    title: "DVFASHION 2024",
    desc: `Nhìn lại chặng đường 6 năm phát triển, tri ân sự ủng hộ của khách hàng, đối tác và hé lộ những kế hoạch đầy hứa hẹn cho năm mới, bao gồm ra mắt dòng sản phẩm thể thao DVFahsion Active cho cả nam và nữ, mở rộng kênh phân phối và tiến ra thị trường quốc tế.`,
    image: "./src/assets/feature_post.avif",
    subImages: [
      "./src/assets/shirt.jpg",
      "./src/assets/t-shirt.jpg",
      "./src/assets/shirt.jpg",
      "./src/assets/t-shirt.jpg",
    ],
  },
  {
    title: "DVFASHION 2025",
    desc: `Nhìn lại chặng đường 7 năm phát triển, tri ân sự ủng hộ của khách hàng, đối tác và hé lộ những kế hoạch đầy hứa hẹn cho năm mới, bao gồm ra mắt dòng sản phẩm thể thao DVFahsion Active cho cả nam và nữ, mở rộng kênh phân phối và tiến ra thị trường quốc tế.`,
    image: "./src/assets/feature_post_1.avif",
    subImages: [
      "./src/assets/shirt.jpg",
      "./src/assets/t-shirt.jpg",
      "./src/assets/shirt.jpg",
      "./src/assets/t-shirt.jpg",
    ],
  },
];

const mostViewed = [
  {
    image: "./src/assets/blog_1.avif",
    category: "Phối đồ",
    date: "21.05.2023",
    title: "Bí kíp phối đồ tập gym nam cực chất lại thoải mái cho chàng",
  },
  {
    image: "./src/assets/blog_2.jpg",
    category: "Kinh nghiệm hay",
    date: "05.10.2024",
    title: "Bí kíp tạo dáng chụp ảnh nam đẹp ngầu như mẫu nam Hàn Quốc",
  },
  {
    image: "./src/assets/blog_3.jpg",
    category: "Thương hiệu thời trang",
    date: "24.05.2024",
    title: "20 Local Brand Giá Rẻ mà CHẤT Được Giới Trẻ Săn Lùng",
  },
  {
    image: "./src/assets/blog_1.avif",
    category: "Phối đồ",
    date: "21.05.2023",
    title: "Bí kíp phối đồ tập gym nam cực chất lại thoải mái cho chàng",
  },
];

const dailyPosts = [
  {
    image: "./src/assets/dailyPost_1.jpg",
    title:
      "So sánh quần short thể thao nữ 2 lớp và 1 lớp chi tiết từ A đến Z & Cách chọn phù hợp nhất",
    category: "Tư vấn - Review Sản phẩm",
    date: "21.08.2025",
    desc: "Cùng DVFahsion phân tích ưu nhược điểm và so sánh quần short thể thao nữ 2 lớp và 1 lớp khác nhau như thế nào. Đâu là lựa chọn tối ưu khi tập luyện hay mặc thường ngày?",
  },
  {
    image: "./src/assets/dailyPost_2.avif",
    title: "Cách Quấn Băng Tay Boxing Chuẩn: Bảo Vệ Tay, Tối Ưu Lực Đấm",
    category: "Sức khỏe & Thể thao",
    date: "20.08.2025",
    desc: "Học cách quấn băng tay boxing chuẩn như chuyên gia sao cho đúng. DVFahsion hướng dẫn chi tiết từng bước quấn băng tay Boxing qua bài viết sau!",
  },
  {
    image: "./src/assets/dailyPost_3.avif",
    title: "Legging là gì? Toàn bộ sự thật & cẩm nang sử dụng từ A-Z",
    category: "Phong cách thời trang",
    date: "20.08.2025",
    desc: "Tìm hiểu legging là gì và mọi điều bạn cần biết. Cẩm nang này hướng dẫn bạn cách phân biệt, chọn legging phù hợp vóc dáng và các mẹo phối đồ tôn dáng nhất.",
  },
  {
    image: "./src/assets/dailyPost_1.jpg",
    title:
      "So sánh quần short thể thao nữ 2 lớp và 1 lớp chi tiết từ A đến Z & Cách chọn phù hợp nhất",
    category: "Tư vấn - Review Sản phẩm",
    date: "21.08.2025",
    desc: "Cùng DVFahsion phân tích ưu nhược điểm và so sánh quần short thể thao nữ 2 lớp và 1 lớp khác nhau như thế nào. Đâu là lựa chọn tối ưu khi tập luyện hay mặc thường ngày?",
  },
  {
    image: "./src/assets/dailyPost_2.avif",
    title: "Cách Quấn Băng Tay Boxing Chuẩn: Bảo Vệ Tay, Tối Ưu Lực Đấm",
    category: "Sức khỏe & Thể thao",
    date: "20.08.2025",
    desc: "Học cách quấn băng tay boxing chuẩn như chuyên gia sao cho đúng. DVFahsion hướng dẫn chi tiết từng bước quấn băng tay Boxing qua bài viết sau!",
  },
  {
    image: "./src/assets/dailyPost_3.avif",
    title: "Legging là gì? Toàn bộ sự thật & cẩm nang sử dụng từ A-Z",
    category: "Phong cách thời trang",
    date: "20.08.2025",
    desc: "Tìm hiểu legging là gì và mọi điều bạn cần biết. Cẩm nang này hướng dẫn bạn cách phân biệt, chọn legging phù hợp vóc dáng và các mẹo phối đồ tôn dáng nhất.",
  },
  {
    image: "./src/assets/dailyPost_1.jpg",
    title:
      "So sánh quần short thể thao nữ 2 lớp và 1 lớp chi tiết từ A đến Z & Cách chọn phù hợp nhất",
    category: "Tư vấn - Review Sản phẩm",
    date: "21.08.2025",
    desc: "Cùng DVFahsion phân tích ưu nhược điểm và so sánh quần short thể thao nữ 2 lớp và 1 lớp khác nhau như thế nào. Đâu là lựa chọn tối ưu khi tập luyện hay mặc thường ngày?",
  },
  {
    image: "./src/assets/dailyPost_2.avif",
    title: "Cách Quấn Băng Tay Boxing Chuẩn: Bảo Vệ Tay, Tối Ưu Lực Đấm",
    category: "Sức khỏe & Thể thao",
    date: "20.08.2025",
    desc: "Học cách quấn băng tay boxing chuẩn như chuyên gia sao cho đúng. DVFahsion hướng dẫn chi tiết từng bước quấn băng tay Boxing qua bài viết sau!",
  },
  {
    image: "./src/assets/dailyPost_3.avif",
    title: "Legging là gì? Toàn bộ sự thật & cẩm nang sử dụng từ A-Z",
    category: "Phong cách thời trang",
    date: "20.08.2025",
    desc: "Tìm hiểu legging là gì và mọi điều bạn cần biết. Cẩm nang này hướng dẫn bạn cách phân biệt, chọn legging phù hợp vóc dáng và các mẹo phối đồ tôn dáng nhất.",
  },
  {
    image: "./src/assets/dailyPost_1.jpg",
    title:
      "So sánh quần short thể thao nữ 2 lớp và 1 lớp chi tiết từ A đến Z & Cách chọn phù hợp nhất",
    category: "Tư vấn - Review Sản phẩm",
    date: "21.08.2025",
    desc: "Cùng DVFahsion phân tích ưu nhược điểm và so sánh quần short thể thao nữ 2 lớp và 1 lớp khác nhau như thế nào. Đâu là lựa chọn tối ưu khi tập luyện hay mặc thường ngày?",
  },
  {
    image: "./src/assets/dailyPost_2.avif",
    title: "Cách Quấn Băng Tay Boxing Chuẩn: Bảo Vệ Tay, Tối Ưu Lực Đấm",
    category: "Sức khỏe & Thể thao",
    date: "20.08.2025",
    desc: "Học cách quấn băng tay boxing chuẩn như chuyên gia sao cho đúng. DVFahsion hướng dẫn chi tiết từng bước quấn băng tay Boxing qua bài viết sau!",
  },
  {
    image: "./src/assets/dailyPost_3.avif",
    title: "Legging là gì? Toàn bộ sự thật & cẩm nang sử dụng từ A-Z",
    category: "Phong cách thời trang",
    date: "20.08.2025",
    desc: "Tìm hiểu legging là gì và mọi điều bạn cần biết. Cẩm nang này hướng dẫn bạn cách phân biệt, chọn legging phù hợp vóc dáng và các mẹo phối đồ tôn dáng nhất.",
  },
];

export default function BlogPage() {
  const [visibleCount, setVisibleCount] = useState(6);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredIndex]);

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 3);
  };

  const handlePrev = () => {
    setFade(false);
    setTimeout(() => {
      setFeaturedIndex((prev) =>
        prev === 0 ? featuredPost.length - 1 : prev - 1
      );
      setFade(true);
    }, 400);
  };

  const handleNext = () => {
    setFade(false);
    setTimeout(() => {
      setFeaturedIndex((prev) => (prev + 1) % featuredPost.length);
      setFade(true);
    }, 400);
  };
  return (
    <div className="font-sans px-8 py-4">
      {/* Banner */}
      <img
        className="w-full mb-6 rounded-xl"
        src="./src/assets/banner_blog.avif"
        alt="Blog Banner"
      />

      {/* Search & Category */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
        <input
          type="text"
          placeholder="Tìm kiếm bài viết..."
          className="border rounded-full px-4 py-2 w-full md:w-1/2"
        />
        <div className="flex gap-2">
          <button className="bg-gray-200 rounded-full px-6 py-2 font-semibold">
            Mặc đẹp
          </button>
          <button className="bg-gray-200 rounded-full px-6 py-2 font-semibold">
            Sống Chất
          </button>
          <button className="bg-gray-200 rounded-full px-6 py-2 font-semibold">
            DVFahsion có gì mới?
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-8 mx-auto overflow-hidden"
        style={{ maxWidth: "1200px", minHeight: "700px" }}
      >
        {/* Featured Post */}
        <div className="h-[600px]">
          <h2 className="text-3xl font-bold mb-4">Bài viết nổi bật</h2>
          <div className="border-b mb-4"></div>
          <div className="bg-white rounded-xl shadow p-4 flex flex-col items-center relative overflow-hidden group">
            {/* Indicator bar */}
            <div className="absolute top-2 left-0 w-full flex justify-center gap-2 z-10">
              {featuredPost.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 w-24 rounded-full transition-all duration-300 ${
                    idx === featuredIndex ? "bg-blue-600" : "bg-gray-300"
                  }`}
                ></div>
              ))}
            </div>
            {/* Slide content */}
            <div className="relative w-full mb-4">
              <img
                src={featuredPost[featuredIndex].image}
                alt="Featured"
                className={`w-full rounded-xl transition-opacity duration-400 min-h-[420px] ${
                  fade ? "opacity-100" : "opacity-50"
                }`}
              />
              {/* Navigation buttons - nằm trong ảnh, chỉ hiện khi hover */}
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-full w-10 h-10 flex items-center justify-center shadow transition-opacity duration-300 opacity-0 pointer-events-none group-hover:opacity-50 group-hover:pointer-events-auto z-10"
                aria-label="Previous"
              >
                <span className="text-2xl font-bold ">&#8592;</span>
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-full w-10 h-10 flex items-center justify-center shadow transition-opacity duration-300 opacity-0 pointer-events-none group-hover:opacity-50 group-hover:pointer-events-auto z-10"
                aria-label="Next"
              >
                <span className="text-2xl font-bold ">&#8594;</span>
              </button>
            </div>
            <div
              className={`text-lg font-semibold mb-2 line-clamp-1 transition-opacity duration-400 ${
                fade ? "opacity-100" : "opacity-50"
              }`}
            >
              {featuredPost[featuredIndex].title}
            </div>
            <div
              className={`text-gray-700 mb-4 line-clamp-3 transition-opacity duration-400 ${
                fade ? "opacity-100" : "opacity-50"
              }`}
            >
              {featuredPost[featuredIndex].desc}
            </div>
            <div className="flex gap-2 flex-wrap justify-center mb-4">
              {featuredPost[featuredIndex].subImages.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`sub${idx}`}
                  className={`w-24 h-16 object-cover rounded-lg transition-opacity duration-400 ${
                    fade ? "opacity-100" : "opacity-50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
        {/* Most Viewed */}
        <div className="h-[700px] overflow-hidden">
          <h2 className="text-3xl font-bold mb-4">Xem nhiều nhất</h2>
          <div className="border-b mb-4"></div>
          <div className="flex flex-col gap-4">
            {mostViewed.slice(0, 4).map((post, idx) => (
              <div
                key={idx}
                className="flex gap-4 items-center bg-white rounded-xl shadow p-2 h-[120px]"
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-28 h-30 object-cover rounded-lg"
                />
                <div className="flex flex-col">
                  <div className="text-xs text-gray-500 mb-1 line-clamp-1">
                    {post.category} | {post.date}
                  </div>
                  <div className="font-semibold line-clamp-2">{post.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Bài mới mỗi ngày */}
      <div className="mt-12">
        <div className="bg-blue-600 text-white text-2xl font-bold px-6 py-3 rounded-xl mb-6 w-fit">
          Bài mới mỗi ngày
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dailyPosts.slice(0, visibleCount).map((post, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow p-4">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-56 object-cover rounded-xl mb-4"
              />
              <div className="font-bold text-lg mb-2">{post.title}</div>
              <div className="text-sm text-gray-600 mb-1">
                {post.category} | {post.date}
              </div>
              <div className="text-gray-700 text-sm">{post.desc}</div>
            </div>
          ))}
        </div>
        {visibleCount < dailyPosts.length && (
          <div className="flex justify-center mt-6">
            <button
              onClick={handleShowMore}
              className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition"
            >
              Xem thêm
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
