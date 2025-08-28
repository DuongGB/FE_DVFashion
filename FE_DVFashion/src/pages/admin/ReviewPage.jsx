import { useState, useEffect } from "react";
import { IconEye, IconTrash } from "@tabler/icons-react";
import { IconStarFilled } from "@tabler/icons-react";
import Pagination from "../../components/common/Pagination";

// Mock data cho bảng Review
const mockReviews = [
  {
    id: 1,
    user: { name: "Nguyễn Văn A", email: "a@email.com" },
    productVariant: { name: "Áo thun Nike", code: "SP001" },
    rating: 5,
    comment: "Sản phẩm rất tốt!",
    status: "COMPLETED",
    helpfulCount: 12,
    createdAt: "2024-06-01",
    updatedAt: "2024-06-02",
    images: [
      "https://via.placeholder.com/40x40?text=Img1",
      "https://via.placeholder.com/40x40?text=Img2",
    ],
  },
  {
    id: 2,
    user: { name: "Trần Thị B", email: "b@email.com" },
    productVariant: { name: "Quần Adidas", code: "SP002" },
    rating: 4,
    comment: "Chất lượng ổn, giao hàng nhanh.",
    status: "COMPLETED",
    helpfulCount: 5,
    createdAt: "2024-06-03",
    updatedAt: "2024-06-04",
    images: [],
  },
  {
    id: 3,
    user: { name: "Lê Văn C", email: "c@email.com" },
    productVariant: { name: "Giày Puma", code: "SP003" },
    rating: 2,
    comment: "Giày hơi chật, không vừa ý.",
    status: "REFUNDED",
    helpfulCount: 1,
    createdAt: "2024-06-05",
    updatedAt: "2024-06-06",
    images: ["https://via.placeholder.com/40x40?text=Img3"],
  },
  {
    id: 4,
    user: { name: "Phạm Thị D", email: "d@gmail.com" },
    productVariant: { name: "Áo khoác Zara", code: "SP004" },
    rating: 5,
    comment: "Rất hài lòng với sản phẩm này!",
    status: "COMPLETED",
    helpfulCount: 8,
    createdAt: "2024-06-07",
    updatedAt: "2024-06-08",
    images: [
      "https://via.placeholder.com/40x40?text=Img4",
      "https://via.placeholder.com/40x40?text=Img5",
    ],
  },
  {
    id: 5,
    user: { name: "Hoàng Văn E", email: "e@gmail.com" },
    productVariant: { name: "Túi xách Gucci", code: "SP005" },
    rating: 3,
    comment: "Chất lượng trung bình, không như mong đợi.",
    status: "PENDING",
    helpfulCount: 2,
    createdAt: "2024-06-09",
    updatedAt: "2024-06-10",
    images: [],
  },
  {
    id: 6,
    user: { name: "Đỗ Thị F", email: "f@gmail.com" },
    productVariant: { name: "Đồng hồ Rolex", code: "SP006" },
    rating: 4,
    comment: "Đồng hồ đẹp, nhưng giá hơi cao.",
    status: "COMPLETED",
    helpfulCount: 6,
    createdAt: "2024-06-11",
    updatedAt: "2024-06-12",
    images: ["https://via.placeholder.com/40x40?text=Img6"],
  },
  {
    id: 7,
    user: { name: "Vũ Văn G", email: "g@gmail.com" },
    productVariant: { name: "Giày thể thao New Balance", code: "SP007" },
    rating: 5,
    comment: "Rất thoải mái khi mang, sẽ mua lại.",
    status: "COMPLETED",
    helpfulCount: 10,
    createdAt: "2024-06-13",
    updatedAt: "2024-06-14",
    images: [
      "https://via.placeholder.com/40x40?text=Img7",
      "https://via.placeholder.com/40x40?text=Img8",
    ],
  },
  {
    id: 8,
    user: { name: "Lý Thị H", email: "h@gmail.com" },
    productVariant: { name: "Váy maxi H&M", code: "SP008" },
    rating: 2,
    comment: "Váy không đẹp như hình, chất liệu kém.",
    status: "REFUNDED",
    helpfulCount: 0,
    createdAt: "2024-06-15",
    updatedAt: "2024-06-16",
    images: ["https://via.placeholder.com/40x40?text=Img9"],
  },
  {
    id: 9,
    user: { name: "Trịnh Văn I", email: "i@gmail.com" },
    productVariant: { name: "Mũ lưỡi trai Nike", code: "SP009" },
    rating: 4,
    comment: "Mũ đẹp, đội rất vừa vặn.",
    status: "COMPLETED",
    helpfulCount: 4,
    createdAt: "2024-06-17",
    updatedAt: "2024-06-18",
    images: [],
  },
  {
    id: 10,
    user: { name: "Phan Thị K", email: "k@gmail.com" },
    productVariant: { name: "Kính mát Ray-Ban", code: "SP010" },
    rating: 5,
    comment: "Kính rất sang trọng và chất lượng.",
    status: "COMPLETED",
    helpfulCount: 9,
    createdAt: "2024-06-19",
    updatedAt: "2024-06-20",
    images: ["https://via.placeholder.com/40x40?text=Img10"],
  },
  {
    id: 11,
    user: { name: "Quách Văn L", email: "l@gmail.com" },
    productVariant: { name: "Áo sơ mi Levi's", code: "SP011" },
    rating: 3,
    comment: "Áo hơi nhăn, cần ủi kỹ.",
    status: "PENDING",
    helpfulCount: 1,
    createdAt: "2024-06-21",
    updatedAt: "2024-06-22",
    images: [],
  },
];

