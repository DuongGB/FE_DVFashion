import {
  IconX,
  IconPhoto,
  IconTag,
  IconPackage,
  IconCalendar,
  IconInfoCircle,
  IconCheck,
} from "@tabler/icons-react";

export default function CategoryDetailModal({ category, open, onClose }) {
  if (!open || !category) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl relative overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header với gradient background */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black backdrop-blur-sm text-white rounded-full w-10 h-10 flex items-center justify-center text-xl hover:bg-gray-800 transition-all duration-200 cursor-pointer"
          >
            <IconX size={20} />
          </button>

          <div className="flex items-start gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
              <IconPhoto size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">Chi tiết danh mục</h2>
              <p className="text-blue-100 opacity-90">
                Xem thông tin chi tiết của danh mục {category.name}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Image Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                  <IconPhoto size={20} className="text-purple-600" />
                  Hình ảnh danh mục
                </h3>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                  {category.imageUrl || category.image ? (
                    <img
                      src={category.imageUrl || category.image}
                      alt={category.name}
                      className="w-full h-64 object-cover rounded-lg shadow-md"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className={`${
                      category.imageUrl || category.image ? "hidden" : "flex"
                    } items-center justify-center h-64 bg-gray-100 rounded-lg`}
                  >
                    <div className="text-center text-gray-500">
                      <div className="bg-gray-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <IconPhoto size={32} className="text-gray-400" />
                      </div>
                      <p className="text-lg font-medium text-gray-600">
                        Không có hình ảnh
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Chưa tải lên hình ảnh cho danh mục này
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Details Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                  <IconTag size={20} className="text-blue-600" />
                  Thông tin cơ bản
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="bg-blue-100 rounded-full p-1">
                      <IconInfoCircle size={16} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <strong className="text-blue-800 text-sm font-medium">
                        ID danh mục:
                      </strong>
                      <div className="mt-1">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full font-mono text-sm">
                          #{category.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <strong className="text-gray-700 text-sm font-medium">
                      Tên danh mục:
                    </strong>
                    <p className="mt-2 text-gray-900 font-semibold text-lg">
                      {category.name}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <strong className="text-gray-700 text-sm font-medium">
                      Mô tả:
                    </strong>
                    <p className="mt-2 text-gray-800 leading-relaxed">
                      {category.description || "Không có mô tả"}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <strong className="text-gray-700 text-sm font-medium">
                      Trạng thái:
                    </strong>
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
                          category.active
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-red-100 text-red-800 border border-red-200"
                        }`}
                      >
                        {category.active ? (
                          <>
                            <IconCheck size={16} />
                            Đang hoạt động
                          </>
                        ) : (
                          <>
                            <IconX size={16} />
                            Không hoạt động
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <IconCalendar size={20} className="text-green-600" />
                Thông tin thời gian
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.createdAt && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-green-100 rounded-full p-1">
                        <IconCalendar size={16} className="text-green-600" />
                      </div>
                      <strong className="text-green-800 text-sm font-medium">
                        Ngày tạo:
                      </strong>
                    </div>
                    <p className="text-green-700 font-semibold">
                      {new Date(category.createdAt).toLocaleDateString(
                        "vi-VN",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                )}

                {category.updatedAt && (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-yellow-100 rounded-full p-1">
                        <IconCalendar size={16} className="text-yellow-600" />
                      </div>
                      <strong className="text-yellow-800 text-sm font-medium">
                        Cập nhật lần cuối:
                      </strong>
                    </div>
                    <p className="text-yellow-700 font-semibold">
                      {new Date(category.updatedAt).toLocaleDateString(
                        "vi-VN",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <IconPackage size={20} className="text-purple-600" />
                Thông tin bổ sung
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <strong className="text-purple-800 text-sm font-medium">
                    Mã danh mục:
                  </strong>
                  <p className="mt-1 text-purple-700 font-mono font-semibold">
                    CAT-{category.id.toString().padStart(4, "0")}
                  </p>
                </div>

                {category.slug && (
                  <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <strong className="text-indigo-800 text-sm font-medium">
                      Slug:
                    </strong>
                    <p className="mt-1 text-indigo-700 font-mono font-semibold">
                      {category.slug}
                    </p>
                  </div>
                )}

                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <strong className="text-gray-700 text-sm font-medium">
                    Loại danh mục:
                  </strong>
                  <p className="mt-1 text-gray-800 font-semibold">
                    Danh mục sản phẩm
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <strong className="text-gray-700 text-sm font-medium">
                    Quyền hiển thị:
                  </strong>
                  <p className="mt-1 text-gray-800 font-semibold">
                    {category.active ? "Công khai" : "Riêng tư"}
                  </p>
                </div>
              </div>

              {/* Detailed Description */}
              {category.description && (
                <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <h4 className="flex items-center gap-2 font-semibold text-gray-800 mb-3">
                    <IconInfoCircle size={18} className="text-blue-600" />
                    Mô tả chi tiết:
                  </h4>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-white p-3 rounded border">
                    {category.description}
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
