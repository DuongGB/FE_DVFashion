import {
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OAuth2RedirectHandler from "./components/ui/auth/OAuth2RedirectHandler";
import ProtectedRoute from "./components/ui/auth/ProtectedRoute";
import { AuthModalProvider } from "./contexts/AuthModalContext";
import AdminLayout from "./layouts/AdminLayout";
import CartLayout from "./layouts/CartLayout";
import MainLayout from "./layouts/MainLayout";
import AdminPage from "./pages/admin/AdminPage";
import CategoryPage from "./pages/admin/CategoryPage";
import CustomerManagermentPage from "./pages/admin/CustomerManagermentPage";
import CustomerSupportPage from "./pages/admin/CustomerSupportPage";
import EmployeePage from "./pages/admin/EmployeePage";
import InventoryPage from "./pages/admin/InventoryPage";
import OrderCanceledPage from "./pages/admin/order/OrderCanceledPage";
import OrderConfirmedPage from "./pages/admin/order/OrderConfirmedPage";
import OrderDeliveredPage from "./pages/admin/order/OrderDeliveredPage";
import OrderPendingPage from "./pages/admin/order/OrderPendingPage";
import OrderProcessingPage from "./pages/admin/order/OrderProcessingPage";
import OrderReturnedPage from "./pages/admin/order/OrderReturnedPage";
import OrderShippedPage from "./pages/admin/order/OrderShippedPage";
import ProductPage from "./pages/admin/ProductPage";
import PromotionPage from "./pages/admin/PromotionPage";
import ReviewPage from "./pages/admin/ReviewPage";
import StatisticsPage from "./pages/admin/StatisticsPage";
import VoucherPage from "./pages/admin/VoucherPage";
import BlogPage from "./pages/BlogPage";
import CategoryProductPage from "./pages/CategoryProductPage";
import PasswordResetPage from "./pages/customer/account/PasswordResetPage";
import AccountPage from "./pages/customer/AccountPage";
import CartPage from "./pages/customer/CartPage";
import InvoicePreview from "./pages/customer/invoice/InvoicePreview";
import PayPalCancelHandler from "./pages/customer/order/PaypalCancelHandler";
import OrderSuccessPage from "./pages/customer/OrderSuccessPage";
import PayPalSuccessHandler from "./pages/customer/PaypalSuccessHandler";
import PromotionProductsPage from "./pages/customer/promotion/PromotionProductsPage";
import HelpPage from "./pages/HelpPage";
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import SearchProductPage from "./pages/SearchProductPage";
import TodayProductsPage from "./pages/TodayProductsPage";

function AppRoutes() {
  const location = useLocation();
  const background = location.state && location.state.background;

  return (
    <>
      <Routes location={background || location}>
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

        <Route element={<ProtectedRoute allowedRoles={["ROLE_ADMIN"]} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminPage />} />
            <Route path="inventories" element={<InventoryPage />} />
            <Route path="products" element={<ProductPage />} />
            <Route path="categories" element={<CategoryPage />} />
            <Route path="reviews" element={<ReviewPage />} />
            <Route path="promotions" element={<PromotionPage />} />
            <Route path="customers" element={<CustomerManagermentPage />} />
            <Route path="employees" element={<EmployeePage />} />
            <Route path="orders/pending" element={<OrderPendingPage />} />
            <Route path="orders/confirmed" element={<OrderConfirmedPage />} />
            <Route path="orders/processing" element={<OrderProcessingPage />} />
            <Route path="orders/shipped" element={<OrderShippedPage />} />
            <Route path="orders/delivered" element={<OrderDeliveredPage />} />
            <Route path="orders/returned" element={<OrderReturnedPage />} />
            <Route path="orders/canceled" element={<OrderCanceledPage />} />
            <Route path="statistics" element={<StatisticsPage />} />
            <Route path="vouchers" element={<VoucherPage />} />
            <Route path="support" element={<CustomerSupportPage />} />
          </Route>
        </Route>

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
            path="/password-reset/:token"
            element={<PasswordResetPage />}
          />
          <Route path="/help" element={<HelpPage />} />

          <Route
            element={
              <ProtectedRoute
                allowedRoles={["ROLE_CUSTOMER", "ROLE_ADMIN", "ROLE_STAFF"]}
              />
            }
          >
            <Route path="/customer" element={<HomePage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/today-products" element={<TodayProductsPage />} />
          </Route>
        </Route>

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

      {background && (
        <Routes>
          {/* Modal route (khi điều hướng từ trang nền) */}
          <Route
            path="/invoices/:orderNumber/preview"
            element={<InvoicePreview />}
          />
        </Routes>
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthModalProvider>
      <Router>
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={2000} theme="light" />
      </Router>
    </AuthModalProvider>
  );
}
