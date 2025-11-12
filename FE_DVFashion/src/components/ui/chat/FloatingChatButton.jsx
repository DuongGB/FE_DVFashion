import React, { useState, Suspense, lazy } from "react";

const ChatBox = lazy(() => import("../../../pages/customer/chat/ChatBox"));

const FloatingChatButton = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      {/* Chat Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 z-50 group"
          aria-label="Chat support"
        >
          <i className="fas fa-comment-dots text-2xl"></i>
          {/* Pulse animation */}
          <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping"></span>

          {/* Tooltip */}
          <span className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Chat với chúng tôi
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
