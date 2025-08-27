import { Outlet } from "react-router-dom";
import Sidebar from "../components/common/Sidebar";

export default function AdminLayout() {
  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 p-10 overflow-y-auto min-h-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
