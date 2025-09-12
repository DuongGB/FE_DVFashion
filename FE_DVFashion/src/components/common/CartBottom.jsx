import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  IconTruckDelivery,
  IconCircleDashedPercentage,
} from "@tabler/icons-react";
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
export default function CartBottom() {
  const [cart, setCart] = useState(demoCart);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const oldTotal = cart.reduce(
    (sum, item) => sum + (item.oldPrice || 0) * item.quantity,
    0
  );
  const discount = oldTotal - total;
  return (
    <div>
      {" "}
      {/* Voucher & Thanh toán khi nhận hàng bar */}
      <div className="fixed bottom-0 left-0 w-full flex z-20">
        <div className="flex-1 flex items-center gap-8 bg-[#edeffe] px-12 py-4 border-t">
          <div className="flex items-center gap-2 font-semibold text-gray-700 text-lg">
            <IconTruckDelivery size={24} />
            Thanh toán khi nhận hàng
          </div>
          <div className="border-l h-8 mx-6" />
          <div className="flex items-center gap-2 font-medium">
            <span className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
              <IconCircleDashedPercentage size={24} />
            </span>
            Voucher
          </div>
        </div>
        <div className="w-[600px] flex items-center justify-between bg-white px-10 py-4 border-t">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-blue-700">
              {total.toLocaleString()}đ
            </span>
            <span className="ml-4 text-xs text-gray-500">
              Tiết kiệm{" "}
              <span className="font-bold">{discount.toLocaleString()}đ</span>
            </span>
          </div>
          <button className="bg-black text-white px-10 py-3 rounded-lg text-medium font-bold">
            ĐẶT HÀNG
          </button>
        </div>
      </div>
    </div>
  );
}
