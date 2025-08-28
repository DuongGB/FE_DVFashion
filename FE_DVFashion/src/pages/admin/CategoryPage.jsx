import { useState, useEffect } from "react";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import Pagination from "../../components/common/Pagination";

const mockCategories = [
  { id: 1, active: true, name: "Áo" },
  { id: 2, active: false, name: "Quần" },
  { id: 3, active: true, name: "Váy" },
  { id: 4, active: true, name: "Giày" },
  { id: 5, active: false, name: "Phụ kiện" },
  { id: 6, active: true, name: "Đồ lót" },
  { id: 7, active: true, name: "Áo khoác" },
  { id: 8, active: false, name: "Đồ thể thao" },
  { id: 9, active: true, name: "Đồ bơi" },
  { id: 10, active: true, name: "Trang sức" },
  { id: 11, active: false, name: "Túi xách" },
  { id: 12, active: true, name: "Mũ nón" },
  { id: 13, active: true, name: "Kính mắt" },
  { id: 14, active: false, name: "Đồng hồ" },
  { id: 15, active: true, name: "Thắt lưng" },
];

export default function CategoryPage() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    // Giả lập fetch API
    setCategories(mockCategories);
  }, []);

  // Lọc theo id
  const filteredCategories = categories.filter((cat) =>
    cat.id.toString().includes(search)
  );

  const totalPages = Math.ceil(filteredCategories.length / pageSize);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Quản lý danh mục</h1>
      <div className="flex justify-between mb-4 items-center">
        <div className="flex gap-4 w-2/3">
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-4 py-2 w-2/3"
          />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          + Tạo danh mục
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3">ID</th>
              <th className="p-3">Tên danh mục</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCategories.length > 0 ? (
              paginatedCategories.map((cat) => (
                <tr key={cat.id} className="border-b hover:bg-gray-300">
                  <td className="p-3">{cat.id}</td>
                  <td className="p-3">{cat.name}</td>
                  <td className="p-3">
                    {cat.active ? (
                      <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                        Active
                      </span>
                    ) : (
                      <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <button className="text-yellow-600 hover:text-yellow-800 mr-4 cursor-pointer">
                      <IconEdit className="inline-block mr-1" />
                      Sửa
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
                <td colSpan={3} className="text-center text-gray-500 p-4">
                  Không có danh mục nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={filteredCategories.length}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
}
