import {
  IconX,
  IconPhoto,
  IconTag,
  IconPackage,
  IconCalendar,
} from "@tabler/icons-react";

export default function CategoryDetailModal({ category, open, onClose }) {
  if (!open || !category) return null;

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
            <IconPhoto size={24} className="text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">
              Chi tiết danh mục
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
            {/* Category Image */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                  <IconPhoto size={18} />
                  Hình ảnh danh mục
                </h3>
                <div className="border rounded-lg text-center">
                  {category.imageUrl || category.image ? (
                    <img
                      src={category.imageUrl || category.image}
                      alt={category.name}
                      className="w-full h-100 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className={`${
                      category.imageUrl || category.image ? "hidden" : "flex"
                    } items-center justify-center h-100 bg-gray-100 rounded-lg`}
                  >
                    <div className="text-center text-gray-500">
                      <IconPhoto size={48} className="mx-auto mb-2" />
                      <p>Không có hình ảnh</p>
                    </div>
                  </div>
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
                    <strong className="text-gray-600">ID danh mục:</strong>
                    <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono text-sm">
                      #{category.id}
                    </span>
                  </div>

                  <div>
                    <strong className="text-gray-600">Tên danh mục:</strong>
                    <p className="mt-1 text-gray-900 font-medium">
                      {category.name}
                    </p>
                  </div>

                  <div>
                    <strong className="text-gray-600">Mô tả:</strong>
                    <p className="mt-1 text-gray-700 text-sm leading-relaxed">
                      {category.description}
                    </p>
                  </div>

                  <div>
                    <strong className="text-gray-600">Trạng thái:</strong>
                    <span
                      className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                        category.active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {category.active ? "Đang hoạt động" : "Không hoạt động"}
                    </span>
                  </div>

                  {category.createdAt && (
                    <div>
                      <strong className="text-gray-600">Ngày tạo:</strong>
                      <div className="flex items-center gap-1 mt-1">
                        <IconCalendar size={16} className="text-gray-500" />
                        <span className="text-gray-700 text-sm">
                          {new Date(category.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                  {category.updatedAt && (
                    <div>
                      <strong className="text-gray-600">
                        Cập nhật lần cuối:
                      </strong>
                      <div className="flex items-center gap-1 mt-1">
                        <IconCalendar size={16} className="text-gray-500" />
                        <span className="text-gray-700 text-sm">
                          {new Date(category.updatedAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
              <IconTag size={18} />
              Thông tin thêm
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong className="text-gray-600">Mã danh mục:</strong>
                <span className="ml-2 text-gray-800 font-mono">
                  CAT-{category.id.toString().padStart(4, "0")}
                </span>
              </div>

              {category.slug && (
                <div>
                  <strong className="text-gray-600">Slug:</strong>
                  <span className="ml-2 text-gray-800 font-mono">
                    {category.slug}
                  </span>
                </div>
              )}

              <div>
                <strong className="text-gray-600">Loại danh mục:</strong>
                <span className="ml-2 text-gray-800">Danh mục sản phẩm</span>
              </div>

              <div>
                <strong className="text-gray-600">Quyền hiển thị:</strong>
                <span className="ml-2 text-gray-800">
                  {category.active ? "Công khai" : "Ẩn"}
                </span>
              </div>
            </div>

            {/* Description Box */}
            {category.description && (
              <div className="mt-4 p-4 bg-white rounded-lg border">
                <h4 className="font-medium text-gray-700 mb-2">
                  Mô tả chi tiết:
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                  {category.description}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
