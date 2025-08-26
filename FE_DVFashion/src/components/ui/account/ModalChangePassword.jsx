import { useState } from "react";
import { IconLock, IconEye, IconEyeOff } from "@tabler/icons-react";

export default function ModalChangePassword({ show, onClose }) {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-lg p-8 min-w-[480px] max-w-[500px] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 bg-black text-white rounded-full w-8 h-8 flex items-center justify-center text-xl"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-8 text-center">
          Chỉnh sửa thông tin tài khoản
        </h2>
        <div className="flex flex-col gap-5 mb-6">
          {/* Old password */}
          <div className="relative">
            <input
              type={showOld ? "text" : "password"}
              className="w-full rounded-full border px-12 py-4 bg-gray-100 text-md font-medium outline-none"
              placeholder="Mật khẩu cũ"
              value={form.oldPassword}
              onChange={(e) =>
                setForm({ ...form, oldPassword: e.target.value })
              }
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <IconLock size={22} />
            </span>
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              onClick={() => setShowOld((v) => !v)}
              tabIndex={-1}
            >
              {showOld ? <IconEyeOff size={22} /> : <IconEye size={22} />}
            </button>
          </div>
          {/* New password */}
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              className="w-full rounded-full border px-12 py-4 bg-gray-100 text-md font-medium outline-none"
              placeholder="Mật khẩu mới"
              value={form.newPassword}
              onChange={(e) =>
                setForm({ ...form, newPassword: e.target.value })
              }
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <IconLock size={22} />
            </span>
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              onClick={() => setShowNew((v) => !v)}
              tabIndex={-1}
            >
              {showNew ? <IconEyeOff size={22} /> : <IconEye size={22} />}
            </button>
          </div>
          {/* Confirm password */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              className="w-full rounded-full border px-12 py-4 bg-gray-100 text-md font-medium outline-none"
              placeholder="Nhập lại mật khẩu"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <IconLock size={22} />
            </span>
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              onClick={() => setShowConfirm((v) => !v)}
              tabIndex={-1}
            >
              {showConfirm ? <IconEyeOff size={22} /> : <IconEye size={22} />}
            </button>
          </div>
        </div>
        <button className="w-full bg-black text-white rounded-full py-4 text-lg font-bold">
          CẬP NHẬT MẬT KHẨU
        </button>
      </div>
    </div>
  );
}
