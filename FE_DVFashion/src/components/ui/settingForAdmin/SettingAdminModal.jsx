import { useState } from "react";
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

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-[400px] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 cursor-pointer"
          onClick={onClose}
        >
          <IconX size={20} />
        </button>

        <h2 className="text-xl font-bold mb-6 text-gray-800 text-center">
          {t("settings")}
        </h2>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <IconLanguage size={20} className="text-gray-600" />
            <span className="text-gray-700 font-medium">{t("language")}</span>
          </div>
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                i18n.language === "VI"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => i18n.changeLanguage("VI")}
            >
              VI
            </button>
            <button
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                i18n.language === "EN"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => i18n.changeLanguage("EN")}
            >
              EN
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <IconLock size={20} className="text-gray-600" />
            <span className="text-gray-700 font-medium">
              {t("change_password")}
            </span>
          </div>
          <button
            className="text-blue-600 font-medium cursor-pointer"
            onClick={() => setShowChangePasswordModal(true)}
          >
            {t("update")}
          </button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <IconUser size={20} className="text-gray-600" />
            <span className="text-gray-700 font-medium">
              {t("update_account")}
            </span>
          </div>
          <button
            className="text-blue-600 font-medium cursor-pointer"
            onClick={() => setShowUpdateAccountModal(true)}
          >
            {t("update")}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconBell size={20} className="text-gray-600" />
            <span className="text-gray-700 font-medium">
              {t("notifications")}
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
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition-transform"></div>
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
