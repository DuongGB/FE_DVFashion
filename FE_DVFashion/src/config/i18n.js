import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationEN from "../locales/en/translation.json";
import translationVI from "../locales/vi/translation.json";

const resources = {
  EN: {
    translation: translationEN,
  },
  VI: {
    translation: translationVI,
  },
};

const savedLanguage = localStorage.getItem("i18nextLng") || "VI";

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage, // Ngôn ngữ mặc định
  fallbackLng: "VI", // Ngôn ngữ dự phòng
  interpolation: {
    escapeValue: false, // React đã bảo vệ khỏi XSS
  },
});

export default i18n;
