import { useState, useEffect } from "react";
import { IconX, IconMapPin, IconMap } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import AddressMap from "./AddressMap";
import { useAddress } from "../../../hooks/useAddress";
export default function AddressModal({
  isOpen,
  onClose,
  onSave,
  editAddress = null,
  isLoading = false,
}) {
  const { t } = useTranslation();
  const { fetchProvinces, fetchDistricts, fetchWards } = useAddress();

  const [showMap, setShowMap] = useState(false);
  const [isMapSelection, setIsMapSelection] = useState(false);
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
    districts: [],
    wards: [],
    isLoading: false,
  });

  // Load provinces when component mounts / modal opens
  useEffect(() => {
    if (isOpen) {
      loadProvinces();
    }
  }, [isOpen]);

  useEffect(() => {
    if (editAddress) {
      setFormData(editAddress);
      // Load districts and wards for existing city if available
      if (editAddress.city) {
        loadDistrictsAndWardsForExistingCity(
          editAddress.city,
          editAddress.district
        );
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
    setIsMapSelection(false);
  }, [editAddress, isOpen]);

  // Load provinces (from backend via useAddress.fetchProvinces)
  const loadProvinces = async () => {
    setLocationData((prev) => ({ ...prev, isLoading: true }));
    try {
      const provinces = await fetchProvinces();
      // backend returns { provinceId, provinceName }
      const mapped = (provinces || []).map((p) => ({
        code: p.provinceId?.toString(),
        name: p.provinceName,
      }));
      setLocationData((prev) => ({
        ...prev,
        provinces: mapped,
        districts: [],
        wards: [],
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error loading provinces:", error);
      setLocationData((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Load districts and wards for an existing city name (used when editing)
  const loadDistrictsAndWardsForExistingCity = async (
    cityName,
    districtName
  ) => {
    if (!cityName) return;
    setLocationData((prev) => ({ ...prev, isLoading: true }));
    try {
      // find province by name
      const provinces = locationData.provinces.length
        ? locationData.provinces
        : (await fetchProvinces()).map((p) => ({
            code: p.provinceId?.toString(),
            name: p.provinceName,
          }));
      const province = provinces.find((p) => p.name === cityName);
      if (!province) {
        setLocationData((prev) => ({ ...prev, isLoading: false }));
        return;
      }
      // fetch districts by provinceId
      const districtsRaw = await fetchDistricts(parseInt(province.code, 10));
      const mappedDistricts = (districtsRaw || []).map((d) => ({
        code: d.code,
        name: d.districtName,
        id: d.districtId,
      }));
      // find district object to fetch wards
      const currentDistrict = mappedDistricts.find(
        (d) => d.name === districtName
      );
      let mappedWards = [];
      if (currentDistrict) {
        const wardsRaw = await fetchWards(currentDistrict.id);
        mappedWards = (wardsRaw || []).map((w) => ({
          code: w.wardCode,
          name: w.wardName,
        }));
      }
      setLocationData((prev) => ({
        ...prev,
        provinces,
        districts: mappedDistricts,
        wards: mappedWards,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error loading districts/wards for existing city:", error);
      setLocationData((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Handle province change (provinceCode is provinceId as string)
  const handleProvinceChange = async (provinceCode) => {
    setIsMapSelection(false);
    const provinceId = provinceCode ? parseInt(provinceCode, 10) : null;
    const province = locationData.provinces.find(
      (p) => p.code === provinceCode
    );

    setFormData((prev) => ({
      ...prev,
      city: province ? province.name : "",
      district: "",
      ward: "",
    }));

    if (errors.city) {
      setErrors((prev) => ({ ...prev, city: "" }));
    }

    if (!provinceId) {
      setLocationData((prev) => ({ ...prev, districts: [], wards: [] }));
      return;
    }

    setLocationData((prev) => ({ ...prev, isLoading: true }));
    try {
      const districtsRaw = await fetchDistricts(provinceId);
      // backend districts: { districtId, provinceId, districtName, code }
      const mapped = (districtsRaw || []).map((d) => ({
        code: d.code,
        name: d.districtName,
        id: d.districtId,
      }));
      setLocationData((prev) => ({
        ...prev,
        districts: mapped,
        wards: [],
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error loading districts:", error);
      setLocationData((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Handle district change (districtCode is d.code)
  const handleDistrictChange = async (districtCode) => {
    setIsMapSelection(false);
    const district = locationData.districts.find(
      (d) => d.code?.toString() === districtCode?.toString()
    );

    setFormData((prev) => ({
      ...prev,
      district: district ? district.name : "",
      ward: "",
    }));

    if (errors.district) {
      setErrors((prev) => ({ ...prev, district: "" }));
    }

    if (!district || !district.id) {
      setLocationData((prev) => ({ ...prev, wards: [] }));
      return;
    }

    setLocationData((prev) => ({ ...prev, isLoading: true }));
    try {
      const wardsRaw = await fetchWards(district.id);
      const mapped = (wardsRaw || []).map((w) => ({
        code: w.wardCode,
        name: w.wardName,
      }));
      setLocationData((prev) => ({
        ...prev,
        wards: mapped,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error loading wards:", error);
      setLocationData((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Handle ward change (wardCode is wardCode)
  const handleWardChange = (wardCode) => {
    setIsMapSelection(false);
    const ward = locationData.wards.find(
      (w) => w.code?.toString() === wardCode?.toString()
    );
    setFormData((prev) => ({
      ...prev,
      ward: ward ? ward.name : "",
    }));
    if (errors.ward) {
      setErrors((prev) => ({ ...prev, ward: "" }));
    }
  };

  // Get province code by name for select value
  const getProvinceCodeByName = (cityName) => {
    const province = locationData.provinces.find((p) => p.name === cityName);
    return province ? province.code?.toString() : "";
  };

  // Get district code by name for select value
  const getDistrictCodeByName = (districtName) => {
    const district = locationData.districts.find(
      (d) => d.name === districtName
    );
    return district ? district.code?.toString() : "";
  };

  // Get ward code by name for select value
  const getWardCodeByName = (wardName) => {
    const ward = locationData.wards.find((w) => w.name === wardName);
    return ward ? ward.code?.toString() : "";
  };

  // ...existing validation, submit, handlers remain unchanged...
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName?.trim()) {
      newErrors.fullName = t("address.errors.fullName_required");
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = t("address.errors.phone_required");
    } else if (!/^\d+$/.test(formData.phone.trim())) {
      newErrors.phone = t("address.errors.phone_invalid");
    }

    if (!formData.city?.trim()) {
      newErrors.city = t("address.errors.city_required");
    }

    if (!formData.district?.trim()) {
      newErrors.district = t("address.errors.district_required");
    }

    if (!formData.ward?.trim()) {
      newErrors.ward = t("address.errors.ward_required");
    }

    if (!formData.street?.trim()) {
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
    if (["street", "country"].includes(field)) {
      setIsMapSelection(false);
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleMapAddressSelect = (mapAddress) => {
    setIsMapSelection(true);
    setFormData((prev) => ({
      ...prev,
      country: mapAddress.country,
      city: mapAddress.city,
      district: mapAddress.district,
      ward: mapAddress.ward,
      street: mapAddress.street,
    }));
    // Reload location data based on map selection
    if (mapAddress.city) {
      loadDistrictsAndWardsForExistingCity(
        mapAddress.city,
        mapAddress.district
      );
    }
    // Clear related errors
    setErrors((prev) => ({
      ...prev,
      city: "",
      district: "",
      ward: "",
      street: "",
    }));
  };

  const handleToggleMap = () => {
    if (showMap) {
      setIsMapSelection(false);
      setFormData((prev) => ({ ...prev, street: "" }));
    }
    setShowMap(!showMap);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden
        rounded-3xl shadow-2xl border border-white/30
        bg-gradient-to-br from-white/70 via-white/40 to-blue-200/50
        backdrop-blur-2xl
        transition-all duration-300
        animate-scaleIn
        mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative rounded-t-3xl">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <IconMapPin size={20} />
            {editAddress ? t("address.edit_title") : t("address.add_title")}
          </h3>
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleMap}
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

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <form className="space-y-6">
            {/* Map Section */}
            {showMap && (
              <div className="border border-white/30 rounded-xl p-0 bg-transparent shadow-none">
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
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur-sm ${
                    errors.fullName ? "border-red-500" : "border-white/30"
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
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur-sm ${
                    errors.phone ? "border-red-500" : "border-white/30"
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
                  disabled={isMapSelection || locationData.isLoading}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur-sm ${
                    errors.city ? "border-red-500" : "border-white/30"
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

              {/* District Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("address.district")} *
                </label>
                <select
                  value={getDistrictCodeByName(formData.district)}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  disabled={
                    isMapSelection || !formData.city || locationData.isLoading
                  }
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur-sm ${
                    errors.district ? "border-red-500" : "border-white/30"
                  }`}
                >
                  <option value="">{t("cart.select_district")}</option>
                  {locationData.districts.map((district) => (
                    <option key={district.code} value={district.code}>
                      {district.name}
                    </option>
                  ))}
                </select>
                {errors.district && (
                  <p className="text-red-500 text-xs mt-1">{errors.district}</p>
                )}
              </div>

              {/* Ward Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("address.ward")} *
                </label>
                <select
                  value={getWardCodeByName(formData.ward)}
                  onChange={(e) => handleWardChange(e.target.value)}
                  disabled={
                    isMapSelection ||
                    !formData.district ||
                    locationData.isLoading
                  }
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur-sm ${
                    errors.ward ? "border-red-500" : "border-white/30"
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
                  disabled={isMapSelection}
                  className="w-full border border-white/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur-sm"
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
                disabled={isMapSelection}
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-white/80 backdrop-blur-sm ${
                  errors.street ? "border-red-500" : "border-white/30"
                }`}
                placeholder={t("address.street_placeholder")}
              />
              {errors.street && (
                <p className="text-red-500 text-xs mt-1">{errors.street}</p>
              )}
            </div>

            {/* Check default */}
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

            <div className="flex gap-3 pt-4 border-t border-white/30">
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 cursor-pointer shadow-lg transition-all duration-200"
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
