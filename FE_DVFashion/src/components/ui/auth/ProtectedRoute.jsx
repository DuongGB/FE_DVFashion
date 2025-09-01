import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { getDefaultRouteByRoles } from "../../../utils/getDefaultRouteByRoles";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Lấy roles từ user
  const userRoles = user?.roles || [];

  console.log("ProtectedRoute - User roles:", userRoles);
  console.log("ProtectedRoute - Allowed roles:", allowedRoles);
  console.log("ProtectedRoute - Current path:", location.pathname);

  // Nếu user có ROLE_ADMIN và đang cố truy cập staff route, redirect về admin
  if (
    userRoles.includes("ROLE_ADMIN") &&
    location.pathname.startsWith("/staff")
  ) {
    console.log("Admin trying to access staff route, redirecting to admin");
    return <Navigate to="/admin" replace />;
  }

  // Kiểm tra quyền truy cập
  const hasPermission = userRoles.some((role) => allowedRoles?.includes(role));

  if (!hasPermission) {
    console.log("No permission, redirecting to default route");
    // Chuyển hướng đến trang mặc định dựa trên roles của user có quyền cao nhất
    const defaultRoute = getDefaultRouteByRoles(userRoles);
    return <Navigate to={defaultRoute} replace />;
  }

  return <Outlet />;
}
