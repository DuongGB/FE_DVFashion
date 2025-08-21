import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getDefaultRouteByRoles } from "../../utils/getDefaultRouteByRoles";
import { ShoppingCart, User } from "react-feather";
import LoginForm from "../ui/auth/LoginForm";

const megaMenuItems = [
  {
    title: "TẤT CẢ SẢN PHẨM",
    arrow: true,
    items: [
      {
        label: "Sản phẩm mới",
        href: "#",
        className: "text-blue-600 font-medium",
      },
      { label: "Bán chạy nhất", isBold: true },
      { label: "ECC Collection", href: "#" },
      { label: "Excool Collection", href: "#" },
      { label: "Copper Denim", href: "#" },
      { label: "Promax", href: "#" },
    ],
  },
  {
    title: "ÁO NAM",
    arrow: true,
    items: [
      { label: "Áo Tanktop", href: "#" },
      { label: "Áo thun", href: "#" },
      { label: "Áo Thể Thao", href: "#" },
      { label: "Áo Polo", href: "#" },
      { label: "Áo Sơ Mi", href: "#" },
      { label: "Áo Dài Tay", href: "#" },
      { label: "Áo Khoác", href: "#" },
      { label: "Áo thun Graphic", href: "#" },
    ],
  },
  {
    title: "QUẦN NAM",
    arrow: true,
    items: [
      { label: "Quần Short", href: "#" },
      { label: "Quần Jogger", href: "#" },
      { label: "Quần Thể Thao", href: "#" },
      { label: "Quần Dài", href: "#" },
      { label: "Quần Pants", href: "#" },
      { label: "Quần Jean", href: "#" },
      { label: "Quần Kaki", href: "#" },
      { label: "Quần Bơi", href: "#" },
    ],
  },
  {
    title: "QUẦN LÓT NAM",
    arrow: true,
    items: [
      { label: "Brief (Tam giác)", href: "#" },
      { label: "Trunk (Boxer)", href: "#" },
      { label: "Boxer Brief (Boxer dài)", href: "#" },
      { label: "Long Leg", href: "#" },
      { label: "Short mặc nhà", href: "#" },
    ],
  },
  {
    title: "PHỤ KIỆN",
    arrow: true,
    items: [
      { label: "Tất cả phụ kiện", href: "#" },
      {
        label: "(Tất, mũ, túi...)",
        isItalic: true,
        className: "italic text-gray-500",
      },
    ],
  },
];

// Top bar component
function TopBar({ onLoginClick }) {
  return (
    <div className="bg-gray-500 text-white flex justify-between px-8 py-2 text-sm">
      <div>VỀ DVFASHION</div>
      <div className="flex gap-4">
        <a href="#">DVFclub</a>
        <a href="#">Blog</a>
        <a href="#">CSKH</a>
        <button className="hover:underline" onClick={onLoginClick}>
          Đăng nhập
        </button>
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
        <a href="/" className="text-2xl font-bold text-orange-600 w-full">
          <img
            src=".\src\assets\logo_DVF.png"
            alt="DVFASHION"
            className="h-8 w-full object-contain"
          />
        </a>
      </div>
      {/* Nav */}
      <nav className="flex gap-8 font-bold text-lg items-center relative w-full justify-center">
        <div className="group relative w-[110px] flex justify-center">
          <a href="#" className="cursor-pointer w-full text-center">
            NEW
          </a>
          <div className="absolute left-0 right-0 -bottom-1 h-[3px] w-0 bg-blue-600 rounded-full transition-all duration-500 group-hover:w-full"></div>
          <MegaMenu />
        </div>
        <div className="group relative w-[110px] flex justify-center">
          <a href="#" className="cursor-pointer w-full text-center">
            NAM
          </a>
          <div className="absolute left-0 right-0 -bottom-1 h-[3px] w-0 bg-black rounded-full transition-all duration-500 group-hover:w-full"></div>
          <MegaMenu />
        </div>
        <div className="group relative w-[110px] flex justify-center">
          <a href="#" className="cursor-pointer w-full text-center">
            NỮ
          </a>
          <div className="absolute left-0 right-0 -bottom-1 h-[3px] w-0 bg-black rounded-full transition-all duration-500 group-hover:w-full"></div>
          <MegaMenu />
        </div>
        <div className="group relative w-[110px] flex justify-center">
          <a href="#" className="cursor-pointer w-full text-center">
            THỂ THAO
          </a>
          <div className="absolute left-0 right-0 -bottom-1 h-[3px] w-0 bg-black rounded-full transition-all duration-500 group-hover:w-full"></div>
          <MegaMenu />
        </div>
        <div className="group relative w-[110px] flex justify-center">
          <a
            href="#"
            className="flex flex-col items-center text-red-600 font-bold w-full text-center"
          >
            SALE
          </a>
          <div className="absolute left-0 right-0 -bottom-1 h-[3px] w-0 bg-red-600 rounded-full transition-all duration-500 group-hover:w-full"></div>
          <MegaMenu />
        </div>
        <div className="group relative w-[110px] flex justify-center">
          <a href="#" className="cursor-pointer w-full text-center">
            C&S
          </a>
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
        <div className="flex items-center gap-2">
          <User size={24} />
          <span className="text-sm font-semibold" onClick={onUserClick}>
            {isAuthenticated ? user?.email : "Tài khoản"}
          </span>
        </div>
        <div className="relative">
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
                  {item.href ? (
                    <a href={item.href} className={item.className || ""}>
                      {item.label}
                    </a>
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
        <a href="#" className="text-gray-500 font-normal">
          THEO NHU CẦU
        </a>
        <a href="#">ĐỒ LÓT</a>
        <a href="#">ĐỒ THỂ THAO</a>
        <a href="#">MẶC HÀNG NGÀY</a>
        <a href="#">GRAPHIC TEES</a>
      </div>
    </div>
  );
}

// Login modal component
function LoginModal({ show, onClose }) {
  const { isAuthenticated } = useAuth();
  if (!show || isAuthenticated) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 relative min-w-[350px]">
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
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user?.roles) {
      const defaultRoute = getDefaultRouteByRoles(user?.roles);
      navigate(defaultRoute);
      setShowLogin(false);
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <header className="bg-white shadow">
      <TopBar onLoginClick={() => setShowLogin(true)} />
      <MainMenu
        isAuthenticated={isAuthenticated}
        user={user}
        onUserClick={() => setShowLogin(true)}
      />
      <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
    </header>
  );
}
