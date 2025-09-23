import { X } from "react-feather";
import { ShoppingBag } from "react-feather";
import { useCart } from "../../../hooks/useCart";

export default function CartDropdown({ onRemove, onViewAll }) {
  const { cart, isLoading } = useCart();

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">Đang tải giỏ hàng...</div>
    );
  }

  const items = cart?.items || [];
  const total = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  return (
    <div
      className="absolute -right-8 top-7 w-[420px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 p-4 animate-fadeIn h-100"
      style={{
        marginTop: "12px",
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
        border: "1px solid #e5e7eb",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Mũi tên tam giác */}
      <div
        style={{
          position: "absolute",
          top: "-16px",
          right: "32px",
          width: 0,
          height: 0,
          borderLeft: "14px solid transparent",
          borderRight: "14px solid transparent",
          borderBottom: "16px solid #fff",
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.06))",
          zIndex: 51,
        }}
      />
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-500 text-sm">
          Tạm tính:{" "}
          <span className="font-bold text-black text-base">
            {total.toLocaleString()}đ
          </span>
          <span className="text-gray-400 text-xs ml-2">
            ({items.length} sản phẩm)
          </span>
        </span>
        <button
          className="text-blue-600 text-sm font-semibold hover:underline cursor-pointer"
          onClick={onViewAll}
        >
          Xem tất cả
        </button>
      </div>
      <div className="max-h-[480px] h-[340px] overflow-y-auto pr- custom-scroll">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center text-gray-500">
            <div>
              <ShoppingBag size={48} className="mb-4 w-full" />
              Người ta có đôi có cặp, còn giỏ hàng của bạn thì... trống trơn
            </div>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.cartItemId}
              className="flex gap-3 items-center py-2 border-b last:border-b-0 group"
            >
              <img
                src={item.imageUrl}
                alt={item.productName}
                className="w-16 h-16 object-cover rounded-lg bg-gray-100"
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{item.productName}</div>
                <div className="text-xs text-gray-500">
                  {item.color} / {item.sizeName}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold text-base text-black">
                    {item.unitPrice.toLocaleString()}đ
                  </span>
                </div>
                <div className="text-xs text-gray-500">x{item.quantity}</div>
              </div>
              <button
                className="ml-2 text-gray-400 hover:text-red-500"
                onClick={() => onRemove(item.cartItemId)}
                aria-label="Xóa"
                tabIndex={0}
              >
                <X size={18} />
              </button>
            </div>
          ))
        )}
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
