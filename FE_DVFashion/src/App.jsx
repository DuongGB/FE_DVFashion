import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ui/auth/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import AdminPage from "./pages/admin/AdminPage";
import BlogPage from "./pages/BlogPage";
import HomePage from "./pages/HomePage";
import StaffPage from "./pages/staff/StaffPage";
import AccountPage from "./pages/customer/AccountPage";
import CustomerPage from "./pages/customer/CustomerPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin routes */}
        <Route element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]} />}>
          <Route path="/admin/*" element={<AdminLayout />}>
            <Route index element={<AdminPage />} />
          </Route>
        </Route>

        {/* Main layout routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/blog" element={<BlogPage />} />

          <Route element={<ProtectedRoute allowedRoles={["ROLE_STAFF"]} />}>
            <Route path="/staff" element={<StaffPage />} />
          </Route>

          <Route
            element={
              <ProtectedRoute allowedRoles={["ROLE_CUSTOMER", "ROLE_ADMIN"]} />
            }
          >
            <Route path="/customer" element={<CustomerPage />} />
            <Route path="/account" element={<AccountPage />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
