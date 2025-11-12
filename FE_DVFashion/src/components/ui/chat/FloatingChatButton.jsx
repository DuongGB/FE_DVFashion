import React, { useState, Suspense, lazy } from "react";
import { IconMessage2 } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

const ChatBox = lazy(() => import("../../../pages/customer/chat/ChatBox"));

const FloatingChatButton = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <>
      {/* Chat Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-5 right-5 w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 z-50 group"
          aria-label={t("customer_support.chat_support")}
        >
          <IconMessage2 size={26} className="text-white" />
          {/* Pulse animation */}
          <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping"></span>

          {/* Tooltip */}
          <span className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {t("customer_support.chat_with_us")}
          </span>
        </button>
      )}

      {/* ChatBox with Suspense */}
      {isChatOpen && (
        <Suspense
          fallback={
            <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-2xl p-4">
              <i className="fas fa-spinner fa-spin text-blue-600"></i>
            </div>
          }
        >
          <ChatBox isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </Suspense>
      )}
    </>
  );
};

export default FloatingChatButton;
