import { useState } from "react";
import { IconUser, IconCalendar, IconPhone } from "@tabler/icons-react";

export default function ModalUpdateAccount({ show, onClose, user }) {
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [dob, setDob] = useState({
    day: "",
    month: "",
    year: "",
  });
  const [gender, setGender] = useState(user?.gender || "Không tiết lộ");
  const [phone, setPhone] = useState(user?.phone || "");

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-lg p-8 min-w-[600px] max-w-[650px] relative"
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
        {/* Họ và tên */}
        <div className="mb-6 relative">
          <input
            type="text"
            className="w-full rounded-full border px-12 py-4 bg-gray-100 text-md font-medium outline-none"
            placeholder="Họ và tên"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <IconUser size={22} />
          </span>
        </div>
        {/* Ngày sinh */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <select
              className="w-full rounded-full border px-12 py-4 bg-gray-100 text-md font-medium outline-none"
              value={dob.day}
              onChange={(e) => setDob({ ...dob, day: e.target.value })}
            >
              <option value="">Ngày</option>
              {[...Array(31)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <IconCalendar size={22} />
            </span>
          </div>
          <div className="relative flex-1">
            <select
              className="w-full rounded-full border px-12 py-4 bg-gray-100 text-md font-medium outline-none"
              value={dob.month}
              onChange={(e) => setDob({ ...dob, month: e.target.value })}
            >
              <option value="">Tháng</option>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <IconCalendar size={22} />
            </span>
          </div>
          <div className="relative flex-1">
            <select
              className="w-full rounded-full border px-12 py-4 bg-gray-100 text-md font-medium outline-none"
              value={dob.year}
              onChange={(e) => setDob({ ...dob, year: e.target.value })}
            >
              <option value="">Năm</option>
              {Array.from({ length: 70 }, (_, i) => 2025 - i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <IconCalendar size={22} />
            </span>
          </div>
        </div>
        {/* Giới tính */}
        <div className="mb-6 flex gap-8 items-center">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="Nam"
              checked={gender === "Nam"}
              onChange={() => setGender("Nam")}
            />
            Nam
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="Nữ"
              checked={gender === "Nữ"}
              onChange={() => setGender("Nữ")}
            />
            Nữ
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="Không tiết lộ"
              checked={gender === "Không tiết lộ"}
              onChange={() => setGender("Không tiết lộ")}
            />
            Không tiết lộ
          </label>
        </div>
        {/* Số điện thoại */}
        <div className="mb-6 relative">
          <input
            type="text"
            className="w-full rounded-full border px-12 py-4 bg-gray-100 text-md font-medium outline-none"
            placeholder="Số điện thoại"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <IconPhone size={22} />
          </span>
        </div>
        {/* Button */}
        <button className="w-full bg-black text-white rounded-full py-4 text-lg font-bold mt-4 flex items-center justify-center gap-2">
          CẬP NHẬT THÔNG TIN <span className="text-xl">→</span>
        </button>
      </div>
    </div>
  );
}
