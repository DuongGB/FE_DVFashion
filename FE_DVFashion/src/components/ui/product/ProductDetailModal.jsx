export default function ProductDetailModal({ product, open, onClose }) {
  if (!open || !product) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
        <button
          className="absolute top-4 right-4 bg-black text-white rounded-full w-8 h-8 flex items-center justify-center text-xl cursor-pointer"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4">Chi tiết sản phẩm</h2>
        <div className="space-y-2">
          <div>
            <strong>ID:</strong> {product.id}
          </div>
          <div>
            <strong>Mã SP:</strong> {product.code}
          </div>
          <div>
            <strong>Tên:</strong> {product.name}
          </div>
          <div>
            <strong>Mô tả:</strong> {product.description}
          </div>
          <div>
            <strong>Giá:</strong> {product.price.toLocaleString()} VND
          </div>
          <div>
            <strong>Giá KM:</strong> {product.sale_price.toLocaleString()} VND
          </div>
          <div>
            <strong>Đang Sale:</strong>{" "}
            {product.on_sale ? (
              <span className="text-green-600 font-semibold">SALE</span>
            ) : (
              <span className="text-gray-500">NO</span>
            )}
          </div>
          <div>
            <strong>Đánh giá:</strong> {product.review_count}
          </div>
          <div>
            <strong>Trạng thái:</strong> {product.status}
          </div>
          <div>
            <strong>Ngày tạo:</strong> {product.created_at}
          </div>
          <div>
            <strong>Ngày cập nhật:</strong> {product.updated_at}
          </div>
          <div>
            <strong>Brand:</strong> {product.brand_id}
          </div>
          <div>
            <strong>Category:</strong> {product.category_id}
          </div>
        </div>
      </div>
    </div>
  );
}
