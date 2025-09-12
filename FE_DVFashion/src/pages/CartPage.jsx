import { useState } from "react";
import { IconReceipt, IconCreditCard } from "@tabler/icons-react";

const demoCart = [
  {
    id: 1,
    name: "T-shirt thể thao nam FlexLine Active V-neck",
    color: "Navy",
    size: "2XL",
    price: 179000,
    oldPrice: 199000,
    quantity: 1,
    image: "https://pos.nvncdn.com/f4d87e-8901/ps/20250225_BLkcRuPLdV.jpeg",
  },
  {
    id: 2,
    name: "Singlet chạy bộ AirRush Gradient",
    color: "Đen",
    size: "3XL",
    price: 160000,
    oldPrice: 189000,
    quantity: 1,
    image: "https://pos.nvncdn.com/f4d87e-8901/ps/20250225_BLkcRuPLdV.jpeg",
  },
  {
    id: 3,
    name: "Tshirt chạy bộ nữ AirRush Gradient",
    color: "Trắng",
    size: "M",
    price: 169000,
    oldPrice: 199000,
    quantity: 1,
    image: "https://pos.nvncdn.com/f4d87e-8901/ps/20250225_BLkcRuPLdV.jpeg",
  },
  {
    id: 4,
    name: "Tất cổ ngắn chạy bộ nữ",
    color: "Hồng",
    size: "Hồng",
    price: 0,
    oldPrice: 79000,
    quantity: 1,
    image: "https://pos.nvncdn.com/f4d87e-8901/ps/20250225_BLkcRuPLdV.jpeg",
    gift: true,
  },
  {
    id: 5,
    name: "T-shirt thể thao nam FlexLine Active",
    color: "Đen",
    size: "L",
    price: 179000,
    oldPrice: 199000,
    quantity: 1,
    image: "https://pos.nvncdn.com/f4d87e-8901/ps/20250225_BLkcRuPLdV.jpeg",
  },
];

