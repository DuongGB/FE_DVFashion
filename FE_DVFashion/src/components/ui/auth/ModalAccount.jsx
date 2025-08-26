import { Link } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";

export default function ModalAccount({ show, onClose, user }) {
  const { logout, isLogoutLoading } = useAuth();
  if (!show) return null;

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-end z-50 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6 relative min-w-[400px] max-w-[420px] h-auto overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ right: 0 }}
      >
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
          onClick={onClose}
        >
          &times;
        </button>
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-1">Hi, {user?.fullName}</h2>
          <div className="text-blue-600 font-semibold flex items-center gap-2">
            THÀNH VIÊN MỚI
            <span className="inline-block bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
              🛡️
            </span>
          </div>
        </div>
        {/* Banner */}
        <div className="mb-4">
          <div className="bg-black text-white rounded-lg px-4 py-2 flex items-center justify-center">
            <span>DVFahsion creative - renew - vision</span>
          </div>
        </div>
        {/* Rank Progress */}
        <div className="mb-4 bg-gray-50 rounded-lg p-4">
          <div className="text-gray-700 mb-1">Chi tiêu thêm</div>
          <div className="text-blue-600 font-bold text-2xl mb-1">300.000đ</div>
          <div className="text-gray-700 mb-2">
            để lên hạng lên hạng{" "}
            <span className="font-bold text-gray-800">BẠC</span>
          </div>
          <div className="flex items-center gap-4 mb-2">
            <span className="text-blue-600">🛡️</span>
            <span className="text-gray-400">🛡️</span>
            <span className="text-yellow-600">🛡️</span>
            <span className="text-gray-800">🛡️</span>
          </div>
          <div className="text-xs text-gray-500">
            Hạng thành viên được vừa được xét lại vào ngày 01/07/2025, ngày xét
            hạng tiếp theo: 01/10/2025
          </div>
        </div>
        {/* DVFcash */}
        <div className="mb-4 flex gap-2">
          <div className="bg-white border rounded-lg flex-1 p-3 flex flex-col justify-center">
            <div className="font-bold text-lg flex items-center gap-2">
              <span className="text-black">🪙</span>
              <span>0 DVFcash</span>
            </div>
            <div className="text-xs text-gray-500">Chờ: 0 DVFcash</div>
          </div>
          <Link className="bg-black text-white rounded-lg flex-1 p-3 flex flex-col justify-center items-center">
            <div className="font-bold">Về DVFclub</div>
            <span className="text-xl">→</span>
          </Link>
        </div>
        {/* Referral */}
        <div className="mb-4 bg-blue-600 rounded-lg p-4 text-white">
          <div className="font-bold mb-2">Giới thiệu bạn bè</div>
          <div className="text-sm mb-2">
            Nhận 10% giá trị đơn hàng đầu tiên của bạn bè được quy đổi thành
            DVFcash
          </div>
          <div className="flex gap-2">
            <button className="bg-white text-blue-600 rounded-full px-4 py-1 font-bold">
              CHIA SẺ
            </button>
            <button className="bg-blue-800 text-white rounded-full px-4 py-1 font-bold">
              TÌM HIỂU THÊM
            </button>
          </div>
        </div>
        {/* Go to account */}
        <button className="w-full bg-blue-700 text-white font-bold py-3 rounded-lg mt-4">
          ĐI ĐẾN TÀI KHOẢN
        </button>
        <button
          className="w-full bg-red-500 text-white font-bold py-3 rounded-lg mt-2"
          onClick={handleLogout}
          disabled={isLogoutLoading}
        >
          {isLogoutLoading ? "Đang đăng xuất..." : "Đăng xuất"}
        </button>
      </div>
    </div>
  );
}
