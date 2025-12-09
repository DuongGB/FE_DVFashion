import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  IconReceipt,
  IconCreditCard,
  IconShoppingBag,
  IconTrash,
  IconMapPin,
} from "@tabler/icons-react";
import CartBottom from "../../components/common/CartBottom";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../../hooks/useCart";
import { useProvinces, useDistricts, useWards } from "../../hooks/useAddress";
import AddressList from "../../components/ui/address/AddressList";
import { useCreateOrder } from "../../hooks/useOrder";
import { toast } from "react-toastify";
import { useShipping } from "../../hooks/useShipping";
import { formatVND } from "../../utils/formatVND";
import { useCustomerVoucher } from "../../hooks/useVoucher";
import { formatCurrency } from "../../utils/formatCurrency";
import { useAuth } from "../../hooks/useAuth";
import { useAddress } from "../../hooks/useAddress";

export default function CartPage() {
  const { t, i18n } = useTranslation();
  const language = i18n.language || "VI";
  const { isAuthenticated } = useAuth();
  const [selectedVoucherCode, setSelectedVoucherCode] = useState("");
  const [voucherInput, setVoucherInput] = useState("");

  const { availableVouchers } = useCustomerVoucher({ page: 0, size: 100 });
  const vouchers = availableVouchers?.values || [];

  //  Sử dụng hooks với cache tốt hơn
  const { defaultAddress, addresses } = useAddress();
  const { data: provinces = [], isLoading: loadingProvinces } = useProvinces();

  const {
    mutate: createOrder,
    mutateAsync: createOrderAsync,
    isLoading: isCreatingOrder,
  } = useCreateOrder();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { calculate: calculateShippingApi } = useShipping();

  // Lấy giỏ hàng từ API
  const {
    cart,
    isLoading: isCartLoading,
    updateQuantity,
    removeItem,
    clearCart,
    isUpdating,
  } = useCart();

  const cartItems = cart?.items || [];

  const [selected, setSelected] = useState([]);
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

  //  Load districts và wards dynamically với hooks có cache
  const { data: districts = [], isLoading: loadingDistricts } = useDistricts(
    shipping.province
  );

  const districtId = useMemo(() => {
    const districtObj = districts.find(
      (d) => d.code?.toString() === shipping.district?.toString()
    );
    return districtObj?.id;
  }, [districts, shipping.district]);

  const { data: wards = [], isLoading: loadingWards } = useWards(districtId);

  //  Combine locationData từ cached hooks
  const locationData = useMemo(
    () => ({
      provinces,
      districts,
      wards,
      isLoading: loadingProvinces || loadingDistricts || loadingWards,
    }),
    [
      provinces,
      districts,
      wards,
      loadingProvinces,
      loadingDistricts,
      loadingWards,
    ]
  );

  // Lọc giỏ hàng theo mục đã chọn
  const filteredCart = useMemo(
    () =>
      cartItems && selected
        ? cartItems.filter((item) => selected?.includes(item.cartItemId))
        : [],
    [cartItems, selected]
  );

  //  Lưu thứ tự cartItemId
  const [itemOrder, setItemOrder] = useState([]);

  //  Sắp xếp lại cartItems theo itemOrder
  const orderedCartItems = useMemo(() => {
    if (!itemOrder.length) return cartItems;
    return itemOrder
      .map((id) => cartItems.find((item) => item.cartItemId === id))
      .filter(Boolean);
  }, [cartItems, itemOrder]);

  // Get display names
  const getProvinceName = useCallback(
    (code) => {
      const province = provinces.find(
        (p) => p.code?.toString() === code?.toString()
      );
      return province ? province.name : "";
    },
    [provinces]
  );

  const getDistrictName = useCallback(
    (code) => {
      const district = districts.find(
        (d) => d.code?.toString() === code?.toString()
      );
      return district ? district.name : "";
    },
    [districts]
  );

  const getWardName = useCallback(
    (code) => {
      const ward = wards.find((w) => w.code?.toString() === code?.toString());
      return ward ? ward.name : "";
    },
    [wards]
  );

  // Helper to build shippingInfo payload
  const buildShippingInfoForCalc = useCallback(
    (useSelectedAddress = false) => {
      const items = filteredCart.map((it) => ({ cartItemId: it.cartItemId }));
      if (!items?.length) return null;

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

      // Find toDistrictId + toWardCode
      let toDistrictId = null;
      let toWardCode = "";

      if (selectedAddress) {
        const prov = provinces.find((p) => p.name === selectedAddress.city);
        if (prov) {
          const d = districts.find(
            (dd) => dd.name === selectedAddress.district
          );
          if (d) {
            toDistrictId = d.id;
            const ward = wards.find((w) => w.name === selectedAddress.ward);
            if (ward) toWardCode = ward.code;
          }
        }
      } else {
        const dObj = districts.find(
          (d) => d.code?.toString() === shipping.district?.toString()
        );
        if (dObj) toDistrictId = dObj.id;
        const wObj = wards.find(
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
        return null;
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
    },
    [
      filteredCart,
      selectedAddress,
      shipping,
      payment,
      provinces,
      districts,
      wards,
      getProvinceName,
      getDistrictName,
      getWardName,
    ]
  );

  //  Debounced shipping calculation với useRef để tránh stale closure
  const shippingCalcTimerRef = useRef(null);

  useEffect(() => {
    // Clear previous timer
    if (shippingCalcTimerRef.current) {
      clearTimeout(shippingCalcTimerRef.current);
    }

    //  Kiểm tra điều kiện trước
    if (!filteredCart?.length) {
      setDeliveryText("");
      setShipping((s) => ({ ...s, shippingFee: 0 }));
      return;
    }

    //  Debounce 800ms
    shippingCalcTimerRef.current = setTimeout(async () => {
      const payload = buildShippingInfoForCalc(!!selectedAddress);

      if (!payload) {
        setDeliveryText("");
        return;
      }

      try {
        const res = await calculateShippingApi(payload);
        const data = res?.data ?? res;
        const fee =
          data?.shippingFee ??
          data?.shippingFee?.value ??
          data?.shippingFee?.amount ??
          0;
        const text =
          data?.deliveryTimeText ??
          (data?.estimatedDeliveryTime
            ? new Date(data.estimatedDeliveryTime).toLocaleString()
            : "");

        setShipping((s) => ({ ...s, shippingFee: Number(fee) }));
        setDeliveryText(text || "");
      } catch (e) {
        console.error("Shipping calc failed:", e);
        setDeliveryText("");
      }
    }, 800);

    return () => {
      if (shippingCalcTimerRef.current) {
        clearTimeout(shippingCalcTimerRef.current);
      }
    };
  }, [
    shipping.province,
    shipping.district,
    shipping.ward,
    selectedAddress?.id, //  Chỉ track id
    filteredCart?.length,
    payment,
    buildShippingInfoForCalc,
    calculateShippingApi,
  ]);

  //  Tự động chọn địa chỉ mặc định
  useEffect(() => {
    if (defaultAddress && !selectedAddress && !manualDeselect) {
      setSelectedAddress(defaultAddress);
    }
  }, [defaultAddress?.id, selectedAddress, manualDeselect]);

  //  Sync selectedAddress khi addresses thay đổi
  useEffect(() => {
    if (!selectedAddress) return;

    const updatedAddress = addresses.find(
      (addr) => addr.id === selectedAddress.id
    );

    if (!updatedAddress) {
      handleSelectAddress(defaultAddress || null);
    } else if (
      JSON.stringify(updatedAddress) !== JSON.stringify(selectedAddress)
    ) {
      setSelectedAddress(updatedAddress);
    }
  }, [addresses.length, selectedAddress?.id]);

  //  Merge 2 useEffect về cart items thành 1
  useEffect(() => {
    if (cartItems.length > 0) {
      const newIds = cartItems.map((item) => item.cartItemId);

      // Update selected chỉ khi cần
      setSelected((prev) => {
        const needsUpdate =
          prev.length !== newIds.length ||
          !prev.every((id) => newIds.includes(id));
        return needsUpdate ? newIds : prev;
      });

      // Update itemOrder
      setItemOrder((prev) => {
        if (!prev.length) return newIds;
        return [
          ...prev.filter((id) => newIds.includes(id)),
          ...newIds.filter((id) => !prev.includes(id)),
        ];
      });
    } else {
      setSelected([]);
      setItemOrder([]);
    }
  }, [cartItems.length]);

  // Handle province change
  const handleProvinceChange = useCallback((provinceCode) => {
    setShipping((prev) => ({
      ...prev,
      province: provinceCode,
      district: "",
      ward: "",
    }));
  }, []);

  // Handle district change
  const handleDistrictChange = useCallback((districtCode) => {
    setShipping((prev) => ({
      ...prev,
      district: districtCode,
      ward: "",
    }));
  }, []);

  // Handle ward change
  const handleWardChange = useCallback((wardCode) => {
    setShipping((prev) => ({ ...prev, ward: wardCode }));
  }, []);

  // Select address from address book
  const handleSelectAddress = useCallback(
    async (address) => {
      setSelectedAddress(address);

      if (address) {
        setManualDeselect(false);
        setShipping((prev) => ({
          ...prev,
          name: "",
          phone: "",
          address: "",
          country: address.country || "Vietnam",
        }));

        // Find province by name
        const province = provinces.find((p) => p.name === address.city);
        if (province) {
          setShipping((prev) => ({
            ...prev,
            province: province.code?.toString() ?? "",
          }));
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
    },
    [provinces]
  );

  // Format address display
  const formatAddressDisplay = useCallback((address) => {
    if (!address) return "";
    return `${address.street}, ${address.ward}, ${address.district}, ${address.city}`;
  }, []);

  // Select all/none
  const handleSelectAll = useCallback(
    (e) => {
      const newSelected = e.target.checked
        ? cartItems.map((item) => item.cartItemId)
        : [];
      setSelected(newSelected);
    },
    [cartItems]
  );

  // Select single item
  const handleSelect = useCallback((id) => {
    setSelected((prev) =>
      prev?.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  // Change quantity
  const handleQuantity = useCallback(
    async (id, delta) => {
      if (isUpdating) return;

      const item = cartItems.find((i) => i.cartItemId === id);
      if (!item) return;

      const newQuantity = item.quantity + delta;
      if (newQuantity <= 0) {
        await removeItem(id);
        setSelected((prev) => prev.filter((i) => i !== id));
      } else {
        await updateQuantity({ cartItemId: id, newQuantity });
      }
    },
    [cartItems, isUpdating, updateQuantity, removeItem]
  );

  // Remove item
  const handleRemove = useCallback(
    async (id) => {
      await removeItem(id);
      setSelected((prev) => prev.filter((i) => i !== id));
    },
    [removeItem]
  );

  // Clear cart
  const handleClearCart = useCallback(async () => {
    if (!isAuthenticated) return;
    await clearCart();
    setSelected([]);
  }, [isAuthenticated, clearCart]);

  // Calculate total
  const total = useMemo(
    () =>
      filteredCart.reduce(
        (acc, item) => acc + item.unitPrice * item.quantity,
        0
      ),
    [filteredCart]
  );

  // Calculate voucher discount
  const voucherDiscount = useMemo(() => {
    if (!selectedVoucherCode) return 0;

    const voucher = vouchers.find((v) => v.code === selectedVoucherCode);
    if (!voucher) return 0;

    if (voucher.discountType === "PERCENTAGE") {
      const discount = (total * voucher.discountValue) / 100;
      if (voucher.hasMaxDiscount && voucher.maxDiscountAmount > 0) {
        return Math.min(discount, voucher.maxDiscountAmount);
      }
      return discount;
    }

    if (voucher.discountType === "FIXED_AMOUNT") {
      return voucher.discountValue;
    }

    return 0;
  }, [selectedVoucherCode, vouchers, total]);

  // Final total
  const finalTotal = useMemo(() => {
    const afterVoucher = total - voucherDiscount;
    return Math.max(afterVoucher, 0);
  }, [total, voucherDiscount]);

  // Apply voucher
  const handleApplyVoucher = useCallback(() => {
    if (!voucherInput.trim()) {
      toast.warn(t("cart.enter_voucher_code"));
      return;
    }

    const voucher = vouchers.find(
      (v) => v.code.toUpperCase() === voucherInput.trim().toUpperCase()
    );

    const now = new Date();
    if (
      !voucher ||
      (voucher.startDate && now < new Date(voucher.startDate)) ||
      (voucher.endDate && now > new Date(voucher.endDate)) ||
      (voucher.maxTotalUsage > 0 &&
        voucher.currentUsage >= voucher.maxTotalUsage)
    ) {
      toast.error(t("cart.voucher_not_active") || "Voucher không có hiệu lực");
      return;
    }

    if (voucher.minOrderAmount > total) {
      toast.error(
        t("cart.voucher_min_order_not_met", {
          amount: formatCurrency(voucher.minOrderAmount),
        })
      );
      return;
    }

    setSelectedVoucherCode(voucher.code);
    toast.success(t("cart.voucher_applied"));
  }, [voucherInput, vouchers, total, t]);

  // Create order
  const handleCreateOrder = useCallback(async () => {
    if (filteredCart?.length === 0) {
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
      const prov = provinces.find((p) => p.name === selectedAddress.city);
      if (!prov) {
        toast.warn(t("cart.fill_shipping_info"));
        return;
      }

      const dist = districts.find((d) => d.name === selectedAddress.district);
      if (!dist) {
        toast.warn(t("cart.fill_shipping_info"));
        return;
      }

      const wardObj = wards.find((w) => w.name === selectedAddress.ward);
      if (!wardObj) {
        toast.warn(t("cart.fill_shipping_info"));
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
        toDistrictId: parseInt(dist.id, 10),
        toWardCode: wardObj.code?.toString(),
      };
    } else {
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

      const dObj = districts.find(
        (d) => d.code?.toString() === shipping.district?.toString()
      );
      const wObj = wards.find(
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
      voucherCode: selectedVoucherCode || undefined,
    };

    try {
      setIsSubmitting(true);
      if (createOrderAsync) {
        await createOrderAsync(orderData);
      } else {
        createOrder(orderData);
      }
    } catch (err) {
      console.error("Create order failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    filteredCart,
    isCreatingOrder,
    isSubmitting,
    selectedAddress,
    shipping,
    payment,
    selectedVoucherCode,
    provinces,
    districts,
    wards,
    getProvinceName,
    getDistrictName,
    getWardName,
    createOrderAsync,
    createOrder,
    t,
  ]);

  // Valid vouchers
  const now = new Date();
  const validVouchers = useMemo(() => {
    return vouchers.filter((voucher) => {
      const end = voucher.endDate ? new Date(voucher.endDate) : null;
      if (
        voucher.disabled ||
        (end && now > end) ||
        (voucher.maxTotalUsage > 0 &&
          voucher.currentUsage >= voucher.maxTotalUsage)
      ) {
        return false;
      }
      return true;
    });
  }, [vouchers]);

  // Loading state
  if (isCartLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        {t("cart.loading")}
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen bg-white font-sans pb-28 lg:pb-0">
      {/* Left: Shipping info */}
      <div className="flex-1 p-4 md:p-6 lg:p-10 lg:pr-8 border-r-0 lg:border-r border-gray-100 bg-[#f7f8fa]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
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
                <span className="font-medium text-blue-900 text-sm md:text-base">
                  {t("cart.selected_address")}
                </span>
                {selectedAddress.isDefault && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-[10px] md:text-xs rounded-full whitespace-nowrap">
                    {t("address.default")}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleSelectAddress(null)}
                className="text-red-500 text-xs font-semibold hover:underline cursor-pointer whitespace-nowrap ml-2"
              >
                {t("cart.cancel_selection")}
              </button>
            </div>
            <div className="text-sm text-blue-800 break-words">
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

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
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
            className={`border border-gray-300 rounded-full px-4 py-2 w-full sm:w-56 bg-white focus:outline-blue-500 ${
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {/* Province/City */}
          <select
            className={`border border-gray-300 rounded-full px-4 py-2 bg-white focus:outline-blue-500 text-sm ${
              selectedAddress || locationData.isLoading
                ? "opacity-60 cursor-not-allowed"
                : ""
            }`}
            value={shipping.province}
            onChange={(e) => handleProvinceChange(e.target.value)}
            disabled={!!selectedAddress || locationData.isLoading}
          >
            <option value="">{t("cart.select_province")}</option>
            {provinces.map((province) => (
              <option key={province.code} value={province.code}>
                {province.name}
              </option>
            ))}
          </select>

          {/* District */}
          <select
            className={`border border-gray-300 rounded-full px-4 py-2 bg-white focus:outline-blue-500 text-sm ${
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
            {districts.map((district) => (
              <option key={district.code} value={district.code}>
                {district.name}
              </option>
            ))}
          </select>

          {/* Ward */}
          <select
            className={`border border-gray-300 rounded-full px-4 py-2 bg-white focus:outline-blue-500 text-sm ${
              selectedAddress || !shipping.district || locationData.isLoading
                ? "opacity-60 cursor-not-allowed"
                : ""
            }`}
            value={shipping.ward}
            onChange={(e) => handleWardChange(e.target.value)}
            disabled={
              !!selectedAddress || !shipping.district || locationData.isLoading
            }
          >
            <option value="">{t("cart.select_ward")}</option>
            {wards.map((ward) => (
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
              className="mr-3 accent-blue-600 flex-shrink-0"
            />
            <span className="flex items-center gap-2 text-gray-800 text-sm md:text-base">
              <IconReceipt size={20} className="flex-shrink-0" />
              {t("cart.payment_cod")}
            </span>
          </label>
          <label className="flex items-center border border-gray-200 rounded-lg px-4 py-3 cursor-pointer bg-white hover:border-blue-500 transition">
            <input
              type="radio"
              name="payment"
              checked={payment === "PAYPAL"}
              onChange={() => setPayment("PAYPAL")}
              className="mr-3 accent-blue-600 flex-shrink-0"
            />
            <span className="flex items-center gap-2 text-gray-800 text-sm md:text-base flex-wrap">
              <IconCreditCard size={20} className="flex-shrink-0" />
              {t("cart.payment_online")}
              <span className="text-xs text-gray-400 ml-0 md:ml-2 w-full md:w-auto mt-1 md:mt-0">
                {t("cart.payment_online_note")}
              </span>
            </span>
          </label>
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-full lg:w-[500px] xl:w-[600px] p-4 lg:pl-8 lg:pr-4 mb-8 flex flex-col bg-gray-100 h-auto lg:max-h-screen rounded-none lg:rounded-l-2xl border-l-0 lg:border-l border-gray-200 mt-4 lg:mt-0">
        <div className="flex items-center justify-between mb-4 lg:mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            {t("cart.title")}
          </h2>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={
                selected?.length === cartItems?.length && cartItems?.length > 0
              }
              onChange={handleSelectAll}
              className="accent-blue-600"
            />
            <span className="text-gray-700 text-sm md:text-base">
              {t("cart.select_all")}
            </span>
          </div>
          <button
            className="text-gray-400 text-sm hover:underline cursor-pointer"
            onClick={handleClearCart}
          >
            {t("cart.clear_all")}
          </button>
        </div>

        <div className="overflow-y-auto flex-1 pr-2 custom-scroll lg:h-full h-auto">
          {orderedCartItems?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 lg:py-24">
              <div className="flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-blue-50 mb-6 shadow-inner">
                <IconShoppingBag
                  size={40}
                  className="text-blue-400 md:w-12 md:h-12"
                />
              </div>
              <div className="text-lg md:text-xl font-bold text-gray-700 mb-2">
                {t("cart.empty_title")}
              </div>
              <div className="text-sm md:text-base text-gray-500 mb-6 text-center px-4">
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
                className="flex items-start md:items-center border-b border-gray-200 py-5 gap-3 md:gap-4 group hover:bg-gray-50 transition rounded-lg px-2"
              >
                <input
                  type="checkbox"
                  checked={selected?.includes(item.cartItemId)}
                  onChange={() => handleSelect(item.cartItemId)}
                  className="mt-2 md:mt-0 mr-2 accent-blue-600 flex-shrink-0"
                />
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg bg-gray-100 border border-gray-200 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm md:text-base text-gray-900 line-clamp-2">
                    {item.productName}
                  </div>
                  <div className="flex gap-2 mt-1">
                    <span className="border border-gray-200 rounded-full px-2 py-1 text-xs bg-white text-gray-600">
                      {item.color}
                    </span>
                    <span className="border border-gray-200 rounded-full px-2 py-1 text-xs bg-white text-gray-600">
                      {item.sizeName}
                    </span>
                  </div>
                  <button
                    className="text-gray-400 text-xs mt-2 hover:text-red-500 flex items-center gap-1 cursor-pointer"
                    onClick={() => handleRemove(item.cartItemId)}
                  >
                    <IconTrash size={14} />
                    {t("cart.remove")}
                  </button>
                </div>

                <div className="flex flex-col items-end min-w-[80px] md:min-w-[120px]">
                  <div className="flex items-center gap-1 md:gap-2 mb-2">
                    <button
                      className="w-6 h-6 md:w-7 md:h-7 rounded-full border border-gray-300 flex items-center justify-center text-sm md:text-lg font-bold hover:bg-gray-100"
                      onClick={() => handleQuantity(item.cartItemId, -1)}
                      disabled={isUpdating}
                    >
                      –
                    </button>
                    <span className="w-5 md:w-6 text-center text-gray-900 text-sm md:text-base">
                      {item.quantity}
                    </span>
                    <button
                      className="w-6 h-6 md:w-7 md:h-7 rounded-full border border-gray-300 flex items-center justify-center text-sm md:text-lg font-bold hover:bg-gray-100"
                      onClick={() => handleQuantity(item.cartItemId, 1)}
                      disabled={isUpdating}
                    >
                      +
                    </button>
                  </div>
                  <div className="font-bold text-sm md:text-base text-right text-blue-700">
                    {item.unitPrice.toLocaleString()}đ
                  </div>
                  {item.oldPrice && (
                    <div className="line-through text-gray-400 text-xs text-right">
                      {item.oldPrice?.toLocaleString()}đ
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {/* Voucher Section */}
          <div className="mt-6 mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              {t("cart.voucher_code")}
            </h3>

            {selectedVoucherCode && (
              <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold text-green-800">
                      {t("cart.voucher_applied")}: {selectedVoucherCode}
                    </span>
                    <p className="text-xs text-green-600 mt-1">
                      {t("cart.discount")}: {formatCurrency(voucherDiscount)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedVoucherCode("");
                      setVoucherInput("");
                      toast.info(t("cart.voucher_removed"));
                    }}
                    className="text-red-500 text-xs font-semibold hover:underline"
                  >
                    {t("cart.remove")}
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-2 mb-3">
              <input
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:border-blue-500 text-sm"
                placeholder={t("cart.enter_voucher_code")}
                value={voucherInput}
                onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                disabled={!!selectedVoucherCode}
              />
              <button
                onClick={handleApplyVoucher}
                disabled={!!selectedVoucherCode}
                className="bg-blue-600 text-white px-4 md:px-6 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {t("cart.apply")}
              </button>
            </div>

            {validVouchers?.length > 0 && !selectedVoucherCode && (
              <div>
                <details className="text-sm">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
                    {t("cart.view_available_vouchers")} ({validVouchers?.length}
                    )
                  </summary>
                  <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                    {validVouchers.map((voucher) => {
                      const canUse = total >= voucher.minOrderAmount;
                      const start = voucher.startDate
                        ? new Date(voucher.startDate)
                        : null;
                      const notYetActive = start && now < start;
                      const userUsed =
                        voucher.maxUsagePerUser > 0 &&
                        voucher.currentUserUsage >= voucher.maxUsagePerUser;

                      let productNotMatch = false;
                      if (
                        voucher.voucherType === "PRODUCT_SPECIFIC" &&
                        Array.isArray(voucher.products)
                      ) {
                        const cartProductIds = orderedCartItems.map(
                          (item) => item.productId
                        );
                        productNotMatch = !voucher.products.some((p) =>
                          cartProductIds.includes(p.productId)
                        );
                      }

                      const isDisabled =
                        !canUse || notYetActive || userUsed || productNotMatch;

                      return (
                        <div
                          key={voucher.id}
                          className={`p-2 bg-gray-50 border border-gray-200 rounded transition-colors ${
                            !isDisabled
                              ? "cursor-pointer hover:bg-blue-50 hover:border-blue-300"
                              : "opacity-50 cursor-not-allowed"
                          }`}
                          onClick={() => {
                            if (!isDisabled) {
                              setVoucherInput(voucher.code);
                            }
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <span className="font-semibold text-gray-800 text-xs">
                                {t("voucher.code")}
                                {voucher.code}
                              </span>
                              <p className="text-xs text-gray-600 mt-1">
                                {voucher.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {t("voucher.start_date")}:{" "}
                                {voucher.startDate
                                  ? new Date(
                                      voucher.startDate
                                    ).toLocaleDateString()
                                  : ""}
                                {" - "}
                                {t("voucher.end_date")}:{" "}
                                {voucher.endDate
                                  ? new Date(
                                      voucher.endDate
                                    ).toLocaleDateString()
                                  : ""}
                              </p>
                              {voucher.minOrderAmount > 0 && (
                                <p className="text-xs text-gray-500">
                                  {t("voucher.min_order")}:{" "}
                                  {formatCurrency(voucher.minOrderAmount)}
                                </p>
                              )}
                              {voucher.hasMaxDiscount &&
                                voucher.maxDiscountAmount > 0 && (
                                  <p className="text-xs text-gray-500">
                                    {t("voucher.max_discount")}:{" "}
                                    {formatCurrency(voucher.maxDiscountAmount)}
                                  </p>
                                )}
                              {voucher.voucherType === "PRODUCT_SPECIFIC" && (
                                <p className="text-xs text-orange-600 mt-1">
                                  {t("voucher.product_specific_note")}
                                </p>
                              )}
                              {!canUse && (
                                <p className="text-xs text-red-500 mt-1">
                                  {t("cart.voucher_min_order_not_met", {
                                    amount: formatCurrency(
                                      voucher.minOrderAmount
                                    ),
                                  })}
                                </p>
                              )}
                              {notYetActive && (
                                <p className="text-xs text-yellow-600 mt-1">
                                  {t("cart.voucher_not_active") ||
                                    "Voucher chưa có hiệu lực"}
                                </p>
                              )}
                              {userUsed && (
                                <p className="text-xs text-red-500 mt-1">
                                  {t("cart.voucher_user_limit_reached") ||
                                    "Bạn đã dùng hết lượt voucher này"}
                                </p>
                              )}
                            </div>
                            <span className="text-xs font-bold text-orange-600">
                              {voucher.discountType === "PERCENTAGE"
                                ? `${voucher.discountValue}%`
                                : formatCurrency(voucher.discountValue)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </details>
              </div>
            )}
          </div>
        </div>

        <CartBottom
          cart={filteredCart}
          total={finalTotal + shipping.shippingFee}
          discount={voucherDiscount}
          onOrder={handleCreateOrder}
          isLoading={isCreatingOrder || isSubmitting}
          paymentMethod={payment}
        />
      </div>

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
        }
        @media (min-width: 1024px) {
          .custom-scroll {
            max-height: calc(100vh - 120px);
          }
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
