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
  IconChevronDown,
  IconChevronRight,
  IconBriefcase,
  IconUserHeart,
  IconSpeakerphone,
  IconReportAnalytics,
  IconWorldWww,
} from "@tabler/icons-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import EmployeeCard from "../common/EmployeeCard";
import { useState } from "react";

export default function Sidebar({ onClose }) {
  const { logout, isLogoutLoading, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // State cho menu collapse
  const [expandedMenus, setExpandedMenus] = useState({
    business: false,
    customer: false,
    marketing: false,
    hr: false,
    reports: false,
    display: false,
  });

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

  // Xác định đang ở path nào
  const isAdminPath = location.pathname.startsWith("/admin");
  const isStaffPath = location.pathname.startsWith("/staff");

  // Logic hiển thị sidebar dựa trên path và role
  let showAdminSidebar = false;
  let showStaffSidebar = false;
  let roleDisplay = "";

  if (isAdminPath && hasAdminRole) {
    // Đang ở admin path và có admin role → hiển thị admin sidebar
    showAdminSidebar = true;
    roleDisplay = "ADMIN";
  } else if (isStaffPath && (hasStaffRole || hasAdminRole)) {
    // Đang ở staff path và có staff/admin role → hiển thị staff sidebar
    showStaffSidebar = true;
    roleDisplay = hasAdminRole ? "ADMIN" : "STAFF";
  } else if (hasAdminRole) {
    // Không ở path cụ thể nhưng có admin role → mặc định admin sidebar
    showAdminSidebar = true;
    roleDisplay = "ADMIN";
  } else if (hasStaffRole) {
    // Không ở path cụ thể nhưng có staff role → mặc định staff sidebar
    showStaffSidebar = true;
    roleDisplay = "STAFF";
  }

  // console.log("Sidebar Debug:", {
  //   userRoles,
  //   hasAdminRole,
  //   hasStaffRole,
  //   showAdminSidebar,
  //   showStaffSidebar,
  //   roleDisplay,
  // });

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

  const handleStaffPageClick = () => {
    window.open("/staff", "_blank");
  };

  const isActive = (path) => location.pathname === path;

  const toggleMenu = (menuKey) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  // Component cho menu item có submenu
  const MenuWithSubmenu = ({ title, icon, menuKey, children }) => (
    <li>
      <button
        className="flex items-center justify-between w-full rounded-lg px-4 py-2 hover:bg-blue-900 text-left"
        onClick={() => toggleMenu(menuKey)}
      >
        <div className="flex items-center">
          {icon}
          <span className="ml-3">{title}</span>
        </div>
        {expandedMenus[menuKey] ? (
          <IconChevronDown size={16} />
        ) : (
          <IconChevronRight size={16} />
        )}
      </button>
      {expandedMenus[menuKey] && (
        <ul className="ml-6 mt-2 space-y-1">{children}</ul>
      )}
    </li>
  );

  // Component cho submenu item
  const SubMenuItem = ({ to, children, icon }) => (
    <li>
      <Link
        to={to}
        className={`flex items-center rounded-lg px-4 py-2 text-sm ${
          isActive(to) ? "bg-blue-600" : "hover:bg-blue-800"
        }`}
      >
        {icon}
        <span className="ml-3">{children}</span>
      </Link>
    </li>
  );

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
        <nav
          className="flex-1 overflow-y-auto scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <ul className="space-y-2">
            {/* Trang chủ */}
            <li>
              <Link
                to="/admin"
                className={`flex items-center rounded-lg px-4 py-2 font-semibold ${
                  isActive("/admin") ? "bg-blue-600" : "hover:bg-blue-900"
                }`}
              >
                <IconHomeInfinity stroke={2} />
                <span className="ml-3">Trang chủ</span>
              </Link>
            </li>

            {/* Quản lý kinh doanh */}
            <MenuWithSubmenu
              title="Quản lý kinh doanh"
              icon={<IconBriefcase stroke={2} />}
              menuKey="business"
            >
              <SubMenuItem
                to="/admin/inventories"
                icon={<IconTruckDelivery size={16} />}
              >
                Kho hàng
              </SubMenuItem>
              <SubMenuItem to="/admin/products" icon={<IconShirt size={16} />}>
                Sản phẩm
              </SubMenuItem>
              <SubMenuItem
                to="/admin/categories"
                icon={<IconCategory size={16} />}
              >
                Danh mục
              </SubMenuItem>
              <SubMenuItem
                to="/admin/brands"
                icon={<IconBuildingStore size={16} />}
              >
                Thương hiệu
              </SubMenuItem>
            </MenuWithSubmenu>

            {/* Khách hàng & phản hồi */}
            <MenuWithSubmenu
              title="Khách hàng & phản hồi"
              icon={<IconUserHeart stroke={2} />}
              menuKey="customer"
            >
              <SubMenuItem to="/admin/customers" icon={<IconUsers size={16} />}>
                Khách hàng
              </SubMenuItem>
              <SubMenuItem
                to="/admin/reviews"
                icon={<IconDevicesCheck size={16} />}
              >
                Bài nhận xét
              </SubMenuItem>
            </MenuWithSubmenu>

            {/* Marketing */}
            <MenuWithSubmenu
              title="Marketing"
              icon={<IconSpeakerphone stroke={2} />}
              menuKey="marketing"
            >
              <SubMenuItem
                to="/admin/promotions"
                icon={<IconAdCircle size={16} />}
              >
                Khuyến mãi
              </SubMenuItem>
            </MenuWithSubmenu>

            {/* Nhân sự */}
            <MenuWithSubmenu
              title="Nhân sự"
              icon={<IconCashRegister stroke={2} />}
              menuKey="hr"
            >
              <SubMenuItem
                to="/admin/employees"
                icon={<IconCashRegister size={16} />}
              >
                Nhân viên
              </SubMenuItem>
            </MenuWithSubmenu>

            {/* Báo cáo & phân tích */}
            <MenuWithSubmenu
              title="Báo cáo & phân tích"
              icon={<IconReportAnalytics stroke={2} />}
              menuKey="reports"
            >
              <SubMenuItem
                to="/admin/reports"
                icon={<IconDeviceAnalytics size={16} />}
              >
                Quản lý báo cáo
              </SubMenuItem>
              <SubMenuItem
                to="/admin/forecasts"
                icon={<IconDeviceAnalytics size={16} />}
              >
                Dự báo doanh thu
              </SubMenuItem>
            </MenuWithSubmenu>

            {/* Trang hiển thị */}
            <MenuWithSubmenu
              title="Trang hiển thị"
              icon={<IconWorldWww stroke={2} />}
              menuKey="display"
            >
              <li>
                <button
                  className="flex items-center hover:bg-blue-800 rounded-lg px-4 py-2 w-full text-left text-sm cursor-pointer"
                  onClick={handleCustomerPageClick}
                >
                  <IconHomeEdit size={16} />
                  <span className="ml-3">Trang khách hàng</span>
                </button>
              </li>
              <li>
                <button
                  className="flex items-center hover:bg-blue-800 rounded-lg px-4 py-2 w-full text-left text-sm cursor-pointer"
                  onClick={handleStaffPageClick}
                >
                  <IconHomeEdit size={16} />
                  <span className="ml-3">Trang nhân viên</span>
                </button>
              </li>
            </MenuWithSubmenu>

            {/* Button logout */}
            <li className="pt-4">
              <button
                className="flex items-center hover:bg-red-600 rounded-lg p-2 w-full bg-red-500 font-semibold cursor-pointer justify-center"
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
      {showStaffSidebar && (
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
