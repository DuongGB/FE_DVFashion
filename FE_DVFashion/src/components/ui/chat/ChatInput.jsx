import React, { useState, useRef } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const ChatInput = ({ onSendMessage, onSendFile, onTyping, disabled }) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error(t("customer_support.file_size_error"));
      return;
    }

    const allowedTypes = ["image/", "video/", "application/pdf"];
    if (!allowedTypes.some((type) => file.type.startsWith(type))) {
      toast.error(t("customer_support.file_type_error"));
      return;
    }

    setIsUploading(true);
    try {
      await onSendFile(file, message.trim());
      setMessage("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    if (onTyping) {
      onTyping();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-3 bg-white">
      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="p-2 text-gray-500 hover:text-blue-600 disabled:opacity-50 transition-colors"
          title={t("customer_support.attach_file")}
        >
          <i className="fas fa-paperclip text-lg"></i>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,video/*,application/pdf"
        />

        <input
          type="text"
          value={message}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder={t("customer_support.type_message")}
          disabled={disabled || isUploading}
          className="flex-1 px-3 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-all text-sm"
        />

        <button
          type="submit"
          disabled={!message.trim() || disabled || isUploading}
          className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          title={t("customer_support.send")}
        >
          {isUploading ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <i className="fas fa-paper-plane"></i>
          )}
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
