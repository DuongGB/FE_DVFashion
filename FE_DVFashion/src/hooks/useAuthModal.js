import { useState } from "react";

export const useAuthModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("login");

  const openLogin = () => {
    setMode("login");
    setIsOpen(true);
  };

  const openRegister = () => {
    setMode("register");
    setIsOpen(true);
  };

  const openForgotPassword = () => {
    setMode("forgot-password");
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    mode,
    openLogin,
    openRegister,
    openForgotPassword,
    close,
  };
};
