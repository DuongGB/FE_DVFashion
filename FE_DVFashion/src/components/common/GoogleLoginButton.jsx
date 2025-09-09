import { API_BASE_URL } from "../../services/api";
("../../services/api");
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

const GoogleLoginButton = () => {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const handleLanguageChange = () => {
      // Force component update
    };

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  const handleGoogleLogin = () => {
    // Redirect to backend OAuth2 endpoint
    window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
  };

  return (
    <div className="w-full flex justify-center">
      <button
        onClick={handleGoogleLogin}
        className="w-full bg-red-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50"
      >
        {t("auth.google_login")}
      </button>
    </div>
  );
};

export default GoogleLoginButton;
