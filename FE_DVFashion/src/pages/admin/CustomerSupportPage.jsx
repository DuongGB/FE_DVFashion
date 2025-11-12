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

const CustomerSupportPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [selectedRoomCode, setSelectedRoomCode] = useState(null);
  const [roomsPage, setRoomsPage] = useState(0);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const {
    useChatRoom,
    useChatMessages,
    sendMessage,
    sendMessageWithAttachment,
    markMessagesAsRead,
    connectWebSocket,
    disconnectWebSocket,
    // sendTypingIndicator,
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
    refetchInterval: 10000, // Tăng lên 10 giây
    refetchOnWindowFocus: false, // ✅ Không refetch khi focus window
    staleTime: 5000, // Cache 5 giây
  });

  //  Xử lý cấu trúc dữ liệu và sắp xếp theo tin nhắn mới nhất
  const chatRooms = React.useMemo(() => {
    if (!chatRoomsData) return [];

    let rooms = [];

    // Check if data is wrapped in ApiResponse structure
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
      console.log("Chat Rooms Data:", chatRoomsData);
      console.log("Sorted Chat Rooms:", chatRooms);
    }
    if (roomsError) {
      console.error("Error loading chat rooms:", roomsError);
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
      await sendMessageWithAttachment.mutateAsync({
        roomCode: selectedRoomCode,
        file,
        content,
      });
    }
  };

  const getRelativeTime = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: i18n.language === "vi" ? vi : enUS,
      });
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
    <div className="h-screen bg-gray-100 flex">
      {/* Sidebar - Danh sách phòng chat */}
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            {t("customer_support.customer_support")}
          </h2>
          <p className="text-sm text-gray-500">
            {chatRooms.length} {t("customer_support.conversations")}
          </p>
        </div>

        {/* Danh sách phòng chat với custom scrollbar */}
        <div className="flex-1 overflow-y-auto chat-messages-container">
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

              return (
                <div
                  key={room.roomCode}
                  onClick={() => setSelectedRoomCode(room.roomCode)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                    selectedRoomCode === room.roomCode
                      ? "bg-blue-50 border-l-4 border-blue-600"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        <i className="fas fa-user text-white"></i>
                      </div>
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-800 truncate">
                          {room.customerName ||
                            room.guestName ||
                            t("customer_support.unknown_user")}
                        </h3>
                        {room.type && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            {room.type === "CUSTOMER" ? "👤" : "👋"}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-sm truncate mb-1 ${
                          unreadCount > 0
                            ? "text-gray-800 font-medium"
                            : "text-gray-500"
                        }`}
                      >
                        {getLastMessageText(room)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {getLastMessageTime(room)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {chatRooms.length > 0 && (
          <div className="p-4 border-t flex items-center justify-between">
            <button
              onClick={() => setRoomsPage((prev) => Math.max(0, prev - 1))}
              disabled={roomsPage === 0}
              className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <span className="text-sm text-gray-600">
              {t("customer_support.page")} {roomsPage + 1}
            </span>
            <button
              onClick={() => setRoomsPage((prev) => prev + 1)}
              disabled={chatRooms.length < 20}
              className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {!selectedRoomCode ? (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="text-center text-gray-500">
              <i className="fas fa-comments text-6xl mb-4 text-blue-300"></i>
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
            <div className="bg-white shadow-md p-4 flex items-center justify-between border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-white"></i>
                </div>
                <div>
                  <h1 className="font-semibold text-lg">
                    {chatRoom?.data?.customerName ||
                      chatRoom?.data?.guestName ||
                      t("customer_support.customer")}
                  </h1>
                  <p className="text-xs text-gray-500">
                    <i className="fas fa-hashtag mr-1"></i>
                    {selectedRoomCode}
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
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col chat-messages-container">
              {sortedMessages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <i className="fas fa-comments text-4xl mb-2"></i>
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

                  {/* Scroll anchor ở cuối */}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="border-t bg-white">
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
