import { useState, useEffect, useMemo } from "react";
import {
  IconReceipt,
  IconCreditCard,
  IconShoppingBag,
  IconTrash,
  IconMapPin,
} from "@tabler/icons-react";
import CartBottom from "../../components/common/CartBottom";
import { Link } from "react-router-dom";
import { usePromotion } from "../../hooks/usePromotion";
import { useTranslation } from "react-i18next";
import { useCart } from "../../hooks/useCart";
import { useAddress } from "../../hooks/useAddress";
import AddressList from "../../components/ui/address/AddressList";
import { useCreateOrder } from "../../hooks/useOrder";
import { toast } from "react-toastify";
import { useShipping } from "../../hooks/useShipping";
import { formatVND } from "../../utils/formatVND";

export default function CartPage() {
  const { t, i18n } = useTranslation();
  const language = i18n.language || "VI";
  const { promotions = [], isLoading: isPromoLoading } = usePromotion(language);
  const {
    defaultAddress,
    addresses,
    fetchProvinces,
    fetchDistricts,
    fetchWards,
  } = useAddress();
  const {
    mutate: createOrder,
    mutateAsync: createOrderAsync,
    isLoading: isCreatingOrder,
  } = useCreateOrder();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { calculate: calculateShippingApi, isCalculating: isCalculatingShip } =
    useShipping();

  // Lấy giỏ hàng từ API
  const {
    cart,
    isLoading: isCartLoading,
    updateQuantity,
    removeItem,
    clearCart,
    isUpdating,
  } = useCart();

  // Lọc ra các khuyến mãi còn hạn
  const activePromotions = useMemo(() => {
    if (!promotions) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Đặt về đầu ngày để so sánh
    return promotions.filter((promo) => new Date(promo.endDate) >= today);
  }, [promotions]);

  // Chuyển đổi dữ liệu từ API sang định dạng dùng trong UI
  const cartItems = cart?.items || [];

  const [selected, setSelected] = useState([]);
  const [selectedPromotionId, setSelectedPromotionId] = useState(null);
  const [input, setInput] = useState("");
  const [shipping, setShipping] = useState({
    name: "",
    phone: "",
    address: "",
    country: "Vietnam",
    province: "",
    district: "",
    ward: "",
    note: "",
    otherReceiver: false,
    vat: false,
    shippingFee: 0,
  });
  const [payment, setPayment] = useState("cod");
  const [showAddressList, setShowAddressList] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [manualDeselect, setManualDeselect] = useState(false);
  const [deliveryText, setDeliveryText] = useState("");

  // Lọc giỏ hàng theo mục đã chọn (moved up to avoid TDZ)
  const filteredCart = useMemo(
    () =>
      cartItems && selected
        ? cartItems.filter((item) => selected?.includes(item.cartItemId))
        : [],
    [cartItems, selected]
  );

  // helper to build shippingInfo payload (returns null if missing required fields)
  const buildShippingInfoForCalc = (useSelectedAddress = false) => {
    const items = filteredCart.map((it) => ({ cartItemId: it.cartItemId }));
    if (!items.length) return null;

    const infoSource =
      useSelectedAddress && selectedAddress
        ? selectedAddress
        : {
            fullName: shipping.name,
            phone: shipping.phone,
            country: shipping.country,
            city: getProvinceName(shipping.province),
            district: getDistrictName(shipping.district),
            ward: getWardName(shipping.ward),
            street: shipping.address,
          };

    // find toDistrictId + toWardCode from loaded locationData
    let toDistrictId = null;
    let toWardCode = "";
    if (selectedAddress) {
      // try map by names
      const prov = locationData.provinces.find(
        (p) => p.name === selectedAddress.city
      );
      if (prov) {
        const districts = locationData.districts;
        const d = districts.find((dd) => dd.name === selectedAddress.district);
        if (d) {
          toDistrictId = d.id;
          // try find ward code by ward name (may not be loaded yet)
          const ward = locationData.wards.find(
            (w) => w.name === selectedAddress.ward
          );
          if (ward) toWardCode = ward.code;
        }
      }
    } else {
      const dObj = locationData.districts.find(
        (d) => d.code?.toString() === shipping.district?.toString()
      );
      if (dObj) toDistrictId = dObj.id;
      const wObj = locationData.wards.find(
        (w) => w.code?.toString() === shipping.ward?.toString()
      );
      if (wObj) toWardCode = wObj.code;
    }

    if (
      !infoSource.fullName ||
      !infoSource.phone ||
      !infoSource.country ||
      !infoSource.city ||
      !infoSource.district ||
      !infoSource.ward ||
      !infoSource.street ||
      !toDistrictId ||
      !toWardCode
    ) {
      return null; // thiếu dữ liệu để tính
    }

    const shippingInfo = {
      fullName: infoSource.fullName,
      phone: infoSource.phone,
      country: infoSource.country,
      city: infoSource.city,
      district: infoSource.district,
      ward: infoSource.ward,
      street: infoSource.street,
      toDistrictId: parseInt(toDistrictId, 10),
      toWardCode: toWardCode?.toString(),
    };

    const payload = {
      orderItems: items,
      shippingInfo,
      notes: shipping.note || "",
      paymentMethod: payment === "cod" ? "CASH_ON_DELIVERY" : "PAYPAL",
    };

    return payload;
  };

  // map an address (from address book) to toDistrictId/toWardCode, loading location data if needed
  const mapAddressToCodes = async (addr) => {
    let toDistrictId = null;
    let toWardCode = null;

    try {
      // ensure provinces loaded
      if (!locationData.provinces.length) {
        const provincesRaw = await fetchProvinces();
        const mapped = (provincesRaw || []).map((p) => ({
          code: p.provinceId,
          name: p.provinceName,
        }));
        setLocationData((prev) => ({ ...prev, provinces: mapped }));
      }

      // find province object (may be in state after the step above)
      const province = (
        locationData.provinces.length ? locationData.provinces : []
      ).find((p) => p.name === addr.city);

      if (!province) {
        // try to reload provinces once more from API and try again
        try {
          const provincesRaw = await fetchProvinces();
          const mapped = (provincesRaw || []).map((p) => ({
            code: p.provinceId,
            name: p.provinceName,
          }));
          setLocationData((prev) => ({ ...prev, provinces: mapped }));
          const prov2 = mapped.find((p) => p.name === addr.city);
          if (!prov2) return { toDistrictId, toWardCode };
          // continue with prov2
          const districtsRaw = await fetchDistricts(parseInt(prov2.code, 10));
          const mappedDistricts = (districtsRaw || []).map((d) => ({
            code: d.code,
            name: d.districtName,
            id: d.districtId,
          }));
          setLocationData((prev) => ({ ...prev, districts: mappedDistricts }));
          const districtObj = mappedDistricts.find(
            (d) => d.name === addr.district
          );
          if (!districtObj) return { toDistrictId, toWardCode };
          toDistrictId = districtObj.id;
          const wardsRaw = await fetchWards(districtObj.id);
          const mappedWards = (wardsRaw || []).map((w) => ({
            code: w.wardCode,
            name: w.wardName,
          }));
          setLocationData((prev) => ({ ...prev, wards: mappedWards }));
          const wardObj = mappedWards.find((w) => w.name === addr.ward);
          if (wardObj) toWardCode = wardObj.code?.toString();
          return { toDistrictId, toWardCode };
        } catch (err) {
          console.error("mapAddressToCodes fallback failed:", err);
          return { toDistrictId, toWardCode };
        }
      }

      // load districts for province
      const districtsRaw = await fetchDistricts(parseInt(province.code, 10));
      const mappedDistricts = (districtsRaw || []).map((d) => ({
        code: d.code,
        name: d.districtName,
        id: d.districtId,
      }));
      setLocationData((prev) => ({ ...prev, districts: mappedDistricts }));

      const districtObj = mappedDistricts.find((d) => d.name === addr.district);
      if (!districtObj) return { toDistrictId, toWardCode };
      toDistrictId = districtObj.id;

      // load wards for district
      const wardsRaw = await fetchWards(districtObj.id);
      const mappedWards = (wardsRaw || []).map((w) => ({
        code: w.wardCode,
        name: w.wardName,
      }));
      setLocationData((prev) => ({ ...prev, wards: mappedWards }));

      const wardObj = mappedWards.find((w) => w.name === addr.ward);
      if (wardObj) toWardCode = wardObj.code?.toString();
    } catch (err) {
      console.error("Mapping address to codes failed:", err);
    }

    return { toDistrictId, toWardCode };
  };

  // Debounced effect: recalc when address/selection/cart changes
  useEffect(() => {
    let timer = null;

    const doCalc = async () => {
      // prefer selectedAddress if exists
      const payload =
        buildShippingInfoForCalc(!!selectedAddress) ||
        buildShippingInfoForCalc(false);
      if (payload) {
        try {
          const res = await calculateShippingApi(payload);
          const data = res?.data ?? res;
          const fee =
            data?.shippingFee ??
            data?.shippingFee?.value ??
            data?.shippingFee?.amount ??
            null;
          const text =
            data?.deliveryTimeText ??
            (data?.estimatedDeliveryTime
              ? new Date(data.estimatedDeliveryTime).toLocaleString()
              : "");
          if (fee != null) {
            setShipping((s) => ({ ...s, shippingFee: Number(fee) }));
          }
          setDeliveryText(text || "");
        } catch (e) {
          console.error("Shipping calc failed:", e);
        }
        return;
      }

      // if payload is null but we have a selectedAddress, try to map it to codes and calculate
      if (selectedAddress && filteredCart.length > 0) {
        try {
          const { toDistrictId, toWardCode } = await mapAddressToCodes(
            selectedAddress
          );
          if (!toDistrictId || !toWardCode) {
            setDeliveryText("");
            return;
          }

          const shippingInfo = {
            fullName: selectedAddress.fullName,
            phone: selectedAddress.phone,
            country: selectedAddress.country || "Vietnam",
            city: selectedAddress.city,
            district: selectedAddress.district,
            ward: selectedAddress.ward,
            street: selectedAddress.street,
            toDistrictId: parseInt(toDistrictId, 10),
            toWardCode: toWardCode?.toString(),
          };

          const items = filteredCart.map((it) => ({
            cartItemId: it.cartItemId,
          }));
          const calcPayload = {
            orderItems: items,
            shippingInfo,
            notes: shipping.note || "",
            paymentMethod: payment === "cod" ? "CASH_ON_DELIVERY" : "PAYPAL",
          };

          const res = await calculateShippingApi(calcPayload);
          const data = res?.data ?? res;
          const fee =
            data?.shippingFee ??
            data?.shippingFee?.value ??
            data?.shippingFee?.amount ??
            null;
          const text =
            data?.deliveryTimeText ??
            (data?.estimatedDeliveryTime
              ? new Date(data.estimatedDeliveryTime).toLocaleString()
              : "");
          if (fee != null) {
            setShipping((s) => ({ ...s, shippingFee: Number(fee) }));
          }
          setDeliveryText(text || "");
        } catch (e) {
          console.error("Shipping calc with selectedAddress failed:", e);
        }
      } else {
        setDeliveryText("");
      }
    };

    // wait 600ms after last change
    timer = setTimeout(() => {
      doCalc();
    }, 600);

    return () => clearTimeout(timer);
  }, [
    shipping.province,
    shipping.district,
    shipping.ward,
    shipping.address,
    shipping.name,
    shipping.phone,
    selectedAddress,
    filteredCart.length,
    payment,
  ]);

  // Lưu thứ tự cartItemId ban đầu
  const [itemOrder, setItemOrder] = useState(
    cartItems.map((i) => i.cartItemId)
  );

  // Add location data state
  const [locationData, setLocationData] = useState({
    provinces: [],
    districts: [],
    wards: [],
    isLoading: false,
  });

  // Load provinces when component mounts
  useEffect(() => {
    loadProvinces();
  }, []);

  // Load provinces
  const loadProvinces = async () => {
    setLocationData((prev) => ({ ...prev, isLoading: true }));
    try {
      const provinces = await fetchProvinces();
      // backend returns records like { provinceId, provinceName }
      const mapped = (provinces || []).map((p) => ({
        code: p.provinceId,
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

  // Load districts when province changes
  const handleProvinceChange = async (provinceCode) => {
    // provinceCode may come as string from select; convert to integer if possible
    const provinceId = provinceCode ? parseInt(provinceCode, 10) : null;

    setShipping((prev) => ({
      ...prev,
      province: provinceCode,
      district: "",
      ward: "",
    }));

    if (!provinceId) {
      setLocationData((prev) => ({ ...prev, districts: [], wards: [] }));
      return;
    }

    setLocationData((prev) => ({ ...prev, isLoading: true }));
    try {
      const districts = await fetchDistricts(provinceId);
      // backend districts: { districtId, provinceId, districtName, code }
      const mapped = (districts || []).map((d) => ({
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

  // Load wards when district changes
  const handleDistrictChange = async (districtCode) => {
    // districtCode here is the district.code (string) — backend expects districtId for wards endpoint
    setShipping((prev) => ({
      ...prev,
      district: districtCode,
      ward: "",
    }));

    if (!districtCode) {
      setLocationData((prev) => ({ ...prev, wards: [] }));
      return;
    }

    // We need districtId to fetch wards. Try to find it from locationData.districts
    const districtObj = locationData.districts.find(
      (d) => d.code === districtCode
    );
    const districtId = districtObj ? districtObj.id : null;

    if (!districtId) {
      // fallback: try to parse as number
      setLocationData((prev) => ({ ...prev, wards: [] }));
      return;
    }

    setLocationData((prev) => ({ ...prev, isLoading: true }));
    try {
      const wards = await fetchWards(districtId);
      // backend ward: { wardCode, districtId, wardName }
      const mapped = (wards || []).map((w) => ({
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

  // Handle ward change
  const handleWardChange = (wardCode) => {
    setShipping((prev) => ({ ...prev, ward: wardCode }));
  };

  // Get display names (adapt to mapped shape)
  const getProvinceName = (code) => {
    const province = locationData.provinces.find(
      (p) => p.code?.toString() === code?.toString()
    );
    return province ? province.name : "";
  };

  const getDistrictName = (code) => {
    const district = locationData.districts.find(
      (d) => d.code?.toString() === code?.toString()
    );
    return district ? district.name : "";
  };

  const getWardName = (code) => {
    const ward = locationData.wards.find(
      (w) => w.code?.toString() === code?.toString()
    );
    return ward ? ward.name : "";
  };

  // Auto-select default address when component mounts or defaultAddress changes
  useEffect(() => {
    if (defaultAddress && !selectedAddress && !manualDeselect) {
      handleSelectAddress(defaultAddress);
    }
  }, [defaultAddress, selectedAddress, manualDeselect]);

  // Sync selectedAddress if it's deleted from the address list
  useEffect(() => {
    if (selectedAddress && addresses) {
      const updatedSelectedAddress = addresses.find(
        (addr) => addr.id === selectedAddress.id
      );

      // If the address is deleted, updatedSelectedAddress will be undefined
      if (!updatedSelectedAddress) {
        // Fall back to the new default address or null
        handleSelectAddress(defaultAddress || null);
      } else {
        // If the address was edited, its data might have changed.
        // We update the selectedAddress state to reflect these changes.
        // JSON.stringify is a simple way to check for object inequality.
        if (
          JSON.stringify(updatedSelectedAddress) !==
          JSON.stringify(selectedAddress)
        ) {
          setSelectedAddress(updatedSelectedAddress);
        }
      }
    }
  }, [addresses, selectedAddress, defaultAddress]);

  // Mặc định selected tất cả khi cartItems thay đổi
  useEffect(() => {
    setSelected(cartItems.map((item) => item.cartItemId));
  }, [cartItems]);

  // Đồng bộ selected khi giỏ hàng thay đổi
  useEffect(() => {
    // Khi cartItems thay đổi, cập nhật lại thứ tự nếu có thêm/xóa
    setItemOrder((prev) => {
      const newIds = cartItems.map((i) => i.cartItemId);
      // Giữ thứ tự cũ, thêm mới ở cuối
      return [
        ...prev.filter((id) => newIds.includes(id)),
        ...newIds.filter((id) => !prev.includes(id)),
      ];
    });
  }, [cartItems.length]);

  // Sắp xếp lại cartItems theo itemOrder
  const orderedCartItems = useMemo(() => {
    return itemOrder
      .map((id) => cartItems.find((item) => item.cartItemId === id))
      .filter(Boolean);
  }, [cartItems, itemOrder]);

  // When selecting address from address book: attempt to set province/district/ward by names/codes
  const handleSelectAddress = async (address) => {
    // set selected address immediately for UI
    setSelectedAddress(address);

    if (address) {
      setManualDeselect(false);
      // Clear manual form fields (so form shows empty / uses selectedAddress display)
      setShipping((prev) => ({
        ...prev,
        name: "",
        phone: "",
        address: "",
        country: address.country || "Vietnam",
      }));

      try {
        // try find province by name in already loaded provinces
        const province = locationData.provinces.find(
          (p) => p.name === address.city
        );

        if (province) {
          // fetch districts for that province (ensure we have ids)
          const districtsRaw = await fetchDistricts(
            parseInt(province.code, 10)
          );
          const mappedDistricts = (districtsRaw || []).map((d) => ({
            code: d.code,
            name: d.districtName,
            id: d.districtId,
          }));

          // find district object by name
          const districtObj = mappedDistricts.find(
            (d) => d.name === address.district
          );

          // fetch wards if district found
          let mappedWards = [];
          if (districtObj && districtObj.id) {
            const wardsRaw = await fetchWards(districtObj.id);
            mappedWards = (wardsRaw || []).map((w) => ({
              code: w.wardCode,
              name: w.wardName,
            }));
          }

          // update locationData with loaded districts/wards so later lookups work
          setLocationData((prev) => ({
            ...prev,
            provinces: prev.provinces.length
              ? prev.provinces
              : locationData.provinces,
            districts: mappedDistricts,
            wards: mappedWards,
          }));

          // set shipping codes (use codes if we have them) — keep selects synced
          setShipping((prev) => ({
            ...prev,
            province: province.code?.toString() ?? "",
            district: districtObj ? districtObj.code?.toString() ?? "" : "",
            ward:
              mappedWards.length > 0
                ? mappedWards
                    .find((w) => w.name === address.ward)
                    ?.code?.toString() ?? ""
                : "",
          }));

          // build payload and calculate shipping immediately
          const payload =
            buildShippingInfoForCalc(true) || buildShippingInfoForCalc(false);
          if (payload) {
            try {
              const res = await calculateShippingApi(payload);
              const data = res?.data ?? res;
              const fee =
                data?.shippingFee ??
                data?.shippingFee?.value ??
                data?.shippingFee?.amount ??
                null;
              const text =
                data?.deliveryTimeText ??
                (data?.estimatedDeliveryTime
                  ? new Date(data.estimatedDeliveryTime).toLocaleString()
                  : "");
              if (fee != null) {
                setShipping((s) => ({ ...s, shippingFee: Number(fee) }));
              }
              setDeliveryText(text || "");
            } catch (err) {
              console.error("Shipping calc after address select failed:", err);
            }
          }
        } else {
          // province name not found in loaded list — do nothing special (user can pick manually)
        }
      } catch (err) {
        console.error("Error mapping selected address to location codes:", err);
      }
    } else {
      setManualDeselect(true);
      setShipping({
        name: "",
        phone: "",
        address: "",
        country: "Vietnam",
        province: "",
        district: "",
        ward: "",
        note: "",
        otherReceiver: false,
        vat: false,
        shippingFee: 0,
      });
    }

    setShowAddressList(false);
  };

  // Format address display
  const formatAddressDisplay = (address) => {
    if (!address) return "";
    return `${address.street}, ${address.ward},  ${address.city}`;
  };

  // Chọn hoặc bỏ chọn tất cả mục
  const handleSelectAll = (e) => {
    const newSelected = e.target.checked
      ? cartItems.map((item) => item.cartItemId)
      : [];
    setSelected(newSelected);
  };

  // Chọn hoặc bỏ chọn một mục
  const handleSelect = (id) => {
    setSelected((prev) =>
      prev?.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Thay đổi số lượng sản phẩm
  const handleQuantity = async (id, delta) => {
    if (isUpdating) return; // Chặn nếu đang cập nhật

    const item = cartItems.find((i) => i.cartItemId === id);
    if (!item) return;
    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) {
      await handleRemove(id);
    } else {
      await updateQuantity({ cartItemId: id, newQuantity });
    }
  };

  // Xoá sản phẩm khỏi giỏ hàng
  const handleRemove = async (id) => {
    await removeItem(id);
    setSelected((prev) => prev.filter((i) => i !== id));
  };

  // Xoá tất cả sản phẩm
  const handleClearCart = async () => {
    await clearCart();
    setSelected([]);
  };

  // Hàm format LocaldeDate
  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "2-digit", year: "numeric" };
    return new Date(dateString).toLocaleDateString("vi-VN", options);
  };

  // Tính tổng tiền của filteredCart (sản phẩm đã chọn)
  const total = filteredCart.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0
  );

  // Lấy promotion đang chọn
  const selectedPromotion = promotions.find(
    (promo) => promo.id === selectedPromotionId
  );

  // Tính số tiền giảm giá
  const promotionDiscount = useMemo(() => {
    if (!selectedPromotion || total < selectedPromotion.minOrderAmount)
      return 0;
    if (selectedPromotion.type === "PERCENTAGE") {
      return Math.round((total * selectedPromotion.value) / 100);
    }
    if (selectedPromotion.type === "AMOUNT") {
      return selectedPromotion.value;
    }
    return 0;
  }, [selectedPromotion, total]);

  // Tổng tiền sau khi áp dụng promotion
  const totalAfterPromotion =
    total - promotionDiscount > 0 ? total - promotionDiscount : 0;

  // Tổng cuối cùng bao gồm phí vận chuyển
  const finalTotal = totalAfterPromotion + (shipping.shippingFee || 0);

  // Hàm xử lý khi nhấn nút Đặt hàng
  const handleCreateOrder = async () => {
    if (filteredCart.length === 0) {
      toast.warn(t("cart.select_product_to_order"));
      return;
    }
    if (isCreatingOrder || isSubmitting) {
      toast.warn(
        t("cart.processing_order") || "Đang xử lý đơn, vui lòng đợi..."
      );
      return;
    }

    let shippingInfoPayload = null;

    if (selectedAddress) {
      // try map toDistrictId / toWardCode
      const { toDistrictId, toWardCode } = await mapAddressToCodes(
        selectedAddress
      );

      if (!toDistrictId || !toWardCode) {
        // mapping failed -> ask user to open address modal or fill manual form
        toast.warn(
          t("cart.fill_shipping_info") ||
            "Không thể lấy mã quận/phường từ địa chỉ đã chọn. Vui lòng chọn lại hoặc điền thủ công."
        );
        return;
      }

      shippingInfoPayload = {
        fullName: selectedAddress.fullName,
        phone: selectedAddress.phone,
        country: selectedAddress.country || "Vietnam",
        city: selectedAddress.city,
        district: selectedAddress.district,
        ward: selectedAddress.ward,
        street: selectedAddress.street,
        toDistrictId: parseInt(toDistrictId, 10),
        toWardCode: toWardCode?.toString(),
      };
    } else {
      // manual form
      if (
        !shipping.name ||
        !shipping.phone ||
        !shipping.address ||
        !shipping.province ||
        !shipping.district ||
        !shipping.ward
      ) {
        toast.warn(t("cart.fill_shipping_info"));
        return;
      }
      // map codes from locationData
      const dObj = locationData.districts.find(
        (d) => d.code?.toString() === shipping.district?.toString()
      );
      const wObj = locationData.wards.find(
        (w) => w.code?.toString() === shipping.ward?.toString()
      );
      if (!dObj || !wObj) {
        toast.warn(t("cart.fill_shipping_info"));
        return;
      }

      shippingInfoPayload = {
        fullName: shipping.name,
        phone: shipping.phone,
        country: shipping.country,
        city: getProvinceName(shipping.province),
        district: getDistrictName(shipping.district),
        ward: getWardName(shipping.ward),
        street: shipping.address,
        toDistrictId: parseInt(dObj.id, 10),
        toWardCode: wObj.code?.toString(),
      };
    }

    const orderData = {
      orderItems: filteredCart.map((item) => ({ cartItemId: item.cartItemId })),
      shippingInfo: shippingInfoPayload,
      notes: shipping.note,
      paymentMethod: payment === "cod" ? "CASH_ON_DELIVERY" : "PAYPAL",
      promotionId: selectedPromotionId,
      shippingFee: shipping.shippingFee || 0,
    };

    try {
      setIsSubmitting(true);
      // prefer async mutate to avoid duplicate submissions
      if (createOrderAsync) {
        await createOrderAsync(orderData);
      } else {
        // fallback to mutate if async not provided
        createOrder(orderData);
      }
    } catch (err) {
      console.error("Create order failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isCartLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        {t("cart.loading")}
      </div>
    );
  }

  return (
    <div className="flex w-full min-h-screen bg-white font-sans">
      {/* Left: Shipping info */}
      <div className="flex-1 p-10 pr-8 border-r border-gray-100 bg-[#f7f8fa]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {t("cart.shipping_info")}
          </h2>
          <button
            onClick={() => setShowAddressList(true)}
            className="flex items-center gap-2 text-blue-600 text-sm font-semibold hover:underline cursor-pointer"
          >
            <IconMapPin size={16} />
            {t("cart.choose_from_address_book")}
          </button>
        </div>

        {/* Selected Address Display */}
        {selectedAddress ? (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-blue-900">
                  {t("cart.selected_address")}
                </span>
                {selectedAddress.isDefault && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {t("address.default")}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleSelectAddress(null)}
                className="text-red-500 text-xs font-semibold hover:underline cursor-pointer"
              >
                {t("cart.cancel_selection")}
              </button>
            </div>
            <div className="text-sm text-blue-800">
              <p className="font-medium">
                {selectedAddress.fullName} | {selectedAddress.phone}
              </p>
              <p>{formatAddressDisplay(selectedAddress)}</p>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-yellow-800 text-sm">
                {t("cart.no_address_selected")}
              </span>
            </div>
          </div>
        )}

        {selectedAddress && (
          <div className="mb-4 p-3 bg-gray-100 text-sm text-gray-700 rounded-md">
            {t("cart.using_selected_address_note") ||
              "Đang sử dụng địa chỉ đã chọn. Nhấn 'Hủy chọn' để chỉnh sửa thủ công."}
          </div>
        )}

        <div className="flex gap-3 mb-5">
          <input
            className={`border border-gray-300 rounded-full px-4 py-2 flex-1 bg-white focus:outline-blue-500 ${
              selectedAddress ? "opacity-60 cursor-not-allowed" : ""
            }`}
            placeholder={t("cart.name_placeholder")}
            value={shipping.name}
            onChange={(e) =>
              setShipping((s) => ({ ...s, name: e.target.value }))
            }
            disabled={!!selectedAddress}
          />
          <input
            className={`border border-gray-300 rounded-full px-4 py-2 w-56 bg-white focus:outline-blue-500 ${
              selectedAddress ? "opacity-60 cursor-not-allowed" : ""
            }`}
            placeholder={t("cart.phone_placeholder")}
            value={shipping.phone}
            onChange={(e) =>
              setShipping((s) => ({ ...s, phone: e.target.value }))
            }
            disabled={!!selectedAddress}
          />
        </div>

        {/* Location Selection */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Province/City */}
          <select
            className={`border border-gray-300 rounded-full px-4 py-2 bg-white focus:outline-blue-500 ${
              selectedAddress || locationData.isLoading
                ? "opacity-60 cursor-not-allowed"
                : ""
            }`}
            value={shipping.province}
            onChange={(e) => handleProvinceChange(e.target.value)}
            disabled={!!selectedAddress || locationData.isLoading}
          >
            <option value="">{t("cart.select_province")}</option>
            {locationData.provinces.map((province) => (
              <option key={province.code} value={province.code}>
                {province.name}
              </option>
            ))}
          </select>

          {/* District */}
          <select
            className={`border border-gray-300 rounded-full px-4 py-2 bg-white focus:outline-blue-500 ${
              selectedAddress || !shipping.province || locationData.isLoading
                ? "opacity-60 cursor-not-allowed"
                : ""
            }`}
            value={shipping.district}
            onChange={(e) => handleDistrictChange(e.target.value)}
            disabled={
              !!selectedAddress || !shipping.province || locationData.isLoading
            }
          >
            <option value="">{t("cart.select_district")}</option>
            {locationData.districts.map((district) => (
              <option key={district.code} value={district.code}>
                {district.name}
              </option>
            ))}
          </select>

          {/* Ward */}
          <select
            className={`border border-gray-300 rounded-full px-4 py-2 bg-white focus:outline-blue-500 ${
              selectedAddress || !shipping.province || locationData.isLoading
                ? "opacity-60 cursor-not-allowed"
                : ""
            }`}
            value={shipping.ward}
            onChange={(e) => handleWardChange(e.target.value)}
            disabled={
              !!selectedAddress || !shipping.province || locationData.isLoading
            }
          >
            <option value="">{t("cart.select_ward")}</option>
            {locationData.wards.map((ward) => (
              <option key={ward.code} value={ward.code}>
                {ward.name}
              </option>
            ))}
          </select>
        </div>

        <input
          className={`border border-gray-300 rounded-full px-4 py-2 w-full mb-4 bg-white focus:outline-blue-500 ${
            selectedAddress ? "opacity-60 cursor-not-allowed" : ""
          }`}
          placeholder={t("cart.address_placeholder")}
          value={shipping.address}
          onChange={(e) =>
            setShipping((s) => ({ ...s, address: e.target.value }))
          }
          disabled={!!selectedAddress}
        />

        <div className="flex gap-3 mb-4">
          <span className="text-gray-700 text-lg flex items-center font-bold">
            {t("cart.shipping_fee")}:
          </span>
          <div className="flex items-center gap-3">
            {/* Hiển thị phí đã format */}
            <div className="text-sm text-gray-700">
              {formatVND(shipping.shippingFee)}
            </div>
          </div>
        </div>
        <h3 className="text-xl font-bold mb-4 text-gray-900">
          {t("cart.payment_method")}
        </h3>
        <div className="flex flex-col gap-3">
          <label className="flex items-center border border-gray-200 rounded-lg px-4 py-3 cursor-pointer bg-white hover:border-blue-500 transition">
            <input
              type="radio"
              name="payment"
              checked={payment === "cod"}
              onChange={() => setPayment("cod")}
              className="mr-3 accent-blue-600"
            />
            <span className="flex items-center gap-2 text-gray-800">
              <IconReceipt size={20} />
              {t("cart.payment_cod")}
            </span>
          </label>
          <label className="flex items-center border border-gray-200 rounded-lg px-4 py-3 cursor-pointer bg-white hover:border-blue-500 transition">
            <input
              type="radio"
              name="payment"
              checked={payment === "PAYPAL"}
              onChange={() => setPayment("PAYPAL")}
              className="mr-3 accent-blue-600"
            />
            <span className="flex items-center gap-2 text-gray-800">
              <IconCreditCard size={20} />
              {t("cart.payment_online")}
              <span className="text-xs text-gray-400 ml-2">
                {t("cart.payment_online_note")}
              </span>
            </span>
          </label>
        </div>
      </div>
      {/* Right: Cart - existing code remains the same */}
      <div className="w-[600px] p-10 pl-8 flex flex-col bg-white max-h-screen">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {t("cart.title")}
          </h2>
        </div>

        {/* Rest of the cart code remains the same... */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={
                selected?.length === cartItems?.length && cartItems.length > 0
              }
              onChange={handleSelectAll}
              className="accent-blue-600"
            />
            <span className="text-gray-700">{t("cart.select_all")}</span>
          </div>
          <button
            className="text-gray-400 text-sm hover:underline cursor-pointer"
            onClick={handleClearCart}
          >
            {t("cart.clear_all")}
          </button>
        </div>

        <div className="overflow-y-auto h-full flex-1 pr-2 custom-scroll">
          {orderedCartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-24">
              <div className="flex items-center justify-center w-24 h-24 rounded-full bg-blue-50 mb-6 shadow-inner">
                <IconShoppingBag size={48} className="text-blue-400" />
              </div>
              <div className="text-xl font-bold text-gray-700 mb-2">
                {t("cart.empty_title")}
              </div>
              <div className="text-base text-gray-500 mb-6">
                {t("cart.empty_subtitle")}
              </div>
              <Link
                to="/"
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold px-8 py-3 rounded-full text-base shadow-lg transition-all duration-200"
              >
                {t("cart.shop_now")}
              </Link>
            </div>
          ) : (
            orderedCartItems.map((item) => (
              <div
                key={item.cartItemId}
                className="flex items-center border-b border-gray-100 py-5 gap-4 group hover:bg-gray-50 transition"
              >
                <input
                  type="checkbox"
                  checked={selected?.includes(item.cartItemId)}
                  onChange={() => handleSelect(item.cartItemId)}
                  className="mr-2 accent-blue-600"
                />
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  className="w-20 h-20 object-cover rounded-lg bg-gray-100 border border-gray-200"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base truncate text-gray-900">
                    {item.productName}
                  </div>
                  <div className="flex gap-2 mt-1">
                    <select className="border border-gray-200 rounded-full px-2 py-1 text-xs bg-white focus:outline-blue-500">
                      <option>{item.color}</option>
                    </select>
                    <select className="border border-gray-200 rounded-full px-2 py-1 text-xs bg-white focus:outline-blue-500">
                      <option>{item.sizeName}</option>
                    </select>
                  </div>
                  <button
                    className="text-gray-400 text-xs mt-2 hover:text-red-500 flex items-center gap-1 cursor-pointer "
                    onClick={() => handleRemove(item.cartItemId)}
                  >
                    <IconTrash size={14} />
                    {t("cart.remove")}
                  </button>
                </div>
                <div className="flex flex-col items-end min-w-[120px]">
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-lg font-bold hover:bg-gray-100"
                      onClick={() => handleQuantity(item.cartItemId, -1)}
                      disabled={isUpdating}
                    >
                      –
                    </button>
                    <span className="w-6 text-center text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-lg font-bold hover:bg-gray-100"
                      onClick={() => handleQuantity(item.cartItemId, 1)}
                      disabled={isUpdating}
                    >
                      +
                    </button>
                  </div>
                  <div className="font-bold text-base text-right text-blue-700">
                    {item.unitPrice.toLocaleString()}đ
                  </div>
                  <div className="line-through text-gray-400 text-xs text-right">
                    {item.oldPrice?.toLocaleString()}đ
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Promotions section - existing code remains the same */}
          <div className="mb-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {activePromotions?.map((promo) => {
                const canUse = total >= promo.minOrderAmount;
                return (
                  <div
                    key={promo.id}
                    className={`min-w-[300px] bg-gray-50 border rounded-xl px-4 py-3 mr-3 flex flex-col relative cursor-pointer ${
                      selectedPromotionId === promo.id
                        ? "border-blue-600"
                        : "border-gray-200"
                    } ${!canUse ? "opacity-50 pointer-events-none" : ""}`}
                    onClick={() => canUse && setSelectedPromotionId(promo.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-800 font-semibold">
                        {promo.name}
                      </span>
                    </div>
                    <span className="text-blue-600 text-xs ">
                      <span className="font-semibold">{promo.description}</span>
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {t("cart.promotion_expiry", {
                        date: formatDate(promo.endDate),
                      })}
                    </div>
                    {!canUse && (
                      <div className="left-4 bottom-2 text-xs text-red-500">
                        {t("cart.promotion_not_qualified")}
                      </div>
                    )}
                    <input
                      type="radio"
                      name="promotion"
                      checked={selectedPromotionId === promo.id}
                      onChange={() =>
                        canUse && setSelectedPromotionId(promo.id)
                      }
                      className="absolute right-3 top-3 accent-blue-600"
                      disabled={!canUse}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex mt-4 gap-2">
              <input
                className="flex-1 border border-gray-300 rounded-full px-4 py-2 bg-white"
                placeholder={t("cart.discount_code_placeholder")}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button className="bg-black text-white px-6 py-2 rounded-full font-bold">
                {t("cart.apply")}
              </button>
            </div>
          </div>
        </div>

        <CartBottom
          cart={filteredCart}
          total={totalAfterPromotion}
          discount={promotionDiscount}
          onOrder={handleCreateOrder}
          isLoading={isCreatingOrder || isSubmitting}
          paymentMethod={payment}
        />
      </div>

      {/* Address List Modal */}
      <AddressList
        isOpen={showAddressList}
        onClose={() => setShowAddressList(false)}
        onSelectAddress={handleSelectAddress}
        selectedAddressId={selectedAddress?.id}
      />
      <style>
        {`
        .custom-scroll {
          scrollbar-width: thin;
          scrollbar-color: #c1c1c1 #f1f1f1;
          max-height: calc(100vh - 120px);
        }
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
          background: #f1f1f1;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }
      `}
      </style>
    </div>
  );
}
