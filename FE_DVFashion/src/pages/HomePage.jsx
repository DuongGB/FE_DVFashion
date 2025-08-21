import { useAuth } from "../hooks/useAuth";
import LoginForm from "../components/ui/auth/LoginForm";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";
import { useNavigate } from "react-router-dom";
import { getDefaultRouteByRoles } from "../utils/getDefaultRouteByRoles";
import { useEffect } from "react";
import { ArrowUp } from "react-feather";

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  console.log("HomePage user:", user);
  console.log("HomePage isAuthenticated:", isAuthenticated);

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user?.roles) {
      const defaultRoute = getDefaultRouteByRoles(user?.roles);
      navigate(defaultRoute);
    }
  }, [isAuthenticated, user, navigate]);

  return (
    // <div className="flex flex-col items-center justify-center h-screen gap-4">
    //   {!isAuthenticated && <LoginForm />}
    // </div>
    <div className="font-sans">
      {/* Banner */}
      <div className="relative bg-orange-600 text-white py-16 px-8 flex items-center justify-between overflow-hidden">
        {/* Left content */}
        <div>
          <div className="bg-orange-300 inline-block px-4 py-2 rounded font-bold mb-4">
            2.9 COLLECTION
          </div>
          <h1 className="text-5xl font-bold mb-4">Tự do vươn mình</h1>
          <p className="text-2xl mb-6">Mua 02 giảm thêm 10%</p>
          <button className="bg-white text-orange-600 px-6 py-2 rounded-full font-bold shadow hover:bg-orange-100 transition">
            MUA NGAY &rarr;
          </button>
        </div>
        {/* Right images */}
        <div className="flex items-end gap-8">
          <img
            src="/assets/runner.png"
            alt="Runner"
            className="h-72 object-contain"
          />
          <img
            src="/assets/tshirt.png"
            alt="Tshirt"
            className="h-80 object-contain"
          />
        </div>
        {/* Decorative background */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-orange-700 opacity-40 pointer-events-none" />
      </div>

      {/* Bottom bar */}
      <div className="bg-orange-700 text-white py-2 text-center font-bold tracking-widest">
        2.8 COLLECTION &nbsp; ★ &nbsp; 2.9 COLLECTION &nbsp; ★ &nbsp; 2.8
        COLLECTION
      </div>
    </div>
  );
}
