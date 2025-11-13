import React, { useState, Suspense, lazy } from "react";
import { IconRobot } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

const AIChatBox = lazy(() => import("../../../pages/customer/chat/AIChatBox"));

export default function FloatingAIChatButton() {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  if (open) {
    return (
      <Suspense fallback={null}>
        <AIChatBox isOpen={open} onClose={() => setOpen(false)} />
      </Suspense>
    );
  }

  return (
    <button
      onClick={() => setOpen(true)}
      className="fixed bottom-24 right-5 w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 z-50 group"
      aria-label={t("customer_support.ai_assistant")}
    >
      <IconRobot size={26} />
      <span className="absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75 animate-ping"></span>
      <span className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {t("customer_support.ask_ai")}
      </span>
    </button>
  );
}
