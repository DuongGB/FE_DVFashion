import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getDefaultRouteByRoles } from "../utils/getDefaultRouteByRoles";
import Banner from "../components/common/Banner";

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
      <Banner />
    </div>
  );
}
