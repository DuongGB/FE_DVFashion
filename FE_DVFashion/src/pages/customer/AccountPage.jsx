import { useState } from "react";
import ModalChangePassword from "../../components/ui/account/ModalChangePassword";
import ModalUpdateAccount from "../../components/ui/account/ModalUpdateAccount";
import { useAuth } from "../../hooks/useAuth";
import {
  IconUser,
  IconUsers,
  IconShoppingCart,
  IconCoin,
  IconTicket,
  IconHome,
  IconStar,
  IconHelp,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next"; // Import translation hook

const SidebarItem = ({ icon, text, active }) => {
  return (
    <div
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

export default function AccountPage() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* Sidebar */}
      <div className="w-[320px] p-6">
        <div className="flex flex-col gap-3">
          <SidebarItem
            active
            icon={<IconUser size={24} />}
            text={t("account.sidebar.account_info")}
          />
          <SidebarItem
            icon={<IconUsers size={24} />}
            text={t("account.sidebar.refer_friends")}
          />
          <SidebarItem
            icon={<IconShoppingCart size={24} />}
            text={t("account.sidebar.order_history")}
          />
          <SidebarItem
            icon={<IconCoin size={24} />}
            text={t("account.sidebar.dvf_cash_history")}
          />
          <SidebarItem
            icon={<IconTicket size={24} />}
            text={t("account.sidebar.voucher_wallet")}
          />
          <SidebarItem
            icon={<IconHome size={24} />}
            text={t("account.sidebar.address_book")}
          />
          <SidebarItem
            icon={<IconStar size={24} />}
            text={t("account.sidebar.reviews_feedback")}
          />
          <SidebarItem
            icon={<IconHelp size={24} />}
            text={t("account.sidebar.policies_faq")}
          />
        </div>
      </div>
      {/* Main content */}
      <div className="flex-1 p-10 bg-white rounded-lg m-6">
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
            onClick={() => setShowUpdateModal(true)}
          >
            {t("account.main.update")}
          </button>
          <ModalUpdateAccount
            show={showUpdateModal}
            onClose={() => setShowUpdateModal(false)}
            user={user}
          />
        </div>
        <h3 className="text-xl font-bold mb-4">
          {t("account.main.login_info")}
        </h3>
        <InfoRow
          label={t("account.main.email")}
          value={user?.email || t("account.main.not_updated")}
        />
        <InfoRow label={t("account.main.password")} value="************" />
        <button
          className="border rounded-full px-6 py-2 font-bold mt-4 cursor-pointer"
          onClick={() => setShowModal(true)}
        >
          {t("account.main.update")}
        </button>
        <ModalChangePassword
          show={showModal}
          onClose={() => setShowModal(false)}
        />
      </div>
    </div>
  );
}
