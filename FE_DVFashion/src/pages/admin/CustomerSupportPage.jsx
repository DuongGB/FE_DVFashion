import {
  IconChevronLeft,
  IconChevronRight,
  IconMenu2,
  IconMessage,
  IconUserCircle,
  IconUserQuestion,
} from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { enUS, vi } from "date-fns/locale";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ChatInput from "../../components/ui/chat/ChatInput";
import ChatMessage from "../../components/ui/chat/ChatMessage";
import { useAuth } from "../../hooks/useAuth";
import { useChat } from "../../hooks/useChat";
import chatAPI from "../../services/chatAPI";
import { isAdminMessage } from "../../utils/isAdminMessage";

const CustomerSupportPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [selectedRoomCode, setSelectedRoomCode] = useState(null);
  const [roomsPage, setRoomsPage] = useState(0);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();
  const [pendingMessage, setPendingMessage] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const {
    useChatRoom,
    useChatMessages,
    sendMessage,
    sendMessageWithAttachment,
    markMessagesAsRead,
    connectWebSocket,
    disconnectWebSocket,
    isWebSocketConnected,
  } = useChat();

  // Lấy danh sách phòng chat (Admin) với pagination
  const {
    data: chatRoomsData,
    isLoading: isLoadingRooms,
    error: roomsError,
  } = useQuery({
    queryKey: ["adminChatRooms", roomsPage],
    queryFn: () => chatAPI.getAdminChatRooms(roomsPage, 20),
    refetchInterval: 10000,
    refetchOnWindowFocus: false,
    staleTime: 5000,
  });

  const chatRooms = React.useMemo(() => {
    if (!chatRoomsData) return [];

    let rooms = [];

    if (chatRoomsData.data) {
      rooms = Array.isArray(chatRoomsData.data) ? chatRoomsData.data : [];
    } else {
      rooms = Array.isArray(chatRoomsData) ? chatRoomsData : [];
    }

    return rooms.sort((a, b) => {
      const timeA = new Date(a.lastMessageAt || 0).getTime();
      const timeB = new Date(b.lastMessageAt || 0).getTime();
      return timeB - timeA;
    });
  }, [chatRoomsData]);

  useEffect(() => {
    if (chatRoomsData) {
      // console.log("Chat Rooms Data:", chatRoomsData);
      // console.log("Sorted Chat Rooms:", chatRooms);
    }
    if (roomsError) {
      // console.error("Error loading chat rooms:", roomsError);
    }
  }, [chatRoomsData, roomsError, chatRooms]);

  useEffect(() => {
    if (selectedRoomCode) {
      const timer = setTimeout(() => {
        connectWebSocket(selectedRoomCode, (message) => {
          console.log("New message received:", message);
          queryClient.invalidateQueries(["adminChatRooms"]);
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        });
      }, 500);

      return () => {
        clearTimeout(timer);
        disconnectWebSocket(selectedRoomCode);
      };
    }
  }, [selectedRoomCode]);

  const { data: chatRoom } = useChatRoom(selectedRoomCode);
  const { data: messagesData } = useChatMessages(selectedRoomCode);

  const messages = messagesData?.data || [];

  const sortedMessages = React.useMemo(() => {
    return [...messages].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  }, [messages]);

  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [sortedMessages]);

  useEffect(() => {
    if (selectedRoomCode && messages.length > 0) {
      markMessagesAsRead.mutate(selectedRoomCode);
    }
  }, [selectedRoomCode, messages.length]);

  const handleSendMessage = async (content) => {
    if (!selectedRoomCode || !content?.trim()) return;
    try {
      await chatAPI.sendMessage(selectedRoomCode, content);
      await queryClient.invalidateQueries(["chatMessages", selectedRoomCode]);
      await queryClient.invalidateQueries(["adminChatRooms"]);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleSendFile = async (file, content) => {
    if (selectedRoomCode) {
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
        senderName: user?.fullName || user?.name || "Admin",
        createdAt: new Date().toISOString(),
        status: "SENDING",
      });

      try {
        await sendMessageWithAttachment.mutateAsync({
          roomCode: selectedRoomCode,
          file,
          content,
        });
      } finally {
        setPendingMessage(null);
      }
    }
  };

  const getRelativeTime = (dateString) => {
    try {
      const lang = i18n.language?.toLowerCase();
      const locale = lang.startsWith("vi") ? vi : enUS;
      const distance = formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale,
      });
      return t("customer_support.relative_time", { time: distance });
    } catch (error) {
      return "";
    }
  };

  const getLastMessageText = (room) => {
    if (!room.lastMessage) {
      return t("customer_support.no_messages");
    }

    if (typeof room.lastMessage === "object") {
      switch (room.lastMessage.messageType) {
        case "TEXT":
          return room.lastMessage.content || "";
        case "IMAGE":
          return "📷 " + t("customer_support.image");
        case "VIDEO":
          return "🎥 " + t("customer_support.video");
        case "FILE":
          return "📎 " + t("customer_support.file");
        case "SYSTEM":
          return room.lastMessage.content || "";
        default:
          return room.lastMessage.content || "";
      }
    }

    return room.lastMessage;
  };

  const getLastMessageTime = (room) => {
    if (!room.lastMessageAt && !room.lastMessage?.createdAt) {
      return "";
    }

    const timeString = room.lastMessageAt || room.lastMessage?.createdAt;
    return getRelativeTime(timeString);
  };

  const getUnreadCount = (room) => {
    return room.unreadAdminCount || 0;
  };

  const handleSelectRoom = (roomCode) => {
    setSelectedRoomCode(roomCode);
    setIsSidebarOpen(false); // Đóng sidebar trên mobile khi chọn room
  };

  return (
    <div className="w-full h-full min-h-[600px] bg-gradient-to-br from-blue-100/60 via-white/60 to-gray-200/60 flex rounded-none sm:rounded-2xl shadow-lg overflow-hidden relative">
      {/* Overlay cho mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Danh sách phòng chat */}
      <div
        className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
        w-80 sm:w-80 lg:min-w-[320px] lg:max-w-[340px]
        h-full backdrop-blur-xl bg-white/70 border-r border-white/30 
        flex flex-col shadow-xl rounded-r-2xl
        transform transition-transform duration-300 ease-in-out
        ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }
      `}
      >
        <div className="p-4 sm:p-5 border-b border-white/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <IconMessage size={26} className="text-gay-500" />
              <span className="hidden sm:inline">
                {t("customer_support.customer_support")}
              </span>
              <span className="sm:hidden">{t("customer_support.support")}</span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {t("customer_support.conversations_count", {
              count: chatRooms.length,
            })}
          </p>
        </div>

        {/* Danh sách phòng chat */}
        <div className="flex-1 overflow-y-auto chat-messages-container scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent px-1 py-2">
          {isLoadingRooms ? (
            <div className="flex items-center justify-center h-full">
              <i className="fas fa-spinner fa-spin text-2xl text-blue-600"></i>
            </div>
          ) : roomsError ? (
            <div className="text-center text-red-500 mt-8 px-4">
              <i className="fas fa-exclamation-triangle text-4xl mb-2"></i>
              <p className="text-sm">
                {t("customer_support.error_loading_rooms")}
              </p>
              <p className="text-xs mt-2">{roomsError.message}</p>
            </div>
          ) : chatRooms.length === 0 ? (
            <div className="text-center text-gray-500 mt-8 px-4">
              <i className="fas fa-inbox text-4xl mb-2"></i>
              <p className="text-sm">{t("customer_support.no_rooms")}</p>
            </div>
          ) : (
            chatRooms.map((room) => {
              const unreadCount = getUnreadCount(room);
              const isSelected = selectedRoomCode === room.roomCode;
              return (
                <div
                  key={room.roomCode}
                  onClick={() => handleSelectRoom(room.roomCode)}
                  className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 mb-1 rounded-xl cursor-pointer transition-all border border-transparent hover:bg-blue-50/70 ${
                    isSelected
                      ? "bg-blue-100/80 border-blue-400 shadow"
                      : "bg-white/70"
                  }`}
                  style={{ minHeight: 64 }}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow bg-gradient-to-br from-blue-300 to-blue-500">
                      {room.type === "CUSTOMER" ? (
                        <IconUserCircle
                          size={28}
                          className="text-white sm:w-8 sm:h-8"
                        />
                      ) : (
                        <IconUserQuestion
                          size={28}
                          className="text-white sm:w-8 sm:h-8"
                        />
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center animate-pulse shadow font-bold">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="font-semibold text-gray-800 truncate text-sm sm:text-base">
                        {room.customerName ||
                          room.guestName ||
                          t("customer_support.unknown_user")}
                      </h3>
                      {room.type && (
                        <span className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 ml-2 flex-shrink-0">
                          {room.type === "CUSTOMER"
                            ? t("customer_support.customer")
                            : t("customer_support.guest")}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-xs sm:text-sm truncate ${
                        unreadCount > 0
                          ? "text-gray-800 font-medium"
                          : "text-gray-500"
                      }`}
                    >
                      {getLastMessageText(room)}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
                      {getLastMessageTime(room)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {chatRooms.length > 0 && (
          <div className="p-3 sm:p-4 border-t border-white/30 flex items-center justify-between bg-white/50">
            <button
              onClick={() => setRoomsPage((prev) => Math.max(0, prev - 1))}
              disabled={roomsPage === 0}
              className="p-1.5 sm:p-2 rounded-full bg-gray-200/80 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <IconChevronLeft size={18} className="sm:w-5 sm:h-5" />
            </button>
            <span className="text-xs sm:text-sm text-gray-600 font-medium">
              {t("customer_support.page")} {roomsPage + 1}
            </span>
            <button
              onClick={() => setRoomsPage((prev) => prev + 1)}
              disabled={chatRooms.length < 20}
              className="p-1.5 sm:p-2 rounded-full bg-gray-200/80 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <IconChevronRight size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {!selectedRoomCode ? (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50/60 to-gray-100/60 p-4">
            <div className="text-center text-gray-500">
              <IconMessage
                size={48}
                className="sm:w-16 sm:h-16 mb-4 text-blue-300 mx-auto"
              />
              <p className="text-lg sm:text-xl font-medium">
                {t("customer_support.select_room_to_chat")}
              </p>
              <p className="text-xs sm:text-sm text-gray-400 mt-2">
                {t("customer_support.select_room_description")}
              </p>
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2 mx-auto"
              >
                <IconMenu2 size={20} />
                {t("customer_support.open_conversations")}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="backdrop-blur-xl bg-white/70 shadow-md p-3 sm:p-5 flex items-center justify-between border-b border-white/30">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-full hover:bg-gray-200/80 transition flex-shrink-0"
                >
                  <IconMenu2 size={20} />
                </button>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow bg-gradient-to-br from-blue-200 to-blue-500 flex-shrink-0">
                  {chatRoom?.data?.type === "CUSTOMER" ? (
                    <IconUserCircle
                      size={28}
                      className="text-white sm:w-8 sm:h-8"
                    />
                  ) : (
                    <IconUserQuestion
                      size={28}
                      className="text-white sm:w-8 sm:h-8"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="font-semibold text-base sm:text-lg text-gray-800 truncate">
                    {chatRoom?.data?.customerName ||
                      chatRoom?.data?.guestName ||
                      t("customer_support.customer")}
                  </h1>
                  <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                    <span className="font-mono text-gray-700">
                      #{selectedRoomCode}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isWebSocketConnected
                      ? "bg-green-500 animate-pulse"
                      : "bg-gray-400"
                  }`}
                ></span>
                <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">
                  {isWebSocketConnected
                    ? t("customer_support.online")
                    : t("customer_support.offline")}
                </span>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-gradient-to-br from-white/80 to-blue-50/60 flex flex-col chat-messages-container scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
              {sortedMessages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8 px-4">
                  <IconMessage
                    size={32}
                    className="sm:w-10 sm:h-10 mb-2 text-blue-300 mx-auto"
                  />
                  <p className="text-sm">{t("customer_support.no_messages")}</p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    {t("customer_support.start_conversation")}
                  </p>
                </div>
              ) : (
                <>
                  {sortedMessages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isOwn={
                        isAdminMessage(message) || message.senderId === user?.id
                      }
                    />
                  ))}
                  {pendingMessage && (
                    <ChatMessage
                      message={pendingMessage}
                      isOwn={true}
                      isLoading={true}
                    />
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-white/30 backdrop-blur-xl bg-white/70">
              <ChatInput
                onSendMessage={handleSendMessage}
                onSendFile={handleSendFile}
                disabled={
                  sendMessage.isPending || sendMessageWithAttachment.isPending
                }
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerSupportPage;
