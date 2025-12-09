import { useEffect, useRef, useState, useCallback } from "react";
import { ShoppingCart, User, ChevronDown, ChevronUp } from "react-feather";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAuthModal } from "../../contexts/AuthModalContext";
import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { useCategory } from "../../hooks/useCategory";
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
      <div className="max-w-8xl mx-auto flex justify-between px-4 sm:px-6 py-2 text-xs sm:text-sm">
        <Link to="/" className="hidden md:block">
          {t("header.about_dvfashion")}
        </Link>
        <div className="flex gap-2 sm:gap-4 ml-auto">
          <LangSwitchButton lang={lang} onLangChange={handleLangChange} />
          <Link to="#" className="hidden sm:block">
            {t("header.dvfclub")}
          </Link>
          <button
            className="hover:underline cursor-pointer hidden sm:block"
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
              <span className="text-sm font-semibold hidden sm:inline">
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileActiveMenu, setMobileActiveMenu] = useState(null); // State cho mobile menu
  const { cart, removeItem } = useCart();
  const searchRef = useRef();
  const cartRef = useRef();
  const navigate = useNavigate();

  const {
    categories = [],
    isLoading,
    error,
  } = useCategory({
    lang: i18n.language || "VI",
    active: true,
    size: 20,
  });

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
      const param = encodeId(category.id);
      navigate(`/products?category=${param}`);
      setActiveMenu(null);
      setMobileMenuOpen(false); // Đóng mobile menu
      setMobileActiveMenu(null); // Reset mobile active menu
    },
    [navigate]
  );

  // Xử lý hover vào menu item (desktop)
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

  // Xử lý rời khỏi menu item (desktop)
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
      onClick: () => {
        navigate("/help");
        setMobileMenuOpen(false);
      },
    },
  ];

  // Xử lý click promotion
  const handlePromotionClick = useCallback(
    (promotion) => {
      const param = encodeId(promotion.id);
      navigate(`/promotions/${param}`);
      setActiveMenu(null);
      setMobileMenuOpen(false);
      setMobileActiveMenu(null);
    },
    [navigate]
  );

  // Xử lý toggle mobile submenu
  const handleMobileMenuToggle = (itemKey) => {
    if (mobileActiveMenu === itemKey) {
      setMobileActiveMenu(null);
    } else {
      setMobileActiveMenu(itemKey);
    }
  };

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
    navigate("/cart");
    setShowCart(false);
  };

  // Lấy số lượng sản phẩm trong giỏ hàng
  const cartLength = cart?.items?.length || 0;

  return (
    <div className="sticky top-0 z-50 border-b border-white/40 shadow-lg backdrop-blur-xl bg-white/40">
      <div className="max-w-8xl mx-auto flex items-center justify-between py-3 px-4 sm:px-6">
        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => {
            setMobileMenuOpen(!mobileMenuOpen);
            setMobileActiveMenu(null); // Reset submenu khi đóng/mở
          }}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {mobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 sm:gap-3 min-w-[140px] sm:min-w-[160px]"
        >
          <div className="flex items-center gap-2">
            <img
              src="https://i.ibb.co/wvKHnrX/logo-DVF.png"
              alt="DVFASHION logo"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg shadow-md ring-1 ring-white/50 bg-white/70 backdrop-blur"
            />
            <span className="text-lg sm:text-xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600">
              DVFASHION
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-2 font-bold text-[15px] items-center relative w-full justify-center">
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
        <div className="flex items-center gap-2 sm:gap-4" ref={searchRef}>
          {/* Search - Hide on mobile */}
          <div
            className="hidden sm:flex flex-1 items-center"
            onClick={() => {
              if (!showSearch) setShowSearch(true);
            }}
          >
            <div className="relative w-[200px] lg:w-[320px] cursor-pointer shadow-xl rounded-full border border-gray-800/40 hover:shadow-2xl transition-shadow duration-300">
              <input
                type="text"
                placeholder={t("header.search_placeholder")}
                className="border border-white/40 rounded-full px-10 py-2 w-full bg-white/60 backdrop-blur placeholder-gray-600 text-gray-800 shadow-inner focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
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

          {/* Mobile Search Icon */}
          <button
            className="sm:hidden p-2"
            onClick={() => setShowSearch(true)}
            aria-label="Search"
          >
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>

          <SearchPopup show={showSearch} onClose={handleCloseSearch} />

          {/* Account - Show icon only on mobile */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={onUserClick}
          >
            <User size={20} className="sm:w-6 sm:h-6" />
            <span className="text-sm font-semibold hidden sm:inline">
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
            <ShoppingCart size={20} className="sm:w-6 sm:h-6" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1 shadow min-w-[18px] text-center">
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

      {/* Mobile Menu Dropdown with Submenu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg max-h-[70vh] overflow-y-auto">
          <nav className="flex flex-col p-4 space-y-1">
            {menuItems.map((item) => {
              const hasSubmenu =
                item.categories?.length > 0 || item.promotions?.length > 0;
              const isExpanded = mobileActiveMenu === item.key;

              return (
                <div key={item.key}>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 rounded font-semibold flex items-center justify-between"
                    onClick={() => {
                      if (hasSubmenu) {
                        handleMobileMenuToggle(item.key);
                      } else {
                        item.onClick?.();
                      }
                    }}
                  >
                    <span>{item.label}</span>
                    {hasSubmenu && (
                      <span className="ml-2">
                        {isExpanded ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </span>
                    )}
                  </button>

                  {/* Submenu - Categories or Promotions */}
                  {hasSubmenu && isExpanded && (
                    <div className="ml-4 mt-1 space-y-1 bg-gray-50 rounded-lg p-2">
                      {item.key === "promotion" ? (
                        // Promotions submenu
                        <>
                          {isLoadingPromotions ? (
                            <div className="px-4 py-2 text-sm text-gray-500">
                              {t("common.loading")}...
                            </div>
                          ) : item.promotions?.length > 0 ? (
                            item.promotions.map((promo) => (
                              <button
                                key={promo.id}
                                type="button"
                                className="w-full text-left px-4 py-2 text-sm hover:bg-white rounded transition-colors"
                                onClick={() => handlePromotionClick(promo)}
                              >
                                <div className="font-medium">{promo.name}</div>
                                <div className="text-xs text-gray-500 line-clamp-1">
                                  {promo.description}
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-sm text-gray-500">
                              {t("promotion.not_found")}
                            </div>
                          )}
                        </>
                      ) : (
                        // Categories submenu
                        <>
                          {isLoading ? (
                            <div className="px-4 py-2 text-sm text-gray-500">
                              {t("common.loading")}...
                            </div>
                          ) : item.categories?.length > 0 ? (
                            item.categories.map((cat) => (
                              <button
                                key={cat.id}
                                type="button"
                                className="w-full text-left px-4 py-2 text-sm hover:bg-white rounded transition-colors"
                                onClick={() => handleCategoryClick(cat)}
                              >
                                {cat.name}
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-sm text-gray-500">
                              {t("category.no_categories")}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}

// MegaMenu component giữ nguyên như cũ
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

  const containerBase =
    "fixed left-1/2 -translate-x-1/2 top-[64px] w-[95vw] sm:w-[92vw] max-w-[1280px] bg-white/95 backdrop-blur-lg shadow-2xl rounded-2xl z-50";
  const containerBorder = "border-2 border-gray-300 ring-1 ring-black/5";

  if (menuType === "promotion") {
    const displayPromotions = (promotions || []).slice(0, 8);

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
        className={`${containerBase} ${containerBorder} py-6 sm:py-8 px-4 sm:px-10 flex flex-col gap-4 sm:gap-6`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        role="menu"
        aria-label="Promotions menu"
      >
        <h3 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
          {t("promotion.active_promotions")}
          <span className="text-xs sm:text-sm font-medium text-gray-500">
            ({displayPromotions.length})
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
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
                className="group text-left p-3 sm:p-4 rounded-xl border border-gray-200 hover:border-orange-500 hover:shadow-lg transition-all"
                onClick={() => onPromotionClick(promo)}
              >
                <h4 className="font-semibold text-sm sm:text-base text-gray-800 group-hover:text-orange-600 transition-colors line-clamp-1">
                  {promo.name}
                </h4>
                <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                  {promo.description ||
                    t("promotion.no_description", "Không có mô tả")}
                </p>
                <div className="mt-2 sm:mt-3 flex flex-wrap items-center gap-1 sm:gap-2 text-[10px] sm:text-[11px] text-gray-600">
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

  const compactCategories = (categories || []).slice(0, 18);

  return (
    <div
      className={`${containerBase} ${containerBorder} py-6 sm:py-8 px-4 sm:px-8 flex gap-0 opacity-100 pointer-events-auto transition-all duration-200 text-sm sm:text-base overflow-hidden`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="menu"
      aria-label="Mega menu"
    >
      <div className="flex-1">
        {compactCategories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {compactCategories.map((cat) => (
              <div key={cat.id} className="min-w-[100px] sm:min-w-[120px]">
                <button
                  type="button"
                  className="text-left w-full hover:text-orange-600 font-semibold transition-colors text-xs sm:text-sm py-2 px-2 sm:px-3 rounded-md hover:bg-orange-50 cursor-pointer"
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
          <div className="flex-1 text-center text-gray-600 py-8 text-sm">
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

  const handleUserClick = () => {
    if (isAuthenticated && user?.roles) {
      setShowAccount(true);
    } else {
      authModal.openLogin();
    }
  };

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

      <AuthModal
        isOpen={authModal.isOpen}
        onClose={authModal.close}
        initialMode={authModal.mode}
        stayOnPage={authModal.stayOnPage}
      />

      <ModalAccount
        show={showAccount}
        onClose={() => setShowAccount(false)}
        user={user}
      />
    </header>
  );
}
