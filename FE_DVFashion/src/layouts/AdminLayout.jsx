import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { IconSettings, IconBell } from "@tabler/icons-react";
import Sidebar from "../components/common/Sidebar";
import SettingAdminModal from "../components/ui/settingForAdmin/SettingAdminModal";
import { useTranslation } from "react-i18next";

export default function AdminLayout() {
  const { t, i18n } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div
        className={`fixed inset-0 z-50 bg-black/40 md:hidden transition-all duration-300 ${
          isSidebarOpen ? "block" : "hidden"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      >
        <div
          className="absolute left-0 top-0 h-full w-64 bg-gradient-to-br from-blue-900 to-indigo-900 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <Sidebar onClose={() => setIsSidebarOpen(false)} />
        </div>
      </div>
      <div className="flex-1 flex flex-col relative z-10">
        <header className="backdrop-blur-xl bg-white/60 border-b border-white/30 shadow-lg flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 rounded-b-2xl">
          {/* Hamburger menu mobile */}
          <button
            className="md:hidden p-2 rounded-full hover:bg-white/70"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <svg
              width="28"
              height="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="4" y="8" width="20" height="2" rx="1" />
              <rect x="4" y="14" width="20" height="2" rx="1" />
              <rect x="4" y="20" width="20" height="2" rx="1" />
            </svg>
          </button>
          <div className="text-xl sm:text-3xl font-extrabold tracking-tight text-gray-800 drop-shadow-lg py-2">
            {t("admin.dashboard.title")}
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
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
