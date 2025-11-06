import { useState, useEffect } from "react";
import {
  IconX,
  IconLanguage,
  IconLock,
  IconUser,
  IconBell,
} from "@tabler/icons-react";
import ModalChangePassword from "../account/ModalChangePassword";
import ModalUpdateAccount from "../account/ModalUpdateAccount";
import { useAuth } from "../../../hooks/useAuth";
import { useTranslation } from "react-i18next";

export default function SettingAdminModal({ show, onClose }) {
  const { t, i18n } = useTranslation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showUpdateAccountModal, setShowUpdateAccountModal] = useState(false);

  // Lấy thông tin người dùng hiện tại từ hook useAuth
  const { user: currentUser } = useAuth();

  // Cập nhật giao diện khi ngôn ngữ thay đổi
  useEffect(() => {
    const handleLanguageChange = () => {
      // Force component update
    };

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("i18nextLng", lang);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        className="relative w-full max-w-[400px] rounded-2xl shadow-2xl border border-white/30 p-6
          bg-gradient-to-br from-white/60 via-white/40 to-blue-100/40
          backdrop-blur-2xl
          transition-all duration-300
          animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 cursor-pointer bg-white/40 backdrop-blur-sm rounded-full p-1 shadow"
          onClick={onClose}
        >
          <IconX size={20} />
        </button>

        <h2 className="text-xl font-bold mb-6 text-gray-800 text-center bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 bg-clip-text text-transparent">
          {t("admin.settings.title")}
        </h2>

        <div className="flex items-center justify-between mb-4 backdrop-blur-sm bg-white/30 rounded-xl px-3 py-2 border border-white/20">
          <div className="flex items-center gap-3">
            <IconLanguage size={20} className="text-blue-600" />
            <span className="text-gray-700 font-medium">
              {t("admin.settings.language")}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 rounded-full text-sm font-medium shadow cursor-pointer
                ${
                  i18n.language === "VI"
                    ? "bg-blue-600 text-white"
                    : "bg-white/60 text-blue-700 border border-blue-200/40"
                }`}
              onClick={() => handleLanguageChange("VI")}
            >
              VI
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm font-medium shadow cursor-pointer
                ${
                  i18n.language === "EN"
                    ? "bg-blue-600 text-white"
                    : "bg-white/60 text-blue-700 border border-blue-200/40"
                }`}
              onClick={() => handleLanguageChange("EN")}
            >
              EN
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 backdrop-blur-sm bg-white/30 rounded-xl px-3 py-2 border border-white/20">
          <div className="flex items-center gap-3">
            <IconLock size={20} className="text-purple-600" />
            <span className="text-gray-700 font-medium">
              {t("admin.settings.change_password")}
            </span>
          </div>
          <button
            className="text-blue-600 font-medium cursor-pointer hover:underline"
            onClick={() => setShowChangePasswordModal(true)}
          >
            {t("admin.settings.update")}
          </button>
        </div>

        <div className="flex items-center justify-between mb-4 backdrop-blur-sm bg-white/30 rounded-xl px-3 py-2 border border-white/20">
          <div className="flex items-center gap-3">
            <IconUser size={20} className="text-pink-600" />
            <span className="text-gray-700 font-medium">
              {t("admin.settings.update_account")}
            </span>
          </div>
          <button
            className="text-blue-600 font-medium cursor-pointer hover:underline"
            onClick={() => setShowUpdateAccountModal(true)}
          >
            {t("admin.settings.update")}
          </button>
        </div>

        <div className="flex items-center justify-between backdrop-blur-sm bg-white/30 rounded-xl px-3 py-2 border border-white/20">
          <div className="flex items-center gap-3">
            <IconBell size={20} className="text-yellow-500" />
            <span className="text-gray-700 font-medium">
              {t("admin.settings.notifications")}
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={notificationsEnabled}
              onChange={() => setNotificationsEnabled(!notificationsEnabled)}
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition-all"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition-transform shadow"></div>
          </label>
        </div>
      </div>
      <ModalChangePassword
        show={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        user={currentUser}
      />
      <ModalUpdateAccount
        show={showUpdateAccountModal}
        onClose={() => setShowUpdateAccountModal(false)}
        user={currentUser}
      />
    </div>
  );
}
