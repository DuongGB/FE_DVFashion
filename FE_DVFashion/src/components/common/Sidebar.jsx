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
import EmployeeCard from "../common/EmployeeCard";

export default function Sidebar({ onClose }) {
  const { logout, isLogoutLoading, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const defaultAvatar =
    "https://img.pikbest.com/png-images/20240806/3d-character-of-a-male-office-worker-wearing-white-shirt-and-tie_10659321.png!f305cw";

  // Loading state
  if (isLoading || !user) {
    return (
      <aside
        style={{ backgroundColor: "#18202eff" }}
        className="w-64 text-white flex flex-col py-8 px-6 h-full"
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center">Loading...</div>
        </div>
      </aside>
    );
  }

  // Xác định role dựa trên path hiện tại và roles của user
  const userRoles = user?.roles || [];
  const hasAdminRole = userRoles.includes("ROLE_ADMIN");
  const hasStaffRole = userRoles.includes("ROLE_STAFF");

  // Logic đơn giản: Có ADMIN thì hiển thị Admin sidebar, không thì hiển thị Staff sidebar
  const showAdminSidebar = hasAdminRole;
  const showStaffSidebar = !hasAdminRole && hasStaffRole;

  let roleDisplay = "";
  if (hasAdminRole) {
    roleDisplay = "ADMIN";
  } else if (hasStaffRole) {
    roleDisplay = "STAFF";
  }

  console.log("Sidebar Debug:", {
    userRoles,
    hasAdminRole,
    hasStaffRole,
    showAdminSidebar,
    showStaffSidebar,
    roleDisplay,
  });

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
      className="w-64 text-white flex flex-col py-8 px-6 h-full"
    >
      {/* Thông tin nhân viên */}
      <EmployeeCard
        name={user?.fullName || "Tên nhân viên"}
        image={defaultAvatar}
        role={roleDisplay || "Vai trò"}
      />

      {/* Navigation Links of ADMIN */}
      {showAdminSidebar && (
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
                  isActive("/admin/orders")
                    ? "bg-blue-600"
                    : "hover:bg-blue-900"
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
              <Link
                to={"/admin/categories"}
                className={`flex items-center rounded-lg px-4 py-2 ${
                  isActive("/admin/categories")
                    ? "bg-blue-600"
                    : "hover:bg-blue-900"
                }`}
              >
                <IconCategory stroke={2} />
                <span className="ml-3">Danh mục</span>
              </Link>
            </li>
            <li>
              <Link
                to={"/admin/brands"}
                className={`flex items-center rounded-lg px-4 py-2 ${
                  isActive("/admin/brands")
                    ? "bg-blue-600"
                    : "hover:bg-blue-900"
                }`}
              >
                <IconBuildingStore stroke={2} />
                <span className="ml-3">Thương hiệu</span>
              </Link>
            </li>
            <li>
              <Link
                to={"/admin/reviews"}
                className={`flex items-center rounded-lg px-4 py-2 ${
                  isActive("/admin/reviews")
                    ? "bg-blue-600"
                    : "hover:bg-blue-900"
                }`}
              >
                <IconDevicesCheck stroke={2} />
                <span className="ml-3">Bài nhận xét</span>
              </Link>
            </li>
            <li>
              <Link
                to={"/admin/promotions"}
                className={`flex items-center rounded-lg px-4 py-2 ${
                  isActive("/admin/promotions")
                    ? "bg-blue-600"
                    : "hover:bg-blue-900"
                }`}
              >
                <IconAdCircle stroke={2} />
                <span className="ml-3">Khuyến mãi</span>
              </Link>
            </li>
            <li>
              <Link
                to={"/admin/customers"}
                className={`flex items-center rounded-lg px-4 py-2 ${
                  isActive("/admin/customers")
                    ? "bg-blue-600"
                    : "hover:bg-blue-900"
                }`}
              >
                <IconUsers stroke={2} />
                <span className="ml-3">Khách hàng</span>
              </Link>
            </li>
            <li>
              <Link
                to={"/admin/employees"}
                className={`flex items-center rounded-lg px-4 py-2 ${
                  isActive("/admin/employees")
                    ? "bg-blue-600"
                    : "hover:bg-blue-900"
                }`}
              >
                <IconCashRegister stroke={2} />
                <span className="ml-3">Nhân viên</span>
              </Link>
            </li>
            <li>
              <Link
                to={"/admin/reports"}
                className={`flex items-center rounded-lg px-4 py-2 ${
                  isActive("/admin/reports")
                    ? "bg-blue-600"
                    : "hover:bg-blue-900"
                }`}
              >
                <IconDeviceAnalytics stroke={2} />
                <span className="ml-3">Phân tích báo cáo</span>
              </Link>
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
                className="flex items-center hover:bg-red-600 rounded-lg p-1 ml-4 bg-red-500 font-semibold cursor-pointer"
                onClick={handleLogout}
                disabled={isLogoutLoading}
              >
                <IconLogout stroke={2} />
              </button>
            </li>
          </ul>
        </nav>
      )}

      {/* Navigation Links of STAFF */}
      {showStaffSidebar === "ROLE_STAFF" && (
        <nav className="flex-1">
          <ul className="space-y-2">
            <li>
              <Link
                to="/staff"
                className={`flex items-center rounded-lg px-4 py-2 font-semibold ${
                  isActive("/staff") ? "bg-blue-600" : " hover:bg-blue-900"
                }`}
              >
                <IconHomeInfinity stroke={2} />
                <span className="ml-3">Trang chủ</span>
              </Link>
            </li>
            <li>
              <Link
                to="/staff/orders"
                className={`flex items-center rounded-lg px-4 py-2 ${
                  isActive("/staff/orders")
                    ? "bg-blue-600"
                    : "hover:bg-blue-900"
                }`}
              >
                <IconTruckDelivery stroke={2} />
                <span className="ml-3">Đơn hàng</span>
              </Link>
            </li>
            <li>
              <Link
                to={"/staff/categories"}
                className={`flex items-center rounded-lg px-4 py-2 ${
                  isActive("/staff/categories")
                    ? "bg-blue-600"
                    : "hover:bg-blue-900"
                }`}
              >
                <IconCategory stroke={2} />
                <span className="ml-3">Danh mục</span>
              </Link>
            </li>
            <li>
              <Link
                to={"/staff/reviews"}
                className={`flex items-center rounded-lg px-4 py-2 ${
                  isActive("/staff/reviews")
                    ? "bg-blue-600"
                    : "hover:bg-blue-900"
                }`}
              >
                <IconDevicesCheck stroke={2} />
                <span className="ml-3">Bài nhận xét</span>
              </Link>
            </li>
            <li>
              <Link
                to={"/staff/promotions"}
                className={`flex items-center rounded-lg px-4 py-2 ${
                  isActive("/staff/promotions")
                    ? "bg-blue-600"
                    : "hover:bg-blue-900"
                }`}
              >
                <IconAdCircle stroke={2} />
                <span className="ml-3">Khuyến mãi</span>
              </Link>
            </li>
            <li>
              <Link
                to={"/staff/customers"}
                className={`flex items-center rounded-lg px-4 py-2 ${
                  isActive("/staff/customers")
                    ? "bg-blue-600"
                    : "hover:bg-blue-900"
                }`}
              >
                <IconUsers stroke={2} />
                <span className="ml-3">Khách hàng</span>
              </Link>
            </li>
            {/* Buuton logout */}
            <li>
              <button
                className="flex items-center hover:bg-red-600 rounded-lg p-1 ml-4 bg-red-500 font-semibold cursor-pointer"
                onClick={handleLogout}
                disabled={isLogoutLoading}
              >
                <IconLogout stroke={2} />
              </button>
            </li>
          </ul>
        </nav>
      )}
    </aside>
  );
}
