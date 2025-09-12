import { useState, useEffect, useRef } from "react";
import { ShoppingCart, User } from "react-feather";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getLastName } from "../../utils/getLastName";
import ModalAccount from "../ui/account/ModalAccount";
import { useAuthModal } from "../../hooks/useAuthModal";
import AuthModal from "../ui/auth/AuthModal";
import { useTranslation } from "react-i18next";
import SearchPopup from "./SearchPopup";

const LangSwitchButton = ({ lang, onLangChange }) => (
  <button
    className="cursor-pointer hover:text-gray-300"
    aria-label="Chuyển đổi ngôn ngữ"
    onClick={onLangChange}
  >
    {lang === "VI" ? "EN" : "VI"}
  </button>
);

const megaMenuItems = [
  {
    title: "TẤT CẢ SẢN PHẨM",
    arrow: true,
    items: [
      {
        label: "Sản phẩm mới",
        to: "#",
        className: "text-blue-600 font-medium",
      },
      { label: "Bán chạy nhất", isBold: true },
      { label: "ECC Collection", to: "#" },
      { label: "Excool Collection", to: "#" },
      { label: "Copper Denim", to: "#" },
      { label: "Promax", to: "#" },
    ],
  },
  {
    title: "ÁO NAM",
    arrow: true,
    items: [
      { label: "Áo Tanktop", to: "#" },
      { label: "Áo thun", to: "#" },
      { label: "Áo Thể Thao", to: "#" },
      { label: "Áo Polo", to: "#" },
      { label: "Áo Sơ Mi", to: "#" },
      { label: "Áo Dài Tay", to: "#" },
      { label: "Áo Khoác", to: "#" },
      { label: "Áo thun Graphic", to: "#" },
    ],
  },
  {
    title: "QUẦN NAM",
    arrow: true,
    items: [
      { label: "Quần Short", to: "#" },
      { label: "Quần Jogger", to: "#" },
      { label: "Quần Thể Thao", to: "#" },
      { label: "Quần Dài", to: "#" },
      { label: "Quần Pants", to: "#" },
      { label: "Quần Jean", to: "#" },
      { label: "Quần Kaki", to: "#" },
      { label: "Quần Bơi", to: "#" },
    ],
  },
  {
    title: "QUẦN LÓT NAM",
    arrow: true,
    items: [
      { label: "Brief (Tam giác)", to: "#" },
      { label: "Trunk (Boxer)", to: "#" },
      { label: "Boxer Brief (Boxer dài)", to: "#" },
      { label: "Long Leg", to: "#" },
      { label: "Short mặc nhà", to: "#" },
    ],
  },
  {
    title: "PHỤ KIỆN",
    arrow: true,
    items: [
      { label: "Tất cả phụ kiện", to: "#" },
      {
        label: "(Tất, mũ, túi...)",
        isItalic: true,
        className: "italic text-gray-500",
      },
    ],
  },
];

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
  const { t } = useTranslation();
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef();

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
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSearch]);

  return (
    <div className="bg-white flex items-center justify-between px-8 py-4 shadow sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-4 w-[110px]">
        <Link to="/" className="text-2xl font-bold text-orange-600 w-full">
          <img
            src=".\src\assets\logo_DVF.png"
            alt="DVFASHION"
            className="h-8 w-full object-contain"
          />
        </Link>
      </div>
      {/* Nav */}
      <nav className="flex gap-8 font-bold text-lg items-center relative w-full justify-center">
        <div className="group relative w-[110px] flex justify-center">
          <Link
            to="/"
            className="cursor-pointer w-full text-center text-blue-600"
          >
            {t("header.navigation.new")}
          </Link>
          <div className="absolute left-0 right-0 -bottom-1 h-[3px] w-0 bg-blue-600 rounded-full transition-all duration-500 group-hover:w-full"></div>
          <MegaMenu />
        </div>
        <div className="group relative w-[110px] flex justify-center">
          <Link to="/" className="cursor-pointer w-full text-center">
            {t("header.navigation.men")}
          </Link>
          <div className="absolute left-0 right-0 -bottom-1 h-[3px] w-0 bg-black rounded-full transition-all duration-500 group-hover:w-full"></div>
          <MegaMenu />
        </div>
        <div className="group relative w-[110px] flex justify-center">
          <Link to="/" className="cursor-pointer w-full text-center">
            {t("header.navigation.women")}
          </Link>
          <div className="absolute left-0 right-0 -bottom-1 h-[3px] w-0 bg-black rounded-full transition-all duration-500 group-hover:w-full"></div>
          <MegaMenu />
        </div>
        <div className="group relative w-[110px] flex justify-center">
          <Link to="/" className="cursor-pointer w-full text-center">
            {t("header.navigation.sports")}
          </Link>
          <div className="absolute left-0 right-0 -bottom-1 h-[3px] w-0 bg-black rounded-full transition-all duration-500 group-hover:w-full"></div>
          <MegaMenu />
        </div>
        <div className="group relative w-[110px] flex justify-center">
          <Link
            to="/"
            className="flex flex-col items-center text-red-600 font-bold w-full text-center"
          >
            {t("header.navigation.sale")}
          </Link>
          <div className="absolute left-0 right-0 -bottom-1 h-[3px] w-0 bg-red-600 rounded-full transition-all duration-500 group-hover:w-full"></div>
          <MegaMenu />
        </div>
        <div className="group relative w-[110px] flex justify-center">
          <Link to="/" className="cursor-pointer w-full text-center">
            {t("header.navigation.cs")}
          </Link>
          <div className="absolute left-0 right-0 -bottom-1 h-[3px] w-0 bg-black rounded-full transition-all duration-500 group-hover:w-full"></div>
          <MegaMenu />
        </div>
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
        <div className="relative cursor-pointer">
          <ShoppingCart size={24} />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
            0
          </span>
        </div>
      </div>
    </div>
  );
}

