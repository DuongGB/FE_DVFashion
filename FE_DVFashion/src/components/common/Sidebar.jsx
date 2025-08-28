import {
  IconHomeInfinity,
  IconTruckDelivery,
  IconShirt,
  IconUsers,
  IconCategory,
  IconBuildingStore,
  IconDevicesCheck,
  IconAdCircle,
  IconDeviceAnalytics,
  IconHomeEdit,
  IconCashRegister,
  IconLogout,
} from "@tabler/icons-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
export default function Sidebar({ onClose }) {
  const { logout, isLogoutLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      onClose?.();
      navigate("/", { replace: true }); // replace để không quay lại /admin được nữa
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleCustomerPageClick = () => {
    window.open("/customer", "_blank");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside
      style={{ backgroundColor: "#18202eff" }}
      className="w-64 text-white flex flex-col py-8 px-6 h-screen"
    >
      {/* Navigation Links */}
      <h2 className="text-2xl font-bold mb-10">Trang điều khiển</h2>
      <nav className="flex-1">
        <ul className="space-y-2">
          <li>
            <Link
              to="/admin"
              className={`flex items-center rounded-lg px-4 py-2 font-semibold ${
                isActive("/admin") ? "bg-blue-600" : " hover:bg-blue-900"
              }`}
            >
              <IconHomeInfinity stroke={2} />
              <span className="ml-3">Trang chủ</span>
            </Link>
          </li>
          <li>
            <Link
              to="/admin/orders"
              className={`flex items-center rounded-lg px-4 py-2 ${
                isActive("/admin/orders") ? "bg-blue-600" : "hover:bg-blue-900"
              }`}
            >
              <IconTruckDelivery stroke={2} />
              <span className="ml-3">Đơn hàng</span>
            </Link>
          </li>
          <li>
            <Link
              to="/admin/products"
              className={`flex items-center rounded-lg px-4 py-2 ${
                isActive("/admin/products")
                  ? "bg-blue-600"
                  : "hover:bg-blue-900"
              }`}
            >
              <IconShirt stroke={2} />
              <span className="ml-3">Sản phẩm</span>
            </Link>
          </li>
          <li>
            <a
              href="#"
              className="flex items-center hover:bg-blue-800 rounded-lg px-4 py-2"
            >
              <IconCategory stroke={2} />
              <span className="ml-3">Danh mục</span>
            </a>
          </li>
          <li>
            <a
              href="#"
              className="flex items-center hover:bg-blue-800 rounded-lg px-4 py-2"
            >
              <IconBuildingStore stroke={2} />
              <span className="ml-3">Thương hiệu</span>
            </a>
          </li>
          <li>
            <a
              href="#"
              className="flex items-center hover:bg-blue-800 rounded-lg px-4 py-2"
            >
              <IconDevicesCheck stroke={2} />
              <span className="ml-3">Bài nhận xét</span>
            </a>
          </li>
          <li>
            <a
              href="#"
              className="flex items-center hover:bg-blue-800 rounded-lg px-4 py-2"
            >
              <IconAdCircle stroke={2} />
              <span className="ml-3">Quảng cáo</span>
            </a>
          </li>
          <li>
            <a
              href="#"
              className="flex items-center hover:bg-blue-800 rounded-lg px-4 py-2"
            >
              <IconUsers stroke={2} />
              <span className="ml-3">Khách hàng</span>
            </a>
          </li>
          <li>
            <a
              href="#"
              className="flex items-center hover:bg-blue-800 rounded-lg px-4 py-2"
            >
              <IconCashRegister stroke={2} />
              <span className="ml-3">Nhân viên</span>
            </a>
          </li>
          <li>
            <a
              href="#"
              className="flex items-center hover:bg-blue-800 rounded-lg px-4 py-2"
            >
              <IconDeviceAnalytics stroke={2} />
              <span className="ml-3">Phân tích báo cáo</span>
            </a>
          </li>
          {/* Dỉrect HomePage of Customer */}
          <li>
            <button
              className="flex items-center hover:bg-blue-800 rounded-lg px-4 py-2 w-full text-left"
              onClick={handleCustomerPageClick}
            >
              <IconHomeEdit stroke={2} />
              <span className="ml-3">Trang khách hàng</span>
            </button>
          </li>

          {/* Buuton logout */}
          <li>
            <button
              className="w-full text-left flex items-center hover:bg-red-600 rounded-lg px-4 py-2 mt-10 bg-red-500 font-semibold"
              onClick={handleLogout}
              disabled={isLogoutLoading}
            >
              <IconLogout stroke={2} />
              {isLogoutLoading ? (
                <span className="ml-3">Đang đăng xuất...</span>
              ) : (
                <span className="ml-3">Đăng xuất</span>
              )}
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
