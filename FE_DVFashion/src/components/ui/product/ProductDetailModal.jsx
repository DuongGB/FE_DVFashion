import React from "react";
import {
  IconX,
  IconPackage,
  IconTag,
  IconCurrencyDollar,
  IconStar,
  IconCalendar,
  IconEye,
  IconDiscount,
  IconList,
  IconPhoto,
  IconShoppingBag,
} from "@tabler/icons-react";

export default function ProductDetailModal({ product, open, onClose }) {
  if (!open || !product) return null;

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Không có";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " ₫";
  };

  // Get status color and text
  const getStatusInfo = (status) => {
    switch (status) {
      case "ACTIVE":
        return { color: "bg-green-100 text-green-800", text: "Hoạt động" };
      case "INACTIVE":
        return { color: "bg-red-100 text-red-800", text: "Không hoạt động" };
      case "OUT_OF_STOCK":
        return { color: "bg-yellow-100 text-yellow-800", text: "Hết hàng" };
      case "DISCONTINUED":
        return { color: "bg-gray-100 text-gray-800", text: "Ngừng bán" };
      default:
        return { color: "bg-gray-100 text-gray-800", text: status };
    }
  };

  const statusInfo = getStatusInfo(product.status);

  // Calculate total stock from variants
  const totalStock =
    product.variants?.reduce(
      (sum, variant) => sum + (variant.stock_quantity || 0),
      0
    ) || 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <IconPackage size={24} className="text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">
              Chi tiết sản phẩm
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <IconX size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Product Images and Basic Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Images */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                  <IconPhoto size={18} />
                  Hình ảnh sản phẩm
                </h3>
                {product.images && product.images.length > 0 ? (
                  <div className="space-y-3">
                    <img
                      src={product.images[0].url}
                      alt={product.images[0].alt}
                      className="w-full h-full object-cover rounded-lg border"
                    />
                    {product.images.length > 1 && (
                      <div className="grid grid-cols-3 gap-2">
                        {product.images.slice(1, 4).map((image, index) => (
                          <img
                            key={index}
                            src={image.url}
                            alt={image.alt}
                            className="w-full h-16 object-cover rounded border"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-400">Không có hình ảnh</span>
                  </div>
                )}
              </div>
            </div>

            {/* Basic Information */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                  <IconTag size={18} />
                  Thông tin cơ bản
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <strong className="text-gray-600">ID:</strong>
                    <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono text-sm">
                      #{product.id}
                    </span>
                  </div>
                  <div>
                    <strong className="text-gray-600">Mã sản phẩm:</strong>
                    <span className="ml-2 bg-gray-100 text-gray-800 px-2 py-1 rounded font-mono text-sm">
                      {product.code}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <strong className="text-gray-600">Tên sản phẩm:</strong>
                    <span className="ml-2 font-medium text-lg">
                      {product.name}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <strong className="text-gray-600">Mô tả:</strong>
                    <p className="ml-2 mt-1 text-gray-700 leading-relaxed">
                      {product.description || "Không có mô tả"}
                    </p>
                  </div>
                  <div>
                    <strong className="text-gray-600">Thương hiệu:</strong>
                    <span className="ml-2 bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                      {product.brand?.name || "N/A"}
                    </span>
                  </div>
                  <div>
                    <strong className="text-gray-600">Danh mục:</strong>
                    <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      {product.category?.name || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price and Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                  <IconCurrencyDollar size={18} />
                  Giá và trạng thái
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div>
                      <strong className="text-gray-600">Giá gốc:</strong>
                      <span className="ml-2 text-lg font-bold text-gray-800">
                        {formatCurrency(product.price)}
                      </span>
                    </div>
                    <div>
                      <strong className="text-gray-600">Giá khuyến mãi:</strong>
                      <span className="ml-2 text-lg font-bold text-green-600">
                        {formatCurrency(product.sale_price)}
                      </span>
                    </div>
                    {product.on_sale && (
                      <div className="flex items-center gap-2">
                        <IconDiscount size={16} className="text-red-500" />
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                          ĐANG KHUYẾN MÃI
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <strong className="text-gray-600">Trạng thái:</strong>
                      <span
                        className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}
                      >
                        {statusInfo.text}
                      </span>
                    </div>
                    <div>
                      <strong className="text-gray-600">Tổng tồn kho:</strong>
                      <span className="ml-2 text-blue-600 font-bold">
                        {totalStock}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconStar size={16} className="text-yellow-500" />
                      <span className="text-gray-600">Đánh giá: </span>
                      <span className="font-medium">
                        {product.review_count} lượt
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                <IconShoppingBag size={18} />
                Biến thể sản phẩm ({product.variants.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-2 text-left">Tên biến thể</th>
                      <th className="p-2 text-left">SKU</th>
                      <th className="p-2 text-left">Thuộc tính</th>
                      <th className="p-2 text-right">Giá</th>
                      <th className="p-2 text-right">Tồn kho</th>
                      <th className="p-2 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map((variant) => (
                      <tr key={variant.id} className="border-b border-gray-200">
                        <td className="p-2">{variant.name}</td>
                        <td className="p-2 font-mono text-xs">{variant.sku}</td>
                        <td className="p-2">
                          {variant.attributes?.map((attr, index) => (
                            <span
                              key={index}
                              className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs mr-1 mb-1"
                            >
                              {attr.name}: {attr.value}
                            </span>
                          ))}
                        </td>
                        <td className="p-2 text-right font-medium">
                          {formatCurrency(variant.price || variant.sale_price)}
                        </td>
                        <td className="p-2 text-right">
                          <span
                            className={`font-bold ${
                              (variant.stock_quantity || 0) > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {variant.stock_quantity || 0}
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              variant.status === "ACTIVE"
                                ? "bg-green-100 text-green-800"
                                : variant.status === "OUT_OF_STOCK"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {variant.status === "ACTIVE"
                              ? "Hoạt động"
                              : variant.status === "OUT_OF_STOCK"
                              ? "Hết hàng"
                              : "Không hoạt động"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Specifications */}
          {product.specifications && product.specifications.length > 0 && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                <IconList size={18} />
                Thông số kỹ thuật
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {product.specifications.map((spec, index) => (
                  <div key={index} className="bg-white p-3 rounded border">
                    <div className="flex justify-between">
                      <strong className="text-gray-600">{spec.key}:</strong>
                      <span className="text-gray-800 ml-2">{spec.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
              <IconCalendar size={18} />
              Thông tin thời gian
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong className="text-gray-600">Ngày tạo:</strong>
                <span className="ml-2 text-gray-800">
                  {formatDate(product.created_at)}
                </span>
              </div>
              <div>
                <strong className="text-gray-600">Cập nhật cuối:</strong>
                <span className="ml-2 text-gray-800">
                  {formatDate(product.updated_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
