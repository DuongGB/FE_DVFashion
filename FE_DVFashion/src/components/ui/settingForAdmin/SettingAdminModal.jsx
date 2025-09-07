import { useEffect, useState } from "react";
import {
  IconX,
  IconLanguage,
  IconUser,
  IconSettings,
} from "@tabler/icons-react";
import ModalUpdateAccount from "../account/ModalUpdateAccount";
import { useAuth } from "../../../hooks/useAuth";

export default function SettingAdminModal({ show, onClose, user }) {
  const [language, setLanguage] = useState("VI");
  const [showUpdateAccountModal, setShowUpdateAccountModal] = useState(false);
  const { user: getCurrentUser } = useAuth();

  useEffect(() => {
    if (getCurrentUser && getCurrentUser.language) {
      setLanguage(getCurrentUser.language);
    }
  }, [getCurrentUser]);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-[600px] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 bg-black text-white rounded-full w-8 h-8 flex items-center justify-center text-xl hover:bg-gray-800 transition-colors cursor-pointer"
          onClick={onClose}
        >
          <IconX size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">Cài đặt</h2>

        {/* Language Setting */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <IconLanguage size={20} className="text-blue-600" />
            Ngôn ngữ
          </h3>
          <div className="flex gap-4">
            <button
              className={`flex-1 py-3 rounded-lg font-medium cursor-pointer ${
                language === "VI"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => handleLanguageChange("VI")}
            >
              Tiếng Việt
            </button>
            <button
              className={`flex-1 py-3 rounded-lg font-medium cursor-pointer ${
                language === "EN"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => handleLanguageChange("EN")}
            >
              English
            </button>
          </div>
        </div>

        {/* Account Update */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <IconUser size={20} className="text-blue-600" />
            Tài khoản
          </h3>
          <button
            className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors cursor-pointer"
            onClick={() => setShowUpdateAccountModal(true)}
          >
            Cập nhật tài khoản
          </button>
        </div>

        {/* Other Settings */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <IconSettings size={20} className="text-blue-600" />
            Cài đặt khác
          </h3>
          <p className="text-gray-600 text-sm">
            Các cài đặt khác sẽ được thêm vào đây trong tương lai.
          </p>
        </div>

        {/* Update Account Modal */}
        {showUpdateAccountModal && (
          <ModalUpdateAccount
            show={showUpdateAccountModal}
            onClose={() => setShowUpdateAccountModal(false)}
            user={getCurrentUser}
          />
        )}
      </div>
    </div>
  );
}
