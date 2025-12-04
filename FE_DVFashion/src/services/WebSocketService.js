import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
  }

  connect(onConnected, onError) {
    if (this.connected) {
      onConnected?.();
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      try {
        const socketUrl = `${import.meta.env.VITE_API_BASE_URL}/ws-chat`;

        // Lấy token từ cookie hoặc localStorage
        const token = this.getAuthToken();

        // console.log("🔌 Connecting to WebSocket:", socketUrl);
        // console.log("🔑 Using auth token:", token ? "✓ Present" : "✗ Missing");

        const socket = new SockJS(socketUrl, null, {
          timeout: 10000,
          transports: ["websocket", "xhr-streaming", "xhr-polling"],
          withCredentials: true,
        });

        this.client = new Client({
          webSocketFactory: () => socket,

          // debug: (str) => {
          //   if (import.meta.env.DEV) console.log("📡 STOMP:", str);
          // },

          reconnectDelay: 0, // Tắt auto reconnect

          heartbeatIncoming: 10000,
          heartbeatOutgoing: 10000,

          connectHeaders: {},

          onConnect: (frame) => {
            // Thêm frame vào đây
            this.connected = true;
            this.reconnectAttempts = 0;
            // console.log("WebSocket Connected. Server response:", frame);
            onConnected?.();
            resolve();
          },

          onStompError: (frame) => {
            this.connected = false;
            this.handleReconnect(onConnected, onError);
            onError?.(frame);
            reject(frame);
          },

          onWebSocketError: (err) => {
            this.connected = false;
            this.handleReconnect(onConnected, onError); // chỉ retry nếu thất bại
            onError?.(err);
            reject(err);
          },
          onDisconnect: () => {
            console.warn("⚠️ WebSocket Disconnected");
            this.connected = false;
            // Không gọi handleReconnect khi disconnect chủ động
          },
        });

        this.client.activate();
      } catch (e) {
        this.connected = false;
        onError?.(e);
        reject(e);
      }
    });
  }

  // Hàm xử lý reconnect với giới hạn số lần thử
  handleReconnect(onConnected, onError) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(
        `Max reconnect attempts (${this.maxReconnectAttempts}) reached. Giving up.`
      );
      return;
    }

    this.reconnectAttempts++;
    // console.log(
    //   `Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
    // );

    setTimeout(() => {
      this.connect(onConnected, onError).catch((err) => {
        console.error("Reconnect failed:", err);
      });
    }, this.reconnectDelay);
  }

  //function để lấy token
  getAuthToken() {
    // Ưu tiên cookie 'token' hoặc localStorage nếu bạn lưu
    const cookieToken = document.cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("token="));
    if (cookieToken) {
      return cookieToken.split("=")[1];
    }
    const lsToken = localStorage.getItem("token");
    return lsToken || null;
  }

  disconnect() {
    if (this.client) {
      try {
        // console.log("Disconnecting WebSocket...");
        this.subscriptions.clear();
        this.client.deactivate();
        this.connected = false;
        this.reconnectAttempts = 0;
      } catch (error) {
        console.error("Error disconnecting WebSocket:", error);
      }
    }
  }

  subscribe(destination, callback) {
    if (!this.connected || !this.client) {
      console.error("Cannot subscribe: WebSocket not connected");
      return null;
    }

    try {
      // console.log("Subscribing to:", destination);

      const subscription = this.client.subscribe(destination, (message) => {
        try {
          const parsedMessage = JSON.parse(message.body);
          callback(parsedMessage);
        } catch (error) {
          console.error("Error parsing message:", error);
          callback(message.body);
        }
      });

      this.subscriptions.set(destination, subscription);
      return subscription;
    } catch (error) {
      console.error("Error subscribing to destination:", destination, error);
      return null;
    }
  }

  unsubscribe(destination) {
    try {
      const subscription = this.subscriptions.get(destination);
      if (subscription) {
        // console.log("Unsubscribing from:", destination);
        subscription.unsubscribe();
        this.subscriptions.delete(destination);
      }
    } catch (error) {
      console.error(
        "Error unsubscribing from destination:",
        destination,
        error
      );
    }
  }

  send(destination, body) {
    if (!this.connected || !this.client) {
      console.error("Cannot send message: WebSocket not connected");
      return false;
    }

    try {
      // console.log("Sending message to:", destination);
      this.client.publish({
        destination,
        body: JSON.stringify(body),
      });
      return true;
    } catch (error) {
      console.error("Error sending message:", error);
      return false;
    }
  }

  sendTypingIndicator(roomCode, isTyping, userName) {
    if (!this.connected) {
      console.warn("Cannot send typing indicator: WebSocket not connected");
      return false;
    }

    return this.send(`/app/chat/${roomCode}/typing`, {
      isTyping,
      userName,
      timestamp: new Date().toISOString(),
    });
  }

  isConnected() {
    return this.connected;
  }
}

export default new WebSocketService();
