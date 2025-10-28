import { useEffect, useRef, useState } from "react";
import { ShoppingCart, User } from "react-feather";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo_DVF.png";
import { useAuth } from "../../hooks/useAuth";
import { getLastName } from "../../utils/getLastName";
import ModalAccount from "../ui/account/ModalAccount";
import AuthModal from "../ui/auth/AuthModal";
import CartDropdown from "../ui/cart/CartDropdown";
import SearchPopup from "./SearchPopup";
import { useAuthModal } from "../../contexts/AuthModalContext";
import { useCart } from "../../hooks/useCart";
import { usePublicCategories } from "../../hooks/useCategory";

const LangSwitchButton = ({ lang, onLangChange }) => (
  <button
    className="cursor-pointer hover:text-gray-300"
    aria-label="Chuyển đổi ngôn ngữ"
    onClick={onLangChange}
  >
    {lang === "VI" ? "VI" : "EN"}
  </button>
);

// Top bar component
function TopBar({ onLoginClick, isAuthenticated, user, onUserClick }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [lang, setLang] = useState(i18n.language || "VI");

  useEffect(() => {
    const handleLanguageChange = () => {
      setLang(i18n.language);
    };

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  const handleLangChange = () => {
    const newLang = lang === "VI" ? "EN" : "VI";
    setLang(newLang);
    i18n.changeLanguage(newLang);
    localStorage.setItem("i18nextLng", newLang);
  };
  return (
    <div className="bg-gray-500 text-white flex justify-between px-8 py-2 text-sm">
      <Link to="/">{t("header.about_dvfashion")}</Link>
      <div className="flex gap-4">
        {/* Nút chuyển đổi ngôn ngữ */}
        <LangSwitchButton lang={lang} onLangChange={handleLangChange} />
        <Link to="#">{t("header.dvfclub")}</Link>
        <button
          className="hover:underline cursor-pointer"
          onClick={() => navigate("/blog")}
        >
          {t("header.blog")}
        </button>
        <button
          className="hover:underline cursor-pointer"
          onClick={() => navigate("/help")}
        >
          {t("header.customer_service")}
        </button>
        {!isAuthenticated && (
          <button
            className="hover:underline cursor-pointer"
            onClick={onLoginClick}
          >
            {t("header.login")}
          </button>
        )}
        {isAuthenticated && (
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={onUserClick}
          >
            <User size={18} />
            <span className="text-sm font-semibold">
              {getLastName(user?.fullName)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Main menu component
function MainMenu({ isAuthenticated, user, onUserClick }) {
  const { t, i18n } = useTranslation();
  const [showSearch, setShowSearch] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [hideTimeout, setHideTimeout] = useState(null);
  const { cart, removeItem } = useCart();
  const searchRef = useRef();
  const cartRef = useRef();

  const { categories, isLoading, error } = usePublicCategories(i18n.language);

  const [activeMenu, setActiveMenu] = useState(null);

  // Xử lý hover vào từng menu item
  const handleMouseEnter = (menuKey) => {
    if (hideTimeout) clearTimeout(hideTimeout);
    setActiveMenu(menuKey);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setActiveMenu(null);
    }, 150); // delay 150ms tránh flicker
    setHideTimeout(timeout);
  };

  const menuItems = [
    {
      key: "new",
      label: t("header.navigation.new"),
      color: "text-blue-600",
      underline: "bg-blue-600",
    },
    {
      key: "men",
      label: t("header.navigation.men"),
      color: "",
      underline: "bg-black",
    },
    {
      key: "women",
      label: t("header.navigation.women"),
      color: "",
      underline: "bg-black",
    },
    {
      key: "sports",
      label: t("header.navigation.sports"),
      color: "",
      underline: "bg-black",
    },
    {
      key: "sale",
      label: t("header.navigation.sale"),
      color: "text-red-600",
      underline: "bg-red-600",
    },
    {
      key: "cs",
      label: t("header.navigation.cs"),
      color: "",
      underline: "bg-black",
    },
  ];

  // Đóng popup khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        showSearch &&
        searchRef.current &&
        !searchRef.current.contains(e.target)
      ) {
        setShowSearch(false);
      }
      if (showCart && cartRef.current && !cartRef.current.contains(e.target)) {
        setShowCart(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSearch, showCart]);

  // Xóa sản phẩm khỏi giỏ hàng
  const handleRemoveCartItem = async (cartItemId) => {
    await removeItem(cartItemId);
  };

  const handleViewAllCart = (e) => {
    e.stopPropagation(); // Ngăn chặn sự kiện nổi bọt
    window.location.href = "/cart";
  };

  // Lấy số lượng sản phẩm trong giỏ hàng
  const cartLength = cart?.items?.length || 0;

  return (
    <div className="bg-white flex items-center justify-between px-8 py-4 shadow sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-4 w-[110px]">
        <Link to="/" className="text-2xl font-bold text-orange-600 w-full">
          <img
            src={logo}
            alt="DVFASHION"
            className="h-8 w-full object-contain"
          />
        </Link>
      </div>
      {/* Nav */}
      <nav className="flex gap-8 font-bold text-lg items-center relative w-full justify-center">
        {menuItems.map((item) => (
          <div
            key={item.key}
            className="group relative w-[110px] flex justify-center"
            onMouseEnter={() => handleMouseEnter(item.key)}
            onMouseLeave={handleMouseLeave}
          >
            <Link
              to="/"
              className={`cursor-pointer w-full text-center ${item.color}`}
            >
              {item.label}
            </Link>
            <div
              className={`absolute left-0 right-0 -bottom-1 h-[3px] w-0 ${item.underline} rounded-full transition-all duration-500 group-hover:w-full`}
            ></div>
            {/* MegaMenu chỉ hiện khi activeMenu === item.key */}
            {activeMenu === item.key && (
              <MegaMenu
                onMouseEnter={() => handleMouseEnter(item.key)}
                onMouseLeave={handleMouseLeave}
                categories={categories}
                isLoading={isLoading}
                error={error}
              />
            )}
          </div>
        ))}
      </nav>
      {/* Search, Account, Cart */}
      <div className="flex items-center gap-4" ref={searchRef}>
        {/* Nút mở popup search */}
        <div
          className="flex-1 flex items-center"
          onClick={() => setShowSearch(true)}
        >
          {/* Thanh search chỉ là khung giả, không nhập được */}
          <div className="relative w-[350px] cursor-pointer">
            <input
              type="text"
              placeholder={t("header.search_placeholder")}
              className="border rounded-full px-10 py-2 w-full bg-gray-50 cursor-pointer"
              readOnly
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </span>
          </div>
        </div>
        <SearchPopup show={showSearch} onClose={() => setShowSearch(false)} />
        {/* Account và Cart giữ nguyên */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={onUserClick}
        >
          <User size={24} />
          <span className="text-sm font-semibold" onClick={onUserClick}>
            {isAuthenticated
              ? getLastName(user?.fullName)
              : t("header.account")}
          </span>
        </div>
        {/* Shopping Cart */}
        <div
          className="relative cursor-pointer group"
          ref={cartRef}
          onClick={handleViewAllCart}
        >
          <ShoppingCart size={24} />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
            {cartLength}
          </span>
          <div className="hidden group-hover:block">
            <CartDropdown
              cart={cart}
              onRemove={handleRemoveCartItem}
              onViewAll={handleViewAllCart}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// MegaMenu component
function MegaMenu({
  onMouseEnter,
  onMouseLeave,
  categories,
  isLoading,
  error,
}) {
  const { t, i18n } = useTranslation();

  // Chỉ lấy các category active
  const activeCategories = categories?.filter((cat) => cat.active) || [];

  if (isLoading) {
    return (
      <div
        className="p-8 text-center"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {t("category.loading", "Đang tải danh mục...")}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="p-8 text-center text-red-500"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {t("category.error_loading")}
      </div>
    );
  }
  return (
    <div
      className="fixed left-1/2 top-[95px] transform -translate-x-1/2 w-[92vw] max-w-[1500px] bg-white shadow-2xl rounded-2xl py-8 px-0 flex gap-0 opacity-100 pointer-events-auto transition-all duration-200 z-50 text-base border border-gray-200 overflow-hidden"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ minHeight: "420px" }}
    >
      {/* Banner left */}
      <div className="flex flex-1 gap-8 px-10">
        {activeCategories.map((cat) => (
          <div key={cat.id} className="flex-1 min-w-[180px]">
            <h4 className="font-bold mb-2 text-lg flex items-center">
              {cat.name}
            </h4>
            <ul className="space-y-1">
              <li>
                <span className="text-sm text-gray-500">{cat.description}</span>
              </li>
            </ul>
          </div>
        ))}
      </div>
      {/* Banner right */}
      <div className="flex flex-col gap-4 w-56 pr-10">
        <div className="relative rounded-xl overflow-hidden shadow-lg">
          <img
            src="/assets/banner_2_9.png"
            alt="Bộ sưu tập 2.9"
            className="w-full h-32 object-cover"
          />
          <div className="absolute bottom-2 left-2 text-white font-bold text-lg drop-shadow">
            Bộ sưu tập 2.9
          </div>
        </div>
        <div className="relative rounded-xl overflow-hidden shadow-lg">
          <img
            src="/assets/banner_sport.png"
            alt="Pickleball Nam"
            className="w-full h-32 object-cover"
          />
          <div className="absolute bottom-2 left-2 text-white font-bold text-lg drop-shadow">
            Pickleball Nam
          </div>
        </div>
      </div>
      {/* Submenu bottom */}
      <div className="absolute left-0 bottom-0 w-full bg-gray-50 border-t flex justify-center items-center gap-8 py-4 px-2 text-base font-bold rounded-b-2xl">
        <Link to="#" className="text-gray-500 font-normal">
          {t("category.tagline")}
        </Link>
      </div>
    </div>
  );
}

export default function Header() {
  const { isAuthenticated, user } = useAuth();
  const [showAccount, setShowAccount] = useState(false);
  const authModal = useAuthModal();

  // Display modal show account if authenticated
  const handleUserClick = () => {
    if (isAuthenticated && user?.roles) {
      setShowAccount(true);
    } else {
      authModal.openLogin();
    }
  };

  // Handle login button click in TopBar
  const handleLoginClick = () => {
    authModal.openLogin();
  };

  return (
    <header className="bg-white shadow">
      <TopBar
        onLoginClick={handleLoginClick}
        isAuthenticated={isAuthenticated}
        user={user}
        onUserClick={handleUserClick}
      />
      <MainMenu
        isAuthenticated={isAuthenticated}
        user={user}
        onUserClick={handleUserClick}
      />

      {/* Auth Modal - Thay thế LoginModal cũ */}
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={authModal.close}
        initialMode={authModal.mode}
        stayOnPage={authModal.stayOnPage}
      />

      {/* Account Modal - Giữ nguyên */}
      <ModalAccount
        show={showAccount}
        onClose={() => setShowAccount(false)}
        user={user}
      />
    </header>
  );
}
