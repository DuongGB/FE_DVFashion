import {
  IconX,
  IconBrandAndroid,
  IconTag,
  IconPackage,
  IconCalendar,
  IconInfoCircle,
  IconCheck,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

export default function BrandDetailModal({ brand, open, onClose }) {
  const { t, i18n } = useTranslation();

  // Force re-render when language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      // Force component update
    };

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  if (!open || !brand) return null;

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
              <IconBrandAndroid size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2">
                {t("admin.brand.detail.title")}
              </h2>
              <p className="text-blue-100 opacity-90">
                {t("admin.brand.detail.description", { name: brand.name })}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Brand Logo Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                  <IconBrandAndroid size={20} className="text-purple-600" />
                  {t("admin.brand.detail.logo_section")}
                </h3>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                  {brand.image || brand.logo ? (
                    <img
                      src={brand.image || brand.logo}
                      alt={brand.name}
                      className="w-full h-64 object-contain rounded-lg shadow-md bg-white p-4"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className={`${
                      brand.image || brand.logo ? "hidden" : "flex"
                    } items-center justify-center h-64 bg-gray-100 rounded-lg`}
                  >
                    <div className="text-center text-gray-500">
                      <div className="bg-gray-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <IconBrandAndroid size={32} className="text-gray-400" />
                      </div>
                      <p className="text-lg font-medium text-gray-600">
                        {t("admin.brand.detail.no_logo")}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {t("admin.brand.detail.no_logo_desc")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Details Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                  <IconTag size={20} className="text-blue-600" />
                  {t("admin.brand.detail.basic_info")}
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="bg-blue-100 rounded-full p-1">
                      <IconInfoCircle size={16} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <strong className="text-blue-800 text-sm font-medium">
                        {t("admin.brand.detail.brand_id")}:
                      </strong>
                      <div className="mt-1">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full font-mono text-sm">
                          #{brand.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <strong className="text-gray-700 text-sm font-medium">
                      {t("admin.brand.detail.brand_name")}:
                    </strong>
                    <p className="mt-2 text-gray-900 font-semibold text-lg">
                      {brand.name}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <strong className="text-gray-700 text-sm font-medium">
                      {t("admin.brand.detail.brand_description")}:
                    </strong>
                    <p className="mt-2 text-gray-800 leading-relaxed">
                      {brand.description ||
                        t("admin.brand.detail.no_description")}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <strong className="text-gray-700 text-sm font-medium">
                      {t("admin.brand.detail.brand_status")}:
                    </strong>
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
                          brand.active
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-red-100 text-red-800 border border-red-200"
                        }`}
                      >
                        {brand.active ? (
                          <>
                            <IconCheck size={16} />
                            {t("admin.brand.detail.status_active")}
                          </>
                        ) : (
                          <>
                            <IconX size={16} />
                            {t("admin.brand.detail.status_inactive")}
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <IconPackage size={20} className="text-green-600" />
                {t("admin.brand.detail.products_info")}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 rounded-full p-2">
                      <IconPackage size={20} className="text-green-600" />
                    </div>
                    <div>
                      <strong className="text-green-800 text-sm font-medium">
                        {t("admin.brand.detail.product_count")}:
                      </strong>
                      <p className="text-green-700 font-semibold text-lg">
                        {brand.productCount || 0}{" "}
                        {t("admin.brand.detail.products_unit")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 rounded-full p-2">
                      <IconTag size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <strong className="text-blue-800 text-sm font-medium">
                        {t("admin.brand.detail.product_ratio")}:
                      </strong>
                      <p className="text-blue-700 font-semibold text-lg">
                        {brand.productCount
                          ? t("admin.brand.detail.has_products")
                          : t("admin.brand.detail.no_products")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <IconCalendar size={20} className="text-orange-600" />
                {t("admin.brand.detail.timeline_info")}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {brand.createdAt && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-green-100 rounded-full p-1">
                        <IconCalendar size={16} className="text-green-600" />
                      </div>
                      <strong className="text-green-800 text-sm font-medium">
                        {t("admin.brand.detail.created_date")}:
                      </strong>
                    </div>
                    <p className="text-green-700 font-semibold">
                      {new Date(brand.createdAt).toLocaleDateString(
                        i18n.language === "VI" ? "vi-VN" : "en-US",
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

                {brand.updatedAt && (
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-yellow-100 rounded-full p-1">
                        <IconCalendar size={16} className="text-yellow-600" />
                      </div>
                      <strong className="text-yellow-800 text-sm font-medium">
                        {t("admin.brand.detail.updated_date")}:
                      </strong>
                    </div>
                    <p className="text-yellow-700 font-semibold">
                      {new Date(brand.updatedAt).toLocaleDateString(
                        i18n.language === "VI" ? "vi-VN" : "en-US",
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
                <IconInfoCircle size={20} className="text-purple-600" />
                {t("admin.brand.detail.additional_info")}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <strong className="text-purple-800 text-sm font-medium">
                    {t("admin.brand.detail.brand_code")}:
                  </strong>
                  <p className="mt-1 text-purple-700 font-mono font-semibold">
                    BRAND-{brand.id.toString().padStart(4, "0")}
                  </p>
                </div>

                {brand.slug && (
                  <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <strong className="text-indigo-800 text-sm font-medium">
                      {t("admin.brand.detail.slug")}:
                    </strong>
                    <p className="mt-1 text-indigo-700 font-mono font-semibold">
                      {brand.slug}
                    </p>
                  </div>
                )}

                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <strong className="text-gray-700 text-sm font-medium">
                    {t("admin.brand.detail.name_length")}:
                  </strong>
                  <p className="mt-1 text-gray-800 font-semibold">
                    {brand.name?.length || 0}{" "}
                    {t("admin.brand.detail.name_length_unit")}
                  </p>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <strong className="text-gray-700 text-sm font-medium">
                    {t("admin.brand.detail.has_logo")}:
                  </strong>
                  <p className="mt-1 text-gray-800 font-semibold">
                    {brand.image || brand.logo
                      ? t("admin.brand.detail.yes")
                      : t("admin.brand.detail.no")}
                  </p>
                </div>
              </div>

              {/* Detailed Description */}
              {brand.description && (
                <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <h4 className="flex items-center gap-2 font-semibold text-gray-800 mb-3">
                    <IconInfoCircle size={18} className="text-blue-600" />
                    {t("admin.brand.detail.detailed_description")}:
                  </h4>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-white p-3 rounded border">
                    {brand.description}
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
                {t("admin.brand.detail.close")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