// MegaMenu component
function MegaMenu() {
  return (
    <div
      className="fixed left-1/2 top-[100px] transform -translate-x-1/2 w-[92vw] max-w-[1500px] bg-white shadow-2xl rounded-2xl py-8 px-0 flex gap-0 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-200 z-50 text-base border border-gray-200 overflow-hidden"
      style={{ minHeight: "420px" }}
    >
      {/* Render columns from menuItems */}
      <div className="flex flex-1 gap-8 px-10">
        {megaMenuItems.map((col, idx) => (
          <div key={idx} className="flex-1 min-w-[180px]">
            <h4
              className={`font-bold mb-2 text-lg flex items-center ${
                idx === 0 ? "text-blue-700" : ""
              }`}
            >
              {col.title}
              {col.arrow && <span className="ml-1 text-blue-700">&rarr;</span>}
            </h4>
            <ul className="space-y-1">
              {col.items.map((item, i) => (
                <li key={i}>
                  {item.to ? (
                    <Link to={item.to} className={item.className || ""}>
                      {item.label}
                    </Link>
                  ) : item.isBold ? (
                    <span className="font-bold">{item.label}</span>
                  ) : item.isItalic ? (
                    <span className={item.className || ""}>{item.label}</span>
                  ) : (
                    <span>{item.label}</span>
                  )}
                </li>
              ))}
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
          THEO NHU CẦU
        </Link>
        <Link to="#">ĐỒ LÓT</Link>
        <Link to="#">ĐỒ THỂ THAO</Link>
        <Link to="#">MẶC HÀNG NGÀY</Link>
        <Link to="#">GRAPHIC TEES</Link>
      </div>
    </div>
  );
}

export default function Header() {
  const { isAuthenticated, user } = useAuth();
  const [showAccount, setShowAccount] = useState(false);
  const authModal = useAuthModal();
  const navigate = useNavigate();
  const location = useLocation();

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
