import api from "./api";

const chatAPI = {
  // Create guest chat room
  createGuestChatRoom: async (guestName, guestPhone) => {
    const response = await api.post("/chat/rooms", {
      guestName,
      guestPhone,
    });
    return response.data;
  },

  // Create customer chat room
  createCustomerChatRoom: async () => {
    const response = await api.post("/chat/rooms/customer");
    return response.data;
  },

  // Get chat room by code
  getChatRoom: async (roomCode) => {
    const response = await api.get(`/chat/rooms/${roomCode}`);
    return response.data;
  },

  // Get chat messages
  getChatMessages: async (roomCode, page = 0, size = 50) => {
    const response = await api.get(`/chat/rooms/${roomCode}/messages`, {
      params: { page, size },
    });
    return response.data;
  },

  // Send text message
  sendMessage: async (roomCode, content) => {
    const response = await api.post(`/chat/rooms/${roomCode}/messages`, {
      content,
    });
    return response.data;
  },

  // Send message with attachment
  sendMessageWithAttachment: async (roomCode, file, content = "") => {
    const formData = new FormData();
    formData.append("file", file);
    if (content) {
      formData.append("content", content);
    }

    const response = await api.post(
      `/chat/rooms/${roomCode}/messages/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Mark messages as read
  markMessagesAsRead: async (roomCode) => {
    const response = await api.post(`/chat/rooms/${roomCode}/read`);
    return response.data;
  },

  // AI Chat
  chatWithAI: async (message) => {
    const response = await api.post("/chat/ai", { message });
    return response.data;
  },

  //Admin - Lấy danh sách phòng chat
  getAdminChatRooms: async (page = 0, size = 20) => {
    const response = await api.get("/chat/admin/rooms", {
      params: { page, size },
    });
    return response.data;
  },

  //Admin - Lấy tin nhắn của một phòng (sử dụng lại getChatMessages)
  getAdminChatMessages: async (roomCode, page = 0, size = 50) => {
    const response = await api.get(`/chat/rooms/${roomCode}/messages`, {
      params: { page, size },
    });
    return response.data;
  },

  // Lấy mã phòng chat theo userId
  getRoomCodeByUserId: async (userId) => {
    const response = await api.get(`/chat/rooms/${userId}/room-code`);
    return response.data;
  },
};

export default chatAPI;
