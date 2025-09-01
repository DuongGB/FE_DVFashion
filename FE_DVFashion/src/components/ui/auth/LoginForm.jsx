import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { getDefaultRouteByRoles } from "../../../utils/getDefaultRouteByRoles";

export default function LoginForm({ onSuccess }) {
  const { login, isLoginLoading, loginError } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await login(formData);
      console.log("Login result:", result);

      if (result?.data?.success) {
        // Lấy roles từ response
        const roles = result?.data?.data?.roles || [];
        console.log("Roles from login response:", roles);

        // Xác định route mặc định dựa trên roles (ưu tiên ADMIN)
        const defaultRoute = getDefaultRouteByRoles(roles);
        console.log("Default route determined:", defaultRoute);

        // Chuyển hướng đến route tương ứng
        navigate(defaultRoute, { replace: true });

        if (onSuccess) onSuccess();
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-xl p-8 w-[500px] flex flex-col gap-4 relative"
    >
      {/* Logo */}
      <div className="flex items-center gap-2 mb-2 w-20 h-10">
        <img src="./src/assets/logo_DVF.png" />
      </div>
      {/* Title */}
      <h2 className="text-2xl font-bold mb-2 leading-7">
        Rất nhiều đặc quyền và quyền lợi mua sắm đang chờ bạn
      </h2>
      {/* Benefits */}
      <div className="flex gap-4 mb-2">
        <div className="flex flex-col items-center gap-1">
          <span className="text-xl">%</span>
          <span className="text-xs">Voucher ưu đãi</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xl">🎁</span>
          <span className="text-xs">Quà tặng độc quyền</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xl">💸</span>
          <span className="text-xs">Hoàn tiền Coolcash</span>
        </div>
      </div>
      {/* Social login */}
      <div className="flex gap-3 mb-2">
        <button
          type="button"
          className="border rounded-full p-2 flex items-center justify-center w-10 h-10"
        >
          <img
            src="./src/assets/google.avif"
            alt="Google"
            className="w-6 h-6"
          />
        </button>
      </div>
      {/* Divider */}
      <div className="flex items-center gap-2 mb-2">
        <hr className="flex-1 border-gray-300" />
        <span className="text-sm text-gray-500">Hoặc</span>
        <hr className="flex-1 border-gray-300" />
      </div>
      {/* Input Email/Phone */}
      <input
        type="text"
        name="username"
        placeholder="Email/SĐT của bạn"
        value={formData.username}
        onChange={handleChange}
        className="p-3 border rounded-lg mb-2"
        required
      />
      {/* Input Password */}
      <div className="relative mb-2">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Mật khẩu"
          value={formData.password}
          onChange={handleChange}
          className="p-3 border rounded-lg w-full"
          required
        />
        <span
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
          onClick={() => setShowPassword((v) => !v)}
        >
          {showPassword ? "👁️" : "👁️‍🗨️"}
        </span>
      </div>
      {/* Error */}
      {loginError && (
        <div className="text-red-500 text-sm mb-2">{loginError.message}</div>
      )}
      {/* Submit */}
      <button
        type="submit"
        disabled={isLoginLoading}
        className="bg-black text-white py-3 rounded-lg font-bold text-lg"
      >
        {isLoginLoading ? "Đang đăng nhập..." : "ĐĂNG NHẬP"}
      </button>
      {/* Links */}
      <div className="flex justify-between mt-2 text-sm">
        <a href="#" className="text-blue-600 hover:underline font-bold">
          Đăng ký tài khoản mới
        </a>
        <a href="#" className="text-blue-600 hover:underline font-bold">
          Quên mật khẩu
        </a>
      </div>
    </form>
  );
}
