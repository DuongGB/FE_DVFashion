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
import OrdersPage from "./pages/admin/OrderPage";
import ProductPage from "./pages/admin/ProductPage";
import CategoryPage from "./pages/admin/CategoryPage";
import BrandPage from "./pages/admin/BrandPage";
import ReviewPage from "./pages/admin/ReviewPage";
import PromotionPage from "./pages/admin/PromotionPage";
import CustomerManagermentPage from "./pages/admin/CustomerManagermentPage";
import EmployeePage from "./pages/admin/EmployeePage";
import AnalystReportPage from "./pages/admin/AnalystReportPage";
import StaffLayout from "./layouts/StaffLayout";

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin routes */}
        <Route element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]} />}>
          <Route path="/admin/*" element={<AdminLayout />}>
            <Route index element={<AdminPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="products" element={<ProductPage />} />
            <Route path="categories" element={<CategoryPage />} />
            <Route path="brands" element={<BrandPage />} />
            <Route path="reviews" element={<ReviewPage />} />
            <Route path="promotions" element={<PromotionPage />} />
            <Route path="customers" element={<CustomerManagermentPage />} />
            <Route path="employees" element={<EmployeePage />} />
            <Route path="reports" element={<AnalystReportPage />} />
          </Route>
        </Route>

        {/* Staff routes */}
        <Route element={<ProtectedRoute allowedRoles={["ROLE_STAFF"]} />}>
          <Route path="/staff/*" element={<StaffLayout />}>
            <Route index element={<StaffPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="categories" element={<CategoryPage />} />
            <Route path="reviews" element={<ReviewPage />} />
            <Route path="promotions" element={<PromotionPage />} />
            <Route path="customers" element={<CustomerManagermentPage />} />
          </Route>
        </Route>

        {/* Main layout routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/blog" element={<BlogPage />} />

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
