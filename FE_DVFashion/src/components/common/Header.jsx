import { useEffect, useRef, useState, useCallback } from "react";
import { ShoppingCart, User } from "react-feather";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo_DVF.png";
import { useAuthModal } from "../../contexts/AuthModalContext";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { usePublicCategories } from "../../hooks/useCategory";
import { usePromotion } from "../../hooks/usePromotion";
import { getLastName } from "../../utils/getLastName";
import ModalAccount from "../ui/account/ModalAccount";
import AuthModal from "../ui/auth/AuthModal";
import CartDropdown from "../ui/cart/CartDropdown";
import SearchPopup from "./SearchPopup";
import { encodeId } from "../../utils/encodeId";

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
    <div className="bg-gray-500 text-white">
      <div className="max-w-7xl mx-auto flex justify-between px-6 py-2 text-sm">
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
  const navigate = useNavigate();

  const { categories, isLoading, error } = usePublicCategories(i18n.language);
  // console.log("Fetched categories in MainMenu:", categories);
  const { useActivePromotionsPaging } = usePromotion(i18n.language || "VI");
  const {
    data: activePromosPage,
    isLoading: isLoadingPromotions,
    error: promotionsError,
  } = useActivePromotionsPaging({ page: 0, size: 8 });

  const promotions = activePromosPage?.values ?? [];

  const [activeMenu, setActiveMenu] = useState(null);

  // Chuẩn hóa chuỗi để so khớp tiếng Việt/Anh, bỏ dấu
  const normalize = (s = "") =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  // Lọc & nhóm categories theo men/women/unisex dựa trên name/description
  const categoriesByMenu = (() => {
    const groups = { men: [], women: [], unisex: [] };
    (categories || [])
      .filter((cat) => cat?.active)
      .forEach((cat) => {
        const text = normalize(`${cat?.name || ""} ${cat?.description || ""}`);
        const hasMen = text.includes("nam") || text.includes("men");
        const hasWomen = text.includes("nu") || text.includes("women");
        const hasUnisex = text.includes("unisex") || (hasMen && hasWomen);
        if (hasUnisex) groups.unisex.push(cat);
        else if (hasMen) groups.men.push(cat);
        else if (hasWomen) groups.women.push(cat);
        else groups.unisex.push(cat);
      });
    return groups;
  })();

  const handleCategoryClick = useCallback(
    (category) => {
      // Encode id để CategoryProductPage giải mã được (decodeId)
      const param = encodeId(category.id);
      navigate(`/products?category=${param}`);
      setActiveMenu(null); // đóng mega menu sau khi chuyển trang
    },
    [navigate]
  );

  // Xử lý hover vào menu item
  const handleMouseEnter = useCallback(
    (menuKey) => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        setHideTimeout(null);
      }
      setActiveMenu(menuKey);
    },
    [hideTimeout]
  );

  // Xử lý rời khỏi menu item
  const handleMouseLeave = useCallback(() => {
    const timeout = setTimeout(() => {
      setActiveMenu(null);
    }, 200);
    setHideTimeout(timeout);
  }, []);

  // Xử lý đóng search popup
  const handleCloseSearch = useCallback(() => {
    setShowSearch(false);
  }, []);

  const menuItems = [
    {
      key: "men",
      label: t("header.navigation.men"),
      color: "",
      underline: "bg-black",
      categories: categoriesByMenu.men,
    },
    {
      key: "women",
      label: t("header.navigation.women"),
      color: "",
      underline: "bg-black",
      categories: categoriesByMenu.women,
    },
    {
      key: "unisex",
      label: t("header.navigation.unisex"),
      color: "",
      underline: "bg-black",
      categories: categoriesByMenu.unisex,
    },
    {
      key: "promotion",
      label: t("header.navigation.promotion"),
      color: "",
      underline: "bg-black",
      promotions,
    },
    {
      key: "cs",
      label: t("header.navigation.cs"),
      color: "",
      underline: "bg-black",
      onClick: () => navigate("/help"),
    },
  ];

  //Xử lý click promotion
  const handlePromotionClick = useCallback(
    (promotion) => {
      const param = encodeId(promotion.id);
      navigate(`/promotions/${param}`);
      setActiveMenu(null);
    },
    [navigate]
  );

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

  // Cleanup timeout khi component unmount
  useEffect(() => {
    return () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [hideTimeout]);

  // Xóa sản phẩm khỏi giỏ hàng
  const handleRemoveCartItem = async (cartItemId) => {
    await removeItem(cartItemId);
  };

  const handleViewAllCart = (e) => {
    e.stopPropagation();
    window.location.href = "/cart";
  };

  // Lấy số lượng sản phẩm trong giỏ hàng
  const cartLength = cart?.items?.length || 0;

  return (
    <div className="sticky top-0 z-50 border-b border-white/40 shadow-lg backdrop-blur-xl bg-white/40">
      <div className="max-w-7xl mx-auto flex items-center justify-between py-3 max-w-[95%]">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 min-w-[160px]">
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt="DVFASHION logo"
              className="h-9 w-9 rounded-lg shadow-md ring-1 ring-white/50 bg-white/70 backdrop-blur"
            />
            <span className="text-xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">
              DVFASHION
            </span>
          </div>
        </Link>
        {/* Nav */}
        <nav className="flex gap-2 font-bold text-[15px] items-center relative w-full justify-center">
          {menuItems.map((item) => (
            <div
              key={item.key}
              className="group relative inline-flex items-center"
              onMouseEnter={() => handleMouseEnter(item.key)}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                className={`px-3 py-1 cursor-pointer text-center whitespace-nowrap ${item.color}`}
                onClick={item.onClick}
              >
                {item.label}
              </button>
              <div
                className={`pointer-events-none absolute left-0 right-0 -bottom-1 h-[2px] w-0 ${item.underline} rounded-full transition-all duration-300 group-hover:w-full bg-red-500`}
              ></div>
              {activeMenu === item.key &&
                (item.categories?.length > 0 ||
                  item.promotions?.length > 0) && (
                  <MegaMenu
                    onMouseEnter={() => handleMouseEnter(item.key)}
                    onMouseLeave={handleMouseLeave}
                    categories={item.categories || []}
                    promotions={item.promotions || []}
                    isLoading={
                      item.key === "promotion" ? isLoadingPromotions : isLoading
                    }
                    error={item.key === "promotion" ? promotionsError : error}
                    onCategoryClick={handleCategoryClick}
                    onPromotionClick={handlePromotionClick}
                    menuType={item.key}
                  />
                )}
            </div>
          ))}
        </nav>
        {/* Search, Account, Cart */}
        <div className="flex items-center gap-4" ref={searchRef}>
          <div
            className="flex-1 flex items-center"
            onClick={() => {
              if (!showSearch) setShowSearch(true);
            }}
          >
            {/* Thanh search glass */}
            <div className="relative w-[320px] cursor-pointer shadow-xl rounded-full border border-gray-800/40 hover:shadow-2xl transition-shadow duration-300">
              <input
                type="text"
                placeholder={t("header.search_placeholder")}
                className="border border-white/40 rounded-full px-10 py-2 w-full bg-white/60 backdrop-blur placeholder-gray-600 text-gray-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-white/50"
                readOnly
                aria-label={t("header.search_placeholder")}
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
              </span>
            </div>
          </div>
          <SearchPopup show={showSearch} onClose={handleCloseSearch} />
          {/* Account và Cart */}
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
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1 shadow">
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
    </div>
  );
}

