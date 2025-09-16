import { useState, useEffect, useMemo } from "react";
import {
  IconReceipt,
  IconCreditCard,
  IconShoppingBag,
  IconTrash,
} from "@tabler/icons-react";
import CartBottom from "../components/common/CartBottom";
import { Link } from "react-router-dom";
import { usePromotion } from "../hooks/usePromotion";
import { useTranslation } from "react-i18next";
import { useCart } from "../hooks/useCart";

export default function CartPage() {
  const { t, i18n } = useTranslation();
  const language = i18n.language || "VI";
  const { promotions = [], isLoading: isPromoLoading } = usePromotion(language);

  // Lấy giỏ hàng từ API
  const {
    cart,
    isLoading: isCartLoading,
    updateQuantity,
    removeItem,
    clearCart,
    isUpdating,
  } = useCart();

  // Chuyển đổi dữ liệu từ API sang định dạng dùng trong UI
  const cartItems = cart?.items || [];

  // Quản lý selected theo cartItemId
  const [selected, setSelected] = useState([]);
  const [selectedPromotionId, setSelectedPromotionId] = useState(null);
  const [input, setInput] = useState("");
  const [shipping, setShipping] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    province: "",
    note: "",
    otherReceiver: false,
    vat: false,
  });
  const [payment, setPayment] = useState("cod");
  // Lưu thứ tự cartItemId ban đầu
  const [itemOrder, setItemOrder] = useState(
    cartItems.map((i) => i.cartItemId)
  );

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

  // Lọc giỏ hàng theo mục đã chọn
  const filteredCart = useMemo(
    () =>
      cartItems && selected
        ? cartItems.filter((item) => selected?.includes(item.cartItemId))
        : [],
    [cartItems, selected]
  );

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
        <h2 className="text-2xl font-bold mb-8 text-gray-900">
          {t("cart.shipping_info")}
        </h2>
        <div className="flex gap-3 mb-5">
          <select className="border border-gray-300 rounded-full px-4 py-2 bg-white focus:outline-blue-500">
            <option>{t("cart.salutation.default")}</option>
            <option>{t("cart.salutation.male")}</option>
            <option>{t("cart.salutation.female")}</option>
            <option>{t("cart.salutation.other")}</option>
          </select>
          <input
            className="border border-gray-300 rounded-full px-4 py-2 flex-1 bg-white focus:outline-blue-500"
            placeholder={t("cart.name_placeholder")}
            value={shipping.name}
            onChange={(e) =>
              setShipping((s) => ({ ...s, name: e.target.value }))
            }
          />
          <input
            className="border border-gray-300 rounded-full px-4 py-2 w-56 bg-white focus:outline-blue-500"
            placeholder={t("cart.phone_placeholder")}
            value={shipping.phone}
            onChange={(e) =>
              setShipping((s) => ({ ...s, phone: e.target.value }))
            }
          />
        </div>
        <input
          className="border border-gray-300 rounded-full px-4 py-2 w-full mb-4 bg-white focus:outline-blue-500"
          placeholder={t("cart.email_placeholder")}
          value={shipping.email}
          onChange={(e) =>
            setShipping((s) => ({ ...s, email: e.target.value }))
          }
        />
        <input
          className="border border-gray-300 rounded-full px-4 py-2 w-full mb-4 bg-white focus:outline-blue-500"
          placeholder={t("cart.address_placeholder")}
          value={shipping.address}
          onChange={(e) =>
            setShipping((s) => ({ ...s, address: e.target.value }))
          }
        />
        <input
          className="border border-gray-300 rounded-full px-4 py-2 w-full mb-4 bg-white focus:outline-blue-500"
          placeholder={t("cart.province_placeholder")}
        />
        <input
          className="border border-gray-300 rounded-full px-4 py-2 w-full mb-4 bg-white focus:outline-blue-500"
          placeholder={t("cart.note_placeholder")}
          value={shipping.note}
          onChange={(e) => setShipping((s) => ({ ...s, note: e.target.value }))}
        />
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            className="mr-2 accent-blue-600"
            checked={shipping.otherReceiver}
            onChange={(e) =>
              setShipping((s) => ({ ...s, otherReceiver: e.target.checked }))
            }
          />
          <span className="text-gray-700">{t("cart.other_receiver")}</span>
        </div>
        <div className="flex items-center mb-8">
          <input
            type="checkbox"
            className="mr-2 accent-blue-600"
            checked={shipping.vat}
            onChange={(e) =>
              setShipping((s) => ({ ...s, vat: e.target.checked }))
            }
          />
          <span className="text-gray-700">{t("cart.vat")}</span>
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
              checked={payment === "zalopay"}
              onChange={() => setPayment("zalopay")}
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
      {/* Right: Cart */}
      <div className="w-[600px] p-10 pl-8 flex flex-col bg-white max-h-screen">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {t("cart.title")}
          </h2>
          <button className="text-blue-600 text-sm font-semibold hover:underline">
            {t("cart.choose_from_address_book")}
          </button>
        </div>
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

          {/* Mã giảm giá */}
          <div className="mb-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {promotions?.map((promo) => {
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
        />
      </div>
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
