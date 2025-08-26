import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ui/auth/ProtectedRoute";
import AdminPage from "./pages/AdminPage";
import StaffPage from "./pages/StaffPage";
import CustomerPage from "./pages/CustomerPage";
import MainLayout from "./layouts/MainLayout";
import BlogPage from "./pages/BlogPage";

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/blog" element={<BlogPage />} />

          {/* Routes by role */}
          <Route element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]} />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["ROLE_STAFF"]} />}>
            <Route path="/staff" element={<StaffPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={["ROLE_CUSTOMER"]} />}>
            <Route path="/customer" element={<CustomerPage />} />
          </Route>

          {/* General dashboard page (anyone can log in) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
