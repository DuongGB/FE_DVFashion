import {
  IconX,
  IconBrandAndroid,
  IconLanguage,
  IconTag,
  IconPackage,
} from "@tabler/icons-react";

export default function BrandDetailModal({ brand, open, onClose }) {
  if (!open || !brand) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <IconBrandAndroid size={24} className="text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">
              Chi tiết thương hiệu
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Brand Logo */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                  <IconBrandAndroid size={18} />
                  Logo thương hiệu
                </h3>
                <div className="border rounded-lg p-4 text-center bg-white">
                  {brand.image || brand.logo ? (
                    <div className="flex items-center justify-center h-48">
                      <img
                        src={brand.image || brand.logo}
                        alt={brand.name}
                        className="max-h-40 max-w-full object-contain"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      <div className="hidden items-center justify-center h-40 text-gray-500">
                        <IconBrandAndroid size={48} />
                        <p className="mt-2">Logo không khả dụng</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
                      <div className="text-center text-gray-500">
                        <IconBrandAndroid size={48} className="mx-auto mb-2" />
                        <p>Không có logo</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Basic Details */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                  <IconTag size={18} />
                  Thông tin cơ bản
                </h3>
                <div className="space-y-4">
                  <div>
                    <strong className="text-gray-600">ID thương hiệu:</strong>
                    <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono text-sm">
                      #{brand.id}
                    </span>
                  </div>

                  <div>
                    <strong className="text-gray-600">Tên thương hiệu:</strong>
                    <p className="mt-1 text-gray-900 font-medium text-lg">
                      {brand.name}
                    </p>
                  </div>

                  <div>
                    <strong className="text-gray-600">Trạng thái:</strong>
                    <span
                      className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                        brand.active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {brand.active ? "Đang hoạt động" : "Không hoạt động"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
              <IconLanguage size={18} />
              Mô tả thương hiệu
            </h3>
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-gray-700 leading-relaxed">
                {brand.description || "Chưa có mô tả cho thương hiệu này."}
              </p>
            </div>
          </div>

          {/* Products Preview (if available) */}
          {brand.productCount !== undefined && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                <IconPackage size={18} />
                Thông tin sản phẩm
              </h3>
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <IconPackage size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-800">
                      {brand.productCount || 0} sản phẩm
                    </p>
                    <p className="text-sm text-gray-600">
                      Tổng số sản phẩm thuộc thương hiệu này
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
              <IconTag size={18} />
              Thông tin thêm
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <strong className="text-gray-600">Độ dài tên:</strong>
                <span className="ml-2 text-gray-800">
                  {brand.name?.length || 0} ký tự
                </span>
              </div>

              <div className="bg-white p-4 rounded-lg border">
                <strong className="text-gray-600">Độ dài mô tả:</strong>
                <span className="ml-2 text-gray-800">
                  {brand.description?.length || 0} ký tự
                </span>
              </div>

              <div className="bg-white p-4 rounded-lg border">
                <strong className="text-gray-600">Có logo:</strong>
                <span className="ml-2 text-gray-800">
                  {brand.image || brand.logo ? "Có" : "Không"}
                </span>
              </div>

              <div className="bg-white p-4 rounded-lg border">
                <strong className="text-gray-600">ID định dạng:</strong>
                <span className="ml-2 text-gray-800 font-mono">
                  BRAND_{String(brand.id).padStart(4, "0")}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end gap-3 pt-6 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
