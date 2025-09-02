import {
  IconX,
  IconBrandAndroid,
  IconLanguage,
  IconTag,
  IconPackage,
} from "@tabler/icons-react";

export default function BrandDetailModal({ brand, open, onClose }) {
  if (!open || !brand) return null;

  const getTranslation = (lang) => {
    return (
      brand.translations.find((t) => t.language === lang) ||
      brand.translations[0]
    );
  };

  const viTranslation = getTranslation("vi");
  const enTranslation = getTranslation("en");

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
                  {brand.logo ? (
                    <div className="flex items-center justify-center h-48">
                      <img
                        src={brand.logo}
                        alt={viTranslation.name}
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
                    <strong className="text-gray-600">Số sản phẩm:</strong>
                    <span className="ml-2 bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-medium">
                      {brand.products?.length || 0} sản phẩm
                    </span>
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

                  {brand.logo && (
                    <div>
                      <strong className="text-gray-600">Logo URL:</strong>
                      <p className="mt-1 text-xs text-gray-500 break-all">
                        {brand.logo}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Translations */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
              <IconLanguage size={18} />
              Thông tin đa ngôn ngữ
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vietnamese Translation */}
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center mb-3">
                  <img
                    src="https://flagcdn.com/w20/vn.png"
                    alt="Vietnamese"
                    className="w-5 h-3 mr-2"
                  />
                  <h4 className="font-semibold text-gray-800">Tiếng Việt</h4>
                </div>

                <div className="space-y-3">
                  <div>
                    <strong className="text-gray-600">Tên thương hiệu:</strong>
                    <p className="mt-1 text-gray-900 font-medium">
                      {viTranslation.name}
                    </p>
                  </div>

                  <div>
                    <strong className="text-gray-600">Mô tả:</strong>
                    <p className="mt-1 text-gray-700 text-sm leading-relaxed">
                      {viTranslation.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* English Translation */}
              <div className="bg-white p-4 rounded-lg border">
                <div className="flex items-center mb-3">
                  <img
                    src="https://flagcdn.com/w20/us.png"
                    alt="English"
                    className="w-5 h-3 mr-2"
                  />
                  <h4 className="font-semibold text-gray-800">English</h4>
                </div>

                <div className="space-y-3">
                  <div>
                    <strong className="text-gray-600">Brand Name:</strong>
                    <p className="mt-1 text-gray-900 font-medium">
                      {enTranslation.name}
                    </p>
                  </div>

                  <div>
                    <strong className="text-gray-600">Description:</strong>
                    <p className="mt-1 text-gray-700 text-sm leading-relaxed">
                      {enTranslation.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Preview (if any) */}
          {brand.products && brand.products.length > 0 && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
                <IconPackage size={18} />
                Sản phẩm của thương hiệu ({brand.products.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {brand.products.slice(0, 6).map((product, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg border">
                    <div className="h-20 bg-gray-100 rounded mb-2 flex items-center justify-center">
                      <IconPackage size={24} className="text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-800 truncate">
                      Sản phẩm #{index + 1}
                    </p>
                  </div>
                ))}
              </div>
              {brand.products.length > 6 && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  và {brand.products.length - 6} sản phẩm khác...
                </p>
              )}
            </div>
          )}

          {/* Additional Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 text-gray-700 flex items-center gap-2">
              <IconTag size={18} />
              Thông tin thêm
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong className="text-gray-600">Số lượng ngôn ngữ:</strong>
                <span className="ml-2 text-gray-800">
                  {brand.translations?.length || 0} ngôn ngữ
                </span>
              </div>
              <div>
                <strong className="text-gray-600">Ngôn ngữ hỗ trợ:</strong>
                <div className="ml-2 mt-1">
                  {brand.translations?.map((translation, index) => (
                    <span
                      key={index}
                      className="inline-block bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs mr-1 mb-1"
                    >
                      {translation.language === "vi" ? "Tiếng Việt" : "English"}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
