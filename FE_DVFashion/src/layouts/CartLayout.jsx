import { Outlet } from "react-router-dom";
import Header from "../components/common/Header";

export default function CartLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