export default function CartPage() {
  const [cart, setCart] = useState(demoCart);
  const [selected, setSelected] = useState(cart.map((item) => item.id));
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

  const handleSelectAll = (e) => {
    setSelected(e.target.checked ? cart.map((item) => item.id) : []);
  };

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleQuantity = (id, delta) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(1, item.quantity + delta),
            }
          : item
      )
    );
  };

  const handleRemove = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    setSelected((prev) => prev.filter((i) => i !== id));
  };

  return (
    <div className="flex w-full min-h-screen bg-white font-sans">
      {/* Left: Shipping info */}
      <div className="flex-1 p-10 pr-8 border-r border-gray-100 bg-[#f7f8fa]">
        <h2 className="text-2xl font-bold mb-8 text-gray-900">
          Thông tin vận chuyển
        </h2>
        <div className="flex gap-3 mb-5">
          <select className="border border-gray-300 rounded-full px-4 py-2 bg-white focus:outline-blue-500">
            <option>Anh/Chị</option>
            <option>Anh</option>
            <option>Chị</option>
            <option>Không tiết lộ</option>
          </select>
          <input
            className="border border-gray-300 rounded-full px-4 py-2 flex-1 bg-white focus:outline-blue-500"
            placeholder="Nhập họ và tên của bạn"
            value={shipping.name}
            onChange={(e) =>
              setShipping((s) => ({ ...s, name: e.target.value }))
            }
          />
          <input
            className="border border-gray-300 rounded-full px-4 py-2 w-56 bg-white focus:outline-blue-500"
            placeholder="Số điện thoại"
            value={shipping.phone}
            onChange={(e) =>
              setShipping((s) => ({ ...s, phone: e.target.value }))
            }
          />
        </div>
        <input
          className="border border-gray-300 rounded-full px-4 py-2 w-full mb-4 bg-white focus:outline-blue-500"
          placeholder="Email"
          value={shipping.email}
          onChange={(e) =>
            setShipping((s) => ({ ...s, email: e.target.value }))
          }
        />
        <input
          className="border border-gray-300 rounded-full px-4 py-2 w-full mb-4 bg-white focus:outline-blue-500"
          placeholder="Địa chỉ"
          value={shipping.address}
          onChange={(e) =>
            setShipping((s) => ({ ...s, address: e.target.value }))
          }
        />
        <input
          className="border border-gray-300 rounded-full px-4 py-2 w-full mb-4 bg-white focus:outline-blue-500"
          placeholder="Chọn tỉnh/thành phố"
        />
        <input
          className="border border-gray-300 rounded-full px-4 py-2 w-full mb-4 bg-white focus:outline-blue-500"
          placeholder="Nhập ghi chú"
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
          <span className="text-gray-700">
            Gọi người khác nhận hàng (nếu có)
          </span>
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
          <span className="text-gray-700">Xuất hoá đơn VAT</span>
        </div>
        <h3 className="text-xl font-bold mb-4 text-gray-900">
          Hình thức thanh toán
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
              Thanh toán khi nhận hàng
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
              Thanh toán qua Paypal
              <span className="text-xs text-gray-400 ml-2">
                Hỗ trợ mọi hình thức thanh toán
              </span>
            </span>
          </label>
        </div>
      </div>
      {/* Right: Cart */}
      <div className="w-[600px] p-10 pl-8 flex flex-col bg-white">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Giỏ hàng</h2>
          <button className="text-blue-600 text-sm font-semibold hover:underline">
            Chọn từ sổ địa chỉ
          </button>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selected.length === cart.length}
              onChange={handleSelectAll}
              className="accent-blue-600"
            />
            <span className="text-gray-700">Tất cả sản phẩm</span>
          </div>
          <button
            className="text-gray-400 text-sm hover:underline"
            onClick={() => {
              setCart([]);
              setSelected([]);
            }}
          >
            Xóa tất cả
          </button>
        </div>
        <div className="overflow-y-auto flex-1 pr-2 custom-scroll">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex items-center border-b border-gray-100 py-5 gap-4 group hover:bg-gray-50 transition"
            >
              <input
                type="checkbox"
                checked={selected.includes(item.id)}
                onChange={() => handleSelect(item.id)}
                className="mr-2 accent-blue-600"
              />
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-lg bg-gray-100 border border-gray-200"
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-base truncate text-gray-900">
                  {item.name}
                </div>
                <div className="flex gap-2 mt-1">
                  <select className="border border-gray-200 rounded-full px-2 py-1 text-xs bg-white focus:outline-blue-500">
                    <option>{item.color}</option>
                  </select>
                  <select className="border border-gray-200 rounded-full px-2 py-1 text-xs bg-white focus:outline-blue-500">
                    <option>{item.size}</option>
                  </select>
                </div>
                <button
                  className="text-gray-400 text-xs mt-2 hover:text-red-500 flex items-center gap-1"
                  onClick={() => handleRemove(item.id)}
                >
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M3 6h18M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14Z" />
                  </svg>
                  Xóa
                </button>
                {item.gift && (
                  <span className="inline-block bg-orange-100 text-orange-600 text-xs rounded px-2 py-1 mt-1 font-semibold">
                    Quà tặng
                  </span>
                )}
              </div>
              <div className="flex flex-col items-end min-w-[120px]">
                <div className="flex items-center gap-2 mb-2">
                  <button
                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-lg font-bold hover:bg-gray-100"
                    onClick={() => handleQuantity(item.id, -1)}
                  >
                    –
                  </button>
                  <span className="w-6 text-center text-gray-900">
                    {item.quantity}
                  </span>
                  <button
                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-lg font-bold hover:bg-gray-100"
                    onClick={() => handleQuantity(item.id, 1)}
                  >
                    +
                  </button>
                </div>
                <div className="font-bold text-base text-right text-blue-700">
                  {item.price.toLocaleString()}đ
                </div>
                <div className="line-through text-gray-400 text-xs text-right">
                  {item.oldPrice?.toLocaleString()}đ
                </div>
                {item.gift && (
                  <div className="text-xs text-gray-400 text-right">x1</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>
        {`
          .custom-scroll {
            scrollbar-width: thin;
            scrollbar-color: #c1c1c1 #f1f1f1;
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
