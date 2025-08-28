import { useState, useEffect } from "react";
import Pagination from "../../components/common/Pagination";
import { IconEye, IconEdit } from "@tabler/icons-react";
import ProductDetailModal from "../../components/ui/product/ProductDetailModal";

const mockProducts = [
  {
    id: 1,
    code: "SP001",
    name: "Áo Thun Nam",
    description: "Áo thun cotton thoáng mát",
    price: 150000,
    sale_price: 120000,
    on_sale: true,
    review_count: 12,
    status: "active",
    created_at: "2024-04-01",
    updated_at: "2024-04-10",
    brand_id: 1,
    category_id: 2,
  },
  {
    id: 2,
    code: "SP002",
    name: "Quần Jeans",
    description: "Quần jeans nam cao cấp",
    price: 350000,
    sale_price: 350000,
    on_sale: false,
    review_count: 8,
    status: "active",
    created_at: "2024-04-02",
    updated_at: "2024-04-11",
    brand_id: 2,
    category_id: 3,
  },
  {
    id: 3,
    code: "SP001",
    name: "Áo Thun Nam",
    description: "Áo thun cotton thoáng mát",
    price: 150000,
    sale_price: 120000,
    on_sale: true,
    review_count: 12,
    status: "active",
    created_at: "2024-04-01",
    updated_at: "2024-04-10",
    brand_id: 1,
    category_id: 2,
  },
  {
    id: 4,
    code: "SP002",
    name: "Quần Jeans",
    description: "Quần jeans nam cao cấp",
    price: 350000,
    sale_price: 350000,
    on_sale: false,
    review_count: 8,
    status: "active",
    created_at: "2024-04-02",
    updated_at: "2024-04-11",
    brand_id: 2,
    category_id: 3,
  },
  {
    id: 5,
    code: "SP001",
    name: "Áo Thun Nam",
    description: "Áo thun cotton thoáng mát",
    price: 150000,
    sale_price: 120000,
    on_sale: true,
    review_count: 12,
    status: "active",
    created_at: "2024-04-01",
    updated_at: "2024-04-10",
    brand_id: 1,
    category_id: 2,
  },
  {
    id: 6,
    code: "SP002",
    name: "Quần Jeans",
    description: "Quần jeans nam cao cấp",
    price: 350000,
    sale_price: 350000,
    on_sale: false,
    review_count: 8,
    status: "active",
    created_at: "2024-04-02",
    updated_at: "2024-04-11",
    brand_id: 2,
    category_id: 3,
  },
  {
    id: 7,
    code: "SP001",
    name: "Áo Thun Nam",
    description: "Áo thun cotton thoáng mát",
    price: 150000,
    sale_price: 120000,
    on_sale: true,
    review_count: 12,
    status: "active",
    created_at: "2024-04-01",
    updated_at: "2024-04-10",
    brand_id: 1,
    category_id: 2,
  },
  {
    id: 8,
    code: "SP002",
    name: "Quần Jeans",
    description: "Quần jeans nam cao cấp",
    price: 350000,
    sale_price: 350000,
    on_sale: false,
    review_count: 8,
    status: "active",
    created_at: "2024-04-02",
    updated_at: "2024-04-11",
    brand_id: 2,
    category_id: 3,
  },
  {
    id: 9,
    code: "SP001",
    name: "Áo Thun Nam",
    description: "Áo thun cotton thoáng mát",
    price: 150000,
    sale_price: 120000,
    on_sale: true,
    review_count: 12,
    status: "active",
    created_at: "2024-04-01",
    updated_at: "2024-04-10",
    brand_id: 1,
    category_id: 2,
  },
  {
    id: 10,
    code: "SP002",
    name: "Quần Jeans",
    description: "Quần jeans nam cao cấp",
    price: 350000,
    sale_price: 350000,
    on_sale: false,
    review_count: 8,
    status: "active",
    created_at: "2024-04-02",
    updated_at: "2024-04-11",
    brand_id: 2,
    category_id: 3,
  },
  {
    id: 11,
    code: "SP001",
    name: "Áo Thun Nam",
    description: "Áo thun cotton thoáng mát",
    price: 150000,
    sale_price: 120000,
    on_sale: true,
    review_count: 12,
    status: "active",
    created_at: "2024-04-01",
    updated_at: "2024-04-10",
    brand_id: 1,
    category_id: 2,
  },
  {
    id: 12,
    code: "SP002",
    name: "Quần Jeans",
    description: "Quần jeans nam cao cấp",
    price: 350000,
    sale_price: 350000,
    on_sale: false,
    review_count: 8,
    status: "active",
    created_at: "2024-04-02",
    updated_at: "2024-04-11",
    brand_id: 2,
    category_id: 3,
  },
];

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    // Giả lập fetch API
    setProducts(mockProducts);
  }, []);

  // Lọc sản phẩm theo tên hoặc mã
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Quản lý sản phẩm</h1>
      <div className="flex justify-between mb-4 items-center">
        <div className="flex gap-4 w-2/3">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-4 py-2 w-2/3"
          />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
          + Tạo sản phẩm
        </button>
      </div>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-400">
              <th className="p-3">ID</th>
              <th className="p-3">Mã SP</th>
              <th className="p-3">Tên</th>
              <th className="p-3">Mô tả</th>
              <th className="p-3">Giá</th>
              <th className="p-3">Giá KM</th>
              <th className="p-3">Đang Sale</th>
              <th className="p-3">Đánh giá</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Ngày tạo</th>
              <th className="p-3">Ngày cập nhật</th>
              <th className="p-3">Brand</th>
              <th className="p-3">Category</th>
              <th className="p-3">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-300">
                  <td className="p-3">{p.id}</td>
                  <td className="p-3">{p.code}</td>
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.description}</td>
                  <td className="p-3">{p.price.toLocaleString()} VND</td>
                  <td className="p-3">{p.sale_price.toLocaleString()} VND</td>
                  <td className="p-3">
                    {p.on_sale ? (
                      <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                        SALE
                      </span>
                    ) : (
                      <span className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs">
                        NO
                      </span>
                    )}
                  </td>
                  <td className="p-3">{p.review_count}</td>
                  <td className="p-3">{p.status}</td>
                  <td className="p-3">{p.created_at}</td>
                  <td className="p-3">{p.updated_at}</td>
                  <td className="p-3">{p.brand_id}</td>
                  <td className="p-3">{p.category_id}</td>
                  <td className="p-3 ">
                    <button
                      className="text-blue-600 hover:text-blue-800 cursor-pointer"
                      onClick={() => setSelectedProduct(p)}
                    >
                      <IconEye className="inline-block mr-1" />
                    </button>
                    <button className="text-yellow-600 hover:text-yellow-800 cursor-pointer">
                      <IconEdit className="inline-block mr-1" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={13} className="text-center py-6 text-gray-500">
                  Không có sản phẩm nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(page) => setCurrentPage(page)}
      />
      <ProductDetailModal
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
