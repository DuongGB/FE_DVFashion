import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getDefaultRouteByRoles } from "../../../utils/getDefaultRouteByRoles";
import { useAuth } from "../../../hooks/useAuth";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // if no roles are specified, allow access
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRole = user?.roles?.some((r) => allowedRoles.includes(r));
    if (!hasRole) {
      // No permission => redirect to user default route
      const defaultRoute = getDefaultRouteByRoles(user?.roles);
      return <Navigate to={defaultRoute} replace />;
    }
  }
  return <Outlet />;
};

export default ProtectedRoute;
