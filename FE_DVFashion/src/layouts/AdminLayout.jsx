import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { IconSettings, IconBell } from "@tabler/icons-react";
import Sidebar from "../components/common/Sidebar";
import SettingAdminModal from "../components/ui/settingForAdmin/SettingAdminModal";

export default function AdminLayout() {
  const [isSettingModalOpen, setIsSettingModalOpen] = useState(false);
  return (
    <div className="h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-md flex items-center justify-between px-6 py-4">
          <div className="text-lg font-semibold">Trang quản trị</div>
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
        <main className="flex-1 p-10 overflow-y-auto">
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
