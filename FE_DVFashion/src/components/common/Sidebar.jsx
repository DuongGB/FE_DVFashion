import {
  IconAdCircle,
  IconBriefcase,
  IconBuildingStore,
  IconCategory,
  IconChevronDown,
  IconChevronRight,
  IconDeviceAnalytics,
  IconDevicesCheck,
  IconHomeEdit,
  IconHomeInfinity,
  IconLogout,
  IconReportAnalytics,
  IconShirt,
  IconSpeakerphone,
  IconTruckDelivery,
  IconUserHeart,
  IconUsers,
  IconWorldWww,
  IconReceipt,
  IconGift,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import EmployeeCard from "../common/EmployeeCard";
import { useTranslation } from "react-i18next";

export default function Sidebar({ onClose }) {
  const { logout, isLogoutLoading, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  // State cho menu collapse
  const [expandedMenus, setExpandedMenus] = useState({
    business: false,
    customer: false,
    marketing: false,
    hr: false,
    reports: false,
    display: false,
  });

  useEffect(() => {
    const handleLanguageChange = () => {};
    i18n.on("languageChanged", handleLanguageChange);
    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  const defaultAvatar =
    "https://img.pikbest.com/png-images/20240806/3d-character-of-a-male-office-worker-wearing-white-shirt-and-tie_10659321.png!f305cw";

  // Loading state
  if (isLoading || !user) {
    return (
      <aside className="sidebar-liquid w-64 text-white flex flex-col py-8 px-6 h-full">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">{t("admin.sidebar.loading")}</div>
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

  // const handleStaffPageClick = () => {
  //   window.open("/staff", "_blank");
  // };

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
        className="item-liquid justify-between w-full px-4 py-2 text-left cursor-pointer flex items-center"
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
        <ul className="submenu-liquid ml-6 mt-2 space-y-1">{children}</ul>
      )}
    </li>
  );

  // Component cho submenu item
  const SubMenuItem = ({ to, children, icon }) => (
    <li>
      <Link
        to={to}
        className={`item-liquid px-4 py-2 text-sm ${
          isActive(to) ? "is-active" : ""
        }`}
      >
        {icon}
        <span className="ml-3">{children}</span>
      </Link>
    </li>
  );

  return (
    <aside className="sidebar-liquid w-64 text-white flex flex-col py-8 px-6 h-full">
      {/* Thông tin nhân viên */}
      <EmployeeCard
        name={user?.fullName || t("admin.sidebar.employee_name")}
        image={defaultAvatar}
        role={roleDisplay || t("admin.sidebar.role")}
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
                className={`item-liquid px-4 py-2 font-semibold ${
                  isActive("/admin") ? "is-active" : ""
                }`}
              >
                <IconHomeInfinity stroke={2} />
                <span className="ml-3">{t("admin.sidebar.home")}</span>
              </Link>
            </li>

            {/* Quản lý kinh doanh */}
            <MenuWithSubmenu
              title={t("admin.sidebar.business_management")}
              icon={<IconBriefcase stroke={2} />}
              menuKey="business"
            >
              <SubMenuItem to="/admin/orders" icon={<IconReceipt size={16} />}>
                {t("admin.sidebar.orders")}
              </SubMenuItem>
              <SubMenuItem
                to="/admin/inventories"
                icon={<IconTruckDelivery size={16} />}
              >
                {t("admin.sidebar.inventory")}
              </SubMenuItem>
              <SubMenuItem to="/admin/products" icon={<IconShirt size={16} />}>
                {t("admin.sidebar.products")}
              </SubMenuItem>
              <SubMenuItem
                to="/admin/categories"
                icon={<IconCategory size={16} />}
              >
                {t("admin.sidebar.categories")}
              </SubMenuItem>
              {/* <SubMenuItem
                to={"/admin/employees"}
                icon={<IconUsers size={16} />}
              >
                {t("admin.sidebar.employees")}
              </SubMenuItem> */}
              {/* <SubMenuItem
                to="/admin/brands"
                icon={<IconBuildingStore size={16} />}
              >
                {t("admin.sidebar.brands")}
              </SubMenuItem> */}
            </MenuWithSubmenu>

            {/* Khách hàng & phản hồi */}
            <MenuWithSubmenu
              title={t("admin.sidebar.customer_feedback")}
              icon={<IconUserHeart stroke={2} />}
              menuKey="customer"
            >
              {/* <SubMenuItem to="/admin/customers" icon={<IconUsers size={16} />}>
                {t("admin.sidebar.customers")}
              </SubMenuItem> */}
              <SubMenuItem
                to="/admin/reviews"
                icon={<IconDevicesCheck size={16} />}
              >
                {t("admin.sidebar.reviews")}
              </SubMenuItem>
            </MenuWithSubmenu>

            {/* Marketing */}
            <MenuWithSubmenu
              title={t("admin.sidebar.marketing")}
              icon={<IconSpeakerphone stroke={2} />}
              menuKey="marketing"
            >
              <SubMenuItem
                to="/admin/promotions"
                icon={<IconAdCircle size={16} />}
              >
                {t("admin.sidebar.promotions")}
              </SubMenuItem>
              <SubMenuItem to="/admin/vouchers" icon={<IconGift size={16} />}>
                Vouchers
              </SubMenuItem>
            </MenuWithSubmenu>

            {/* Nhân sự */}
            {/* <MenuWithSubmenu
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
            </MenuWithSubmenu> */}

            {/* Báo cáo & phân tích */}
            <MenuWithSubmenu
              title={t("admin.sidebar.reports_analytics")}
              icon={<IconReportAnalytics stroke={2} />}
              menuKey="reports"
            >
              <SubMenuItem
                to="/admin/reports"
                icon={<IconDeviceAnalytics size={16} />}
              >
                {t("admin.sidebar.reports_management")}
              </SubMenuItem>
              <SubMenuItem
                to="/admin/forecasts"
                icon={<IconDeviceAnalytics size={16} />}
              >
                {t("admin.sidebar.revenue_forecast")}
              </SubMenuItem>
            </MenuWithSubmenu>

            {/* Trang hiển thị */}
            <MenuWithSubmenu
              title={t("admin.sidebar.display_pages")}
              icon={<IconWorldWww stroke={2} />}
              menuKey="display"
            >
              <li>
                <button
                  className="flex items-center hover:bg-blue-800 rounded-lg px-4 py-2 w-full text-left text-sm cursor-pointer"
                  onClick={handleCustomerPageClick}
                >
                  <IconHomeEdit size={16} />
                  <span className="ml-3">
                    {t("admin.sidebar.customer_page")}
                  </span>
                </button>
              </li>
              {/* <li>
                <button
                  className="flex items-center hover:bg-blue-800 rounded-lg px-4 py-2 w-full text-left text-sm cursor-pointer"
                  onClick={handleStaffPageClick}
                >
                  <IconHomeEdit size={16} />
                  <span className="ml-3">Trang nhân viên</span>
                </button>
              </li> */}
            </MenuWithSubmenu>

            {/* Button logout */}
            <li className="pt-4">
              <button
                className="flex items-center rounded-lg p-2 w-full bg-red-500 hover:bg-red-600 font-semibold cursor-pointer justify-center transition-colors"
                onClick={handleLogout}
                disabled={isLogoutLoading}
              >
                <IconLogout className="mr-4" stroke={2} />
                {t("admin.sidebar.logout")}
              </button>
            </li>
          </ul>
        </nav>
      )}

      {/* Navigation Links of STAFF */}
      {/* {showStaffSidebar && (
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
                <span className="ml-3">{t("staff.sidebar.home")}</span>
              </Link>
            </li>
            <li>
              <Link
                to="/staff/products"
                className={`flex items-center rounded-lg px-4 py-2 font-semibold ${
                  isActive("/staff/products")
                    ? "bg-blue-600"
                    : " hover:bg-blue-900"
                }`}
              >
                <IconShirt stroke={2} />
                <span className="ml-3">{t("staff.sidebar.products")}</span>
              </Link>
            </li>
            <li>
              <Link
                to="/staff/inventories"
                className={`flex items-center rounded-lg px-4 py-2 font-semibold ${
                  isActive("/staff/inventories")
                    ? "bg-blue-600"
                    : " hover:bg-blue-900"
                }`}
              >
                <IconTruckDelivery stroke={2} />
                <span className="ml-3">{t("staff.sidebar.inventories")}</span>
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
                <IconReceipt stroke={2} />
                <span className="ml-3">{t("staff.sidebar.orders")}</span>
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
                <span className="ml-3">{t("staff.sidebar.categories")}</span>
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
                <span className="ml-3">{t("staff.sidebar.reviews")}</span>
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
                <span className="ml-3">{t("staff.sidebar.promotions")}</span>
              </Link>
            </li> */}
      {/* <li>
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
            </li> */}
      {/* <li>
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
      )} */}
    </aside>
  );
}
