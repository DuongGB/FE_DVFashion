import { useState, useEffect } from "react";
import { IconX, IconMapPin, IconMap } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import AddressMap from "./AddressMap";

export default function AddressModal({
  isOpen,
  onClose,
  onSave,
  editAddress = null,
  isLoading = false,
}) {
  const { t } = useTranslation();
  const [showMap, setShowMap] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    country: "Vietnam",
    city: "",
    district: "",
    ward: "",
    street: "",
    isDefault: false,
  });

  const [errors, setErrors] = useState({});

  // Location data for provinces and wards
  const [locationData, setLocationData] = useState({
    provinces: [],
    wards: [],
    isLoading: false,
  });

  // Load provinces when component mounts
  useEffect(() => {
    if (isOpen) {
      loadProvinces();
    }
  }, [isOpen]);

  useEffect(() => {
    if (editAddress) {
      setFormData(editAddress);
      // Load wards for the existing city if it exists
      if (editAddress.city) {
        loadWardsForExistingCity(editAddress.city);
      }
    } else {
      setFormData({
        fullName: "",
        phone: "",
        country: "Vietnam",
        city: "",
        district: "",
        ward: "",
        street: "",
        isDefault: false,
      });
    }
    setErrors({});
    setShowMap(false);
  }, [editAddress, isOpen]);

  // Load provinces
  const loadProvinces = async () => {
    setLocationData((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await fetch("https://provinces.open-api.vn/api/v2/");
      const provinces = await response.json();
      setLocationData((prev) => ({
        ...prev,
        provinces,
        wards: [],
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error loading provinces:", error);
      setLocationData((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Load wards for existing city (when editing)
  const loadWardsForExistingCity = async (cityName) => {
    if (!cityName) return;

    setLocationData((prev) => ({ ...prev, isLoading: true }));
    try {
      // Find province by name
      const response = await fetch("https://provinces.open-api.vn/api/v2/");
      const provinces = await response.json();
      const province = provinces.find((p) => p.name === cityName);

      if (province) {
        const wardResponse = await fetch(
          `https://provinces.open-api.vn/api/v2/p/${province.code}?depth=2`
        );
        const data = await wardResponse.json();
        const allWards = data.wards || [];

        setLocationData((prev) => ({
          ...prev,
          provinces,
          wards: allWards,
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error("Error loading wards for existing city:", error);
      setLocationData((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Handle province change
  const handleProvinceChange = async (provinceCode) => {
    const province = locationData.provinces.find(
      (p) => p.code.toString() === provinceCode
    );

    setFormData((prev) => ({
      ...prev,
      city: province ? province.name : "",
      ward: "",
    }));

    // Clear city error if exists
    if (errors.city) {
      setErrors((prev) => ({ ...prev, city: "" }));
    }

    if (!provinceCode) {
      setLocationData((prev) => ({ ...prev, wards: [] }));
      return;
    }

    setLocationData((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await fetch(
        `https://provinces.open-api.vn/api/v2/p/${provinceCode}?depth=2`
      );
      const data = await response.json();
      const allWards = data.wards || [];
      setLocationData((prev) => ({
        ...prev,
        wards: allWards,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error loading wards:", error);
      setLocationData((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Handle ward change
  const handleWardChange = (wardCode) => {
    const ward = locationData.wards.find((w) => w.code.toString() === wardCode);

    setFormData((prev) => ({
      ...prev,
      ward: ward ? ward.name : "",
    }));

    // Clear ward error if exists
    if (errors.ward) {
      setErrors((prev) => ({ ...prev, ward: "" }));
    }
  };

  // Get province code by name for select value
  const getProvinceCodeByName = (cityName) => {
    const province = locationData.provinces.find((p) => p.name === cityName);
    return province ? province.code.toString() : "";
  };

  // Get ward code by name for select value
  const getWardCodeByName = (wardName) => {
    const ward = locationData.wards.find((w) => w.name === wardName);
    return ward ? ward.code.toString() : "";
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = t("address.errors.fullName_required");
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t("address.errors.phone_required");
    }

    if (!formData.city.trim()) {
      newErrors.city = t("address.errors.city_required");
    }

    if (!formData.district.trim()) {
      newErrors.district = t("address.errors.district_required");
    }

    if (!formData.ward.trim()) {
      newErrors.ward = t("address.errors.ward_required");
    }

    if (!formData.street.trim()) {
      newErrors.street = t("address.errors.street_required");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleMapAddressSelect = (mapAddress) => {
    setFormData((prev) => ({
      ...prev,
      country: mapAddress.country,
      city: mapAddress.city,
      district: mapAddress.district,
      ward: mapAddress.ward,
      street: mapAddress.street,
    }));
    // Clear related errors
    setErrors((prev) => ({
      ...prev,
      city: "",
      district: "",
      ward: "",
      street: "",
    }));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative rounded-t-xl">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <IconMapPin size={20} />
            {editAddress ? t("address.edit_title") : t("address.add_title")}
          </h3>
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowMap(!showMap)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                showMap
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
            >
              <IconMap size={16} />
              {showMap ? t("address.hide_map") : t("address.show_map")}
            </button>
            <button
              onClick={onClose}
              className="bg-black/20 backdrop-blur-sm text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-black/30 transition-all cursor-pointer"
            >
              <IconX size={18} />
            </button>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Map Section */}
            {showMap && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <AddressMap
                  onAddressSelect={handleMapAddressSelect}
                  initialAddress={{
                    country: formData.country,
                    city: formData.city,
                    district: formData.district,
                    ward: formData.ward,
                    street: formData.street,
                  }}
                />
              </div>
            )}

            {/* Personal Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("address.fullName")} *
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.fullName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder={t("address.fullName_placeholder")}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("address.phone")} *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder={t("address.phone_placeholder")}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Address Details */}
            <div className="grid grid-cols-2 gap-4">
              {/* Province/City Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("address.city")} *
                </label>
                <select
                  value={getProvinceCodeByName(formData.city)}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  disabled={locationData.isLoading}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
                    errors.city ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">{t("cart.select_province")}</option>
                  {locationData.provinces.map((province) => (
                    <option key={province.code} value={province.code}>
                      {province.name}
                    </option>
                  ))}
                </select>
                {errors.city && (
                  <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                )}
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("address.district")} *
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => handleChange("district", e.target.value)}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.district ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder={t("address.district_placeholder")}
                />
                {errors.district && (
                  <p className="text-red-500 text-xs mt-1">{errors.district}</p>
                )}
              </div> */}

              {/* Ward Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("address.ward")} *
                </label>
                <select
                  value={getWardCodeByName(formData.ward)}
                  onChange={(e) => handleWardChange(e.target.value)}
                  disabled={!formData.city || locationData.isLoading}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
                    errors.ward ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">{t("cart.select_ward")}</option>
                  {locationData.wards.map((ward) => (
                    <option key={ward.code} value={ward.code}>
                      {ward.name}
                    </option>
                  ))}
                </select>
                {errors.ward && (
                  <p className="text-red-500 text-xs mt-1">{errors.ward}</p>
                )}
              </div>

              {/* Country - moved to second row */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("address.country")}
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t("address.country_placeholder")}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("address.street")} *
              </label>
              <textarea
                value={formData.street}
                onChange={(e) => handleChange("street", e.target.value)}
                rows={3}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                  errors.street ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={t("address.street_placeholder")}
              />
              {errors.street && (
                <p className="text-red-500 text-xs mt-1">{errors.street}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => handleChange("isDefault", e.target.checked)}
                className="mr-2 accent-blue-600"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700">
                {t("address.set_default")}
              </label>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? t("common.saving") : t("common.save")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
