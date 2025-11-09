import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OAuth2RedirectHandler from "./components/ui/auth/OAuth2RedirectHandler";
import ProtectedRoute from "./components/ui/auth/ProtectedRoute";
import { AuthModalProvider } from "./contexts/AuthModalContext";
import AdminLayout from "./layouts/AdminLayout";
import CartLayout from "./layouts/CartLayout";
import MainLayout from "./layouts/MainLayout";
import StaffLayout from "./layouts/StaffLayout";
import AdminPage from "./pages/admin/AdminPage";
import BrandPage from "./pages/admin/BrandPage";
import CategoryPage from "./pages/admin/CategoryPage";
import CustomerManagermentPage from "./pages/admin/CustomerManagermentPage";
import EmployeePage from "./pages/admin/EmployeePage";
import InventoryPage from "./pages/admin/InventoryPage";
import OrderPage from "./pages/admin/OrderPage";
import ProductPage from "./pages/admin/ProductPage";
import PromotionPage from "./pages/admin/PromotionPage";
import ReviewPage from "./pages/admin/ReviewPage";
import BlogPage from "./pages/BlogPage";
import AccountPage from "./pages/customer/AccountPage";
import CartPage from "./pages/customer/CartPage";
import CustomerPage from "./pages/customer/CustomerPage";
import OrderSuccessPage from "./pages/customer/OrderSuccessPage";
import PayPalSuccessHandler from "./pages/customer/PayPalSuccessHandler";
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import SearchProductPage from "./pages/SearchProductPage";
import StaffPage from "./pages/staff/StaffPage";
import CategoryProductPage from "./pages/CategoryProductPage";
import VoucherPage from "./pages/admin/VoucherPage";
import PayPalCancelHandler from "./pages/customer/order/PaypalCancelHandler";
import StatisticsPage from "./pages/admin/StatisticsPage";
import PromotionProductsPage from "./pages/customer/promotion/PromotionProductsPage";

function App() {
  return (
    <AuthModalProvider>
      <Router>
        <Routes>
          {/* OAuth2 redirect handler */}
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

          {/* Admin routes - chỉ cho phép ROLE_ADMIN */}
          <Route element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminPage />} />
              <Route path="inventories" element={<InventoryPage />} />
              <Route path="products" element={<ProductPage />} />
              <Route path="categories" element={<CategoryPage />} />
              <Route path="brands" element={<BrandPage />} />
              <Route path="reviews" element={<ReviewPage />} />
              <Route path="promotions" element={<PromotionPage />} />
              <Route path="customers" element={<CustomerManagermentPage />} />
              <Route path="employees" element={<EmployeePage />} />
              <Route path="orders" element={<OrderPage />} />
              <Route path="statistics" element={<StatisticsPage />} />
              <Route path="vouchers" element={<VoucherPage />} />
            </Route>
          </Route>

          {/* Staff routes - cho phép cả ROLE_STAFF và ROLE_ADMIN */}
          {/* <Route
            element={
              <ProtectedRoute allowedRoles={["ROLE_STAFF", "ROLE_ADMIN"]} />
            }
          >
            <Route path="/staff" element={<StaffLayout />}>
              <Route index element={<StaffPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="categories" element={<CategoryPage />} />
              <Route path="reviews" element={<ReviewPage />} />
              <Route path="promotions" element={<PromotionPage />} />
              <Route path="customers" element={<CustomerManagermentPage />} />
              <Route path="products" element={<ProductPage />} />
              <Route path="inventories" element={<InventoryPage />} />
            </Route>
          </Route> */}

          {/* Main layout routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/search" element={<SearchProductPage />} />
            <Route path="/products" element={<CategoryProductPage />} />
            <Route
              path="/promotions/:promotionId"
              element={<PromotionProductsPage />}
            />

            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["ROLE_CUSTOMER", "ROLE_ADMIN", "ROLE_STAFF"]}
                />
              }
            >
              <Route path="/customer" element={<CustomerPage />} />
              <Route path="/account" element={<AccountPage />} />
            </Route>
          </Route>

          {/* Cart layout */}
          <Route element={<CartLayout />}>
            <Route path="/cart" element={<CartPage />} />
            <Route
              path="/order-success/:orderNumber"
              element={<OrderSuccessPage />}
            />
            <Route
              path="/payment/paypal/success"
              element={<PayPalSuccessHandler />}
            />
            <Route
              path="/payment/paypal/cancel"
              element={<PayPalCancelHandler />}
            />
          </Route>
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Router>
    </AuthModalProvider>
  );
}

export default App;
