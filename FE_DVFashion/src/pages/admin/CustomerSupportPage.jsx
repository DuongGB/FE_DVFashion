import React, { useState, useEffect, useRef } from "react";
import { useChat } from "../../hooks/useChat";
import ChatMessage from "../../components/ui/chat/ChatMessage";
import ChatInput from "../../components/ui/chat/ChatInput";
import { useAuth } from "../../hooks/useAuth";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import chatAPI from "../../services/chatAPI";
import { formatDistanceToNow } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { isAdminMessage } from "../../utils/isAdminMessage";
import websocketService from "../../services/websocketService";
import {
  IconUser,
  IconUserCircle,
  IconUserQuestion,
  IconMessage,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";

const CustomerSupportPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [selectedRoomCode, setSelectedRoomCode] = useState(null);
  const [roomsPage, setRoomsPage] = useState(0);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();
  const [pendingMessage, setPendingMessage] = useState(null);

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
    refetchOnWindowFocus: false, // Không refetch khi focus window
    staleTime: 5000, // Cache 5 giây
  });

  //  Xử lý cấu trúc dữ liệu và sắp xếp theo tin nhắn mới nhất
  const chatRooms = React.useMemo(() => {
    if (!chatRoomsData) return [];

    let rooms = [];

    // Kiểm tra nếu data nằm trong thuộc tính 'data'
    if (chatRoomsData.data) {
      rooms = Array.isArray(chatRoomsData.data) ? chatRoomsData.data : [];
    } else {
      rooms = Array.isArray(chatRoomsData) ? chatRoomsData : [];
    }

    // Sắp xếp phòng chat theo lastMessageAt (mới nhất lên đầu)
    return rooms.sort((a, b) => {
      const timeA = new Date(a.lastMessageAt || 0).getTime();
      const timeB = new Date(b.lastMessageAt || 0).getTime();
      return timeB - timeA; // Mới nhất lên đầu
    });
  }, [chatRoomsData]);

  // Debug log
  useEffect(() => {
    if (chatRoomsData) {
      // console.log("Chat Rooms Data:", chatRoomsData);
      // console.log("Sorted Chat Rooms:", chatRooms);
    }
    if (roomsError) {
      // console.error("Error loading chat rooms:", roomsError);
    }
  }, [chatRoomsData, roomsError, chatRooms]);

  // Connect WebSocket when room is selected
  useEffect(() => {
    if (selectedRoomCode) {
      const timer = setTimeout(() => {
        connectWebSocket(selectedRoomCode, (message) => {
          console.log("New message received:", message);

          // Invalidate chat rooms để cập nhật danh sách
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

  //  Sắp xếp tin nhắn theo thứ tự cũ nhất -> mới nhất (giống ChatBox)
  const sortedMessages = React.useMemo(() => {
    return [...messages].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  }, [messages]);

  //  Scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [sortedMessages]);

  // Mark messages as read
  useEffect(() => {
    if (selectedRoomCode && messages.length > 0) {
      markMessagesAsRead.mutate(selectedRoomCode);
    }
  }, [selectedRoomCode, messages.length]);

  const handleSendMessage = async (content) => {
    if (!selectedRoomCode || !content?.trim()) return;
    try {
      // Luôn dùng REST API để gửi tin nhắn admin (cookie đã có accessToken)
      await chatAPI.sendMessage(selectedRoomCode, content);

      // Làm mới danh sách tin nhắn và rooms
      await queryClient.invalidateQueries(["chatMessages", selectedRoomCode]);
      await queryClient.invalidateQueries(["adminChatRooms"]);

      // Cuộn xuống cuối sau khi gửi
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
      // Hỗ trợ cả "vi", "vi-VN", "en", "en-US"
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

  return (
    <div className="w-full h-full min-h-[600px] bg-gradient-to-br from-blue-100/60 via-white/60 to-gray-200/60 flex rounded-2xl shadow-lg overflow-hidden">
      {/* Sidebar - Danh sách phòng chat */}
      <div className="w-80 min-w-[320px] max-w-[340px] h-full backdrop-blur-xl bg-white/70 border-r border-white/30 flex flex-col shadow-xl rounded-r-2xl">
        <div className="p-5 border-b border-white/30">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
            <IconMessage size={26} className="text-gay-500" />
            {t("customer_support.customer_support")}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {t("customer_support.conversations_count", {
              count: chatRooms.length,
            })}
          </p>
        </div>

        {/* Danh sách phòng chat với custom scrollbar */}
        <div className="flex-1 overflow-y-auto chat-messages-container scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent px-1 py-2">
          {isLoadingRooms ? (
            <div className="flex items-center justify-center h-full">
              <i className="fas fa-spinner fa-spin text-2xl text-blue-600"></i>
            </div>
          ) : roomsError ? (
            <div className="text-center text-red-500 mt-8 px-4">
              <i className="fas fa-exclamation-triangle text-4xl mb-2"></i>
              <p>{t("customer_support.error_loading_rooms")}</p>
              <p className="text-sm mt-2">{roomsError.message}</p>
            </div>
          ) : chatRooms.length === 0 ? (
            <div className="text-center text-gray-500 mt-8 px-4">
              <i className="fas fa-inbox text-4xl mb-2"></i>
              <p>{t("customer_support.no_rooms")}</p>
            </div>
          ) : (
            chatRooms.map((room) => {
              const unreadCount = getUnreadCount(room);
              const isSelected = selectedRoomCode === room.roomCode;
              return (
                <div
                  key={room.roomCode}
                  onClick={() => setSelectedRoomCode(room.roomCode)}
                  className={`flex items-center gap-3 p-3 mb-1 rounded-xl cursor-pointer transition-all border border-transparent hover:bg-blue-50/70 ${
                    isSelected
                      ? "bg-blue-100/80 border-blue-400 shadow"
                      : "bg-white/70"
                  }`}
                  style={{ minHeight: 72 }}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shadow bg-gradient-to-br from-blue-300 to-blue-500">
                      {room.type === "CUSTOMER" ? (
                        <IconUserCircle size={32} className="text-white" />
                      ) : (
                        <IconUserQuestion size={32} className="text-white" />
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow font-bold">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="font-semibold text-gray-800 truncate text-base">
                        {room.customerName ||
                          room.guestName ||
                          t("customer_support.unknown_user")}
                      </h3>
                      {room.type && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 ml-2">
                          {room.type === "CUSTOMER"
                            ? t("customer_support.customer")
                            : t("customer_support.guest")}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-sm truncate ${
                        unreadCount > 0
                          ? "text-gray-800 font-medium"
                          : "text-gray-500"
                      }`}
                    >
                      {getLastMessageText(room)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
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
          <div className="p-4 border-t border-white/30 flex items-center justify-between bg-white/50">
            <button
              onClick={() => setRoomsPage((prev) => Math.max(0, prev - 1))}
              disabled={roomsPage === 0}
              className="p-2 rounded-full bg-gray-200/80 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <IconChevronLeft size={20} />
            </button>
            <span className="text-sm text-gray-600 font-medium">
              {t("customer_support.page")} {roomsPage + 1}
            </span>
            <button
              onClick={() => setRoomsPage((prev) => prev + 1)}
              disabled={chatRooms.length < 20}
              className="p-2 rounded-full bg-gray-200/80 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <IconChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {!selectedRoomCode ? (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50/60 to-gray-100/60">
            <div className="text-center text-gray-500">
              <IconMessage size={64} className="mb-4 text-blue-300 mx-auto" />
              <p className="text-xl font-medium">
                {t("customer_support.select_room_to_chat")}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {t("customer_support.select_room_description")}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="backdrop-blur-xl bg-white/70 shadow-md p-5 flex items-center justify-between border-b border-white/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center shadow bg-gradient-to-br from-blue-200 to-blue-500">
                  {chatRoom?.data?.type === "CUSTOMER" ? (
                    <IconUserCircle size={32} className="text-white" />
                  ) : (
                    <IconUserQuestion size={32} className="text-white" />
                  )}
                </div>
                <div>
                  <h1 className="font-semibold text-lg text-gray-800">
                    {chatRoom?.data?.customerName ||
                      chatRoom?.data?.guestName ||
                      t("customer_support.customer")}
                  </h1>
                  <p className="text-xs text-gray-500">
                    <span className="font-mono text-gray-700">
                      #{selectedRoomCode}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isWebSocketConnected
                      ? "bg-green-500 animate-pulse"
                      : "bg-gray-400"
                  }`}
                ></span>
                <span className="text-sm text-gray-600">
                  {isWebSocketConnected
                    ? t("customer_support.online")
                    : t("customer_support.offline")}
                </span>
              </div>
            </div>

            {/*Messages Container - flex-col với custom scrollbar */}
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-white/80 to-blue-50/60 flex flex-col chat-messages-container scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
              {sortedMessages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <IconMessage
                    size={40}
                    className="mb-2 text-blue-300 mx-auto"
                  />
                  <p>{t("customer_support.no_messages")}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {t("customer_support.start_conversation")}
                  </p>
                </div>
              ) : (
                <>
                  {/* Render messages theo thứ tự cũ nhất -> mới nhất */}
                  {sortedMessages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isOwn={
                        isAdminMessage(message) || message.senderId === user?.id
                      }
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
