import { useState } from "react";
import ModalChangePassword from "../../components/ui/account/ModalChangePassword";
import ModalUpdateAccount from "../../components/ui/account/ModalUpdateAccount";
import { useAuth } from "../../hooks/useAuth";
import {
  IconUser,
  IconShoppingCart,
  IconTicket,
  IconHome,
  IconStar,
  IconHelp,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import OrderHistory from "../../components/ui/account/OrderHistory";
import ModalReview from "../../components/ui/review/ModalReview";
import MyReviews from "../../components/ui/account/MyReviews";
import MyAddresses from "../../components/ui/account/MyAddresses";
import MyVoucher from "../../components/ui/account/MyVoucher";

const SidebarItem = ({ icon, text, active, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg cursor-pointer transition-all ${
        active
          ? "bg-black text-white font-bold"
          : "bg-white text-black hover:bg-gray-100"
      }`}
    >
      <span className="flex items-center gap-2 text-sm sm:text-base">
        {icon}
        <span className="truncate">{text}</span>
      </span>
      <span className="text-lg sm:text-xl hidden sm:inline">→</span>
    </div>
  );
};

const InfoRow = ({ label, value }) => {
  return (
    <div className="flex flex-col sm:flex-row mb-3 sm:mb-2">
      <div className="w-full sm:w-40 text-gray-600 text-sm sm:text-base mb-1 sm:mb-0">
        {label}
      </div>
      <div className="font-semibold text-sm sm:text-base">{value}</div>
    </div>
  );
};

const AccountInfo = ({ user, onUpdateClick, onPasswordChangeClick }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-blue-100/60 via-white/60 to-blue-200/60 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-2xl backdrop-blur-lg">
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 drop-shadow">
        {t("account.main.account_info")}
      </h2>

      <div className="mb-4 sm:mb-6 bg-white/30 p-4 sm:p-6 rounded-xl backdrop-blur-sm border border-white/20">
        <InfoRow
          label={t("account.main.full_name")}
          value={user?.fullName || t("account.main.not_updated")}
        />
        <InfoRow
          label={t("account.main.phone")}
          value={user?.phone || t("account.main.not_updated")}
        />
        <InfoRow
          label={t("account.main.gender")}
          value={user?.gender || t("account.main.not_updated")}
        />
        <InfoRow
          label={t("account.main.dob")}
          value={user?.dob || t("account.main.dob_placeholder")}
        />
        <div className="mt-4">
          <button
            className="border rounded-full px-4 sm:px-6 py-2 font-bold cursor-pointer bg-white/40 hover:bg-white/60 transition text-sm sm:text-base w-full sm:w-auto"
            onClick={onUpdateClick}
          >
            {t("account.main.update")}
          </button>
        </div>
      </div>

      <div className="bg-white/30 p-4 sm:p-6 rounded-xl backdrop-blur-sm border border-white/20">
        <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">
          {t("account.main.login_info")}
        </h3>
        <InfoRow
          label={t("account.main.email")}
          value={user?.email || t("account.main.not_updated")}
        />
        <InfoRow label={t("account.main.password")} value="************" />
        <div className="mt-4">
          <button
            className="border rounded-full px-4 sm:px-6 py-2 font-bold cursor-pointer bg-white/40 hover:bg-white/60 transition text-sm sm:text-base w-full sm:w-auto"
            onClick={onPasswordChangeClick}
          >
            {t("account.main.update")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AccountPage() {
  const { user } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [activeTab, setActiveTab] = useState("account_info");
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);
  const { t } = useTranslation();

  const handleReviewClick = (orderOrReview) => {
    if (orderOrReview.orderNumber) {
      setSelectedOrder(orderOrReview);
      setSelectedReview(null);
    } else {
      setSelectedOrder(null);
      setSelectedReview(orderOrReview);
    }
    setShowReviewModal(true);
  };

  const handleReviewSuccess = () => {
    setReviewRefreshKey((prev) => prev + 1);
  };

  const sidebarItems = [
    {
      id: "account_info",
      icon: <IconUser size={20} className="sm:w-6 sm:h-6" />,
      text: t("account.sidebar.account_info"),
    },
    {
      id: "order_history",
      icon: <IconShoppingCart size={20} className="sm:w-6 sm:h-6" />,
      text: t("account.sidebar.order_history"),
    },
    {
      id: "voucher_wallet",
      icon: <IconTicket size={20} className="sm:w-6 sm:h-6" />,
      text: t("account.sidebar.voucher_wallet"),
    },
    {
      id: "address_book",
      icon: <IconHome size={20} className="sm:w-6 sm:h-6" />,
      text: t("account.sidebar.address_book"),
    },
    {
      id: "reviews_feedback",
      icon: <IconStar size={20} className="sm:w-6 sm:h-6" />,
      text: t("account.sidebar.reviews_feedback"),
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "account_info":
        return (
          <AccountInfo
            user={user}
            onUpdateClick={() => setShowUpdateModal(true)}
            onPasswordChangeClick={() => setShowPasswordModal(true)}
          />
        );
      case "order_history":
        return (
          <OrderHistory
            onReviewClick={handleReviewClick}
            refreshKey={reviewRefreshKey}
          />
        );
      case "voucher_wallet":
        return <MyVoucher />;
      case "reviews_feedback":
        return (
          <MyReviews
            onUpdateClick={handleReviewClick}
            refreshKey={reviewRefreshKey}
          />
        );
      case "address_book":
        return <MyAddresses />;
      default:
        return (
          <AccountInfo
            user={user}
            onUpdateClick={() => setShowUpdateModal(true)}
            onPasswordChangeClick={() => setShowPasswordModal(true)}
          />
        );
    }
  };

  return (
    <div className="bg-gray-200 min-h-screen">
      <div className="max-w-7xl mx-auto p-3 sm:p-6">
        {/* Mobile Tabs - Horizontal Scrollable */}
        <div className="lg:hidden mb-4 bg-white rounded-lg p-2 shadow-md overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  activeTab === item.id
                    ? "bg-black text-white font-bold"
                    : "bg-gray-100 text-black hover:bg-gray-200"
                }`}
              >
                <span className="mb-1">{item.icon}</span>
                <span className="text-xs">{item.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Sidebar - Desktop Only */}
          <div className="hidden lg:block w-[320px] flex-shrink-0">
            <div className="flex flex-col gap-3 bg-white p-4 rounded-lg sticky top-6">
              {sidebarItems.map((item) => (
                <SidebarItem
                  key={item.id}
                  active={activeTab === item.id}
                  icon={item.icon}
                  text={item.text}
                  onClick={() => setActiveTab(item.id)}
                />
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 bg-white rounded-lg p-4 sm:p-6 lg:p-10 shadow-md">
            {renderContent()}
          </div>
        </div>
      </div>

      <ModalUpdateAccount
        show={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        user={user}
      />
      <ModalChangePassword
        show={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
      <ModalReview
        show={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        order={selectedOrder}
        review={selectedReview}
        onSuccess={handleReviewSuccess}
      />
    </div>
  );
}
