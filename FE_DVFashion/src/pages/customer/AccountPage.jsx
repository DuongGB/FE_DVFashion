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

  return (
    <div className="flex bg-gray-100 min-h-screen">
      {/* Sidebar */}
      <div className="w-[320px] p-6">
        <div className="flex flex-col gap-3">
          <SidebarItem
            active
            icon={<IconUser size={24} />}
            text="Thông tin tài khoản"
          />
          <SidebarItem
            icon={<IconUsers size={24} />}
            text="Giới thiệu bạn bè"
          />
          <SidebarItem
            icon={<IconShoppingCart size={24} />}
            text="Lịch sử đơn hàng"
          />
          <SidebarItem icon={<IconCoin size={24} />} text="Lịch sử CoolCash" />
          <SidebarItem icon={<IconTicket size={24} />} text="Ví Voucher" />
          <SidebarItem icon={<IconHome size={24} />} text="Sổ địa chỉ" />
          <SidebarItem
            icon={<IconStar size={24} />}
            text="Đánh giá và phản hồi"
          />
          <SidebarItem
            icon={<IconHelp size={24} />}
            text="Chính sách & Câu hỏi thường gặp"
          />
        </div>
      </div>
      {/* Main content */}
      <div className="flex-1 p-10 bg-white rounded-lg m-6">
        <h2 className="text-3xl font-bold mb-8">Thông tin tài khoản</h2>
        <div className="mb-8">
          <InfoRow
            label="Họ và tên"
            value={user?.fullName || "Chưa cập nhật"}
          />
          <InfoRow
            label="Số điện thoại"
            value={user?.phone || "Chưa cập nhật"}
          />
          <InfoRow label="Giới tính" value={user?.gender || "Chưa cập nhật"} />
          <InfoRow
            label="Ngày sinh"
            value={
              user?.dob ||
              "Hãy cập nhật ngày sinh để coolmate gửi cho bạn 1 phần quà đặc biệt nhé"
            }
          />
          <button
            className="border rounded-full px-6 py-2 font-bold mt-4 cursor-pointer"
            onClick={() => setShowUpdateModal(true)}
          >
            CẬP NHẬT
          </button>
          <ModalUpdateAccount
            show={showUpdateModal}
            onClose={() => setShowUpdateModal(false)}
            user={user}
          />
        </div>
        <h3 className="text-xl font-bold mb-4">Thông tin đăng nhập</h3>
        <InfoRow label="Email" value={user?.email || "Chưa cập nhật"} />
        <InfoRow label="Mật khẩu" value="************" />
        <button
          className="border rounded-full px-6 py-2 font-bold mt-4 cursor-pointer"
          onClick={() => setShowModal(true)}
        >
          CẬP NHẬT
        </button>
        <ModalChangePassword
          show={showModal}
          onClose={() => setShowModal(false)}
        />
      </div>
    </div>
  );
}
