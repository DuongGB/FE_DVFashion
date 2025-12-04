import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import chatAPI from "../services/chatAPI";
import { toast } from "react-toastify";
import { useRef, useState } from "react";
import websocketService from "../services/websocketService";

export const useChat = () => {
  const queryClient = useQueryClient();
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const connectionPromiseRef = useRef(null);

  // Create guest chat room
  const createGuestChatRoom = useMutation({
    mutationFn: ({ name, phone }) => chatAPI.createGuestChatRoom(name, phone),
    onSuccess: (data) => {
      // console.log("Guest chat room created:", data);
      // Save room code to localStorage
      localStorage.setItem("chatRoomCode", data.data.roomCode);
      // Invalidate queries
      queryClient.invalidateQueries(["chatRoom", data.data.roomCode]);
    },
    onError: (error) => {
      console.error("Error creating guest chat room:", error);
    },
  });

  // Create customer chat room
  const createCustomerChatRoom = useMutation({
    mutationFn: () => chatAPI.createCustomerChatRoom(),
    onSuccess: (data) => {
      localStorage.setItem("chatRoomCode", data.data.roomCode);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to create chat room"
      );
    },
  });

  // Get chat room
  const useChatRoom = (roomCode) => {
    return useQuery({
      queryKey: ["chatRoom", roomCode],
      queryFn: () => chatAPI.getChatRoom(roomCode),
      enabled: !!roomCode,
    });
  };

  // Get chat messages
  const useChatMessages = (roomCode, page = 0, size = 50) => {
    return useQuery({
      queryKey: ["chatMessages", roomCode, page, size],
      queryFn: () => chatAPI.getChatMessages(roomCode, page, size),
      enabled: !!roomCode,
      refetchInterval: isWebSocketConnected ? false : 3000, // Only poll if WebSocket is not connected
      // onSuccess: (data) => {
      //   console.log(" Chat messages fetched successfully:", data);
      // },
    });
  };

  // Send message
  const sendMessage = useMutation({
    mutationFn: ({ roomCode, content }) => {
      if (isWebSocketConnected) {
        websocketService.send(`/app/chat/${roomCode}`, { content });
        return Promise.resolve({ data: { content } });
      }
      return chatAPI.sendMessage(roomCode, content);
    },
    onSuccess: (_data, variables) => {
      if (!isWebSocketConnected) {
        queryClient.invalidateQueries(["chatMessages", variables.roomCode]);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to send message");
    },
  });

  // Send message with attachment
  const sendMessageWithAttachment = useMutation({
    mutationFn: ({ roomCode, file, content }) =>
      chatAPI.sendMessageWithAttachment(roomCode, file, content),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(["chatMessages", variables.roomCode]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to send file");
    },
  });

  // Mark messages as read
  const markMessagesAsRead = useMutation({
    mutationFn: (roomCode) => chatAPI.markMessagesAsRead(roomCode),
    onSuccess: (data, roomCode) => {
      queryClient.invalidateQueries(["chatRoom", roomCode]);
    },
  });

  // AI Chat
  const chatWithAI = useMutation({
    mutationFn: (message) => chatAPI.chatWithAI(message),
    onError: (error) => {
      toast.error(error.response?.data?.message || "AI service unavailable");
    },
  });

  // WebSocket connection management
  const connectWebSocket = (roomCode, onMessageReceived, onTypingIndicator) => {
    if (!roomCode) {
      console.warn("❌ Cannot connect WebSocket: No room code provided");
      return;
    }

    if (connectionPromiseRef.current && websocketService.isConnected()) {
      // console.log("✅ WebSocket already connected for room:", roomCode);
      return connectionPromiseRef.current;
    }

    // console.log("🔌 Initiating WebSocket connection for room:", roomCode);

    connectionPromiseRef.current = new Promise((resolve, reject) => {
      websocketService.connect(
        () => {
          // console.log("✅ WebSocket Connected Successfully");
          // console.log("📍 Room Code:", roomCode);
          // console.log("🌐 WebSocket State:", {
          //   isConnected: websocketService.isConnected(),
          //   timestamp: new Date().toISOString(),
          // });
          setIsWebSocketConnected(true);

          // Subscribe to chat messages
          // console.log("📡 Subscribing to /topic/chat/" + roomCode);
          const messageSubscription = websocketService.subscribe(
            `/topic/chat/${roomCode}`,
            (message) => {
              // Invalidate queries để trigger re-fetch
              queryClient.invalidateQueries(["chatMessages", roomCode]);

              // Invalidate admin chat rooms để cập nhật danh sách
              queryClient.invalidateQueries(["adminChatRooms"]);

              // Callback
              if (onMessageReceived) onMessageReceived(message);
            }
          );

          if (messageSubscription) {
            console.log("✅ Successfully subscribed to chat messages");
          }

          // Subscribe to typing indicators
          // console.log("📡 Subscribing to /topic/chat/" + roomCode + "/typing");
          const typingSubscription = websocketService.subscribe(
            `/topic/chat/${roomCode}/typing`,
            (indicator) => {
              // console.log("⌨️ Typing indicator received:", indicator);
              if (onTypingIndicator) onTypingIndicator(indicator);
            }
          );

          if (typingSubscription) {
            // console.log("✅ Successfully subscribed to typing indicators");
          }

          // console.log(
          //   "🎉 WebSocket connection fully established and subscribed"
          // );
          resolve();
        },
        (error) => {
          console.error("❌ WebSocket connection error:", error);
          setIsWebSocketConnected(false);
          connectionPromiseRef.current = null;
          reject(error);
        }
      );
    });

    return connectionPromiseRef.current;
  };

  const disconnectWebSocket = (roomCode) => {
    if (roomCode) {
      websocketService.unsubscribe(`/topic/chat/${roomCode}`);
      websocketService.unsubscribe(`/topic/chat/${roomCode}/typing`);
    }
    websocketService.disconnect();
    setIsWebSocketConnected(false);
  };

  const sendTypingIndicator = (roomCode, isTyping, userName) => {
    websocketService.sendTypingIndicator(roomCode, isTyping, userName);
  };

  return {
    createGuestChatRoom,
    createCustomerChatRoom,
    useChatRoom,
    useChatMessages,
    sendMessage,
    sendMessageWithAttachment,
    markMessagesAsRead,
    chatWithAI,
    connectWebSocket,
    disconnectWebSocket,
    sendTypingIndicator,
    isWebSocketConnected,
  };
};
