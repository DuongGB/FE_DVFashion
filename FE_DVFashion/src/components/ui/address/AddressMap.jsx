import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import axios from "axios";
import { IconMapPin, IconCurrentLocation } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

const AddressMap = ({ onAddressSelect, initialAddress = null }) => {
  const { t } = useTranslation();
  const [position, setPosition] = useState([10.762622, 106.660172]);
  const [marker, setMarker] = useState(null);
  const [address, setAddress] = useState({
    country: "Vietnam",
    city: "",
    district: "",
    ward: "",
    street: "",
  });
  const [loading, setLoading] = useState(false);

  // Component để cập nhật view của map khi position thay đổi
  const ChangeView = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
      map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
  };

  // Lấy vị trí hiện tại của user
  useEffect(() => {
    if (!marker && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPosition = [pos.coords.latitude, pos.coords.longitude];
          setPosition(newPosition);
          setMarker(newPosition);
          fetchAddress(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => console.error("Geolocation error:", err)
      );
    }
  }, [marker]);

  // Set initial address if provided
  useEffect(() => {
    if (initialAddress) {
      setAddress(initialAddress);
    }
  }, [initialAddress]);

  // Component để lắng nghe sự kiện click trên map
  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        const newPosition = [lat, lng];
        setPosition(newPosition);
        setMarker(newPosition);
        fetchAddress(lat, lng);
      },
    });
    return marker ? <Marker position={marker}></Marker> : null;
  };

  // Gọi API Nominatim reverse geocode
  const fetchAddress = async (lat, lng) => {
    setLoading(true);
    try {
      const res = await axios.get(
        "https://nominatim.openstreetmap.org/reverse",
        {
          params: {
            format: "json",
            lat,
            lon: lng,
            addressdetails: 1,
            "accept-language": "vi",
          },
        }
      );

      const data = res.data.address;
      const newAddress = {
        country: data.country || "Vietnam",
        city: data.city || data.state || data.province || "",
        district: data.county || data.state_district || data.suburb || "",
        ward: data.suburb || data.village || data.neighbourhood || "",
        street:
          [data.house_number, data.road].filter(Boolean).join(" ") ||
          data.neighbourhood ||
          "",
      };

      setAddress(newAddress);

      // Callback to parent component
      if (onAddressSelect) {
        onAddressSelect(newAddress);
      }
    } catch (err) {
      console.error("Error fetching address", err);
    } finally {
      setLoading(false);
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPosition = [pos.coords.latitude, pos.coords.longitude];
          setPosition(newPosition);
          setMarker(newPosition);
          fetchAddress(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => console.error("Geolocation error:", err)
      );
    }
  };

  const handleAddressChange = (field, value) => {
    const newAddress = { ...address, [field]: value };
    setAddress(newAddress);
    if (onAddressSelect) {
      onAddressSelect(newAddress);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <IconMapPin size={20} />
          {t("address.select_on_map")}
        </h3>
        <button
          type="button"
          onClick={getCurrentLocation}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm cursor-pointer"
        >
          <IconCurrentLocation size={16} />
          {t("address.current_location")}
        </button>
      </div>

      <div className="relative">
        <MapContainer
          center={position}
          zoom={15}
          style={{ height: "300px", width: "100%" }}
          className="rounded-lg border border-gray-300"
        >
          <ChangeView center={position} zoom={15} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker />
        </MapContainer>

        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
            <div className="text-blue-600">{t("common.loading")}...</div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("address.street")} *
        </label>
        <textarea
          value={address.street}
          onChange={(e) => handleAddressChange("street", e.target.value)}
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder={t("address.street_placeholder")}
        />
      </div>

      <div className="text-xs text-gray-500">
        {t("address.map_instruction")}
      </div>
    </div>
  );
};

export default AddressMap;
