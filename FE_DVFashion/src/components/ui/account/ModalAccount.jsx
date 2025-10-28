import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useTranslation } from "react-i18next";

export default function ModalAccount({ show, onClose, user }) {
  const { logout, isLogoutLoading } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  // Force re-render when language changes
  useEffect(() => {
    // This will trigger a re-render when i18n language changes
    const handleLanguageChange = () => {
      // Force component update
    };

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  // Điều khiển animation khi show thay đổi
  useEffect(() => {
    if (show) {
      setTimeout(() => setIsVisible(true), 10); // delay nhỏ để kích hoạt transition
    } else {
      setIsVisible(false);
    }
  }, [show]);

  if (!show) return null;

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-end z-50 bg-black/50"
      onClick={onClose}
    >
      <div
        className={`
          bg-white rounded-lg shadow-lg p-6 relative min-w-[400px] max-w-[420px] h-auto overflow-y-auto
          transition-transform duration-300
          ${isVisible ? "translate-x-0" : "translate-x-full"}
        `}
        onClick={(e) => e.stopPropagation()}
        style={{ right: 0 }}
      >
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-black text-xl cursor-pointer"
          onClick={onClose}
        >
          &times;
        </button>
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold mb-1">
            {t("modal_account.greeting")}, {user?.fullName}
          </h2>
          <div className="text-blue-600 font-semibold flex items-center gap-2">
            {t("modal_account.new_member")}
            <span className="inline-block bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
              🛡️
            </span>
          </div>
        </div>
        {/* Banner */}
        <div className="mb-4">
          <div className="bg-black text-white rounded-lg px-4 py-2 flex items-center justify-center">
            <span>{t("modal_account.banner_text")}</span>
          </div>
        </div>
        {/* Rank Progress */}
        <div className="mb-4 bg-gray-50 rounded-lg p-4">
          <div className="text-gray-700 mb-1">
            {t("modal_account.spend_more")}
          </div>
          <div className="text-blue-600 font-bold text-2xl mb-1">300.000đ</div>
          <div className="text-gray-700 mb-2">
            {t("modal_account.to_rank_up")}{" "}
            <span className="font-bold text-gray-800">
              {t("modal_account.silver")}
            </span>
          </div>
          <div className="flex items-center gap-4 mb-2">
            <span className="text-blue-600">🛡️</span>
            <span className="text-gray-400">🛡️</span>
            <span className="text-yellow-600">🛡️</span>
            <span className="text-gray-800">🛡️</span>
          </div>
          <div className="text-xs text-gray-500">
            {t("modal_account.rank_review_date", {
              lastReview: "01/07/2025",
              nextReview: "01/10/2025",
            })}
          </div>
        </div>
        {/* DVFcash */}
        <div className="mb-4 flex gap-2">
          <div className="bg-white border rounded-lg flex-1 p-3 flex flex-col justify-center">
            <div className="font-bold text-lg flex items-center gap-2">
              <span className="text-black">🪙</span>
              <span>0 {t("modal_account.dv_cash")}</span>
            </div>
            <div className="text-xs text-gray-500">
              {t("modal_account.pending_cash", { amount: 0 })}
            </div>
          </div>
          <Link className="bg-black text-white rounded-lg flex-1 p-3 flex flex-col justify-center items-center">
            <div className="font-bold">{t("modal_account.go_to_dvfclub")}</div>
            <span className="text-xl">→</span>
          </Link>
        </div>
        {/* Referral */}
        <div className="mb-4 bg-blue-600 rounded-lg p-4 text-white">
          <div className="font-bold mb-2">
            {t("modal_account.referral_title")}
          </div>
          <div className="text-sm mb-2">{t("modal_account.referral_desc")}</div>
          <div className="flex gap-2">
            <button className="bg-white text-blue-600 rounded-full px-4 py-1 font-bold">
              {t("modal_account.share")}
            </button>
            <button className="bg-blue-800 text-white rounded-full px-4 py-1 font-bold">
              {t("modal_account.learn_more")}
            </button>
          </div>
        </div>
        {/* Go to account */}
        <button
          className="w-full bg-blue-700 text-white font-bold py-3 rounded-lg mt-4 cursor-pointer"
          onClick={() => {
            navigate("/account");
            onClose();
          }}
        >
          {t("modal_account.go_to_account")}
        </button>
        <button
          className="w-full bg-red-500 text-white font-bold py-3 rounded-lg mt-2 cursor-pointer"
          onClick={handleLogout}
          disabled={isLogoutLoading}
        >
          {isLogoutLoading
            ? t("modal_account.logging_out")
            : t("modal_account.logout")}
        </button>
      </div>
    </div>
  );
}
