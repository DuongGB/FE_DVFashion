import { useState, useEffect } from "react";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import Pagination from "../../components/common/Pagination";

// Mock data theo cấu trúc bảng brands
const mockBrands = [
  {
    id: 1,
    active: true,
    code: "BR001",
    name: "Nike",
    description: "Thương hiệu thể thao nổi tiếng",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg",
  },
  {
    id: 2,
    active: false,
    code: "BR002",
    name: "Adidas",
    description: "Thương hiệu thời trang thể thao",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg",
  },
  {
    id: 3,
    active: true,
    code: "BR003",
    name: "Gucci",
    description: "Thương hiệu thời trang cao cấp",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/9b/Gucci_logo.png",
  },
  {
    id: 4,
    active: true,
    code: "BR004",
    name: "Zara",
    description: "Thời trang nhanh",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Zara_Logo.svg",
  },
  {
    id: 5,
    active: false,
    code: "BR005",
    name: "Uniqlo",
    description: "Thời trang Nhật Bản",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/UNIQLO_logo.svg/772px-UNIQLO_logo.svg.png",
  },
  {
    id: 6,
    active: true,
    code: "BR006",
    name: "H&M",
    description: "Thời trang nhanh toàn cầu",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/53/H%26M-Logo.svg",
  },
  {
    id: 7,
    active: true,
    code: "BR007",
    name: "Louis Vuitton",
    description: "Thương hiệu xa xỉ",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/76/Louis_Vuitton_logo_and_wordmark.svg",
  },
  {
    id: 8,
    active: false,
    code: "BR008",
    name: "Puma",
    description: "Thương hiệu thể thao và thời trang",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIYZoN-v60qelJBrnr9iXZPNLjfta92YHTkA&s",
  },
  {
    id: 9,
    active: true,
    code: "BR009",
    name: "Reebok",
    description: "Thương hiệu thể thao và giày dép",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsjNwYqUfsd2OhUfcQo0XSEollFpf-0W1HlA&s",
  },
  {
    id: 10,
    active: true,
    code: "BR010",
    name: "The North Face",
    description: "Thời trang và thiết bị ngoài trời",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/e1/The_North_Face.png",
  },
  {
    id: 11,
    active: false,
    code: "BR011",
    name: "Under Armour",
    description: "Thương hiệu thể thao và đồ tập luyện",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Under_armour_logo.svg",
  },
  {
    id: 12,
    active: true,
    code: "BR012",
    name: "New Balance",
    description: "Thương hiệu giày dép và thể thao",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/New_Balance_logo.svg/2560px-New_Balance_logo.svg.png",
  },
  {
    id: 13,
    active: true,
    code: "BR013",
    name: "Vans",
    description: "Thương hiệu giày dép và thời trang đường phố",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/4b/Logomarca_da_VANS.png",
  },
];

export default function BrandPage() {
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    // Giả lập fetch API
    setBrands(mockBrands);
  }, []);

  // Lọc theo tên, code hoặc id
  const filteredBrands = brands.filter(
    (brand) =>
      brand.name.toLowerCase().includes(search.toLowerCase()) ||
      brand.code.toLowerCase().includes(search.toLowerCase()) ||
      brand.id.toString().includes(search)
  );

  const totalPages = Math.ceil(filteredBrands.length / pageSize);
  const paginatedBrands = filteredBrands.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Quản lý thương hiệu</h1>
      <div className="flex justify-between mb-4 items-center">
        <div className="flex gap-4 w-2/3">
          <input
            type="text"
            placeholder="Tìm kiếm thương hiệu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-4 py-2 w-2/3"
          />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          + Tạo thương hiệu
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3">ID</th>
              <th className="p-3">Tên</th>
              <th className="p-3">Code</th>
              <th className="p-3">Logo</th>
              <th className="p-3">Mô tả</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedBrands.length > 0 ? (
              paginatedBrands.map((brand) => (
                <tr key={brand.id} className="border-b hover:bg-gray-300">
                  <td className="p-3">{brand.id}</td>
                  <td className="p-3 font-semibold">{brand.name}</td>
                  <td className="p-3">{brand.code}</td>
                  <td className="p-3">
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="h-8 w-auto object-contain"
                    />
                  </td>
                  <td className="p-3">{brand.description}</td>
                  <td className="p-3">
                    {brand.active ? (
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
                <td colSpan={7} className="text-center text-gray-500 p-4">
                  Không có thương hiệu nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={filteredBrands.length}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
}
