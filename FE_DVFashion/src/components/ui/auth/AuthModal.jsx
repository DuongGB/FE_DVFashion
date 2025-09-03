import { useState, useEffect } from "react";
import { IconX } from "@tabler/icons-react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import ForgotPasswordForm from "./ForgotPasswordForm";

const AuthModal = ({ isOpen, onClose, initialMode = "login" }) => {
  const [mode, setMode] = useState(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSuccess = () => {
    onClose();
  };

  const handleSwitchToRegister = () => {
    setMode("register");
  };

  const handleSwitchToLogin = () => {
    setMode("login");
  };

  const handleSwitchToForgotPassword = () => {
    setMode("forgot-password");
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-full max-w-lg max-h-[95vh] overflow-y-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-4 z-20 p-2 bg-black rounded-full shadow-lg hover:opacity-70 cursor-pointer transition-colors duration-200"
          aria-label="Đóng modal"
        >
          <IconX size={20} className="text-gray-600" />
        </button>

        {/* Modal Content */}
        <div className="animate-in fade-in-0 zoom-in-95 duration-300">
          {mode === "login" && (
            <LoginForm
              onSuccess={handleSuccess}
              onSwitchToRegister={handleSwitchToRegister}
              onForgotPassword={handleSwitchToForgotPassword}
            />
          )}

          {mode === "register" && (
            <RegisterForm
              onSuccess={handleSuccess}
              onSwitchToLogin={handleSwitchToLogin}
            />
          )}

          {mode === "forgot-password" && (
            <ForgotPasswordForm
              onSuccess={handleSuccess}
              onSwitchToLogin={handleSwitchToLogin}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
