import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { getDefaultRouteByRoles } from "../../../utils/getDefaultRouteByRoles";

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Lấy roles từ user
  const userRoles = user?.roles || [];

  // console.log("ProtectedRoute - User roles:", userRoles);
  // console.log("ProtectedRoute - Allowed roles:", allowedRoles);
  // console.log("ProtectedRoute - Current path:", location.pathname);

  // ADMIN có thể truy cập tất cả các routes (bao gồm cả staff routes)
  const hasAdminRole = userRoles.includes("ROLE_ADMIN");

  // Kiểm tra quyền truy cập
  const hasPermission =
    hasAdminRole || userRoles.some((role) => allowedRoles?.includes(role));

  if (!hasPermission) {
    // console.log("No permission, redirecting to default route");
    // Chuyển hướng đến trang mặc định dựa trên roles của user có quyền cao nhất
    const defaultRoute = getDefaultRouteByRoles(userRoles);
    return <Navigate to={defaultRoute} replace />;
  }

  return <Outlet />;
}