function MegaMenu({
  onMouseEnter,
  onMouseLeave,
  categories,
  promotions = [],
  isLoading,
  error,
  onCategoryClick,
  onPromotionClick,
  menuType,
}) {
  const { t, i18n } = useTranslation();

  // Make borders clearer and layout constrained
  const containerBase =
    "fixed left-1/2 -translate-x-1/2 top-[64px] w-[92vw] max-w-[1280px] bg-white/95 backdrop-blur-lg shadow-2xl rounded-2xl z-50";
  const containerBorder = "border-2 border-gray-300 ring-1 ring-black/5";

  if (menuType === "promotion") {
    const displayPromotions = (promotions || []).slice(0, 8); // max 8 promos, 2 rows

    if (isLoading) {
      return (
        <div
          className={`${containerBase} ${containerBorder} py-8 px-10`}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <h3 className="text-lg font-bold mb-6">
            {t("promotion.active_promotions")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-lg bg-gray-100 border border-gray-200"
              ></div>
            ))}
          </div>
        </div>
      );
    }

    if (error || displayPromotions.length === 0) {
      return (
        <div
          className={`${containerBase} ${containerBorder} py-10 px-10 text-center`}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <p className="text-gray-600">
            {t("promotion.not_found", "Không tìm thấy khuyến mãi")}
          </p>
        </div>
      );
    }

    return (
      <div
        className={`${containerBase} ${containerBorder} py-8 px-10 flex flex-col gap-6`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        role="menu"
        aria-label="Promotions menu"
      >
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          {t("promotion.active_promotions")}
          <span className="text-sm font-medium text-gray-500">
            ({displayPromotions.length})
          </span>
        </h3>

        {/* 2 rows x 4 columns on md+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          {displayPromotions.map((promo) => {
            const productCount = promo.promotionProducts?.length || 0;
            const endDate = new Date(promo.endDate);
            const daysLeft = Math.ceil(
              (endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );
            return (
              <button
                key={promo.id}
                type="button"
                className="group text-left p-4 rounded-xl border border-gray-200 hover:border-orange-500 hover:shadow-lg transition-all"
                onClick={() => onPromotionClick(promo)}
              >
                <h4 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors line-clamp-1">
                  {promo.name}
                </h4>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {promo.description ||
                    t("promotion.no_description", "Không có mô tả")}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-gray-600">
                  <span>{productCount}</span>
                  <span>•</span>
                  <span>
                    {endDate.toLocaleDateString(
                      i18n.language.startsWith("vi") ? "vi-VN" : "en-US"
                    )}
                  </span>
                  {daysLeft >= 0 && (
                    <>
                      <span>•</span>
                      <span className="text-orange-600 font-medium">
                        {daysLeft} {t("header.days_left", "ngày còn lại")}
                      </span>
                    </>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Categories mega menu: compact, max 18 categories
  const compactCategories = (categories || []).slice(0, 18);

  return (
    <div
      className={`${containerBase} ${containerBorder} py-8 px-8 flex gap-0 opacity-100 pointer-events-auto transition-all duration-200 text-base overflow-hidden`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="menu"
      aria-label="Mega menu"
    >
      <div className="flex-1">
        {compactCategories.length > 0 ? (
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: "repeat(6, minmax(0, 1fr))", // 6 cols x 3 rows = 18
            }}
          >
            {compactCategories.map((cat) => (
              <div key={cat.id} className="min-w-[120px]">
                <button
                  type="button"
                  className="text-left w-full hover:text-orange-600 font-semibold transition-colors text-sm py-2 px-3 rounded-md hover:bg-orange-50 cursor-pointer"
                  onClick={() => onCategoryClick(cat)}
                  aria-label={`Open category ${cat.name}`}
                  title={cat.name}
                >
                  <span className="line-clamp-1">{cat.name}</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 text-center text-gray-600 py-8">
            {t("category.no_categories", "Không có danh mục nào")}
          </div>
        )}
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
