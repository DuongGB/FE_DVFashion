import { useState, useRef } from "react";
import ModalChangePassword from "../../components/ui/account/ModalChangePassword";
import ModalUpdateAccount from "../../components/ui/account/ModalUpdateAccount";
import { useAuth } from "../../hooks/useAuth";
import {
  IconUser,
  IconShoppingCart,
  IconCoin,
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

const SidebarItem = ({ icon, text, active, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer ${
        active ? "bg-black text-white font-bold" : "bg-white text-black"
      }`}
    >
      <span className="flex items-center gap-2">
        {icon}
        {text}
      </span>
      <span className="text-xl">→</span>
    </div>
  );
};

const InfoRow = ({ label, value }) => {
  return (
    <div className="flex mb-2">
      <div className="w-40 text-gray-600">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
};

const AccountInfo = ({ user, onUpdateClick, onPasswordChangeClick }) => {
  const { t } = useTranslation();
  return (
    <>
      <h2 className="text-3xl font-bold mb-8">
        {t("account.main.account_info")}
      </h2>
      <div className="mb-8">
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
        <button
          className="border rounded-full px-6 py-2 font-bold mt-4 cursor-pointer"
          onClick={onUpdateClick}
        >
          {t("account.main.update")}
        </button>
      </div>
      <h3 className="text-xl font-bold mb-4">{t("account.main.login_info")}</h3>
      <InfoRow
        label={t("account.main.email")}
        value={user?.email || t("account.main.not_updated")}
      />
      <InfoRow label={t("account.main.password")} value="************" />
      <button
        className="border rounded-full px-6 py-2 font-bold mt-4 cursor-pointer"
        onClick={onPasswordChangeClick}
      >
        {t("account.main.update")}
      </button>
    </>
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
    // Nếu là order thì mở modal đánh giá mới, nếu là review thì mở modal sửa
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
      icon: <IconUser size={24} />,
      text: t("account.sidebar.account_info"),
    },
    {
      id: "order_history",
      icon: <IconShoppingCart size={24} />,
      text: t("account.sidebar.order_history"),
    },
    {
      id: "voucher_wallet",
      icon: <IconTicket size={24} />,
      text: t("account.sidebar.voucher_wallet"),
    },
    {
      id: "address_book",
      icon: <IconHome size={24} />,
      text: t("account.sidebar.address_book"),
    },
    {
      id: "reviews_feedback",
      icon: <IconStar size={24} />,
      text: t("account.sidebar.reviews_feedback"),
    },
    {
      id: "policies_faq",
      icon: <IconHelp size={24} />,
      text: t("account.sidebar.policies_faq"),
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
    <div className="flex bg-gray-200 min-h-screen p-6 gap-6">
      {/* Sidebar */}
      <div className="w-[320px] flex-shrink-0">
        <div className="flex flex-col gap-3 bg-white p-4 rounded-lg h-full">
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
      <div className="flex-1 p-10 bg-white rounded-lg">
        {renderContent()}
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
    </div>
  );
}
