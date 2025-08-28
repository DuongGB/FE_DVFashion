import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { getDefaultRouteByRoles } from "../../utils/getDefaultRouteByRoles";
import { ShoppingCart, User } from "react-feather";
import LoginForm from "../ui/auth/LoginForm";
import { Link } from "react-router-dom";
import { getLastName } from "../../utils/getLastName";
import ModalAccount from "../ui/account/ModalAccount";

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
  const navigate = useNavigate();
  const [lang, setLang] = useState("VI");

  const handleLangChange = () => {
    setLang((v) => (v === "VI" ? "EN" : "VI"));
  };
  return (
    <div className="bg-gray-500 text-white flex justify-between px-8 py-2 text-sm">
      <Link to="/">VỀ DVFASHION</Link>
      <div className="flex gap-4">
        {/* Nút chuyển đổi ngôn ngữ */}
        <LangSwitchButton lang={lang} onLangChange={handleLangChange} />
        <Link to="#">DVFclub</Link>
        <button
          className="hover:underline cursor-pointer"
          onClick={() => navigate("/blog")}
        >
          Blog
        </button>
        <button
          className="hover:underline cursor-pointer"
          onClick={() => navigate("/help")}
        >
          CSKH
        </button>
        {!isAuthenticated && (
          <button
            className="hover:underline cursor-pointer"
            onClick={onLoginClick}
          >
            Đăng nhập
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
            NEW
          </Link>
          <div className="absolute left-0 right-0 -bottom-1 h-[3px] w-0 bg-blue-600 rounded-full transition-all duration-500 group-hover:w-full"></div>
          <MegaMenu />
        </div>
        <div className="group relative w-[110px] flex justify-center">
          <Link to="/" className="cursor-pointer w-full text-center">
            NAM
          </Link>
          <div className="absolute left-0 right-0 -bottom-1 h-[3px] w-0 bg-black rounded-full transition-all duration-500 group-hover:w-full"></div>
          <MegaMenu />
        </div>
        <div className="group relative w-[110px] flex justify-center">
          <Link to="/" className="cursor-pointer w-full text-center">
            NỮ
          </Link>
          <div className="absolute left-0 right-0 -bottom-1 h-[3px] w-0 bg-black rounded-full transition-all duration-500 group-hover:w-full"></div>
          <MegaMenu />
        </div>
        <div className="group relative w-[110px] flex justify-center">
          <Link to="/" className="cursor-pointer w-full text-center">
            THỂ THAO
          </Link>
          <div className="absolute left-0 right-0 -bottom-1 h-[3px] w-0 bg-black rounded-full transition-all duration-500 group-hover:w-full"></div>
          <MegaMenu />
        </div>
        <div className="group relative w-[110px] flex justify-center">
          <Link
            to="/"
            className="flex flex-col items-center text-red-600 font-bold w-full text-center"
          >
            SALE
          </Link>
          <div className="absolute left-0 right-0 -bottom-1 h-[3px] w-0 bg-red-600 rounded-full transition-all duration-500 group-hover:w-full"></div>
          <MegaMenu />
        </div>
        <div className="group relative w-[110px] flex justify-center">
          <Link to="/" className="cursor-pointer w-full text-center">
            C&S
          </Link>
          <div className="absolute left-0 right-0 -bottom-1 h-[3px] w-0 bg-black rounded-full transition-all duration-500 group-hover:w-full"></div>
          <MegaMenu />
        </div>
      </nav>
      {/* Search, Account, Cart */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="border rounded-full px-4 py-1"
        />
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={onUserClick}
        >
          <User size={24} />
          <span className="text-sm font-semibold" onClick={onUserClick}>
            {isAuthenticated ? getLastName(user?.fullName) : "Tài khoản"}
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

// Login modal component
function LoginModal({ show, onClose }) {
  const { isAuthenticated } = useAuth();
  if (!show || isAuthenticated) return null;
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 "
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6 relative min-w-[350px]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl"
          onClick={onClose}
        >
          &times;
        </button>
        <LoginForm />
      </div>
    </div>
  );
}

export default function Header() {
  const { isAuthenticated, user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [wasAuthenticated, setWasAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Chỉ điều hướng khi vừa đăng nhập
    if (
      !wasAuthenticated &&
      isAuthenticated &&
      user?.roles &&
      location.pathname === "/"
    ) {
      let defaultRoute = getDefaultRouteByRoles(user?.roles);
      if (user?.roles?.includes("ROLE_CUSTOMER")) {
        defaultRoute = "/customer";
      }
      navigate(defaultRoute);
      setShowLogin(false);
      setWasAuthenticated(true);
    }
    if (!isAuthenticated && wasAuthenticated) {
      setWasAuthenticated(false);
    }
  }, [isAuthenticated, user, navigate, wasAuthenticated, location.pathname]);

  // Display modal show account if authenticated
  const handleUserClick = () => {
    if (isAuthenticated && user?.roles) {
      setShowAccount(true);
    } else {
      setShowLogin(true);
    }
  };

  return (
    <header className="bg-white shadow">
      <TopBar
        onLoginClick={() => setShowLogin(true)}
        isAuthenticated={isAuthenticated}
        user={user}
        onUserClick={() => handleUserClick}
      />
      <MainMenu
        isAuthenticated={isAuthenticated}
        user={user}
        onUserClick={() => handleUserClick(true)}
      />
      <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
      <ModalAccount
        show={showAccount}
        onClose={() => setShowAccount(false)}
        user={user}
      />
    </header>
  );
}
