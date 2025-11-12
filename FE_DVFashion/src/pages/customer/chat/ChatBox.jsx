import React, { useState, useEffect, useRef } from "react";
import { useChat } from "../../../hooks/useChat";
import ChatMessage from "../../../components/ui/chat/ChatMessage";
import ChatInput from "../../../components/ui/chat/ChatInput";
import { useAuth } from "../../../hooks/useAuth";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { isAdminMessage } from "../../../utils/isAdminMessage";
import {
  IconMessage2,
  IconUserCircle,
  IconUserQuestion,
  IconX,
} from "@tabler/icons-react";

const ChatBox = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const [roomCode, setRoomCode] = useState(null);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestInfo, setGuestInfo] = useState({ name: "", phone: "" });
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [isRoomReady, setIsRoomReady] = useState(false);
  const CHAT_ROOM_KEY = "chatRoomCode";
  const CHAT_GUEST_KEY = "chatGuestInfo";
  const prevUserRef = useRef(user);
  const creatingRoomRef = useRef(false);
  const [pendingMessage, setPendingMessage] = useState(null);

  const {
    createGuestChatRoom,
    createCustomerChatRoom,
    useChatRoom,
    useChatMessages,
    sendMessage,
    sendMessageWithAttachment,
    markMessagesAsRead,
    connectWebSocket,
    disconnectWebSocket,
    sendTypingIndicator,
    isWebSocketConnected,
  } = useChat();

  // Load dữ liệu khi mở chat box hoặc khi user thay đổi
  useEffect(() => {
    if (!isOpen || authLoading) return;

    if (
      user &&
      Array.isArray(user.roles) &&
      user.roles.includes("ROLE_CUSTOMER") &&
      !user.roles.includes("ROLE_ADMIN")
    ) {
      setShowGuestForm(false);
      setGuestInfo({ name: "", phone: "" });

      // Lấy roomCode từ user hoặc localStorage, không tự tạo mới ở đây nữa
      const userRoomCode = user.roomCode || localStorage.getItem(CHAT_ROOM_KEY);
      if (userRoomCode) {
        setRoomCode(userRoomCode);
        setIsRoomReady(true);
      }
      // Không gọi createCustomerChatRoom ở đây nữa!
    } else if (!user) {
      // Guest logic giữ nguyên
      const savedRoomCode = localStorage.getItem(CHAT_ROOM_KEY);
      const savedGuestInfo = localStorage.getItem(CHAT_GUEST_KEY);
      if (savedRoomCode) {
        setRoomCode(savedRoomCode);
        setIsRoomReady(true);
        if (savedGuestInfo) {
          try {
            setGuestInfo(JSON.parse(savedGuestInfo));
          } catch {}
        }
        setShowGuestForm(false);
      } else {
        setShowGuestForm(true);
      }
    }
  }, [isOpen, user, authLoading]);

  // Clear chat storage bất cứ khi user thay đổi (login/logout)
  useEffect(() => {
    if (prevUserRef.current !== user) {
      // Khi user thay đổi (login/logout), reset toàn bộ state chatbox
      setRoomCode(null);
      setIsRoomReady(false);
      setShowGuestForm(!user);
      setGuestInfo({ name: "", phone: "" });
      setIsMinimized(false);
      setPendingMessage(null);
      localStorage.removeItem(CHAT_ROOM_KEY);
      localStorage.removeItem(CHAT_GUEST_KEY);
    }
    prevUserRef.current = user;
  }, [user]);

  // Khi user đăng nhập, clear guest info
  useEffect(() => {
    if (user) {
      localStorage.removeItem(CHAT_GUEST_KEY);
      setGuestInfo({ name: "", phone: "" });
      setShowGuestForm(false);
    }
  }, [user]);

  // Load room từ localStorage khi mở chat box
  useEffect(() => {
    if (isOpen) {
      const savedRoomCode = localStorage.getItem(CHAT_ROOM_KEY);
      const savedGuestInfo = localStorage.getItem(CHAT_GUEST_KEY);
      if (savedRoomCode) {
        setRoomCode(savedRoomCode);
        setIsRoomReady(true);
        if (savedGuestInfo && !user) {
          try {
            setGuestInfo(JSON.parse(savedGuestInfo));
          } catch {}
        }
      } else if (!user) {
        setShowGuestForm(true);
      }
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (!isOpen) {
      setRoomCode(null);
      setIsRoomReady(false);
      setShowGuestForm(false);
      setGuestInfo({ name: "", phone: "" });
      setIsMinimized(false);
      setPendingMessage(null);
    }
  }, [isOpen]);

  // Auto-create room cho user đã đăng nhập nếu chưa có room
  useEffect(() => {
    if (!isOpen || authLoading) return;

    if (
      user &&
      Array.isArray(user.roles) &&
      user.roles.includes("ROLE_CUSTOMER") &&
      !user.roles.includes("ROLE_ADMIN")
    ) {
      setShowGuestForm(false);
      setGuestInfo({ name: "", phone: "" });

      if (
        !roomCode &&
        !createCustomerChatRoom.isPending &&
        !creatingRoomRef.current
      ) {
        creatingRoomRef.current = true;
        createCustomerChatRoom.mutate(undefined, {
          onSuccess: (data) => {
            const newRoomCode = data.data.roomCode;
            setRoomCode(newRoomCode);
            localStorage.setItem(CHAT_ROOM_KEY, newRoomCode);
            setIsRoomReady(true);
          },
          onError: () => {
            setIsRoomReady(false);
          },
          onSettled: () => {
            creatingRoomRef.current = false;
          },
        });
      }
    } else if (!user) {
      // Guest logic giữ nguyên
      const savedRoomCode = localStorage.getItem(CHAT_ROOM_KEY);
      const savedGuestInfo = localStorage.getItem(CHAT_GUEST_KEY);
      if (savedRoomCode) {
        setRoomCode(savedRoomCode);
        setIsRoomReady(true);
        if (savedGuestInfo) {
          try {
            setGuestInfo(JSON.parse(savedGuestInfo));
          } catch {}
        }
        setShowGuestForm(false);
      } else {
        setShowGuestForm(true);
      }
    }
  }, [isOpen, user, authLoading, roomCode, createCustomerChatRoom.isPending]);

  // Connect WebSocket when room code is available
  useEffect(() => {
    if (roomCode && isOpen && isRoomReady) {
      // ✅ Delay để đảm bảo backend đã tạo room xong
      const timer = setTimeout(() => {
        console.log("🔌 Connecting WebSocket for room:", roomCode);

        connectWebSocket(roomCode, (message) => {
          console.log("New message received:", message);
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        });
      }, 1000); //Delay 1 giây để chắc chắn room đã được tạo

      return () => {
        clearTimeout(timer);
        disconnectWebSocket(roomCode);
        setIsRoomReady(false);
      };
    }
  }, [roomCode, isOpen, isRoomReady]);

  const { data: chatRoom } = useChatRoom(roomCode);
  const { data: messagesData } = useChatMessages(roomCode);

  const messages = messagesData?.data || [];

  // Đảo ngược thứ tự messages để hiển thị mới nhất ở dưới
  const sortedMessages = React.useMemo(() => {
    return [...messages].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  }, [messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (isOpen && !isMinimized) {
      // Dùng setTimeout để đảm bảo DOM đã render
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [sortedMessages, isOpen, isMinimized]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (roomCode && messages.length > 0 && isOpen && !isMinimized) {
      markMessagesAsRead.mutate(roomCode);
    }
  }, [roomCode, messages.length, isOpen, isMinimized]);

  const handleGuestSubmit = (e) => {
    e.preventDefault();

    if (!guestInfo.name.trim()) {
      toast.error(t("customer_support.name_required"));
      return;
    }

    createGuestChatRoom.mutate(
      {
        name: guestInfo.name.trim(),
        phone: guestInfo.phone.trim(),
      },
      {
        onSuccess: (data) => {
          const newRoomCode = data.data.roomCode;
          const newGuestInfo = {
            name: guestInfo.name.trim(),
            phone: guestInfo.phone.trim(),
          };
          setRoomCode(newRoomCode);
          setGuestInfo(newGuestInfo);
          localStorage.setItem(CHAT_ROOM_KEY, newRoomCode);
          localStorage.setItem(CHAT_GUEST_KEY, JSON.stringify(newGuestInfo));
          setShowGuestForm(false);
          setIsRoomReady(true);
        },
        onError: (error) => {
          console.error("Error creating guest chat room:", error);
          toast.error(
            error.response?.data?.error?.message ||
              t("customer_support.error_creating_room")
          );
        },
      }
    );
  };

  const handleSendMessage = (content) => {
    if (roomCode) {
      sendMessage.mutate({ roomCode, content });
      sendTypingIndicator(
        roomCode,
        false,
        user?.fullName || guestInfo.name || "Guest"
      );
    }
  };

  const handleSendFile = async (file, content) => {
    if (roomCode) {
      // Tạo tin nhắn tạm thời
      const tempId = "pending-" + Date.now();
      setPendingMessage({
        id: tempId,
        messageType: file.type.startsWith("image/") ? "IMAGE" : "VIDEO",
        content,
        attachments: [
          {
            id: tempId,
            fileUrl: URL.createObjectURL(file),
            fileName: file.name,
            isLoading: true,
          },
        ],
        senderName: user?.fullName || guestInfo.name || "Guest",
        createdAt: new Date().toISOString(),
        status: "SENDING",
      });

      try {
        await sendMessageWithAttachment.mutateAsync({
          roomCode,
          file,
          content,
        });
      } finally {
        setPendingMessage(null);
      }
    }
  };

  const handleTyping = () => {
    if (roomCode) {
      sendTypingIndicator(
        roomCode,
        true,
        user?.fullName || guestInfo.name || "Guest"
      );

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        sendTypingIndicator(
          roomCode,
          false,
          user?.fullName || guestInfo.name || "Guest"
        );
      }, 2000);
    }
  };

  const handleClose = () => {
    setIsMinimized(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col">
      {/* Chatbox container */}
      <div
        className={`bg-white rounded-lg shadow-2xl transition-all duration-300 ${
          isMinimized ? "h-14" : "h-[500px]"
        } w-90 flex flex-col overflow-hidden`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              {/* Avatar icon phù hợp */}
              {user ? (
                <IconUserCircle size={28} className="text-blue-600" />
              ) : (
                <IconUserQuestion size={28} className="text-blue-600" />
              )}
            </div>
            <div>
              <h3 className="font-semibold">
                {t("customer_support.customer_support")}
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isWebSocketConnected
                      ? "bg-green-400 animate-pulse"
                      : "bg-gray-400"
                  }`}
                ></span>
                <span>
                  {isWebSocketConnected
                    ? t("customer_support.online")
                    : t("customer_support.offline")}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="hover:bg-blue-800 rounded p-1 transition"
              aria-label={
                isMinimized ? t("common.maximize") : t("common.minimize")
              }
            >
              <i
                className={`fas ${
                  isMinimized ? "fa-window-maximize" : "fa-window-minimize"
                }`}
              ></i>
            </button>
            <button
              onClick={handleClose}
              className="hover:bg-blue-800 rounded p-1 transition cursor-pointer"
              aria-label={t("common.close")}
            >
              <IconX size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <>
            {/* Guest Form */}
            {showGuestForm ? (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <IconMessage2 size={32} className="text-blue-600" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-800">
                      {t("customer_support.start_chat")}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {t("customer_support.provide_info")}
                    </p>
                  </div>
                  <form onSubmit={handleGuestSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("customer_support.your_name")} *
                      </label>
                      <input
                        type="text"
                        required
                        value={guestInfo.name}
                        onChange={(e) =>
                          setGuestInfo({ ...guestInfo, name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder={t("customer_support.enter_name")}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t("customer_support.phone_number")}
                      </label>
                      <input
                        type="tel"
                        value={guestInfo.phone}
                        onChange={(e) =>
                          setGuestInfo({ ...guestInfo, phone: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder={t("customer_support.enter_phone")}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={
                        createGuestChatRoom.isPending || !guestInfo.name.trim()
                      }
                      className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                    >
                      {createGuestChatRoom.isPending ? (
                        <>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          {t("common.loading")}...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane mr-2"></i>
                          {t("customer_support.start_chat")}
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            ) : !roomCode || !chatRoom ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <i className="fas fa-spinner fa-spin text-3xl text-blue-600 mb-2"></i>
                  <p className="text-gray-600 text-sm">
                    {t("customer_support.loading_chat")}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col">
                  {sortedMessages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                      <IconMessage2
                        size={32}
                        className="mb-2 text-blue-300 mx-auto"
                      />
                      <p className="text-sm">
                        {t("customer_support.no_messages")}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {t("customer_support.send_first_message")}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Render messages theo thứ tự cũ nhất -> mới nhất */}
                      {sortedMessages.map((message) => (
                        <ChatMessage
                          key={message.id}
                          message={message}
                          isOwn={!isAdminMessage(message)}
                        />
                      ))}
                      {/* Loader message khi upload file */}
                      {pendingMessage && (
                        <ChatMessage
                          message={pendingMessage}
                          isOwn={true}
                          isLoading={true}
                        />
                      )}
                      {/* Scroll anchor ở cuối */}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Input */}
                <ChatInput
                  onSendMessage={handleSendMessage}
                  onSendFile={handleSendFile}
                  onTyping={handleTyping}
                  disabled={
                    sendMessage.isPending || sendMessageWithAttachment.isPending
                  }
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatBox;
