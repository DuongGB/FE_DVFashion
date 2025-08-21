import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getDefaultRouteByRoles } from "../../utils/getDefaultRouteByRoles";
import { ShoppingCart, User } from "react-feather";
import LoginForm from "../ui/auth/LoginForm";

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
function MainMenu({ isAuthenticated, user }) {
  return (
    <div className="bg-white flex items-center justify-between px-8 py-4 shadow">
      <div className="flex items-center gap-4">
        <a href="/" className="text-2xl font-bold text-orange-600">
          <img
            src=".\src\assets\logo_DVF.png"
            alt="DVFASHION"
            className="h-8"
          />
        </a>
      </div>
      <nav className="flex gap-8 font-bold text-lg items-center">
        <a href="#" className="text-blue-600">
          NEW
        </a>
        <a href="#">NAM</a>
        <a href="#">NỮ</a>
        <a href="#">THỂ THAO</a>
        <a
          href="#"
          className="flex flex-col items-center text-red-600 font-bold"
        >
          <span className="text-sm">-50%</span>
          <span className="text-xl">SALE</span>
        </a>
        <a href="#">C&S</a>
      </nav>
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="border rounded-full px-4 py-1"
        />
        <div className="flex items-center gap-2">
          <User size={24} />
          <span className="text-sm font-semibold">
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
      <MainMenu isAuthenticated={isAuthenticated} user={user} />
      <LoginModal show={showLogin} onClose={() => setShowLogin(false)} />
    </header>
  );
}
