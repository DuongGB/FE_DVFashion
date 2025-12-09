import React, { useState, useRef, useEffect } from "react";
import { IconX, IconRobot, IconSend2, IconMessage2 } from "@tabler/icons-react";
import { useChat } from "../../../hooks/useChat";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { encodeId } from "../../../utils/encodeId";
import { useAuth } from "../../../hooks/useAuth";

export default function AIChatBox({ isOpen, onClose }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { chatWithAI } = useChat();
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // Đọc lịch sử chat từ localStorage khi mở box
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("aiChatMessages");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "welcome",
        role: "assistant",
        text:
          t("customer_support.ai_welcome") ||
          "Xin chào! Bạn muốn tìm sản phẩm hoặc đặt câu hỏi gì?",
      },
    ];
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  // Lưu lịch sử chat vào localStorage mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem("aiChatMessages", JSON.stringify(messages));
  }, [messages]);

  // Xóa lịch sử chat AI khi login/logout
  useEffect(() => {
    localStorage.removeItem("aiChatMessages");
  }, [isAuthenticated, user]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Khi đóng box, không reset state, chỉ ẩn UI
  if (!isOpen) return null;

  const send = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    const userMsg = { id: Date.now() + "-u", role: "user", text: trimmed };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await chatWithAI.mutateAsync(trimmed);
      const intent = res.data?.intent;
      const reply =
        res.data?.reply ||
        t("customer_support.ai_no_reply") ||
        "Không có phản hồi.";
      const products = res.data?.products || [];
      setMessages((m) => [
        ...m,
        {
          id: Date.now() + "-a",
          role: "assistant",
          text: reply,
          intent,
          products,
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: Date.now() + "-e",
          role: "assistant",
          text:
            t("customer_support.ai_error") ||
            "Xin lỗi, hiện AI không phản hồi. Vui lòng thử lại.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // Không gọi onClose khi click sản phẩm, chỉ chuyển trang
  const openProduct = (id) => {
    navigate(`/product/${encodeId ? encodeId(id) : id}`);
    onclose();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col">
      <div className=" rounded-lg shadow-2xl w-90 h-[500px] flex flex-col overflow-hidden 0">
        {/* Header */}
        <div className="bg-purple-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <IconRobot size={26} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">
                {t("customer_support.ai_assistant") || "AI Assistant"}
              </h3>
              <p className="text-xs opacity-80">
                {t("customer_support.ai_subtitle") ||
                  "Tư vấn nhanh theo yêu cầu của bạn"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-purple-500 rounded p-1 transition cursor-pointer"
            aria-label={t("common.close")}
          >
            <IconX size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`mb-4 flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-lg ${
                  m.role === "user"
                    ? "bg-blue-500/90 text-white backdrop-blur-xl"
                    : "bg-white/60 text-gray-800 backdrop-blur-xl border border-white/40"
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>
                {Array.isArray(m.products) && m.products.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {m.products.slice(0, 6).map((p) => (
                      <button
                        key={p.product_id}
                        onClick={() => openProduct(p.product_id)}
                        className="w-full text-left group border border-blue-200 rounded-lg p-2 bg-blue-50 hover:bg-blue-100 transition"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-blue-700 group-hover:underline">
                            {p.name}
                          </span>
                          <span className="text-xs text-gray-600">
                            {Math.round(p.price).toLocaleString("vi-VN")} VND
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-500 mt-1">
                          {p.color} • {p.size}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="mb-4 flex justify-start">
              <div className="px-4 py-2 rounded-2xl bg-white/60 shadow flex items-center gap-2">
                <IconMessage2 size={18} className="text-blue-500" />
                <span className="text-xs text-gray-500">
                  {t("common.loading") || "Đang xử lý"}...
                </span>
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/30 p-3 bg-white/80 backdrop-blur-xl">
          <div className="flex items-end gap-2">
            <input
              type="text"
              value={input}
              disabled={loading}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={
                t("customer_support.ai_placeholder") ||
                "Ví dụ: tìm áo sơ mi nam trắng dưới 500k"
              }
              className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 transition-all text-sm bg-white/90 backdrop-blur-xl"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="p-2 rounded-full bg-purple-600 shadow border border-purple-700 
                text-white hover:bg-purple-700 
                disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              aria-label={t("customer_support.send") || "Send"}
              style={{ minWidth: 40, minHeight: 40 }}
            >
              {loading ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <IconSend2 size={22} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
