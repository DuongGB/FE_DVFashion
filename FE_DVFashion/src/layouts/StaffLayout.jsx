import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";
import SettingAdminModal from "../components/ui/settingForAdmin/SettingAdminModal";
import { useTranslation } from "react-i18next";
import { IconSettings, IconBell } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export default function StaffLayout() {
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
    <div className="h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-md flex items-center justify-between px-6 py-4">
          <div className="text-lg font-semibold">
            {t("staff.dashboard.title")}
          </div>
          <div className="flex items-center space-x-4">
            {/* Settings Icon */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsSettingModalOpen(true)}
                className="relative hover:bg-gray-200 cursor-pointer p-2 rounded-full"
              >
                <IconSettings size={24} />
              </button>
            </div>
            {/* Notification Icon */}
            <button className="relative hover:bg-gray-200 cursor-pointer p-2 rounded-full">
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              <IconBell size={24} />
            </button>
            {/* User Avatar */}
            <img
              src="https://img.pikbest.com/png-images/20240806/3d-character-of-a-male-office-worker-wearing-white-shirt-and-tie_10659321.png!f305cw"
              alt="User Avatar"
              className="w-8 h-8 rounded-full"
            />
          </div>
        </header>
        <main className="flex-1 p-10 overflow-y-auto min-h-0">
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
