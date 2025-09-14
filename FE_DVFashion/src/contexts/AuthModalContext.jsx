import { createContext, useContext, useState, useCallback } from "react";

const AuthModalContext = createContext();

export function AuthModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("login");
  const [stayOnPage, setStayOnPage] = useState(false);

  const openLogin = useCallback((options = {}) => {
    setMode("login");
    setStayOnPage(!!options.stayOnPage);
    setIsOpen(true);
  }, []);
  const openRegister = useCallback(() => {
    setMode("register");
    setIsOpen(true);
  }, []);
  const openForgotPassword = useCallback(() => {
    setMode("forgot-password");
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <AuthModalContext.Provider
      value={{
        isOpen,
        mode,
        stayOnPage,
        openLogin,
        openRegister,
        openForgotPassword,
        close,
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  return useContext(AuthModalContext);
}
