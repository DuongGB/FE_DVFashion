import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { IconSettings, IconBell } from "@tabler/icons-react";
import Sidebar from "../components/common/Sidebar";
import SettingAdminModal from "../components/ui/settingForAdmin/SettingAdminModal";
import { useTranslation } from "react-i18next";

export default function AdminLayout() {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const handleLanguageChange = () => {};
    i18n.on("languageChanged", handleLanguageChange);
    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex relative overflow-hidden">
      {/* Liquid glass background blobs */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>
      <Sidebar />
      <div className="flex-1 flex flex-col relative z-10">
        <header className="backdrop-blur-xl bg-white/60 border-b border-white/30 shadow-lg flex items-center justify-between px-6 py-4 rounded-b-2xl">
          <div className="text-lg font-semibold bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 bg-clip-text text-transparent">
            {t("admin.dashboard.title")}
          </div>
          <div className="flex items-center space-x-4">
            {/* Settings Icon */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsSettingModalOpen(true)}
                className="relative hover:bg-white/70 hover:shadow cursor-pointer p-2 rounded-full transition-all backdrop-blur-sm border border-white/30"
              >
                <IconSettings size={24} />
              </button>
            </div>
            {/* Notification Icon */}
            <button className="relative hover:bg-white/70 hover:shadow cursor-pointer p-2 rounded-full transition-all backdrop-blur-sm border border-white/30">
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              <IconBell size={24} />
            </button>
            {/* User Avatar */}
            <img
              src="https://img.pikbest.com/png-images/20240806/3d-character-of-a-male-office-worker-wearing-white-shirt-and-tie_10659321.png!f305cw"
              alt="User Avatar"
              className="w-8 h-8 rounded-full border-2 border-white/40 shadow"
            />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-2 sm:px-4 py-4">
          <Outlet />
        </main>
      </div>

      {/* Setting Admin Modal */}
      <SettingAdminModal
        show={isSettingModalOpen}
        onClose={() => setIsSettingModalOpen(false)}
      />
    </div>
  );
}