const statusColors = {
  PENDING: "bg-yellow-500",
  COMPLETED: "bg-green-500",
  FAILED: "bg-red-500",
  REFUNDED: "bg-blue-500",
};

export default function ReviewPage() {
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    // Giả lập fetch API
    setReviews(mockReviews);
  }, []);

  // Lọc theo tên user hoặc tên sản phẩm
  const filteredReviews = reviews.filter(
    (review) =>
      review.user.name.toLowerCase().includes(search.toLowerCase()) ||
      review.productVariant.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredReviews.length / pageSize);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Quản lý bài nhận xét</h1>
      <div className="flex justify-between mb-4 items-center">
        <div className="flex gap-4 w-2/3">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên khách hoặc sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-4 py-2 w-2/3"
          />
        </div>
      </div>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-400">
              <th className="p-3">ID</th>
              <th className="p-3">Khách hàng</th>
              <th className="p-3">Sản phẩm</th>
              <th className="p-3">Đánh giá</th>
              <th className="p-3">Bình luận</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Số lượng</th>
              <th className="p-3">Ngày tạo</th>
              <th className="p-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedReviews.length > 0 ? (
              paginatedReviews.map((review) => (
                <tr key={review.id} className="border-b hover:bg-gray-300">
                  <td className="p-3">{review.id}</td>
                  <td className="p-3 font-semibold">{review.user.name}</td>
                  <td className="p-3">{review.productVariant.name}</td>
                  <td className="p-3">
                    {review.rating}
                    <IconStarFilled className="inline-block text-yellow-400 ml-2" />
                  </td>
                  <td className="p-3">{review.comment}</td>
                  <td className="p-3">
                    <span
                      className={`${
                        statusColors[review.status] || "bg-gray-400"
                      } text-white px-2 py-1 rounded text-xs`}
                    >
                      {review.status}
                    </span>
                  </td>
                  <td className="p-3">{review.helpfulCount}</td>
                  <td className="p-3">{review.createdAt}</td>
                  <td className="p-3">
                    <button className="text-blue-600 hover:text-blue-800 mr-4 cursor-pointer">
                      <IconEye className="inline-block mr-1" />
                      Xem
                    </button>
                    <button className="text-red-600 hover:text-red-800 cursor-pointer">
                      <IconTrash className="inline-block mr-1" />
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="text-center text-gray-500 p-4">
                  Không có bài nhận xét nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalItems={filteredReviews.length}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
}
